# SHE Cryptography Library

The **Starknet Homomorphic Encryption (SHE)** library provides low-level cryptographic primitives for proving and verification of Sigma protocols over the Stark elliptic curve. This includes Zero-Knowledge proof of ElGamal encryption. 

SHE is the cryptographic foundation of Tongo but its building blocks can be used in other products that rellies on basic Sigma Protocols.

## Package Information

- **Package**: `@fatsolutions/she`
- **Version**: 0.4.0
- **License**: Apache-2.0
- **Repository**: [github.com/fatlabsxyz/tongo-docs](https://github.com/fatlabsxyz/tongo-docs)

## Protocols

Implemented zero-knowledge proofs:
- **POE**: Proof of Exponent (knowledge of discrete log)
- **POE2**: Proof of double exponent
- **POEN**: Proof of N exponents
- **Bit**: Proof that committed value is 0 or 1
- **Range**: Proof that value is in [0, 2^n)
- **ElGamal** Proof that a encryption is a correct ElGamal encryption
- **SameEncryption**: Proof that two ElGamal encryptions encrypt the same value
