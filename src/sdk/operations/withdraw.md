# Withdraw Operation
This operation converts encrypted Tongo balance to ERC20 tokens and sends them to the given starknet account address. The parameters are:
- `amount`: The amount of Tongo balance to withdraw.
- `to`: The starknet account address to send the ERC20 to.
- `sender`: The sender of the transaction.

Convert encrypted Tongo balance back to ERC20 tokens.

```typescript
const withdrawOp = await senderAccount.withdraw({
    to: "RECEIVER_STARKNET_ACCOUNT_ADDRESS",
    amount: "AMOUNT_TO_WITHDRAW"
    sender: "SENDER_ADDRESS"
});

const tx = await signer.execute([withdrawOp.toCalldata()]);
await provider.waitForTransaction(tx.transaction_hash);
```
### Balance Handling
When receiving a Withdraw operation for some amount, the cairo contract creates an ElGamal encryption of that amount for the account public key and fixed randomness. This encryption is subtracted from  **balance** of the account. The **pending** balance of the account is not manipulated in this operation. 

### Zero-Knowledge Proof
In this operation, the ZK proof given by the sender shows:
- Ownership of the user account.
- After the subtraction, the user's **balance** is positive.
