/* tslint:disable:no-relative-imports */
import { describe } from 'riteway'
import {
  createClaim,
  isValidSignature,
  getClaimId,
  getClaimSignature,
  isValidClaim,
  expandClaim,
  canonizeClaim,
} from './Claim'
import { Claim, ClaimType, ClaimAttributes, Work } from './Interfaces'

const makeClaim = (attributes: ClaimAttributes) => {
  const created = new Date('2017-12-11T22:54:40.261Z')
  const publicKey = '02db393ae2d566ceddd95a97fd88bc2897a0818528158261cec45087a58786f09d'
  const type = ClaimType.Work
  return {
    publicKey,
    created,
    type,
    attributes,
  }
}

const convertDateToUTC = (date: Date): Date =>
  new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  )

const TheRaven: Work = {
  id: 'c76146528c62dac83429217b6a7e159542b7a2d0c06432d6b7c9ba9cb3ebd39a',
  publicKey: '02badf4650ba545608242c2d303d587cf4f778ae3cf2b3ef99fbda37555a400fd2',
  signature:
    '3045022100fb95297b8ad91073dc94acc3a6dc72b8740bd67887fd18be1e08a2b347ebd6f202204d4e931537b5a5d7394972046506678a68426e20478e3dd2972f51cc73d20062',
  type: ClaimType.Work,
  created: convertDateToUTC(new Date('2017-11-13T15:00:00.000Z')),
  attributes: {
    name: 'The Raven',
    author: 'Edgar Allan Poe',
    tags: 'poem',
    dateCreated: '',
    datePublished: '1845-01-29T03:00:00.000Z',
    text: 'Once upon a midnight dreary...',
  },
}

const expandedRaven = JSON.stringify([
  {
    'http://schema.org/CreativeWork': [
      {
        'http://schema.org/author': [
          {
            '@value': 'Edgar Allan Poe',
          },
        ],
        'http://schema.org/dateCreated': [
          {
            '@value': '',
          },
        ],
        'http://schema.org/datePublished': [
          {
            '@value': '1845-01-29T03:00:00.000Z',
          },
        ],
        'http://schema.org/name': [
          {
            '@value': 'The Raven',
          },
        ],
        'http://schema.org/keyword': [
          {
            '@value': 'poem',
          },
        ],
        'http://schema.org/text': [
          {
            '@value': 'Once upon a midnight dreary...',
          },
        ],
      },
    ],
    'http://purl.org/dcterms/created': [
      {
        '@value': 'Mon Nov 13 2017 15:00:00 GMT+0000 (UTC)',
      },
    ],
    'http://schema.org/Text': [
      {
        '@value': '02badf4650ba545608242c2d303d587cf4f778ae3cf2b3ef99fbda37555a400fd2',
      },
    ],
    'http://schema.org/additionalType': [
      {
        '@value': 'Work',
      },
    ],
  },
])

const canonicalRaven =
  '_:c14n0 <http://purl.org/dcterms/created> "Mon Nov 13 2017 15:00:00 GMT+0000 (UTC)" .\n' +
  '_:c14n0 <http://schema.org/CreativeWork> _:c14n1 .\n' +
  '_:c14n0 <http://schema.org/Text> "02badf4650ba545608242c2d303d587cf4f778ae3cf2b3ef99fbda37555a400fd2" .\n' +
  '_:c14n0 <http://schema.org/additionalType> "Work" .\n' +
  '_:c14n1 <http://schema.org/author> "Edgar Allan Poe" .\n' +
  '_:c14n1 <http://schema.org/dateCreated> "" .\n' +
  '_:c14n1 <http://schema.org/datePublished> "1845-01-29T03:00:00.000Z" .\n' +
  '_:c14n1 <http://schema.org/keyword> "poem" .\n' +
  '_:c14n1 <http://schema.org/name> "The Raven" .\n' +
  '_:c14n1 <http://schema.org/text> "Once upon a midnight dreary..." .\n'

