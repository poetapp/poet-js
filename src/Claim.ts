/* tslint:disable:no-relative-imports */
import * as crypto from 'crypto'
import * as cuid from 'cuid'
import * as jsonld from 'jsonld'
import * as jsig from 'jsonld-signatures'

import { IllegalArgumentException } from './Exceptions'
import {
  Claim,
  ClaimAttributes,
  ClaimType,
  ClaimContext,
  DefaultClaimContext,
  claimTypeDefaults,
  isClaim,
} from './Interfaces'
import { DataParser } from './util/DataParser'

DataParser(jsonld)
jsig.use('jsonld', jsonld)

const canonizeClaim = async (document: Claim): Promise<string> => {
  const contextualClaim = {
    '@context': {
      ...DefaultClaimContext['@context'],
      ...claimTypeDefaults[document.type]['@context'],
      ...document['@context'],
    },
    type: document.type,
    issuer: document.issuer,
    issuanceDate: document.issuanceDate,
    claim: document.claim,
  }
  return jsonld.canonize(contextualClaim)
}

/*
  signClaim = (signingOptions: any) => async (document: Claim): Promise<Claim>
    signingOptions:
      algorithm: 'Ed25519VerificationKey2018'
      creator: 'data:,<base58PublicKeyValue>'
      privateKeyBase58: base58 rendition of an Ed22159 private key
    document: any valid Claim
  NOTE: If you choose to use a different signing algorhithm, the other signingOption keys may differ.
  Refer to the jsonld-signatures library for more detail
*/
export const signClaim = (signingOptions: any) => async (document: Claim): Promise<Claim> => {
  if (!document.id) throw new IllegalArgumentException('Cannot sign a claim that has an empty .id field')
  if (signingOptions.creater === null || signingOptions.creator === '')
    throw new IllegalArgumentException('Cannot sign a claim with an invalid creator in the signing options.')
  const generatedId = await getClaimId(document)
  if (document.id !== generatedId)
    throw new IllegalArgumentException('Cannot sign a claim whose id has been altered or generated incorrectly.')
  return await jsig.sign(
    {
      '@context': document['@context'],
      type: document.type,
      issuer: document.issuer,
      issuanceDate: document.issuanceDate,
      claim: document.claim,
    },
    signingOptions
  )
}

export const isValidSignature = async (claim: Claim): Promise<boolean> => {
  const results: any = await jsig.verify(claim, { checkNonce: cuid.isCuid })

  return results.verified
}

export const getClaimId = async (claim: Claim): Promise<string> => {
  const canonizedClaim = await canonizeClaim(claim)
  const buffer = Buffer.from(canonizedClaim)
  return crypto
    .createHash('sha256')
    .update(buffer)
    .digest()
    .toString('hex')
}

export const createClaim = async (
  issuer: any,
  type: ClaimType,
  claimAttributes: ClaimAttributes,
  context: ClaimContext = { '@context': {} }
): Promise<Claim> => {
  const claim: Claim = {
    '@context': { ...DefaultClaimContext['@context'], ...claimTypeDefaults[type]['@context'], ...context['@context'] },
    type,
    issuer: issuer.id,
    issuanceDate: new Date().toISOString(),
    claim: { ...claimAttributes },
  }
  const id = await getClaimId(claim)
  const sign = signClaim({ nonce: cuid(), ...issuer.signingOptions })
  return await sign({
    ...claim,
    id,
  })
}

export const isValidClaim = async (claim: {}): Promise<boolean> =>
  isClaim(claim) && (await isValidSignature(claim)) && (await getClaimId(claim)) === claim.id
