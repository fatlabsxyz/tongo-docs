# Rollover Operation
This operation takes the **pending** balance of the account and converts it to actual usable **balance** for the account. The parameter is:
- `sender`: The sender of the transaction.

```typescript
const rolloverOp = await account.rollover({
    sender: "SENDER_ADDRESS"
});

await signer.execute([rolloverOp.toCalldata()]);
```

### Balance Handling
When receiving a Rollover operation, the cairo contract adds the user's **pending** balance to the user's **balance**. After that the user's **pending** balance is reseted to zero.

### Zero-Knowledge Proof
In this opretaion, the only thing that has to be proven is the ownership of the Tongo account. This is done by proving knowledge of the account's private key.
