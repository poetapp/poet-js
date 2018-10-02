/* tslint:disable:no-relative-imports */
import { describe } from 'riteway'

import { externalContext, getErrorMessage, validClaimSigner, TheRaven, TheRavenBook } from '../tests/unit/shared'
import { createClaim, isValidClaim } from './Claim'
import { Claim, ClaimType, isClaim } from './Interfaces'

const testBadPublicKey: string = 'JAi9YoyDdgBQLenyVzoXWH4C26wKMzHrjertxVrjLWT5'

describe('Claim.createClaim', async (should: any) => {
  const { assert } = should('')

  {
    const workClaim: any = await createClaim(ClaimType.Work, TheRaven.claim, validClaimSigner)

    assert({
      given: 'the public key of a Claim',
      should: 'be equal to public key of key',
      actual: workClaim['sec:proof']['@graph']['http://purl.org/dc/terms/creator']['@id'],
      expected: validClaimSigner.getIssuerId(),
    })
  }

  {
    const claim = await createClaim(ClaimType.Work, TheRavenBook.claim, validClaimSigner, externalContext)
    assert({
      given: 'a claim with an external context',
      should: 'include all fields in the claim',
      actual:
        JSON.stringify(Object.keys(claim.claim).sort()) === JSON.stringify(Object.keys(TheRavenBook.claim).sort()),
      expected: true,
    })
  }

  {
    const claim = await createClaim(ClaimType.Work, TheRavenBook.claim, validClaimSigner).catch(getErrorMessage)

    assert({
      given: 'an extended claim without an external context',
      should: 'will return an Error()',
      actual: claim,
      expected: 'The property "edition" in the input was not defined in the context.',
    })
  }
})

describe('Claim.isClaim', async (should: any) => {
  const { assert } = should('')

  {
    assert({
      given: 'a valid claim, isClaim',
      should: `return true`,
      actual: isClaim(TheRaven),
      expected: true,
    })
  }
})

describe('Claim.isValidClaim', async (should: any) => {
  const { assert } = should('')

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
    const badClaim = {
      ...TheRaven,
      'https://w3id.org/security#proof': {
        '@graph': {
          '@type': 'https://w3id.org/security#Ed25519Signature2018',
          created: {
            '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
            '@value': '2018-09-05T20:19:20Z',
          },
          'http://purl.org/dc/terms/creator': {
            '@id': `data:,${testBadPublicKey}`,
          },
          'https://w3id.org/security#jws':
            'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..TSHkMOwbWZvIp8Hd-MyebaMgItf4Iyl3dgUSlHBBlnidw' +
            'gzo084pGpKmbOewYFrXfmAVhXnC4UPzaPUjaU9BDw',
        },
      },
    }

    assert({
      given: 'a claim with an invalid publicKey',
      should: `return false`,
      actual: await isValidClaim(badClaim),
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
      ['', false, null, undefined].map(value => isValidClaim({ ...TheRaven, issuanceDate: value }))
    )

    assert({
      given: 'a claim with an invalid input',
      should: `return false`,
      actual: result,
      expected: [false, false, false, false],
    })
  }
})
