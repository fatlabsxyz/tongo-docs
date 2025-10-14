# Complete Workflow Example

End-to-end example: Fund → Transfer → Rollover → Withdraw.

## Setup

```typescript
import { Account as TongoAccount } from "@fatsolutions/tongo-sdk";
import { Account, RpcProvider } from "starknet";

const provider = new RpcProvider({
    nodeUrl: "https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_8/YOUR_API_KEY",
    specVersion: "0.8.1",
});

const signer = new Account({
    provider,
    address: "YOUR_ADDRESS",
    signer: "YOUR_PRIVATE_KEY"
});

// Tongo contract address on Sepolia
// This contract wraps STRK with a 1:1 rate (1 STRK = 1 Tongo STRK)
const tongoAddress = "0x00b4cca30f0f641e01140c1c388f55641f1c3fe5515484e622b6cb91d8cee585";

// Create two Tongo accounts
const account1 = new TongoAccount(82130983n, tongoAddress, provider);
const account2 = new TongoAccount(12930923n, tongoAddress, provider);
```

> **Important Prerequisites:**
> - Your Starknet account (`YOUR_ADDRESS`) must have:
>   - Testnet ETH for gas fees
>   - STRK tokens (this contract wraps STRK on Sepolia)
>   - Get both from: https://starknet-faucet.vercel.app/
> - The funding operation will approve the Tongo contract to spend your STRK tokens

## 1. Fund Account 1

```typescript
console.log("=== Funding Account 1 ===");

// Fund with 1 STRK (STRK has 18 decimals)
const fundOp = await account1.fund({ amount: 1000000000000000000n }); // 1 STRK
await fundOp.populateApprove();

const fundTx = await signer.execute([
    fundOp.approve!,
    fundOp.toCalldata()
]);

console.log("Fund TX:", fundTx.transaction_hash);
await provider.waitForTransaction(fundTx.transaction_hash);

const state1 = await account1.state();
console.log("Account 1 balance:", state1.balance); // 1000000000000000000n (1 STRK)
```

## 2. Transfer to Account 2

```typescript
console.log("=== Transferring to Account 2 ===");

// Transfer 0.1 STRK to account 2
const transferOp = await account1.transfer({
    to: account2.publicKey,
    amount: 100000000000000000n  // 0.1 STRK
});

const transferTx = await signer.execute(transferOp.toCalldata());
console.log("Transfer TX:", transferTx.transaction_hash);
await provider.waitForTransaction(transferTx.transaction_hash);

// Check sender
const state1After = await account1.state();
console.log("Account 1 balance:", state1After.balance); // 900000000000000000n (0.9 STRK)

// Check recipient
const state2 = await account2.state();
console.log("Account 2 pending:", state2.pending); // 100000000000000000n (0.1 STRK)
```

## 3. Rollover Account 2

```typescript
console.log("=== Rolling Over Account 2 ===");

const rolloverOp = await account2.rollover();
const rolloverTx = await signer.execute(rolloverOp.toCalldata());

console.log("Rollover TX:", rolloverTx.transaction_hash);
await provider.waitForTransaction(rolloverTx.transaction_hash);

const state2After = await account2.state();
console.log("Account 2 balance:", state2After.balance); // 100000000000000000n (0.1 STRK)
console.log("Account 2 pending:", state2After.pending); // 0n
```

## 4. Withdraw from Account 2

```typescript
console.log("=== Withdrawing from Account 2 ===");

// Withdraw 0.05 STRK back to ERC20
const withdrawOp = await account2.withdraw({
    to: signer.address,
    amount: 50000000000000000n  // 0.05 STRK
});

const withdrawTx = await signer.execute(withdrawOp.toCalldata());
console.log("Withdraw TX:", withdrawTx.transaction_hash);
await provider.waitForTransaction(withdrawTx.transaction_hash);

const state2Final = await account2.state();
console.log("Account 2 final balance:", state2Final.balance); // 50000000000000000n (0.05 STRK)
```

## Key Concepts

- **STRK Amounts**: STRK has 18 decimals, so:
  - 1 STRK = `1000000000000000000n` (10^18)
  - 0.1 STRK = `100000000000000000n` (10^17)
  - 0.01 STRK = `10000000000000000n` (10^16)
- **1:1 Rate**: This Tongo contract uses a 1:1 conversion rate (1 STRK = 1 Tongo STRK)
- **Fund Operation**: Requires both approval and fund call (use array with both)
- **Other Operations**: Single call each (transfer, rollover, withdraw)

## Complete Script

```typescript
async function completeWorkflow() {
    // 1. Fund with 1 STRK
    const fundOp = await account1.fund({ amount: 1000000000000000000n }); // 1 STRK
    await fundOp.populateApprove();
    const fundTx = await signer.execute([fundOp.approve!, fundOp.toCalldata()]);
    await provider.waitForTransaction(fundTx.transaction_hash);

    // 2. Transfer 0.1 STRK
    const transferOp = await account1.transfer({
        to: account2.publicKey,
        amount: 100000000000000000n  // 0.1 STRK
    });
    const transferTx = await signer.execute(transferOp.toCalldata());
    await provider.waitForTransaction(transferTx.transaction_hash);

    // 3. Rollover
    const rolloverOp = await account2.rollover();
    const rolloverTx = await signer.execute(rolloverOp.toCalldata());
    await provider.waitForTransaction(rolloverTx.transaction_hash);

    // 4. Withdraw 0.05 STRK
    const withdrawOp = await account2.withdraw({
        to: signer.address,
        amount: 50000000000000000n  // 0.05 STRK
    });
    const withdrawTx = await signer.execute(withdrawOp.toCalldata());
    await provider.waitForTransaction(withdrawTx.transaction_hash);

    console.log("Complete workflow finished!");
}
```
