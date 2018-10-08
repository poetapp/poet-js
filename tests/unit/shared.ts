/* tslint:disable:no-relative-imports */
import {
  BaseVerifiableClaim,
  ClaimContext,
  ClaimType,
  DefaultClaimContext,
  DefaultWorkClaimContext,
  Identity,
  SignedVerifiableClaim,
  Work,
} from '../../src/Interfaces'
import { getVerifiableClaimSigner } from '../../src/VerifiableClaimSigner'
import { createIssuerFromPrivateKey } from '../../src/util/KeyHelper'

export const claimSigner = getVerifiableClaimSigner()

export const getErrorMessage = (err: Error): string => err.message

export const makeClaim = (
  claim: object,
  type: ClaimType = ClaimType.Work,
  context: ClaimContext = DefaultClaimContext
): BaseVerifiableClaim => {
  const issuer = TheRaven.issuer
  const issuanceDate = '2017-12-11T22:54:40.261Z'
  return {
    '@context': context,
    issuer,
    issuanceDate,
    type,
    claim,
  }
}

const publicKey = 'JAi9YoyDdgBQLenyVzoXWH4C26wKMzHrjertxVrjLWTe'
export const testBadPublicKey: string = 'JAi9YoyDdgBQLenyVzoXWH4C26wKMzHrjertxVrjLWT5'

export const testPrivateKeyEd25519Base58: string =
  'LWgo1jraJrCB2QT64UVgRemepsNopBF3eJaYMPYVTxpEoFx7sSzCb1QysHeJkH2fnGFgHirgVR35Hz5A1PpXuH6'

const issuer = createIssuerFromPrivateKey(testPrivateKeyEd25519Base58)

const sigProof = {
  'sec:proof': {
    '@graph': {
      '@type': 'sec:Ed25519Signature2018',
      'http://purl.org/dc/terms/created': {
        '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
        '@value': '2018-09-05T20:19:20Z',
      },
      'http://purl.org/dc/terms/creator': {
        '@id': issuer,
      },
      'https://w3id.org/security#jws':
        'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..TSHkMOwbWZvIp8Hd-MyebaMgItf4Iyl3dgUSlHBBlnidw' +
        'gzo084pGpKmbOewYFrXfmAVhXnC4UPzaPUjaU9BDw',
    },
  },
}

export const MyIdentity: Identity = {
  '@context': { ...DefaultClaimContext },
  id: '2b28274e3e88304f7baacec37c9959f8b237955c4e242f882150090b033966f4',
  type: ClaimType.Identity,
  issuer,
  issuanceDate: '2017-11-13T15:00:00.000Z',
  claim: {
    publicKey,
  },
}

export const TheRavenClaim: object = {
  name: 'The Raven',
  author: 'Edgar Allan Poe',
  tags: 'poem',
  dateCreated: '',
  copyrightHolder: issuer,
  license: 'https://creativecommons.org/licenses/by/2.0/',
  datePublished: '1845-01-29T03:00:00.000Z',
  hash: 'de1c818f9be211a78dff90a03b9e297bbb61b3c292f1c1bbc3a5283e9b203cb1',
  archiveUrl: 'ipfs:/theRaven',
  canonicalUrl: 'https://amazon.com/TheRaven',
}

export const BaseRavenClaim: BaseVerifiableClaim = {
  '@context': { ...DefaultClaimContext, ...DefaultWorkClaimContext },
  type: ClaimType.Work,
  issuer,
  issuanceDate: '2017-11-13T15:00:00.000Z',
  claim: TheRavenClaim,
}

export const TheRaven: Work = {
  ...BaseRavenClaim,
  id: 'baa06c1f301d3425bf46de18e044dce609620e7c34d7a68e9fb06093c038c1e9',
}

export const SignedRaven: SignedVerifiableClaim = {
  ...TheRaven,
  ...sigProof,
}

export const externalContext: any = {
  claim: 'http://schema.org/Book',
  edition: 'http://schema.org/bookEdition',
  isbn: 'http://schema.org/isbn',
}

export const TheRavenBook: Work = {
  ...TheRaven,
  claim: {
    ...TheRaven.claim,
    edition: '1',
    isbn: '9781458318404',
    contributors: [issuer],
  },
}

export const TheRavenBookWithFullContext: Work = {
  ...TheRavenBook,
  '@context': { ...TheRavenBook['@context'], ...externalContext },
}
