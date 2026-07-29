# What's new in v2

Tongo **v2** is the current protocol. This page summarizes what changed from **v1** (the legacy, single‑contract design) so you can port an integration quickly. The full legacy docs remain available through the version switcher in the top bar (**v1 · legacy**).

> **TL;DR** — v2 splits custody from bookkeeping (**Vault** + **Tongo Ledger**), adds **External Transfers** between ledgers, and introduces a **Relayer** so users can operate with **no StarkNet account** (gasless via the AVNU paymaster). The cryptography and account model are unchanged.

## At a glance

| Area | v1 | v2 |
|------|----|----|
| Contract layout | One Tongo contract holds funds **and** state | **Vault** holds the ERC20 reserve + config; **Tongo Ledger** holds encrypted state and verifies proofs |
| Deploying a ledger | Deploy the Tongo contract directly | `Vault.deploy_tongo(owner, tag, auditorKey?)` |
| Cross‑ledger transfer | Not possible | **External Transfer** between ledgers of the same Vault |
| Gas / accounts | Caller needs a funded StarkNet account | **Relayer** + AVNU paymaster: sign with your Tongo key, no account needed |
| Operation fees | — | `transfer` / `withdraw` / `ragequit` carry a `fee_to_sender` (in Tongos, converted via `rate`) |
| SDK surface | `Account` operations only | Adds `RelayerAccount` and the [Relaying](sdk/relaying.md) flow |

## 1. Vault + Tongo split

In v1 a single contract both custodied the wrapped ERC20 and tracked encrypted balances. In v2 those responsibilities are separated:

- **[Vault](protocol/vault.md)** — holds the ERC20 reserve for a single asset, stores the shared configuration (`ERC20`, `rate`, `bit_size`, `tongo_class_hash`), and deploys Tongo Ledger instances.
- **[Tongo Ledger](protocol/contracts.md)** — keeps the encrypted balances, pending balances and audit data, and verifies the zero‑knowledge proof of each operation. It no longer custodies ERC20 directly; funding/withdrawing forward the token movement to the Vault.

From a user's point of view nothing changes: you still call `fund` / `withdraw` on your Tongo instance.

New Tongo ledgers are created through the Vault:

```rust
// v2 — deploy a ledger through its Vault
vault.deploy_tongo(owner, tag, auditorKey /* Option<PubKey> */);
// `tag` is unique per Vault (used as the deploy salt); tag_to_address(tag) resolves it back.
```

## 2. External Transfers

The Vault/ledger split enables a new confidential transfer **between two Tongo Ledgers deployed by the same Vault** — an *External Transfer*. Both ledgers must approve the interaction (bidirectional, owner‑gated), and the two ledgers run the identical, Vault‑deployed class, so the receiving ledger can trust an incoming transfer that the sending ledger has already proven. See [Tongo instances](protocol/contracts.md) for the approval flow.

## 3. Relayer — operate without a StarkNet account

Every Tongo operation is a StarkNet transaction, which normally means the caller needs a funded account to pay gas. The **[Relayer](protocol/relayer.md)** removes that requirement:

- It executes the operation on the user's behalf via **SNIP‑9 outside execution** and pays gas through the **AVNU paymaster**, then reimburses itself in ERC20 from the operation's fee.
- The user authorizes the operation by **signing it with their Tongo key** — not a StarkNet account key.
- Replay is prevented by a SNIP‑9 nonce derived from the sender's current Tongo account nonce, so each operation has exactly one valid nonce.
- The sender address is committed inside every operation's zero‑knowledge proof, so a relayed proof is only valid when executed through the exact Relayer the user chose while building it.

The relayable operations — **transfer**, **withdraw**, **ragequit** — carry a `fee_to_sender` paid to the Relayer. **Rollover** has no fee of its own and is bundled with a paying operation when it needs relaying. The Relayer only executes a bundle when the collected fees cover the gas it pays plus a margin, so it never sponsors at a loss.

See the SDK [Relaying](sdk/relaying.md) guide for the client‑side flow.

## 4. Building an operation — v1 vs v2

The account model is unchanged, but v2 operations take relayer/fee data. Toggle the versions below:

<div class="version-tabs" data-version-tabs>
<div class="version-tabs__buttons">
<button class="version-tab is-active" type="button" data-version="v2">v2</button>
<button class="version-tab" type="button" data-version="v1">v1</button>
</div>

<div class="version-panel is-active" data-version-panel="v2">

```ts
// v2 — relayed transfer: no StarkNet account, gas paid by the Relayer
import { Account, RelayerAccount } from "@fatsolutions/tongo-sdk";

const account = new Account(tongoPrivateKey, tongoAddress, provider);
const relayer = new RelayerAccount(tongoAddress, relayerAddress, paymasterUrl, provider);

const op = account.transfer(to, amount, { feeToSender }); // fee reimburses the relayer
const est = await relayer.estimateFee(op);
const prepared = relayer.buildTransactionToSign(op /* w/ est */, snip9Nonce);
const signature = account.signMessage(prepared);          // sign with the Tongo key
await relayer.execute(prepared, signature);
```

</div>

<div class="version-panel" data-version-panel="v1">

```ts
// v1 — the caller needs a funded StarkNet account to pay gas
import { Account } from "@fatsolutions/tongo-sdk";

const account = new Account(tongoPrivateKey, tongoAddress, provider);
const op = account.transfer(to, amount);
await starknetAccount.execute(op.toCalldata());           // StarkNet account pays gas
```

</div>
</div>

## Migration checklist

- **Point at a Vault‑deployed ledger.** Resolve/deploy your Tongo instance through the Vault (`deploy_tongo` / `tag_to_address`) instead of deploying the Tongo contract directly.
- **Add fees to relayable ops.** Populate `fee_to_sender` on `transfer` / `withdraw` / `ragequit` when relaying.
- **Adopt the Relayer flow** (`RelayerAccount`) if you want the no‑account UX; otherwise the direct StarkNet‑account path still works.
- **Regenerate ABIs.** The contract set changed — see the updated [Contract ABI](protocol/abi.md) (it has a v1/v2 toggle).

Everything under [SHE Cryptography](she/README.md) is identical between v1 and v2.
