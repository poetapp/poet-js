/* tslint:disable:no-relative-imports */
import * as crypto from 'crypto'
// import * as cuid from 'cuid'
import * as jsonld from 'jsonld'
import * as jsig from 'jsonld-signatures'

import { IllegalArgumentException } from './Exceptions'
import { Claim, ClaimAttributes, ClaimType, ClaimContext, isClaim } from './Interfaces'

jsig.use('jsonld', jsonld)

export const canonizeClaim = async (document: Claim): Promise<string> => {
  const contextualClaim = {
    '@context': document['@context'],
    type: document.type,
    issuer: document.issuer,
    issuanceDate: document.issuanceDate,
    claim: document.claim,
    ...ClaimContext,
  }
  return jsonld.canonize(contextualClaim)
}

/*
  signClaim = (signingOptions: any) => async (document: Claim): Promise<Claim>
    signingOptions:
      algorithm: 'Ed25519VerificationKey2018'
      creator: 'po.et://entities/:entityid/publicKey -OR- did:po.et:<publicKeyValue>
      privateKeyBase58: base58 rendition of an Ed22159 private key
    document: any valid Claim
  NOTE: If you choose to use a different signing algorhithm, the other signingOption keys may differ.
  Refer to the jsonld-signatures library for more detail
*/
export const signClaim = (signingOptions: any) => async (document: Claim): Promise<Claim> => {
  if (!document.id) throw new IllegalArgumentException('Cannot sign a claim that has an empty .id field')
  const generatedId = await getClaimId(document)
  if (document.id !== generatedId)
    throw new IllegalArgumentException('Cannot sign a claim whose id hasa been altered or generated incorrectly.')
  if (signingOptions.creater === null || signingOptions.creator === '')
    throw new IllegalArgumentException('Cannot sign a claim with an invalid creator in the signing options.')
  return await jsig.sign(
    {
      '@context': document['@context'],
      type: document.type,
      issuer: document.issuer,
      issuanceDate: document.issuanceDate,
      claim: document.claim,
      ...ClaimContext,
    },
    signingOptions
  )
}

export const isValidSignature = (verfiedOptions: any) => async (claim: Claim): Promise<boolean> => {
  const results = await jsig.verify(claim, verfiedOptions)
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

export const createClaim = async (issuer: any, type: ClaimType, claimAttributes: ClaimAttributes): Promise<Claim> => {
  const claim: Claim = {
    ...ClaimContext,
    id: '',
    type,
    issuer: issuer.id,
    issuanceDate: new Date().toISOString(),
    claim: { ...claimAttributes },
  }
  const id = await getClaimId(claim)
  const sign = signClaim(issuer.signingOptions)
  return await sign({
    ...claim,
    id,
  })
}

// Duplicate of poet-js?
export const isValidClaim = async (claim: {}): Promise<boolean> =>
  isClaim(claim) && isValidSignature(claim) && (await getClaimId(claim)) === claim.id
