# Contract ABI
The main `Tongo` contract implements the `ITongo` interface and manages all confidential payment operations:

```rust
#[starknet::interface]
pub trait ITongo<TContractState> {
    // Tongo general setup:
    /// Returns the contract address that Tongo is wraping.
    fn ERC20(self: @TContractState) -> ContractAddress;

    /// Returns the rate of conversion between the wrapped ERC20 a tongo:
    ///
    /// ERC20_amount = Tongo_amount*rate
    ///
    /// The amount variable in all operation refers to the amount of Tongos.
    fn get_rate(self: @TContractState) -> u256;

    /// Returns the bit_size set for this Tongo contract.
    fn get_bit_size(self: @TContractState) -> u32;

    /// Returns the contract address of the owner of the Tongo account.
    fn get_owner(self: @TContractState) -> ContractAddress;

    // User operations:
    /// Funds a tongo account. Callable only by the account owner
    ///
    /// Emits FundEvent
    fn fund(ref self: TContractState, fund: Fund);

    /// Withdraw Tongos and send the ERC20 to a starknet address.
    ///
    /// Emits WithdrawEvent
    fn withdraw(ref self: TContractState, withdraw: Withdraw);

    /// Withdraw all the balance of an account and send the ERC20 to a starknet address. This proof
    /// avoids the limitations of the range prove that are present in the regular withdraw.
    ///
    /// Emits RagequitEvent
    fn ragequit(ref self: TContractState, ragequit: Ragequit);

    /// Transfer Tongos from the balanca of te sender to the pending of the receiver
    ///
    /// Emits TransferEvent
    fn transfer(ref self: TContractState, transfer: Transfer);

    /// Moves to the balance the amount stored in the pending. Callable only by the account owner.
    ///
    /// Emits RolloverEvent
    fn rollover(ref self: TContractState, rollover: Rollover);

    // State reading functions
    /// Returns the curretn stored balance of a Tongo account
    fn get_balance(self: @TContractState, y: PubKey) -> CipherBalance;

    /// Returns the current pending balance of a Tongo account
    fn get_pending(self: @TContractState, y: PubKey) -> CipherBalance;

    /// Return, if the Tongo instance allows, the current declared balance of a Tongo account for
    /// the auditor
    fn get_audit(self: @TContractState, y: PubKey) -> Option<CipherBalance>;

    /// Returns the current nonce of a Tongo account
    fn get_nonce(self: @TContractState, y: PubKey) -> u64;

    /// Returns the current state of a Tongo account.
    fn get_state(self: @TContractState, y: PubKey) -> State;

    // Auditor handling
    /// Returns the current auditor public key.
    fn auditor_key(self: @TContractState) -> Option<PubKey>;

    /// Rotates the current auditor public key.
    fn change_auditor_key(ref self: TContractState, new_auditor_key: PubKey);
}
```

