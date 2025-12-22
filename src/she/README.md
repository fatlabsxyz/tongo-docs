# SHE Cryptography Library

The **Starknet Homomorphic Encryption (SHE)** library provides low-level cryptographic primitives for ElGamal encryption and zero-knowledge proof systems over the Stark elliptic curve.

## Overview

SHE is the cryptographic foundation of Tongo, implementing:

- **ElGamal Encryption**: Additively homomorphic encryption over elliptic curves
- **Zero-Knowledge Proofs**: Sigma protocols for proving various statements
- **Range Proofs**: Proving values are within valid ranges using bit decomposition
- **Fiat-Shamir Transform**: Non-interactive proofs using Poseidon hash

## Package Information

- **Package**: `@fatsolutions/she`
- **Version**: 0.1.0
- **License**: Apache-2.0
- **Repository**: [github.com/fatlabsxyz/tongo-docs](https://github.com/fatlabsxyz/tongo-docs)

## Key Features

### Homomorphic Encryption

ElGamal encryption over the Stark curve enables:
- Encrypted balance storage
- Homomorphic addition and subtraction
- Privacy-preserving balance updates

### Sigma Protocols

Implemented zero-knowledge proofs:
- **POE**: Proof of Exponent (knowledge of discrete log)
- **POE2**: Proof of double exponent
- **POEN**: Proof of N exponents
- **Bit**: Proof that committed value is 0 or 1
- **Range**: Proof that value is in [0, 2^n)
- **SameEncryption**: Proof that two ciphertexts encrypt the same value

### Fiat-Shamir Transform

All proofs are non-interactive using:
- Poseidon hash function (Starknet-native)
- Challenge computation from commitment points
- Prefix-based proof binding

## Core Protocols

### 1. ElGamal Encryption

Proves that `(L, R) = (g^b * y^r, g^r)` is a well-formed ElGamal ciphertext.

**Protocol**: Coupled POE + POE2

**Use Case**: Funding operations, proving correct encryption

### 2. Proof of Exponent (POE)

Proves knowledge of `x` such that `y = g^x`.

**Protocol**: Standard Schnorr protocol

**Use Case**: Ownership proofs, authentication

### 3. Bit Proofs

Proves that a commitment `V = g^b * h^r` has `b ∈ {0, 1}`.

**Protocol**: OR proof using simulated POE

**Use Case**: Range proof building blocks

### 4. Range Proofs

Proves that a value `b` is in `[0, 2^n)` using bit decomposition.

**Protocol**: Composition of n bit proofs

**Use Case**: Preventing negative balances, overflow protection

### 5. Same Encryption

Proves two ciphertexts `(L1, R1)` and `(L2, R2)` encrypt the same amount for different public keys.

**Protocol**: Two coupled ElGamal proofs with shared message

**Use Case**: Multi-party transfers, auditor encryption

## Cryptographic Assumptions

SHE's security relies on:

- **Discrete Logarithm Problem (DLP)**: Hard to find `x` given `g^x`
- **Computational Diffie-Hellman**: Hard to compute `g^(xy)` from `g^x` and `g^y`
- **Stark Curve Security**: 256-bit security level

## Performance

Typical performance on modern hardware:

| Operation | Time |
|-----------|------|
| Random scalar generation | < 1ms |
| Point multiplication | < 1ms |
| POE proof generation | ~10ms |
| POE verification | ~1ms |
| Bit proof generation | ~20ms |
| Range proof (32-bit) | ~500ms |
| ElGamal encryption | < 1ms |
| ElGamal decryption (brute force) | 1-100ms |

## Next Steps

- [Learn about ElGamal Encryption](elgamal.md)
- [Understand Zero-Knowledge Proofs](proofs.md)
- [Explore POE Protocol](poe.md)
- [Study Range Proofs](range.md)
