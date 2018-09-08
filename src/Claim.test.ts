/* tslint:disable:no-relative-imports */
import * as jsig from 'jsonld-signatures'
import { describe } from 'riteway'

// import { createClaim, isValidSignature, getClaimId, signClaim, isValidClaim, canonizeClaim } from './Claim'
import { createClaim, isValidSignature, getClaimId, signClaim, isValidClaim, canonizeClaim } from './Claim'
import { Claim, ClaimType, ClaimAttributes, Work, isClaim } from './Interfaces'

// Generated:
// const forge = require('node-forge')
// const ed25519 = forge.pki.ed25519
// const keypair = ed25519.generateKeyPair()
// const bs58 = require('bs58')
// bs58.encode(keypair.publicKey)
const testPublicKeyEd25519Base58: string = 'JAi9YoyDdgBQLenyVzoXWH4C26wKMzHrjertxVrjLWTe'

// bs58.encode(keypair.privateKey)
const testPrivateKeyEd25519Base58: string =
  'LWgo1jraJrCB2QT64UVgRemepsNopBF3eJaYMPYVTxpEoFx7sSzCb1QysHeJkH2fnGFgHirgVR35Hz5A1PpXuH6'

const testOwnerUrl = 'po.et://entities/1bb5e7959c7cb28936ec93eb6893094241a5bc396f08845b4f52c86034f0ddf8'

export const TestPublicKeyUrl =
  'po.et://entities/1bb5e7959c7cb28936ec93eb6893094241a5bc396f08845b4f52c86034f0ddf8#publicKey'

export const testPublicKeyEd25519: any = {
  '@context': jsig.SECURITY_CONTEXT_URL,
  id: TestPublicKeyUrl,
  type: 'Ed25519VerificationKey2018',
  owner: testOwnerUrl,
  publicKeyBase58: testPublicKeyEd25519Base58,
}

export const testPublicKeyEd25519Owner: any = {
  '@context': jsig.SECURITY_CONTEXT_URL,
  id: testOwnerUrl,
  publicKey: [testPublicKeyEd25519],
  'https://example.org/special-authentication': {
    publicKey: testPublicKeyEd25519.id,
  },
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
  const issued = '2017-12-11T22:54:40.261Z'
  const type = ClaimType.Work
  return {
    issuer,
    issued,
    type,
    claim,
  }
}

const TheRaven: Work = {
  id: 'c00eead2e2db1f37f1750d98356c389f5f6fc0ee5f376a34597615da62689dd8',
  type: ClaimType.Work,
  issuer: 'po.et://entities/1bb5e7959c7cb28936ec93eb6893094241a5bc396f08845b4f52c86034f0ddf8',
  issued: '2017-11-13T15:00:00.000Z',
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
        '@id': testPublicKeyEd25519.id,
      },
      'https://w3id.org/security#jws':
        'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..TSHkMOwbWZvIp8Hd-MyebaMgItf4Iyl3dgUSlHBBlnidw' +
        'gzo084pGpKmbOewYFrXfmAVhXnC4UPzaPUjaU9BDw',
    },
  },
}

export const VerificationOptions: object = {
  publicKey: testPublicKeyEd25519,
  publicKeyOwner: testPublicKeyEd25519Owner,
}

const verifier = isValidSignature(VerificationOptions)

const canonicalRaven =
  '_:c14n0 <http://schema.org/author> "Edgar Allan Poe" .\n' +
  '_:c14n0 <http://schema.org/dateCreated> "" .\n' +
  '_:c14n0 <http://schema.org/datePublished> "1845-01-29T03:00:00.000Z" .\n' +
  '_:c14n0 <http://schema.org/keywords> "poem" .\n' +
  '_:c14n0 <http://schema.org/name> "The Raven" .\n' +
  '_:c14n0 <http://schema.org/text> "Once upon a midnight dreary..." .\n' +
  '_:c14n1 <http://purl.org/dc/terms/created> "2017-11-13T15:00:00.000Z" .\n' +
  '_:c14n1 <http://schema.org/CreativeWork> _:c14n0 .\n' +
  '_:c14n1 <http://schema.org/Organization> "po.et://entities/1bb5e7959c7cb28936ec93eb6893094241a5bc396f08845b4f52c86034f0ddf8" .\n' +
  '_:c14n1 <http://schema.org/additionalType> "Work" .\n'

const expectedCanonicalDoc =
  '_:c14n0 <http://schema.org/author> "Edgar Allan Poe" .\n' +
  '_:c14n0 <http://schema.org/name> "The Raven" .\n' +
  '_:c14n1 <http://purl.org/dc/terms/created> "2017-12-11T22:54:40.261Z" .\n' +
  '_:c14n1 <http://schema.org/CreativeWork> _:c14n0 .\n' +
  '_:c14n1 <http://schema.org/Organization> "po.et://entities/1bb5e7959c7cb28936ec93eb6893094241a5bc396f08845b4f52c86034f0ddf8" .\n' +
  '_:c14n1 <http://schema.org/additionalType> "Work" .\n'

const sign = signClaim(signingOptions)

describe('Claim', async (should: any) => {
  const { assert } = should('')
  const returnError = (err: Error): Error => err

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
    const claim = makeClaim({
      name: TheRaven.claim.name,
      author: TheRaven.claim.author,
    })

    assert({
      given: 'A claim',
      should: 'generate an id for the claim',
      actual: await getClaimId(claim),
      expected: '8500395b29e3ce3dee704cd5ad1dadc7daf0a49e481761a03582807f54bfdfc1',
    })
  }

  {
    const claim = await createClaim(Issuer, ClaimType.Work, TheRaven.claim)

    assert({
      given: 'the public key of a Claim',
      should: 'be equal to public key of key',
      actual: claim['https://w3id.org/security#proof']['@graph']['http://purl.org/dc/terms/creator']['@id'],
      expected: TestPublicKeyUrl,
    })
  }

  {
    const claim = await createClaim(Issuer, ClaimType.Work, TheRaven.claim)

    assert({
      given: 'the result of isValidSignature of Claim with a valid signature',
      should: 'should return true',
      actual: await verifier(claim),
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

  // {
  //   assert({
  //     given: 'a claim with extra id, the new id',
  //     should: 'be ignored in the calculation of the id and should be equal to the work id',
  //     actual: await getClaimId({ ...TheRaven, id: '123' }).catch(returnError),
  //     expected: TheRaven.id,
  //   })
  // }

  // {
  //   assert({
  //     given: 'a claim with extra signature, the new signature',
  //     should: 'be ignored in the calculation of the id and should be equal to the work id',
  //     actual: await getClaimId({ ...TheRaven }).catch(returnError),
  //     expected: TheRaven.id,
  //   })
  // }

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
    const claimId = await getClaimId({ ...TheRaven, issued: '2017-09-13T15:00:00.000Z' }).catch(returnError)

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
    // const signedClaim = await sign(TheRaven)
    //
    // assert({
    //   given: 'a signature of a Claim',
    //   should: 'be the signature equal to of work signature',
    //   actual: signedClaim['https://w3id.org/security#proof']['@graph']['https://w3id.org/security#jws'],
    //   expected: TheRaven['https://w3id.org/security#proof']['@graph']['https://w3id.org/security#jws'],
    // })
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

  // {
  //   assert({
  //     given: 'a claim with an invalid publicKey',
  //     should: `return false`,
  //     actual: await isValidClaim({ ...TheRaven }),
  //     expected: false,
  //   })
  // }

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