## Storage Structure
```rust
#[storage]
struct Storage {
    /// The contract address that is owner of the Tongo instance.
    owner: ContractAddress,
    /// The contract address of the ERC20 that Tongo is wrapping.
    ERC20: ContractAddress,
    /// The conversion  rage between the wrapped ERC20 a tongo:
    ///
    /// ERC20_amount = Tongo_amount*rate
    rate: u256,
    /// The bit size this contract will work with. This limites the values that cant be proven
    /// by a range proof. If is set to 32 that means that range proof will only work for values
    /// between 0 and 2**32-1.
    /// Note: The computational cost of verifying a tranfers operation (the most expensive one)
    /// is about (30 + 10*n) ec_muls and (20 + 8n) ec_adds, where n is the bit_size
    bit_size: u32,
    /// The encrypted balance for the given pubkey.
    balance: Map<PubKey, CipherBalance>,
    /// The encrypted pending balance for the given pubkey. The pending balance is the sum of
    /// incoming transfer. User has to execute a rollover operation to convert this to usable
    /// balance.
    pending: Map<PubKey, CipherBalance>,
    /// The nonce of the given pubkey. Nonce is increased in every user operation.
    nonce: Map<PubKey, u64>,
    /// Hint to fast decrypt the balance of the given pubkey. This encrypts the same amount that
    /// is stored in `balance`. It is neither check nor enforced by the protocol, only the the
    /// user can decrypt it with knowledge of the private key and it is only usefull for
    /// attempting a fast decryption of `balance.
    ae_balance: Map<PubKey, AEBalance>,
    /// The balance of the given pubkey enrypted for the auditor key.
    ///
    /// If the contract was deployed witouth an auditor, the map is empty and all keys return
    /// the Default CipherBalance {L: {x:0, y:0}, R:{x:0,y:0}};
    audit_balance: Map<PubKey, CipherBalance>,
    /// Hint to fast decrypt the audited balance of the given pubkey. This encrypts the same
    /// amount that is stored in `audit_balance`. It is neither check nor enforced by the
    /// protocol, only the auditor can decrypt it with knowledge of the auditor private key and
    /// it is only usefull for attempting a fast decryption of `audit_balance`.
    ae_audit_balance: Map<PubKey, AEBalance>,
    /// The auditor pubkey. If the contract was deployed without auditor this will be an
    /// Option::None without a way to change it.
    auditor_key: Option<PubKey>,
    /// The increasing number that identifies the public key
    key_number: u128,
}
```

## Events

The contract emits events for all operations to enable off-chain monitoring:

```rust
/// Event emited in a Fund operation.
///
/// - to: The Tongo account to fund.
/// - nonce: The nonce of the Tongo account.
/// - amount: The ammount of tongo to fund.
#[derive(Drop, starknet::Event)]
pub struct FundEvent {
    #[key]
    pub to: PubKey,
    #[key]
    pub nonce: u64,
    pub amount: u128,
}

/// Event emited in a Rollover operation.
///
/// - to: The Tongo account to rollover.
/// - nonce: The nonce of the Tongo account.
/// - rolloverred: The cipherbalance of the rolloverred amount.
#[derive(Drop, starknet::Event)]
pub struct RolloverEvent {
    #[key]
    pub to: PubKey,
    #[key]
    pub nonce: u64,
    pub rollovered: CipherBalance,
}


/// Event emited in a Withdraw operation.
///
/// - from: The Tongo account to withdraw from.
/// - nonce: The nonce of the Tongo account.
/// - amount: The ammount of tongo to withdraw.
/// - to: The starknet contract address to send the funds to.
#[derive(Drop, starknet::Event)]
pub struct WithdrawEvent {
    #[key]
    pub from: PubKey,
    #[key]
    pub nonce: u64,
    pub amount: u128,
    pub to: ContractAddress,
}


/// Event emited in a Transfer operation.
///
/// - to: The Tongo account to send tongos to.
/// - from: The Tongo account to take tongos from.
/// - nonce: The nonce of the Tongo account (from).
/// - transferBalance: The amount to transfer encrypted for the pubkey of `to`.
/// - transferBalanceSelf: The amount to transfer encrypted for the pubkey of `from`.
/// - hintTransfer: AE encryption of the amount to transfer to `to`.
/// - hintLeftover: AE encryption of the leftover balance of `from`.
#[derive(Drop, starknet::Event)]
pub struct TransferEvent {
    #[key]
    pub to: PubKey,
    #[key]
    pub from: PubKey,
    #[key]
    pub nonce: u64,
    pub transferBalance: CipherBalance,
    pub transferBalanceSelf: CipherBalance,
    pub hintTransfer: AEBalance,
    pub hintLeftover: AEBalance,
}


/// Event emited in a Ragequit operation.
///
/// - from: The Tongo account to withdraw from.
/// - nonce: The nonce of the Tongo account.
/// - amount: The ammount of tongo to ragequit (the total amount of tongos in the account).
/// - to: The starknet contract address to send the funds to.
#[derive(Drop, starknet::Event)]
pub struct RagequitEvent {
    #[key]
    pub from: PubKey,
    #[key]
    pub nonce: u64,
    pub amount: u128,
    pub to: ContractAddress,
}

