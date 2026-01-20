# Tongo Documentation (Under Construction)

Welcome to the official Tongo documentation. Tongo is a confidential payment system for ERC20 tokens on Starknet, providing privacy-preserving transactions while maintaining auditability and compliance features. Tongo is heavily based on [this paper](https://eprint.iacr.org/2019/191).

> **Waring** This documentation is under costruction. It is mostly done but we have to come back to round some rough edges. Use it wisely.
## What is Tongo?

Tongo wraps any ERC20 token with ElGamal encryption, enabling private transfers while maintaining full auditability. Built on zero-knowledge proofs and homomorphic encryption over the Stark curve, Tongo enables users to transact with hidden amounts while preserving the ability to verify transaction validity.

**Key Features:**
- **No Trusted Setup**: Built entirely on elliptic curve cryptography
- **Hidden Amounts**: All transfer amounts are encrypted
- **Flexible Compliance**: Global auditor support and selective disclosure

## Quick Links

- **GitHub**: [github.com/fatlabsxyz/tongo-docs](https://github.com/fatlabsxyz/tongo-docs)
- **npm Package**: [@fatsolutions/tongo-sdk](https://www.npmjs.com/package/@fatsolutions/tongo-sdk)
- **Website**: [tongo.cash](https://tongo.cash)

## Getting Started

If you're a developer looking to integrate Tongo into your application, start with the [SDK Quick Start](sdk/quick-start.md).

If you want to understand the protocol and cryptography, begin with the [Protocol Introduction](protocol/introduction.md).
