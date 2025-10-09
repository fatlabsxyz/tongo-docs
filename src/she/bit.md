# Bit Proofs

Bit proofs demonstrate that a committed value is either 0 or 1 using OR proof construction.

## Statement

Prove that a commitment \\(V = g^b \cdot h^r\\) has \\(b \in \{0, 1\}\\):

$$\{(V, g, h; b, r) : V = g^b \cdot h^r \land (b = 0 \lor b = 1)\}$

## OR Proof Construction

The proof works by showing:
- **If \\(b = 0\\)**: Then \\(V = h^r\\) (prove with POE for \\(r\\))
- **If \\(b = 1\\)**: Then \\(V/g = h^r\\) (prove with POE for \\(r\\))

Without revealing which case is true!

## Protocol

**Prover** (knows \\(b \in \{0,1\}\\) and \\(r\\)):

For \\(b = 0\\):
```
Real proof for V = h^r:
  k0 ← random
  A0 = h^k0
  
Simulated proof for V/g = h^r:
  s1, c1 ← random
  A1 = h^s1 / (V/g)^c1

Combine:
  c = Hash(prefix, A0, A1)
  c0 = c ⊕ c1
  s0 = k0 + c0·r
```

For \\(b = 1\\):
```
Simulated proof for V = h^r:
  s0, c0 ← random
  A0 = h^s0 / V^c0

Real proof for V/g = h^r:
  k1 ← random
  A1 = h^k1
  
Combine:
  c = Hash(prefix, A0, A1)
  c1 = c ⊕ c0
  s1 = k1 + c1·r
```

**Verifier**:
```
Recompute c = Hash(prefix, A0, A1)
Compute c1 = c ⊕ c0
Check: h^s0 == A0 · V^c0          [POE for b=0 case]
Check: h^s1 == A1 · (V/g)^c1      [POE for b=1 case]
```

## Simulated POE

Key technique: Generate fake proof for false case:

```typescript
function simulatePOE(
  y: ProjectivePoint,
  gen: ProjectivePoint
): { A: ProjectivePoint; c: bigint; s: bigint } {
  const s = generateRandom();
  const c = generateRandom();
  const A = gen.multiply(s).subtract(y.multiply(c));
  return { A, c, s };
}
```

This produces a valid-looking transcript for any statement!

## Implementation

### TypeScript

```typescript
function proveBit(
  bit: 0 | 1,
  random: bigint,
  g: ProjectivePoint,
  h: ProjectivePoint,
  prefix: bigint
): { inputs: BitInputs; proof: BitProofWithPrefix } {
  if (bit === 0) {
    // Real proof for V = h^r
    const V = h.multiply(random);
    const V1 = V.subtract(g);
    
    // Simulate proof for V/g = h^r
    const { A: A1, c: c1, s: s1 } = simulatePOE(V1, h);
    
    // Real proof for V = h^r
    const k = generateRandom();
    const A0 = h.multiply(k);
    
    const c = compute_challenge(prefix, [A0, A1]);
    const c0 = c ^ c1;
    const s0 = compute_s(k, random, c0);
    
    return {
      inputs: { V, g, h },
      proof: { A0, A1, prefix, c0, s0, s1 }
    };
  } else {
    // Similar for bit = 1, but swap real and simulated
    // ...
  }
}
```

### Verification

```typescript
function verifyBit(
  V: ProjectivePoint,
  g: ProjectivePoint,
  h: ProjectivePoint,
  A0: ProjectivePoint,
  A1: ProjectivePoint,
  c: bigint,
  c0: bigint,
  s0: bigint,
  s1: bigint
): boolean {
  const c1 = c ^ c0;
  
  // Verify b=0 case
  if (!poe_verify(V, h, A0, c0, s0)) {
    return false;
  }
  
  // Verify b=1 case
  const V1 = V.subtract(g);
  if (!poe_verify(V1, h, A1, c1, s1)) {
    return false;
  }
  
  return true;
}
```

## Cost Analysis

### Prover
- 1 real POE proof
- 1 simulated POE proof
- 1 hash computation
- Time: ~20ms

### Verifier
- 2 POE verifications
- 1 hash computation
- 4 EC multiplications
- 3 EC additions
- Time: ~2-3ms

### Cairo
- 4 `ec_mul` operations
- 3 `ec_add` operations
- ~8,000 Cairo steps per bit

## Use in Range Proofs

Bit proofs are the building blocks for range proofs:

For a 32-bit value \\(b = \sum_{i=0}^{31} b_i \cdot 2^i\\):

1. Commit to each bit: \\(V_i = g^{b_i} \cdot h^{r_i}\\)
2. Prove each \\(b_i \in \{0, 1\}\\) using bit proof
3. Verify commitment consistency: \\(\prod_{i=0}^{31} V_i^{2^i} = g^b \cdot h^r\\)

## Next Steps

- [Range Proofs](range.md) - Composition of bit proofs
- [POE Protocol](poe.md) - Understanding the base protocol