/// Event emited when users declare their balances to the auditor.
///
/// - from: The Tongo account that is declaring its balance.
/// - nonce: The nonce of the Tongo accout.
/// - auditorPubKey: The current public key of the auditor.
/// - declaredCipherBalance: The balance of the user encrypted for the auditor pubkey.
/// - hint: AE encryption of the balance for the auditor fast decryption.
#[derive(Drop, starknet::Event)]
pub struct BalanceDeclared {
    #[key]
    pub from: PubKey,
    #[key]
    pub nonce: u64,
    pub auditorPubKey: PubKey,
    pub declaredCipherBalance: CipherBalance,
    pub hint: AEBalance,
}


/// Event emited when users declare a transfer to the auditor.
///
/// - from: The Tongo account that is executing the transfer.
/// - to: The Tongo account that is receiving the transfer.
/// - nonce: The nonce of the Tongo accout (from).
/// - auditorPubKey: The current public key of the auditor.
/// - declaredCipherBalance: The transfer amount encrypted for the auditor pubkey.
/// - hint: AE encryption of the balance for the auditor fast decryption.
#[derive(Drop, starknet::Event)]
pub struct TransferDeclared {
    #[key]
    pub from: PubKey,
    #[key]
    pub to: PubKey,
    #[key]
    pub nonce: u64,
    pub auditorPubKey: PubKey,
    pub declaredCipherBalance: CipherBalance,
    pub hint: AEBalance,
}

/// Event emited when the owner sets a public key for the auditor.
///
/// - keyNumber: An increasing number that identifies the public key
/// - AuditorPubKey: The newly set auditor public key.
#[derive(Drop, starknet::Event)]
pub struct AuditorPubKeySet {
    #[key]
    pub keyNumber: u128,
    pub AuditorPubKey: PubKey,
}
```

## Operations

### 1. Fund Operation

Converts ERC20 tokens to encrypted balances:

```rust
This code is a simplification of the actual code

/// Funds a tongo account. Callable only by the account owner
///
/// Emits FundEvent
fn fund(ref self: ContractState, fund: Fund) {
    verify_fund(/* public inputs */, proof);

    self._transfer_from_caller(amount);

    let cipher = CipherBalanceTrait::new(to, amount, 'fund');
    self._add_balance(to, cipher);
    self.emit(FundEvent);

    if self.auditor.is_some() {
        self._handle_audit(auditPart);
    }
}
```

### 2. Transfer Operation

Performs confidential transfers between accounts:

```rust
This code is a simplification of the actual code

/// Transfer Tongos from the balance of the sender to the pending of the receiver
///
/// Emits TransferEvent
fn transfer(ref self: ContractState, transfer: Transfer) {
    verify_transfer(/* public inputs */, proof);

    self._subtract_balance(from, transferBalanceSelf);
    self._add_pending(to, transferBalance);
    self.emit( TransferEvent );

    if self.auditor.is_some() {
        self._handle_audit(auditPart);
    }
}
```

### 3. Rollover Operation

Merges pending transfers into main balance:

```rust
This code is a simplification of the actual code

/// Moves to the balance the amount stored in the pending. Callable only by the account
/// owner.
///
/// Emits RolloverEvent
fn rollover(ref self: TContractState, rollover: Rollover) {
    verify_rollover(/* public inputs */, proof);

    self._pending_to_balance(to);

    self.emit( RolloverEvent );
}
```

### 4. Withdraw Operation
Convert back to standard ERC20 tokens:
```rust
This code is a simplification of the actual code

/// Withdraw Tongos and send the ERC20 to a starknet address.
///
/// Emits WithdrawEvent
fn withdraw(ref self: ContractState, withdraw: Withdraw) {
    verify_withdraw(/* public inputs */, proof);

    let cipher = CipherBalanceTrait::new(from, amount, 'withdraw');
    self._subtract_balance(from, cipher);
    self._transfer_to(to, amount);

    self.emit( WithdrawEvent );

    if self.auditor.is_some() {
        self._handle_audit(auditPart);
    }
}

```
