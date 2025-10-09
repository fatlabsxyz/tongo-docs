# Zero-Knowledge Proofs

SHE implements a comprehensive suite of zero-knowledge proofs based on sigma protocols, made non-interactive using the Fiat-Shamir transform.

## Sigma Protocols

All SHE proofs follow the sigma protocol pattern:

1. **Commitment**: Prover commits to random values
2. **Challenge**: Verifier provides challenge (computed via Fiat-Shamir)
3. **Response**: Prover responds using witness and challenge

## Fiat-Shamir Transform

Instead of interactive challenges, SHE computes challenges deterministically:

$$c = \text{Hash}(\text{prefix}, A_1, A_2, \ldots, A_n)$$

Where:
- `prefix` binds the proof to a specific context (nonce, contract address, etc.)
- \\(A_i\\) are the commitment points
- `Hash` is Poseidon (Starknet-native hash function)

### Implementation

```typescript
import { poseidonHashMany } from "@scure/starknet";

function compute_challenge(prefix: bigint, commitments: ProjectivePoint[]): bigint {
  const arr: bigint[] = [prefix];
  commitments.forEach(commit => {
    const { x, y } = commit.toAffine();
    arr.push(x, y);
  });
  return poseidonHashMany(arr) % CURVE_ORDER;
}
```

## Proof Composition

Complex statements are built from basic protocols:

### ElGamal Proof
= POE (for R) + POE2 (for L)

### Transfer Proof
= POE (ownership) + POE (blinding) + Multiple ElGamal proofs + Range proofs

### Same Encryption
= ElGamal proof 1 + ElGamal proof 2 (with shared message response)

## Security Properties

### Soundness

An adversary cannot forge proofs without knowing the witness because:
- Discrete logarithm assumption
- Challenge binding prevents manipulation
- Fiat-Shamir security (ROM model)

### Zero-Knowledge

Proofs reveal nothing beyond the statement because:
- Responses are uniformly random
- Simulation is perfect (honest-verifier ZK)
- Fiat-Shamir preserves zero-knowledge

### Non-Malleability

Proofs cannot be modified or replayed because:
- Challenge includes all public inputs
- Prefix binds to specific context
- Response depends on full transcript

## Common Patterns

### OR Proofs

Prove "bit is 0 OR bit is 1" without revealing which:

```
Real proof: Generate honestly for true case
Simulated proof: Fake proof for false case
Challenge split: c = c_real ⊕ c_simulated
```

### AND Proofs

Prove multiple statements simultaneously:

```
Single challenge: c used for all sub-proofs
Independent responses: s_i for each statement
Batch verification: Check all equations
```

## Next Steps

- [POE Protocol Details](poe.md)
- [Bit Proof Construction](bit.md)
- [Range Proof System](range.md)
- [Same Encryption Proof](same-encryption.md)
