---
title: "Encryption"
weight: 2
---
# Encryption 

Each account balance is encrypted using ElGamal encryption over elliptic curves, which supports additive homomorphism. A user's encrypted balance is represented as:

Enc[y](b, r) = (g^b y^r, g^r)


This is the key property Tongo leverages on-chain to efficiently update balances while keeping them private.

To decipher their balance a user can recover `g^b` with their private key by computing `L / R^x`. This is only possible with the knowledge of the private key `x`. Then `g^b` has to be brute-forced to obtain `b`. If `b` lies in a small range, such as `[0, 2^32)`, the brute force can be done without a problem.
