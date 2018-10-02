/* tslint:disable:no-relative-imports */
import * as cuid from 'cuid'

import { IllegalArgumentException } from '../Exceptions'
import { Claim } from '../Interfaces'
import { getBase58ED25519PublicKeyFromPrivateKey } from '../util/KeyHelper'
import { getJsonLD } from './JsonLdHelper'

export interface ClaimSigner {
  readonly getIssuerId: () => string
  readonly signClaim: (document: Claim) => Promise<Claim>
}

export const getClaimSigner = (privateKey: string) => {
  const { jsig, getClaimId, isValidSignature } = getJsonLD()

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

  const signingOptions = {
    privateKeyBase58: privateKey,
    algorithm: 'Ed25519Signature2018',
    creator: `data:,${getBase58ED25519PublicKeyFromPrivateKey(privateKey)}`,
    nonce: cuid(),
  }

  return {
    getIssuerId: (): string => signingOptions.creator,
    signClaim: async (document: Claim): Promise<Claim> => {
      await signClaimValidateArgs(signingOptions, document)

      const signedClaim = await jsig.sign(
        {
          '@context': document['@context'],
          type: document.type,
          issuer: document.issuer,
          issuanceDate: document.issuanceDate,
          claim: document.claim,
        },
        signingOptions
      )
      if (isValidSignature(signedClaim)) return signedClaim
      else throw new IllegalArgumentException('Claim signature is invalid')
    },
  }
}
