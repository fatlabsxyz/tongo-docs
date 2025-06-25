---
title: "Zero-Knowledge Proof System"
weight: 4
bookToC: true
---

# Zero-Knowledge Proof System

Tongo's security relies on three fundamental zero-knowledge proof primitives, all built using sigma protocols over the Stark elliptic curve. These proofs require no trusted setup and leverage only basic elliptic curve operations.

## Proof Primitives

All Tongo operations are built from three core proof types:
- **POE**: Proof of Exponent (discrete logarithm knowledge)
- **PED**: Pedersen Commitment proofs  
- **RAN**: Range proofs (32-bit decomposition)

{{< hint info >}}
**No Circuits Required**: Unlike zkSNARK systems, Tongo doesn't require circuit compilation or trusted setups. All proofs use native elliptic curve arithmetic.
{{< /hint >}}

---

## POE: Proof of Exponent

The most fundamental proof demonstrates knowledge of a discrete logarithm.

### Statement
Prove knowledge of secret $x$ such that $y = g^x$:
$$\pi_{\text{poe}}: \{(g, y; x) : y = g^x\}$$

### Sigma Protocol

{{< tabs "poe-protocol" >}}

{{% tab "Interactive" %}}
**Prover → Verifier**:
1. Choose random $k \leftarrow \mathbb{F}_p$
2. Compute $A = g^k$  
3. Send $A$

**Verifier → Prover**:
4. Choose challenge $c \leftarrow \mathbb{F}_p$
5. Send $c$

**Prover → Verifier**:
6. Compute $s = k + c \cdot x$
7. Send $s$

**Verification**:
8. Check: $g^s \stackrel{?}{=} A \cdot y^c$
{{% /tab %}}

{{% tab "Non-Interactive" %}}
Using **Fiat-Shamir transformation**:

1. Choose random $k \leftarrow \mathbb{F}_p$
2. Compute $A = g^k$
3. Compute challenge $c = H(A \| \text{context})$
4. Compute response $s = k + c \cdot x$
5. Send proof $(A, s)$

**Verification**:
- Recompute $c = H(A \| \text{context})$  
- Check: $g^s \stackrel{?}{=} A \cdot y^c$
{{% /tab %}}

{{< /tabs >}}

### Security Properties
- **Completeness**: Honest provers always convince verifiers
- **Soundness**: Only knowledge of $x$ enables proof generation  
- **Zero-Knowledge**: Proof reveals no information about $x$

---

## PED: Pedersen Commitment Proofs

Proves knowledge of values committed in a Pedersen commitment.

### Statement  
Prove knowledge of $b$ and $r$ such that $V = g^b h^r$:
$$\pi_{\text{ped}}: \{(g, h, V; b, r) : V = g^b h^r\}$$

In Tongo, the "left" component $L$ of ElGamal encryptions are Pedersen commitments with generators $g$ and $y$.

### Protocol

{{< tabs "ped-protocol" >}}

{{% tab "Commitment Phase" %}}
**Prover**:
1. Choose random $k_b, k_r \leftarrow \mathbb{F}_p$
2. Compute $A = g^{k_b} h^{k_r}$
3. Send $A$
{{% /tab %}}

{{% tab "Challenge Phase" %}}
**Verifier**:
1. Choose challenge $c \leftarrow \mathbb{F}_p$
2. Send $c$
{{% /tab %}}

{{% tab "Response Phase" %}}
**Prover**:
1. Compute $s_b = k_b + c \cdot b$
2. Compute $s_r = k_r + c \cdot r$  
3. Send $(s_b, s_r)$

**Verification**:
- Check: $g^{s_b} h^{s_r} \stackrel{?}{=} A \cdot V^c$
{{% /tab %}}

{{< /tabs >}}

### Applications in Tongo
- Proving ElGamal left components are well-formed: $L = g^b y^r$
- Validating transfer amount commitments
- Ensuring consistent use of blinding factors across encryptions

---

## RAN: Range Proofs

Proves that a committed value lies within a specific range without revealing the value.

### Statement
Given commitment $V = g^b h^r$, prove $b \in [0, 2^{32})$:
$$\pi_{\text{range}}: \{(g, h, V_i, V; b_i, b, r_i, r) : V = g^b h^r \land V = \prod_i V_i^{2^i} \land b_i \in \{0,1\}\}$$

### Bit Decomposition

The range proof works by decomposing $b$ into 32 bits:
$$b = \sum_{i=0}^{31} b_i \cdot 2^i \text{ where } b_i \in \{0, 1\}$$

For each bit $b_i$, create a commitment:
$$V_i = g^{b_i} h^{r_i}$$

