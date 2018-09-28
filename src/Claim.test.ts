/* tslint:disable:no-relative-imports */
import * as jsig from 'jsonld-signatures'
import { describe } from 'riteway'
import { createClaim, getClaimId, isValidClaim, isValidSignature, signClaim } from './Claim'
import {
  Claim,
  ClaimType,
  DefaultClaimContext,
  DefaultWorkClaimContext,
  Identity,
  isClaim,
  SigningAlgorithm,
  Work,
} from './Interfaces'

const getErrorMessage = (err: Error): string => err.message

// Generated:
// const forge = require('node-forge')
// const ed25519 = forge.pki.ed25519
// const keypair = ed25519.generateKeyPair()
// const bs58 = require('bs58')
// bs58.encode(keypair.publicKey)
const testPublicKeyEd25519Base58: string = 'JAi9YoyDdgBQLenyVzoXWH4C26wKMzHrjertxVrjLWTe'

const testBadPublicKey: string = 'JAi9YoyDdgBQLenyVzoXWH4C26wKMzHrjertxVrjLWT5'

// bs58.encode(keypair.privateKey)
const testPrivateKeyEd25519Base58: string =
  'LWgo1jraJrCB2QT64UVgRemepsNopBF3eJaYMPYVTxpEoFx7sSzCb1QysHeJkH2fnGFgHirgVR35Hz5A1PpXuH6'

const testOwnerUrl = `data:,${testPublicKeyEd25519Base58}`

const testPublicKeyUrl = `data:,${testPublicKeyEd25519Base58}`

const testPublicKeyEd25519: any = {
  '@context': jsig.SECURITY_CONTEXT_URL,
  id: testPublicKeyUrl,
  type: 'Ed25519VerificationKey2018',
  owner: testOwnerUrl,
  publicKeyBase58: testPublicKeyEd25519Base58,
}

const externalContext: any = {
  claim: 'http://schema.org/Book',
  edition: 'http://schema.org/bookEdition',
  isbn: 'http://schema.org/isbn',
}

const signingOptions: any = {
  privateKeyBase58: testPrivateKeyEd25519Base58,
  algorithm: 'Ed25519Signature2018',
  creator: testPublicKeyEd25519.id,
}

const issuer: any = {
  id: testOwnerUrl,
  signingOptions,
}

const makeClaim = (claim: object) => {
  const issuer = TheRaven.issuer
  const issuanceDate = '2017-12-11T22:54:40.261Z'
  const type = ClaimType.Work
  return {
    issuer,
    issuanceDate,
    type,
    claim,
  }
}

const TheRaven: Work = {
  id: '996efc4bd089f62e596f3c2c15bda3002d45540481df3be2c11192a6963ee8a7',
  type: ClaimType.Work,
  issuer: testOwnerUrl,
  issuanceDate: '2017-11-13T15:00:00.000Z',
  claim: {
    name: 'The Raven',
    author: 'Edgar Allan Poe',
    keywords: 'poem',
    dateCreated: '',
    datePublished: '1845-01-29T03:00:00.000Z',
    hash: 'de1c818f9be211a78dff90a03b9e297bbb61b3c292f1c1bbc3a5283e9b203cb1',
    archiveUrl: 'ipfs:/theRaven',
  },
  'https://w3id.org/security#proof': {
    '@graph': {
      '@type': 'https://w3id.org/security#Ed25519Signature2018',
      created: {
        '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
        '@value': '2018-09-05T20:19:20Z',
      },
      'http://purl.org/dc/terms/creator': {
        '@id': testOwnerUrl,
      },
      'https://w3id.org/security#jws':
        'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..TSHkMOwbWZvIp8Hd-MyebaMgItf4Iyl3dgUSlHBBlnidw' +
        'gzo084pGpKmbOewYFrXfmAVhXnC4UPzaPUjaU9BDw',
    },
  },
}

const ravenClaim: any = { ...TheRaven.claim }

const TheRavenBook: Work = {
  ...TheRaven,
  claim: {
    ...TheRaven.claim,
    edition: '1',
    isbn: '9781458318404',
  },
}

const ravenBookClaim: any = { ...TheRavenBook.claim }

const Me: Identity = {
  id: '2b28274e3e88304f7baacec37c9959f8b237955c4e242f882150090b033966f4',
  type: ClaimType.Identity,
  issuer: testOwnerUrl,
  issuanceDate: '2017-11-13T15:00:00.000Z',
  claim: {
    publicKey: testPublicKeyEd25519Base58,
  },
  'https://w3id.org/security#proof': {
    '@graph': {
      '@type': 'https://w3id.org/security#Ed25519Signature2018',
      created: {
        '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
        '@value': '2018-09-05T20:19:20Z',
      },
      'http://purl.org/dc/terms/creator': {
        '@id': `data:,${testPublicKeyEd25519Base58}`,
      },
      'https://w3id.org/security#jws':
        'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..TSHkMOwbWZvIp8Hd-MyebaMgItf4Iyl3dgUSlHBBlnidw' +
        'gzo084pGpKmbOewYFrXfmAVhXnC4UPzaPUjaU9BDw',
    },
  },
}

