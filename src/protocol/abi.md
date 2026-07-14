# Contract ABI

Use the selector to switch between the current **v2** ABI and the legacy **v1** one.

<div class="version-tabs" data-version-tabs>
<div class="version-tabs__buttons">
<button class="version-tab is-active" type="button" data-version="v2">v2</button>
<button class="version-tab" type="button" data-version="v1">v1</button>
</div>

<div class="version-panel is-active" data-version-panel="v2">

In v2 the protocol is split between a **Vault** (custody + factory) and the **Tongo** ledgers it deploys. See [Vault Architecture](vault.md) for the design. The `Tongo` contract implements `ITongo` and the `Vault` contract implements `IVault`.

## Tongo ABI

```rust
#[starknet::interface]
pub trait ITongo<TContractState> {
    /// Returns the complete Setup of this Tongo instance
    fn get_tongo_config(self: @TContractState) -> TongoConfig;

    /// Returns the address of the Vault that deployed this Tongo instance
    fn get_vault(self: @TContractState) -> ContractAddress;

    /// Returns the Tag this contract is registered with.
    fn get_tag(self: @TContractState) -> felt252;

    /// Returns the contract address of the ERC20 that is wrapped
    fn ERC20(self: @TContractState) -> ContractAddress;

    /// Returns the rate of conversion between the wrapped ERC20 and tongo:
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

    /// Funds a tongo acount. Can be called without knowledge of the pk.
    ///
    /// Emits OutsideFundEvent
    fn outside_fund(ref self: TContractState, outsideFund: OutsideFund);

    /// Withdraw Tongos and send the ERC20 to a starknet address.
    ///
    /// Emits WithdrawEvent
    fn withdraw(
        ref self: TContractState, withdraw: Withdraw, withdraw_options: Option<WithdrawOptions>,
    );

    /// Withdraw all the balance of an account and send the ERC20 to a starknet address. This proof
    /// avoids the limitations of the range prove that are present in the regular withdraw.
    ///
    /// Emits RagequitEvent
    fn ragequit(
        ref self: TContractState, ragequit: Ragequit, ragequit_options: Option<RagequitOptions>,
    );

    /// Transfer Tongos from the balance of the sender to the pending of the receiver
    ///
    /// Emits TransferEvent
    fn transfer(
        ref self: TContractState, transfer: Transfer, transfer_options: Option<TransferOptions>,
    );

    /// Moves to the balance the amount stored in the pending. Callable only by the account owner.
    ///
    /// Emits RolloverEvent
    fn rollover(ref self: TContractState, rollover: Rollover);

    // State reading functions
    /// Returns the current stored balance of a Tongo account
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

    // External Transfers
    /// Receive an encrypted transfer from another Tongo contract deployed by the same Vault.
    /// The interaction between these contract has to be approved by the owners.
    ///
    /// Emits ReceivedExternalTransfer
    fn receive_external_transfer(ref self: TContractState, external: ExternalTransfer);

    /// Approve a Tongo instance deployed by the same Vault to interact with
    /// this contract with the External Transfer mechanism.
    fn approveTongo(ref self: TContractState, address: ContractAddress);

    /// Revoke a previously approved Tongo instance to interact with
    /// this contract with the External Transfer mechanism.
    fn revokeTongo(ref self: TContractState, address: ContractAddress);
}
```

## Vault ABI

The `Vault` custodies the ERC20 reserve and deploys Tongo ledgers:

```rust
#[starknet::interface]
pub trait IVault<TContractState> {
    /// Returns the global setup of the Vault.
    fn get_vault_config(self: @TContractState) -> VaultConfig;

    /// Returns the class hash of the Tongo this contract will work with.
    fn get_tongo_class_hash(self: @TContractState) -> ClassHash;

    /// Returns the contract address of the ERC20 that Tongo will wrap.
    fn ERC20(self: @TContractState) -> ContractAddress;

    /// Returns the rate of conversion between the wrapped ERC20 and Tongo.
    fn get_rate(self: @TContractState) -> u256;

    /// Returns the bit size Tongo will work with.
    fn get_bit_size(self: @TContractState) -> u32;

    /// Returns true if the address is a Tongo contract deployed by this Vault.
    fn is_known_tongo(self: @TContractState, address: ContractAddress) -> bool;

    /// Returns the address of a given tag if a Tongo contract was deployed with that tag.
    fn tag_to_address(self: @TContractState, tag: felt252) -> Option<ContractAddress>;

    /// Deploys a Tongo instance for the given owner and tag with the given auditor.
    ///
    /// Emits TongoDeployed event.
    fn deploy_tongo(
        ref self: TContractState, owner: ContractAddress, tag: felt252, auditorKey: Option<PubKey>,
    ) -> ContractAddress;

    /// Pulls ERC20 from the caller. The caller can only be a Tongo instance deployed by this Vault.
    fn deposit(ref self: TContractState, amount: u256);

    /// Sends ERC20 to the caller. The caller can only be a Tongo instance deployed by this Vault.
    fn withdraw(ref self: TContractState, amount: u256);
}
```

