# Operations
Operations are objects that represent Tongo transactions. Each operation encapsulates the cryptographic proofs, encrypted data, and calldata needed for a specific action.

## Creation and Execution
Operations are created by an instance of a Tongo [Account Class](../accounts.md) and executed by a starknet signer. The general lifecycle of an Operation is 

```typescript
// 1. Create the operation
const operation = await tongoAccount.someOperation({...params});

// 2. Convert to calldata
const calldata = operation.toCalldata();

// 3. Execute with Starknet signer
const tx = await signer.execute([calldata]);

// 4. Wait for confirmation
await provider.waitForTransaction(tx.transaction_hash);
```
All operations have a `toCalldata()` method that serialized all the needed data and contructs the starknet `call`. This call is to be executed by the transaction sender or signer.

Each operation has its own set of `params` that are needed to create it. Some generalities are shared between the parameters of Operations and requires further explanations

### **The `sender` parameter**
This parameter is present in all operations. It is the starknet account address that will execute the transaction (the signer address in the example). This address is binded in the Zero-Knowledge proofs. ZK proofs will only be valid if the sender of the transaction is matches this parameter.


### **The `amount` parameter**
This parameter, when present, represents a **amount of Tongos** to transact with. This is NOT the amount of ERC20 you pretend to transact with. When you wrap some amount of ERC20 you recive some other amount of wraped ERC20 (we call them Tongos). The rate of conversion is fixed and defined when that particuar instance of Tongo was deployed. 

Note that 1 unit of Tongo is the minimum amount that a operation can handle. The Tongo Account class has the `rate()` method to query the rate of the Tongo contract and the `tongoToERC20()` get te equivalent amount of ERC20 to some amount of Tongos.


## Operation Types

Tongo supports five core operations, we describe them in the following sections:

1. **[Fund](fund.md)** - Convert ERC20 tokens to encrypted balance
2. **[Transfer](transfer.md)** - Send encrypted amounts to another account
4. **[Rollover](rollover.md)** - Claim pending incoming transfers
3. **[Withdraw](withdraw.md)** - Convert encrypted balance back to ERC20
5. **[Ragequit](ragequit.md)** - Emergency withdrawal of entire balance

## Multi-Operations (v2)
A `MultiOperation` bundles several operations into a **single StarkNet transaction** that settles atomically. Because each operation's ZK proof commits to the state it acts on, they can't just be concatenated: the bundle chains them, proving each one against the state left by the previous.

You start a bundle with a `sender` and push operations into it. The `sender` is fixed by the bundle, so it is omitted from each descriptor:

```typescript
import { OperationType } from "@fatsolutions/tongo-sdk";

const multi = await tongoAccount.startMultiOperation("SENDER_ADDRESS");
await tongoAccount.pushOperation(multi, { OperationType, ...params });

const tx = await signer.execute(multi.toCalldata());
```

Each descriptor takes a `type` and that operation's parameters. All operations in a bundle must share the same sender, contract and chain. Multioperations can also be seeded with a already-built basic operation.
