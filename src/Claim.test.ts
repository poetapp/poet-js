/* tslint:disable:no-relative-imports */
import { describe } from 'riteway'
import {
  createClaim,
  isValidSignature,
  getClaimId,
  getClaimSignature,
  isValidClaim,
  expandAndCanonizeClaim,
} from './Claim'
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
  id: '58198ffd43c435bcdbb811c79f03839425174b3bdb11d02f105f238152f4616b',
  publicKey: '02badf4650ba545608242c2d303d587cf4f778ae3cf2b3ef99fbda37555a400fd2',
  signature:
    '3045022100ed4d29e235e418c47ababb554156d11fbd09781e309805d6f4f876e8a4c5c3c702200b52e7ed96b540f5c64d5746db3ba4b34b5448404876f98d834623b25220d242',
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

const expectedCanonicalDoc =
  '_:c14n0 <http://schema.org/CreativeWork> _:c14n1 .\n' +
  '_:c14n0 <http://schema.org/Text> "02db393ae2d566ceddd95a97fd88bc2897a0818528158261cec45087a58786f09d" .\n' +
  '_:c14n0 <http://schema.org/additionalType> "Work" .\n' +
  '_:c14n0 <http://schema.org/dateCreated> "Mon Dec 11 2017 14:54:40 GMT-0800 (PST)" .\n'

const Key = {
  privateKey: 'L1mptZyB6aWkiJU7dvAK4UUjLSaqzcRNYJn3KuAA7oEVyiNn3ZPF',
  publicKey: '02cab54b227f16dd4866310799842cdd239f2adb56d0a3789519c6f43a892a61f6',
}

const PrivateKeyEAP = 'KxuZJmgVAipi9hfYXHTyGYmmhkbG7fBzmkyVnj6t9j9rDR1nN1vN'

