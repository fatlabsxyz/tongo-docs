# Complete Workflow Example

End-to-end example: Fund → Transfer → Rollover → Withdraw.

## Setup

```typescript
import { Account as TongoAccount } from "@fatsolutions/tongo-sdk";
import { Account, RpcProvider, constants } from "starknet";

const provider = new RpcProvider({
    nodeUrl: "https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_8/YOUR_API_KEY",
    specVersion: "0.8.1",
});

const signer = new Account(
    provider,
    "YOUR_ADDRESS",
    "YOUR_PRIVATE_KEY",
    undefined,
    constants.TRANSACTION_VERSION.V3
);

const tongoAddress = "0x028798470f0939d26aab8a3dcb144b9045fb113867ae205ad59b1b47ec904f00";

// Create two Tongo accounts
const account1 = new TongoAccount(82130983n, tongoAddress, provider);
const account2 = new TongoAccount(12930923n, tongoAddress, provider);
```

## 1. Fund Account 1

```typescript
console.log("=== Funding Account 1 ===");

const fundOp = await account1.fund({ amount: 5000n });
await fundOp.populateApprove();

const fundTx = await signer.execute([
    fundOp.approve!,
    fundOp.toCalldata()
]);

console.log("Fund TX:", fundTx.transaction_hash);
await provider.waitForTransaction(fundTx.transaction_hash);

const state1 = await account1.state();
console.log("Account 1 balance:", state1.balance); // 5000n
```

## 2. Transfer to Account 2

```typescript
console.log("=== Transferring to Account 2 ===");

const transferOp = await account1.transfer({
    to: account2.publicKey,
    amount: 500n
});

const transferTx = await signer.execute([transferOp.toCalldata()]);
console.log("Transfer TX:", transferTx.transaction_hash);
await provider.waitForTransaction(transferTx.transaction_hash);

// Check sender
const state1After = await account1.state();
console.log("Account 1 balance:", state1After.balance); // 4500n

// Check recipient
const state2 = await account2.state();
console.log("Account 2 pending:", state2.pending); // 500n
```

## 3. Rollover Account 2

```typescript
console.log("=== Rolling Over Account 2 ===");

const rolloverOp = await account2.rollover();
const rolloverTx = await signer.execute([rolloverOp.toCalldata()]);

console.log("Rollover TX:", rolloverTx.transaction_hash);
await provider.waitForTransaction(rolloverTx.transaction_hash);

const state2After = await account2.state();
console.log("Account 2 balance:", state2After.balance); // 500n
console.log("Account 2 pending:", state2After.pending); // 0n
```

## 4. Withdraw from Account 2

```typescript
console.log("=== Withdrawing from Account 2 ===");

const withdrawOp = await account2.withdraw({
    to: signer.address,
    amount: 250n
});

const withdrawTx = await signer.execute([withdrawOp.toCalldata()]);
console.log("Withdraw TX:", withdrawTx.transaction_hash);
await provider.waitForTransaction(withdrawTx.transaction_hash);

const state2Final = await account2.state();
console.log("Account 2 final balance:", state2Final.balance); // 250n
```

## Complete Script

```typescript
async function completeWorkflow() {
    // 1. Fund
    const fundOp = await account1.fund({ amount: 5000n });
    await fundOp.populateApprove();
    const fundTx = await signer.execute([fundOp.approve!, fundOp.toCalldata()]);
    await provider.waitForTransaction(fundTx.transaction_hash);

    // 2. Transfer
    const transferOp = await account1.transfer({
        to: account2.publicKey,
        amount: 500n
    });
    const transferTx = await signer.execute([transferOp.toCalldata()]);
    await provider.waitForTransaction(transferTx.transaction_hash);

    // 3. Rollover
    const rolloverOp = await account2.rollover();
    const rolloverTx = await signer.execute([rolloverOp.toCalldata()]);
    await provider.waitForTransaction(rolloverTx.transaction_hash);

    // 4. Withdraw
    const withdrawOp = await account2.withdraw({
        to: signer.address,
        amount: 250n
    });
    const withdrawTx = await signer.execute([withdrawOp.toCalldata()]);
    await provider.waitForTransaction(withdrawTx.transaction_hash);

    console.log("Complete workflow finished!");
}
```
