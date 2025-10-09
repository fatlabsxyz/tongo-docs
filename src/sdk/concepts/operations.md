# Operations

Operations are objects that represent Tongo transactions. Each operation encapsulates the cryptographic proofs, encrypted data, and calldata needed for a specific action.

## Operation Types

Tongo supports five core operations:

1. **Fund** - Convert ERC20 tokens to encrypted balance
2. **Transfer** - Send encrypted amounts to another account
3. **Withdraw** - Convert encrypted balance back to ERC20
4. **Rollover** - Claim pending incoming transfers
5. **Ragequit** - Emergency withdrawal of entire balance

## Operation Workflow

All operations follow a similar pattern:

```typescript
// 1. Create the operation
const operation = await account.someOperation({...params});

// 2. Convert to calldata
const calldata = operation.toCalldata();

// 3. Execute with Starknet signer
const tx = await signer.execute([calldata]);

// 4. Wait for confirmation
await provider.waitForTransaction(tx.transaction_hash);
```

## Fund Operation

Converts ERC20 tokens into encrypted Tongo balance.

### Creating a Fund Operation

```typescript
const fundOp = await account.fund({ amount: 1000n });
```

### Approving ERC20 Spending

Fund operations require ERC20 approval. The SDK provides a helper:

```typescript
// Populate the approval transaction
await fundOp.populateApprove();

// Execute both approval and fund
await signer.execute([
    fundOp.approve!,    // ERC20 approval
    fundOp.toCalldata() // Fund operation
]);
```

### What Happens

1. Generates ZK proof of funding
2. Creates encrypted balance ciphertext
3. Optionally creates audit ciphertext (if auditor is set)
4. Creates AE hint for faster decryption

## Transfer Operation

Sends encrypted amounts between Tongo accounts.

### Creating a Transfer Operation

```typescript
const transferOp = await account.transfer({
    to: recipientPublicKey,  // Recipient's public key
    amount: 100n             // Amount to transfer
});
```

### What Happens

1. Encrypts transfer amount for recipient
2. Encrypts new balance for sender
3. Generates ZK proof that:
   - Sender knows their private key
   - Transfer amount ≤ sender balance
   - New balance is correctly computed
4. Creates encrypted pending balance for recipient
5. Creates AE hints for both parties

### Result

- **Sender**: Balance reduced, nonce incremented
- **Recipient**: Pending balance increased (must rollover)

## Withdraw Operation

Converts encrypted Tongo balance back to ERC20 tokens.

### Creating a Withdraw Operation

```typescript
const withdrawOp = await account.withdraw({
    to: starknetAddress,  // Destination address (hex string)
    amount: 500n          // Amount to withdraw
});
```

### What Happens

1. Generates ZK proof that:
   - User knows their private key
   - Withdrawal amount ≤ current balance
   - New balance is correctly computed
2. Creates encrypted new balance
3. Creates AE hint for new balance
4. Transfers ERC20 tokens to destination address

### Important Notes

- The `to` address receives actual ERC20 tokens
- Amount is converted using the contract's rate
- Balance is reduced immediately

## Rollover Operation

Claims pending incoming transfers and moves them to spendable balance.

### Creating a Rollover Operation

```typescript
const rolloverOp = await account.rollover();
```

### What Happens

1. Reads current balance and pending balance
2. Generates ZK proof of knowledge of private key
3. Computes new balance = old balance + pending
4. Creates encrypted new balance
5. Resets pending to zero

### When to Rollover

You must rollover when:
- You've received a transfer (pending > 0)
- You want to spend received funds
- Before withdrawing received funds

### Example Flow

```typescript
// Check state before rollover
const stateBefore = await account.state();
console.log(stateBefore); // { balance: 0n, pending: 500n, nonce: 0n }

// Rollover
const rolloverOp = await account.rollover();
await signer.execute([rolloverOp.toCalldata()]);

// Check state after rollover
const stateAfter = await account.state();
console.log(stateAfter); // { balance: 500n, pending: 0n, nonce: 1n }
```

## Ragequit Operation

Emergency operation to withdraw entire balance at once.

### Creating a Ragequit Operation

```typescript
const ragequitOp = await account.ragequit({
    to: starknetAddress  // Destination for all funds
});
```

### What Happens

1. Withdraws **entire balance** to specified address
2. Zeroes out encrypted balance
3. Generates proof of balance ownership

### When to Use

- Emergency situations
- Account closure
- When you want to exit Tongo completely

> **Warning**: Ragequit withdraws **ALL** funds. Use `withdraw` for partial withdrawals.

## Operation Objects

### Common Interface

All operation objects implement:

```typescript
interface IOperation {
    type: OperationType;
    toCalldata(): Call;
}
```

### Converting to Calldata

Every operation can be converted to Starknet calldata:

```typescript
const operation = await account.transfer({...});
const calldata = operation.toCalldata();

// calldata is a Call object:
// {
//     contractAddress: string,
//     entrypoint: string,
//     calldata: string[]
// }
```

### Executing Operations

With a Starknet signer:

```typescript
// Single operation
await signer.execute([operation.toCalldata()]);

// Multiple operations (e.g., approve + fund)
await signer.execute([
    operation1.toCalldata(),
    operation2.toCalldata()
]);
```

## Proofs

Every operation (except rollover in some cases) includes a zero-knowledge proof. The SDK automatically:

1. Generates the proof using the SHE library
2. Includes it in the operation object
3. Serializes it for the contract

You don't need to worry about proof generation—it's all handled internally.

## Error Handling

Operations can fail during creation:

```typescript
try {
    const transferOp = await account.transfer({
        to: recipientPubKey,
        amount: 9999999n  // More than balance
    });
} catch (error) {
    console.error("Operation failed:", error.message);
    // "You dont have enough balance"
}
```

Common errors:
- `"You dont have enough balance"` - Insufficient funds for transfer/withdraw
- `"Your pending ammount is 0"` - Trying to rollover with no pending balance
- `"You dont have enought balance"` [sic] - Withdraw amount exceeds balance

## Gas Costs

Approximate gas costs on Starknet:

| Operation | Cairo Steps | Relative Cost |
|-----------|-------------|---------------|
| Fund      | ~50K        | Low           |
| Transfer  | ~120K       | Medium        |
| Rollover  | ~80K        | Low           |
| Withdraw  | ~80K        | Low           |
| Ragequit  | ~80K        | Low           |

> Actual costs vary based on network conditions and transaction complexity.

## Next Steps

- [Learn about Encrypted State](encrypted-state.md)
- [See operation guides](../guides/funding.md)
- [API Reference for Operations](../api/operations.md)
