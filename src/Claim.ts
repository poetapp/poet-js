/* tslint:disable:no-relative-imports */
import { isClaim } from './Interfaces'
import { getClaimSigner } from './claim_signer/GetClaimSigner'

export const isValidClaim = async (claim: {}): Promise<boolean> => {
  const { getClaimId, isValidSignature } = getClaimSigner()

  return isClaim(claim) && (await isValidSignature(claim)) && (await getClaimId(claim)) === claim.id
}
