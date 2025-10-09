# Auditing & Compliance

Tongo provides flexible auditing mechanisms that enable compliance without sacrificing user privacy. Through viewing keys and ex-post proving, regulators can verify transaction details while preserving confidentiality for all other parties.

## Global Auditor

### Concept

The Tongo contract can designate a **global auditor** with public key \\(y_a\\). All transfers are automatically encrypted for this auditor, providing a comprehensive audit trail without revealing amounts on-chain.

### Auditor Encryption

For every transfer of amount \\(b\\), the sender creates three encryptions:

- **Sender**: \\((L_s, R) = \text{Enc}[y_s](b, r)\\) - subtracted from balance
- **Receiver**: \\((L_r, R) = \text{Enc}[y_r](b, r)\\) - added to pending
- **Auditor**: \\((L_a, R) = \text{Enc}[y_a](b, r)\\) - stored for audit

All three use the same blinding factor \\(r\\), proven via Pedersen commitment proofs.

### Multi-Signature Auditing

For enhanced security, auditor keys can be distributed across multiple parties:

$$y_a = g^{a_1 + a_2} = g^{a_1} \cdot g^{a_2} = y_{a_1} \cdot y_{a_2}$

Individual auditors can compute partial decryptions:

- Auditor 1: \\(R^{a_1} = (g^r)^{a_1}\\)
- Auditor 2: \\(R^{a_2} = (g^r)^{a_2}\\)

The balance is recovered by combining: \\(g^b = L_a / (R^{a_1} \cdot R^{a_2})\\)

This prevents any single auditor from unilaterally accessing transaction data.

## Viewing Keys

### Selective Disclosure

Users can optionally encrypt transfers for additional viewing keys beyond the global auditor:

```rust
struct Transfer {
    // ... other fields ...
    L_opt: Option<Array<(PubKey, StarkPoint)>>, // Additional viewing keys
}
```

Each viewing key \\((y_v, L_v)\\) represents:

$$L_v = g^b y_v^r$

The sender proves each additional encryption is correctly formed using Pedersen commitment proofs.

### Use Cases

- **Compliance officers**: Institutional oversight
- **Tax authorities**: Jurisdiction-specific reporting
- **Internal auditing**: Corporate governance

### Privacy-Preserving Architecture

Viewing keys maintain privacy by:

- Only revealing amounts to authorized parties
- Not exposing transaction values on-chain
- Allowing granular access control per transaction

## Ex-Post Proving

### Motivation

After a transfer is completed, participants may need to prove a specific transaction detail to a third party without revealing their private keys. Ex-post proving enables this through cryptographic proofs.

### Protocol

Consider a completed transfer with ciphertext \\((TL, TR) = (g^{b_0} y^{r_0}, g^{r_0})\\). To prove the transfer amount to a third party with public key \\(\bar{y}\\):

#### 1. Revelation Phase

The sender creates new encryptions of the same amount:

- **Sender encryption**: \\((L, R) = \text{Enc}[y](b, r)\\)
- **Third-party encryption**: \\((\bar{L}, R) = \text{Enc}[\bar{y}](b, r)\\)

#### 2. Consistency Proof

The sender proves the new encryptions contain the same amount as the original transfer:

$$\frac{TL}{L} = \left(\frac{TR}{R}\right)^x$$

This equality holds if and only if \\(b_0 = b\\) (the amounts match).

#### 3. Required Proofs

The complete ex-post proof \\(\pi_{\text{expost}}\\) demonstrates:

1. **Ownership**: Knowledge of \\(x\\) such that \\(y = g^x\\) (POE)
2. **Blinding**: Knowledge of \\(r\\) such that \\(R = g^r\\) (POE)
3. **Sender encryption**: \\(L = g^b y^r\\) (PED)
4. **Third-party encryption**: \\(\bar{L} = g^b \bar{y}^r\\) (PED)
5. **Consistency**: \\(TL/L = (TR/R)^x\\) (POE)

### Mathematical Foundation

The consistency check works because:

$$\frac{TL}{L} = \frac{g^{b_0} y^{r_0}}{g^b y^r} = g^{b_0-b} y^{r_0-r}$$

$$\left(\frac{TR}{R}\right)^x = \left(\frac{g^{r_0}}{g^r}\right)^x = g^{(r_0-r)x} = y^{r_0-r}$$

These are equal only when \\(b_0 = b\\), proving amount consistency.

### Off-Chain Verification

Ex-post proofs require no on-chain interaction:

- Transaction data is retrieved from chain state
- Proofs are generated and verified off-chain
- Only requires the original transaction hash as reference

## Regulatory Compliance

### AML/KYC Integration

Tongo supports various compliance frameworks:

#### Real-Time Monitoring

- Global auditor receives all transaction encryptions
- Automated threshold detection (encrypted amounts)
- Pattern analysis on transaction graphs

#### Selective Disclosure

- Users can voluntarily encrypt for compliance officers
- Jurisdiction-specific reporting requirements
- Time-limited viewing key access

#### Retroactive Investigation

- Ex-post proving enables transaction reconstruction
- User cooperation required for private key revelation
- Court-ordered disclosure mechanisms

## Advanced Features

### Threshold Auditing

Multiple auditors with threshold decryption:

$$y_a = \sum_{i=1}^n w_i \cdot y_{a_i}$$

Where \\(w_i\\) are threshold weights and \\(t\\) out of \\(n\\) auditors are required for decryption.

### Zero-Knowledge Compliance

Prove compliance properties without revealing amounts:

- **Range compliance**: Prove transfer amount below threshold
- **Velocity limits**: Prove cumulative amounts within bounds
- **Whitelist compliance**: Prove recipient authorization

These advanced features demonstrate Tongo's flexibility in balancing privacy and regulatory requirements across diverse jurisdictions and use cases.
