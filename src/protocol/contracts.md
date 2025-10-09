# Cairo Contracts

The Tongo protocol is implemented as a Cairo smart contract on Starknet, leveraging native elliptic curve operations for efficient zero-knowledge proof verification.

## Contract Architecture

### Core Contract

The main `Tongo` contract implements the `ITongo` interface and manages all confidential payment operations:

```rust
#[starknet::interface]
pub trait ITongo<TContractState> {
    fn fund(ref self: TContractState, fund: Fund);
    fn rollover(ref self: TContractState, rollover: Rollover);
    fn withdraw_all(ref self: TContractState, withdraw_all: WithdrawAll);
    fn withdraw(ref self: TContractState, withdraw: Withdraw);
    fn transfer(ref self: TContractState, transfer: Transfer);

    // State queries
    fn get_balance(self: @TContractState, y: PubKey) -> CipherBalance;
    fn get_audit(self: @TContractState, y: PubKey) -> CipherBalance;
    fn get_pending(self: @TContractState, y: PubKey) -> CipherBalance;
    fn get_nonce(self: @TContractState, y: PubKey) -> u64;
    fn get_state(self: @TContractState, y: PubKey) -> State;
    fn ERC20(self: @TContractState) -> ContractAddress;
}
```

### Storage Structure

```rust
#[storage]
struct Storage {
    balance: Map<PubKey, CipherBalance>,        // Main encrypted balances
    audit_balance: Map<PubKey, CipherBalance>,  // Auditor encrypted copies
    pending: Map<PubKey, CipherBalance>,        // Incoming transfer buffer
    ae_balance: Map<PubKey, AEBalance>,        // Fast decrypt hints
    ae_audit_balance: Map<PubKey, AEBalance>,  // Fast decrypt audit hints
    nonce: Map<PubKey, u64>,                   // Replay protection
}
```

### Events

The contract emits events for all operations to enable off-chain monitoring:

```rust
#[derive(Drop, starknet::Event)]
struct TransferEvent {
    from: PubKey,
    to: PubKey,
    nonce: u64
}

#[derive(Drop, starknet::Event)]
struct FundEvent {
    to: PubKey,
    amount: felt252,
    nonce: u64
}

#[derive(Drop, starknet::Event)]
struct WithdrawEvent {
    from: PubKey,
    to: ContractAddress,
    amount: felt252,
    nonce: u64
}

#[derive(Drop, starknet::Event)]
struct RolloverEvent {
    account: PubKey,
    nonce: u64
}
```

## Data Structures

### Core Types

```rust
// Public key as elliptic curve point
struct PubKey {
    x: felt252,
    y: felt252
}

// ElGamal ciphertext
struct CipherBalance {
    CL: StarkPoint,  // g^b * y^r (left component)
    CR: StarkPoint   // g^r (right component)
}

// Authenticated encryption balance
struct AEBalance {
    ciphertext: u512,
    nonce: u256
}

// Complete account state
struct State {
    balance: CipherBalance,
    pending: CipherBalance,
    audit: CipherBalance,
    nonce: u64,
    ae_balance: AEBalance,
    ae_audit_balance: AEBalance
}
```

### Operation Structures

```rust
struct Fund {
    to: PubKey,
    amount: felt252,
    ae_hints: AEHints,
    proof: ProofOfFund
}

struct Transfer {
    from: PubKey,
    to: PubKey,
    L: StarkPoint,          // Sender encryption left component
    L_bar: StarkPoint,      // Receiver encryption left component
    L_audit: StarkPoint,    // Auditor encryption left component
    R: StarkPoint,          // Shared right component
    ae_hints: AEHints,
    proof: ProofOfTransfer
}

struct Withdraw {
    from: PubKey,
    amount: felt252,
    to: ContractAddress,    // Starknet address to receive ERC20
    ae_hints: AEHints,
    proof: ProofOfWithdraw
}
```

## Verification System

### Proof Verifier

The contract includes a sophisticated zero-knowledge proof verification system:

#### Main verification logic

- `verify_fund()`: Validates funding proofs (POE)
- `verify_transfer()`: Validates transfer proofs (POE + PED + RAN)
- `verify_withdraw()`: Validates withdrawal proofs (POE + RAN)
- `verify_range()`: Bit-decomposition range proofs
- `verify_pedersen()`: Pedersen commitment proofs

