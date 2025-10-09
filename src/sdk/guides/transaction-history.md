# Transaction History

Query and display transaction history for Tongo accounts.

## Overview

The SDK provides methods to fetch different types of events for an account.

## Event Types

- **Fund**: ERC20 deposited
- **Transfer Out**: Sent to another account
- **Transfer In**: Received from another account
- **Rollover**: Pending claimed
- **Withdraw**: Converted back to ERC20
- **Ragequit**: Emergency withdrawal

## Fetching All Events

```typescript
// Get complete transaction history from block 0
const history = await account.getTxHistory(0);

console.log(history);
// [
//   { type: 'fund', amount: 1000n, tx_hash: '0x...', block_number: 12345 },
//   { type: 'transferOut', amount: 100n, to: 'Um6Q...', ... },
//   { type: 'rollover', amount: 50n, ... },
//   ...
// ]
```

## Fetching Specific Event Types

```typescript
// Fund events
const fundEvents = await account.getEventsFund(initialBlock);

// Transfer out events
const transfersOut = await account.getEventsTransferOut(initialBlock);

// Transfer in events
const transfersIn = await account.getEventsTransferIn(initialBlock);

// Rollover events
const rollovers = await account.getEventsRollover(initialBlock);

// Withdraw events
const withdrawals = await account.getEventsWithdraw(initialBlock);

// Ragequit events
const ragequits = await account.getEventsRagequit(initialBlock);
```

## Event Interfaces

```typescript
// Fund event
interface AccountFundEvent {
    type: 'fund';
    tx_hash: string;
    block_number: number;
    nonce: bigint;
    amount: bigint;
}

// Transfer out event
interface AccountTransferOutEvent {
    type: 'transferOut';
    tx_hash: string;
    block_number: number;
    nonce: bigint;
    amount: bigint;
    to: string;  // Base58 Tongo address
}

// Transfer in event
interface AccountTransferInEvent {
    type: 'transferIn';
    tx_hash: string;
    block_number: number;
    nonce: bigint;
    amount: bigint;
    from: string;  // Base58 Tongo address
}
```

## Display Example

```typescript
async function displayHistory(account: TongoAccount) {
    const history = await account.getTxHistory(0);

    for (const event of history) {
        const date = new Date(event.block_number * 12000); // Approximate
        console.log(`[${date.toISOString()}] ${event.type}`);

        switch (event.type) {
            case 'fund':
                console.log(`  Deposited ${event.amount}`);
                break;
            case 'transferOut':
                console.log(`  Sent ${event.amount} to ${event.to}`);
                break;
            case 'transferIn':
                console.log(`  Received ${event.amount} from ${event.from}`);
                break;
            case 'rollover':
                console.log(`  Claimed ${event.amount}`);
                break;
            case 'withdraw':
                console.log(`  Withdrew ${event.amount} to ${event.to}`);
                break;
        }
        console.log(`  TX: ${event.tx_hash}`);
    }
}
```

## React Component Example

```typescript
function TransactionHistory({ account }: { account: TongoAccount }) {
    const [history, setHistory] = useState<AccountEvents[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadHistory() {
            const events = await account.getTxHistory(0);
            setHistory(events.sort((a, b) => b.block_number - a.block_number));
            setLoading(false);
        }
        loadHistory();
    }, [account]);

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h2>Transaction History</h2>
            {history.map((event, i) => (
                <div key={i}>
                    <strong>{event.type}</strong>
                    <span>Amount: {event.amount.toString()}</span>
                    <a href={`https://starkscan.co/tx/${event.tx_hash}`}>
                        View on StarkScan
                    </a>
                </div>
            ))}
        </div>
    );
}
```

## Performance Considerations

```typescript
// Cache the last block queried
let lastBlock = 0;

async function updateHistory(account: TongoAccount) {
    // Only fetch new events since last check
    const newEvents = await account.getTxHistory(lastBlock);

    // Update last block
    if (newEvents.length > 0) {
        lastBlock = Math.max(...newEvents.map(e => e.block_number));
    }

    return newEvents;
}
```

## Next Steps

- [Complete Workflow Example](../examples/complete-workflow.md)
- [API Reference](../api/account.md)
