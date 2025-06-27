---
title: "Introduction"
weight: 1
bookToC: true
---

# Introduction to Tongo

Tongo is a **confidential payment system** for ERC20 tokens on Starknet, providing privacy-preserving transactions while maintaining auditability and compliance features. Built on ElGamal encryption and zero-knowledge proofs, Tongo enables users to transact with hidden amounts while preserving the ability to verify transaction validity.

## What Makes Tongo Different

### No Trusted Setup
Unlike many ZK systems (Zcash, Tornado Cash), Tongo requires **no trusted ceremony**. All cryptography is built on the discrete logarithm assumption over the Stark curve, with no hidden trapdoors or setup parameters.

### Native Starknet Integration
Tongo leverages Starknet's native elliptic curve operations, making verification extremely efficient (~120K Cairo steps per transfer) compared to other privacy solutions that require expensive proof verification.

### Flexible Compliance
The protocol supports multiple compliance models:
- **Global auditor**: All transactions encrypted for regulatory oversight
- **Selective disclosure**: Optional viewing keys per transaction
- **Ex-post proving**: Retroactive transaction disclosure without revealing keys

## How It Works

### 1. Key Generation
Each user generates a keypair {{< katex >}}(x, y = g^x){{< /katex >}} where {{< katex >}}g{{< /katex >}} is the Stark curve generator. The public key {{< katex >}}y{{< /katex >}} serves as their account identifier.

### 2. Encrypted Balances
Balances are stored as ElGamal ciphertexts:
$$\text{Enc}[y](b, r) = (g^b y^r, g^r)$$

The encryption is **additively homomorphic**, allowing balance updates without decryption.

### 3. Zero-Knowledge Proofs
All operations require proofs built from three primitives:
- **POE (Proof of Exponent)**: Prove knowledge of discrete logs
- **PED (Pedersen)**: Prove commitment correctness  
- **RAN (Range)**: Prove values are in valid ranges

### 4. Transaction Flow

**Fund** → **Transfer** → **Rollover** → **Withdraw**

1. **Fund**: Convert ERC20 to encrypted balance
2. **Transfer**: Send hidden amounts with ZK proofs  
3. **Rollover**: Claim pending incoming transfers
4. **Withdraw**: Convert back to standard ERC20

## Core Operations

### Funding
Convert standard ERC20 tokens to encrypted balances:
```typescript
const fundOp = await account.fund({ amount: 1000n });
await signer.execute([fundOp.approve!, fundOp.toCallData()]);
```

### Transfers
Send hidden amounts to other users:
```typescript
const transferOp = account.transfer({
    to: recipientPubKey,
    amount: 100n,
    viewKeys: [auditorKey] // Optional
});
```

### Withdrawals
Convert back to standard ERC20 tokens:
```typescript
const withdrawOp = account.withdraw({
    to: starknetAddress,
    amount: 50n
});
```

## Security Model

### Privacy Guarantees
- **Balance confidentiality**: Only key holders (account owners and auditors) can decrypt balances
- **Transaction privacy**: Transfer amounts are hidden from public view
- **Unlinkability**: Transactions don't reveal sender-receiver relationships

### Integrity Guarantees  
- **No double spending**: Range proofs prevent negative balances
- **Conservation**: Total supply is preserved (no money creation)
- **Authenticity**: Only key owners can spend their balances

## Use Cases

### Individual Privacy
- **Personal transactions**: Hide payment amounts from public view
- **Salary payments**: Confidential payroll systems
- **Merchant payments**: Private commercial transactions

### Institutional Compliance
- **Regulated environments**: Auditor oversight with user privacy
- **Cross-border payments**: Compliance with multiple jurisdictions
- **Corporate treasury**: Internal transfers with audit trails

### DeFi Integration
- **Private AMM trading**: Hidden trade sizes
- **Confidential lending**: Private collateral amounts
- **DAO treasuries**: Private governance token distributions

## Roadmap

### Short Term
- **Bulletproof integration**: More efficient range proofs
- **Mobile optimization**: Faster proof generation on mobile
- **Multi-token support**: Support multiple ERC20s in one contract

### Medium Term
- **Advanced compliance**: Threshold auditing, time-locked viewing
- **DeFi primitives**: Native AMM, lending protocols


## Getting Started

1. **[Install the SDK](/docs/sdk)** - TypeScript library for application integration
2. **[Understand Encryption](/docs/encryption)** - Learn the cryptographic foundations
3. **[Explore Transfers](/docs/transfer)** - Deep dive into the core protocol
4. **[Study Transfer Details](/docs/transfer)** - Understand the verification system
5. **[Configure Auditing](/docs/auditor)** - Set up compliance features

For developers ready to start building, jump directly to the [SDK documentation](/docs/sdk) and begin with the Quick Start examples.
