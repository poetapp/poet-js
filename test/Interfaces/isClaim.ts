/* tslint:disable:no-relative-imports */
import { Expect, Test, TestCase } from 'alsatian'

import { Claim, isClaim } from 'Interfaces'
import { TheRaven } from '../Claims'

export class IsClaim {
  @Test('isClaim() : Given a valid claim : should return true')
  @TestCase(TheRaven)
  public correctClaim(claim: Claim) {
    Expect(isClaim(claim)).toBe(true)
  }

  @Test('isClaim() : Given a claim with an invalid date : should return false')
  @TestCase({ ...TheRaven, dateCreated: '' })
  @TestCase({ ...TheRaven, dateCreated: false })
  @TestCase({ ...TheRaven, dateCreated: null })
  @TestCase({ ...TheRaven, dateCreated: undefined })
  public invalidDate(claim: Claim) {
    Expect(isClaim(claim)).toBe(false)
  }
}