#### Cryptographic utilities

- Point arithmetic operations
- Hash computations for Fiat-Shamir
- Curve parameter constants

#### Proof data structures

```rust
struct ProofOfFund {
    Ax: StarkPoint,
    sx: felt252
}

struct ProofOfTransfer {
    ownership: ProofOfOwnership,
    blinding: ProofOfOwnership,
    sender_ped: ProofOfPedersen,
    receiver_ped: ProofOfPedersen,
    audit_ped: ProofOfPedersen,
    amount_range: ProofOfRange,
    remaining_range: ProofOfRange
}
```

## Operations

### 1. Fund Operation

Converts ERC20 tokens to encrypted balances:

```rust
fn fund(ref self: TContractState, fund: Fund) {
    // Verify proof of ownership
    verify_fund(fund.proof, fund.to, fund.amount);

    // Create encrypted balance
    let cipher = encrypt_balance(fund.amount, fund.to);

    // Update storage
    self.balance.write(fund.to, cipher_add(self.balance.read(fund.to), cipher));
    self.nonce.write(fund.to, self.nonce.read(fund.to) + 1);
}
```

### 2. Transfer Operation

Performs confidential transfers between accounts:

```rust
fn transfer(ref self: TContractState, transfer: Transfer) {
    // Verify comprehensive transfer proof
    verify_transfer(transfer.proof, /* public inputs */);

    // Update sender balance (subtract)
    let sender_cipher = CipherBalance { L: transfer.L, R: transfer.R };
    let old_balance = self.balance.read(transfer.from);
    self.balance.write(transfer.from, cipher_subtract(old_balance, sender_cipher));

    // Update receiver pending (add)
    let receiver_cipher = CipherBalance { L: transfer.L_rec, R: transfer.R };
    let old_pending = self.pending.read(transfer.to);
    self.pending.write(transfer.to, cipher_add(old_pending, receiver_cipher));

    // Update auditor balance
    let audit_cipher = CipherBalance { L: transfer.L_audit, R: transfer.R };
    let old_audit = self.audit_balance.read(transfer.from);
    self.audit_balance.write(transfer.from, cipher_subtract(old_audit, audit_cipher));
}
```

### 3. Rollover Operation

Merges pending transfers into main balance:

```rust
fn rollover(ref self: TContractState, rollover: Rollover) {
    // Verify ownership
    verify_ownership(rollover.proof, rollover.to);

    // Move pending to balance
    let pending = self.pending.read(rollover.to);
    let balance = self.balance.read(rollover.to);
    self.balance.write(rollover.to, cipher_add(balance, pending));

    // Clear pending
    self.pending.write(rollover.to, CipherBalance { L: zero_point(), R: zero_point() });
}
```

## Security Features

### Anti-Spam Protection

- **Pending balance system**: Incoming transfers go to separate pending storage
- **Explicit rollover**: Users must claim pending transfers
- **Nonce protection**: Prevents replay attacks

### Range Proof Security

- **32-bit decomposition**: Ensures amounts are in valid range [0, 2³²)
- **Bit verification**: Each bit proven to be 0 or 1 using OR proofs
- **Overflow prevention**: Prevents negative balances and money creation

### Cryptographic Guarantees

- **Discrete log assumption**: Security based on Stark curve
- **Fiat-Shamir**: Makes interactive proofs non-interactive
- **Context binding**: Proofs tied to specific transactions

## Deployment

### Configuration

```rust
// Contract constructor
fn constructor(
    ref self: ContractState,
    strk_address: ContractAddress,    // ERC20 token to wrap
    view: PubKey                      // Global auditor public key
) {
    self.strk_address.write(strk_address);
    self.view.write(view);
}
```

## Testing

Comprehensive test suite covers:

- **Unit tests**: Individual function verification
- **Integration tests**: Full operation flows
- **Proof tests**: ZK proof generation and verification
- **Edge cases**: Error conditions and boundary values

```bash
# Run all tests
scarb test
```

The Cairo implementation provides a secure, efficient foundation for confidential payments on Starknet.
