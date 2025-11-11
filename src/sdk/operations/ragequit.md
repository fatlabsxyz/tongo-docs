# Ragequit Operation
This operation converts all the encrypted Tongo balance to ERC20 tokens and sends them to the given starknet account address. The parameters are:

- `to`: The starknet account address to send the ERC20 to.
- `sender`: The sender of the transaction.

```typescript
const ragequitOp = await senderAccount.ragequit({
    to: "RECEIVER_STARKNET_ACCOUNT_ADDRESS",
    sender: "SENDER_ADDRESS"
});

const tx = await signer.execute([ragequit.toCalldata()]);
await provider.waitForTransaction(tx.transaction_hash);
```

### Balance Handling
When receiving a Ragequit operation, the user discloses the total encrypted Tongo balance, after sending the unwrapped ERC20 to the starknet account address, the cairo contract resets the user's **balance** to zero. The **pending** balance of the account is not manipulated in this operation. 

### Zero-Knowledge Proof
In this opretaion, the only thing that has to be proven is the ownership of the Tongo account. This is done by proving knowledge of the account's private key.

### Zero-Knowledge Proof
In this operation, the ZK proof given by the sender shows:
- Ownership of the user account.
- The disclosed amount is the total **balance** of the user's account.
