# Po.et JS

[![Build Status](https://travis-ci.org/poetapp/poet-js.svg?branch=master)](https://travis-ci.org/poetapp/poet-js)
[![Renovate enabled](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Join the chat at https://gitter.im/poetapp/Lobby](https://badges.gitter.im/poetapp/Lobby.svg)](https://gitter.im/poetapp/Lobby)

Po.et JS is an small library that provides methods to easily create and sign Po.et Claims.

### Installation
```
npm i @po.et/poet-js
```

### Usage

The main function you'll be using is `createClaim`:

#### Example 1: createClaim for Work Claims
```ts
import { Claim, ClaimType, createClaim } from '@po.et/poet-js'

const workAttributes = {
  name: 'The Raven',
  author: 'Edgar Allan Poe',
  tags: 'poem',
  dateCreated: '',
  datePublished: '1845-01-29T03:00:00.000Z',
  text: 'Once upon a midnight dreary...'
}
const Issuer = {
  id: 'po.et://entities/:identityClaimId',
  signingOptions: {
    algorithm: 'Ed25519Signature2018',
    creator: 'po.et://entities/:identityClaimId/publicKey',
    privateKeyBase58: 'LWgo1jraJrCB2QT64UVgRemepsNopBF3eJaYMPYVTxpEoFx7sSzCb1QysHeJkH2fnGFgHirgVR35Hz5A1PpXuH6'
}

const claim = createClaim(
  Issuer,
  ClaimType.Work,
  workAttributes
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
Note, if you are creating an identity claim, your IDP will be the issuer of the claim. If you are self-serving your own
IDP, you will have to create an IdentityClaim for the IDP from which you can issue all further identities. Currently the
Po.et network uses the [Ed25519Signature2018](https://w3c-dvcg.github.io/lds-ed25519-2018/), which requires a Base58 form
of the Ed25519 Public Key.

#### Example 2: createClaim for Identity Claims
```ts
import { Claim, ClaimType, createClaim } from '@po.et/poet-js'
import * as forge from 'node-forge'
import * as bs58 from 'bs58'

const ed25519 = forge.pki.ed25519
const keypair = ed25519.generateKeyPair()
const publicKey = bs58.encode(keypair.publicKey)

const identityAttributes = {
  publicKey
}

const Issuer = {
  id: 'po.et://entities/:identityClaimId', # OR 'did:po.et:<Base58Ed25519PublicKeyValue>' for example, 'did:po.et:JAi9YoyDdgBQLenyVzoXWH4C26wKMzHrjertxVrjLWTe'
  signingOptions: {
    algorithm: 'Ed25519Signature2018',
    creator: 'po.et://entities/:identityClaimId/publicKey', # OR 'did:po.et:<Base58Ed25519PublicKeyValue>' for example: 'did:po.et:JAi9YoyDdgBQLenyVzoXWH4C26wKMzHrjertxVrjLWTe'
    privateKeyBase58: 'LWgo1jraJrCB2QT64UVgRemepsNopBF3eJaYMPYVTxpEoFx7sSzCb1QysHeJkH2fnGFgHirgVR35Hz5A1PpXuH6'
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


Notice you don't need to wait for the server's response to know the claim's Id. You don't even need to publish it! `claim.id` is readily available right after calling `createClaim`.

## Contributing

### Compiling
Run `npm run build` to compile the source. This will run TypeScript on the source files and place the output in `dist/ts`, and then it'll run Babel and place the output in `dist/babel`.

Currently, we're only using Babel to support [absolute import paths](https://github.com/tleunen/babel-plugin-module-resolver) in the unit tests.
> Absolute paths are only used in the tests. This is due to how Typescript and Babel process absolute paths: on build, Typescript transforms the .ts files into .js and places type definitions in .d.ts files. Babel, with the module-resolver plugin, will then transform the absolute paths in these .js files into relative paths, but will leave the .d.ts unchanged — which still have absolute paths. This causes issues with clients of the library that want to use these typescript definitions.

### Tests
Run all tests with `npm test`.


### Coverage
Coverage is generated with [Istanbul](https://github.com/istanbuljs/nyc) whenever tests are run.
A more complete report can be generated by running `npm run coverage`.

This area needs some reviewing — the reports look a bit off sometimes.

Also, we'll want the Travis job to check that coverage doesn't go down with pull requests.

### Branches and Pull Requests
The master branch is blocked - no one can commit to it directly. To contribute changes, branch off from master and make a PR back to it.

TravisCI will run all tests automatically for all pull requests submitted.

### Code Style
Please run `npm run lint`. The linting configuration still needs some tweaking, and it'll be added to Travis in the future.

