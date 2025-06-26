---
title: "SDK Documentation"
weight: 6
bookToC: true
---

# SDK Documentation

The Tongo TypeScript SDK provides a comprehensive interface for building confidential payment applications on Starknet. It handles key management, encryption, proof generation, and transaction serialization.

## Installation

```bash
npm install tongo-sdk
# or
yarn add tongo-sdk
```

## Architecture

The SDK consists of two main components:

### Starknet Homomorphic Encryption (SHE)
Low-level cryptographic primitives for ElGamal encryption and ZK proof generation over the Stark curve.

### Tongo SDK  
High-level application interface that abstracts away cryptographic complexity and provides a clean API for wallet integrations.

---

## Quick Start

### Basic Usage

```typescript
import { Account, utils } from "tongo-sdk";

// Generate a new private key
const secret = utils.generatePrivateKey();

// Create account instance
const account = new Account(secret, "0x123...tongoContractAddress");

console.log("Public Key:", account.prettyPublicKey());
// Output: Um6QEVHZaXkii8hWzayJf6PBWrJCTuJomAst75Zmy12
```

### Fund Account

```typescript
// Fund account with 1000 tokens
const fundOperation = await account.fund({ amount: 1000n });

// Execute with any Starknet signer (includes approval + fund)
const tx = await signer.execute([fundOperation.approve!, fundOperation.toCallData()]);
await provider.waitForTransaction(tx.transaction_hash);
```

### Transfer Tokens

```typescript
// Create confidential transfer
const transferOperation = account.transfer({
    to: receiverPubKey,
    amount: 100n,
    viewKeys: [auditorPubKey] // Optional viewing keys
});

// Submit transaction
const callData = transferOperation.toCallData();
const tx = await signer.execute([callData]);
```

### Check Balance

```typescript
// Get encrypted balance
const encryptedBalance = account.balance();

// Decrypt balance (brute force in range)
const actualBalance = account.decryptBalance(0n, 1000000n);
console.log("Balance:", actualBalance);
```

---

## API Reference

### Account Class

The main abstraction for interacting with Tongo accounts.

#### Constructor

```typescript
constructor(
    secret: bigint | Uint8Array,
    tongoAddress: string,
    options?: {
        signer?: Signer,
        provider?: Provider
    }
)
```

**Parameters:**
- `secret`: Private key as bigint or byte array
- `tongoAddress`: Deployed Tongo contract address
- `options.signer`: Optional Starknet signer for automatic transaction submission
- `options.provider`: Optional Starknet provider for balance queries

#### Key Management

```typescript
// Get public key as coordinate pair
publicKey(): [bigint, bigint]

// Get base58-encoded public key string  
prettyPublicKey(): string

// Get current account nonce
nonce(): Promise<number>
```

#### Balance Operations

```typescript
// Get encrypted balance from contract
balance(): Promise<CipherBalance>

// Get encrypted pending balance
pending(): Promise<CipherBalance>

// Decrypt balance in specified range
decryptBalance(lowBound: bigint, highBound: bigint): Promise<bigint>

// Decrypt pending balance in specified range  
decryptPending(lowBound: bigint, highBound: bigint): Promise<bigint>
```

#### Transaction Operations

```typescript
// Fund account with ERC20 tokens
fund(
    amount: bigint, 
    options: { approval: boolean }
): FundOperation

// Transfer tokens to another account
transfer(params: {
    to: PubKey | string,
    amount: bigint,
    viewKeys?: (PubKey | string)[]
}, options?: {
    pending?: [bigint, bigint] // Manual pending balance override
}): TransferOperation

// Transfer with relayer fee
transferWithFee(params: {
    to: PubKey | string,
    amount: bigint,
    feeReceiver: PubKey | string,
    feeAmount: bigint,
    viewKeys?: (PubKey | string)[]
}): TransferWithFeeOperation

// Merge pending transfers into main balance
rollover(): RolloverOperation

// Withdraw tokens back to ERC20
withdraw(params: {
    to: string, // Starknet address
    amount: bigint
}): WithdrawOperation
```

---

## Operation Objects

All transaction methods return operation objects that can be serialized to transaction data:

### FundOperation

```typescript
interface FundOperation {
    // Serialize to Starknet transaction calls
    toCallData(): Call[]
    
    // Get proof components
    getProof(): ProofOfOwnership
    
    // Get operation metadata
    getMetadata(): {
        amount: bigint,
        recipient: PubKey
    }
}
```

### TransferOperation

```typescript
interface TransferOperation {
    // Serialize to Starknet transaction calls
    toCallData(): Call[]
    
    // Get all proof components
    getProof(): ProofOfTransfer
    
    // Get encrypted components
    getCiphertexts(): {
        sender: CipherBalance,
        receiver: CipherBalance,
        auditor?: CipherBalance,
        viewKeys: Array<{ pubkey: PubKey, cipher: StarkPoint }>
    }
    
    // Get operation metadata
    getMetadata(): {
        from: PubKey,
        to: PubKey,
        amount: bigint,
        viewKeys: PubKey[]
    }
}
```

