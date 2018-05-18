/* tslint:disable:no-relative-imports */
import * as bitcore from 'bitcore-lib'
import * as crypto from 'crypto'

import { IllegalArgumentException } from './Exceptions'
import { Claim, ClaimAttributes, ClaimType, isClaim } from './Interfaces'

import { Serialization } from './Serialization'

export function getClaimId(claim: Claim): string {
  const buffer = Buffer.from(
    Serialization.claimToHex({
      ...claim,
      id: '',
      signature: '',
    }),
    'hex'
  )
  return crypto
    .createHash('sha256')
    .update(buffer)
    .digest()
    .toString('hex')
}

export function getClaimSignature(claim: Claim, privateKey: string): string {
  if (!claim.publicKey) throw new IllegalArgumentException('Cannot sign a claim that has an empty .publicKey field.')
  if (new bitcore.PrivateKey(privateKey).publicKey.toString() !== claim.publicKey)
    throw new IllegalArgumentException(
      "Cannot sign this claim with the provided privateKey. It doesn\t match the claim's public key."
    )
  if (!claim.id) throw new IllegalArgumentException('Cannot sign a claim that has an empty .id field.')
  if (claim.id !== getClaimId(claim))
    throw new IllegalArgumentException('Cannot sign a claim whose id has been altered or generated incorrectly.')

  const signature = bitcore.crypto.ECDSA.sign(Buffer.from(claim.id, 'hex'), new bitcore.PrivateKey(privateKey))
  return signature.toString()
}

export function isValidSignature(claim: Claim): boolean {
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

export function createClaim(privateKey: string, type: ClaimType, attributes: ClaimAttributes): Claim {
  const claim: Claim = {
    id: '',
    publicKey: new bitcore.PrivateKey(privateKey).publicKey.toString(),
    signature: '',
    type,
    dateCreated: new Date(),
    attributes,
  }
  const id = getClaimId(claim)
  const signature = getClaimSignature(
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

export function isValidClaim(claim = {}): boolean {
  if (!isClaim(claim)) return false
  if (!isValidSignature(claim)) return false
  return getClaimId(claim) === claim.id ? true : false
}
