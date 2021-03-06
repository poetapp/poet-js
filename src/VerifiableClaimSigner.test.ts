/* tslint:disable:no-relative-imports */
/* tslint:disable:max-line-length */
import { describe } from 'riteway'

import {
  claimSigner,
  ed25519Base58PrivateKey,
  Ed25519TheRaven,
  externalContext,
  getErrorMessage,
  MyIdentity,
  rsaPemPrivateKey,
  TheRavenBook,
  TheRavenBookClaim,
  TheRavenClaim,
} from '../tests/unit/shared'

import {
  ClaimType,
  DefaultClaimContext,
  DefaultWorkClaimContext,
  isSignedVerifiableClaim,
  SignedVerifiableClaim,
  SigningAlgorithm,
} from './Interfaces'
import { configureCreateVerifiableClaim } from './VerifiableClaim'
import { createIssuerFromPrivateKey, generateED25519Base58Keys, generateRsaKeyPems } from './util/KeyHelper'

const { configureSignVerifiableClaim, isValidSignedVerifiableClaim, isValidSignature } = claimSigner
const rsaIssuer = createIssuerFromPrivateKey(rsaPemPrivateKey, SigningAlgorithm.RsaSignature2018)

describe('VerifiableClaimSigner.configureSignVerifiableClaim - Ed25519', async (assert: any) => {
  {
    const issuer = createIssuerFromPrivateKey(ed25519Base58PrivateKey)
    const createVerifiableWorkClaim = configureCreateVerifiableClaim({ issuer })
    const verifiableWorkClaim = await createVerifiableWorkClaim(TheRavenClaim)
    const signWorkClaim = configureSignVerifiableClaim({ privateKey: ed25519Base58PrivateKey })
    const signedWorkClaim = await signWorkClaim(verifiableWorkClaim)

    assert({
      given: 'a signed work c laim, the creator of the signature proof',
      should: 'be equal to the issuer of the Verifiable Claim',
      actual: signedWorkClaim['sec:proof']['@graph']['dc:creator']['@id'],
      expected: issuer,
    })

    assert({
      given: 'a Signed Verifiable Work Claim',
      should: 'have a valid Signature',
      actual: await isValidSignature(signedWorkClaim),
      expected: true,
    })

    assert({
      given: 'a Signed Verifiable Work Claim',
      should: 'be a valid Claim',
      actual: await isValidSignedVerifiableClaim(signedWorkClaim),
      expected: true,
    })
  }

  {
    const issuer = createIssuerFromPrivateKey(ed25519Base58PrivateKey)
    const createVerifiableWorkClaim = configureCreateVerifiableClaim({ issuer, context: externalContext })
    const verifiableWorkClaim = await createVerifiableWorkClaim(TheRavenBookClaim)
    const signWorkClaim = configureSignVerifiableClaim({ privateKey: ed25519Base58PrivateKey })
    const signedWorkClaim = await signWorkClaim(verifiableWorkClaim)

    assert({
      given: 'a Signed Verifiable Work Claim with an external context',
      should: 'include all fields in the Verfiable Work Claim',
      actual: JSON.stringify(Object.keys(signedWorkClaim.claim).sort()),
      expected: JSON.stringify(Object.keys(TheRavenBook.claim).sort()),
    })
  }

  {
    const issuer = createIssuerFromPrivateKey(ed25519Base58PrivateKey)
    const createVerifiableWorkClaim = configureCreateVerifiableClaim({ issuer })
    const verifiableWorkClaim = await createVerifiableWorkClaim(TheRavenBookClaim)
    const signWorkClaim = configureSignVerifiableClaim({ privateKey: ed25519Base58PrivateKey })
    const signedWorkClaim = await signWorkClaim(verifiableWorkClaim).catch(getErrorMessage)

    assert({
      given: 'an extended verififable claim without an external context, signVerifiableClaim',
      should: 'will return an Error()',
      actual: signedWorkClaim,
      expected: 'The property "edition" in the input was not defined in the context.',
    })
  }
})

