# Ragequit Operation
This operation converts all the encrypted Tongo balance to ERC20 tokens and sends them to the given starknet account address. The parameters are:

- `to`: The starknet account address to send the ERC20 to.
- `sender`: The sender of the transaction.
- `feeToSender` *(optional, v2)*: An amount of Tongos paid to the transaction sender, used to reimburse a relayer. See [Relaying](../relaying.md).

```typescript
const ragequitOp = await tongoAccount.ragequit({
    to: "RECEIVER_STARKNET_ACCOUNT_ADDRESS",
    sender: "SENDER_ADDRESS"
});

const tx = await signer.execute([ragequit.toCalldata()]);
await provider.waitForTransaction(tx.transaction_hash);
```

### Balance Handling
When receiving a Ragequit operation, the user discloses the total encrypted Tongo balance, after sending the unwrapped ERC20 to the starknet account address, the cairo contract resets the user's **balance** to zero. The **pending** balance of the account is not manipulated in this operation. 

### Zero-Knowledge Proof
In this operation, the ZK proof given by the sender shows:
- Ownership of the user account.
- The disclosed amount is the total **balance** of the user's account.
