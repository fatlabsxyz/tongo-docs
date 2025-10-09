# Installation

## Using npm

```bash
npm install @fatsolutions/tongo-sdk
```

## Using pnpm

```bash
pnpm add @fatsolutions/tongo-sdk
```

## Using yarn

```bash
yarn add @fatsolutions/tongo-sdk
```

## Peer Dependencies

The Tongo SDK requires Starknet.js as a peer dependency. If you don't have it installed:

```bash
npm install starknet
```

## Version Compatibility

| Tongo SDK | Starknet.js | Node.js |
|-----------|-------------|---------|
| 1.1.x     | ^7.0.0      | >=18    |

## TypeScript Support

The SDK is written in TypeScript and includes full type definitions. No additional `@types` packages are needed.

### TypeScript Configuration

Ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "moduleResolution": "node",
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

## Verification

Verify your installation:

```typescript
import { Account } from "@fatsolutions/tongo-sdk";
console.log("Tongo SDK loaded successfully!");
```

## Next Steps

- [Quick Start Guide](quick-start.md) - Create your first Tongo transaction
- [Core Concepts](concepts/accounts.md) - Learn about Accounts and Operations
