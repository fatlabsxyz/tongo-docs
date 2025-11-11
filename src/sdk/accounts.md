# Account Class

The `Account` class is the main interface for interacting with Tongo. An instance of a Tongo `Account` represents a user's account for a specific Tongo contract. Some of the functionalities of the `Account` are:
- Decrypting the balance of the user.
- Creating the [Operations](operations/operations.md) with the ZK proofs needed.
- Decrypting and showing the transaction history for the user.


## Creating an Account
```typescript
import { Account as TongoAccount } from "@fatsolutions/tongo-sdk";
import { RpcProvider } from "starknet";

const provider = new RpcProvider({
    nodeUrl: "YOUR_RPC_URL",
    specVersion: "0.8.1",
});

const tongoAddress = "TONGO_CONTRACT_ADDRESS";

const privateKey = "USER_TONGO_PRIVATE_KEY";
const tongoAccount = new TongoAccount(
    privateKey,
    tongoAddress,
    provider
);
```


## Public Key
Each instance of a Tongo `Account` class is identified by its public key. At low level the public is the elliptic curve point
$$
pk = g^{sk}
$$
where  \\(pk\\) is the public key, \\(sk\\) is the secret key and \\(g\\) is the stark curve generator. This form of the public key is used at low level to create the Zero-Knoledge proofs. To see this representation of the public key of an instance of a Tongo `Account` you can view the `publicKey` property:

```typescript
console.log(account.publicKey);
// { x: bigint, y: bigint }
```

To have a cleaner repesentatin of the public key we offer a base58-encoded one. We call it the Tongo address of a given account:

```typescript
const address = account.tongoAddress();
console.log(address);
// "Um6QEVHZaXkii8hWzayJf6PBWrJCTuJomAst75Zmy12"
```
> **Note** We offer the utility functions `pubKeyBase58ToAffine()` and `pubKeyAffineToBase58()` in the file `types.ts` to facilitate the conversion betweer the two representations of the public key.

## Account State
The high level state of a Tongo Account at a given time is its `current` and  `pending` balances  and its `nonce`. We offerd a `state()` method to get this

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
when ussing this method, the `Account` first quieries the Tongo contract for the its current raw state and then then decrypts the balances using the encrypted hints stored in the contract. The raw state of the account (the state that is stored in the Tongo contract and it is visible to anyone) can be get with the `rawState()` method:

```typescript
const rawState = await account.rawState();
console.log(rawState);
/*
{
    balance: CipherBalance,      // Encrypted balance
    pending: CipherBalance,       // Encrypted pending balance
    audit: CipherBalance | undefined, // Encrypted balance for auditor
    nonce: bigint,
    aeBalance: AEBalance | undefined, // Encrypted hint to decrypt `balance`
    aeAuditBalance: AEBalance | undefined //Encrypted hint to decrypt `audit`
}
*/
```


## Account Operations

Accounts can create various operations. Operation are the the only way of transact within a Tongo contract. You can read more about them [here](operations/operations.md).


## Transaction History
The Tongo `Account` class has a method that allow the user to get its transaction history. Each operation made in Tongo emits an event with the relevant (generally encrypted) information. The `getTxHistory()` method fetches the emitted events starting from a given `block_number`, parses the data and decrypts it when necesary. The method returns a block-ordered array of all Tongo transactions involving the Tongo `Account`

```typescript
// The initial block number to fetch the history from
const initial_block = 0; 
const tx_history = await account.getTxHistory(initial_block);
console.log(tx_history);
/*
[
  {
    type: 'withdraw',
    tx_hash: '0x3ee8a6a351b05b4684e3e329399f6df02c446ce986c1e0be925ca71b757c6e0',
    block_number: 6,
    nonce: 2n,
    amount: 1n,
    to: '0x075662cc8b986d55d709d58f698bbb47090e2474918343b010192f487e30c23f"'
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
