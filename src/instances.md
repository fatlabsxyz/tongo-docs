# Instances

The canonical **v2 Tongo ledgers** deployed on Starknet **mainnet**. To start, point the SDK's `Account` at the ledger for the asset you want — that address is the only thing you need.

> Vault, ERC20, decimals/rate, Sepolia, and the class hashes live on the full [Tongo instances](protocol/contracts.md) page.

## Instantiate through the SDK

```ts
import { Account } from "@fatsolutions/tongo-sdk";
import { RpcProvider } from "starknet";

// Canonical v2 Tongo ledgers — Starknet mainnet
const TONGO_MAINNET = {
  USDC: "0x00b32618c475b2fb50b0facd2c49136be6e77281834dc86bdae652680faad4d3",
  STRK: "0x07e3601b8a5123d601df41bdaba953c0baf6072dca7b9b877901b10a674c5691",
  ETH:  "0x04bd49a293fd461996bbb6c3fb121372368e084381180a090f32ee5d9bd91ab7",
  USDT: "0x00f7caef0285a79f7771c6ba5212cd60566f5bf8422f82d0e92da66904a82c94",
  WBTC: "0x01c20dc3b0881cb7c2841fe28007273e3562db0f50b6fe3547576ac3711917e1",
} as const;

const provider = new RpcProvider({ nodeUrl: "https://your-starknet-rpc" });

// Open an account on, e.g., the USDC ledger
const account = new Account(tongoPrivateKey, TONGO_MAINNET.USDC, provider);

// read the encrypted state, then build operations
const state = await account.state();
```

Want **gasless** operations (no Starknet account)? Pair the same ledger with the mainnet **Relayer** and use `RelayerAccount` — see [Relaying](sdk/relaying.md).

```ts
import { RelayerAccount } from "@fatsolutions/tongo-sdk";

const RELAYER_MAINNET = "0x038aa8efb4e76b524c4a49b92284187b229174de5f431f288bbd7c8e0e441c12";

const relayer = new RelayerAccount(
  TONGO_MAINNET.USDC,
  RELAYER_MAINNET,
  "https://paymaster-endpoint", // AVNU paymaster
  provider,
);
```

## Mainnet ledgers

| Asset | Tongo ledger | decimals | rate |
|-------|--------------|----------|------|
| USDC (native) | `0x00b32618c475b2fb50b0facd2c49136be6e77281834dc86bdae652680faad4d3` | 6 | 1e3 |
| STRK | `0x07e3601b8a5123d601df41bdaba953c0baf6072dca7b9b877901b10a674c5691` | 18 | 1e16 |
| ETH | `0x04bd49a293fd461996bbb6c3fb121372368e084381180a090f32ee5d9bd91ab7` | 18 | 1e12 |
| USDT | `0x00f7caef0285a79f7771c6ba5212cd60566f5bf8422f82d0e92da66904a82c94` | 6 | 1e3 |
| WBTC | `0x01c20dc3b0881cb7c2841fe28007273e3562db0f50b6fe3547576ac3711917e1` | 8 | 1e1 |

Need Sepolia, the Vault/ERC20 addresses, or want to deploy your own ledger through the Vault? See [Tongo instances](protocol/contracts.md) and [Vault Architecture](protocol/vault.md).
