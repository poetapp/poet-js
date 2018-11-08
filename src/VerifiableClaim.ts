/* tslint:disable:no-relative-imports */
import * as crypto from 'crypto'
import * as JSONLD from 'jsonld'

import {
  BaseVerifiableClaim,
  ClaimType,
  claimTypeDefaults,
  CreateVerifiableClaimConfig,
  DefaultClaimContext,
  VerifiableClaim,
  StringToRecursiveObject,
} from './Interfaces'

const canonizeClaim = async (document: BaseVerifiableClaim): Promise<string> => {
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
  return JSONLD.canonize(contextualClaim)
}

export const generateClaimId = async (claim: BaseVerifiableClaim): Promise<string> => {
  const canonizedClaim = await canonizeClaim(claim)
  const buffer = Buffer.from(canonizedClaim)
  return crypto
    .createHash('sha256')
    .update(buffer)
    .digest()
    .toString('hex')
}

export const configureCreateVerifiableClaim = ({
  issuer,
  type = ClaimType.Work,
  context = {},
}: CreateVerifiableClaimConfig) => async (claim: StringToRecursiveObject): Promise<VerifiableClaim> => {
  const verifiableClaim = {
    '@context': { ...DefaultClaimContext, ...claimTypeDefaults[type], ...context },
    type,
    issuer,
    issuanceDate: new Date().toISOString(),
    claim,
  }
  const id = await generateClaimId(verifiableClaim)
  return { ...verifiableClaim, id }
}