## Storage Structure

Unlike v1, a Tongo instance no longer custodies ERC20. It records the `vault` that deployed it, its `tag`, and the set of `approvedTongo` instances allowed to send it external transfers.

```rust
#[storage]
struct Storage {
    /// The contract address that is owner of the Tongo instance.
    owner: ContractAddress,
    /// The Vault contract this Tongo instance interacts with for ERC20 custody.
    vault: ContractAddress,
    /// The tag this contract is registered with.
    tag: felt252,
    /// The contract address of the ERC20 that Tongo is wrapping.
    ERC20: ContractAddress,
    /// The conversion rate between the wrapped ERC20 and tongo:
    ///
    /// ERC20_amount = Tongo_amount*rate
    rate: u256,
    /// The bit size this contract will work with. This limits the values that can be proven
    /// by a range proof.
    bit_size: u32,
    /// The encrypted balance for the given pubkey.
    balance: Map<PubKey, CipherBalance>,
    /// The encrypted pending balance for the given pubkey. The pending balance is the sum of
    /// incoming transfers. The user executes a rollover to convert this to usable balance.
    pending: Map<PubKey, CipherBalance>,
    /// The nonce of the given pubkey. Nonce is increased in every user operation.
    nonce: Map<PubKey, u64>,
    /// Hint to fast decrypt the balance of the given pubkey.
    ae_balance: Map<PubKey, AEBalance>,
    /// The balance of the given pubkey encrypted for the auditor key.
    audit_balance: Map<PubKey, CipherBalance>,
    /// Hint to fast decrypt the audited balance of the given pubkey.
    ae_audit_balance: Map<PubKey, AEBalance>,
    /// The auditor pubkey. If the contract was deployed without auditor this is None.
    auditor_key: Option<PubKey>,
    /// The increasing number that identifies the public key.
    key_number: u128,
    /// Whitelist of Tongo instances (deployed by the same Vault) allowed to interact with this
    /// contract through the external_transfer mechanism. Managed by the owner.
    approvedTongo: Map<ContractAddress, bool>,
}
```

## Events

v2 keeps the v1 events and adds `OutsideFundEvent`, `ReceivedExternalTransfer`, `TongoApproved` / `TongoRevoked`, and the Vault's `TongoDeployed`. Note that `FundEvent` now also carries `from`, and `TransferEvent` carries the receiver's Tongo instance `toTongo`.

```rust
/// Event emitted in a Fund operation.
#[derive(Drop, starknet::Event)]
pub struct FundEvent {
    #[key]
    pub to: PubKey,
    #[key]
    pub nonce: u64,
    #[key]
    pub from: ContractAddress,
    pub amount: u128,
}

/// Event emitted in an OutsideFund operation.
#[derive(Drop, starknet::Event)]
pub struct OutsideFundEvent {
    #[key]
    pub to: PubKey,
    #[key]
    pub from: ContractAddress,
    pub amount: u128,
}

/// Event emitted in a Rollover operation.
#[derive(Drop, starknet::Event)]
pub struct RolloverEvent {
    #[key]
    pub to: PubKey,
    #[key]
    pub nonce: u64,
    pub rollovered: CipherBalance,
}

/// Event emitted in a Withdraw operation.
#[derive(Drop, starknet::Event)]
pub struct WithdrawEvent {
    #[key]
    pub from: PubKey,
    #[key]
    pub nonce: u64,
    pub amount: u128,
    pub to: ContractAddress,
}

/// Event emitted in a Transfer operation.
#[derive(Drop, starknet::Event)]
pub struct TransferEvent {
    #[key]
    pub to: PubKey,
    #[key]
    pub from: PubKey,
    #[key]
    pub nonce: u64,
    pub toTongo: ContractAddress,
    pub transferBalance: CipherBalance,
    pub transferBalanceSelf: CipherBalance,
    pub hintTransfer: AEBalance,
    pub hintLeftover: AEBalance,
}

/// Event emitted when an External Transfer is received.
#[derive(Drop, starknet::Event)]
pub struct ReceivedExternalTransfer {
    #[key]
    pub to: PubKey,
    #[key]
    pub from: PubKey,
    #[key]
    pub fromTongo: ContractAddress,
    pub nonce: u64,
    pub transferBalance: CipherBalance,
    pub hintTransfer: AEBalance,
}

/// Event emitted in a Ragequit operation.
#[derive(Drop, starknet::Event)]
pub struct RagequitEvent {
    #[key]
    pub from: PubKey,
    #[key]
    pub nonce: u64,
    pub amount: u128,
    pub to: ContractAddress,
}

/// Event emitted when users declare their balances to the auditor.
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

/// Event emitted when users declare a transfer to the auditor.
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

/// Event emitted when the owner sets a public key for the auditor.
#[derive(Drop, starknet::Event)]
pub struct AuditorPubKeySet {
    #[key]
    pub keyNumber: u128,
    pub AuditorPubKey: PubKey,
}

/// Event emitted when an owner approves a Tongo instance for external transfers.
#[derive(Drop, starknet::Event)]
pub struct TongoApproved {
    #[key]
    pub address: ContractAddress,
}

/// Event emitted when an owner revokes a previously approved Tongo instance.
#[derive(Drop, starknet::Event)]
pub struct TongoRevoked {
    #[key]
    pub address: ContractAddress,
}

/// Event emitted by the Vault when a Tongo contract is deployed.
#[derive(Drop, starknet::Event)]
pub struct TongoDeployed {
    #[key]
    pub tag: felt252,
    pub address: ContractAddress,
    pub ERC20: ContractAddress,
    pub rate: u256,
    pub bit_size: u32,
    pub auditor_key: Option<PubKey>,
}
```

