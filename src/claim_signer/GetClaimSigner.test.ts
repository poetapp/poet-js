/* tslint:disable:no-relative-imports */
import { describe } from 'riteway'

import {
  externalContext,
  getErrorMessage,
  makeClaim,
  validClaimSigner,
  testPrivateKeyEd25519Base58,
  TheRaven,
  TheRavenBook,
} from '../../tests/unit/shared'
import { isValidClaim } from '../Claim'
import { Claim, ClaimType, DefaultClaimContext, DefaultWorkClaimContext, Identity } from '../Interfaces'

const { createClaim, getClaimId, getIssuerId, isValidSignature } = validClaimSigner

const publicKey = 'JAi9YoyDdgBQLenyVzoXWH4C26wKMzHrjertxVrjLWTe'
const testBadPublicKey: string = 'JAi9YoyDdgBQLenyVzoXWH4C26wKMzHrjertxVrjLWT5'

const testOwnerUrl = `data:,${publicKey}`

const ravenClaim: any = { ...TheRaven.claim }

const ravenBookClaim: any = { ...TheRavenBook.claim }

const Me: Identity = {
  id: '2b28274e3e88304f7baacec37c9959f8b237955c4e242f882150090b033966f4',
  type: ClaimType.Identity,
  issuer: testOwnerUrl,
  issuanceDate: '2017-11-13T15:00:00.000Z',
  claim: {
    publicKey,
  },
  'sec:proof': {
    '@graph': {
      '@type': 'https://w3id.org/security#Ed25519Signature2018',
      'dc:created': {
        '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
        '@value': '2018-09-05T20:19:20Z',
      },
      'dc:creator': {
        '@id': `${testOwnerUrl}`,
      },
      'https://w3id.org/security#jws':
        'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..TSHkMOwbWZvIp8Hd-MyebaMgItf4Iyl3dgUSlHBBlnidw' +
        'gzo084pGpKmbOewYFrXfmAVhXnC4UPzaPUjaU9BDw',
    },
  },
}

describe('getClaimId', async (should: any) => {
  const { assert } = should('')

  {
    assert({
      given: 'a claim id',
      should: 'be equal to the work id',
      actual: await getClaimId(TheRaven).catch(getErrorMessage),
      expected: TheRaven.id,
    })
  }

  {
    assert({
      given: 'a claim with extra id, the new id',
      should: 'be ignored in the calculation of the id and should be equal to the work id',
      actual: await getClaimId({ ...TheRaven, id: '123' }),
      expected: TheRaven.id,
    })
  }

  {
    const id = await getClaimId({ ...TheRaven, issuanceDate: '2017-09-13T15:00:00.000Z' }).catch(getErrorMessage)

    assert({
      given: 'a claim with extra dateCreated, the new dateCreated',
      should: 'be included in the calculation of the id and should be not equal to the work id',
      actual: id !== TheRaven.id,
      expected: true,
    })
  }

  {
    const work1: Claim = makeClaim({
      name: ravenClaim.name,
      author: ravenClaim.author,
    })

    const work2: Claim = makeClaim({
      author: ravenClaim.author,
      name: ravenClaim.name,
    })

    const id1 = await getClaimId(work1).catch(getErrorMessage)
    const id2 = await getClaimId(work2).catch(getErrorMessage)

    assert({
      given: 'two claims with disordered keys',
      should: 'have the same claims id',
      actual: id1 === id2,
      expected: true,
    })
  }

  {
    const work1: Claim = makeClaim({
      name: ravenClaim.name,
      author: ravenClaim.author,
    })

    const work2: Claim = makeClaim({
      author: ravenClaim.author,
      nAME: ravenClaim.name,
      dateCreated: ravenClaim.dateCreated,
      datePublished: ravenClaim.datePublished,
    })

    const id1 = await getClaimId(work1).catch(getErrorMessage)
    const id2 = await getClaimId(work2).catch(getErrorMessage)

    assert({
      given: 'two claims with keys casing',
      should: 'NOT have the same claims id',
      actual: id1 !== id2,
      expected: true,
    })
  }

  {
    const workClaim = makeClaim({
      name: ravenClaim.name,
      author: ravenClaim.author,
    })

    const TheRavenId = '3129d8056c04a00d3a84beaf38eed8aa25e2b7296ac08f8881a67c5cfcb1525e'

    assert({
      given: 'A work claim',
      should: 'generate an id for the claim',
      actual: await getClaimId(workClaim),
      expected: TheRavenId,
    })

    const identityClaim = makeClaim({ ...Me.claim })

    assert({
      given: 'an identity claim',
      should: 'generate an identityClaim for the claim',
      actual: await getClaimId(identityClaim),
      expected: 'bcc2843e20994e8c686c99fb92cd2feb0f3ab8c69e79e09e41f83635a6cd7fb9',
    })

    const workClaim2 = makeClaim({
      name: ravenBookClaim.name,
      author: ravenBookClaim.author,
      isbn: ravenBookClaim.isbn,
      edition: ravenBookClaim.edition,
    })

    assert({
      given: 'an extended work claim WITHOUT proper context',
      should: 'generate the id without the extra attributes',
      actual: await getClaimId(workClaim2),
      expected: TheRavenId,
    })

    assert({
      given: 'an extended work claim WITH proper context',
      should: 'generate a different id',
      actual: (await getClaimId({ ...workClaim2, '@context': externalContext })) !== TheRavenId,
      expected: true,
    })
  }
})

