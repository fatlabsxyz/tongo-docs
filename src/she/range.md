# Range Proofs

Range proofs demonstrate that a value lies within a specific range using bit decomposition.

## Statement

Prove that a value \\(b\\) satisfies \\(b \in [0, 2^n)\\) where \\(n\\) is the bit length:

$$\{(V, g, h; b, r) : V = g^b \cdot h^r \land b \in [0, 2^n)\}$$

## Binary Decomposition

Any value \\(b < 2^n\\) can be written as:

$$b = \sum_{i=0}^{n-1} b_i \cdot 2^i$$

Where each \\(b_i \in \{0, 1\}\\).

## Protocol

### 1. Bit Commitments

For each bit \\(b_i\\), create a commitment with independent randomness \\(r_i\\):

$$V_i = g^{b_i} \cdot h^{r_i}$$

### 2. Bit Proofs

Generate a bit proof for each \\(V_i\\) showing \\(b_i \in \{0, 1\}\\).

### 3. Consistency Check

The verifier computes:

$$V_{\text{total}} = \prod_{i=0}^{n-1} V_i^{2^i} = \prod_{i=0}^{n-1} (g^{b_i} \cdot h^{r_i})^{2^i}$$

$$= g^{\sum_{i=0}^{n-1} b_i \cdot 2^i} \cdot h^{\sum_{i=0}^{n-1} r_i \cdot 2^i} = g^b \cdot h^r$$

If all bit proofs verify and \\(V_{\text{total}} = V\\), then \\(b \in [0, 2^n)\\).

## Implementation

### TypeScript

```typescript
interface RangeInputs {
  g: ProjectivePoint;
  h: ProjectivePoint;
  bit_size: number;
  commitments: ProjectivePoint[];  // V_0, V_1, ..., V_{n-1}
}

interface RangeProof {
  proofs: BitProofWithPrefix[];  // One bit proof per commitment
}

function proveRange(
  b: bigint,
  bit_size: number,
  g: ProjectivePoint,
  h: ProjectivePoint,
  prefix: bigint
): { inputs: RangeInputs; proof: RangeProof; r: bigint } {
  // Convert to binary
  const bits = b
    .toString(2)
    .padStart(bit_size, '0')
    .split('')
    .map(Number)
    .reverse();  // Little-endian
  
  const commitments: ProjectivePoint[] = [];
  const bitProofs: BitProofWithPrefix[] = [];
  let r = 0n;
  
  // Generate bit commitments and proofs
  for (let i = 0; i < bit_size; i++) {
    const r_i = generateRandom();
    const { inputs, proof } = proveBit(
      bits[i] as (0 | 1),
      r_i,
      g,
      h,
      prefix + BigInt(i)
    );
    
    commitments.push(inputs.V);
    bitProofs.push(proof);
    r = (r + r_i * (2n ** BigInt(i))) % CURVE_ORDER;
  }
  
  return {
    inputs: { g, h, bit_size, commitments },
    proof: { proofs: bitProofs },
    r
  };
}
```

### Verification

```typescript
function verifyRange(
  inputs: RangeInputs,
  proof: RangeProof
): ProjectivePoint | false {
  const { g, h, bit_size, commitments } = inputs;
  const { proofs } = proof;
  
  // Verify each bit proof
  let V_total = ProjectivePoint.ZERO;
  for (let i = 0; i < bit_size; i++) {
    const pow = 2n ** BigInt(i);
    const V_i = commitments[i];
    const proof_i = proofs[i];
    
    if (!verifyBit({ V: V_i, g, h }, proof_i)) {
      return false;
    }
    
    V_total = V_total.add(V_i.multiply(pow));
  }
  
  return V_total;  // Should equal g^b · h^r
}
```

## Cost Analysis

For n-bit range proof:

### Prover
- n bit proof generations
- n random scalars
- Time: ~n × 20ms (640ms for 32-bit)

### Verifier
- n bit proof verifications
- Consistency check
- Time: ~n × 2ms + 5ms (~70ms for 32-bit)

### Cairo (On-Chain)
- n bit verifications
- Weighted commitment sum
- ~n × 8K + 5K Cairo steps (~260K for 32-bit)

## Optimizations

### Precomputed Tables

Cache generator multiples:

```typescript
const gTable = g.precomputeWindow(8);
const hTable = h.precomputeWindow(8);
```

### Batch Verification

Verify multiple range proofs together when possible.

### Smaller Ranges

Use smaller bit sizes when possible:
- 16-bit: ~160ms proving, ~35ms verification
- 24-bit: ~480ms proving, ~50ms verification
- 32-bit: ~640ms proving, ~70ms verification

## Usage in Tongo

Range proofs are used to ensure:

1. **Transfer amounts**: \\(b \in [0, 2^{32})\\)
2. **Remaining balances**: \\(b_{\text{after}} = b_{\text{before}} - b_{\text{transfer}} \in [0, 2^{32})\\)
3. **Withdrawal amounts**: \\(b \in [0, 2^{32})\\)
4. **No negative balances**: Prevents underflow attacks

## Next Steps

- [Bit Proofs](bit.md) - Understanding the building blocks
- [POE Protocol](poe.md) - Base proof system
- [ElGamal Encryption](elgamal.md) - Complete encryption system
