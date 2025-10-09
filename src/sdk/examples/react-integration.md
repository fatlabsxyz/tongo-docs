# React Integration Example

Using Tongo SDK in a React application.

## Setup with React Hooks

```typescript
import { useAccount, useProvider } from '@starknet-react/core';
import { Account as TongoAccount } from '@fatsolutions/tongo-sdk';
import { useState, useEffect } from 'react';

function useTongoAccount() {
    const { account } = useAccount();
    const { provider } = useProvider();
    const [tongoAccount, setTongoAccount] = useState<TongoAccount | null>(null);
    const [balance, setBalance] = useState<bigint>(0n);
    const [pending, setPending] = useState<bigint>(0n);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (account && provider) {
            const tongoPrivateKey = 82130983n;
            const tongoAddress = "0x028...";
            const tAccount = new TongoAccount(tongoPrivateKey, tongoAddress, provider);
            setTongoAccount(tAccount);
            refreshBalance();
        }
    }, [account, provider]);

    async function refreshBalance() {
        if (!tongoAccount) return;
        setLoading(true);
        try {
            const state = await tongoAccount.state();
            setBalance(state.balance);
            setPending(state.pending);
        } finally {
            setLoading(false);
        }
    }

    return { tongoAccount, balance, pending, loading, refreshBalance };
}
```

## Transfer Component

```typescript
function TransferForm() {
    const { tongoAccount, refreshBalance } = useTongoAccount();
    const { account } = useAccount();
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleTransfer() {
        if (!tongoAccount || !account) return;
        setLoading(true);
        try {
            const transferOp = await tongoAccount.transfer({
                to: recipientPubKey,
                amount: BigInt(amount)
            });
            const tx = await account.execute([transferOp.toCalldata()]);
            await provider.waitForTransaction(tx.transaction_hash);
            await refreshBalance();
            alert('Transfer successful!');
        } catch (error) {
            alert(`Failed: $${error.message}`);$$
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <input value={amount} onChange={(e) => setAmount(e.target.value)} />
            <button onClick={handleTransfer} disabled={loading}>Send</button>
        </div>
    );
}
```

## Balance Display

```typescript
function BalanceDisplay() {
    const { balance, pending, loading } = useTongoAccount();

    return (
        <div>
            <h2>Balance</h2>
            {loading ? <p>Loading...</p> : (
                <>
                    <p>Balance: {balance.toString()}</p>
                    <p>Pending: {pending.toString()}</p>
                </>
            )}
        </div>
    );
}
```
