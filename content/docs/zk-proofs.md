---
title: "ZK Proofs"
weight: 5
---
# Tongo ZK Proofs

## POE: Proof of Exponent

Prove knowledge of `x` such that `y = g^x`.

Public: `g, y`  
Private: `x`
    
Pick k ← 𝔽_p

Compute A = g^k

Verifier sends challenge c

Prover computes s = k + c⋅x

Verifier checks: g^s = A ⋅ y^c

## PED: Pedersen Commitments

Prove that `V = g^b ⋅ h^r`

Public: `g, h, V`  
Private: `b, r`

Pick k_b, k_r ← 𝔽_p

Compute A = g^{k_b} ⋅ h^{k_r}

Verifier sends challenge c

Prover computes:
s_b = k_b + c⋅b
s_r = k_r + c⋅r

Verifier checks: g^{s_b} h^{s_r} = A ⋅ V^c


## Proof of Range

Given `V = g^b ⋅ h^r`, show that `b ∈ [0, 2^32)`

Decompose `b` into bits: `b = ∑ b_i ⋅ 2^i`  
Commit each bit: `V_i = g^{b_i} ⋅ h^{r_i}`  
Reconstruct: `V = ∏ V_i^{2^i}`

Each `V_i` must be either:

- `V_i = h^{r_i}` (if `b_i = 0`)
- `V_i = g ⋅ h^{r_i}` (if `b_i = 1`)

Prove each with a POE OR proof:

π_bit: V = h^r OR V/g = h^r


Use Fiat-Shamir to make all interactive protocols non-interactive by replacing `c` with `H(A)`
