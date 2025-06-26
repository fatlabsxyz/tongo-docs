---
title: "Encryption System"
weight: 2
bookToC: true
---

# Encryption System

Tongo uses ElGamal encryption over elliptic curves to maintain confidential balances while enabling homomorphic operations on-chain.

## ElGamal Encryption

Each user's balance is encrypted using a public key derived from their private key. The encryption function is defined as:

$$\begin{aligned}
\text{Enc}[y]: [0, b_{\max}) \times \mathbb{F}_p &\rightarrow G^2 \\
\text{Enc}[y](b,r) &= (L, R) = (g^b y^r, g^r)
\end{aligned}$$

Where:
- {{< katex >}}y = g^x{{< /katex >}} is the user's public key (derived from private key {{< katex >}}x{{< /katex >}})
- {{< katex >}}g{{< /katex >}} is the generator of the Stark curve
- {{< katex >}}b{{< /katex >}} is the balance amount in the range {{< katex >}}[0, b_{\max}){{< /katex >}}
- {{< katex >}}r{{< /katex >}} is a random blinding factor
- {{< katex >}}p{{< /katex >}} is the curve order

## Additive Homomorphism

The key property that makes Tongo efficient is **additive homomorphism**. Given two encryptions under the same public key, their product is a valid encryption of the sum:

$$\text{Enc}[y](b,r) \cdot \text{Enc}[y](b',r') = (g^{b+b'} y^{r+r'}, g^{r+r'}) = \text{Enc}[y](b+b', r+r')$$

This allows the contract to:
- Add encrypted amounts without decryption
- Subtract encrypted amounts homomorphically
- Update balances while maintaining privacy

## Balance Decryption

To read their balance, a user recovers {{< katex >}}g^b{{< /katex >}} using their private key {{< katex >}}x{{< /katex >}}:

$$g^b = \frac{L}{R^x} = \frac{g^b y^r}{(g^r)^x} = \frac{g^b (g^x)^r}{g^{rx}} = g^b$$

Since {{< katex >}}b{{< /katex >}} is bounded by {{< katex >}}[0, 2^{32}){{< /katex >}}, the discrete logarithm {{< katex >}}b{{< /katex >}} can be computed efficiently through:

1. **Brute force**: Iterate {{< katex >}}g^i{{< /katex >}} for {{< katex >}}i = 0, 1, 2, ...{{< /katex >}} until matching {{< katex >}}g^b{{< /katex >}}
2. **Baby-step Giant-step**: More efficient {{< katex >}}O(\sqrt{n}){{< /katex >}} algorithm  
3. **Pollard's rho**: Probabilistic algorithm with similar complexity

A naïve JavaScript implementation can decrypt ~100k units per second, while optimized algorithms handle the full 32-bit range much faster.

## Storage Architecture

The Tongo contract maintains multiple encrypted representations of each balance:

### Primary Balances
- **`balance`**: Current encrypted balance using user's public key
- **`audit_balance`**: Same balance encrypted for global auditor's key
- **`pending`**: Buffer for incoming transfers (anti-spam protection)

### Recovery Balance
- **`sym_balance`**: Symmetrically encrypted balance for fast recovery

The symmetric encryption uses a key derived from the user's private key, allowing instant balance recovery without discrete log computation. This is particularly useful for mobile wallets and cross-device synchronization.

{{< hint info >}}
**Implementation Note**: The `sym_balance` is not cryptographically enforced by the protocol since there's no way to prove the user provided the correct symmetric ciphertext. It's purely a convenience feature.
{{< /hint >}}

## Security Properties

### Computational Assumptions
- **Discrete Log Problem**: Hard to find {{< katex >}}x{{< /katex >}} given {{< katex >}}g^x{{< /katex >}}
- **Decisional Diffie-Hellman**: Hard to distinguish random group elements from valid encryptions

### Practical Security
- **32-bit range**: Balances limited to {{< katex >}}[0, 2^{32}){{< /katex >}} for efficient decryption
- **Random blinding**: Each encryption uses fresh randomness
- **Curve security**: Relies on Stark curve (ECDSA-256 security level)

### Privacy Guarantees
- **Balance confidentiality**: Only the key holder can decrypt
- **Transaction privacy**: Transfer amounts remain hidden
- **Unlinkability**: Encrypted balances don't reveal relationships

## Example: Fund Operation

When a user funds their account with amount {{< katex >}}b{{< /katex >}}:

1. **Public inputs**: {{< katex >}}b{{< /katex >}} (revealed in ERC20 transfer), {{< katex >}}y{{< /katex >}} (user's public key)
2. **Encryption**: {{< katex >}}\text{Enc}[y](b, 1) = (g^b y, g){{< /katex >}} 
3. **Storage**: Add to user's encrypted balance homomorphically

Note that {{< katex >}}r = 1{{< /katex >}} is used for funding since the amount {{< katex >}}b{{< /katex >}} is already public in the ERC20 transaction.

```rust
// Cairo implementation (simplified)
let funded_cipher = CipherBalance {
    CL: (curve_ops::multiply(G, b) + curve_ops::multiply(y, 1)),
    CR: curve_ops::multiply(G, 1)
};

// Add to existing balance homomorphically
balance = cipher_add(balance, funded_cipher);
```

The homomorphic addition is performed point-wise:

$$L_{\text{new}} = L_{\text{old}} \cdot L_{\text{fund}}$$
$$R_{\text{new}} = R_{\text{old}} \cdot R_{\text{fund}}$$

This mathematical elegance allows Tongo to update balances without ever revealing the underlying amounts, forming the foundation for all confidential operations in the protocol.