# Range Proofs
This protocol allows a prover to convince a verifier that a commited value \\(b\\) belongs to a range \\([0, 2^n)\\). The protocol does this by ussing the binary decomposition of \\(b\\). We call  `bit_size` to the integer \\(n\\). The commitment is of the form
$$
V = g^b h^r
$$
where \\(g\\) and \\(h\\) are two generator points with discrete log relation unknown, \\(b\\) is the number we want to show belongs to the range  \\([0, 2^n)\\) and \\(r\\) is a blinding factor.

## Protocol

Any value \\(b \in [0, 2^n)\\) can be written as:

$$b = \sum_{i=0}^{n-1} b_i \cdot 2^i$$

Where each \\(b_i \in \{0, 1\}\\). For each bit \\(b_i\\), the prover creates a commitment with independent randomness \\(r_i\\) of the form 

$$V_i = g^{b_i} \cdot h^{r_i}$$

for each one of this commitments, the prover uses a [Bit](bit.md) protocol  to show that \\(V_i\\) is encoding either zero or one. Note that we can construct a commitment \\(V\\) with the commitments \\(V_i\\) by computing
$$
V = \prod_{i=0}^{n-1} V_i^{2^i} = g^b h^{r_{total}}
$$
where \\(r_{total} = \sum_{i=0}^{n-1} r_i 2^i\\). A verifier that constructs this \\(V\\) after all commitments \\(V_i\\) verify the [Bit](bit/md) protocol will be convinced that $V$ is a comitment to a value \\(b \in [0, 2^n)\\). This commitment $V$ can now be used as part of other protocols depending on what the prover wants to show.


## Cost Analysis (EC Operations)

### Prover Complexity
- 3n EC multiplications
- n EC addition

### Verifier Complexity
- 5n EC multiplications
- 4n EC addition


## Usage in Tongo

In a transfer operation in Tongo, the sender must show that the sended amount is positive and the remaining balance is positive. To prove anyone of this, the prover submits a Range proof, then the reconstructed commitment \\(V\\) is used as the \\(L\\)  part of a ElGamal encryption
$$
    (L, R) = (V, g^{r_{total}})
$$
this is a valid encryption for the publick key \\(h\\). The sender then uses the [SameEncrypt](same-encryption.md) protocol to shows that it encrypts the same amount as the encryption created for a transfer (showing then that the transfered balance is positive), or the `UnknownRandom` version to show that it encrypts the same amount of the remaining balance (showing then that the remainign balance is positive)