describe('Claim', async (should: any) => {
  const { assert } = should('')
  const returnError = (err: Error) => err

  {
    const claim = makeClaim({
      name: TheRaven.attributes.name,
      author: TheRaven.attributes.author,
    })

    const canonicalDoc = await expandAndCanonizeClaim(claim).catch(returnError)

    assert({
      given: 'a claim',
      should: 'create a canonical string document',
      actual: canonicalDoc,
      expected: expectedCanonicalDoc,
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

    const canonicalDocument1 = await expandAndCanonizeClaim(work1).catch(returnError)
    const canonicalDocument2 = await expandAndCanonizeClaim(work2).catch(returnError)

    assert({
      given: 'two claims with disordered keys',
      should: 'have the same canonical document',
      actual: canonicalDocument1 === canonicalDocument2,
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

    const canonicalDocument1 = await expandAndCanonizeClaim(work1).catch(returnError)
    const canonicalDocument2 = await expandAndCanonizeClaim(work2).catch(returnError)

    assert({
      given: 'two claims with keys casing',
      should: 'have the same canonical document',
      actual: canonicalDocument1 === canonicalDocument2,
      expected: true,
    })
  }

  {
    const claim = makeClaim({
      name: TheRaven.attributes.name,
      author: TheRaven.attributes.author,
    })

    const id = await getClaimId(claim)

    assert({
      given: 'A claim',
      should: 'generate an id for the claim',
      actual: id,
      expected: '31f4dd63047c5a053aead0dbb9dd24a08b2b97c153f7f80e03d839371f558b32',
    })
  }

  {
    const claim = await createClaim(Key.privateKey, ClaimType.Work, TheRaven.attributes)

    assert({
      given: 'the public key of a Claim',
      should: 'be equal to public key of key',
      actual: claim.publicKey,
      expected: Key.publicKey,
    })
  }

  {
    const claim = await createClaim(Key.privateKey, ClaimType.Work, TheRaven.attributes)
    const isValid = await isValidSignature(claim)

    assert({
      given: 'the result of isValidSignature of Claim with a valid signature',
      should: 'should return true',
      actual: isValid,
      expected: true,
    })
  }

  {
    const claimId = await getClaimId(TheRaven).catch(returnError)

    assert({
      given: 'a claim id',
      should: 'be equal to the work id',
      actual: claimId,
      expected: TheRaven.id,
    })
  }

  {
    const claimId = await getClaimId({ ...TheRaven, id: '123' }).catch(returnError)

    assert({
      given: 'a claim with extra id, the new id',
      should: 'be ignored in the calculation of the id and should be equal to the work id',
      actual: claimId,
      expected: TheRaven.id,
    })
  }

  {
    const claimId = await getClaimId({ ...TheRaven, signature: '123' }).catch(returnError)

    assert({
      given: 'a claim with extra signature, the new signature',
      should: 'be ignored in the calculation of the id and should be equal to the work id',
      actual: claimId,
      expected: TheRaven.id,
    })
  }

  {
    const claimId = await getClaimId({ ...TheRaven, publicKey: '123' }).catch(returnError)

    assert({
      given: 'a claim with extra publicKey, the new publicKey',
      should: 'be included in the calculation of the id and should be not equal to the work id',
      actual: claimId !== TheRaven.id,
      expected: true,
    })
  }

  {
    const claimId = await getClaimId({ ...TheRaven, type: 'Asd' as ClaimType }).catch(returnError)

    assert({
      given: 'a claim with extra type, the new type',
      should: 'be included in the calculation of the id and should be not equal to the work id',
      actual: claimId !== TheRaven.id,
      expected: true,
    })
  }

  {
    const claimId = await getClaimId({ ...TheRaven, dateCreated: new Date() }).catch(returnError)

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

    const claimId1 = await getClaimId(work1).catch(returnError)
    const claimId2 = await getClaimId(work2).catch(returnError)

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

    const claimId1 = await getClaimId(work1).catch(returnError)
    const claimId2 = await getClaimId(work2).catch(returnError)

    assert({
      given: 'two claims with keys casing',
      should: 'have the same claims id',
      actual: claimId1 === claimId2,
      expected: true,
    })
  }

  {
    const signature = await getClaimSignature(TheRaven, PrivateKeyEAP)

    assert({
      given: 'a signature of a Claim',
      should: 'be the signature equal to of work signature',
      actual: signature,
      expected: TheRaven.signature,
    })
  }

  {
    const expectedMessage = 'Cannot sign a claim that has an empty .id field.'

    assert({
      given: 'a claim without id',
      should: `throw an error with the message ${expectedMessage}`,
      actual: await getClaimSignature({ ...TheRaven, id: '' }, PrivateKeyEAP).catch(returnError),
      expected: new Error(expectedMessage),
    })
  }

  {
    const expectedMessage = 'Cannot sign a claim whose id has been altered or generated incorrectly.'

    assert({
      given: 'a claim without id',
      should: `throw an error with the message ${expectedMessage}`,
      actual: await getClaimSignature(
        { ...TheRaven, id: 'be81cc75bcf6ca0f1fdd356f460e6ec920ba36ec78bd9e70c4d04a19f8943102' },
        PrivateKeyEAP
      ).catch(returnError),
      expected: new Error(expectedMessage),
    })
  }

  {
    const expectedMessage = 'Cannot sign a claim that has an empty .publicKey field.'

    assert({
      given: 'a claim with publicKey undefined',
      should: `throw an error with the message ${expectedMessage}`,
      actual: await getClaimSignature({ ...TheRaven, publicKey: undefined }, PrivateKeyEAP).catch(returnError),
      expected: new Error(expectedMessage)
    })
  }

  {
    const expectedMessage = `Cannot sign this claim with the provided privateKey. It doesn\t match the claim's public key.`

    assert({
      given: 'a claim with a different publicKey',
      should: `throw an error with the message ${expectedMessage}`,
      actual: await getClaimSignature(
        { ...TheRaven, publicKey: '03f0dc475e93105bdc7701b40003200039202ffd4a0789696c78f9b34d5518aef9' },
        PrivateKeyEAP
      ).catch(returnError),
      expected: new Error(expectedMessage)
    })
  }

  {
    assert({
      given: 'a valid claim, isValidClaim',
      should: `return true`,
      actual: await isValidClaim(TheRaven),
      expected: true,
    })
  }

  {
    assert({
      given: 'an object that is not a claim',
      should: `return false`,
      actual: await isValidClaim({ foo: 'bar' }),
      expected: false,
    })
  }

  {
    assert({
      given: 'a claim with an invalid id',
      should: `return false`,
      actual: await isValidClaim({ ...TheRaven, id: '111' }),
      expected: false,
    })
  }

  {
    assert({
      given: 'a claim with an invalid publicKey',
      should: `return false`,
      actual: await isValidClaim({ ...TheRaven, publicKey: '111' }),
      expected: false,
    })
  }

  {
    assert({
      given: 'a claim with an invalid signature',
      should: `return false`,
      actual: await isValidClaim({ ...TheRaven, signature: '111' }),
      expected: false,
    })
  }

  {
    const result = await Promise.all(
      ['', false, null, undefined].map(value => isValidClaim({ ...TheRaven, dateCreated: value }))
    )

    assert({
      given: 'a claim with an invalid input',
      should: `return false`,
      actual: result,
      expected: [false, false, false, false],
    })
  }
})
