/* tslint:disable:no-relative-imports */
import * as Joi from 'joi'
import * as JSONLD_SIGS from 'jsonld-signatures'

import { IllegalArgumentException } from './Exceptions'

export enum ClaimType {
  Identity = 'Identity',
  Work = 'Work',
}

export interface BaseVerifiableClaim {
  readonly '@context': any
  readonly issuer: string
  readonly issuanceDate: string
  readonly type: ClaimType
  readonly claim: object
}
export interface VerifiableClaim extends BaseVerifiableClaim {
  readonly id: string
}

export interface SignedVerifiableClaim extends VerifiableClaim {
  readonly 'sec:proof': any
}

export interface ClaimContext {
  readonly [key: string]: unknown
}

export interface ClaimTypeContexts {
  readonly [key: string]: ClaimContext
}

export interface SigningOptions {
  readonly algorithm: SigningAlgorithm
  readonly nonce: string
}

export interface Ed25519SigningOptions extends SigningOptions {
  readonly privateKeyBase58: string
}

export interface RsaSigningOptions extends SigningOptions {
  readonly privateKeyPem: string
}

// WARNING: This MUST account for ALL of the attributes in a Claim, except for id, @context, and signature.
// Otherwise those attributes without context will be left out of the canonized/signed claim.
// Refer to https://www.w3.org/2018/jsonld-cg-reports/json-ld/#the-context
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

const verifiableClaimSchema = {
  '@context': Joi.object(),
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
}

const signatureSchema = {
  '@graph': Joi.object().keys({
    '@type': Joi.string().only(Object.keys(JSONLD_SIGS.suites).map(suite => `sec:${suite}`)),
    'http://purl.org/dc/terms/created': Joi.object().keys({
      '@type': Joi.string().uri(),
      '@value': Joi.string()
        .required()
        .isoDate(),
    }),
    'http://purl.org/dc/terms/creator': Joi.object({
      '@id': Joi.string()
        .required()
        .uri({ scheme: ['po.et', 'http', 'https', 'did', 'data'] }),
    }),
    'dc:creator': Joi.object({
      '@id': Joi.string()
        .required()
        .uri({ scheme: ['po.et', 'http', 'https', 'did', 'data'] }),
    }),
    'https://w3id.org/security#jws': Joi.string(),
    'dc:created': Joi.object().keys({
      '@type': Joi.string().uri(),
      '@value': Joi.string()
        .required()
        .isoDate(),
    }),
    'sec:jws': Joi.string(),
    'sec:nonce': Joi.string(),
  }),
}

const signedVerifiableClaimSchema = {
  ...verifiableClaimSchema,
  'sec:proof': Joi.object(signatureSchema).required(),
}

export interface CreateVerifiableClaimConfig {
  readonly issuer: string
  readonly type?: ClaimType
  readonly context?: ClaimContext
}

export const isVerifiableClaim = (object: any): object is VerifiableClaim => {
  return Joi.validate(object, verifiableClaimSchema).error === null
}

export const isSignedVerifiableClaim = (object: any): object is SignedVerifiableClaim => {
  return Joi.validate(object, signedVerifiableClaimSchema).error === null
}

export const DefaultIdentityClaimContext: ClaimContext = {
  publicKey: 'sec:publicKeyBase58',
  profileUrl: 'sec:owner',
}

export const claimTypeDefaults: ClaimTypeContexts = {
  Work: DefaultWorkClaimContext,
  Identity: DefaultIdentityClaimContext,
}

export interface Work extends VerifiableClaim {}

export interface Identity extends VerifiableClaim {}

export function isWork(verifiableClaim: VerifiableClaim): verifiableClaim is Work {
  return verifiableClaim.type === ClaimType.Work
}

export function isIdentity(verifiableClaim: VerifiableClaim): verifiableClaim is Identity {
  return verifiableClaim.type === ClaimType.Identity
}

export interface PoetAnchor {
  readonly prefix: string
  readonly version: number
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
  RsaSignature2018 = 'RsaSignature2018',
}

export const getSigningAlgorithm = (algorithmName: string): SigningAlgorithm => {
  switch (algorithmName) {
    case SigningAlgorithm.Ed25519Signature2018: {
      return SigningAlgorithm.Ed25519Signature2018
    }
    case SigningAlgorithm.RsaSignature2018: {
      return SigningAlgorithm.RsaSignature2018
    }
    default: {
      throw new IllegalArgumentException(`Unsupported Signing Algorithm ${algorithmName}`)
    }
  }
}

export enum AlgorithmPublicKeyType {
  Ed25519VerificationKey2018 = 'Ed25519VerificationKey2018',
  RsaVerificationKey2018 = 'RsaVerificationKey2018',
}
