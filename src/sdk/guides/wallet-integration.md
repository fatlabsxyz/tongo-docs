# Wallet Integration

Integrate Tongo with Starknet wallets like Argent X and Braavos.

## Overview

Tongo requires two types of accounts:
1. **Starknet Account**: For signing transactions and paying gas
2. **Tongo Account**: For confidential operations (separate keypair)

## Deriving Tongo Keys from Wallet

Best practice: Derive Tongo keys deterministically from wallet signatures.

```typescript
import { AccountInterface, TypedData, hash } from "starknet";

const CURVE_ORDER = BigInt('0x800000000000010ffffffffffffffffb781126dcae7b2321e66a241adc64d2f');

async function deriveTongoPrivateKey(account: AccountInterface): Promise<bigint> {
    // Create typed data for signing
    const typedData: TypedData = {
        domain: {
            name: 'Tongo Key Derivation',
            version: '1',
            chainId: account.chainId || 'SN_SEPOLIA',
        },
        types: {
            StarkNetDomain: [
                { name: 'name', type: 'string' },
                { name: 'version', type: 'string' },
                { name: 'chainId', type: 'felt' },
            ],
            Message: [
                { name: 'action', type: 'felt' },
                { name: 'wallet', type: 'felt' },
            ],
        },
        primaryType: 'Message',
        message: {
            action: 'tongo-keygen-v1',
            wallet: account.address,
        },
    };

    // Sign with wallet
    const signature = await account.signMessage(typedData);

    // Extract r and s
    const { r, s } = extractSignatureComponents(signature);

    // Hash with Poseidon
    const privateKeyHex = hash.computePoseidonHashOnElements([r, s]);
    let privateKey = BigInt(privateKeyHex);

    // Reduce modulo curve order
    privateKey = privateKey % CURVE_ORDER;

    if (privateKey === BigInt(0)) {
        throw new Error('Derived private key is zero');
    }

    return privateKey;
}

function extractSignatureComponents(signature: any): { r: bigint; s: bigint } {
    if (Array.isArray(signature)) {
        // Argent X format: [1, 0, r, s, ...]
        if (signature.length >= 4 && BigInt(signature[0]) === BigInt(1)) {
            return { r: BigInt(signature[2]), s: BigInt(signature[3]) };
        }
        // Standard format: [r, s]
        if (signature.length >= 2) {
            return { r: BigInt(signature[0]), s: BigInt(signature[1]) };
        }
    }

    if (signature?.r && signature?.s) {
        return { r: BigInt(signature.r), s: BigInt(signature.s) };
    }

    throw new Error('Invalid signature format');
}
```

## React Integration

```typescript
import { useAccount } from '@starknet-react/core';
import { useState } from 'react';

function useTongoAccount() {
    const { account } = useAccount();
    const [tongoKey, setTongoKey] = useState<bigint | null>(null);

    async function deriveKey() {
        if (!account) throw new Error('No wallet connected');

        const key = await deriveTongoPrivateKey(account);
        setTongoKey(key);

        // Create Tongo account
        const tongoAccount = new TongoAccount(key, tongoAddress, provider);
        return tongoAccount;
    }

    return { tongoKey, deriveKey };
}
```

## Complete Wallet Flow

```typescript
import { connect } from 'get-starknet';

async function setupTongoWithWallet() {
    // 1. Connect Starknet wallet
    const starknetWallet = await connect();
    await starknetWallet.enable();

    // 2. Get wallet account
    const account = await starknetWallet.account;

    // 3. Derive Tongo private key
    const tongoPrivateKey = await deriveTongoPrivateKey(account);

    // 4. Create Tongo account
    const tongoAccount = new TongoAccount(
        tongoPrivateKey,
        tongoAddress,
        provider
    );

    // 5. Use both accounts
    // - Starknet account for signing transactions
    // - Tongo account for creating operations

    return { starknetAccount: account, tongoAccount };
}
```

## Benefits of Wallet Derivation

- **Deterministic**: Same wallet always generates same Tongo key
- **No Storage**: Don't need to store Tongo private key
- **Recoverable**: Can recover from wallet alone
- **Secure**: Uses wallet's signature for entropy

## Next Steps

- [Key Management](../concepts/key-management.md)
- [React Integration Example](../examples/react-integration.md)
