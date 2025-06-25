---
title: "SHE Library"
weight: 8
bookToC: true
---

# Starknet Homomorphic Encryption (SHE)

The SHE library (`she-js`) provides low-level cryptographic primitives for ElGamal encryption and zero-knowledge proof generation over the Stark elliptic curve. It serves as the foundation for all cryptographic operations in Tongo.

## Installation

```bash
npm install she-js
```

## Core Concepts

### Elliptic Curve Setup

SHE operates over the Stark curve with carefully chosen generators:

```typescript
import { g, h, view, auditor_key } from 'she-js';

// Primary generator (standard Stark curve generator)
const g: ProjectivePoint;

// Secondary generator (derived from π digits - nothing up my sleeve)
const h: ProjectivePoint;

// Global auditor public key
const view: ProjectivePoint;

// Global auditor secret key (for testing)
const auditor_key: bigint;
```

---

## ElGamal Encryption

### Basic Encryption

```typescript
import { cipher_balance, decipher_balance } from 'she-js';

// Encrypt a balance amount
function cipher_balance(
  amount: bigint,           // Amount to encrypt
  publicKey: ProjectivePoint, // Recipient's public key
  randomness?: bigint       // Optional blinding factor
): CipherBalance;

// Example
const pubkey = g.multiply(secretKey);
const encrypted = cipher_balance(1000n, pubkey);
console.log(encrypted); // { L: Point, R: Point }
```

### Decryption

```typescript
// Decrypt a ciphertext (requires brute force for amount)
function decipher_balance(
  cipher: CipherBalance,
  secretKey: bigint,
  maxAmount: bigint = 1000000n
): bigint;

// Example
const amount = decipher_balance(encrypted, secretKey, 1000000n);
console.log(amount); // 1000n
```

### Homomorphic Operations

```typescript
// Add two encrypted balances
function cipher_add(
  cipher1: CipherBalance,
  cipher2: CipherBalance
): CipherBalance;

// Subtract encrypted balances  
function cipher_subtract(
  cipher1: CipherBalance,
  cipher2: CipherBalance
): CipherBalance;

// Example: encrypted arithmetic
const encrypted1 = cipher_balance(100n, pubkey);
const encrypted2 = cipher_balance(50n, pubkey);
const sum = cipher_add(encrypted1, encrypted2);
const result = decipher_balance(sum, secretKey); // 150n
```

---

## Zero-Knowledge Proofs

### Proof of Exponent (POE)

Proves knowledge of discrete logarithm $x$ such that $y = g^x$:

```typescript
import { prove_fund, verify_fund } from 'she-js';

// Generate proof of ownership for funding
function prove_fund(
  secret: bigint,           // Private key
  publicKey: ProjectivePoint, // Corresponding public key
  amount: bigint,           // Amount being funded
  nonce: bigint            // Replay protection
): ProofOfOwnership;

// Verify the proof
function verify_fund(
  proof: ProofOfOwnership,
  publicKey: ProjectivePoint,
  amount: bigint,
  nonce: bigint
): boolean;

// Example
const secret = 12345n;
const pubkey = g.multiply(secret);
const proof = prove_fund(secret, pubkey, 1000n, 1n);
const valid = verify_fund(proof, pubkey, 1000n, 1n); // true
```

### Transfer Proofs

Complex proofs for confidential transfers:

```typescript
import { prove_transfer, verify_transfer } from 'she-js';

function prove_transfer(
  senderSecret: bigint,
  senderPubkey: ProjectivePoint,
  receiverPubkey: ProjectivePoint,
  amount: bigint,
  currentBalance: bigint,
  randomness: bigint,
  nonce: bigint
): ProofOfTransfer;

function verify_transfer(
  proof: ProofOfTransfer,
  senderPubkey: ProjectivePoint,
  receiverPubkey: ProjectivePoint,
  senderCipher: CipherBalance,
  receiverCipher: CipherBalance,
  auditCipher: CipherBalance,
  remainingCipher: CipherBalance,
  nonce: bigint
): boolean;
```

### Range Proofs

Proves values lie in valid ranges using bit decomposition:

```typescript
import { prove_range, verify_range } from 'she-js';

function prove_range(
  value: bigint,
  randomness: bigint,
  commitment: ProjectivePoint,
  bitLength: number = 32
): ProofOfRange;

function verify_range(
  proof: ProofOfRange,
  commitment: ProjectivePoint,
  bitLength: number = 32
): boolean;

// Example: prove amount is in [0, 2^32)
const value = 1000n;
const r = random_scalar();
const commitment = g.multiply(value).add(h.multiply(r));
const proof = prove_range(value, r, commitment);
const valid = verify_range(proof, commitment); // true
```

### Withdrawal Proofs