const expectedCanonicalDoc =
  '_:c14n0 <http://schema.org/author> "Edgar Allan Poe" .\n' +
  '_:c14n0 <http://schema.org/name> "The Raven" .\n' +
  '_:c14n1 <http://purl.org/dcterms/created> "Mon Dec 11 2017 22:54:40 GMT+0000 (UTC)" .\n' +
  '_:c14n1 <http://schema.org/CreativeWork> _:c14n0 .\n' +
  '_:c14n1 <http://schema.org/Text> "02db393ae2d566ceddd95a97fd88bc2897a0818528158261cec45087a58786f09d" .\n' +
  '_:c14n1 <http://schema.org/additionalType> "Work" .\n'

const Key = {
  privateKey: 'L1mptZyB6aWkiJU7dvAK4UUjLSaqzcRNYJn3KuAA7oEVyiNn3ZPF',
  publicKey: '02cab54b227f16dd4866310799842cdd239f2adb56d0a3789519c6f43a892a61f6',
}

const PrivateKeyEAP = 'KxuZJmgVAipi9hfYXHTyGYmmhkbG7fBzmkyVnj6t9j9rDR1nN1vN'

describe('Claim', async (should: any) => {
  const { assert } = should('')
  const returnError = (err: Error): Error => err

  {
    const expandedClaim = await expandClaim(TheRaven)
    assert({
      given: 'a complete claim, expandClaim:',
      should: 'return a valid expanded document',
      actual: JSON.stringify(expandedClaim),
      expected: expandedRaven,
    })
  }

  {
    assert({
      given: 'a complete claim',
      should: 'include all items in canonical doc',
      actual: await canonizeClaim(TheRaven),
      expected: canonicalRaven,
    })
  }

  {
    const claim = makeClaim({
      name: TheRaven.attributes.name,
      author: TheRaven.attributes.author,
    })

    assert({
      given: 'a claim',
      should: 'create a canonical string document',
      actual: await canonizeClaim(claim).catch(returnError),
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

    const canonicalDocument1 = await canonizeClaim(work1).catch(returnError)
    const canonicalDocument2 = await canonizeClaim(work2).catch(returnError)

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

    const canonicalDocument1 = await canonizeClaim(work1).catch(returnError)
    const canonicalDocument2 = await canonizeClaim(work2).catch(returnError)

    assert({
      given: 'two claims with keys casing',
      should: 'NOT have the same canonical document',
      actual: canonicalDocument1 !== canonicalDocument2,
      expected: true,
    })
  }

  {
    const claim = makeClaim({
      name: TheRaven.attributes.name,
      author: TheRaven.attributes.author,
    })

    assert({
      given: 'A claim',
      should: 'generate an id for the claim',
      actual: await getClaimId(claim),
      expected: 'ffac51b3dea6c99587f0d4af0985b693e1afe681d834b5898425dafbb11baed4',
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

    assert({
      given: 'the result of isValidSignature of Claim with a valid signature',
      should: 'should return true',
      actual: isValidSignature(claim),
      expected: true,
    })
  }

  {
    assert({
      given: 'a claim id',
      should: 'be equal to the work id',
      actual: await getClaimId(TheRaven).catch(returnError),
      expected: TheRaven.id,
    })
  }

  {
    assert({
      given: 'a claim with extra id, the new id',
      should: 'be ignored in the calculation of the id and should be equal to the work id',
      actual: await getClaimId({ ...TheRaven, id: '123' }).catch(returnError),
      expected: TheRaven.id,
    })
  }

  {
    assert({
      given: 'a claim with extra signature, the new signature',
      should: 'be ignored in the calculation of the id and should be equal to the work id',
      actual: await getClaimId({ ...TheRaven, signature: '123' }).catch(returnError),
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
    const claimId = await getClaimId({ ...TheRaven, created: new Date() }).catch(returnError)

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
      should: 'NOT have the same claims id',
      actual: claimId1 !== claimId2,
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
      expected: new Error(expectedMessage),
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
      expected: new Error(expectedMessage),
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
      ['', false, null, undefined].map(value => isValidClaim({ ...TheRaven, created: value }))
    )

    assert({
      given: 'a claim with an invalid input',
      should: `return false`,
      actual: result,
      expected: [false, false, false, false],
    })
  }
})
