# Rollover

Claim pending incoming transfers and move them to your spendable balance.

## What is Rollover?

When you receive a transfer, it goes to your **pending** balance. You must **rollover** to move it to your spendable **balance**.

```typescript
// After receiving a transfer
const state = await account.state();
console.log(state.balance);  // 0n
console.log(state.pending);  // 100n (received transfer)

// Rollover to claim
const rolloverOp = await account.rollover();
await signer.execute([rolloverOp.toCalldata()]);

// Now it's spendable
const newState = await account.state();
console.log(newState.balance);  // 100n
console.log(newState.pending);  // 0n
```

## When to Rollover

Roll over when:
- You received a transfer (pending > 0)
- You want to spend received funds
- You want to withdraw received funds

## Complete Example

```typescript
// Check for pending balance
const state = await account.state();

if (state.pending > 0n) {
    console.log(`Claiming $${state.pending} pending tokens`);$$

    // Create rollover operation
    const rolloverOp = await account.rollover();

    // Execute transaction
    const tx = await signer.execute([rolloverOp.toCalldata()]);
    await provider.waitForTransaction(tx.transaction_hash);

    console.log("Rollover complete!");

    // Verify new balance
    const newState = await account.state();
    console.log("New balance:", newState.balance);
}
```

## Error Handling

```typescript
try {
    await account.rollover();
} catch (error) {
    console.error(error.message); // "Your pending ammount is 0"
}
```

## Next Steps

- [Transfer Guide](transfers.md)
- [Complete Workflow](../examples/complete-workflow.md)
