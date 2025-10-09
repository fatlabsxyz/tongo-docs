# Private Transfers

Send encrypted amounts between Tongo accounts without revealing the transfer amount.

## Basic Transfer

```typescript
const transferOp = await senderAccount.transfer({
    to: recipientAccount.publicKey,
    amount: 100n
});

const tx = await signer.execute([transferOp.toCalldata()]);
await provider.waitForTransaction(tx.transaction_hash);
```

## Transfer Flow

1. **Sender** balance decreases
2. **Recipient** pending increases  
3. **Recipient** must rollover to claim

```typescript
// After transfer, recipient checks state
const state = await recipientAccount.state();
console.log(state.pending); // 100n

// Rollover to claim
const rolloverOp = await recipientAccount.rollover();
await signer.execute([rolloverOp.toCalldata()]);
```

## Error Handling

```typescript
try {
    await account.transfer({ to: recipientPubKey, amount: 999999n });
} catch (error) {
    console.error(error.message); // "You dont have enough balance"
}
```

## Next Steps

- [Rollover Guide](rollover.md)
- [Complete Workflow](../examples/complete-workflow.md)
