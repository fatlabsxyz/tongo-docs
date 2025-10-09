# Key Management

Proper key management is crucial for Tongo applications. This page covers best practices for generating, storing, and deriving Tongo private keys.

## Key Types

### Tongo Private Key

- **Purpose**: Decrypt balances and authorize Tongo operations
- **Format**: `bigint` or `Uint8Array`
- **Range**: Must be within the Stark curve scalar field
- **Example**: `82130983n`

### Tongo Public Key

- **Purpose**: Account identifier for receiving transfers
- **Format**: `{ x: bigint, y: bigint }` (elliptic curve point)
- **Derivation**: Computed as `g^privateKey` where `g` is the curve generator

### Tongo Address

- **Purpose**: Human-readable account identifier
- **Format**: Base58-encoded public key
- **Example**: `"Um6QEVHZaXkii8hWzayJf6PBWrJCTuJomAst75Zmy12"`

## Key Generation Strategies

### Strategy 1: Random Generation

Generate a completely random private key:

```typescript
import { getRandomValues } from "crypto";

function generateRandomTongoKey(): bigint {
    // Generate random bytes
    const bytes = new Uint8Array(32);
    getRandomValues(bytes);

    // Convert to bigint
    const privateKey = BigInt('0x' + Buffer.from(bytes).toString('hex'));

    // Ensure it's within the curve order
    const CURVE_ORDER = BigInt('0x800000000000010ffffffffffffffffb781126dcae7b2321e66a241adc64d2f');
    return privateKey % CURVE_ORDER;
}

const randomKey = generateRandomTongoKey();
```

**Pros:**
- Maximum entropy
- No dependencies

**Cons:**
- Must be securely stored and backed up
- No deterministic recovery

### Strategy 2: Deterministic Derivation from Starknet Wallet

Derive your Tongo key deterministically from your Starknet wallet signature:

```typescript
import { AccountInterface, TypedData, hash } from "starknet";

const CURVE_ORDER = BigInt('0x800000000000010ffffffffffffffffb781126dcae7b2321e66a241adc64d2f');

async function deriveTongoPrivateKey(account: AccountInterface): Promise<bigint> {
    const accountAddress = account.address;
    const chainId = (account as any).chainId || 'SN_SEPOLIA';

    // Create typed data for signing
    const typedData: TypedData = {
        domain: {
            name: 'Tongo Key Derivation',
            version: '1',
            chainId: chainId,
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
            wallet: accountAddress,
        },
    };

    // Sign the typed data
    const signature = await account.signMessage(typedData);

    // Extract r and s from signature
    const { r, s } = extractSignatureComponents(signature);

    // Hash using Poseidon
    const privateKeyHex = hash.computePoseidonHashOnElements([r, s]);
    let privateKey = BigInt(privateKeyHex);

    // Reduce modulo curve order
    privateKey = privateKey % CURVE_ORDER;

    // Ensure non-zero
    if (privateKey === BigInt(0)) {
        throw new Error('Derived private key is zero');
    }

    return privateKey;
}

function extractSignatureComponents(signature: any): { r: bigint; s: bigint } {
    if (Array.isArray(signature)) {
        // Argent X format: [1, 0, r, s, ...]
        if (signature.length >= 4 && BigInt(signature[0]) === BigInt(1)) {
            return {
                r: BigInt(signature[2]),
                s: BigInt(signature[3]),
            };
        }
        // Standard format: [r, s]
        if (signature.length >= 2) {
            return {
                r: BigInt(signature[0]),
                s: BigInt(signature[1]),
            };
        }
    }

    if (signature && typeof signature === 'object' && 'r' in signature && 's' in signature) {
        return {
            r: BigInt(signature.r),
            s: BigInt(signature.s),
        };
    }

    throw new Error('Invalid signature format');
}
```

**Pros:**
- Deterministic (same wallet → same Tongo key)
- No need to store Tongo private key separately
- Can be recovered from wallet signature

**Cons:**
- Requires user to sign a message
- Depends on wallet connection

### Usage in React

```typescript
import { useAccount } from '@starknet-react/core';
import { useState } from 'react';

function useTongoKey() {
    const { account } = useAccount();
    const [tongoKey, setTongoKey] = useState<bigint | null>(null);
    const [loading, setLoading] = useState(false);

    async function deriveKey() {
        if (!account) {
            throw new Error('No wallet connected');
        }

        setLoading(true);
        try {
            const key = await deriveTongoPrivateKey(account);
            setTongoKey(key);
            return key;
        } finally {
            setLoading(false);
        }
    }

    return { tongoKey, deriveKey, loading };
}
```

