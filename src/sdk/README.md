# Tongo TypeScript SDK

The Tongo TypeScript SDK provides a comprehensive interface for building confidential payment applications on Starknet. It handles key management, encryption, proof generation, and transaction serialization.

## Features

- **Simple API**: High-level methods for all Tongo operations
- **Type Safety**: Full TypeScript support with complete type definitions
- **Proof Generation**: Automatic ZK proof creation for all operations
- **Encryption Handling**: Transparent management of encrypted balances
- **Starknet Integration**: Seamless integration with Starknet wallets and providers

## Architecture

The SDK consists of two main layers:

### 1. SHE (Starknet Homomorphic Encryption)

Low-level cryptographic primitives for:
- ElGamal encryption over the Stark curve
- Zero-knowledge proof generation (POE, PED, RAN)
- Homomorphic balance operations

### 2. Tongo SDK

High-level application interface providing:
- `Account` class for managing Tongo accounts
- Operation objects for transactions (`FundOperation`, `TransferOperation`, etc.)
- State management and decryption utilities
- Event querying and transaction history

## Package Information

- **Package**: `@fatsolutions/tongo-sdk`
- **Current Version**: 1.1.2
- **License**: Apache-2.0
- **Repository**: [github.com/fatlabsxyz/tongo](https://github.com/fatlabsxyz/tongo)

## Quick Links

- [Installation](installation.md) - Install the SDK
- [Quick Start](quick-start.md) - Your first Tongo transaction
- [Core Concepts](concepts/accounts.md) - Understand the fundamentals
- [API Reference](api/account.md) - Complete API documentation
- [Examples](examples/complete-workflow.md) - Real-world code examples

## Supported Networks

The SDK works on:
- **Starknet Mainnet** - Production deployments
- **Starknet Sepolia** - Testnet for development

Deployed Tongo Contracts:
- **Mainnet**: `0x0415f2c3b16cc43856a0434ed151888a5797b6a22492ea6fd41c62dbb4df4e6c` (USDC wrapper)
- **Sepolia**: `0x028798470f0939d26aab8a3dcb144b9045fb113867ae205ad59b1b47ec904f00` (Test token)

## Prerequisites

- **Node.js**: v18 or higher
- **Starknet.js**: v7.0.0 or higher (peer dependency)
- **TypeScript**: v5.0 or higher (recommended)

## Next Steps

1. [Install the SDK](installation.md)
2. [Follow the Quick Start guide](quick-start.md)
3. [Learn about Accounts and Operations](concepts/accounts.md)