```typescript
import { prove_withdraw, verify_withdraw, prove_withdraw_all, verify_withdraw_all } from 'she-js';

// Partial withdrawal
function prove_withdraw(
  secret: bigint,
  currentBalance: bigint,
  withdrawAmount: bigint,
  randomness: bigint,
  nonce: bigint
): ProofOfWithdraw;

// Full withdrawal (simpler proof)
function prove_withdraw_all(
  secret: bigint,
  balance: CipherBalance,
  amount: bigint,
  nonce: bigint
): ProofOfWithdrawAll;
```

---

## Audit System

### Ex-Post Proofs

Generate proofs for retroactive transaction disclosure:

```typescript
import { prove_expost, verify_expost } from 'she-js';

function prove_expost(
  senderSecret: bigint,
  amount: bigint,
  randomness: bigint,
  originalCipher: CipherBalance,
  disclosureKey: ProjectivePoint
): ExPostProof;

function verify_expost(
  proof: ExPostProof,
  senderPubkey: ProjectivePoint,
  disclosureKey: ProjectivePoint,
  originalCipher: CipherBalance,
  disclosedCipher: CipherBalance,
  disclosureAmount: CipherBalance
): bigint; // Returns disclosed amount

// Example: prove transfer amount to auditor
const transferCipher = { L: Point1, R: Point2 };
const auditorKey = g.multiply(auditorSecret);
const proof = prove_expost(senderSecret, amount, r, transferCipher, auditorKey);
const disclosedAmount = verify_expost(proof, senderPubkey, auditorKey, transferCipher, newCipher, amountCipher);
```

---

## Utility Functions

### Key Management

```typescript
import { random_scalar, point_from_hex, point_to_hex } from 'she-js';

// Generate cryptographically secure random scalar
const secret = random_scalar();

// Derive public key
const pubkey = g.multiply(secret);

// Serialize/deserialize points
const hexString = point_to_hex(pubkey);
const recovered = point_from_hex(hexString);
```

### Hash Functions

```typescript
import { hash_to_scalar, hash_points } from 'she-js';

// Hash arbitrary data to scalar (for challenges)
const challenge = hash_to_scalar([point1, point2, nonce]);

// Hash multiple points together
const combined = hash_points([pubkey1, pubkey2, commitment]);
```

---

## Advanced Features

### Batch Operations

```typescript
// Encrypt multiple amounts efficiently
function cipher_batch(
  amounts: bigint[],
  publicKeys: ProjectivePoint[],
  randomness?: bigint[]
): CipherBalance[];

// Verify multiple proofs together
function verify_batch_fund(
  proofs: ProofOfOwnership[],
  publicKeys: ProjectivePoint[],
  amounts: bigint[],
  nonces: bigint[]
): boolean;
```

### Custom Generators

```typescript
// Use custom generators for specific applications
import { SHE } from 'she-js';

const customSHE = new SHE({
  generator: customG,
  secondGenerator: customH,
  curve: 'stark' // or custom curve parameters
});
```

---

## Performance Considerations

### Optimization Tips

```typescript
// Cache expensive computations
const precomputed = {
  gTable: g.precomputeWindow(8),    // Precompute for faster scalar multiplication
  hTable: h.precomputeWindow(8)
};

// Use batch verification when possible
const allValid = verify_batch_fund(proofs, pubkeys, amounts, nonces);

// Limit brute force range for decryption
const amount = decipher_balance(cipher, secret, 100000n); // Reasonable upper bound
```

### Memory Management

```typescript
// Clean up large proof objects after use
function cleanupProof(proof: ProofOfTransfer) {
  // Proof objects can be large (~32KB)
  // Consider cleanup in memory-constrained environments
  proof = null;
}
```

---

## Error Handling

```typescript
import { SHEError, ProofError, DecryptionError } from 'she-js';

try {
  const proof = prove_transfer(/* ... */);
} catch (error) {
  if (error instanceof ProofError) {
    console.error('Proof generation failed:', error.message);
  } else if (error instanceof DecryptionError) {
    console.error('Decryption failed:', error.message);
  }
}
```

---

## Type Definitions

```typescript
interface CipherBalance {
  L: ProjectivePoint;  // g^amount * pubkey^randomness
  R: ProjectivePoint;  // g^randomness
}

interface ProofOfOwnership {
  A: ProjectivePoint;  // Commitment
  s: bigint;          // Response
}

interface ProofOfRange {
  commitments: ProjectivePoint[];     // Bit commitments
  responses: ProofOfOwnership[];      // OR proofs for each bit
  challenge: bigint;                  // Fiat-Shamir challenge
}

interface ExPostProof {
  ownership: ProofOfOwnership;        // Proof of sender key
  consistency: ProofOfOwnership;      // Proof of amount consistency
  senderCipher: CipherBalance;       // New sender encryption
  disclosureCipher: CipherBalance;   // Disclosure party encryption
}
```

The SHE library provides the cryptographic foundation for all Tongo operations, implementing state-of-the-art zero-knowledge proofs with efficient elliptic curve arithmetic.