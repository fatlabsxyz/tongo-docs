# Operations API Reference

All operation classes and their methods.

## Common Interface

All operations implement:

```typescript
interface IOperation {
    type: OperationType;
    toCalldata(): Call;
}
```

## FundOperation

```typescript
class FundOperation {
    type: OperationType.Fund;
    approve?: Call;

    async populateApprove(): Promise<void>;
    toCalldata(): Call;
}
```

## TransferOperation

```typescript
class TransferOperation {
    type: OperationType.Transfer;

    toCalldata(): Call;
}
```

## WithdrawOperation

```typescript
class WithdrawOperation {
    type: OperationType.Withdraw;

    toCalldata(): Call;
}
```

## RollOverOperation

```typescript
class RollOverOperation {
    type: OperationType.Rollover;

    toCalldata(): Call;
}
```

## RagequitOperation

```typescript
class RagequitOperation {
    type: OperationType.Ragequit;

    toCalldata(): Call;
}
```

## Usage

```typescript
// Create operation
const op = await account.transfer({...});

// Convert to calldata
const calldata = op.toCalldata();

// Execute
await signer.execute([calldata]);
```
