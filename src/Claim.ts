/* tslint:disable:no-relative-imports */
import { Claim, ClaimContext, ClaimType, claimTypeDefaults, DefaultClaimContext, isClaim } from './Interfaces'
import { ClaimSigner } from './claim_signer/GetClaimSigner'
import { getJsonLD } from './claim_signer/JsonLdHelper'

export const createClaim = async (
  type: ClaimType,
  claimAttributes: object,
  claimSigner: ClaimSigner,
  context: ClaimContext = {}
): Promise<Claim> => {
  const { getClaimId } = getJsonLD()
  const claim: Claim = {
    '@context': { ...DefaultClaimContext, ...claimTypeDefaults[type], ...context },
    type,
    issuer: claimSigner.getIssuerId(),
    issuanceDate: new Date().toISOString(),
    claim: { ...claimAttributes },
  }
  const id = await getClaimId(claim)
  return await claimSigner.signClaim({
    ...claim,
    id,
  })
}

export const isValidClaim = async (claim: {}): Promise<boolean> => {
  const { getClaimId, isValidSignature } = getJsonLD()

  return isClaim(claim) && (await isValidSignature(claim)) && (await getClaimId(claim)) === claim.id
}
