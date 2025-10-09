# Starknet Homomorphic Encryption (SHE)

The SHE library provides low-level cryptographic primitives for ElGamal encryption and zero-knowledge proof generation over the Stark elliptic curve. It serves as the foundation for all cryptographic operations in Tongo.

> **Note**: The SHE library is written in Rust and used internally by the Tongo SDK. This documentation covers the conceptual API that the TypeScript SDK wraps through the `@fatsolutions/she` package.

## Core Concepts

### Elliptic Curve Setup

SHE operates over the Stark curve with carefully chosen generators:

```typescript
import { GENERATOR as g } from '@fatsolutions/she';

// Primary generator (standard Stark curve generator)
const g: ProjectivePoint;

// Secondary generator h is derived internally for Pedersen commitments
```

## ElGamal Encryption

### Basic Encryption

Encrypt a balance amount:

```typescript
import { cipherBalance } from '@fatsolutions/she';

// Internally used by the SDK
// Creates ciphertext (L, R) = (g^amount * pubkey^randomness, g^randomness)
```

### Decryption

```typescript
import { decipherBalance } from '@fatsolutions/she';

// Decrypt a ciphertext using Baby-step Giant-step algorithm
function decipherBalance(
  secretKey: bigint,
  L: ProjectivePoint,
  R: ProjectivePoint
): bigint;
```

### Homomorphic Operations

ElGamal ciphertexts support additive homomorphism, allowing encrypted balance updates without decryption.

## Zero-Knowledge Proofs

### Proof of Fund

Proves knowledge of private key for funding operations:

```typescript
import { proveFund } from '@fatsolutions/she';

function proveFund(
  secret: bigint,
  amount: bigint,
  currentBalance: bigint,
  currentCipher: CipherBalance,
  nonce: bigint
): { inputs: FundInputs; proof: ProofOfFund; newBalance: CipherBalance };
```

### Transfer Proofs

Complex proofs for confidential transfers:

```typescript
import { proveTransfer } from '@fatsolutions/she';

function proveTransfer(
  senderSecret: bigint,
  receiverPubkey: ProjectivePoint,
  currentBalance: bigint,
  transferAmount: bigint,
  currentCipher: CipherBalance,
  nonce: bigint
): { inputs: TransferInputs; proof: ProofOfTransfer; newBalance: CipherBalance };
```

### Withdrawal Proofs

```typescript
import { proveWithdraw } from '@fatsolutions/she';

function proveWithdraw(
  secret: bigint,
  currentBalance: bigint,
  withdrawAmount: bigint,
  recipientAddress: bigint,
  currentCipher: CipherBalance,
  nonce: bigint
): { inputs: WithdrawInputs; proof: ProofOfWithdraw; newBalance: CipherBalance };
```

### Rollover Proofs

```typescript
import { proveRollover } from '@fatsolutions/she';

function proveRollover(
  secret: bigint,
  nonce: bigint
): { inputs: RolloverInputs; proof: ProofOfRollover };
```

### Ragequit Proofs

```typescript
import { proveRagequit } from '@fatsolutions/she';

function proveRagequit(
  secret: bigint,
  currentCipher: CipherBalance,
  nonce: bigint,
  recipientAddress: bigint,
  balance: bigint
): { inputs: RagequitInputs; proof: ProofOfRagequit; newBalance: CipherBalance };
```

## Audit System

### Audit Proofs

Generate proofs for auditor encryption:

```typescript
import { prove_audit, verify_audit } from '@fatsolutions/she';

function prove_audit(
  senderSecret: bigint,
  amount: bigint,
  cipherBalance: CipherBalance,
  auditorPubkey: ProjectivePoint
): { inputs: AuditInputs; proof: ProofOfAudit };
```

### Balance Assertion

Verify a hint matches an encrypted balance:

```typescript
import { assertBalance } from '@fatsolutions/she';

function assertBalance(
  secretKey: bigint,
  hint: bigint,
  L: ProjectivePoint,
  R: ProjectivePoint
): boolean;
```

## Type Definitions

```typescript
interface CipherBalance {
  L: ProjectivePoint;  // g^amount * pubkey^randomness
  R: ProjectivePoint;  // g^randomness
}

interface ProofOfFund {
  Ax: ProjectivePoint;
  sx: bigint;
}

interface ProofOfTransfer {
  // Complex structure with multiple sub-proofs
  // See Transfer Protocol documentation
}

interface ProofOfWithdraw {
  // See Withdrawal documentation
}

interface ProofOfRollover {
  Ay: ProjectivePoint;
  sy: bigint;
}
```

## Usage in Tongo SDK

The Tongo SDK wraps all SHE functionality, so you typically don't need to use SHE directly. The SDK's `Account` class automatically:

- Generates proofs for all operations
- Handles encryption and decryption
- Manages nonces and challenges
- Verifies balance hints

For most applications, use the [Tongo SDK](../sdk/README.md) instead of SHE directly.

## Performance

Approximate performance on modern hardware:

| Operation | Time |
|-----------|------|
| Key generation | < 1ms |
| Encryption | < 1ms |
| Decryption (with hint) | < 1ms |
| Decryption (brute-force, 1M range) | ~100ms |
| Fund proof | ~50ms |
| Transfer proof | 2-3s |
| Withdraw proof | 1-2s |

The SHE library provides the cryptographic foundation for all Tongo operations, implementing state-of-the-art zero-knowledge proofs with efficient elliptic curve arithmetic.
