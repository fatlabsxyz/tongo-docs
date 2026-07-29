# Account Class

The `Account` class is the main interface for interacting with Tongo. An instance represents a user's account for a specific Tongo contract. Some of its functionalities are:
- Decrypting the balance of the user.
- Creating the [Operations](operations/operations.md) with the ZK proofs needed.
- Decrypting and showing the transaction history for the user.

## Creating an Account
The provider can be an `RpcProvider` or directly the RPC url.

<div class="version-tabs" data-version-tabs>
<div class="version-tabs__buttons">
<button class="version-tab is-active" type="button" data-version="v2">v2</button>
<button class="version-tab" type="button" data-version="v1">v1</button>
</div>

<div class="version-panel is-active" data-version-panel="v2">

```typescript
import { Account as TongoAccount } from "@fatsolutions/tongo-sdk";
import { RpcProvider } from "starknet";

const provider = new RpcProvider({
    nodeUrl: "YOUR_RPC_URL",
    specVersion: "0.10.0",
});

const tongoAddress = "TONGO_CONTRACT_ADDRESS";
const privateKey = "USER_TONGO_PRIVATE_KEY";

const tongoAccount = new TongoAccount(privateKey, tongoAddress, provider);
```

</div>

<div class="version-panel" data-version-panel="v1">

```typescript
import { Account as TongoAccount } from "@fatsolutions/tongo-sdk";
import { RpcProvider } from "starknet";

const provider = new RpcProvider({
    nodeUrl: "YOUR_RPC_URL",
    specVersion: "0.8.1",
});

const tongoAddress = "TONGO_CONTRACT_ADDRESS";
const privateKey = "USER_TONGO_PRIVATE_KEY";

const tongoAccount = new TongoAccount(privateKey, tongoAddress, provider);
```

</div>

</div>

## Public Key
Each instance of a Tongo `Account` is identified by its public key. At low level the public key is the elliptic curve point
$$
pk = g^{sk}
$$
where \\(pk\\) is the public key, \\(sk\\) is the secret key and \\(g\\) is the stark curve generator. This form is used at low level to create the Zero-Knowledge proofs. To read it use the `publicKey` property:

```typescript
console.log(account.publicKey);
// { x: bigint, y: bigint }
```

For a cleaner representation we offer a base58-encoded one. We call it the Tongo address of the account:

```typescript
const address = account.tongoAddress();
console.log(address);
// "Um6QEVHZaXkii8hWzayJf6PBWrJCTuJomAst75Zmy12"
```
> **Note** We offer the utility functions `pubKeyBase58ToAffine()` and `pubKeyAffineToBase58()` in `types.ts` to convert between the two representations of the public key.

## Account State
The high level state of a Tongo account is its `balance`, `pending` and `nonce`. Use the `state()` method:

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
`state()` queries the Tongo contract for the raw state and decrypts the balances using the encrypted hints stored in the contract. The raw (encrypted) state that lives on-chain can be read with `rawState()`:

```typescript
const rawState = await account.rawState();
console.log(rawState);
/*
{
    balanceCipher: CipherBalance,        // Encrypted balance
    pendingCipher: CipherBalance,        // Encrypted pending balance
    auditCipher: CipherBalance | undefined, // Encrypted balance for auditor
    aeBalance?: AEBalance,               // Hint to decrypt `balanceCipher`
    aeAuditBalance?: AEBalance,          // Hint for the auditor to decrypt `auditCipher`
    nonce: bigint
}
*/
```

## Account Operations
Accounts create operations, the only way to transact within a Tongo contract. You can read more about them [here](operations/operations.md). To transact without a StarkNet account of your own, see [Relaying](relaying.md).

## Transaction History
Each operation made in Tongo emits an event with the relevant (generally encrypted) information. `getTxHistory()` fetches those events, parses and decrypts them when necessary, and returns a block-ordered array of all Tongo transactions involving the account.

```typescript
// getTxHistory(fromBlock, toBlock?, numEvents?)
const tx_history = await account.getTxHistory(0);
console.log(tx_history);
/*
[
  {
    type: 'withdraw',
    tx_hash: '0x3ee8a6a351b05b4684e3e329399f6df02c446ce986c1e0be925ca71b757c6e0',
    block_number: 6,
    nonce: 2n,
    amount: 1n,
    to: '0x075662cc8b986d55d709d58f698bbb47090e2474918343b010192f487e30c23f'
  },
  {
    type: 'transferOut',
    tx_hash: '0x3dc4e84d5212c125bb92e43c0c097d4630ec7899d60bdca408f7bcdb563b0c1',
    block_number: 4,
    nonce: 1n,
    amount: 23n,
    to: 'tpBg43FFq7SQhmimTMxubT7cJ4dDpjsp5r2TtYYToKV9'
  },
  {
    type: 'fund',
    tx_hash: '0x4e134a86b86db0fe494e030d9b3baa664f5ca51750051cda759d06e27931e1',
    block_number: 3,
    nonce: 0n,
    amount: 100n
  }
]
*/
```

`toBlock` (default `"latest"`) and `numEvents` (default `"all"`) let you page the history. If you only want one kind of event, per-type getters are available: `getEventsFund`, `getEventsRollover`, `getEventsWithdraw`, `getEventsRagequit`, `getEventsTransferIn`, `getEventsTransferOut`, and `getEventsReceivedExternalTransfer`.

## Other methods
The account exposes a few more helpers used across operations and relaying:

- `nonceHash()` — the SNIP-9 nonce for the account's current state, used when relaying.
- `signMessage(typedData, senderAddress)` — signs a relayed operation with the Tongo key.
- `erc20ToTongo(amount)` / `tongoToErc20(amount)` — convert between ERC20 and Tongo units using the contract `rate`.
- `decryptCipherBalance(cipher)` / `decryptAEBalance(cipher, nonce)` — low-level balance decryption.
- `createAuditPart(...)`, `generateExPost(...)` / `verifyExPost(...)` — auditor and ex-post disclosure helpers.
