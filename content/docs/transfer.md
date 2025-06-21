---
title: "Transfer"
weight: 3
---
# Transfer

When a user `y` who has a balance `b_0`, wants to transfer an amount `b < b_0` to another user `ȳ`, they must create two encryptions:

(L, R) = Enc[y](b, r)
(ȴ, ṙ) = Enc[ȳ](b, r)



The transaction is done by subtracting the encryption `(L, R)` from the `y` balance and adding the encryption `(ȴ, ṙ)` to the `ȳ` balance.

The sender has to prove that:

1. Knowledge of `x` such that `y = g^x` (POE)
2. Knowledge of `r` such that `R = g^r` (POE)
3. `L = g^b y^r` (PED)
4. `ȴ = g^b ȳ^r` (PED)
5. `b ∈ [0, b_max)` (RAN)
6. The balance after deduction `b' = b_0 - b` is positive (RAN)


