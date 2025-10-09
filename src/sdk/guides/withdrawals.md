# Withdrawals

Convert encrypted Tongo balance back to ERC20 tokens.

## Basic Withdrawal

```typescript
const withdrawOp = await account.withdraw({
    to: starknetAddress,  // Destination address
    amount: 500n           // Amount to withdraw
});

const tx = await signer.execute([withdrawOp.toCalldata()]);
await provider.waitForTransaction(tx.transaction_hash);
```

## What Happens

1. Encrypted balance is decreased
2. ERC20 tokens are transferred to destination address
3. Amount is converted using contract rate
4. Nonce is incremented

## Complete Example

```typescript
// Check balance before withdrawal
const stateBefore = await account.state();
console.log("Balance:", stateBefore.balance); // 1000n

// Withdraw 500 tokens to my wallet
const withdrawOp = await account.withdraw({
    to: signer.address,
    amount: 500n
});

const tx = await signer.execute([withdrawOp.toCalldata()]);
await provider.waitForTransaction(tx.transaction_hash);

// Check balance after withdrawal
const stateAfter = await account.state();
console.log("Balance:", stateAfter.balance); // 500n
console.log("Nonce:", stateAfter.nonce);     // Incremented
```

## Error Handling

```typescript
try {
    await account.withdraw({ to: address, amount: 999999n });
} catch (error) {
    console.error(error.message); // "You dont have enought balance"
}
```

## Next Steps

- [Funding Guide](funding.md)
- [Complete Workflow](../examples/complete-workflow.md)
