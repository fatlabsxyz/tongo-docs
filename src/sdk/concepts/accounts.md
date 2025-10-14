# Accounts

In Tongo, an **Account** represents a confidential payment account with encrypted balances. Each account is identified by a public key derived from a private key.

## Account Class

The `Account` class is the main interface for interacting with Tongo. It manages:

- **Private/Public keypair**: For encryption and signing
- **Encrypted state**: Balance, pending, and nonce
- **Operations**: Creating fund, transfer, withdraw, and rollover operations
- **Decryption**: Decrypting encrypted balances

## Creating an Account

### From a Private Key

```typescript
import { Account as TongoAccount } from "@fatsolutions/tongo-sdk";
import { RpcProvider } from "starknet";

const provider = new RpcProvider({
    nodeUrl: "YOUR_RPC_URL",
    specVersion: "0.8.1",
});

// Tongo contract on Sepolia (wraps STRK with 1:1 rate)
const tongoAddress = "0x00b4cca30f0f641e01140c1c388f55641f1c3fe5515484e622b6cb91d8cee585";

// Create account with bigint private key
const privateKey = 82130983n;
const account = new TongoAccount(privateKey, tongoAddress, provider);
```

### From Bytes

You can also create an account from a `Uint8Array`:

```typescript
const privateKeyBytes = new Uint8Array([...]);
const account = new TongoAccount(privateKeyBytes, tongoAddress, provider);
```

## Account Properties

### Public Key

The public key is automatically derived from the private key:

```typescript
console.log(account.publicKey);
// { x: bigint, y: bigint }
```

### Tongo Address

Get the base58-encoded public key (Tongo address):

```typescript
const address = account.tongoAddress();
console.log(address);
// "Um6QEVHZaXkii8hWzayJf6PBWrJCTuJomAst75Zmy12"
```

You can also get a Tongo address from any private key without creating an Account:

```typescript
import { Account as TongoAccount } from "@fatsolutions/tongo-sdk";

const address = TongoAccount.tongoAddress(privateKey);
```

## Account State

### Raw State

Get the encrypted state directly from the contract:

```typescript
const rawState = await account.rawState();
console.log(rawState);
/*
{
    balance: CipherBalance,      // Encrypted balance
    pending: CipherBalance,       // Encrypted pending balance
    audit: CipherBalance | undefined,
    nonce: bigint,
    aeBalance: AEBalance | undefined,
    aeAuditBalance: AEBalance | undefined
}
*/
```

### Decrypted State

Get the decrypted balance and pending:

```typescript
const state = await account.state();
console.log(state);
/*
{
    balance: bigint,   // Decrypted balance
    pending: bigint,   // Decrypted pending
    nonce: bigint      // Account nonce
}
*/
```

### Nonce

Get just the account nonce:

```typescript
const nonce = await account.nonce();
console.log(nonce); // 1n
```

## Account Operations

Accounts can create various operations. Each method returns an operation object:

```typescript
// Fund operation
const fundOp = await account.fund({ amount: 1000n });

// Transfer operation
const transferOp = await account.transfer({
    to: recipientPublicKey,
    amount: 100n
});

// Withdraw operation
const withdrawOp = await account.withdraw({
    to: starknetAddress,
    amount: 50n
});

// Rollover operation
const rolloverOp = await account.rollover();
```

See [Operations](operations.md) for detailed information about each operation type.

## Token Conversions

Tongo contracts wrap ERC20 tokens with a configurable rate. The Account class provides utilities for conversions:

### Get Contract Rate

```typescript
const rate = await account.rate();
console.log(rate); // e.g., 1n for 1:1 ratio
```

### Convert ERC20 to Tongo Amount

```typescript
const erc20Amount = 1000000n; // 1 USDC (6 decimals)
const tongoAmount = await account.erc20ToTongo(erc20Amount);
console.log(tongoAmount);
```

> **Warning**: This method is for display purposes only and may not be exact due to rounding.

### Convert Tongo to ERC20 Amount

```typescript
const tongoAmount = 1000n;
const erc20Amount = await account.tongoToErc20(tongoAmount);
console.log(erc20Amount);
```

## Encryption and Decryption

### Decrypt Cipher Balance

Decrypt an encrypted balance:

```typescript
const rawState = await account.rawState();
const balance = account.decryptCipherBalance(rawState.balance);
console.log(balance); // 5000n
```

With a hint for faster decryption:

```typescript
const hint = 5000n; // Known or estimated balance
const balance = account.decryptCipherBalance(rawState.balance, hint);
```

### Decrypt AE Balance

Decrypt an AE-encrypted hint:

```typescript
const rawState = await account.rawState();
if (rawState.aeBalance) {
    const hint = await account.decryptAEBalance(
        rawState.aeBalance,
        rawState.nonce
    );
    console.log(hint); // The decrypted hint
}
```

## Key Concepts

### Private vs Public Key

- **Private Key**: Secret value (bigint or Uint8Array) that you must keep safe
- **Public Key**: Derived from private key, serves as your account identifier
- **Tongo Address**: Base58-encoded public key for easy sharing

### Tongo Account vs Starknet Account

- **Tongo Account**: For confidential transactions, separate keypair
- **Starknet Account**: For paying gas fees and interacting with Starknet

You need both:
- A **Starknet Account** to sign and submit transactions
- A **Tongo Account** to create confidential operations

### Balance vs Pending

- **Balance**: Your spendable, confirmed balance
- **Pending**: Incoming transfers that haven't been rolled over yet

You must call `rollover()` to move pending transfers into your spendable balance.

## Security Considerations

### Private Key Storage

Your Tongo private key should be:
- Stored securely (encrypted at rest)
- Never shared or transmitted
- Derived deterministically from your Starknet wallet (see [Key Management](key-management.md))

### Account Recovery

If you lose your Tongo private key:
- You cannot decrypt your balance
- You cannot spend your funds
- There is no recovery mechanism

**Always back up your private key!**

## Next Steps

- [Learn about Operations](operations.md)
- [Understand Encrypted State](encrypted-state.md)
- [Key Management Best Practices](key-management.md)