describe('VerifiableClaimSigner.configureSignVerifiableClaim - RSA', async (assert: any) => {
  {
    const createVerifiableWorkClaim = configureCreateVerifiableClaim({ issuer: rsaIssuer })
    const verifiableWorkClaim = await createVerifiableWorkClaim(TheRavenClaim)
    const signWorkClaim = configureSignVerifiableClaim({
      privateKey: rsaPemPrivateKey,
      algorithm: SigningAlgorithm.RsaSignature2018,
    })
    const signedWorkClaim = await signWorkClaim(verifiableWorkClaim)

    assert({
      given: 'a signed work claim, the creator of the signature proof',
      should: 'be equal to the issuer of the Verifiable Claim',
      actual: signedWorkClaim['sec:proof']['@graph']['dc:creator']['@id'],
      expected: rsaIssuer,
    })

    assert({
      given: 'a Signed Verifiable Work Claim',
      should: 'have a valid Signature',
      actual: await isValidSignature(signedWorkClaim),
      expected: true,
    })

    assert({
      given: 'a Signed Verifiable Work Claim',
      should: 'be a valid Claim',
      actual: await isValidSignedVerifiableClaim(signedWorkClaim),
      expected: true,
    })
  }

  {
    const createVerifiableIdentityClaim = configureCreateVerifiableClaim({
      issuer: rsaIssuer,
      type: ClaimType.Identity,
    })
    const verifiableIdentityClaim = await createVerifiableIdentityClaim(MyIdentity.claim)

    const signIdentityClaim = configureSignVerifiableClaim({
      privateKey: rsaPemPrivateKey,
      algorithm: SigningAlgorithm.RsaSignature2018,
    })
    const signedIdentityClaim = await signIdentityClaim(verifiableIdentityClaim)

    assert({
      given: 'a signed identity claim, the creator of the signature proof',
      should: 'be equal to the issuer of the claim ',
      actual: signedIdentityClaim['sec:proof']['@graph']['dc:creator']['@id'],
      expected: rsaIssuer,
    })

    assert({
      given: 'a Signed Verifiable Identity Claim',
      should: 'have a valid signature',
      actual: await isValidSignature(signedIdentityClaim),
      expected: true,
    })

    assert({
      given: 'a Signed Verifiable Identity Claim',
      should: 'be a valid claim',
      actual: await isValidSignedVerifiableClaim(signedIdentityClaim),
      expected: true,
    })
  }

  {
    const createVerifiableWorkClaim = configureCreateVerifiableClaim({ issuer: rsaIssuer, context: externalContext })
    const verifiableWorkClaim = await createVerifiableWorkClaim(TheRavenBookClaim)
    const signWorkClaim = configureSignVerifiableClaim({
      privateKey: rsaPemPrivateKey,
      algorithm: SigningAlgorithm.RsaSignature2018,
    })
    const signedWorkClaim = await signWorkClaim(verifiableWorkClaim)

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
    const createVerifiableWorkClaim = configureCreateVerifiableClaim({ issuer: rsaIssuer })
    const verifiableWorkClaim = await createVerifiableWorkClaim(TheRavenBookClaim)
    const signWorkClaim = configureSignVerifiableClaim({
      privateKey: rsaPemPrivateKey,
      algorithm: SigningAlgorithm.RsaSignature2018,
    })
    const signedWorkClaim = await signWorkClaim(verifiableWorkClaim).catch(getErrorMessage)

    assert({
      given: 'an extended verififable claim without an external context',
      should: 'will return an Error()',
      actual: signedWorkClaim,
      expected: 'The property "edition" in the input was not defined in the context.',
    })
  }
})

