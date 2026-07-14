# Transfer Operation
This operation sends encrypted amounts between two Tongo accounts of the same Tongo instance without revealing the transfer amount. The parameters are:
- `amount`: The amount of encrypted Tongo you want to transfer.
- `to`: The public key of the Tongo account thaw will receive the transfer.
- `sender`: The sender of the transaction.
- `feeToSender` *(optional, v2)*: An amount of Tongos paid to the transaction sender. Used to reimburse a relayer — see [Relaying](../relaying.md).
- `toTongo` *(optional, v2)*: The address of a different Tongo instance to send to. Turns the transfer into an **External Transfer** (see below).


```typescript
const transferOp = await tongoAccount.transfer({
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

## External Transfer (v2)
A regular transfer moves Tongos between two accounts of the **same** Tongo instance. An **External Transfer** moves them to an account living in a **different** Tongo instance deployed by the same [Vault](../../protocol/vault.md). You trigger it by passing the receiver instance address as `toTongo`:

```typescript
const externalOp = await tongoAccount.transfer({
    to: "RECEIVER_PUBLIC_KEY",
    amount: "AMOUNT_TO_TRANSFER",
    sender: "SENDER_ADDRESS",
    toTongo: "RECEIVER_TONGO_INSTANCE_ADDRESS",
});

const tx = await signer.execute(externalOp.toCalldata());
await provider.waitForTransaction(tx.transaction_hash);
```

For this to succeed the receiver's Tongo instance must have approved the sender's instance on-chain. The transaction is declared for the auditor of both Tongo incantes (if they are set). The receiving instance emits a `ReceivedExternalTransfer` event.
