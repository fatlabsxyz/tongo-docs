---
title: "TypeScript SDK"
weight: 9
bookToC: true
---

# Tongo TypeScript SDK

The `tongo-sdk` provides a high-level TypeScript interface for building applications with confidential payments. It abstracts away cryptographic complexity while providing full access to Tongo's features.

## Installation

```bash
npm install tongo-sdk
```

## Quick Start

```typescript
import { Account } from 'tongo-sdk';

// Create account from secret key
const account = new Account(
  secretKey,                    // Private key (bigint or Uint8Array)
  '0x123...tongoAddress',      // Deployed Tongo contract
  provider                      // Optional: Starknet RPC provider
);

console.log(account.tongoAddress());
// Output: "5mJNv2Z8QxFfKw7hL3e9P1rT6sY4pQ2nX8kM7dR3cB1"
```

---

## Account Management

### Constructor

```typescript
// Constructor signature
new Account(
  privateKey: BigNumberish | Uint8Array,  // Private key
  contractAddress: string,                 // Tongo contract address
  provider?: RpcProvider                   // Optional Starknet provider
)
```

### Key Operations

```typescript
// Get public key as coordinate object
const pubKey = account.publicKey; // {x: bigint, y: bigint}

// Get base58-encoded public key
const tongoAddr = account.tongoAddress();

// Get current nonce (for replay protection)
const nonce = await account.nonce();
```

---

## Balance Management

### Query Balances

```typescript
// Get encrypted balance from contract
const encryptedBalance = await account.balance();

// Get encrypted pending balance (incoming transfers)
const encryptedPending = await account.pending();

// Get complete account state
const state = await account.state();
console.log(state);
// {
//   balance: CipherBalance,
//   pending: CipherBalance,
//   audit: CipherBalance,
//   aeBalance: AEHint,
//   aeAuditBalance: AEHint,
//   nonce: bigint
// }
```

### Decrypt Balances

```typescript
// Decrypt with brute force (specify reasonable range)
const actualBalance = await account.decryptBalance();
const pendingAmount = await account.decryptPending();

// Decrypt specific ciphertext
const amount = account.decryptCipherBalance(encryptedBalance);

// Note: Fast decryption using AE hints requires the balance to be
// within the expected range for brute force decryption
```

---

## Transaction Operations

### Fund Account

Convert ERC20 tokens to encrypted balances:

```typescript
interface FundDetails {
  amount: bigint;              // Amount to fund
}

// Create funding operation
const fundOp = await account.fund({
  amount: 1000n
});

// Execute transaction
const callData = fundOp.toCalldata(); // Returns single Call object
await signer.execute([callData]);     // Wrap in array for execution
```

### Private Transfer

Send encrypted amounts to other users:

```typescript
interface TransferDetails {
  to: PubKey;                  // Recipient public key object
  amount: bigint;              // Amount to transfer
}

const transferOp = await account.transfer({
  to: recipientPubKey,         // Must be PubKey object {x, y}
  amount: 100n
});

const callData = transferOp.toCalldata();
await signer.execute([callData]);
```

### Withdraw to ERC20

Convert encrypted balance back to standard ERC20:

```typescript
interface WithdrawDetails {
  to: bigint;                  // Starknet address as bigint
  amount: bigint;              // Amount to withdraw
}

// Partial withdrawal
const withdrawOp = await account.withdraw({
  to: 0x123n,                  // Address as bigint
  amount: 50n
});

// Full withdrawal (more efficient)
const withdrawAllOp = await account.withdraw_all({
  to: 0x123n                   // Address as bigint
});

const callData = withdrawOp.toCalldata();
await signer.execute([callData]);
```

### Rollover Pending

Merge pending transfers into main balance:

```typescript
// Simple rollover (no parameters needed)
const rolloverOp = await account.rollover();

const callData = rolloverOp.toCalldata();
await signer.execute([callData]);
```

---

## Operation Objects

All transaction methods return operation objects with consistent interfaces:

### Base Operation Interface

```typescript
interface IOperation {
  // Serialize to Starknet call data (returns single Call)
  toCalldata(): Call;
  
}
```

---

## Audit Features

### Ex-Post Proving

Generate proofs for completed transactions:

```typescript
// Generate proof for specific transfer
const exPostProof = account.generateExPost(
  disclosurePartyPubkey,       // Who should see the amount
  transferCiphertext           // Original transfer ciphertext
);

// Verify ex-post proof and extract amount
const disclosedAmount = account.verifyExPost(exPostProof);
console.log(`Transfer amount: ${disclosedAmount}`);
```

### Auditor Operations

```typescript
// Create auditor account (with global auditor key)
const auditor = new Account(auditorSecret, tongoAddress);

// Decrypt any user's audit balance
const userAuditBalance = await contract.get_audit(userPubkey);
const amount = auditor.decryptCipherBalance(userAuditBalance);
console.log(`User balance: ${amount}`);
```

---

## Advanced Features

### Batch Operations

```typescript
// Execute multiple operations in sequence
const fundOp = await account.fund({ amount: 1000n });
const transferOp = await account.transfer({ to: recipient, amount: 100n });

// Combine call data for atomic execution
const callData = [fundOp.toCalldata(), transferOp.toCalldata()];
await signer.execute(callData);
```

### Custom Providers

```typescript
import { RpcProvider } from 'starknet';

// Use custom RPC endpoint
const provider = new RpcProvider({
  nodeUrl: 'https://custom-starknet-node.com'
});

const account = new Account(secret, tongoAddress, provider);
```

## Key Types

```typescript
interface CipherBalance {
  L: ProjectivePoint;   // Left component (commitment)
  R: ProjectivePoint;   // Right component (encryption)
}

interface AccountState {
  balance: CipherBalance;
  pending: CipherBalance;
  audit: CipherBalance;
  ae_balance: AEHint;
  ae_audit_balance: AEHint;
  nonce: bigint;
}

interface PubKey {
  x: bigint;
  y: bigint;
}

interface Call {
  contractAddress: string;
  entrypoint: string;
  calldata: bigint[];
}
```

The Tongo SDK provides essential functionality for building confidential payment applications on Starknet. All cryptographic operations are handled internally, allowing developers to focus on application logic.