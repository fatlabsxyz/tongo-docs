# Fund Operation
This operation converts ERC20 tokens into encrypted Tongo balance. The parameters are:
- `amount`: The amount of encrypted Tongo balance you want to fund to your Tongo account.
- `sender`: The sender of the transaction. In this case it is also the starknet account that will send the ERC20 to the Tongo contract to convert into encrypted Tongo balance.

 On Fund operations, the Tongo contract calls the function `transfer_from()` form the ERC20 to pull assets and assign encrypted balance the to Tongo account. For this to work the `sender` has to sign an `Approval` in the ERC20 to allow the Tongo contract to move funds.

 The `Approval` call is also created by the Fund operation, so the sender does not have to create it.

```typescript
const fundOp = await account.fund({
    amount: "AMOUNT_TO_FUND"
    sender: "SENDER_ADDRESS"
});

// Execute both approval and fund
await signer.execute([
    fundOp.approve!,    // ERC20 approval
    fundOp.toCalldata() // Fund operation
]);
```
### Balance Handling
When receiving a Fund operation for some amount, the cairo contract creates an ElGamal encryption of that amount for the account public key and fixed randomness. This encryption is added to the **balance** of the account. The **pending** balance of the account is not manipulated in this operation. 

### Zero-Knowledge Proof
In this opretaion, the only thing that has to be proven is the ownership of the Tongo account. This is done by proving knowledge of the account's private key.
