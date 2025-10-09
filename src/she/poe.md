# Proof of Exponent (POE)

The POE protocol proves knowledge of a discrete logarithm without revealing it.

## Statement

Prove knowledge of \\(x\\) such that:

$$y = g^x$$

Where:
- \\(g\\) is a known generator point
- \\(y\\) is a known public point
- \\(x\\) is the secret witness

## Protocol (Interactive)

**Prover** (knows \\(x\\)):
```
1. Choose random k
2. Compute A = g^k
3. Send A to verifier
4. Receive challenge c from verifier
5. Compute s = k + c·x  (mod curve_order)
6. Send s to verifier
```

**Verifier**:
```
1. Receive A
2. Choose random c
3. Send c to prover
4. Receive s
5. Check: g^s == A · y^c
```

## Verification Equation

The verification equation holds because:

$$g^s = g^{k + c \cdot x} = g^k \cdot g^{c \cdot x} = A \cdot (g^x)^c = A \cdot y^c$$

## Non-Interactive (Fiat-Shamir)

Instead of interactive challenge, compute:

$$c = \text{Hash}(\text{prefix}, A)$$

This makes the proof non-interactive and bindable to context.

## Implementation

### TypeScript

```typescript
import { ProjectivePoint } from "@scure/starknet";
import { compute_challenge, compute_s, generateRandom } from "./utils";

interface PoeInputs {
  y: ProjectivePoint;
  g: ProjectivePoint;
}

interface PoeProofWithPrefix {
  A: ProjectivePoint;
  prefix: bigint;
  s: bigint;
}

// Prove knowledge of x such that y = g^x
function prove(
  x: bigint,
  g: ProjectivePoint,
  prefix: bigint
): { inputs: PoeInputs; proof: PoeProofWithPrefix } {
  const y = g.multiply(x);
  const k = generateRandom();
  const A = g.multiply(k);
  const c = compute_challenge(prefix, [A]);
  const s = compute_s(k, x, c);
  
  return {
    inputs: { y, g },
    proof: { A, prefix, s }
  };
}

// Verify POE proof
function verify(
  y: ProjectivePoint,
  g: ProjectivePoint,
  A: ProjectivePoint,
  c: bigint,
  s: bigint
): boolean {
  const lhs = g.multiply(s);
  const rhs = A.add(y.multiply(c));
  return lhs.equals(rhs);
}
```

### Cairo

```cairo
// Simplified Cairo verification
fn verify_poe(
    y: EcPoint,
    g: EcPoint,
    A: EcPoint,
    c: felt252,
    s: felt252
) -> bool {
    let lhs = ec_mul(g, s);
    let rhs = ec_add(A, ec_mul(y, c));
    lhs == rhs
}
```

## Security

### Soundness

An adversary cannot forge a proof without knowing \\(x\\) because:
- Finding \\(s\\) without \\(x\\) requires solving DLP
- Challenge binding prevents manipulation
- Response \\(s\\) is tied to specific \\(A\\) and \\(c\\)

### Zero-Knowledge

The proof reveals nothing about \\(x\\) because:
- \\(A\\) is perfectly hiding (random \\(k\\))
- \\(s\\) is uniformly distributed mod curve order
- Simulator can produce indistinguishable transcripts

### Proof of Zero-Knowledge

A simulator can generate valid-looking transcripts without knowing \\(x\\):

```
1. Choose random s and c
2. Compute A = g^s / y^c
3. Output (A, c, s)
```

This produces transcripts indistinguishable from real proofs.

## Cost Analysis

### Prover Complexity
- 2 scalar multiplications (k generation, s computation)
- 1 hash computation
- Time: ~10ms

### Verifier Complexity
- 2 EC multiplications (g^s, y^c)
- 1 EC addition (A + y^c)
- 1 hash computation
- Time: ~1-2ms

### On-Chain (Cairo)
- 2 `ec_mul` operations
- 1 `ec_add` operation
- ~2,500 Cairo steps

## Usage in Tongo

POE is used for:

1. **Ownership Proofs**: Prove account ownership during fund/transfer/withdraw
2. **Blinding Factor**: Prove knowledge of randomness in transfers
3. **Building Block**: Component of more complex proofs (ElGamal, transfer)

## Variants

### POE2

Proves \\(y = g_1^x \cdot g_2^z\\) (two generators, two witnesses)

### POEN

Proves \\(y = \prod_{i=1}^{n} g_i^{x_i}\\) (N generators, N witnesses)

Both are implemented in SHE for specific use cases.

## Next Steps

- [Bit Proofs](bit.md) - OR proofs for binary values
- [Range Proofs](range.md) - Composition of bit proofs
- [ElGamal Encryption](elgamal.md) - Uses POE as building block
