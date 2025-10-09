# Funding Accounts

This guide shows you how to convert ERC20 tokens into encrypted Tongo balances.

## Overview

**Funding** deposits ERC20 tokens into a Tongo account, creating an encrypted balance.

### What Happens

1. Approve Tongo contract to spend ERC20 tokens
2. Contract transfers tokens from your wallet
3. Encrypted balance increases
4. ZK proof verifies the operation
5. AE hint created for faster decryption

## Basic Example

```typescript
import { Account as TongoAccount } from "@fatsolutions/tongo-sdk";
import { Account, RpcProvider } from "starknet";

// Create fund operation
const fundOp = await tongoAccount.fund({ amount: 1000n });

// Populate ERC20 approval
await fundOp.populateApprove();

// Execute both transactions
const tx = await signer.execute([
    fundOp.approve!,    // ERC20 approval
    fundOp.toCalldata() // Fund operation
]);

// Wait and check balance
await provider.waitForTransaction(tx.transaction_hash);
const state = await tongoAccount.state();
console.log("New balance:", state.balance); // 1000n
```

## Understanding Approval

Fund operations require two steps:
1. **ERC20 Approval**: Allow Tongo to spend tokens
2. **Fund Call**: Transfer tokens and update balance

```typescript
// SDK creates approval automatically
await fundOp.populateApprove();

// Now fundOp.approve contains the approval transaction
```

## Token Conversion

```typescript
// Check conversion rate
const rate = await tongoAccount.rate();
console.log("Rate:", rate); // e.g., 1n

// Convert between ERC20 and Tongo amounts
const erc20Amount = await tongoAccount.tongoToErc20(1000n);
const tongoAmount = await tongoAccount.erc20ToTongo(erc20Amount);
```

## Error Handling

```typescript
try {
    const fundOp = await tongoAccount.fund({ amount: 1000000n });
    await fundOp.populateApprove();
    await signer.execute([fundOp.approve!, fundOp.toCalldata()]);
} catch (error) {
    console.error("Fund failed:", error.message);
}
```

## Next Steps

- [Private Transfers](transfers.md)
- [Withdrawals](withdrawals.md)
