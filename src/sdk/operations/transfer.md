# Transfer Operation
This operation sends encrypted amounts between two Tongo accounts of the same Tongo instance without revealing the transfer amount. The parameters are:
- `amount`: The amount of encrypted Tongo you want to transfer.
- `to`: The public key of the Tongo account thaw will receive the transfer.
- `sender`: The sender of the transaction.


```typescript
const transferOp = await senderAccount.transfer({
    to: "RECEIVER_PUBLIC_KEY",
    amount: "AMOUNT_TO_TRANSFER"
    sender: "SENDER_ADDRESS"
});

const tx = await signer.execute([transferOp.toCalldata()]);
await provider.waitForTransaction(tx.transaction_hash);
```
### Balance Handling
As part of the Transfer operation, the user gives two ElGamal encryption of the same amount, one is encrypted for the sender's public key and it is subtracted from the sender's **balance**. The other one is encrypted for the receiver's public key and it is added to the receiver's **pending** balance.

### Zero-Knowledge Proof
In this operation, the ZK proof given by the sender shows:
- Ownership of the sender account.
- The two given encrpytion are valid encryptions for the same amount under the correct public keys.
- The amount encrypted in positive.
- After the subtraction, the sender's **balance** is positive.
