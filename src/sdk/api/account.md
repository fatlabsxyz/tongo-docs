# Account Class API Reference

Complete API reference for the `Account` class.

## Constructor

```typescript
new Account(
    pk: BigNumberish | Uint8Array,
    contractAddress: string,
    provider: RpcProvider
): Account
```

**Parameters:**
- `pk`: Private key as bigint or Uint8Array
- `contractAddress`: Tongo contract address
- `provider`: Starknet RPC provider

**Example:**
```typescript
const account = new TongoAccount(privateKey, tongoAddress, provider);
```

## Static Methods

### tongoAddress()

Get Tongo address from a private key without creating an Account.

```typescript
static tongoAddress(pk: BigNumberish | Uint8Array): TongoAddress
```

## Properties

### publicKey

```typescript
publicKey: PubKey
```

The account's public key (elliptic curve point).

### pk

```typescript
pk: bigint
```

The account's private key (internal, don't access directly).

## State Methods

### state()

Get decrypted account state.

```typescript
async state(): Promise<AccountState>
```

**Returns:**
```typescript
{
    balance: bigint;
    pending: bigint;
    nonce: bigint;
}
```

### rawState()

Get encrypted account state.

```typescript
async rawState(): Promise<RawAccountState>
```

**Returns:**
```typescript
{
    balance: CipherBalance;
    pending: CipherBalance;
    audit?: CipherBalance;
    nonce: bigint;
    aeBalance?: AEBalance;
    aeAuditBalance?: AEBalance;
}
```

### nonce()

Get account nonce.

```typescript
async nonce(): Promise<bigint>
```

### tongoAddress()

Get base58-encoded Tongo address.

```typescript
tongoAddress(): TongoAddress
```

## Operation Methods

### fund()

Create a fund operation.

```typescript
async fund(details: FundDetails): Promise<FundOperation>
```

**Parameters:**
```typescript
interface FundDetails {
    amount: bigint;
}
```

### transfer()

Create a transfer operation.

```typescript
async transfer(details: TransferDetails): Promise<TransferOperation>
```

**Parameters:**
```typescript
interface TransferDetails {
    amount: bigint;
    to: PubKey;
}
```

### withdraw()

Create a withdraw operation.

```typescript
async withdraw(details: WithdrawDetails): Promise<WithdrawOperation>
```

**Parameters:**
```typescript
interface WithdrawDetails {
    to: string;      // Starknet address
    amount: bigint;
}
```

### rollover()

Create a rollover operation.

```typescript
async rollover(): Promise<RollOverOperation>
```

### ragequit()

Create a ragequit operation.

```typescript
async ragequit(details: RagequitDetails): Promise<RagequitOperation>
```

**Parameters:**
```typescript
interface RagequitDetails {
    to: string;  // Starknet address
}
```

## Utility Methods

### rate()

Get contract conversion rate.

```typescript
async rate(): Promise<bigint>
```

### erc20ToTongo()

Convert ERC20 amount to Tongo amount (approximate).

```typescript
async erc20ToTongo(erc20Amount: bigint): Promise<bigint>
```

### tongoToErc20()

Convert Tongo amount to ERC20 amount (exact).

```typescript
async tongoToErc20(tongoAmount: bigint): Promise<bigint>
```

## Decryption Methods

### decryptCipherBalance()

Decrypt a CipherBalance.

```typescript
decryptCipherBalance(cipher: CipherBalance, hint?: bigint): bigint
```

### decryptAEBalance()

Decrypt an AEBalance hint.

```typescript
async decryptAEBalance(aeBalance: AEBalance, accountNonce: bigint): Promise<bigint>
```

## Event Methods

### getTxHistory()

Get complete transaction history.

```typescript
async getTxHistory(initialBlock: number): Promise<AccountEvents[]>
```

### getEventsFund()

Get fund events.

```typescript
async getEventsFund(initialBlock: number): Promise<AccountFundEvent[]>
```

### getEventsTransferOut()

Get transfer out events.

```typescript
async getEventsTransferOut(initialBlock: number): Promise<AccountTransferOutEvent[]>
```

### getEventsTransferIn()

Get transfer in events.

```typescript
async getEventsTransferIn(initialBlock: number): Promise<AccountTransferInEvent[]>
```

### getEventsRollover()

Get rollover events.

```typescript
async getEventsRollover(initialBlock: number): Promise<AccountRolloverEvent[]>
```

### getEventsWithdraw()

Get withdraw events.

```typescript
async getEventsWithdraw(initialBlock: number): Promise<AccountWithdrawEvent[]>
```

### getEventsRagequit()

Get ragequit events.

```typescript
async getEventsRagequit(initialBlock: number): Promise<AccountRagequitEvent[]>
```

## Audit Methods

### generateExPost()

Generate ex-post proof for a transfer.

```typescript
generateExPost(to: PubKey, cipher: CipherBalance): ExPost
```

### verifyExPost()

Verify an ex-post proof.

```typescript
verifyExPost(expost: ExPost): bigint
```
