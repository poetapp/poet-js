/* tslint:disable:no-relative-imports */
import { describe } from 'riteway'
import { createClaim, isValidSignature, getClaimId, getClaimSignature, isValidClaim } from './Claim'
import { Claim, ClaimType, ClaimAttributes, Work } from './Interfaces'

const makeClaim = (attributes: ClaimAttributes) => {
  const dateCreated = new Date('2017-12-11T22:54:40.261Z')
  const publicKey = '02db393ae2d566ceddd95a97fd88bc2897a0818528158261cec45087a58786f09d'
  const type = ClaimType.Work
  return {
    publicKey,
    dateCreated,
    type,
    attributes,
  }
}

const TheRaven: Work = {
  id: '1bb5e7959c7cb28936ec93eb6893094241a5bc396f08845b4f52c86034f0ddf8',
  publicKey: '02badf4650ba545608242c2d303d587cf4f778ae3cf2b3ef99fbda37555a400fd2',
  signature:
    '3045022100e020a7ffeffa5d40ffde618c6c861678e38de69fd377028ec57ad93893883b3702201f085284a9064bab7e1cd39349e65d136d8f67e4b6b897c3e7db6b400ed91034',
  type: ClaimType.Work,
  dateCreated: new Date('2017-11-13T15:00:00.000Z'),
  attributes: {
    name: 'The Raven',
    author: 'Edgar Allan Poe',
    tags: 'poem',
    dateCreated: '',
    datePublished: '1845-01-29T03:00:00.000Z',
    content: 'Once upon a midnight dreary...',
  },
}

const Key = {
  privateKey: 'L1mptZyB6aWkiJU7dvAK4UUjLSaqzcRNYJn3KuAA7oEVyiNn3ZPF',
  publicKey: '02cab54b227f16dd4866310799842cdd239f2adb56d0a3789519c6f43a892a61f6',
}

const PrivateKeyEAP = 'KxuZJmgVAipi9hfYXHTyGYmmhkbG7fBzmkyVnj6t9j9rDR1nN1vN'

