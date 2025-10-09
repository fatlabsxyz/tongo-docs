# ElGamal Encryption

ElGamal encryption over elliptic curves provides the foundation for Tongo's confidential balances.

## Mathematical Definition

The ElGamal encryption scheme over the Stark curve is defined as:

$$\text{Enc}[y](b, r) = (L, R) = (g^b \cdot y^r, g^r)$

Where:
- \\(g\\) is the Stark curve generator
- \\(y = g^x\\) is the recipient's public key
- \\(b\\) is the message (balance amount)
- \\(r\\) is a random blinding factor

## Properties

### Additive Homomorphism

Given two ciphertexts encrypting \\(b_1\\) and \\(b_2\\):

$$\text{Enc}[y](b_1, r_1) \cdot \text{Enc}[y](b_2, r_2) = \text{Enc}[y](b_1 + b_2, r_1 + r_2)$

This allows adding encrypted balances without decryption:

$$(L_1, R_1) \cdot (L_2, R_2) = (L_1 \cdot L_2, R_1 \cdot R_2)$

### Semantic Security

Each encryption uses fresh randomness \\(r\\), ensuring:
- Same amount encrypted twice produces different ciphertexts
- Ciphertexts reveal no information about the message
- Security based on Decisional Diffie-Hellman assumption

## Decryption

To decrypt a ciphertext \\((L, R)\\) with private key \\(x\\):

1. Compute \\(g^b = L / R^x = L / (g^r)^x = (g^b \cdot y^r) / (g^{rx}) = g^b\\)
2. Solve discrete logarithm: find \\(b\\) such that \\(g^b\\) equals the result

Since \\(b\\) is bounded (e.g., \\([0, 2^{32})\\)), this can be computed efficiently using:
- Brute force: \\(O(b)\\) time
- Baby-step Giant-step: \\(O(\sqrt{b})\\) time and space

## Zero-Knowledge Proof

### Statement

Prove that \\((L, R)\\) is a well-formed ElGamal ciphertext:

$$\{(L, R, g, y; b, r) : L = g^b \cdot y^r \land R = g^r\}$

### Protocol

The proof consists of two coupled sub-proofs:

1. **POE for \\(R\\)**: Prove \\(R = g^r\\) (knowledge of \\(r\\))
2. **POE2 for \\(L\\)**: Prove \\(L = g^b \cdot y^r\\) (knowledge of \\(b\\) and \\(r\\))

**Prover** (knows \\(b\\), \\(r\\)):
```
Choose random kb, kr
Compute AL = g^kb · y^kr
Compute AR = g^kr
Compute challenge c = Hash(prefix, AL, AR)
Compute sb = kb + c·b
Compute sr = kr + c·r
Send: (AL, AR, sb, sr)
```

**Verifier** (checks):
```
Recompute c = Hash(prefix, AL, AR)
Check: g^sr == AR · R^c          [POE for R]
Check: g^sb · y^sr == AL · L^c   [POE2 for L]
```

## Implementation

### Encryption (TypeScript)

```typescript
import { ProjectivePoint } from "@scure/starknet";

function encrypt(
  message: bigint,
  publicKey: ProjectivePoint,
  generator: ProjectivePoint,
  randomness: bigint
): { L: ProjectivePoint; R: ProjectivePoint } {
  const L = generator.multiply(message).add(publicKey.multiply(randomness));
  const R = generator.multiply(randomness);
  return { L, R };
}
```

### Decryption (TypeScript)

```typescript
function decrypt(
  L: ProjectivePoint,
  R: ProjectivePoint,
  secretKey: bigint,
  maxValue: bigint = 1000000n
): bigint {
  // Compute g^b = L / R^x
  const gb = L.subtract(R.multiply(secretKey));
  
  // Brute force discrete log
  const g = ProjectivePoint.BASE;
  for (let i = 0n; i <= maxValue; i++) {
    if (g.multiply(i).equals(gb)) {
      return i;
    }
  }
  
  throw new Error('Decryption failed: value not in range');
}
```

### Proof Generation (TypeScript)

```typescript
import * as ElGamal from "@fatsolutions/she/protocols";

function proveElGamal(
  message: bigint,
  random: bigint,
  g: ProjectivePoint,
  publicKey: ProjectivePoint,
  prefix: bigint
): { inputs: ElGamalInputs; proof: ElGamalProof } {
  return ElGamal.prove(message, random, g, publicKey, prefix);
}
```

### Proof Verification (TypeScript)

```typescript
function verifyElGamal(
  inputs: ElGamalInputs,
  proof: ElGamalProofWithPrefix
): boolean {
  return ElGamal.verify_with_prefix(inputs, proof);
}
```

## Security Analysis

### Soundness

An adversary cannot forge a valid proof without knowing \\(b\\) and \\(r\\) because:
- POE for \\(R\\) requires knowledge of \\(r\\)
- POE2 for \\(L\\) requires knowledge of both \\(b\\) and \\(r\\)
- Challenge binding prevents proof manipulation

### Zero-Knowledge

The proof reveals nothing about \\(b\\) or \\(r\\) beyond the public statement because:
- Commitments are perfectly hiding
- Responses are uniformly random mod curve order
- Simulation is indistinguishable from real proofs

### Completeness

Honest provers always produce valid proofs because:
- Verification equations hold for correctly computed responses
- Challenge computation is deterministic
- All arithmetic is mod curve order

## Cairo Implementation

The Cairo version in `/packages/cairo/src/protocols/ElGamal.cairo` provides on-chain verification:

```cairo
// Simplified Cairo verification
fn verify_elgamal(
    L: EcPoint,
    R: EcPoint,
    g: EcPoint,
    y: EcPoint,
    AL: EcPoint,
    AR: EcPoint,
    c: felt252,
    sb: felt252,
    sr: felt252
) -> bool {
    // Verify R = g^r (POE)
    let lhs_r = ec_mul(g, sr);
    let rhs_r = ec_add(AR, ec_mul(R, c));
    assert(lhs_r == rhs_r);
    
    // Verify L = g^b · y^r (POE2)
    let lhs_l = ec_add(ec_mul(g, sb), ec_mul(y, sr));
    let rhs_l = ec_add(AL, ec_mul(L, c));
    assert(lhs_l == rhs_l);
    
    true
}
```

## Cost Analysis

### TypeScript (Off-Chain)
- **Proof Generation**: ~10-15ms
- **Proof Verification**: ~1-2ms
- **2 EC multiplications + 1 EC addition**

### Cairo (On-Chain)
- **Verification**: ~5,000 Cairo steps
- **2 `ec_mul` operations**
- **2 `ec_add` operations**

## Next Steps

- [Understand POE Protocol](poe.md)
- [Learn about Range Proofs](range.md)
- [Explore Same Encryption proofs](same-encryption.md)
