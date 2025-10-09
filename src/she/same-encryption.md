# Same Encryption Proof

Proves that two ciphertexts for different public keys encrypt the same value.

## Statement

Prove that \\((L_1, R_1)\\) and \\((L_2, R_2)\\) encrypt the same message \\(b\\) for different keys \\(y_1\\) and \\(y_2\\):

$$\{(L_1, R_1, L_2, R_2, g, y_1, y_2; b, r_1, r_2) : L_1 = g^b \cdot y_1^{r_1} \land R_1 = g^{r_1} \land L_2 = g^b \cdot y_2^{r_2} \land R_2 = g^{r_2}\}$

## Use Case

This proof is critical for Tongo transfers where the same amount must be:
- Encrypted for the sender (to subtract from balance)
- Encrypted for the receiver (to add to pending)
- Encrypted for the auditor (for compliance)

All three must encrypt the same \\(b\\) but use different randomness for each public key.

## Protocol

**Prover** (knows \\(b\\), \\(r_1\\), \\(r_2\\)):

```
Choose random kb, kr1, kr2
Compute AL1 = g^kb · y1^kr1
Compute AR1 = g^kr1
Compute AL2 = g^kb · y2^kr2
Compute AR2 = g^kr2
Compute c = Hash(prefix, AL1, AR1, AL2, AR2)
Compute sb = kb + c·b
Compute sr1 = kr1 + c·r1
Compute sr2 = kr2 + c·r2
Send: (AL1, AR1, AL2, AR2, sb, sr1, sr2)
```

**Verifier**:
```
Recompute c = Hash(prefix, AL1, AR1, AL2, AR2)
Check ElGamal proof 1: g^sb · y1^sr1 == AL1 · L1^c AND g^sr1 == AR1 · R1^c
Check ElGamal proof 2: g^sb · y2^sr2 == AL2 · L2^c AND g^sr2 == AR2 · R2^c
```

## Key Insight

Both proofs use the **same \\(s_b\\)** response! This proves:
- Both ciphertexts use the same message \\(b\\)
- Without revealing \\(b\\)
- While using independent randomness \\(r_1 \neq r_2\\)

## Implementation

### TypeScript

```typescript
interface SameEncryptionInputs {
  L1: ProjectivePoint;
  R1: ProjectivePoint;
  L2: ProjectivePoint;
  R2: ProjectivePoint;
  g: ProjectivePoint;
  y1: ProjectivePoint;
  y2: ProjectivePoint;
}

interface SameEncryptionProofWithPrefix {
  AL1: ProjectivePoint;
  AR1: ProjectivePoint;
  AL2: ProjectivePoint;
  AR2: ProjectivePoint;
  prefix: bigint;
  sb: bigint;
  sr1: bigint;
  sr2: bigint;
}

function proveSameEncryption(
  g: ProjectivePoint,
  y1: ProjectivePoint,
  y2: ProjectivePoint,
  message: bigint,
  random1: bigint,
  random2: bigint,
  prefix: bigint
): { inputs: SameEncryptionInputs; proof: SameEncryptionProofWithPrefix } {
  // Create ciphertexts
  const L1 = g.multiply(message).add(y1.multiply(random1));
  const R1 = g.multiply(random1);
  const L2 = g.multiply(message).add(y2.multiply(random2));
  const R2 = g.multiply(random2);
  
  // Generate random values for commitments
  const kb = generateRandom();
  const kr1 = generateRandom();
  const kr2 = generateRandom();
  
  // Compute commitments
  const AL1 = g.multiply(kb).add(y1.multiply(kr1));
  const AR1 = g.multiply(kr1);
  const AL2 = g.multiply(kb).add(y2.multiply(kr2));
  const AR2 = g.multiply(kr2);
  
  // Compute challenge
  const c = compute_challenge(prefix, [AL1, AR1, AL2, AR2]);
  
  // Compute responses (note: shared sb!)
  const sb = compute_s(kb, message, c);
  const sr1 = compute_s(kr1, random1, c);
  const sr2 = compute_s(kr2, random2, c);
  
  return {
    inputs: { L1, R1, L2, R2, g, y1, y2 },
    proof: { AL1, AR1, AL2, AR2, prefix, sb, sr1, sr2 }
  };
}
```

### Verification

```typescript
function verifySameEncryption(
  inputs: SameEncryptionInputs,
  proof: SameEncryptionProofWithPrefix
): boolean {
  const { L1, R1, L2, R2, g, y1, y2 } = inputs;
  const { AL1, AR1, AL2, AR2, prefix, sb, sr1, sr2 } = proof;
  
  const c = compute_challenge(prefix, [AL1, AR1, AL2, AR2]);
  
  // Verify first ElGamal proof
  if (!verifyElGamal(L1, R1, g, y1, AL1, AR1, c, sb, sr1)) {
    return false;
  }
  
  // Verify second ElGamal proof
  if (!verifyElGamal(L2, R2, g, y2, AL2, AR2, c, sb, sr2)) {
    return false;
  }
  
  return true;
}
```

## Security Analysis

### Soundness

Adversary cannot forge proof without knowing \\(b\\) because:
- Requires valid ElGamal proofs for both ciphertexts
- Shared \\(s_b\\) forces same message value
- Challenge binding prevents manipulation

### Zero-Knowledge

Proof reveals nothing about \\(b\\) or randomness because:
- Commitments are perfectly hiding
- Responses are uniformly random
- Can be simulated without witness

## Cost Analysis

### Prover
- 2 ElGamal proof generations
- Time: ~20-30ms

### Verifier
- 2 ElGamal proof verifications
- 10 EC multiplications
- 6 EC additions
- Time: ~3-4ms

### Cairo
- ~10,000 Cairo steps

## Variants

### Same Encryption Unknown Random

Proves same encryption when randomness is not known to prover.

**Use Case**: Ex-post proofs where original randomness was lost.

See `sameEncryptionUnknownRandom.ts` for implementation.

## Usage in Tongo

Same Encryption proofs are used in:

1. **Transfers**: Prove amount encrypted for sender, receiver, and auditor is identical
2. **Auditing**: Prove audit ciphertext matches transfer amount
3. **Viewing Keys**: Prove additional encryptions match transfer amount

## Next Steps

- [ElGamal Encryption](elgamal.md) - Understanding the base encryption
- [Bit Proofs](bit.md) - Range proof building blocks
- [POE Protocol](poe.md) - Base proof system
