# Encrypted State

Tongo stores all account balances as encrypted ciphertexts on-chain. This page explains how encrypted state works and how to decrypt it.

## State Structure

Each Tongo account has the following encrypted state on-chain:

```typescript
interface RawAccountState {
    balance: CipherBalance;              // Encrypted spendable balance
    pending: CipherBalance;              // Encrypted pending (incoming) balance
    audit: CipherBalance | undefined;    // Optional audit ciphertext
    nonce: bigint;                       // Account nonce (not encrypted)
    aeBalance?: AEBalance;               // AE-encrypted hint for balance
    aeAuditBalance?: AEBalance;          // AE-encrypted hint for audit
}
```

## CipherBalance

A `CipherBalance` is an ElGamal ciphertext representing an encrypted amount:

```typescript
interface CipherBalance {
    L: ProjectivePoint;  // g^amount * y^randomness
    R: ProjectivePoint;  // g^randomness
}
```

Where:
- `g` is the Stark curve generator
- `y` is the recipient's public key
- The amount is encrypted homomorphically

### Properties

- **Additively Homomorphic**: Can add encrypted balances without decryption
- **Semantically Secure**: Same amount encrypted twice looks different
- **Decryption Required**: Must brute-force or use hints to recover the amount

## AEBalance

An `AEBalance` is a ChaCha20-encrypted hint for faster decryption:

```typescript
interface AEBalance {
    c0: bigint;  // Ciphertext part 1
    c1: bigint;  // Ciphertext part 2
    c2: bigint;  // Ciphertext part 3
}
```

### Why AE Hints?

Decrypting ElGamal ciphertexts requires brute-force search. AE hints provide:
- **Instant decryption** with the symmetric key
- **Verification** against the ElGamal ciphertext
- **Fallback** to brute-force if hint is unavailable

## Decryption Methods

### Method 1: Using state() (Recommended)

The easiest way to get decrypted balances:

```typescript
const state = await account.state();
console.log(state);
// { balance: 5000n, pending: 500n, nonce: 2n }
```

This method:
1. Fetches raw state from contract
2. Decrypts AE hints (if available)
3. Decrypts CipherBalances using hints
4. Falls back to brute-force if needed

### Method 2: Manual Decryption

For more control, decrypt manually:

```typescript
// Get raw state
const rawState = await account.rawState();

// Decrypt balance with hint
let balanceAmount: bigint;
if (rawState.aeBalance) {
    const hint = await account.decryptAEBalance(
        rawState.aeBalance,
        rawState.nonce
    );
    balanceAmount = account.decryptCipherBalance(rawState.balance, hint);
} else {
    // Brute-force without hint
    balanceAmount = account.decryptCipherBalance(rawState.balance);
}

// Decrypt pending (no hint for pending)
const pendingAmount = account.decryptCipherBalance(rawState.pending);

console.log({ balance: balanceAmount, pending: pendingAmount });
```

### Method 3: Brute-Force Range

If you know the approximate range:

```typescript
// This is what happens internally when no hint is available
// The SDK uses Baby-step Giant-step algorithm
const amount = account.decryptCipherBalance(cipherBalance);
```

> **Note**: The SDK implements an efficient Baby-step Giant-step algorithm from the SHE library. Decryption without hints can still be fast for reasonable ranges.

## State Updates

### After Fund

```typescript
const fundOp = await account.fund({ amount: 1000n });
// ... execute transaction ...

const state = await account.state();
// {
//     balance: 1000n,     // Increased
//     pending: 0n,
//     nonce: 1n           // Incremented
// }
```

### After Transfer (Sender)

```typescript
const transferOp = await account.transfer({
    to: recipientPubKey,
    amount: 100n
});
// ... execute transaction ...

const state = await account.state();
// {
//     balance: 900n,      // Decreased
//     pending: 0n,
//     nonce: 2n           // Incremented
// }
```

### After Transfer (Recipient)

```typescript
// Recipient's state after receiving transfer
const state = await recipientAccount.state();
// {
//     balance: 0n,        // Unchanged
//     pending: 100n,      // Increased!
//     nonce: 0n           // Unchanged
// }
```

### After Rollover

```typescript
const rolloverOp = await account.rollover();
// ... execute transaction ...

const state = await account.state();
// {
//     balance: 100n,      // pending moved to balance
//     pending: 0n,        // Reset to zero
//     nonce: 1n           // Incremented
// }
```

### After Withdraw

```typescript
const withdrawOp = await account.withdraw({
    to: address,
    amount: 50n
});
// ... execute transaction ...

const state = await account.state();
// {
//     balance: 50n,       // Decreased
//     pending: 0n,
//     nonce: 2n           // Incremented
// }
```

## Nonce Management

The nonce is **not encrypted** and serves multiple purposes:

1. **Prevent replay attacks**: Each operation increments nonce
2. **Order operations**: Nonce must match expected value
3. **Key derivation**: Used in AE hint encryption

### Nonce Behavior

- Starts at `0n` for new accounts
- Increments by 1 for each operation
- Cannot be modified directly
- Must match on-chain value for operations to succeed

```typescript
const nonce = await account.nonce();
console.log(nonce); // 0n (new account)

// After first operation
await account.fund({...});
const newNonce = await account.nonce();
console.log(newNonce); // 1n
```

## Audit Ciphertexts

If a global auditor is configured, each operation creates an audit ciphertext:

```typescript
const rawState = await account.rawState();
if (rawState.audit) {
    // Audit ciphertext exists
    // Only the auditor can decrypt this
}
```

### For Auditors

If you have the auditor private key:

```typescript
import { decipherBalance } from "@fatsolutions/she";

const auditAmount = decipherBalance(
    auditorPrivateKey,
    rawState.audit.L,
    rawState.audit.R
);
console.log("Audited amount:", auditAmount);
```

## Performance Considerations

### AE Hints vs Brute-Force

- **With AE hint**: Instant decryption (< 1ms)
- **Without hint**: Depends on range, typically < 100ms for balances up to 1M

### When Hints Are Available

AE hints are created for:
- Balance after fund
- Balance after transfer (sender)
- Balance after rollover
- Balance after withdraw
- Pending balance does NOT have hints (use brute-force)

### Optimizing Decryption

If you're decrypting frequently:

```typescript
// Cache decrypted values
let cachedBalance = await account.state();

// Only refresh when needed
async function refreshBalance() {
    cachedBalance = await account.state();
    return cachedBalance;
}

// Use cached value for display
console.log("Balance:", cachedBalance.balance);
```

## Error Scenarios

### Corrupted Ciphertexts

If a ciphertext is malformed:

```typescript
try {
    const amount = account.decryptCipherBalance(corruptedCipher);
} catch (error) {
    console.error("Decryption failed:", error);
    // Ciphertext might be corrupted or tampered with
}
```

### Hint Mismatch

If the AE hint doesn't match the CipherBalance:

```typescript
const hint = await account.decryptAEBalance(aeBalance, nonce);
const verified = account.decryptCipherBalance(balance, hint);

// SDK internally verifies:
// assertBalance(privateKey, hint, L, R)
// If verification fails, falls back to brute-force
```

## Next Steps

- [Learn about Key Management](key-management.md)
- [See Accounts documentation](accounts.md)
- [Understand Operations](operations.md)
