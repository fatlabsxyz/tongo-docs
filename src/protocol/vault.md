# Vault Architecture (v2)

In v2 the protocol is split into two kinds of contracts. Vaults and Tongo Ledgers. This new architecture allow us to have a new kind of tranfser called `External Transfer`. This operation can make a confidential tranfer from a Tongo Ledger onwer by some owner/auditor to another one. 

From the user's point of view nothing changes: they still call `fund` / `withdraw` on their Tongo instance. Internally the Tongo instance forwards the ERC20 movement to its Vault, which is the contract that actually holds the reserve.

## Vault
It holds the ERC20 reserves for a single asset, stores the global configuration and deploys Tongo ledger instances. Here are stored the parameters shared by every Tongo instance it deploys.

The Vault stores the parameters shared by every Tongo instance it deploys. These are exposed through `get_vault_config`, which returns a `VaultConfig`:

- `ERC20` — the token this Vault wraps.
- `rate` — the fixed ERC20-to-Tongo conversion rate (`ERC20_amount = Tongo_amount * rate`).
- `bit_size` — the maximum bit size supported by the range proofs.
- `tongo_class_hash` — the class hash of the Tongo contract this Vault deploys.

## Tongo
It keeps the encrypted balances, pending balances and audit data described in [Storage Architecture](storage.md) and verifies the zero-knowledge proofs of each operation. A Tongo instance no longer custodies any ERC20 itself: on funding and withdrawing it calls the Vault to move the underlying tokens. Tongo contracts have a set owner (and an optional auditor) that have full control of the contract.

Tongo instances are deployed through the Vault rather than deployed directly. The function is called `deploy_tongo` and requires
## Deploying a Tongo instance

New Tongo ledgers are created through the Vault rather than deployed directly:

- `owner` — the StarkNet address that owns the resulting Tongo instance.
- `tag` — a unique identifier for the instance. It is used as the salt of the deploy syscall, so it must be unique per Vault; `tag_to_address(tag)` resolves a tag back to its deployed address.
- `auditorKey` — an optional auditor public key. If provided, the instance runs with the auditing features described in [Auditing & Compliance](auditor.md); if omitted, it runs without an auditor and this cannot be changed later.

The Vault records every instance it deploys and emits a `TongoDeployed` event carrying the tag, address, ERC20, rate, bit_size and auditor key.


