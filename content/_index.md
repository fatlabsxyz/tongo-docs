+++
title = "Tongo Protocol"
type = "docs"
weight = 1
+++

# Tongo Protocol

Confidential ERC20s on Starknet. Every account balance is encrypted using ElGamal and manipulated through zero-knowledge proofs. This site documents the inner workings of the protocol.

## Sections

- [Encryption](docs/encryption)
- [Transfer](docs/transfer)
- [ZK Proofs](docs/zk-proofs)
- [Viewing Key / Auditor](docs/auditor)



### Demo Video

<video controls style="max-width: 100%; border-radius: 8px; margin-bottom: 1rem;">
  <source src="/demo.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

This is the full flow of the Tongo demo. Here are the transaction hashes in chronological order:

- **Fund tx**: [View on StarkScan](https://sepolia.starkscan.co/tx/0x50d1d7642f500b7d36aaf54e1e277639dfdc8ee2b024bc343467c0ca23bea66)
- **Transfer tx**: [View on StarkScan](https://sepolia.starkscan.co/tx/0x66a068b49de77a00e932e4c8bea58e4b55ece41ca7b2f3e1df75e36d040478b)
- **Rollover tx**: [View on StarkScan](https://sepolia.starkscan.co/tx/0x1c535332e6e41d3cbf19c07aad7201b1f18b30875c736fe1719d67405b4a287)
- **Withdraw tx**: [View on StarkScan](https://sepolia.starkscan.co/tx/0x31e9da7714f8a89d66ac490f5e7465e5a6c104d58ac659aaf6c52efac9dc34f)
