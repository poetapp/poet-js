# Po.et JS

[![CircleCI](https://circleci.com/gh/poetapp/poet-js.svg?style=svg)](https://circleci.com/gh/poetapp/poet-js)
[![Renovate enabled](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Join the chat at https://gitter.im/poetapp/Lobby](https://badges.gitter.im/poetapp/Lobby.svg)](https://gitter.im/poetapp/Lobby)

Po.et JS is a small library that provides methods to easily create and sign Po.et Claims according to the 
[Verifiable Credentials Data Model](https://w3c.github.io/vc-data-model). These claims are [JSON-LD](https://w3c.github.io/json-ld-syntax/)
documents. As such, you can define your own JSON-LD `@context` to map your submitted Claims.

Po.et does provide a few default `@context` objects that you can extend or override in the `createClaim` function. The current defaults are as follows:

```typescript
export const DefaultClaimContext: ClaimContext = {
  cred: 'https://w3id.org/credentials#',
  dc: 'http://purl.org/dc/terms/',
  schema: 'http://schema.org/',
  sec: 'https://w3id.org/security#',

  id: 'sec:digestValue',
  issuer: 'cred:issuer',
  issuanceDate: 'cred:issued',
  type: 'schema:additionalType',
  claim: 'schema:Thing', // The most generic definition in schema.org,
}

export const DefaultWorkClaimContext: ClaimContext = {
  archiveUrl: 'schema:url',
  author: 'schema:author',
  canonicalUrl: 'schema:url',
  claim: 'schema:CreativeWork',
  contributors: {
    '@id': 'schema:ItemList',
    '@container': '@list',
    '@type': 'schema:contributor',
  },
  copyrightHolder: 'schema:copyrightHolder',
  dateCreated: 'schema:dateCreated',
  datePublished: 'schema:datePublished',
  license: 'schema:license',
  name: 'schema:name',
  tags: 'schema:keywords',
  hash: 'sec:digestValue',
}

export const DefaultIdentityClaimContext: ClaimContext = {
  publicKey: 'sec:publicKeyBase58',
  profileUrl: 'sec:owner',
}

```

## Installation

```
npm i @po.et/poet-js
```

## Usage

Note that the Po.et network currently uses 
[Ed25519Signature2018](https://w3c-dvcg.github.io/lds-ed25519-2018/), which requires a Base58
form of the Ed25519 Private Key. You can use the KeyHelper utility to generate a base58 public/privateKey pair, if you
do not yet have one.

**WARNING**
Do not use the example private key in these documents. No one should have access to your private key, and it certainly should not be in the example documents of a library. If you
use the example private key, others can make additional claims using the same key.

```typescript
import { createIssuerFromPrivateKey, generateED25519Base58Keys } from '@po.et/poet-js'

const { privateKey } = generateED25519Base58Keys('entropy_phrase') // e.g 'LWgo1jraJrCB2QT64UVgRemepsNopBF3eJaYMPYVTxpEoFx7sSzCb1QysHeJkH2fnGFgHirgVR35Hz5A1PpXuH6'

const issuer = createIssuerFromPrivateKey(privateKey)

```

----

Use `configureCreateVerifiableClaim()` to create a `createVerifiableClaim` function to create an unsigned Verifiable Claim.
Then use `configureSignVerifiableClaim` from `getVerifiableClaimSigner()` to create the proper function to sign and verify your claims.

### Example 1: Create and Sign a Verifiable Work Claims <!-- TODO: link to glossary -->

```typescript
import { configureCreateVerifiableClaim, createIssuerFromPrivateKey, getVerifiableClaimSigner } from '@po.et/poet-js'

const { configureSignVerifiableClaim } = getVerifiableClaimSigner()

const issuerPrivateKey = 'LWgo1jraJrCB2QT64UVgRemepsNopBF3eJaYMPYVTxpEoFx7sSzCb1QysHeJkH2fnGFgHirgVR35Hz5A1PpXuH6' 
const issuer = createIssuerFromPrivateKey(issuerPrivateKey)

const createVerifiableWorkClaim = configureCreateVerifiableClaim({ issuer })
const signVerifiableClaim = configureSignVerifiableClaim({ privateKey: issuerPrivateKey })

const workClaim = {
  name: 'The Raven',
  author: 'Edgar Allan Poe',
  tags: 'poem',
  dateCreated: '',
  datePublished: '1845-01-29T03:00:00.000Z',
  archiveUrl: 'https://example.com/raven',
  hash: '<hash of content>',
}

const unsignedVerifiableClaim = await createVerifiableWorkClaim(workClaim)
const signedWorkClaim = await signVerifiableClaim(unsignedVerifiableClaim)
```

Once this claim is created, you can publish it to a Po.et Node:

```ts
const response = await fetch(poetNodeUrl + '/works/', {
  method: 'POST',
  headers: {
	'Accept': 'application/json',
	'Content-Type': 'application/json'
  },
  body: JSON.stringify(signedWorkClaim)
})
```

### Example 2: Create and sign a Verifiable Work Claim with overriding context

If you want to extend or override the default context defined by Po.et, you simply need to pass a context object into 
the `configureCreateVerifiableClaim` function:

```typescript
import { ClaimType, configureCreateVerifiableClaim, createIssuerFromPrivateKey, getVerifiableClaimSigner } from '@po.et/poet-js'

const { configureSignVerifiableClaim } = getVerifiableClaimSigner()

const issuerPrivateKey = 'LWgo1jraJrCB2QT64UVgRemepsNopBF3eJaYMPYVTxpEoFx7sSzCb1QysHeJkH2fnGFgHirgVR35Hz5A1PpXuH6' 
const issuer = createIssuerFromPrivateKey(issuerPrivateKey)

const externalContext: any = {
  claim: 'schema:Book',
  edition: 'schema:bookEdition',
  isbn: 'schema.org/isbn',
}

const createVerifiableWorkClaim = configureCreateVerifiableClaim({ issuer, type: ClaimType.Work, context: externalContext })
const signVerifiableClaim = configureSignVerifiableClaim({ privateKey: issuerPrivateKey })


const workClaim = {
  name: 'The Raven',
  author: 'Edgar Allan Poe',
  tags: 'poem',
  dateCreated: '',
  datePublished: '1845-01-29T03:00:00.000Z',
  archiveUrl: 'https://example.com/raven',
  hash: '<hash of content>',
  isbn: '9781458318404',
  edition: '1',
}

const unsignedVerifiableClaim = await createVerifiableWorkClaim(workClaim)
const signedWorkClaim = await signVerifiableClaim(unsignedVerifiableClaim)
```

Notice you don't need to wait for the server's response to know the claim's ID. You don't even need to publish it! 
`claim.id` is readily available right after creating the unsigned verifiable claim.

## [Contributing](https://github.com/poetapp/documentation/blob/master/CONTRIBUTING.md)

### Compiling

Run `npm run build` to compile the source. This will run TypeScript on the source files and place the output in `dist/ts`, and will then run Babel and place the output in `dist/babel`.

Currently, we're only using Babel to support [absolute import paths](https://github.com/tleunen/babel-plugin-module-resolver) in the unit tests. This is due to how TypeScript and Babel process absolute paths. On build, TypeScript transforms the .ts files into .js and places type definitions in .d.ts files. Babel, with the module-resolver plugin, will then transform the absolute paths in these .js files into relative paths, but will leave the .d.ts unchanged, which still have absolute paths. This causes issues with clients of the library that want to use these TypeScript definitions.   

### Tests

Run all tests with `npm test`.

### Coverage

Coverage reports are created with [Istanbul](https://github.com/istanbuljs/nyc), which can be generated by running `npm run coverage`.

## [Security](https://github.com/poetapp/documentation/blob/master/SECURITY.md)
