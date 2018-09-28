import * as Joi from 'joi'
import * as jsigs from 'jsonld-signatures'

export enum ClaimType {
  Identity = 'Identity',
  Work = 'Work',
}

export interface Claim {
  readonly '@context'?: any
  readonly id?: string
  readonly issuer: string
  readonly issuanceDate: string
  readonly type: ClaimType
  readonly 'https://w3id.org/security#proof'?: any
  readonly claim: object
}

export interface ClaimContext {
  readonly [key: string]: unknown
}

export interface ClaimTypeContexts {
  readonly [key: string]: ClaimContext
}

// WARNING: This MUST account for ALL of the attributes in a Claim, except for id, @context, and signature.
// Otherwise those attributes without context will be left out of the canonized/signed claim.
// Refer to https://www.w3.org/2018/jsonld-cg-reports/json-ld/#the-context
export const DefaultClaimContext: ClaimContext = {
  cred: 'https://w3id.org/credentials#',
  schema: 'http://schema.org/',
  sec: 'https://w3id.org/security#',

  issuer: 'cred:issuer',
  issuanceDate: 'cred:issued',
  type: 'http://schema.org/additionalType',
  claim: 'http://schema.org/Thing', // The most generic definition in schema.org,
}

export const DefaultWorkClaimContext: ClaimContext = {
  author: 'schema:author',
  claim: 'http://schema.org/CreativeWork',
  dateCreated: 'schema:dateCreated',
  datePublished: 'schema:datePublished',
  name: 'schema:name',
  keywords: 'schema:keywords',
  archiveUrl: 'schema:url',
  hash: 'sec:digestValue',
}

export const DefaultIdentityClaimContext: ClaimContext = {
  publicKey: 'sec:publicKeyBase58',
  profileUrl: 'sec:owner',
}

export const claimTypeDefaults: ClaimTypeContexts = {
  Work: DefaultWorkClaimContext,
  Identity: DefaultIdentityClaimContext,
}

const signatureSchema = {
  '@graph': Joi.object().keys({
    '@type': Joi.string().only(Object.keys(jsigs.suites).map(suite => `https://w3id.org/security#${suite}`)),
    created: Joi.object().keys({
      '@type': Joi.string().uri(),
      '@value': Joi.string()
        .required()
        .isoDate(),
    }),
    'http://purl.org/dc/terms/creator': Joi.object({
      '@id': Joi.string()
        .required()
        .uri(),
    }).required(),
    'https://w3id.org/security#jws': Joi.string(),
  }),
}

const claimSchema = Joi.object({
  id: Joi.string()
    .required()
    .alphanum()
    .min(64),
  issuer: Joi.string()
    .required()
    .uri({
      scheme: ['po.et', 'http', 'https', 'did', 'data'],
    }),
  issuanceDate: Joi.string()
    .required()
    .isoDate(),
  type: Joi.string()
    .required()
    .only([ClaimType.Identity, ClaimType.Work]),
  claim: Joi.object().required(),
  'https://w3id.org/security#proof': Joi.object(signatureSchema).required(),
})

export function isClaim(object: any): object is Claim {
  return Joi.validate(object, claimSchema).error === null
}

export interface Work extends Claim {}

export interface Identity extends Claim {}

export function isWork(claim: Claim): claim is Work {
  return claim.type === ClaimType.Work
}

export function isIdentity(claim: Claim): claim is Identity {
  return claim.type === ClaimType.Identity
}

export interface PoetAnchor {
  readonly prefix: string
  readonly version: ReadonlyArray<number>
  readonly storageProtocol: StorageProtocol
  readonly ipfsDirectoryHash: string
}

export interface PoetTransactionAnchor extends PoetAnchor {
  readonly transactionId: string
}

export interface PoetBlockAnchor extends PoetTransactionAnchor {
  readonly blockHeight: number
  readonly blockHash: string
}

export enum StorageProtocol {
  IPFS = 0,
}

export enum SigningAlgorithm {
  Ed25519Signature2018 = 'Ed25519Signature2018',
}