describe('createClaim', async (should: any) => {
  const { assert } = should('')

  {
    const workClaim: any = await createClaim(testPrivateKeyEd25519Base58, ClaimType.Work, TheRaven.claim)

    assert({
      given: 'the public key of a Claim',
      should: 'be equal to public key of key',
      actual: workClaim['sec:proof']['@graph']['dc:creator']['@id'],
      expected: getIssuerId(testPrivateKeyEd25519Base58),
    })

    assert({
      given: 'a newly created Claim',
      should: 'have a valid Signature',
      actual: await isValidSignature(workClaim),
      expected: true,
    })

    assert({
      given: 'a newly created Claim',
      should: 'be a valid Claim',
      actual: await isValidClaim(workClaim),
      expected: true,
    })
  }

  {
    const claim = await createClaim(testPrivateKeyEd25519Base58, ClaimType.Work, TheRavenBook.claim, externalContext)
    assert({
      given: 'a claim with an external context',
      should: 'include all fields in the claim',
      actual:
        JSON.stringify(Object.keys(claim.claim).sort()) === JSON.stringify(Object.keys(TheRavenBook.claim).sort()),
      expected: true,
    })
  }

  {
    const claim = await createClaim(testPrivateKeyEd25519Base58, ClaimType.Work, TheRavenBook.claim).catch(
      getErrorMessage
    )

    assert({
      given: 'an extended claim without an external context',
      should: 'will return an Error()',
      actual: claim,
      expected: 'The property "edition" in the input was not defined in the context.',
    })
  }
})

describe('isValidSignature', async (should: any) => {
  const { assert } = should('')

  {
    const claim = await createClaim(testPrivateKeyEd25519Base58, ClaimType.Work, TheRaven.claim)

    assert({
      given: 'a claim with a valid signature',
      should: 'return true',
      actual: await isValidSignature(claim),
      expected: true,
    })

    const claim2 = await createClaim(testPrivateKeyEd25519Base58, ClaimType.Work, TheRavenBook.claim, externalContext)
    assert({
      given: 'a claim with an external context',
      should: 'return true',
      actual: await isValidSignature(claim2),
      expected: true,
    })
  }

  {
    const badClaim = {
      '@context': { ...DefaultClaimContext, ...DefaultWorkClaimContext },
      ...TheRaven,
      'sec:proof': {
        '@graph': {
          '@type': 'sec:Ed25519Signature2018',
          'dc:created': {
            '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
            '@value': '2018-09-05T20:19:20Z',
          },
          'dc:creator': {
            '@id': `data:,${testBadPublicKey}`,
          },
          'sec:jws':
            'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..TSHkMOwbWZvIp8Hd-MyebaMgItf4Iyl3dgUSlHBBlnidw' +
            'gzo084pGpKmbOewYFrXfmAVhXnC4UPzaPUjaU9BDw',
        },
      },
    }

    assert({
      given: 'a claim with an invalid public key',
      should: 'return false',
      actual: await isValidSignature(badClaim),
      expected: false,
    })
  }
})
