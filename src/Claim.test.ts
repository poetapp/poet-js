/* tslint:disable:no-relative-imports */
import * as jsig from 'jsonld-signatures'
import { describe } from 'riteway'
import { canonizeClaim, createClaim, getClaimId, isValidClaim, isValidSignature, signClaim } from './Claim'
import { Claim, ClaimAttributes, ClaimType, Identity, isClaim, Work } from './Interfaces'

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

export const TestPublicKeyUrl = `data:,${testPublicKeyEd25519Base58}`

export const testPublicKeyEd25519: any = {
  '@context': jsig.SECURITY_CONTEXT_URL,
  id: TestPublicKeyUrl,
  type: 'Ed25519VerificationKey2018',
  owner: testOwnerUrl,
  publicKeyBase58: testPublicKeyEd25519Base58,
}

export const externalContext: any = {
  claim: 'http://schema.org/Book',
  edition: 'http://schema.org/bookEdition',
  isbn: 'http://schema.org/isbn',
}

export const signingOptions: any = {
  privateKeyBase58: testPrivateKeyEd25519Base58,
  algorithm: 'Ed25519Signature2018',
  creator: testPublicKeyEd25519.id,
}

export const Issuer: any = {
  id: testOwnerUrl,
  signingOptions,
}

const makeClaim = (claim: ClaimAttributes) => {
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
  id: '2b28274e3e88304f7baacec37c9959f8b237955c4e242f882150090b033966f4',
  type: ClaimType.Work,
  issuer: testOwnerUrl,
  issuanceDate: '2017-11-13T15:00:00.000Z',
  claim: {
    name: 'The Raven',
    author: 'Edgar Allan Poe',
    keywords: 'poem',
    dateCreated: '',
    datePublished: '1845-01-29T03:00:00.000Z',
    text: 'Once upon a midnight dreary...',
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

const TheRavenBook: Work = {
  ...TheRaven,
  claim: {
    ...TheRaven.claim,
    edition: '1',
    isbn: '9781458318404',
  },
}

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

const canonicalRaven =
  '_:c14n0 <http://schema.org/CreativeWork> _:c14n1 .\n' +
  '_:c14n0 <http://schema.org/additionalType> "Work" .\n' +
  '_:c14n0 <https://w3id.org/credentials#issued> "2017-11-13T15:00:00.000Z" .\n' +
  '_:c14n0 <https://w3id.org/credentials#issuer> "data:,JAi9YoyDdgBQLenyVzoXWH4C26wKMzHrjertxVrjLWTe" .\n' +
  '_:c14n1 <http://schema.org/author> "Edgar Allan Poe" .\n' +
  '_:c14n1 <http://schema.org/dateCreated> "" .\n' +
  '_:c14n1 <http://schema.org/datePublished> "1845-01-29T03:00:00.000Z" .\n' +
  '_:c14n1 <http://schema.org/keywords> "poem" .\n' +
  '_:c14n1 <http://schema.org/name> "The Raven" .\n' +
  '_:c14n1 <http://schema.org/text> "Once upon a midnight dreary..." .\n'

const canonicalRavenBook =
  '_:c14n0 <http://schema.org/Book> _:c14n1 .\n' +
  '_:c14n0 <http://schema.org/additionalType> "Work" .\n' +
  '_:c14n0 <https://w3id.org/credentials#issued> "2017-11-13T15:00:00.000Z" .\n' +
  '_:c14n0 <https://w3id.org/credentials#issuer> "data:,JAi9YoyDdgBQLenyVzoXWH4C26wKMzHrjertxVrjLWTe" .\n' +
  '_:c14n1 <http://schema.org/author> "Edgar Allan Poe" .\n' +
  '_:c14n1 <http://schema.org/bookEdition> "1" .\n' +
  '_:c14n1 <http://schema.org/dateCreated> "" .\n' +
  '_:c14n1 <http://schema.org/datePublished> "1845-01-29T03:00:00.000Z" .\n' +
  '_:c14n1 <http://schema.org/isbn> "9781458318404" .\n' +
  '_:c14n1 <http://schema.org/keywords> "poem" .\n' +
  '_:c14n1 <http://schema.org/name> "The Raven" .\n' +
  '_:c14n1 <http://schema.org/text> "Once upon a midnight dreary..." .\n'

const expectedCanonicalDoc =
  '_:c14n0 <http://schema.org/CreativeWork> _:c14n1 .\n' +
  '_:c14n0 <http://schema.org/additionalType> "Work" .\n' +
  '_:c14n0 <https://w3id.org/credentials#issued> "2017-12-11T22:54:40.261Z" .\n' +
  '_:c14n0 <https://w3id.org/credentials#issuer> "data:,JAi9YoyDdgBQLenyVzoXWH4C26wKMzHrjertxVrjLWTe" .\n' +
  '_:c14n1 <http://schema.org/author> "Edgar Allan Poe" .\n' +
  '_:c14n1 <http://schema.org/name> "The Raven" .\n'

const canonicalMe =
  '_:c14n0 <https://w3id.org/security#publicKeyBase58> "JAi9YoyDdgBQLenyVzoXWH4C26wKMzHrjertxVrjLWTe" .\n' +
  '_:c14n1 <http://schema.org/Thing> _:c14n0 .\n' +
  '_:c14n1 <http://schema.org/additionalType> "Identity" .\n' +
  '_:c14n1 <https://w3id.org/credentials#issued> "2017-11-13T15:00:00.000Z" .\n' +
  '_:c14n1 <https://w3id.org/credentials#issuer> "data:,JAi9YoyDdgBQLenyVzoXWH4C26wKMzHrjertxVrjLWTe" .\n'

const sign = signClaim(signingOptions)

describe('Claim', async (should: any) => {
  const { assert } = should('')
  const returnError = (err: Error): Error => err

  {
    assert({
      given: 'a complete work claim',
      should: 'include all items in canonical doc',
      actual: await canonizeClaim(TheRaven),
      expected: canonicalRaven,
    })

    assert({
      given: 'a complete identity claim',
      should: 'include all items in canonical doc',
      actual: await canonizeClaim(Me),
      expected: canonicalMe,
    })
  }

  {
    const claim = makeClaim({
      name: TheRaven.claim.name,
      author: TheRaven.claim.author,
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
      name: TheRaven.claim.name,
      author: TheRaven.claim.author,
    })

    const work2: Claim = makeClaim({
      author: TheRaven.claim.author,
      name: TheRaven.claim.name,
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
      name: TheRaven.claim.name,
      author: TheRaven.claim.author,
    })

    const work2: Claim = makeClaim({
      Author: TheRaven.claim.author,
      NAME: TheRaven.claim.name,
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
    const canonicalDocument = await canonizeClaim(TheRavenBook)

    assert({
      given: 'an extended document without proper context',
      should: 'NOT include the extra attributes in the canonical document',
      actual: canonicalDocument,
      expected: canonicalRaven,
    })

    const canonicalDocumentWithContext = await canonizeClaim({ ...TheRavenBook, '@context': externalContext })

    assert({
      given: 'the same extended document WITH proper context',
      should: 'include the extra attributes in the canonical document',
      actual: canonicalDocumentWithContext,
      expected: canonicalRavenBook,
    })
  }

  {
    const workClaim = makeClaim({
      name: TheRaven.claim.name,
      author: TheRaven.claim.author,
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
      name: TheRavenBook.claim.name,
      author: TheRavenBook.claim.author,
      isbn: TheRavenBook.claim.isbn,
      edition: TheRavenBook.claim.edition,
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

  {
    const workClaim: any = await createClaim(Issuer, ClaimType.Work, TheRaven.claim)

    assert({
      given: 'the public key of a Claim',
      should: 'be equal to public key of key',
      actual: workClaim['https://w3id.org/security#proof']['@graph']['http://purl.org/dc/terms/creator']['@id'],
      expected: TestPublicKeyUrl,
    })
  }

  {
    const claim = await createClaim(Issuer, ClaimType.Work, TheRaven.claim)

    assert({
      given: 'a claim with a valid signature, isValidSignature',
      should: 'return true',
      actual: await isValidSignature(claim),
      expected: true,
    })

    const claim2 = await createClaim(Issuer, ClaimType.Work, TheRavenBook.claim, { '@context': externalContext })
    assert({
      given: 'a claim with an external context, isValidSignature',
      should: 'return true',
      actual: await isValidSignature(claim2),
      expected: true,
    })

    assert({
      given: 'a claim with an external context, createClaim',
      should: 'include all fields in the claim',
      actual:
        JSON.stringify(Object.keys(claim2.claim).sort()) === JSON.stringify(Object.keys(TheRavenBook.claim).sort()),
      expected: true,
    })

    const claim3 = await createClaim(Issuer, ClaimType.Work, TheRavenBook.claim)

    assert({
      given: 'an extended claim without an external context, createClaim',
      should: 'will return an Error()',
      actual: claim3,
      expected: new Error('The property "edition" in the input was not defined in the context.'),
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
      given: 'a claim with an invalid public key, isValidSignature',
      should: 'return false',
      actual: await isValidSignature(badClaim),
      expected: false,
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
      actual: await getClaimId({ ...TheRaven, id: '123' }),
      expected: TheRaven.id,
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
    const claimId = await getClaimId({ ...TheRaven, issuanceDate: '2017-09-13T15:00:00.000Z' }).catch(returnError)

    assert({
      given: 'a claim with extra dateCreated, the new dateCreated',
      should: 'be included in the calculation of the id and should be not equal to the work id',
      actual: claimId !== TheRaven.id,
      expected: true,
    })
  }

  {
    const work1: Claim = makeClaim({
      name: TheRaven.claim.name,
      author: TheRaven.claim.author,
    })

    const work2: Claim = makeClaim({
      author: TheRaven.claim.author,
      name: TheRaven.claim.name,
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
      name: TheRaven.claim.name,
      author: TheRaven.claim.author,
    })

    const work2: Claim = makeClaim({
      author: TheRaven.claim.author,
      nAME: TheRaven.claim.name,
      dateCreated: TheRaven.claim.dateCreated,
      datePublished: TheRaven.claim.datePublished,
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
    const expectedMessage = 'Cannot sign a claim that has an empty .id field.'

    assert({
      given: 'a claim without id',
      should: `throw an error with the message ${expectedMessage}`,
      actual: await sign({ ...TheRaven, id: '' }).catch(returnError),
      expected: new Error(expectedMessage),
    })
  }

  {
    const expectedMessage = 'Cannot sign a claim whose id has been altered or generated incorrectly.'

    assert({
      given: 'a claim without id',
      should: `throw an error with the message ${expectedMessage}`,
      actual: await sign({ ...TheRaven, id: 'be81cc75bcf6ca0f1fdd356f460e6ec920ba36ec78bd9e70c4d04a19f8943102' }).catch(
        returnError
      ),
      expected: new Error(expectedMessage),
    })
  }

  {
    const expectedMessage = 'Cannot sign a claim with an invalid creator in the signing options.'
    const invalidSign = signClaim({})

    assert({
      given: 'a claim with publicKey undefined',
      should: `throw an error with the message ${expectedMessage}`,
      actual: await invalidSign(TheRaven).catch(returnError),
      expected: new Error(expectedMessage),
    })
  }

  {
    const expectedMessage = `Cannot sign this claim with the provided privateKey. It doesn\'t match the claim's public key.`
    const invalidSign2 = signClaim({ creator: 'someoneelse' })

    assert({
      given: 'invalid signing options',
      should: `throw an error with the message ${expectedMessage}`,
      actual: await invalidSign2({ ...TheRaven }).catch(returnError),
      expected: new Error(expectedMessage),
    })
  }

  {
    assert({
      given: 'a valid claim, isClaim',
      should: `return true`,
      actual: isClaim(TheRaven),
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
      given: 'a claim with an invalid publicKey, isValidClaim',
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