const sign = signClaim(signingOptions)

describe('Claim.getClaimId', async (should: any) => {
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
    const claimId = await getClaimId({ ...TheRaven, issuanceDate: '2017-09-13T15:00:00.000Z' }).catch(getErrorMessage)

    assert({
      given: 'a claim with extra dateCreated, the new dateCreated',
      should: 'be included in the calculation of the id and should be not equal to the work id',
      actual: claimId !== TheRaven.id,
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

    const claimId1 = await getClaimId(work1).catch(getErrorMessage)
    const claimId2 = await getClaimId(work2).catch(getErrorMessage)

    assert({
      given: 'two claims with disordered keys',
      should: 'have the same claims id',
      actual: claimId1 === claimId2,
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

    const claimId1 = await getClaimId(work1).catch(getErrorMessage)
    const claimId2 = await getClaimId(work2).catch(getErrorMessage)

    assert({
      given: 'two claims with keys casing',
      should: 'NOT have the same claims id',
      actual: claimId1 !== claimId2,
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

describe('Claim.createClaim', async (should: any) => {
  const { assert } = should('')

  {
    const workClaim: any = await createClaim(issuer, ClaimType.Work, TheRaven.claim)

    assert({
      given: 'the public key of a Claim',
      should: 'be equal to public key of key',
      actual: workClaim['sec:proof']['@graph']['http://purl.org/dc/terms/creator']['@id'],
      expected: testPublicKeyUrl,
    })
  }

  {
    const claim = await createClaim(issuer, ClaimType.Work, TheRavenBook.claim, externalContext)
    assert({
      given: 'a claim with an external context',
      should: 'include all fields in the claim',
      actual:
        JSON.stringify(Object.keys(claim.claim).sort()) === JSON.stringify(Object.keys(TheRavenBook.claim).sort()),
      expected: true,
    })
  }

  {
    const claim = await createClaim(issuer, ClaimType.Work, TheRavenBook.claim).catch(getErrorMessage)

    assert({
      given: 'an extended claim without an external context',
      should: 'will return an Error()',
      actual: claim,
      expected: 'The property "edition" in the input was not defined in the context.',
    })
  }
})

describe('Claim.signClaim', async (should: any) => {
  const { assert } = should('')

  {
    const expectedMessage = 'Cannot sign a claim that has an empty .id field.'

    assert({
      given: 'a claim without id',
      should: `throw an error with the message ${expectedMessage}`,
      actual: await sign({ ...TheRaven, id: '' }).catch(getErrorMessage),
      expected: expectedMessage,
    })
  }

  {
    const expectedMessage = 'Cannot sign a claim whose id has been altered or generated incorrectly.'

    assert({
      given: 'a claim with an altered id',
      should: `throw an error with the message ${expectedMessage}`,
      actual: await sign({ ...TheRaven, id: 'be81cc75bcf6ca0f1fdd356f460e6ec920ba36ec78bd9e70c4d04a19f8943102' }).catch(
        getErrorMessage
      ),
      expected: expectedMessage,
    })
  }

  {
    const expectedMessage = 'Cannot sign a claim with an invalid creator in the signing options.'
    const invalidSign = signClaim({
      algorithm: SigningAlgorithm.Ed25519Signature2018,
      privateKeyBase58: testPrivateKeyEd25519Base58,
    })

    assert({
      given: 'a claim with creator undefined',
      should: `throw an error with the message ${expectedMessage}`,
      actual: await invalidSign(TheRaven).catch(getErrorMessage),
      expected: expectedMessage,
    })
  }

  {
    const invalidSign2 = signClaim({
      algorithm: SigningAlgorithm.Ed25519Signature2018,
      creator: 'data:,someoneelse',
      privateKeyBase58: testPrivateKeyEd25519Base58,
    })

    const signedClaim = await invalidSign2({
      ...TheRaven,
      '@context': { ...DefaultClaimContext, ...DefaultWorkClaimContext },
    }).catch(e => e)

    assert({
      given: 'an invalid public key in creator',
      should: `create a claim that can not be verified`,
      actual: await isValidSignature(signedClaim),
      expected: false,
    })
  }
})

describe('Claim.isValidSignature', async (should: any) => {
  const { assert } = should('')

  {
    const claim = await createClaim(issuer, ClaimType.Work, TheRaven.claim)

    assert({
      given: 'a claim with a valid signature',
      should: 'return true',
      actual: await isValidSignature(claim),
      expected: true,
    })

    const claim2 = await createClaim(issuer, ClaimType.Work, TheRavenBook.claim, externalContext)
    assert({
      given: 'a claim with an external context',
      should: 'return true',
      actual: await isValidSignature(claim2),
      expected: true,
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
      given: 'a claim with an invalid public key',
      should: 'return false',
      actual: await isValidSignature(badClaim),
      expected: false,
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
