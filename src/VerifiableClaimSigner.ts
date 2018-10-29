/* tslint:disable:no-relative-imports */

import { IllegalArgumentException } from './Exceptions'
import { isSignedVerifiableClaim, SignedVerifiableClaim, SigningAlgorithm, VerifiableClaim } from './Interfaces'
import { generateClaimId } from './VerifiableClaim'

import JSONLD = require('jsonld')
import JSONLD_SIGS = require('jsonld-signatures')
import { dataDocumentLoader } from './util/DataDocumentLoader'
import { SupportedAlgorithms } from './util/KeyHelper'

export interface VerifiableClaimSigner {
  readonly configureSignVerifiableClaim: (
    config: SignVerifiableClaimConfig,
  ) => (verifiableClaim: VerifiableClaim) => Promise<SignedVerifiableClaim>
  readonly isValidSignedVerifiableClaim: (signedVerifiableClaim: SignedVerifiableClaim) => Promise<boolean>
  readonly isValidSignature: (signedVerifiableClaim: SignedVerifiableClaim) => Promise<boolean>
}

interface SignVerifiableClaimConfig {
  readonly privateKey: string
  readonly algorithm?: SigningAlgorithm
}

export const getVerifiableClaimSigner = (): VerifiableClaimSigner => {
  const jsonld = JSONLD()

  jsonld.documentLoader = dataDocumentLoader
  const jsig = JSONLD_SIGS()
  jsig.use('jsonld', jsonld)
  const checkNonce = (nonce: string, options: any, callback: any) => callback(null, true)
  const checkDomain = (nonce: string, options: any, callback: any) => callback(null, true)

  const isValidSignature = async (claim: SignedVerifiableClaim): Promise<boolean> => {
    const results: any = await jsig.verify(claim, { checkNonce, checkDomain, checkTimestamp: false })

    return results.verified
  }

  const signClaimValidateSigningOptions = (signingOptions: any) => {
    if (signingOptions.creator === undefined || signingOptions.creator === null || signingOptions.creator === '')
      throw new IllegalArgumentException('Cannot sign a claim with an invalid creator in the signing options.')
  }

  const createSigningOptions = (algorithm: SigningAlgorithm = SigningAlgorithm.Ed25519Signature2018) => (
    privateKey: string,
  ) => SupportedAlgorithms[algorithm].getSigningOptions(privateKey)

  const configureSignVerifiableClaim = ({
    privateKey,
    algorithm = SigningAlgorithm.Ed25519Signature2018,
  }: SignVerifiableClaimConfig) => async (verifiableClaim: VerifiableClaim): Promise<SignedVerifiableClaim> => {
    const id = await generateClaimId(verifiableClaim)
    const signingOptions = { ...createSigningOptions(algorithm)(privateKey), creator: verifiableClaim.issuer }

    signClaimValidateSigningOptions(signingOptions)

    const signedClaim = await jsig.sign(
      {
        '@context': verifiableClaim['@context'],
        id,
        type: verifiableClaim.type,
        issuer: verifiableClaim.issuer,
        issuanceDate: verifiableClaim.issuanceDate,
        claim: verifiableClaim.claim,
      },
      signingOptions,
    )
    if (isValidSignature(signedClaim)) return signedClaim
    throw new IllegalArgumentException('Claim signature is invalid')
  }

  const isValidSignedVerifiableClaim = async (signedVerifiableClaim: SignedVerifiableClaim): Promise<boolean> =>
    isSignedVerifiableClaim(signedVerifiableClaim) &&
    (await isValidSignature(signedVerifiableClaim)) &&
    (await generateClaimId(signedVerifiableClaim)) === signedVerifiableClaim.id

  return {
    configureSignVerifiableClaim,
    isValidSignedVerifiableClaim,
    isValidSignature,
  }
}