describe('VerifiableClaimSigner.isValidSignature - Ed25519', async (assert: any) => {
  {
    const signWorkClaim = configureSignVerifiableClaim({ privateKey: ed25519Base58PrivateKey })
    const signedWorkClaim = await signWorkClaim(Ed25519TheRaven)

    assert({
      given: 'a Signed Verifiable Claim with a valid signature',
      should: 'return true',
      actual: await isValidSignature(signedWorkClaim),
      expected: true,
    })
  }

  {
    const issuer = createIssuerFromPrivateKey(ed25519Base58PrivateKey)
    const createVerifiableClaim = configureCreateVerifiableClaim({
      issuer,
      type: ClaimType.Work,
      context: externalContext,
    })
    const signWorkClaim = configureSignVerifiableClaim({ privateKey: ed25519Base58PrivateKey })

    const verifiableWorkClaim = await createVerifiableClaim(TheRavenBookClaim)
    const signedWorkClaim = await signWorkClaim(verifiableWorkClaim)

    assert({
      given: 'a Signed Verifiable Claim with an external context',
      should: 'return true',
      actual: await isValidSignature(signedWorkClaim),
      expected: true,
    })
  }

  {
    const signedWorkClaim: SignedVerifiableClaim = {
      '@context': {
        cred: 'https://w3id.org/credentials#',
        dc: 'http://purl.org/dc/terms/',
        schema: 'http://schema.org/',
        sec: 'https://w3id.org/security#',
        id: 'sec:digestValue',
        issuer: 'cred:issuer',
        issuanceDate: 'cred:issued',
        type: 'schema:additionalType',
        claim: 'schema:CreativeWork',
        archiveUrl: 'schema:url',
        author: 'schema:author',
        canonicalUrl: 'schema:url',
        contributors: {
          '@id': 'schema:ItemList',
          '@container': '@list',
          '@type': 'schema:contributor',
        },
        copyrightHolder: 'schema:copyrightHolder',
        dateCreated: 'schema:dateCreated',
        datePublished: 'schema:datePublished',
        license: 'schema:license',
        name: 'schema:name',
        tags: 'schema:keywords',
        hash: 'sec:digestValue',
      },
      id: 'eb1de236c5ed14930e0a0bac87bdc3e26778670a5a6dc35d6acce931290017c7',
      type: ClaimType.Work,
      issuer:
        'data:;base64,eyJhbGdvcml0aG0iOiJFZDI1NTE5U2lnbmF0dXJlMjAxOCIsInB1YmxpY0tleSI6IjQyVk1GYWVONVhTZk5qQk4zUEU3ckZvU1lycHBmUDR2aWZSMVlXZnB6eDhYIn0=',
      issuanceDate: '2018-10-12T01:54:11.673Z',
      claim: {
        name: 'The Raven',
        author: 'Edgar Allan Poe',
        tags: 'poem',
        dateCreated: '',
        datePublished: '1845-01-29T03:00:00.000Z',
      },
      'sec:proof': {
        '@graph': {
          '@type': 'sec:Ed25519Signature2018',
          'dc:created': {
            '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
            '@value': '2018-10-12T01:54:11Z',
          },
          'dc:creator': {
            '@id':
              'data:;base64,eyJhbGdvcml0aG0iOiJFZDI1NTE5U2lnbmF0dXJlMjAxOCIsInB1YmxpY0tleSI6IjQyVk1GYWVONVhTZk5qQk4zUEU3ckZvU1lycHBmUDR2aWZSMVlXZnB6eDhYIn0=',
          },
          'sec:jws':
            'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..3_84-KBC4XPVhakWX9SC1fRrTyo4laIoyvef17KK305-vhgpGRfrAZP9d0FGomf4pPOpkRP_Zzo13sQ-yvG-CQ',
          'sec:nonce': 'cjn5czg4d0002mnc90aru2bn1',
        },
      },
    }

    assert({
      given: 'a Signed Verifiable Claim that was not recently created',
      should: 'return true',
      actual: await isValidSignature(signedWorkClaim),
      expected: true,
    })
  }

  {
    const { privateKey } = generateED25519Base58Keys('bad actor')
    const badIssuer = createIssuerFromPrivateKey(privateKey)
    const badClaim = {
      '@context': { ...DefaultClaimContext, ...DefaultWorkClaimContext },
      ...Ed25519TheRaven,
      'sec:proof': {
        '@graph': {
          '@type': 'sec:Ed25519Signature2018',
          'dc:created': {
            '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
            '@value': '2018-10-12T01:54:11Z',
          },
          'dc:creator': {
            '@id': badIssuer,
          },
          'sec:jws':
            'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..3_84-KBC4XPVhakWX9SC1fRrTyo4laIoyvef17KK305-vhgpGRfrAZP9d0FGomf4pPOpkRP_Zzo13sQ-yvG-CQ',
          'sec:nonce': 'cjn5czg4d0002mnc90aru2bn1',
        },
      },
    }

    assert({
      given: 'a Signed Verifiable claim with an invalid signature creator',
      should: 'return false',
      actual: await isValidSignature(badClaim),
      expected: false,
    })
  }
})

