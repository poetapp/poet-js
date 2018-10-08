/* tslint:disable:no-relative-imports */
import { describe } from 'riteway'

import {
  getErrorMessage,
  SignedRaven,
  testBadPublicKey,
  testPrivateKeyEd25519Base58,
  TheRaven,
  TheRavenBook,
  TheRavenBookWithFullContext,
  claimSigner,
} from '../tests/unit/shared'

import {
  DefaultClaimContext,
  DefaultWorkClaimContext,
  isSignedVerifiableClaim,
  SignedVerifiableClaim,
} from './Interfaces'
import { createIssuerFromPrivateKey } from './util/KeyHelper'

const issuer = createIssuerFromPrivateKey(testPrivateKeyEd25519Base58)

const { configureSignVerifiableClaim, isValidSignedVerifiableClaim, isValidSignature } = claimSigner

const signWorkClaim = configureSignVerifiableClaim({ privateKey: testPrivateKeyEd25519Base58 })

describe('GetClaimSigner.configureSignVerifiableClaim', async (should: any) => {
  const { assert } = should('')

  {
    const signedWorkClaim = await signWorkClaim(TheRaven)

    assert({
      given: 'the creator of the signature proof',
      should: 'be equal to the issuer of the VerifiableClaim',
      actual: signedWorkClaim['sec:proof']['@graph']['dc:creator']['@id'],
      expected: issuer,
    })

    assert({
      given: 'a newly created Signed Verifiable Claim',
      should: 'have a valid Signature',
      actual: await isValidSignature(signedWorkClaim),
      expected: true,
    })

    assert({
      given: 'a newly created Signed Verifiable Claim',
      should: 'be a valid Claim',
      actual: await isValidSignedVerifiableClaim(signedWorkClaim),
      expected: true,
    })
  }

  {
    const signedWorkClaim = await signWorkClaim(TheRavenBookWithFullContext)
    assert({
      given: 'a Signed Verifiable Claim with an external context',
      should: 'include all fields in the Verfiable Claim',
      actual:
        JSON.stringify(Object.keys(signedWorkClaim.claim).sort()) ===
        JSON.stringify(Object.keys(TheRavenBook.claim).sort()),
      expected: true,
    })
  }

  {
    const claim = await signWorkClaim(TheRavenBook).catch(getErrorMessage)

    assert({
      given: 'an extended verififable claim without an external context',
      should: 'will return an Error()',
      actual: claim,
      expected: 'The property "edition" in the input was not defined in the context.',
    })
  }
})

describe('GetClaimSigner.isValidSignature', async (should: any) => {
  const { assert } = should('')

  {
    const verifiableClaim = await signWorkClaim(TheRaven)

    assert({
      given: 'a Signed Verifiable Claim with a valid signature',
      should: 'return true',
      actual: await isValidSignature(verifiableClaim),
      expected: true,
    })

    const verifiableClaim2 = await signWorkClaim(TheRavenBookWithFullContext)
    assert({
      given: 'a Signed Verifiable Claim with an external context',
      should: 'return true',
      actual: await isValidSignature(verifiableClaim2),
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
      given: 'a Signed Verifiable claim with an altered public key',
      should: 'return false',
      actual: await isValidSignature(badClaim),
      expected: false,
    })
  }
})

describe('GetClaimSigner.isValidSignedVerifiableClaim', async (should: any) => {
  const { assert } = should('')

  {
    assert({
      given: 'an object that is not a claim',
      should: `return false`,
      actual: await isSignedVerifiableClaim({ foo: 'bar' }),
      expected: false,
    })
  }

  {
    assert({
      given: 'a claim with an invalid id',
      should: `return false`,
      actual: await isValidSignedVerifiableClaim({ ...SignedRaven, id: '111' }),
      expected: false,
    })
  }

  {
    const badClaim = {
      ...TheRaven,
      'sec:proof': {
        '@graph': {
          '@type': 'https://w3id.org/security#Ed25519Signature2018',
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
      given: 'a claim with an invalid publicKey',
      should: `return false`,
      actual: await isValidSignedVerifiableClaim(badClaim),
      expected: false,
    })
  }

  {
    assert({
      given: 'a claim with an invalid signature',
      should: `return false`,
      actual: await isValidSignedVerifiableClaim({ ...SignedRaven, 'sec:proof': '111' }),
      expected: false,
    })
  }

  {
    const result = await Promise.all(
      ['', null, undefined].map(value => isValidSignedVerifiableClaim({ ...SignedRaven, issuanceDate: value }))
    )

    assert({
      given: 'a claim with an invalid issuanceDate',
      should: 'return false',
      actual: result,
      expected: [false, false, false],
    })
  }
})
