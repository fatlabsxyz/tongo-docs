# Starknet Homomorphic Encryption (SHE)

The SHE library provides low-level cryptographic primitives for ElGamal encryption and zero-knowledge proof generation over the Stark elliptic curve. It serves as the foundation for all cryptographic operations in Tongo.

## Dual Implementation

SHE is implemented in **two languages** for different environments:

### TypeScript Implementation

**Package**: `@fatsolutions/she`
**Version**: 0.1.0
**Use Case**: Client-side proof generation and encryption
**Location**: `/packages/typescript`

The TypeScript implementation provides:
- Off-chain proof generation (fund, transfer, withdraw, rollover)
- ElGamal encryption and decryption
- All zero-knowledge protocols (POE, bit, range, same encryption)
- Used by the Tongo SDK for creating operations

### Cairo Implementation

**Package**: `she`
**Version**: 0.3.0
**Use Case**: On-chain proof verification
**Location**: `/packages/cairo`

The Cairo implementation provides:
- Smart contract proof verification
- ElGamal ciphertext operations
- Optimized for Starknet VM execution
- Used by Tongo contracts for validating proofs

## Architecture

```
┌─────────────────────────────────────────┐
│          Client Application             │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  Tongo SDK (@fatsolutions/tongo)  │ │
│  │                                   │ │
│  │  ┌─────────────────────────────┐ │ │
│  │  │  SHE TypeScript             │ │ │
│  │  │  (@fatsolutions/she)        │ │ │
│  │  │                             │ │ │
│  │  │  - Proof generation         │ │ │
│  │  │  - Encryption/decryption    │ │ │
│  │  │  - Balance operations       │ │ │
│  │  └─────────────────────────────┘ │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
                    │
                    │ Submit transaction
                    ▼
┌─────────────────────────────────────────┐
│           Starknet Network              │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  Tongo Contract (Cairo)           │ │
│  │                                   │ │
│  │  ┌─────────────────────────────┐ │ │
│  │  │  SHE Cairo                  │ │ │
│  │  │                             │ │ │
│  │  │  - Proof verification       │ │ │
│  │  │  - Cipher operations        │ │ │
│  │  │  - Balance validation       │ │ │
│  │  └─────────────────────────────┘ │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## Core Primitives

Both implementations provide the same cryptographic primitives:

### ElGamal Encryption

Encrypt balances: \\(\text{Enc}[y](b, r) = (g^b y^r, g^r)\\)

**TypeScript**: Proof generation for funding, transfers
**Cairo**: Ciphertext arithmetic and validation

### Zero-Knowledge Proofs

#### POE (Proof of Exponent)
Prove \\(y = g^x\\) without revealing \\(x\\)

**TypeScript**: Generate proofs
**Cairo**: Verify proofs on-chain

#### Range Proofs
Prove \\(b \in [0, 2^{32})\\) using bit decomposition

**TypeScript**: ~500ms generation (32-bit)
**Cairo**: ~260K Cairo steps verification

#### Same Encryption
Prove two ciphertexts encrypt the same value

**TypeScript**: Generate multi-party proofs
**Cairo**: Verify consistency on-chain

## TypeScript API

### Installation

```bash
npm install @fatsolutions/she
```

### Basic Usage

```typescript
import { GENERATOR as g, proveFund, decipherBalance } from "@fatsolutions/she";

// Generate a fund proof
const { inputs, proof, newBalance } = proveFund(
    privateKey,
    amount,
    currentBalance,
    currentCipher,
    nonce
);

// Decrypt a balance
const balance = decipherBalance(privateKey, L, R);
```

### Available Protocols

```typescript
import {
    proveFund,
    proveTransfer,
    proveWithdraw,
    proveRollover,
    proveRagequit,
    prove_audit,
} from "@fatsolutions/she";
```

For detailed protocol documentation, see the [SHE Cryptography](../she/README.md) section.

## Cairo API

### Contract Integration

```cairo
use she::protocols::poe::verify as verify_poe;
use she::protocols::ElGamal::verify as verify_elgamal;
use she::protocols::range::verify as verify_range;

// Verify a fund proof
let valid = verify_poe(y, g, A, c, s);
```

### Available Modules

- `she::protocols::poe` - Proof of Exponent
- `she::protocols::poe2` - Double exponent proofs
- `she::protocols::poeN` - N-exponent proofs
- `she::protocols::bit` - Bit proofs (OR construction)
- `she::protocols::range` - Range proofs via bit decomposition
- `she::protocols::ElGamal` - ElGamal encryption proofs
- `she::protocols::SameEncryption` - Same message proofs
- `she::protocols::SameEncryptionUnknownRandom` - Without known randomness

## Performance

### TypeScript (Client-Side)

| Operation | Time |
|-----------|------|
| Fund proof | ~50ms |
| Transfer proof | 2-3s |
| Withdraw proof | 1-2s |
| Rollover proof | ~10ms |
| Decryption (with hint) | < 1ms |
| Decryption (brute-force 1M) | ~100ms |

### Cairo (On-Chain)

| Operation | Cairo Steps |
|-----------|-------------|
| POE verification | ~2,500 |
| ElGamal verification | ~5,000 |
| Bit proof verification | ~8,000 |
| Range proof (32-bit) | ~260,000 |
| Full transfer verification | ~300,000 |

## Repository Structure

```
she/
├── packages/
│   ├── typescript/          # TypeScript implementation
│   │   ├── src/
│   │   │   ├── protocols/   # ZK protocols
│   │   │   ├── types.ts     # Type definitions
│   │   │   ├── constants.ts # Curve parameters
│   │   │   └── utils.ts     # Crypto utilities
│   │   └── package.json
│   │
│   └── cairo/               # Cairo implementation
│       ├── src/
│       │   ├── protocols/   # ZK protocol verifiers
│       │   ├── lib.cairo    # Main library
│       │   └── utils.cairo  # Cairo utilities
│       └── Scarb.toml
│
├── pnpm-workspace.yaml
└── README.md
```

## Development

### TypeScript

```bash
cd packages/typescript
pnpm install
pnpm build
pnpm test
```

### Cairo

```bash
cd packages/cairo
scarb build
scarb test
```

## Next Steps

For cryptographic protocol details:
- [ElGamal Encryption](../she/elgamal.md)
- [Zero-Knowledge Proofs](../she/proofs.md)
- [POE Protocol](../she/poe.md)
- [Range Proofs](../she/range.md)

For SDK usage:
- [Tongo SDK Documentation](../sdk/README.md)
