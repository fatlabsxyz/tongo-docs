# Tongo Instances

Here we list the Tongo instances deployed on mainnet and sepolia. Use the selector to switch between the current **v2** deployments and the legacy **v1** ones.

<div class="version-tabs" data-version-tabs>
<div class="version-tabs__buttons">
<button class="version-tab is-active" type="button" data-version="v2">v2</button>
<button class="version-tab" type="button" data-version="v1">v1</button>
</div>

<div class="version-panel is-active" data-version-panel="v2">

In v2 each asset has a **Vault** that custodies the ERC20 and a **canonical Tongo** ledger deployed by that Vault. See [Vault Architecture](vault.md) for the details, and note that anyone can deploy further Tongo ledgers through the Vault with `deploy_tongo`.

The class hashes of the v2 contracts are

| | |
|---|---|
| Vault Class Hash | [0x044da995967e8ff2b33917c3b3295d3ebe384be16f04f9a30c0301edc820121f](https://voyager.online/class/0x044da995967e8ff2b33917c3b3295d3ebe384be16f04f9a30c0301edc820121f) |
| Tongo Ledger Class Hash | [0x072cc21166e735167d519cf80b83ecb04609ff3ebf0c0accb5d1762cf191471e](https://voyager.online/class/0x072cc21166e735167d519cf80b83ecb04609ff3ebf0c0accb5d1762cf191471e) |

### Mainnet

| USDC (native) | |
|-------|---------------------------------------------------------------------|
| ERC20    | [0x033068f6539f8e6e6b131e6b2b814e6c34a5224bc66947c47dab9dfee93b35fb](https://voyager.online/contract/0x033068f6539f8e6e6b131e6b2b814e6c34a5224bc66947c47dab9dfee93b35fb) |
| Vault    | [0x4cf99aba67d85e3e5d33fdafbfb17dec0c0b83c10ce0791eb4e0c441f0bb27f](https://voyager.online/contract/0x4cf99aba67d85e3e5d33fdafbfb17dec0c0b83c10ce0791eb4e0c441f0bb27f) |
| Tongo    | [0x00b32618c475b2fb50b0facd2c49136be6e77281834dc86bdae652680faad4d3](https://voyager.online/contract/0x00b32618c475b2fb50b0facd2c49136be6e77281834dc86bdae652680faad4d3) |
| decimals | 6 |
| rate     | 1000 (1e3) |

| STRK | |
|-------|---------------------------------------------------------------------|
| ERC20    | [0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d](https://voyager.online/contract/0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d) |
| Vault    | [0x7bd7e57c596ee75b7349230f573b6b470f8ff9c067b6b9badc63b11355546b2](https://voyager.online/contract/0x7bd7e57c596ee75b7349230f573b6b470f8ff9c067b6b9badc63b11355546b2) |
| Tongo    | [0x07e3601b8a5123d601df41bdaba953c0baf6072dca7b9b877901b10a674c5691](https://voyager.online/contract/0x07e3601b8a5123d601df41bdaba953c0baf6072dca7b9b877901b10a674c5691) |
| decimals | 18 |
| rate     | 10000000000000000 (1e16) |

| ETH | |
|-------|---------------------------------------------------------------------|
| ERC20    | [0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7](https://voyager.online/contract/0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7) |
| Vault    | [0x6596e1f366b440ea0d0c012259fc5c37ba3bebbf254e57d4c0aac0d7df542ef](https://voyager.online/contract/0x6596e1f366b440ea0d0c012259fc5c37ba3bebbf254e57d4c0aac0d7df542ef) |
| Tongo    | [0x04bd49a293fd461996bbb6c3fb121372368e084381180a090f32ee5d9bd91ab7](https://voyager.online/contract/0x04bd49a293fd461996bbb6c3fb121372368e084381180a090f32ee5d9bd91ab7) |
| decimals | 18 |
| rate     | 1000000000000 (1e12) |

| USDT | |
|-------|---------------------------------------------------------------------|
| ERC20    | [0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8](https://voyager.online/contract/0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8) |
| Vault    | [0x33719bae54cee0ae1d97a91f295dd8c39b7a693fdfe8340a766f8553cab8500](https://voyager.online/contract/0x33719bae54cee0ae1d97a91f295dd8c39b7a693fdfe8340a766f8553cab8500) |
| Tongo    | [0x00f7caef0285a79f7771c6ba5212cd60566f5bf8422f82d0e92da66904a82c94](https://voyager.online/contract/0x00f7caef0285a79f7771c6ba5212cd60566f5bf8422f82d0e92da66904a82c94) |
| decimals | 6 |
| rate     | 1000 (1e3) |

| WBTC | |
|-------|---------------------------------------------------------------------|
| ERC20    | [0x03fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac](https://voyager.online/contract/0x03fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac) |
| Vault    | [0x36fcd0f4a12b036fa3e65856e9d593f63f475de6a95c0d320699bcad623a546](https://voyager.online/contract/0x36fcd0f4a12b036fa3e65856e9d593f63f475de6a95c0d320699bcad623a546) |
| Tongo    | [0x01c20dc3b0881cb7c2841fe28007273e3562db0f50b6fe3547576ac3711917e1](https://voyager.online/contract/0x01c20dc3b0881cb7c2841fe28007273e3562db0f50b6fe3547576ac3711917e1) |
| decimals | 8 |
| rate     | 10 (1e1) |

### Sepolia

| USDC | |
|-------|---------------------------------------------------------------------|
| ERC20    | [0x053b40a647cedfca6ca84f542a0fe36736031905a9639a7f19a3c1e66bfd5080](https://sepolia.voyager.online/contract/0x053b40a647cedfca6ca84f542a0fe36736031905a9639a7f19a3c1e66bfd5080) |
| Vault    | [0x006294b040c8fe3f03acf47c9d90550e43e2578039e2966da7855342a28ec222](https://sepolia.voyager.online/contract/0x006294b040c8fe3f03acf47c9d90550e43e2578039e2966da7855342a28ec222) |
| Tongo    | [0x04A19ABF487EB464d52303246DFc12BeE90F08983Aabef4004f4388C6FaC7AAF](https://sepolia.voyager.online/contract/0x04A19ABF487EB464d52303246DFc12BeE90F08983Aabef4004f4388C6FaC7AAF) |
| decimals | 6 |
| rate     | 1000 (1e3) |

| STRK | |
|-------|---------------------------------------------------------------------|
| ERC20    | [0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d](https://sepolia.voyager.online/contract/0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d) |
| Vault    | [0x04cbd391c4c32e4db7898489c6e5340a1b6e7667838f668a178a9c353215420d](https://sepolia.voyager.online/contract/0x04cbd391c4c32e4db7898489c6e5340a1b6e7667838f668a178a9c353215420d) |
| Tongo    | [0x05FC29e43c43f53AD69A02028ceb8eDc6343aE9C6A59E5bC169089930d5b82B4](https://sepolia.voyager.online/contract/0x05FC29e43c43f53AD69A02028ceb8eDc6343aE9C6A59E5bC169089930d5b82B4) |
| decimals | 18 |
| rate     | 10000000000000000 (1e16) |

| ETH | |
|-------|---------------------------------------------------------------------|
| ERC20    | [0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7](https://sepolia.voyager.online/contract/0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7) |
| Vault    | [0x07a16fb677abdf56d9f4a00cebdf58d9939ec4b7496fd90644304d011e18483a](https://sepolia.voyager.online/contract/0x07a16fb677abdf56d9f4a00cebdf58d9939ec4b7496fd90644304d011e18483a) |
| Tongo    | [0x048f4Fd642Fc09f16A5e1B6EAE3F02d869e050bCcAA282eD2b15c81A0221Dd57](https://sepolia.voyager.online/contract/0x048f4Fd642Fc09f16A5e1B6EAE3F02d869e050bCcAA282eD2b15c81A0221Dd57) |
| decimals | 18 |
| rate     | 1000000000000 (1e12) |

| WBTC | |
|-------|---------------------------------------------------------------------|
| ERC20    | [0x0452bd5c0512a61df7c7be8cfea5e4f893cb40e126bdc40aee6054db955129e](https://sepolia.voyager.online/contract/0x0452bd5c0512a61df7c7be8cfea5e4f893cb40e126bdc40aee6054db955129e) |
| Vault    | [0x06c61393c8c35c4ee669b3bb1221bdc55b0683d4ea5fdf613bffb7ce0a28e00b](https://sepolia.voyager.online/contract/0x06c61393c8c35c4ee669b3bb1221bdc55b0683d4ea5fdf613bffb7ce0a28e00b) |
| Tongo    | [0x01cc843Db0Ee8CeA6579B939101CD28376f6B39bD485E0661adcd26D3f4182aa](https://sepolia.voyager.online/contract/0x01cc843Db0Ee8CeA6579B939101CD28376f6B39bD485E0661adcd26D3f4182aa) |
| decimals | 8 |
| rate     | 10 (1e1) |

## Relayers

The relayer contracts used for [Relaying](../sdk/relaying.md) are

| Network | Relayer |
|---------|---------|
| Mainnet | [0x038aa8efb4e76b524c4a49b92284187b229174de5f431f288bbd7c8e0e441c12](https://voyager.online/contract/0x038aa8efb4e76b524c4a49b92284187b229174de5f431f288bbd7c8e0e441c12) |
| Sepolia | [0x04c5a308e7b404b2fb3fa7945b5dac44c8134c9d793feb669e8ce890e35af0e8](https://sepolia.voyager.online/contract/0x04c5a308e7b404b2fb3fa7945b5dac44c8134c9d793feb669e8ce890e35af0e8) |

</div>

<div class="version-panel" data-version-panel="v1">

The class hash of the v1 version of Tongo is

| | |
|---|---|
| Tongo Class Hash |[0x00582609087e5aeb75dc25284cf954e2cee6974568d1b5636052a9d36eec672a](https://voyager.online/class/0x00582609087e5aEB75DC25284CF954e2CEE6974568d1B5636052a9d36Eec672a) |

### Mainnet

| STRK  |                                                                     |
|-------|---------------------------------------------------------------------|
| ERC20 |  [0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d](https://voyager.online/contract/0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d) |
| Tongo |  [0x3a542d7eb73b3e33a2c54e9827ec17a6365e289ec35ccc94dde97950d9db498](https://voyager.online/contract/0x3a542d7eb73b3e33a2c54e9827ec17a6365e289ec35ccc94dde97950d9db498)  |
| rate  |  50000000000000000                                                  |

| ETH   |                                                                     |
|-------|---------------------------------------------------------------------|
| ERC20 |  [0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7](https://voyager.online/contract/0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7) |
| Tongo |  [0x276e11a5428f6de18a38b7abc1d60abc75ce20aa3a925e20a393fcec9104f89](https://voyager.online/contract/0x276e11a5428f6de18a38b7abc1d60abc75ce20aa3a925e20a393fcec9104f89)  |
| rate  |  3000000000000                                                      |

| wBTC  |                                                                     |
|-------|---------------------------------------------------------------------|
| ERC20 |  [0x03fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac](https://voyager.online/contract/0x03fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac) |
| Tongo |  [0x6d82c8c467eac77f880a1d5a090e0e0094a557bf67d74b98ba1881200750e27](https://voyager.online/contract/0x6d82c8c467eac77f880a1d5a090e0e0094a557bf67d74b98ba1881200750e27)  |
| rate  |  10                                                                 |

| USDC.e|                                                                     |
|-------|---------------------------------------------------------------------|
| ERC20 |  [0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8](https://voyager.online/contract/0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8) |
| Tongo |  [0x72098b84989a45cc00697431dfba300f1f5d144ae916e98287418af4e548d96](https://voyager.online/contract/0x72098b84989a45cc00697431dfba300f1f5d144ae916e98287418af4e548d96)  |
| rate  |  10000                                                              |

| USDC  |                                                                     |
|-------|---------------------------------------------------------------------|
| ERC20 |  [0x033068F6539f8e6e6b131e6B2B814e6c34A5224bC66947c47DaB9dFeE93b35fb](https://voyager.online/contract/0x033068F6539f8e6e6b131e6B2B814e6c34A5224bC66947c47DaB9dFeE93b35fb) |
| Tongo |  [0x026f79017c3c382148832c6ae50c22502e66f7a2f81ccbdb9e1377af31859d3a](https://voyager.online/contract/0x026f79017c3c382148832c6ae50c22502e66f7a2f81ccbdb9e1377af31859d3a)  |
| rate  |  10000                                                              |

| USDT  |                                                                     |
|-------|---------------------------------------------------------------------|
| ERC20 |  [0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8](https://voyager.online/contract/0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8) |
| Tongo |  [0x659c62ba8bc3ac92ace36ba190b350451d0c767aa973dd63b042b59cc065da0](https://voyager.online/contract/0x659c62ba8bc3ac92ace36ba190b350451d0c767aa973dd63b042b59cc065da0)  |
| rate  |  10000                                                              |

| DAI   |                                                                     |
|-------|---------------------------------------------------------------------|
| ERC20 | [0x00da114221cb83fa859dbdb4c44beeaa0bb37c7537ad5ae66fe5e0efd20e6eb3](https://voyager.online/contract/0x00da114221cb83fa859dbdb4c44beeaa0bb37c7537ad5ae66fe5e0efd20e6eb3)  |
| Tongo | [0x511741b1ad1777b4ad59fbff49d64b8eb188e2aeb4fc72438278a589d8a10d8](https://voyager.online/contract/0x511741b1ad1777b4ad59fbff49d64b8eb188e2aeb4fc72438278a589d8a10d8)   |
| rate  | 10000000000000000                                                   |

### Sepolia

| STRK  |                                                                     |
|-------|---------------------------------------------------------------------|
| ERC20 | [0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d](https://sepolia.voyager.online/contract/0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d)   |
| Tongo | [0x408163bfcfc2d76f34b444cb55e09dace5905cf84c0884e4637c2c0f06ab6ed](https://sepolia.voyager.online/contract/0x408163bfcfc2d76f34b444cb55e09dace5905cf84c0884e4637c2c0f06ab6ed)   |
| rate  | 50000000000000000                                                   |

| ETH   |                                                                     |
|-------|---------------------------------------------------------------------|
| ERC20 | [0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7](https://sepolia.voyager.online/contract/0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7)   |
| Tongo | [0x2cf0dc1d9e8c7731353dd15e6f2f22140120ef2d27116b982fa4fed87f6fef5](https://sepolia.voyager.online/contract/0x2cf0dc1d9e8c7731353dd15e6f2f22140120ef2d27116b982fa4fed87f6fef5)   |
| rate  | 3000000000000                                                       |

| USDC  |                                                                     |
|-------|---------------------------------------------------------------------|
| ERC20 | [0x53b40a647cedfca6ca84f542a0fe36736031905a9639a7f19a3c1e66bfd5080](https://sepolia.voyager.online/contract/0x53b40a647cedfca6ca84f542a0fe36736031905a9639a7f19a3c1e66bfd5080)   |
| Tongo | [0x2caae365e67921979a4e5c16dd70eaa5776cfc6a9592bcb903d91933aaf2552](https://sepolia.voyager.online/contract/0x2caae365e67921979a4e5c16dd70eaa5776cfc6a9592bcb903d91933aaf2552)   |
| rate  | 10000                                                               |

| wBTC  |                                                                     |
|-------|---------------------------------------------------------------------|
| ERC20 | [0x452bd5c0512a61df7c7be8cfea5e4f893cb40e126bdc40aee6054db955129e](https://sepolia.voyager.online/contract/0x452bd5c0512a61df7c7be8cfea5e4f893cb40e126bdc40aee6054db955129e)   |
| Tongo | [0x02b9f62f9be99590ad2505e9e89ca746c8fb67bdb6a4be2a1b9a1d867af7339e](https://sepolia.voyager.online/contract/0x02b9f62f9be99590ad2505e9e89ca746c8fb67bdb6a4be2a1b9a1d867af7339e)   |
| rate  | 10                                                               |

### Deployment

In v1 you deploy a Tongo instance directly with your own set of parameters. The constructor of the contract is

```rust
    #[constructor]
    fn constructor(
        ref self: ContractState,
        owner: ContractAddress,
        ERC20: ContractAddress,
        rate: u256,
        bit_size: u32,
        auditor_key: Option<PubKey>,
    ) {
        self.owner.write(owner);
        self.ERC20.write(ERC20);
        self.rate.write(rate);

        assert!(bit_size <= 128_u32, "Bit size should be 128 at max");
        self.bit_size.write(bit_size);

        if let Some(key) = auditor_key {
            self._set_auditor_key(key);
        }
    }
```

</div>

</div>
