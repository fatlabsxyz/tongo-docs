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
const fundOperation = account.fund(1000n, { approval: true });

// Get serialized transaction data
const callData = fundOperation.toCallData();

// Execute with any Starknet signer
const tx = await signer.execute([callData]);
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

---

## Advanced Features

### Custom Proving

For advanced use cases, you can generate proofs manually:

```typescript
import { SHE } from "tongo-sdk";

// Generate proof of exponent
const poeProof = SHE.proveExponent({
    generator: g,
    publicKey: y,
    secret: x
});

// Generate Pedersen commitment proof
const pedProof = SHE.provePedersen({
    generators: [g, h],
    commitment: V,
    value: b,
    randomness: r
});

// Generate range proof
const rangeProof = SHE.proveRange({
    commitment: V,
    value: b,
    randomness: r,
    bitLength: 32
});
```

### Key Derivation

```typescript
import { utils } from "tongo-sdk";

// Generate key from mnemonic
const secret = utils.keyFromMnemonic(
    "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"
);

// Generate key from seed
const secret2 = utils.keyFromSeed(new Uint8Array(32));

// Convert between formats
const pubkey = utils.publicKeyFromSecret(secret);
const address = utils.addressFromPubkey(pubkey);
```

### Balance Recovery

```typescript
// Fast balance recovery using symmetric encryption
const symKey = account.deriveSymmetricKey();
const encryptedBalance = await account.getSymmetricBalance();
const balance = utils.decryptSymmetric(encryptedBalance, symKey);

// Store encrypted balance for later recovery
await account.storeSymmetricBalance(balance);
```

---

## Integration Examples

### Wallet Integration

```typescript
class TongoWallet {
    private account: Account;
    
    constructor(secret: bigint, tongoAddress: string) {
        this.account = new Account(secret, tongoAddress);
    }
    
    async getBalance(): Promise<bigint> {
        return this.account.decryptBalance(0n, 2n ** 32n);
    }
    
    async send(to: string, amount: bigint): Promise<string> {
        const operation = this.account.transfer({ to, amount });
        const tx = await this.signer.execute(operation.toCallData());
        return tx.transaction_hash;
    }
    
    async receive(): Promise<void> {
        const rollover = this.account.rollover();
        await this.signer.execute(rollover.toCallData());
    }
}
```

### Relayer Service

```typescript
class TongoRelayer {
    constructor(private relayerAccount: Account) {}
    
    async relayTransfer(
        userTransfer: TransferOperation,
        feeAmount: bigint
    ): Promise<string> {
        // Verify user's transfer is valid
        const isValid = await this.validateTransfer(userTransfer);
        if (!isValid) throw new Error("Invalid transfer");
        
        // Create relayer fee transfer
        const feeTransfer = this.relayerAccount.transfer({
            to: this.relayerAccount.publicKey(),
            amount: feeAmount
        });
        
        // Bundle transfers
        const calls = [
            ...userTransfer.toCallData(),
            ...feeTransfer.toCallData()
        ];
        
        // Execute as relayer
        const tx = await this.relayerSigner.execute(calls);
        return tx.transaction_hash;
    }
}
```

### DeFi Integration

```typescript
class TongoDeFi {
    constructor(
        private tongoAddress: string,
        private poolAddress: string
    ) {}
    
    async addLiquidity(
        account: Account,
        tongoAmount: bigint,
        tokenAmount: bigint
    ): Promise<string> {
        // Withdraw Tongo tokens to regular ERC20
        const withdraw = account.withdraw({
            to: this.poolAddress,
            amount: tongoAmount
        });
        
        // Add liquidity to AMM pool
        const addLiquidity = this.createAddLiquidityCall(
            tongoAmount,
            tokenAmount
        );
        
        // Execute atomically
        const calls = [
            ...withdraw.toCallData(),
            addLiquidity
        ];
        
        const tx = await this.signer.execute(calls);
        return tx.transaction_hash;
    }
}
```

---

## Error Handling

The SDK provides comprehensive error types:

```typescript
import { TongoError, ProofError, EncryptionError } from "tongo-sdk";

try {
    const transfer = account.transfer({ to: recipient, amount: 1000n });
} catch (error) {
    if (error instanceof ProofError) {
        console.error("Failed to generate proof:", error.message);
    } else if (error instanceof EncryptionError) {
        console.error("Encryption failed:", error.message);
    } else if (error instanceof TongoError) {
        console.error("Tongo operation failed:", error.message);
    }
}
```

## Performance Considerations

### Proof Generation
- Range proofs are the most expensive component (~2-5 seconds)
- Consider using web workers for proof generation
- Cache public parameters to reduce initialization time

### Balance Decryption  
- Brute force decryption time scales with balance range
- Use reasonable bounds based on expected balance size
- Consider symmetric balance storage for instant recovery

### Memory Usage
- Each account maintains minimal state (~1KB)
- Proof generation requires temporary memory (~10MB)
- Consider cleanup after proof generation in resource-constrained environments

---

## TypeScript Types

```typescript
// Core types
type PubKey = [bigint, bigint];
type StarkPoint = [bigint, bigint];

interface CipherBalance {
    CL: StarkPoint;
    CR: StarkPoint;
}

interface ProofOfOwnership {
    A: StarkPoint;
    s: bigint;
}

interface ProofOfTransfer {
    ownership: ProofOfOwnership;
    blinding: ProofOfOwnership;
    senderPed: ProofOfPedersen;
    receiverPed: ProofOfPedersen;
    auditorPed?: ProofOfPedersen;
    amountRange: ProofOfRange;
    remainingRange: ProofOfRange;
}

// Operation result types
interface Call {
    contractAddress: string;
    entrypoint: string;
    calldata: bigint[];
}
```

For complete API documentation and examples, visit the [GitHub repository](https://github.com/fatlabsxyz/tongo-sdk).