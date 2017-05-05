# poet-js

A typescript library to deal with po.et logic and API.

## Overview

Po.et is a data-oriented validation engine for public claims, used to make a truthful evaluation of claims by any actor based on a set of trusted notaries.

A notary in this sense acts as an oracle for whether a third party "Claim" is trusted or not. They issue "Certificate" claims that attest to the validity of a referenced claim.

After running validations, claims can be viewed as trusted messages to update the state of a system. The current working version of Po.et uses this to update a database with the current state of attribution of ownership of copyright material.

Po.et's main structure is the `Claim` class.

```
class Claim {
  string id
  string publicKey
  string signature
  string type
  { [key: string]: string } attributes
}
```

## Encoding and Technical notes: 

* All strings values are serialized using UTF-8 encoding.

* A claim's id is the double SHA256 hex digest of serializing its members (with the id set to the empty string).

* A claim attributes are encoded by lexicographically ordering its attributes. This allows encoding and decoding claims from and to any Map implementation with ease.

* Signature is an ECDSA signature using secp256k1. The public key used must be encoded using the compressed version.

* The signature verification's `s` value must be the lowest one to prevent malleability of the value.

* The signature must match the double SHA256 digest of the protocol buffer serializing the data by setting the `id` and `signature` fields to the empty string. The field `publicKey` is used to verify the signature.
