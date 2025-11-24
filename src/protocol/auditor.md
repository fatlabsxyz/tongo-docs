# Auditing & Compliance

Tongo provides flexible auditing mechanisms that enable compliance without sacrificing user privacy. Through viewing keys and ex-post proving, regulators can verify transaction details while preserving confidentiality for all other parties.

## Global Auditor

The Tongo contract can designate a **global auditor** with public key \\(y_a\\), the owner of the Tongo instance can rotate the auditor key anytime. If a Tongo instance was deployed without an auditor, it cannot be added after.


### **Auditor Encryptions**

1. Each time the **balance** of an account is modified, the owner of the account  must provide a encryption of the new balance for the auditor public key. A Zero-Knowledge proof that shows the encryption is correct and is indeed encrypting the new balance must be provided.

2. Each time a Transfer operation is made, the sender has to also provide an encryption of the transfered amount for the auditor public key. A Zero-Knowledge proof must also be provided.

Theese two kind of encryptions allow the auditor to reconstruct all transactional values while keeping those values confidential to third parties.

### **Multi-Signature Auditing**

For enhanced security, auditor keys can be distributed across multiple parties:

$$y_a = g^{a_1 + a_2} = g^{a_1} \cdot g^{a_2} = y_{a_1} \cdot y_{a_2}$$

Individual auditors can compute partial decryptions:

- Auditor 1: \\(R^{a_1} = (g^r)^{a_1}\\)
- Auditor 2: \\(R^{a_2} = (g^r)^{a_2}\\)

The balance is recovered by combining: \\(g^b = L_a / (R^{a_1} \cdot R^{a_2})\\)

This prevents any single auditor from unilaterally accessing transaction data.

## Ex-Post Proving & Viewing Keys
After a transfer is completed, participants may need to prove a specific transaction detail to a third party without revealing their private keys. Ex-post proving enables this through cryptographic proofs. These proofs can be created for diferent viewings keys if the user desires so.

### **Protocol**

Consider a completed transfer with ciphertext \\((TL, TR) = (g^{b_0} y^{r_0}, g^{r_0})\\). To prove the transfer amount to a third party with public key \\(\bar{y}\\). The sender must creates a new encryption of the transfer amount for \\(\bar{y}\\):

$$(\bar{L}, R) = \text{Enc}[\bar{y}](b, r)$$

The sender must provide a comprehensive proof \\(\pi_{\text{ExPost}}\\) demonstrating:

### 1. Ownership Proof

Prove knowledge of private key \\(x\\) such that \\(y_s = g^x\\). This proof can only be constructed with knowledge of the private key \\(x\\).

### 2. Same Encryption Proof

Prove that the given encryption is a correct ElGamal encryption under \\(\bar{y}\\). It also shows that this encryption and \\((TL, TR)\\) are encrypting the same amount.


### **Off-Chain Verification**

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
