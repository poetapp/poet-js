/* tslint:disable:no-relative-imports */
import * as crypto from 'crypto'
import * as cuid from 'cuid'
import JSONLD = require('jsonld')
import JSONLD_SIGS = require('jsonld-signatures')
import * as ParseDataUrl from 'parse-data-url'

import { IllegalArgumentException } from '../Exceptions'
import { Claim, ClaimContext, ClaimType, claimTypeDefaults, DefaultClaimContext } from '../Interfaces'
import { getBase58ED25519PublicKeyFromPrivateKey } from '../util/KeyHelper'

export interface ClaimSigner {
  readonly createClaim: (type: ClaimType, claimAttributes: object, context: ClaimContext) => Claim
}

export const getClaimSigner = () => {
  const jsonld = JSONLD()

  const getDataDocumentLoader = (jsonld: any) => {
    const nodeDocumentLoader = jsonld.documentLoaders.node({ usePromise: true })

    return async (url: string, callback: (error: any, data: any) => any) => {
      const parsedData = ParseDataUrl(url)
      if (parsedData) {
        const publicKey = {
          id: url,
          type: 'Ed25519VerificationKey2018',
          owner: url,
          publicKeyBase58: parsedData.data,
        }
        return callback(null, {
          contextUrl: ['https://w3id.org/security/v2'],
          document: {
            owner: {
              id: url,
              publicKey: [publicKey],
            },
            publicKey,
          },
        })
      }
      nodeDocumentLoader(url, callback)
    }
  }
  jsonld.documentLoader = getDataDocumentLoader(jsonld)
  const jsig = JSONLD_SIGS()
  jsig.use('jsonld', jsonld)

  const canonizeClaim = async (document: Claim, jsonld: any): Promise<string> => {
    const contextualClaim = {
      type: document.type,
      '@context': {
        ...DefaultClaimContext,
        ...claimTypeDefaults[document.type],
        ...document['@context'],
      },
      issuer: document.issuer,
      issuanceDate: document.issuanceDate,
      claim: document.claim,
    }
    return jsonld.canonize(contextualClaim)
  }

  const getClaimId = async (claim: Claim): Promise<string> => {
    const canonizedClaim = await canonizeClaim(claim, jsonld)
    const buffer = Buffer.from(canonizedClaim)
    return crypto
      .createHash('sha256')
      .update(buffer)
      .digest()
      .toString('hex')
  }

  const isValidSignature = async (claim: Claim): Promise<boolean> => {
    const results: any = await jsig.verify(claim, { checkNonce: cuid.isCuid })

    return results.verified
  }

  const signClaimValidateClaimId = async (claim: Claim) => {
    if (!claim.id) throw new IllegalArgumentException('Cannot sign a claim that has an empty .id field.')
    if ((await getClaimId(claim)) !== claim.id)
      throw new IllegalArgumentException('Cannot sign a claim whose id has been altered or generated incorrectly.')
  }

  const signClaimValidateSigningOptions = async (signingOptions: any) => {
    if (signingOptions.creator === undefined || signingOptions.creator === null || signingOptions.creator === '')
      throw new IllegalArgumentException('Cannot sign a claim with an invalid creator in the signing options.')
  }

  const signClaimValidateArgs = async (signingOptions: any, claim: Claim) => {
    await signClaimValidateClaimId(claim)
    await signClaimValidateSigningOptions(signingOptions)
  }

  const signingOptions = (privateKey: string) => ({
    privateKeyBase58: privateKey,
    algorithm: 'Ed25519Signature2018',
    creator: `data:,${getBase58ED25519PublicKeyFromPrivateKey(privateKey)}`,
    nonce: cuid(),
  })

  const getIssuerId = (privateKey: string): string => signingOptions(privateKey).creator

  const signClaim = async (document: Claim, signingOptions: any = {}): Promise<Claim> => {
    await signClaimValidateArgs(signingOptions, document)

    const signedClaim = await jsig.sign(
      {
        '@context': document['@context'],
        id: document.id,
        type: document.type,
        issuer: document.issuer,
        issuanceDate: document.issuanceDate,
        claim: document.claim,
      },
      signingOptions
    )
    if (isValidSignature(signedClaim)) return signedClaim
    throw new IllegalArgumentException('Claim signature is invalid')
  }

  return {
    createClaim: async (
      issuerPrivateKey: string,
      type: ClaimType,
      claimAttributes: object,
      context: ClaimContext = {}
    ): Promise<Claim> => {
      const claim: Claim = {
        '@context': { ...DefaultClaimContext, ...claimTypeDefaults[type], ...context },
        type,
        issuer: getIssuerId(issuerPrivateKey),
        issuanceDate: new Date().toISOString(),
        claim: { ...claimAttributes },
      }
      const id = await getClaimId(claim)
      return await signClaim(
        {
          ...claim,
          id,
        },
        signingOptions(issuerPrivateKey)
      )
    },
    getClaimId,
    getIssuerId,
    isValidSignature,
    signClaim,
  }
}
