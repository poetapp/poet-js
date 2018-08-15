/* tslint:disable:no-relative-imports */
import * as bitcore from 'bitcore-lib'
import * as crypto from 'crypto'
import { canonize, expand } from 'jsonld'
import { IllegalArgumentException } from './Exceptions'
import { Claim, ClaimAttributes, ClaimType, isClaim } from './Interfaces'

const claimContex = {
  attributes: 'http://schema.org/CreativeWork',
  author: 'http://schema.org/author',
  text: 'http://schema.org/text',
  created: 'http://purl.org/dcterms/created',
  dateCreated: 'http://schema.org/dateCreated',
  datePublished: 'http://schema.org/datePublished',
  name: 'http://schema.org/name',
  tags: 'http://schema.org/keyword',
  type: 'http://schema.org/additionalType',
  publicKey: 'http://schema.org/Text',
}

export const expandClaim = async (claim: Claim): Promise<any> => {
  const contextualClaim = { '@context': claimContex, ...claim }
  return expand(contextualClaim)
}

export const canonizeClaim = async (claim: Claim): Promise<string> => {
  return canonize(await expandClaim(claim))
}

export const getClaimId = async (claim: Claim): Promise<string> => {
  try {
    const canonizedClaim = await canonizeClaim(claim)
    const buffer = Buffer.from(canonizedClaim)
    return crypto
      .createHash('sha256')
      .update(buffer)
      .digest()
      .toString('hex')
  } catch (e) {
    throw e
  }
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
  try {
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
  } catch (e) {
    throw e
  }
}

export const isValidClaim = async (claim: {}): Promise<boolean> =>
  !!isClaim(claim) && isValidSignature(claim) && (await getClaimId(claim)) === claim.id
