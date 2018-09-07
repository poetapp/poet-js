import * as Joi from 'joi'
import * as jsigs from 'jsonld-signatures'

export enum ClaimType {
  Identity = 'Identity',
  Work = 'Work',
}

export interface ClaimAttributes {
  readonly [key: string]: string
}

export interface ClaimSignature {
  readonly '@graph': {
    readonly [key: string]: any
  }
}

export interface Claim<T extends ClaimAttributes = ClaimAttributes> {
  readonly '@context'?: any
  readonly id?: string
  readonly issuer: string
  readonly issued: string
  readonly type: ClaimType
  readonly 'https://w3id.org/security#proof'?: any
  readonly claim: T
}

export interface SignedClaim<T extends ClaimAttributes = ClaimAttributes> {
  readonly '@context': any
  readonly id: string
  readonly issuer: string
  readonly issued: string
  readonly type: ClaimType
  readonly 'https://w3id.org/security#proof': any
  readonly claim: T
}

interface ClaimContext {
  readonly '@context': {
    readonly [key: string]: string
  }
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
      scheme: ['po.et', 'http', 'https', 'did'],
    }),
  issued: Joi.string()
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

// WARNING: This MUST account for ALL of the attributes in a Claim, except for id, @context, and signature.
// Otherwise those attributes without context will be left out of the canonized/signed claim.
// Refer to https://www.w3.org/2018/jsonld-cg-reports/json-ld/#the-context
export const ClaimContext: ClaimContext = {
  '@context': {
    issuer: 'http://schema.org/Organization',
    issued: 'http://purl.org/dc/terms/created',
    type: 'http://schema.org/additionalType',
    claim: 'http://schema.org/CreativeWork',
    author: 'http://schema.org/author',
    dateCreated: 'http://schema.org/dateCreated',
    datePublished: 'http://schema.org/datePublished',
    name: 'http://schema.org/name',
    keywords: 'http://schema.org/keywords',
    text: 'http://schema.org/text',
    url: 'http://schema.org/url',
  },
}

export interface WorkAttributes extends ClaimAttributes {
  readonly author: string
  readonly dateCreated: string
  readonly datePublished: string
  readonly keywords?: string
  readonly name: string
  readonly text?: string
  readonly url?: string
}

export interface Work extends Claim<WorkAttributes> {}

export interface Identity extends Claim<IdentityAttributes> {}

export interface IdentityAttributes extends ClaimAttributes {
  readonly profileUrl?: string
  readonly publicKey: string
}

export function isWork(claim: Claim): claim is Work {
  return claim.type === ClaimType.Work
}

export function isIdentity(claim: Claim): claim is Identity {
  return claim.type === ClaimType.Identity
}

export interface TransactionPoetTimestamp {
  readonly transactionId: string
  readonly outputIndex: number
  readonly prefix: string
  readonly version: ReadonlyArray<number>
  readonly ipfsDirectoryHash: string
}

export interface PoetTimestamp extends TransactionPoetTimestamp {
  readonly blockHeight: number
  readonly blockHash: string
  readonly ipfsFileHash?: string
}
