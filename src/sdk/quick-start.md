# Quick Start

This guide will walk you through your first Tongo confidential transfer in just a few minutes.

## Prerequisites

- Node.js v18+ installed
- A Starknet account with some testnet ETH (for gas fees)
- Basic familiarity with TypeScript and Starknet

## Setup

Install the required packages:

```bash
npm install @fatsolutions/tongo-sdk starknet
```

## Basic Workflow

A typical Tongo workflow involves four steps:

1. **Fund** - Convert ERC20 tokens to encrypted balance
2. **Transfer** - Send confidential transfers
3. **Rollover** - Claim pending incoming transfers
4. **Withdraw** - Convert back to ERC20 tokens

## Complete Example

### Step 1: Setup Provider and Signer

```typescript
import { Account as TongoAccount } from "@fatsolutions/tongo-sdk";
import { Account, RpcProvider } from "starknet";

// Setup Starknet provider (Sepolia testnet)
const provider = new RpcProvider({
    nodeUrl: "https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_8/YOUR_API_KEY",
    specVersion: "0.8.1",
});

// Your Starknet account (for paying gas fees)
const signer = new Account({
    provider,
    address: "YOUR_STARKNET_ADDRESS",
    signer: "YOUR_PRIVATE_KEY"
});

// Tongo contract address on Sepolia
// This contract wraps STRK with a 1:1 rate (1 STRK = 1 Tongo STRK)
const tongoAddress = "0x00b4cca30f0f641e01140c1c388f55641f1c3fe5515484e622b6cb91d8cee585";
```

> **Important**: Your Starknet account must have:
> - Testnet ETH for gas fees
> - STRK tokens (this contract wraps STRK on Sepolia testnet)
> - Get testnet STRK from: https://starknet-faucet.vercel.app/

### Step 2: Create Tongo Accounts

```typescript
// Create two Tongo accounts with different private keys
const account1PrivateKey = 82130983n; // Your Tongo private key
const account2PrivateKey = 12930923n; // Recipient's Tongo private key

const account1 = new TongoAccount(account1PrivateKey, tongoAddress, provider);
const account2 = new TongoAccount(account2PrivateKey, tongoAddress, provider);

console.log("Account 1 Public Key:", account1.publicKey);
console.log("Account 2 Public Key:", account2.publicKey);
```

> **Note**: Tongo private keys are separate from Starknet private keys. See [Key Management](concepts/key-management.md) for details.

### Step 3: Fund Account 1

```typescript
// Fund account 1 with 1 STRK (STRK has 18 decimals, so 1 STRK = 10^18)
const fundOp = await account1.fund({ amount: 1000000000000000000n }); // 1 STRK

// Populate the ERC20 approval transaction
await fundOp.populateApprove();

// Execute both approval and fund transactions
const fundTx = await signer.execute([
    fundOp.approve!,  // Approve Tongo contract to spend tokens
    fundOp.toCalldata()  // Fund operation
]);

console.log("Fund transaction:", fundTx.transaction_hash);

// Wait for transaction confirmation
await provider.waitForTransaction(fundTx.transaction_hash);
```

### Step 4: Check Balance

```typescript
// Get encrypted state
const state1 = await account1.rawState();

// Decrypt balance
const balance = account1.decryptCipherBalance(state1.balance);
console.log("Account 1 balance:", balance); // 1000000000000000000n (1 STRK)

// Or use the convenience method
const decryptedState = await account1.state();
console.log("Decrypted state:", decryptedState);
// { balance: 1000000000000000000n, pending: 0n, nonce: 1n }
```

### Step 5: Transfer to Account 2

```typescript
// Transfer 0.1 STRK from account 1 to account 2
const transferOp = await account1.transfer({
    to: account2.publicKey,
    amount: 100000000000000000n  // 0.1 STRK
});

const transferTx = await signer.execute(transferOp.toCalldata());
console.log("Transfer transaction:", transferTx.transaction_hash);

await provider.waitForTransaction(transferTx.transaction_hash);
```

### Step 6: Check Account States

```typescript
// Check sender balance (should be reduced)
const state1After = await account1.state();
console.log("Account 1 after transfer:", state1After);
// { balance: 900000000000000000n, pending: 0n, nonce: 2n } // 0.9 STRK remaining

// Check recipient pending balance (not yet rolled over)
const state2 = await account2.state();
console.log("Account 2 state:", state2);
// { balance: 0n, pending: 100000000000000000n, nonce: 0n } // 0.1 STRK pending
```

### Step 7: Rollover (Claim Transfer)

```typescript
// Account 2 must rollover to claim the pending transfer
const rolloverOp = await account2.rollover();

const rolloverTx = await signer.execute(rolloverOp.toCalldata());
console.log("Rollover transaction:", rolloverTx.transaction_hash);

await provider.waitForTransaction(rolloverTx.transaction_hash);

// Check account 2 balance again
const state2After = await account2.state();
console.log("Account 2 after rollover:", state2After);
// { balance: 100000000000000000n, pending: 0n, nonce: 1n } // 0.1 STRK now spendable
```

### Step 8: Withdraw

```typescript
// Withdraw 0.05 STRK back to ERC20
const withdrawOp = await account2.withdraw({
    to: signer.address,  // Withdraw to your Starknet address
    amount: 50000000000000000n  // 0.05 STRK
});

const withdrawTx = await signer.execute(withdrawOp.toCalldata());
console.log("Withdraw transaction:", withdrawTx.transaction_hash);

await provider.waitForTransaction(withdrawTx.transaction_hash);

// Final balance check
const state2Final = await account2.state();
console.log("Account 2 final state:", state2Final);
// { balance: 50000000000000000n, pending: 0n, nonce: 2n } // 0.05 STRK remaining
```

## Key Concepts

- **Tongo Account**: A separate keypair for confidential transactions (different from Starknet account)
- **Encrypted Balance**: Your balance is stored encrypted on-chain
- **Pending Balance**: Incoming transfers must be "rolled over" to be spendable
- **Nonce**: Each account has a nonce that increments with each operation
- **STRK Decimals**: STRK has 18 decimals, so 1 STRK = 1000000000000000000n (10^18)
- **1:1 Rate**: This Tongo contract uses a 1:1 conversion rate (1 STRK in = 1 Tongo STRK out)

## Next Steps

- [Learn about Accounts](concepts/accounts.md)
- [Understand Operations](concepts/operations.md)
- [See complete examples](examples/complete-workflow.md)
- [Integrate with wallets](guides/wallet-integration.md)
