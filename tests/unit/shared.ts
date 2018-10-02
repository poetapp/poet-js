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

export const validClaimSigner = getClaimSigner(testPrivateKeyEd25519Base58)

export const TheRaven: Work = {
  id: '996efc4bd089f62e596f3c2c15bda3002d45540481df3be2c11192a6963ee8a7',
  type: ClaimType.Work,
  issuer: validClaimSigner.getIssuerId(),
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
        '@id': validClaimSigner.getIssuerId(),
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
  },
}

export const externalContext: any = {
  claim: 'http://schema.org/Book',
  edition: 'http://schema.org/bookEdition',
  isbn: 'http://schema.org/isbn',
}
