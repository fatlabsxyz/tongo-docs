# Tongo TypeScript SDK

The Tongo TypeScript SDK provides a comprehensive interface for building confidential payment applications on Starknet. It handles key management, encryption, proof generation, and transaction serialization.

## Features

- **Simple API**: High-level methods for all Tongo operations
- **Type Safety**: Full TypeScript support with complete type definitions
- **Proof Generation**: Automatic ZK proof creation for all operations
- **Encryption Handling**: Transparent management of encrypted balances
- **Starknet Integration**: Seamless integration with Starknet wallets and providers

## Package Information

- **Package**: `@fatsolutions/tongo-sdk`
- **Current Version**: 1.2.0
- **License**: Apache-2.0
- **Repository**: [github.com/fatlabsxyz/tongo-docs](https://github.com/fatlabsxyz/tongo-docs)


## Supported Networks

The SDK works on:
- **Starknet Mainnet** - Production deployments
- **Starknet Sepolia** - Testnet for development

Deployed Tongo Contracts:
- **Mainnet**: `0x0415f2c3b16cc43856a0434ed151888a5797b6a22492ea6fd41c62dbb4df4e6c` (USDC wrapper)
- **Sepolia**: `0x00b4cca30f0f641e01140c1c388f55641f1c3fe5515484e622b6cb91d8cee585` (STRK wrapper, 1:1 rate)


## Quick Links

- [Installation](installation.md) - Install the SDK
- [Quick Start](quick-start.md) - Your first Tongo transaction
- [Core Concepts](concepts/accounts.md) - Understand the fundamentals
- [API Reference](api/account.md) - Complete API documentation
- [Examples](examples/complete-workflow.md) - Real-world code examples