The original commitment can be reconstructed:
$$V = \prod_{i=0}^{31} V_i^{2^i} = g^{\sum b_i 2^i} h^{\sum r_i 2^i} = g^b h^r$$

where $r = \sum_{i=0}^{31} r_i \cdot 2^i$.

### Bit Proof (OR Protocol)

Each bit commitment $V_i$ must represent either 0 or 1:
$$\pi_{\text{bit}}: \{(g, h, V_i; r_i) : V_i = h^{r_i} \lor V_i/g = h^{r_i}\}$$

This is proven using an **OR composition** of two POE protocols:

{{< tabs "bit-proof" >}}

{{% tab "Case: b_i = 0" %}}
If $b_i = 0$, then $V_i = h^{r_i}$

**Real Proof**: Prove $V_i = h^{r_i}$ (POE)  
**Simulated Proof**: Simulate $V_i/g = h^{r_i}$ (fake transcript)
{{% /tab %}}

{{% tab "Case: b_i = 1" %}}
If $b_i = 1$, then $V_i = g \cdot h^{r_i}$, so $V_i/g = h^{r_i}$

**Real Proof**: Prove $V_i/g = h^{r_i}$ (POE)  
**Simulated Proof**: Simulate $V_i = h^{r_i}$ (fake transcript)
{{% /tab %}}

{{< /tabs >}}

### OR Protocol Details

The OR protocol allows proving "Statement A OR Statement B" without revealing which is true:

```
Prover (case b_i = 1):
1. Simulate POE for V_i = h^r_i:
   - Choose random s_0, c_0
   - Compute A_0 = h^s_0 / V_i^c_0
   
2. Real POE for V_i/g = h^r_i:
   - Choose random k
   - Compute A_1 = h^k
   
3. Send (A_0, A_1)

Verifier:
4. Send challenge c

Prover:
5. Compute c_1 = c ⊕ c_0  (XOR)
6. Compute s_1 = k + c_1 * r_i
7. Send (c_0, s_0, s_1)

Verification:
8. Check c_1 = c ⊕ c_0
9. Check h^s_0 = A_0 * V_i^c_0
10. Check h^s_1 = A_1 * (V_i/g)^c_1
```

---

## Fiat-Shamir Transformation

All interactive protocols are made non-interactive using the Fiat-Shamir heuristic:

### Challenge Generation
Instead of receiving challenges from a verifier, compute:
$$c = H(\text{transcript} \| \text{context})$$

### Context Binding
The hash includes transaction-specific data for security:
- Chain ID
- Contract address  
- Function selector
- User nonce
- Relevant public inputs

This prevents:
- **Replay attacks**: Proofs are bound to specific transactions
- **Cross-context attacks**: Proofs can't be reused in different contexts
- **Malleability**: Proofs can't be modified or forged

### Example Context Hash
```cairo
let context = hash_chain([
    chain_id,
    contract_address, 
    selector,
    user_nonce,
    public_inputs...
]);

let challenge = hash_chain([
    commitment_A,
    context
]);
```

---

## Proof Composition

Complex operations combine multiple proof primitives:

### Fund Proof
$$\pi_{\text{fund}}: \{(g, y, b; x) : y = g^x\}$$
- **Components**: 1 POE proof
- **Purpose**: Prove ownership of public key

### Transfer Proof  
$$\pi_{\text{transfer}}: \{(g, y_s, y_r, L_0, R_0, L_s, L_r, R; x, b, b', r) : \ldots\}$$
- **Components**: 3 POE + 3 PED + 2 RAN proofs
- **Purpose**: Prove valid confidential transfer

### Withdraw Proof
$$\pi_{\text{withdraw}}: \{(g, y, R, L, b; b', x) : \ldots\}$$  
- **Components**: 2 POE + 1 RAN proof
- **Purpose**: Prove valid balance withdrawal

---

## Performance Analysis

| Proof Type | Components | Approx. Cost |
|------------|------------|--------------|
| POE | 1 scalar mult + 1 verification | ~3K steps |
| PED | 2 scalar mults + 1 verification | ~5K steps |
| RAN (32-bit) | 32 OR proofs + reconstruction | ~35K steps |

### Transfer Cost Breakdown
- **Ownership POE**: ~3K steps
- **Blinding POE**: ~3K steps  
- **3× PED proofs**: ~15K steps
- **2× Range proofs**: ~70K steps
- **Contract logic**: ~5K steps
- **Total**: ~100K steps (optimized implementation)

### Future Optimizations
- **Bulletproofs**: More efficient range proofs (~10K steps for 32-bit)
- **Batch verification**: Parallel proof verification
- **Precomputed tables**: Faster scalar multiplication