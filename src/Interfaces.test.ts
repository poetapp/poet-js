/* tslint:disable:no-relative-imports */
import { describe } from 'riteway'
import { MyIdentity, Ed25519TheRaven, Ed25519SignedRaven, RsaTheRaven, RsaSignedRaven } from '../tests/unit/shared'
import { ClaimType, isIdentity, isSignedVerifiableClaim, isVerifiableClaim, isWork } from './Interfaces'

const InvalidClaim = {
  id: '1bb5e7959c7cb28936ec93eb6893094241a5bc396f08845b4f52c86034f0ddf8',
  signature:
    '3045022100e020a7ffeffa5d40ffde618c6c861678e38de69fd377028ec57ad93893883b3702201f085284a9064bab7e1cd39349e65d136d8f67e4b6b897c3e7db6b400ed91034',
  type: ClaimType.Identity,
  created: '2017-11-13T15:00:00.000Z',
  attributes: {
    publicKey: '02badf4650ba545608242c2d303d587cf4f778ae3cf2b3ef99fbda37555a400fd2',
  },
}

describe('Interfaces.isIdentity', async (should: any) => {
  const { assert } = should('')

  {
    assert({
      given: 'a valid Identity claim',
      should: 'return true',
      actual: isIdentity(MyIdentity),
      expected: true,
    })

    assert({
      given: 'a valid Work claim',
      should: 'return false',
      actual: isIdentity(Ed25519TheRaven),
      expected: false,
    })

    assert({
      given: 'a valid Work claim',
      should: 'return false',
      actual: isIdentity(RsaTheRaven),
      expected: false,
    })
  }
})

describe('Interfaces.isWork', async (should: any) => {
  const { assert } = should('')

  {
    assert({
      given: 'a valid Work claim',
      should: 'return true',
      actual: isWork(Ed25519TheRaven),
      expected: true,
    })

    assert({
      given: 'a valid Work Claim',
      should: 'return true',
      actual: isWork(RsaTheRaven),
      expected: true,
    })
  }

  {
    assert({
      given: 'a valid Identity Claim',
      should: 'return false',
      actual: isWork(MyIdentity),
      expected: false,
    })
  }
})

describe('Interfaces.isVerifiableClaim', async (should: any) => {
  const { assert } = should('')

  {
    assert({
      given: 'a valid Verifiable Work Claim',
      should: `return true`,
      actual: isVerifiableClaim(Ed25519TheRaven),
      expected: true,
    })

    assert({
      given: 'a valid Verifiable RSA Work Claim',
      should: 'return true',
      actual: isVerifiableClaim(RsaTheRaven),
      expected: true,
    })

    assert({
      given: 'a valid Verifiable Identity Claim',
      should: 'return true',
      actual: isVerifiableClaim(MyIdentity),
      expected: true,
    })

    assert({
      given: 'an invalid Verifiable Claim',
      should: 'return false',
      actual: isVerifiableClaim(InvalidClaim),
      expected: false,
    })
  }

  ;['', false, null, undefined].forEach(value => {
    {
      assert({
        given: 'a claim with an invalid date',
        should: `return false`,
        actual: isVerifiableClaim({ ...Ed25519TheRaven, issuanceDate: value }),
        expected: false,
      })
    }
  })
})

describe('Interfaces.isSignedVerifiableClaim', async (should: any) => {
  const { assert } = should('')

  assert({
    given: 'a Singed Verifiable Ed25519 Claim',
    should: 'return true',
    actual: isSignedVerifiableClaim(Ed25519SignedRaven),
    expected: true,
  })

  assert({
    given: 'a Signed Verifiable Rsa Claim',
    should: 'return true',
    actual: isSignedVerifiableClaim(RsaSignedRaven),
    expected: true,
  })

  assert({
    given: 'an unsigned VerifiableClaim',
    should: 'return false',
    actual: isSignedVerifiableClaim(Ed25519TheRaven),
    expected: false,
  })

  const badObject = {
    ...Ed25519SignedRaven,
    id: 'something too short',
  }

  assert({
    given: 'a signed Verifiable Claim in an invalid id',
    should: 'return false',
    actual: isSignedVerifiableClaim(badObject),
    expected: false,
  })
})
