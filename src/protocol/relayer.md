# Relayer Architecture (v2)

Every Tongo operation is a StarkNet transaction, so it normally requires the caller to hold a funded account to pay for gas. The **Relayer** contract leverages the [AVNU paymaster](https://docs.avnu.fi/docs/paymaster/index) to let users operate their Tongo Ledgers **without a StarkNet account**. It executes the transaction (using SNIP-9 outside execution) on the user's behalf and pays the gas fee, then gets reimbursed in ERC20 from the operation's fee.

The user authorizes the operation by signing it with their Tongo key, not a StarkNet account key. **No StarkNet account is needed on the user side.**

## Fees
The relayable operations — **transfer**, **withdraw** and **ragequit** — carry a `fee_to_sender` amount that is paid to the Relayer. It is denominated in Tongos and converted to ERC20 through the `rate`. **Rollover** has no fee of its own; when it needs relaying it is bundled with one of the paying operations.

The Relayer only executes a bundle when the fees it collects cover the gas it pays plus a configurable margin, so it never sponsors an operation at a loss.

## Security
From a Tongo Account's perspective the Relayer is the caller. As described in the [Introduction](introduction.md#security-measures), the sender address is committed inside the zero-knowledge proof of every operation, so a relayed proof is only valid when it is executed through the exact Relayer the user chose while building it. On top of this cryptographic binding, the Relayer keeps whitelists of the Tongo Ledgers, ERC20 assets and forwarders it is willing to serve.

Replay is prevented by the SNIP-9 nonce, which is derived from the sender's current Tongo account nonce. Since that nonce increases with every operation, each relayed operation has exactly one valid nonce and cannot be replayed.

The Relayer has an owner that manages whitelists, the accepted entrypoints and the fee margins, and can withdraw the collected fees.
