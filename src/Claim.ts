/* tslint:disable:no-relative-imports */
import * as bitcore from 'bitcore-lib'
import * as crypto from 'crypto'
import { canonize } from 'jsonld'

import { IllegalArgumentException } from './Exceptions'
import { Claim, ClaimAttributes, ClaimType, getClaimContext, isClaim } from './Interfaces'

export const canonizeClaim = async (claim: Claim): Promise<string> => {
  const contextualClaim = { ...claim, ...getClaimContext() }
  return canonize(contextualClaim)
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

export const getClaimSignature = async (claim: Claim, privateKey: string): Promise<string> => {
  if (!claim.publicKey) throw new IllegalArgumentException('Cannot sign a claim that has an empty .publicKey field.')
  if (new bitcore.PrivateKey(privateKey).publicKey.toString() !== claim.publicKey)
    throw new IllegalArgumentException(
      "Cannot sign this claim with the provided privateKey. It doesn\t match the claim's public key."
    )
  const generatedClaimId = await getClaimId(claim)
  if (!claim.id) throw new IllegalArgumentException('Cannot sign a claim that has an empty .id field.')
  if (claim.id !== generatedClaimId)
    throw new IllegalArgumentException('Cannot sign a claim whose id has been altered or generated incorrectly.')

  const signature = bitcore.crypto.ECDSA.sign(Buffer.from(claim.id, 'hex'), new bitcore.PrivateKey(privateKey))
  return signature.toString()
}

export const isValidSignature = (claim: Claim): boolean => {
  try {
    return bitcore.crypto.ECDSA.verify(
      Buffer.from(claim.id, 'hex'),
      bitcore.crypto.Signature.fromString(claim.signature),
      new bitcore.PublicKey(claim.publicKey)
    )
  } catch (exception) {
    return false
  }
}

export const createClaim = async (privateKey: string, type: ClaimType, attributes: ClaimAttributes): Promise<Claim> => {
  const claim: Claim = {
    id: '',
    publicKey: new bitcore.PrivateKey(privateKey).publicKey.toString(),
    signature: '',
    type,
    created: new Date(),
    attributes,
  }
  const id = await getClaimId(claim)
  const signature = await getClaimSignature(
    {
      ...claim,
      id,
    },
    privateKey
  )
  return {
    ...claim,
    id,
    signature,
  }
}

export const isValidClaim = async (claim: {}): Promise<boolean> =>
  !!isClaim(claim) && isValidSignature(claim) && (await getClaimId(claim)) === claim.id