describe('Claim', async (should: any) => {
  const { assert } = should('')

  {
    const claim = createClaim(Key.privateKey, ClaimType.Work, TheRaven.attributes)

    assert({
      given: 'the public key of a Claim',
      should: 'be equal to public key of key',
      actual: claim.publicKey,
      expected: Key.publicKey,
    })
  }

  {
    const claim = createClaim(Key.privateKey, ClaimType.Work, TheRaven.attributes)

    assert({
      given: 'the result of isValidSignature of Claim with a valid signature',
      should: 'should return true',
      actual: isValidSignature(claim),
      expected: true,
    })
  }

  {
    const claimId = getClaimId(TheRaven)

    assert({
      given: 'a claim id',
      should: 'be equal to the work id',
      actual: claimId,
      expected: TheRaven.id,
    })
  }

  {
    const claimId = getClaimId({ ...TheRaven, id: '123' })

    assert({
      given: 'a claim with extra id, the new id',
      should: 'be ignored in the calculation of the id and should be equal to the work id',
      actual: claimId,
      expected: TheRaven.id,
    })
  }

  {
    const claimId = getClaimId({ ...TheRaven, signature: '123' })

    assert({
      given: 'a claim with extra signature, the new signature',
      should: 'be ignored in the calculation of the id and should be equal to the work id',
      actual: claimId,
      expected: TheRaven.id,
    })
  }

  {
    const claimId = getClaimId({ ...TheRaven, publicKey: '123' })

    assert({
      given: 'a claim with extra publicKey, the new publicKey',
      should: 'be included in the calculation of the id and should be not equal to the work id',
      actual: claimId !== TheRaven.id,
      expected: true,
    })
  }

  {
    const claimId = getClaimId({ ...TheRaven, type: 'Asd' as ClaimType })

    assert({
      given: 'a claim with extra type, the new type',
      should: 'be included in the calculation of the id and should be not equal to the work id',
      actual: claimId !== TheRaven.id,
      expected: true,
    })
  }

  {
    const claimId = getClaimId({ ...TheRaven, dateCreated: new Date() })

    assert({
      given: 'a claim with extra dateCreated, the new dateCreated',
      should: 'be included in the calculation of the id and should be not equal to the work id',
      actual: claimId !== TheRaven.id,
      expected: true,
    })
  }

  {
    const work1: Claim = makeClaim({
      name: TheRaven.attributes.name,
      author: TheRaven.attributes.author,
    })

    const work2: Claim = makeClaim({
      author: TheRaven.attributes.author,
      name: TheRaven.attributes.name,
    })

    const claimId1 = getClaimId(work1)
    const claimId2 = getClaimId(work2)

    assert({
      given: 'two claims with disordered keys',
      should: 'have the same claims id',
      actual: claimId1 === claimId2,
      expected: true,
    })
  }

  {
    const work1: Claim = makeClaim({
      name: TheRaven.attributes.name,
      author: TheRaven.attributes.author,
    })

    const work2: Claim = makeClaim({
      Author: TheRaven.attributes.author,
      NAME: TheRaven.attributes.name,
    })

    const claimId1 = getClaimId(work1)
    const claimId2 = getClaimId(work2)

    assert({
      given: 'two claims with keys casing',
      should: 'have the same claims id',
      actual: claimId1 === claimId2,
      expected: true,
    })
  }

  {
    const signature = getClaimSignature(TheRaven, PrivateKeyEAP)

    assert({
      given: 'a signature of a Claim',
      should: 'be the signature equal to of work signature',
      actual: signature,
      expected: TheRaven.signature,
    })
  }

  {
    const expected = 'Cannot sign a claim that has an empty .id field.'

    try {
      getClaimSignature({ ...TheRaven, id: '' }, PrivateKeyEAP)
    } catch (e) {
      assert({
        given: 'a claim without id',
        should: `throw an error with the message ${expected}`,
        actual: e.message,
        expected,
      })
    }
  }

  {
    const expected = 'Cannot sign a claim whose id has been altered or generated incorrectly.'

    try {
      getClaimSignature(
        { ...TheRaven, id: 'be81cc75bcf6ca0f1fdd356f460e6ec920ba36ec78bd9e70c4d04a19f8943102' },
        PrivateKeyEAP
      )
    } catch (e) {
      assert({
        given: 'a claim without id',
        should: `throw an error with the message ${expected}`,
        actual: e.message,
        expected,
      })
    }
  }

  {
    const expected = 'Cannot sign a claim that has an empty .publicKey field.'

    try {
      getClaimSignature({ ...TheRaven, publicKey: undefined }, PrivateKeyEAP)
    } catch (e) {
      assert({
        given: 'a claim with publicKey undefined',
        should: `throw an error with the message ${expected}`,
        actual: e.message,
        expected,
      })
    }
  }

  {
    const expected = `Cannot sign this claim with the provided privateKey. It doesn\t match the claim's public key.`

    try {
      getClaimSignature(
        { ...TheRaven, publicKey: '03f0dc475e93105bdc7701b40003200039202ffd4a0789696c78f9b34d5518aef9' },
        PrivateKeyEAP
      )
    } catch (e) {
      assert({
        given: 'a claim with a different publicKey',
        should: `throw an error with the message ${expected}`,
        actual: e.message,
        expected,
      })
    }
  }

  {
    assert({
      given: 'a valid claim, isValidClaim',
      should: `return true`,
      actual: isValidClaim(TheRaven),
      expected: true,
    })
  }

  {
    assert({
      given: 'an object that is not a claim',
      should: `return false`,
      actual: isValidClaim({ foo: 'bar' }),
      expected: false,
    })
  }

  {
    assert({
      given: 'a claim with an invalid id',
      should: `return false`,
      actual: isValidClaim({ ...TheRaven, id: '111' }),
      expected: false,
    })
  }

  {
    assert({
      given: 'a claim with an invalid publicKey',
      should: `return false`,
      actual: isValidClaim({ ...TheRaven, publicKey: '111' }),
      expected: false,
    })
  }

  {
    assert({
      given: 'a claim with an invalid signature',
      should: `return false`,
      actual: isValidClaim({ ...TheRaven, signature: '111' }),
      expected: false,
    })
  }

  ;['', false, null, undefined].forEach(value => {
    {
      assert({
        given: 'a claim with an invalid date',
        should: `return false`,
        actual: isValidClaim({ ...TheRaven, dateCreated: value }),
        expected: false,
      })
    }
  })
})
