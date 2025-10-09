# Tongo Documentation

Welcome to the official Tongo documentation. Tongo is a confidential payment system for ERC20 tokens on Starknet, providing privacy-preserving transactions while maintaining auditability and compliance features.

## What is Tongo?

Tongo wraps any ERC20 token with ElGamal encryption, enabling private transfers while maintaining full auditability. Built on zero-knowledge proofs and homomorphic encryption over the Stark curve, Tongo enables users to transact with hidden amounts while preserving the ability to verify transaction validity.

**Key Features:**
- **No Trusted Setup**: Built entirely on elliptic curve cryptography
- **Hidden Amounts**: All transfer amounts are encrypted
- **Native Starknet Integration**: Leverages Starknet's elliptic curve operations
- **Flexible Compliance**: Global auditor support and selective disclosure

## Documentation Structure

### [Protocol Documentation](protocol/introduction.md)
Learn about the underlying protocol, cryptography, and how Tongo works:
- Introduction to confidential payments
- Encryption system and ZK proofs
- Transfer protocol
- Auditing and compliance
- Cairo contracts

### [SDK Documentation](sdk/README.md)
Get started building with the Tongo TypeScript SDK:
- Installation and quick start
- Core concepts and architecture
- Step-by-step guides
- Complete API reference
- Real-world examples

## Quick Links

- **GitHub**: [github.com/fatlabsxyz/tongo](https://github.com/fatlabsxyz/tongo)
- **npm Package**: [@fatsolutions/tongo-sdk](https://www.npmjs.com/package/@fatsolutions/tongo-sdk)
- **Website**: [tongo.cash](https://tongo.cash)

## Getting Started

If you're a developer looking to integrate Tongo into your application, start with the [SDK Quick Start](sdk/quick-start.md).

If you want to understand the protocol and cryptography, begin with the [Protocol Introduction](protocol/introduction.md).
