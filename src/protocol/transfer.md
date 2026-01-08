# Transfer Protocol

The transfer operation is the core of Tongo's confidential payment system, allowing users to send encrypted amounts while proving transaction validity through zero-knowledge proofs.

## Transfer Overview

When a user (sender) with public key \\(y_s\\) and balance \\(b_0\\) wants to transfer amount \\(b < b_0\\) to a receiver with public key \\(y_r\\), they must:

1. **Create encryptions** for sender, receiver, and auditor
2. **Generate ZK proofs** to validate the transaction
3. **Submit transaction** with ciphertexts and proofs

The key insight is that balances are updated **homomorphically** without revealing the transfer amount.

## Multi-Party Encryption

The sender creates (at least) three encryptions of the same amount \\(b\\) using the same blinding factor \\(r\\):

### Sender Encryption

$$(\mathit{L_s}, \mathit{R_s}) = \text{Enc}[y_s](b, r) = (g^b y_s^r, g^r)$$

This will be **subtracted** from the sender's balance.

### Receiver Encryption

$$(\mathit{L_r}, \mathit{R_r}) = \text{Enc}[y_r](b, r) = (g^b y_r^r, g^r)$$

This will be **added** to the receiver's pending balance.

### Auditor Encryption

$$(\mathit{L_a}, \mathit{R_a}) = \text{Enc}[y_a](b, r) = (g^b y_a^r, g^r)$$

This provides an audit trail for compliance without revealing amounts.

> **Security Note**: Using the same blinding factor \\(r\\) across all encryptions is safe for single-recipient transfers but could enable insider attacks in multi-recipient schemes. Tongo mitigates this by design.

## Transaction Structure

```rust
struct Transfer {
    from: PubKey,           // Sender's public key
    to: PubKey,             // Receiver's public key
    L: StarkPoint,          // L_s (sender encryption left)
    L_rec: StarkPoint,      // L_r (receiver encryption left)
    L_audit: StarkPoint,    // L_a (auditor encryption left)
    L_opt: Option<Array<(PubKey, StarkPoint)>>, // Additional viewing keys
    R: StarkPoint,          // Shared R component
    proof: ProofOfTransfer, // ZK proof bundle
}
```

## Required Zero-Knowledge Proofs

The sender must provide a comprehensive proof \\(\pi_{\text{transfer}}\\) demonstrating:

### 1. Ownership Proof (POE)

Prove knowledge of private key \\(x\\) such that \\(y_s = g^x\\):

$$\pi_{\text{ownership}}: \{(g, y_s; x) : y_s = g^x\}$$

### 2. Blinding Factor Proof (POE)

Prove knowledge of \\(r\\) such that \\(R = g^r\\):

$$\pi_{\text{blinding}}: \{(g, R; r) : R = g^r\}$$

### 3. Encryption Validity (PED)

Prove that \\(L_s\\) is correctly formed:

$$\pi_{\text{sender}}: \{(g, y_s, L_s; b, r) : L_s = g^b y_s^r\}$$

Prove that \\(L_r\\) uses the same \\(b\\) and \\(r\\):

$$\pi_{\text{receiver}}: \{(g, y_r, L_r; b, r) : L_r = g^b y_r^r\}$$

Prove that \\(L_a\\) uses the same \\(b\\) and \\(r\\):

$$\pi_{\text{auditor}}: \{(g, y_a, L_a; b, r) : L_a = g^b y_a^r\}$$

### 4. Range Proofs (RAN)

Prove the transfer amount is positive:

$$\pi_{\text{amount}}: \{(g, h, V_b; b, r_b) : V_b = g^b h^{r_b} \land b \in [0, b_{\max})\}$$

Prove the remaining balance is non-negative:

$$\pi_{\text{remaining}}: \{(g, h, V_{b^\prime}; b^\prime, r_{b^\prime}) : V_{b^\prime} = g^{b^\prime} h^{r_{b^\prime}} \land b^\prime \in [0, b_{\max})\}$$

Where \\(b^\prime = b_0 - b\\) is the sender's balance after the transfer.

## Complete Transfer Proof

The full proof statement combines all requirements:

$$\begin{aligned}
\pi_{\text{transfer}}: \\{&(g, y_s, y_r, L_0, R_0, L_s, L_r, R; x, b, b^\prime, r) : \\\\
&y_s = g^x \\\\
&\land R = g^r \\\\
&\land L_s = g^b y_s^r \\\\
&\land L_r = g^b y_r^r \\\\
&\land b \in [0, b_{\max}) \\\\
&\land L_0/L_s = g^{b^\prime}(R_0/R)^x \\\\
&\land b^\prime \in [0, b_{\max})\\}
\end{aligned}$$

Where \\((L_0, R_0)\\) represents the sender's current encrypted balance.

## Balance Updates

Upon successful proof verification, the contract performs homomorphic updates:

### Sender Balance Update

```rust
// Subtract transfer amount from sender
new_sender_balance = cipher_subtract(old_sender_balance, sender_cipher);
```

Mathematically:

$$(L_0, R_0) \div (L_s, R_s) = (L_0/L_s, R_0/R_s)$$

### Receiver Pending Update

```rust
// Add transfer amount to receiver's pending balance
new_pending_balance = cipher_add(old_pending_balance, receiver_cipher);
```

Mathematically:

$$(L_p, R_p) \cdot (L_r, R_r) = (L_p \cdot L_r, R_p \cdot R_r)$$

## Anti-Spam Protection

Transfers are added to the receiver's `pending` balance rather than their main balance to prevent spam attacks. This design:

1. **Prevents Spam Halting the Account**: Even if malicious actors spam the account, users can utilize their balance
2. **Enables atomic proofs**: Senders prove against a known balance state
3. **Requires explicit rollover**: Receivers must claim pending transfers

The receiver later calls `rollover()` to merge pending transfers into their main balance.

## Example Flow

```typescript
// 1. Sender creates transfer
const transfer = await sender.transfer({
    to: receiverPubKey,
    amount: 100n,
});

// 2. Submit to contract
await signer.execute([transfer.toCalldata()]);

// 3. Receiver claims pending balance
const rollover = await receiver.rollover();
await signer.execute([rollover.toCalldata()]);
```

## Security Considerations

### Replay Protection

Each proof includes the sender's nonce and contract address in the Fiat-Shamir challenge computation, preventing proof reuse.

### Range Proof Security

The 32-bit range proofs ensure:

- Transfer amounts are non-negative
- Remaining balances don't underflow
- No "money creation" attacks

### Homomorphic Security

The ElGamal encryption scheme maintains semantic security even under homomorphic operations, ensuring transferred amounts remain confidential.
