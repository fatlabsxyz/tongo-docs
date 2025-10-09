# Types & Interfaces

TypeScript type definitions used in the SDK.

## Core Types

### PubKey

```typescript
interface PubKey {
    x: bigint;
    y: bigint;
}
```

Elliptic curve point representing a public key.

### TongoAddress

```typescript
type TongoAddress = string & { __type: "tongo" };
```

Base58-encoded public key string.

### CipherBalance

```typescript
interface CipherBalance {
    L: ProjectivePoint;
    R: ProjectivePoint;
}
```

ElGamal ciphertext for encrypted balances.

### AEBalance

```typescript
interface AEBalance {
    c0: bigint;
    c1: bigint;
    c2: bigint;
}
```

ChaCha20-encrypted hint for faster decryption.

## Account Types

### AccountState

```typescript
interface AccountState {
    balance: bigint;
    pending: bigint;
    nonce: bigint;
}
```

Decrypted account state.

### RawAccountState

```typescript
interface RawAccountState {
    balance: CipherBalance;
    pending: CipherBalance;
    audit?: CipherBalance;
    nonce: bigint;
    aeBalance?: AEBalance;
    aeAuditBalance?: AEBalance;
}
```

Encrypted account state from contract.

## Operation Parameter Types

### FundDetails

```typescript
interface FundDetails {
    amount: bigint;
}
```

### TransferDetails

```typescript
interface TransferDetails {
    amount: bigint;
    to: PubKey;
}
```

### WithdrawDetails

```typescript
interface WithdrawDetails {
    to: string;      // Starknet address
    amount: bigint;
}
```

### RagequitDetails

```typescript
interface RagequitDetails {
    to: string;  // Starknet address
}
```

## Event Types

### AccountEvents

```typescript
type AccountEvents =
    | AccountFundEvent
    | AccountTransferOutEvent
    | AccountTransferInEvent
    | AccountRolloverEvent
    | AccountWithdrawEvent
    | AccountRagequitEvent;
```

### AccountFundEvent

```typescript
interface AccountFundEvent {
    type: 'fund';
    tx_hash: string;
    block_number: number;
    nonce: bigint;
    amount: bigint;
}
```

### AccountTransferOutEvent

```typescript
interface AccountTransferOutEvent {
    type: 'transferOut';
    tx_hash: string;
    block_number: number;
    nonce: bigint;
    amount: bigint;
    to: string;  // Tongo address
}
```

### AccountTransferInEvent

```typescript
interface AccountTransferInEvent {
    type: 'transferIn';
    tx_hash: string;
    block_number: number;
    nonce: bigint;
    amount: bigint;
    from: string;  // Tongo address
}
```

## Utility Functions

### derivePublicKey

```typescript
function derivePublicKey(privateKey: bigint): PubKey
```

### pubKeyAffineToBase58

```typescript
function pubKeyAffineToBase58(pub: PubKey): TongoAddress
```

### pubKeyBase58ToAffine

```typescript
function pubKeyBase58ToAffine(b58string: string): { x: bigint; y: bigint }
```
