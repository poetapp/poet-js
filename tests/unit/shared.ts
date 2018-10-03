/* tslint:disable:no-relative-imports */
import { ClaimType, Work } from '../../src/Interfaces'
import { getClaimSigner } from '../../src/claim_signer/GetClaimSigner'

export const getErrorMessage = (err: Error): string => err.message

export const makeClaim = (claim: object) => {
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

export const testPrivateKeyEd25519Base58: string =
  'LWgo1jraJrCB2QT64UVgRemepsNopBF3eJaYMPYVTxpEoFx7sSzCb1QysHeJkH2fnGFgHirgVR35Hz5A1PpXuH6'

export const validClaimSigner = getClaimSigner()
const { getIssuerId } = validClaimSigner

export const TheRaven: Work = {
  id: '01a2ca357d8cac322e55d4ec2f6c4d80bdcd3676c6fe8ef7376210bd531f8dac',
  type: ClaimType.Work,
  issuer: validClaimSigner.getIssuerId(testPrivateKeyEd25519Base58),
  issuanceDate: '2017-11-13T15:00:00.000Z',
  claim: {
    name: 'The Raven',
    author: 'Edgar Allan Poe',
    tags: 'poem',
    dateCreated: '',
    copyrightHolder: validClaimSigner.getIssuerId(testPrivateKeyEd25519Base58),
    license: 'https://creativecommons.org/licenses/by/2.0/',
    datePublished: '1845-01-29T03:00:00.000Z',
    hash: 'de1c818f9be211a78dff90a03b9e297bbb61b3c292f1c1bbc3a5283e9b203cb1',
    archiveUrl: 'ipfs:/theRaven',
    canonicalUrl: 'https://amazon.com/TheRaven',
  },
  'sec:proof': {
    '@graph': {
      '@type': 'sec:Ed25519Signature2018',
      'http://purl.org/dc/terms/created': {
        '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
        '@value': '2018-09-05T20:19:20Z',
      },
      'http://purl.org/dc/terms/creator': {
        '@id': validClaimSigner.getIssuerId(testPrivateKeyEd25519Base58),
      },
      'https://w3id.org/security#jws':
        'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..TSHkMOwbWZvIp8Hd-MyebaMgItf4Iyl3dgUSlHBBlnidw' +
        'gzo084pGpKmbOewYFrXfmAVhXnC4UPzaPUjaU9BDw',
    },
  },
}

export const TheRavenBook: Work = {
  ...TheRaven,
  claim: {
    ...TheRaven.claim,
    edition: '1',
    isbn: '9781458318404',
    contributors: [getIssuerId(testPrivateKeyEd25519Base58)],
  },
}

export const externalContext: any = {
  claim: 'http://schema.org/Book',
  edition: 'http://schema.org/bookEdition',
  isbn: 'http://schema.org/isbn',
}
