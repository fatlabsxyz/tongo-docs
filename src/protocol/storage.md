# Storage Architecture
For each Tongo account, the Tongo contract maintains multiple encrypted representations of each balance. Here we have a description of them.


## **Current Balance**
ElGamal encryption of the balance that the owner can freely use. Only the owner can modify this balance through different operations (Fund/Withdraw/Transfer/Rollover). Zero-knowledge proofs are checked against this balance. We just call this balance the user's **balance**.

## **Pending Balance**
ElGamal encryption of incoming transfers. This serves as a buffer to hold all transfers an account has received. We just call this balance the user's **pending**.

Upon owner's request, this balance is added to the user's **balance**. The separation between current and pending balances is needed because zero-knowledge proofs are checked against the current balance. If an incoming transaction were able to modify it, a malicious actor could render all ZK proofs of a user invalid by spamming transfers to the account.


## **Autenticated Encrypted Balance (Hint)**
XChaCha12 encryption of the amount encrypted in the user's **balance**. This encryption uses a key derived from the user's private key, allowing instant balance recovery without discrete log computation. This is only intended to be used as a hint for fast decryption of th user's **balance**. This `ae_balance` is not cryptographically enforced by the protocol, since there is no way to prove that the user provided the correct hint. It is purely a convenience feature. We just call this encryption **hint**. 

## **Audit Balance**
If the Tongo instance has an auditor, the `audit_balance` is an ElGamal encryption that the owner creates in each operation, encrypting the state of the user's **balance**  under the auditor’s key. In each case, the owner provides a Zero-Knowledge proof showing that the amount encrypted for the auditor is the same as that encrypted in the current balance.

## **Audit Hint**
This is an XChaCha12 encryption of the `audit_balance` using a key symmetrically derived from the owner's and auditor's key. This is a hint for the auditor, equivalent to the `ae_balance` for the owner. It is not cryptographically enforced by the protocol.
