# Encryption System

Tongo uses ElGamal encryption over elliptic curves to maintain confidential balances while enabling homomorphic operations on-chain.

## ElGamal Encryption

Each user's balance is encrypted using a public key derived from their private key. ElGamal encryption of an amount \\(b\\) under a public key \\(y\\) is a pair point of the group of elliptic curves points \\(G\\). The encryption function is defined as:

$$\begin{aligned}
\text{Enc}[y]&: [0, b_{\max}) \times \mathbb{F}_p \rightarrow G^2 \\\\
\text{Enc}[y]&\left(b,r\right) = (L, R) = (g^b y^r, g^r)
\end{aligned}$$

Where:

- \\(y = g^x\\) is the user's public key (derived from private key \\(x\\))
- \\(g\\) is the generator of the Stark curve
- \\(b\\) is the balance amount in the range \\([0, b_{\max})\\)
- \\(r\\) is a random blinding factor
- \\(p\\) is the curve order

## Additive Homomorphism

The key property of this encryption is **additive homomorphism**. Given two encryptions under the same public key, their product is a valid encryption of the sum:

$$\text{Enc}[y]\left(b,r\right) \cdot \text{Enc}[y]\left(b',r'\right) = (g^{b+b'} y^{r+r'}, g^{r+r'}) = \text{Enc}[y]\left(b+b', r+r'\right)$$

This allows the contract to:

- Add encrypted amounts without decryption
- Subtract encrypted amounts homomorphically
- Update balances while maintaining privacy

## Balance Decryption

To read their balance, a user recovers \\(g^b\\) using their private key \\(x\\):

$$\frac{L}{R^x} = \frac{g^b y^r}{(g^r)^x} = \frac{g^b (g^x)^r}{g^{rx}} = g^b$$

Since \\(b\\) is bounded by \\([0, b_{\max})\\), the discrete logarithm \\(b\\) can be brute-forced. The time requiered to decript a balance depends on \\(b_{\max}\\). Tongo is parametrized in this variable that we call `bit_size` the current implementation of Tongo uses `bit_size = 32`. A naïve JavaScript implementation can decrypt ~100k units per second, while optimized algorithms handle the full 32-bit range much faster. The common algorithms used for this kind of decryption are:

1. **Brute force**: Iterate \\(g^i\\) for \\(i = 0, 1, 2, \ldots\\) until matching \\(g^b\\)
2. **Baby-step Giant-step**: More efficient \\(O(\sqrt{n})\\) algorithm
3. **Pollard's rho**: Probabilistic algorithm with similar complexity