describe('VerifiableClaimSigner.isValidSignature - RSA', async (assert: any) => {
  {
    const createVerifiableClaim = configureCreateVerifiableClaim({
      issuer: rsaIssuer,
      type: ClaimType.Work,
      context: externalContext,
    })
    const signWorkClaim = configureSignVerifiableClaim({
      privateKey: rsaPemPrivateKey,
      algorithm: SigningAlgorithm.RsaSignature2018,
    })

    const verifiableWorkClaim = await createVerifiableClaim(TheRavenBookClaim)
    const signedWorkClaim = await signWorkClaim(verifiableWorkClaim)

    assert({
      given: 'a Signed Verifiable Claim with a valid signature',
      should: 'return true',
      actual: await isValidSignature(signedWorkClaim),
      expected: true,
    })
  }

  {
    const createVerifiableClaim = configureCreateVerifiableClaim({
      issuer: rsaIssuer,
      type: ClaimType.Work,
      context: externalContext,
    })
    const signWorkClaim = configureSignVerifiableClaim({
      privateKey: rsaPemPrivateKey,
      algorithm: SigningAlgorithm.RsaSignature2018,
    })

    const verifiableWorkClaim = await createVerifiableClaim(TheRavenBookClaim)
    const signedWorkClaim = await signWorkClaim(verifiableWorkClaim)

    assert({
      given: 'a Signed Verifiable Claim with an external context',
      should: 'return true',
      actual: await isValidSignature(signedWorkClaim),
      expected: true,
    })
  }

  {
    const createRsaVerifiableClaimWithExternalContext = configureCreateVerifiableClaim({
      issuer: rsaIssuer,
      type: ClaimType.Work,
      context: externalContext,
    })
    const rsaTheRavenBookWithFullContext = await createRsaVerifiableClaimWithExternalContext(TheRavenBook.claim)
    const { privateKey } = generateRsaKeyPems()
    const badIssuer = createIssuerFromPrivateKey(privateKey, SigningAlgorithm.RsaSignature2018)

    const badClaim = {
      '@context': { ...DefaultClaimContext, ...DefaultWorkClaimContext },
      ...rsaTheRavenBookWithFullContext,
      'sec:proof': {
        '@graph': {
          '@type': 'sec:RsaSignature2018',
          'dc:created': {
            '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
            '@value': '2018-09-05T20:19:20Z',
          },
          'dc:creator': {
            '@id': badIssuer,
          },
          'sec:nonce': 'cjn6c1y0h0008fmc9y01bmfih',
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

describe('VerifiableClaimSigner.isValidSignedVerifiableClaim', async (assert: any) => {
  {
    assert({
      given: 'an object that is not a claim',
      should: `return false`,
      actual: await isSignedVerifiableClaim({ foo: 'bar' }),
      expected: false,
    })
  }

  {
    const signWorkClaim = configureSignVerifiableClaim({ privateKey: ed25519Base58PrivateKey })
    const signedWorkClaim = await signWorkClaim(Ed25519TheRaven)

    assert({
      given: 'a claim with an invalid id',
      should: `return false`,
      actual: await isValidSignedVerifiableClaim({ ...signedWorkClaim, id: '111' }),
      expected: false,
    })
  }

  {
    const { privateKey } = generateED25519Base58Keys('bad actor')
    const badIssuer = createIssuerFromPrivateKey(privateKey)

    const badClaim = {
      ...Ed25519TheRaven,
      'sec:proof': {
        '@graph': {
          '@type': 'https://w3id.org/security#Ed25519Signature2018',
          'dc:created': {
            '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
            '@value': '2018-09-05T20:19:20Z',
          },
          'dc:creator': {
            '@id': badIssuer,
          },
          'sec:nonce': 'cjn6c1y0h0008fmc9y01bmfih',
          'sec:jws':
            'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..TSHkMOwbWZvIp8Hd-MyebaMgItf4Iyl3dgUSlHBBlnidw' +
            'gzo084pGpKmbOewYFrXfmAVhXnC4UPzaPUjaU9BDw',
        },
      },
    }

    assert({
      given: 'a claim with an invalid issuer',
      should: `return false`,
      actual: await isValidSignedVerifiableClaim(badClaim),
      expected: false,
    })
  }

  {
    const signWorkClaim = configureSignVerifiableClaim({ privateKey: ed25519Base58PrivateKey })
    const signedWorkClaim = await signWorkClaim(Ed25519TheRaven)

    assert({
      given: 'a claim with an invalid signature',
      should: `return false`,
      actual: await isValidSignedVerifiableClaim({ ...signedWorkClaim, 'sec:proof': '111' }),
      expected: false,
    })
  }

  {
    const signWorkClaim = configureSignVerifiableClaim({ privateKey: ed25519Base58PrivateKey })
    const signedWorkClaim = await signWorkClaim(Ed25519TheRaven)

    const result = await Promise.all(
      ['', null, undefined].map(value => isValidSignedVerifiableClaim({ ...signedWorkClaim, issuanceDate: value })),
    )

    assert({
      given: 'a claim with an invalid issuanceDate',
      should: 'return false',
      actual: result,
      expected: [false, false, false],
    })
  }
})
