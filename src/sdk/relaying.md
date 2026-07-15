# Relaying (v2)

Relaying lets a user operate a Tongo account **without owning a funded StarkNet account**. A relayer sends the transaction on the user's behalf, pays the gas, and is reimbursed in the token being transacted through the [AVNU paymaster](https://docs.avnu.fi/docs/paymaster/index). The user only signs the operation with their Tongo key. See [Relayer Architecture](../protocol/relayer.md) for how it works on-chain.

The SDK exposes a `RelayerAccount` for this.

## Creating a RelayerAccount

```typescript
import { Account as TongoAccount, RelayerAccount } from "@fatsolutions/tongo-sdk";

const providerUrl  = "YOUR_RPC_URL";
const paymasterUrl = "https://sepolia.paymaster.avnu.fi";
const relayerAddress = "RELAYER_CONTRACT_ADDRESS";
const tongoAddress   = "TONGO_CONTRACT_ADDRESS";

const relayer = new RelayerAccount(tongoAddress, relayerAddress, paymasterUrl, providerUrl);

const account = new TongoAccount("USER_TONGO_PRIVATE_KEY", tongoAddress, providerUrl);
```

## The relay flow

Relaying an operation is a two-pass flow: you first build the operation to **estimate** the fee, then rebuild it with the real fee and hand it to the relayer to build, sign and execute.

1. Build the operation with the relayer as `sender` and a placeholder fee, and estimate the fee.
2. Rebuild the operation with the suggested fee.
3. Build the transaction to sign, sign it with the **Tongo** account, and execute it through the relayer.

```typescript
const sender = relayer.address;
const amount = 10n;
const to = receiver.publicKey;

// 1. estimate the fee (placeholder feeToSender)
const opToEstimate = await account.transfer({ to, amount, feeToSender: 1n, sender });
const fee = await relayer.estimateFee(opToEstimate);

// 2. rebuild with the suggested fee
const snip9_nonce = await account.nonceHash();
const opToExecute = await account.transfer({
    to,
    amount,
    feeToSender: fee.relayerSuggestedTongo,
    sender,
});

// 3. build, sign with the Tongo key, and execute through the relayer
const prepared  = await relayer.buildTransactionToSign(opToExecute, snip9_nonce);
const signature = await account.signMessage(prepared.typedData, sender);
const txHash    = await relayer.execute(prepared, signature);

await provider.waitForTransaction(txHash);
```

`estimateFee` returns a `RelayFeeEstimate` with the AVNU estimated/suggested fee in both ERC20 and Tongo units, plus `relayerSuggestedTongo` — the value to use as `feeToSender`.

## Relaying a rollover

A plain rollover carries no fee, so it can't reimburse a relayer on its own. Use `relayerRollover`, which bundles the rollover with a fee-paying operation, then run the same flow:

```typescript
const opToEstimate = await account.relayerRollover({ sender, feeToSender: 1n });
const fee = await relayer.estimateFee(opToEstimate);

const snip9_nonce = await account.nonceHash();
const opToExecute = await account.relayerRollover({ sender, feeToSender: fee.relayerSuggestedTongo });

const prepared  = await relayer.buildTransactionToSign(opToExecute, snip9_nonce);
const signature = await account.signMessage(prepared.typedData, sender);
const txHash    = await relayer.execute(prepared, signature);
```

The relayable operations are **transfer**, **withdraw**, **ragequit** and (bundled) **rollover**.