## Storage Best Practices

### Never Do This

```typescript
// DON'T: Store in localStorage unencrypted
localStorage.setItem('tongoKey', privateKey.toString());

// DON'T: Hard-code in source
const PRIVATE_KEY = 82130983n;

// DON'T: Send over network
fetch('/api/save-key', { body: privateKey });
```

### Recommended Approaches

#### For Web Applications

```typescript
// Derive from wallet each time
async function getTongoAccount(walletAccount, provider) {
    const privateKey = await deriveTongoPrivateKey(walletAccount);
    return new TongoAccount(privateKey, tongoAddress, provider);
}

// Or encrypt before storing
import { encrypt, decrypt } from 'your-encryption-library';

function saveEncryptedKey(privateKey: bigint, password: string) {
    const encrypted = encrypt(privateKey.toString(), password);
    localStorage.setItem('tongoKey_encrypted', encrypted);
}

function loadEncryptedKey(password: string): bigint | null {
    const encrypted = localStorage.getItem('tongoKey_encrypted');
    if (!encrypted) return null;

    const decrypted = decrypt(encrypted, password);
    return BigInt(decrypted);
}
```

#### For Backend Applications

```typescript
// Use environment variables
const TONGO_PRIVATE_KEY = BigInt(process.env.TONGO_PRIVATE_KEY!);

// Or use a secret management service
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

async function getTongoKey() {
    const client = new SecretManagerServiceClient();
    const [version] = await client.accessSecretVersion({
        name: 'projects/my-project/secrets/tongo-key/versions/latest',
    });
    const payload = version.payload?.data?.toString();
    return BigInt(payload!);
}
```

## Key Backup and Recovery

### Backup Strategies

1. **Hardware Wallet Integration**
   - Store derivation parameters in hardware wallet
   - Sign derivation message when needed

2. **Encrypted Backup**
   - Encrypt private key with strong password
   - Store encrypted backup securely
   - Test recovery before relying on it

3. **Multi-Signature Schemes**
   - Split key using Shamir's Secret Sharing
   - Require M-of-N shares to recover
   - Distribute shares to trusted parties

### Recovery Checklist

If using deterministic derivation:
- Can access Starknet wallet
- Know which wallet was used
- Can sign messages with wallet

If using random generation:
- Have encrypted backup
- Remember encryption password
- Can access backup location

## Security Considerations

### Key Lifecycle

1. **Generation**
   - Use cryptographically secure randomness
   - Or derive deterministically from wallet

2. **Usage**
   - Never log or print the key
   - Keep in memory only when needed
   - Clear from memory after use

3. **Storage**
   - Encrypt at rest
   - Use secure key management systems
   - Regular security audits

4. **Disposal**
   - Securely wipe from memory
   - Delete encrypted backups if desired
   - Withdraw all funds first

### Common Pitfalls

**Weak entropy**: Using predictable values like timestamps or counters

**Key reuse**: Using same key across different chains or applications

**Insecure storage**: Storing keys in plain text or weakly encrypted

**No backup**: Losing access to funds if key is lost

**Best practice**: Use wallet-derived keys with secure backup

## Testing Keys

For development and testing only:

```typescript
// Test keys (NEVER use in production!)
const TEST_KEYS = {
    alice: 82130983n,
    bob: 12930923n,
    charlie: 55555555n,
};

// Use only on testnets
const testAccount = new TongoAccount(
    TEST_KEYS.alice,
    SEPOLIA_TONGO_ADDRESS,
    sepoliaProvider
);
```

## Multi-Account Management

Managing multiple Tongo accounts:

```typescript
interface TongoAccountInfo {
    name: string;
    privateKey: bigint;
    address: string;
}

class TongoWallet {
    private accounts: Map<string, TongoAccountInfo> = new Map();

    async addAccount(name: string, privateKey: bigint) {
        const account = new TongoAccount(privateKey, tongoAddress, provider);
        const address = account.tongoAddress();

        this.accounts.set(name, {
            name,
            privateKey,
            address
        });
    }

    getAccount(name: string): TongoAccount | null {
        const info = this.accounts.get(name);
        if (!info) return null;

        return new TongoAccount(info.privateKey, tongoAddress, provider);
    }

    listAccounts(): string[] {
        return Array.from(this.accounts.keys());
    }
}
```

## Next Steps

- [Learn about Accounts](accounts.md)
- [See wallet integration guide](../guides/wallet-integration.md)
- [Explore examples](../examples/react-integration.md)
