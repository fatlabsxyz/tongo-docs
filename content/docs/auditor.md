---
title: "Viewing Key / Auditor"
weight: 4
---
# Auditability

## Global Auditor

At the time of deploying the Tongo contract, the deploying entity must choose a public key that will serve as the global auditor key. For each user, the contract stores the account balance encrypted under the auditor’s public key. The auditor can decipher the amount stored for each account at any time.

For a transaction to be valid, the user must include (along with the new ciphered balance for their own key and the recipient’s key) a ciphered balance for the global auditor’s public key, along with a ZK proof showing that this ciphered balance encodes the same amount sent in the transaction.

The global auditor can:

- Decipher the balance of each account at any time.
- Decipher the amount sent in any transfer.

The global auditor must:

- Generate a secret key pair `(sk, pk)` and ensure that the secret key is not leaked.
- Provide the public key when the contract is deployed.

**Note:** If the global auditor’s secret key is leaked, all balances and transactions could be compromised. It is the responsibility of the global auditor to store the key securely.
