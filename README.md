# Po.et JS

[![Build Status](https://travis-ci.org/poetapp/poet-js.svg?branch=master)](https://travis-ci.org/poetapp/poet-js)
[![Renovate enabled](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Join the chat at https://gitter.im/poetapp/Lobby](https://badges.gitter.im/poetapp/Lobby.svg)](https://gitter.im/poetapp/Lobby)

Po.et JS is a small library that provides methods to easily create and sign Po.et Claims according to the 
[Verifiable Credentials Data Model](https://w3c.github.io/vc-data-model). These claims are [JSON-LD](https://w3c.github.io/json-ld-syntax/)
documents. As such, you can define your own JSON-LD `@context` to map your submitted Claims.

Po.et does provide a default `@context object` that you can extend or override in the `createClaim` function. The current defaults are as follows:

```ts  
'@context': {
   cred: 'https://w3id.org/credentials#',
   schema: 'http://schema.org/',
   sec: 'https://w3id.org/security#',
   
   // Verifiable Credentials (Claim) metadata
   issuer: 'cred:issuer',
   issuanceDate: 'cred:issued',
   type: 'http://schema.org/additionalType',
   claim: 'http://schema.org/Thing', // The most generic definition in schema.org
   
   // Work Claim Defaults
   author: 'schema:author',
   dateCreated: 'schema:dateCreated',
   datePublished: 'schema:datePublished',
   name: 'schema:name',
   keywords: 'schema:keywords',
   text: 'schema:text',
   url: 'schema:url',
   
   // Identity Claim Defaults
   publicKey: 'sec:publicKeyBase58',
   profileUrl: 'sec:owner',
},
```

## Installation

```
npm i @po.et/poet-js
```

## Usage

The supported mechanism for identifying an Issuer is:

* Use the [data URL scheme](https://tools.ietf.org/html/rfc2397) to specify the Issuer's public key. Note that the 
Po.et network currently uses [Ed25519Signature2018](https://w3c-dvcg.github.io/lds-ed25519-2018/), which requires a Base58
form of the Ed25519 Public Key.

The main function you'll be using is `createClaim`:

### Example 1: createClaim for Work Claims <!-- TODO: link to glossary -->

```ts
import { Claim, ClaimType, createClaim } from '@po.et/poet-js'

const workClaim = {
  name: 'The Raven',
  author: 'Edgar Allan Poe',
  tags: 'poem',
  dateCreated: '',
  datePublished: '1845-01-29T03:00:00.000Z',
  text: 'Once upon a midnight dreary...'
}
const Issuer = {
  id: 'data:,JAi9YoyDdgBQLenyVzoXWH4C26wKMzHrjertxVrjLWTe',
  signingOptions: {
    algorithm: 'Ed25519Signature2018',
    creator: 'data:,JAi9YoyDdgBQLenyVzoXWH4C26wKMzHrjertxVrjLWTe',
    privateKeyBase58: 'LWgo1jraJrCB2QT64UVgRemepsNopBF3eJaYMPYVTxpEoFx7sSzCb1QysHeJkH2fnGFgHirgVR35Hz5A1PpXuH6'
  }
}

const claim = createClaim(
  Issuer,
  ClaimType.Work,
  workClaim
)
```

Once this claim is created, you can publish it to a Po.et Node:

```ts
const response = await fetch(poetNodeUrl + '/works/', {
  method: 'POST',
  headers: {
	'Accept': 'application/json',
	'Content-Type': 'application/json'
  },
  body: JSON.stringify(claim)
})
```

### Example 2: createClaim for Work Claim, with overriding context



Note, if you are creating an identity claim, your IDP will be the issuer of the claim. [Frost](https://frost.po.et/) is one such IDP.
If you are self-serving your own identity calim, your identity provider (IDP) will have to create an IdentityClaim for 
itself from which you can issue all further identities. Currently the Po.et network uses the [Ed25519Signature2018](https://w3c-dvcg.github.io/lds-ed25519-2018/), 
which requires a Base58 form of the Ed25519 Public Key.

### Example 2: createClaim for Identity Claims <!-- TODO: link to glossary -->

```ts
import { Claim, ClaimType, createClaim } from '@po.et/poet-js'
import * as forge from 'node-forge'
import * as bs58 from 'bs58'

const ed25519 = forge.pki.ed25519
const keypair = ed25519.generateKeyPair()
const publicKey = bs58.encode(keypair.publicKey)
const privateKey = bs58.encode(keypair.privateKey)

const identityAttributes = {
  publicKey,
}

const Issuer = {
  id: `data:,${publicKey}`,
  signingOptions: {
    algorithm: 'Ed25519Signature2018',
    creator: `data:,${publicKey}`,
    privateKeyBase58: privateKey,
  }
}

const claim = createClaim(
  Issuer,
  ClaimType.Identity,
  identityAttributes
)
```

Once this claim is created, you can publish it to a Po.et Node:

```ts
const response = await fetch(poetNodeUrl + '/identities/', {
  method: 'POST',
  headers: {
	'Accept': 'application/json',
	'Content-Type': 'application/json'
  },
  body: JSON.stringify(claim)
})
```

Notice you don't need to wait for the server's response to know the claim's ID. You don't even need to publish it! `claim.id` is readily available right after calling `createClaim`.

## Contributing

### Compiling

Run `npm run build` to compile the source. This will run TypeScript on the source files and place the output in `dist/ts`, and will then run Babel and place the output in `dist/babel`.

Currently, we're only using Babel to support [absolute import paths](https://github.com/tleunen/babel-plugin-module-resolver) in the unit tests. This is due to how TypeScript and Babel process absolute paths. On build, TypeScript transforms the .ts files into .js and places type definitions in .d.ts files. Babel, with the module-resolver plugin, will then transform the absolute paths in these .js files into relative paths, but will leave the .d.ts unchanged, which still have absolute paths. This causes issues with clients of the library that want to use these TypeScript definitions.   

### Tests

Run all tests with `npm test`.

### Coverage

Coverage reports are created with [Istanbul](https://github.com/istanbuljs/nyc), which can be generated by running `npm run coverage`.

### Branches and Pull Requests

The master branch is blocked - no one can commit to it directly. To contribute changes, branch off of master and make a pull request back to it. Travis CI will run all tests automatically for all submitted pull requests, including linting (`npm run lint`). You can run `npm run lint:fix` for quick, automatic lint fixes.
