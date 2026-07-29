# Tongo TypeScript SDK

The Tongo TypeScript SDK provides a comprehensive interface for building confidential payment applications on Starknet. It handles key management, encryption, proof generation, and transaction serialization.

## Features

- **Simple API**: High-level methods for all Tongo operations
- **Type Safety**: Full TypeScript support with complete type definitions
- **Proof Generation**: Automatic ZK proof creation for all operations
- **Encryption Handling**: Transparent management of encrypted balances
- **Starknet Integration**: Seamless integration with Starknet wallets and providers
- **Relaying**: Transact without a funded StarkNet account through the `RelayerAccount`

## Package Information

- **Package**: `@fatsolutions/tongo-sdk`
- **Current Version**: 2.0.0
- **License**: Apache-2.0
- **Repository**: [github.com/fatlabsxyz/tongo](https://github.com/fatlabsxyz/tongo)

## Supported Networks

The SDK works on:
- **Starknet Mainnet** - Production deployments
- **Starknet Sepolia** - Testnet for development

Check the deployed [Tongo Instances](../protocol/contracts.md) for information about Tongo contracts wrapping different tokens.

## Quick Links

- [Quick Start](quick-start.md) - Install the SDK and send your first Tongo transaction
- [Account Class](accounts.md) - The main interface for a Tongo account
- [Operations](operations/operations.md) - Fund, transfer, rollover, withdraw, ragequit
- [Relaying](relaying.md) - Transact without a StarkNet account
