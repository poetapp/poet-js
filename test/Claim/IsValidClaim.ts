/* tslint:disable:no-relative-imports */
import { Expect, Test, TestCase } from 'alsatian'

import { isValidClaim } from 'Claim'
import { Claim } from 'Interfaces'
import { TheRaven } from '../Claims'

export class IsValidClaim {
  @Test('isValidClaim() : Given a valid claim : should return true')
  @TestCase(TheRaven)
  public correctClaim(claim: Claim) {
    Expect(isValidClaim(claim)).toBe(true)
  }

  @Test('isValidClaim() : Given an object that is not a claim : should return false')
  @TestCase()
  @TestCase({ foo: 'bar' })
  public notClaimObject(claim: any) {
    Expect(isValidClaim(claim)).toBe(false)
  }

  @Test('isValidClaim() : Given a claim with an invalid id : should return false')
  @TestCase({ ...TheRaven, id: '111' })
  public invalidId(claim: Claim) {
    Expect(isValidClaim(claim)).toBe(false)
  }

  @Test('isValidClaim() : Given a claim with an invalid publicKey : should return false')
  @TestCase({ ...TheRaven, publicKey: '111' })
  public invalidPublicKey(claim: Claim) {
    Expect(isValidClaim(claim)).toBe(false)
  }

  @Test('isValidClaim() : Given a claim with an invalid signature : should return false')
  @TestCase({ ...TheRaven, signature: '111' })
  public invalidSignature(claim: Claim) {
    Expect(isValidClaim(claim)).toBe(false)
  }

  @Test('isValidClaim() : Given a claim with an invalid signature : should return false')
  @TestCase({ ...TheRaven, dateCreated: '' })
  @TestCase({ ...TheRaven, dateCreated: false })
  @TestCase({ ...TheRaven, dateCreated: null })
  public invalidDate(claim: Claim) {
    Expect(isValidClaim(claim)).toBe(false)
  }
}
