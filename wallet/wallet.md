# Requirements for the Wallet

1. `wallet` must have a `balance`
2. `balance` has a starting configurable value of `STARTING_BALANCE`
3. `wallet` must have a `publicKey`
4. `publicKey` must be a public key generated using elliptic curve "secp256k1" algorithm implementation
5. `Wallet` must have `sign()` that takes `data` and hash it then return the signature after encrypting it with `privateKey`