## Operations

The operations verify the same ZK proofs as v1. The difference is custody: instead of holding the ERC20 itself, a Tongo instance forwards token movements to its Vault via `deposit` / `withdraw`. The relayable operations (`transfer`, `withdraw`, `ragequit`) also pay an optional `fee_to_sender` to the caller.

```rust
This code is a simplification of the actual code

/// Funds a tongo account. Callable only by the account owner
fn fund(ref self: ContractState, fund: Fund) {
    verify_fund(/* public inputs */, proof);

    // pull the ERC20 from the owner and forward it to the Vault reserve
    self._transfer_from_caller(amount);
    self._send_to_vault(amount);

    let cipher = CipherBalanceTrait::new(to, amount, 'fund');
    self._add_balance(to, cipher);
    self.emit(FundEvent);

    if self.auditor_key.is_some() {
        self._handle_audit(auditPart);
    }
}
```

```rust
This code is a simplification of the actual code

/// Transfer Tongos from the balance of the sender to the pending of the receiver
fn transfer(ref self: ContractState, transfer: Transfer, options: Option<TransferOptions>) {
    // if relayed, pull the fee from the Vault and pay it to the caller (relayer)
    if let Some(relay) = relayData {
        self._withdraw_from_vault(relay.fee_to_sender);
        self._transfer_to(get_caller_address(), relay.fee_to_sender);
        self._subtract_balance(from, CipherBalanceTrait::new(from, relay.fee_to_sender, 'fee'));
    }

    verify_transfer(/* public inputs */, proof);

    self._subtract_balance(from, transferBalanceSelf);
    self._add_pending(to, transferBalance);
    self.emit(TransferEvent);

    if self.auditor_key.is_some() {
        self._handle_audit(auditPart);
    }
}
```

```rust
This code is a simplification of the actual code

/// Withdraw Tongos and send the ERC20 to a starknet address.
fn withdraw(ref self: ContractState, withdraw: Withdraw, options: Option<WithdrawOptions>) {
    // relay fee handling, as in transfer
    if let Some(relay) = relayData { /* pay fee_to_sender to caller */ }

    verify_withdraw(/* public inputs */, proof);

    self._subtract_balance(from, CipherBalanceTrait::new(from, amount, 'withdraw'));

    // pull the ERC20 from the Vault reserve and send it to the recipient
    self._withdraw_from_vault(amount);
    self._transfer_to(to, amount);

    self.emit(WithdrawEvent);

    if self.auditor_key.is_some() {
        self._handle_audit(auditPart);
    }
}
```

```rust
This code is a simplification of the actual code

/// Moves the pending balance into the usable balance. Callable only by the account owner.
fn rollover(ref self: ContractState, rollover: Rollover) {
    verify_rollover(/* public inputs */, proof);
    self._pending_to_balance(to);
    self.emit(RolloverEvent);
}
```

Two more operations are new in v2:

- **`outside_fund`** — funds a Tongo account without knowledge of its private key (no ZK proof from the account owner). Emits `OutsideFundEvent`.
- **`receive_external_transfer`** — receives a confidential transfer coming from another Tongo instance deployed by the same Vault. Both owners must have approved the interaction (`approveTongo` / `revokeTongo`). Emits `ReceivedExternalTransfer`.

</div>

<div class="version-panel" data-version-panel="v1">

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

</div>

</div>
