+++
title = "Tongo Protocol"
type = "docs"
weight = 1
+++

# Tongo Protocol

**Confidential payments for ERC20 tokens on Starknet.** Tongo wraps any ERC20 token with ElGamal encryption, enabling private transfers while maintaining full auditability and compliance features.

{{< hint info >}}
**No Trusted Setup** • Built entirely on elliptic curve cryptography with no zkSNARK circuits or ceremonies required.
{{< /hint >}}

## Live Demo

<div style="margin: 2rem 0; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.3);">
  <iframe width="100%" height="400" src="https://www.youtube.com/embed/a7wAI11m9YA" title="Tongo Demo" frameborder="0" allowfullscreen></iframe>
</div>

**Demo Transaction Sequence:**
- [**Fund**](https://sepolia.starkscan.co/tx/0x50d1d7642f500b7d36aaf54e1e277639dfdc8ee2b024bc343467c0ca23bea66): Convert ERC20 → Encrypted balance
- [**Transfer**](https://sepolia.starkscan.co/tx/0x66a068b49de77a00e932e4c8bea58e4b55ece41ca7b2f3e1df75e36d040478b): Private transfer with ZK proof  
- [**Rollover**](https://sepolia.starkscan.co/tx/0x1c535332e6e41d3cbf19c07aad7201b1f18b30875c736fe1719d67405b4a287): Claim pending transfers
- [**Withdraw**](https://sepolia.starkscan.co/tx/0x31e9da7714f8a89d66ac490f5e7465e5a6c104d58ac659aaf6c52efac9dc34f): Convert back to ERC20

---

## Protocol Features

{{% columns %}}

### **Privacy**
- **Encrypted balances** using ElGamal over Stark curve
- **Hidden amounts** in all transfers
- **Unlinkable transactions** with fresh randomness

<--->

### **Performance**  
- **~120K Cairo steps** per transfer verification
- **No circuits** or trusted setup required
- **Native Starknet** elliptic curve operations

<--->

### **Compliance**
- **Global auditor** encryption for all transfers
- **Selective viewing keys** for specific transactions  
- **Ex-post proving** for retroactive disclosure

{{% /columns %}}

---

## How It Works

Users generate keypairs $(x, y = g^x)$ and store balances as ElGamal ciphertexts:

$$\text{Enc}[y](b,r) = (g^b y^r, g^r)$$

**Additive homomorphism** enables balance updates without decryption. All operations require zero-knowledge proofs built from:

- **POE**: Proof of discrete logarithm knowledge
- **PED**: Pedersen commitment correctness
- **RAN**: Range proofs via bit decomposition

---

## Quick Start

{{< tabs "quickstart" >}}

{{% tab "Install SDK" %}}
```bash
npm install tongo-sdk
```

```typescript
import { Account } from "tongo-sdk";

const account = new Account(secretKey, tongoAddress);
console.log(account.prettyPublicKey());
```
{{% /tab %}}

{{% tab "Fund Account" %}}
```typescript
// Convert ERC20 to encrypted balance
const fundOp = await account.fund({
  amount: 1000n,
  erc20Address: tokenAddress
});

await signer.execute(fundOp.toCallData());
```
{{% /tab %}}

{{% tab "Private Transfer" %}}
```typescript
// Send hidden amount
const transferOp = await account.transfer({
  to: recipientPubKey,
  amount: 100n
});

await signer.execute(transferOp.toCallData());
```
{{% /tab %}}

{{< /tabs >}}

---

## Architecture

### [Protocol Documentation](/docs/intro-to-tongo)
Core concepts, cryptography, and security model

### [Cairo Contracts](/docs/contracts)  
Smart contract implementation and deployment

### [SHE Library](/docs/she)
Low-level homomorphic encryption primitives

### [TypeScript SDK](/docs/tongo-sdk)
High-level application interface

### [Auditing](/docs/auditor)
Compliance features and viewing keys

---

## Performance

| Operation | Cairo Steps | Proof Time |
|-----------|-------------|------------|
| Fund | ~50K | <1s |
| Transfer | ~120K | 2-3s |
| Withdraw | ~80K | 1-2s |

*Benchmarks on modern hardware with unoptimized implementation*

---

## Ecosystem

{{< hint info >}}
**Monorepo Structure**: All components developed together in `/libs` directory for consistency and rapid iteration.
{{< /hint >}}

- **Contracts**: Cairo smart contracts on Starknet
- **SHE**: Homomorphic encryption library  
- **SDK**: TypeScript client library
- **UI**: React frontend interface
- **Scripts**: Deployment automation