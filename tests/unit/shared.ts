/* tslint:disable:no-relative-imports */
import {
  BaseVerifiableClaim,
  ClaimContext,
  ClaimType,
  DefaultClaimContext,
  DefaultIdentityClaimContext,
  DefaultWorkClaimContext,
  Identity,
  SignedVerifiableClaim,
  SigningAlgorithm,
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
  const issuer = Ed25519TheRaven.issuer
  const issuanceDate = '2017-12-11T22:54:40.261Z'
  return {
    '@context': context,
    issuer,
    issuanceDate,
    type,
    claim,
  }
}

const workContext = {
  ...DefaultClaimContext,
  ...DefaultWorkClaimContext,
}

const ed25519Base58PublicKey = 'JAi9YoyDdgBQLenyVzoXWH4C26wKMzHrjertxVrjLWTe'
export const ed25519Base58PrivateKey: string =
  'LWgo1jraJrCB2QT64UVgRemepsNopBF3eJaYMPYVTxpEoFx7sSzCb1QysHeJkH2fnGFgHirgVR35Hz5A1PpXuH6'

export const rsaPemPrivateKey =
  '-----BEGIN RSA PRIVATE KEY-----\r\n' +
  'MIIEpAIBAAKCAQEAjKaGI9riNPd87dly3nvh2ISSB2i9MVO02nVsfzD+D1kahe/m\r\n' +
  'QMgwwwobs9ArkurFqs4j3fwbSPlRU7F/dPonyrQTMgKGN+jyNV4fGRI16lFbPTKk\r\n' +
  'asRpB9fQ2InIHZkIpUyZHwJYMS1xf8zdtM1ip1Brevhw8w6QtPIhFMgebWJ2Lhan\r\n' +
  'jwZhgyhAQtO0FkUgdSegolRcrFf1cEaDVEUc2kcJVnLpExN1VLpE4Vnby4ZrNA0r\r\n' +
  '5NgmCPMx15Fp/Vw6v8H1w+kSmgHAWzRlmhUHlKCGtvEnKkpFfoWJcn59HotofR6k\r\n' +
  '4LD/pkrNWtfRQIaup8N15lNyY5Pjxni7RE/qmQIDAQABAoIBAAmQtaSwmRuzDRr7\r\n' +
  '49T/pc9czLWWSO+W2sDUpYlM4qpWi/g55XXYZ4CMKnAjIyN9te200TmikJR46DAB\r\n' +
  '7UIeVSBy+K84/rnErNw2R3UkCOijmcnirM3aB66R3dEsJaDlrHHZcLxsI2VMyuA/\r\n' +
  'JYDLSv9H99dIGB5fijXUFa3dIjycEE/IMFycy/Z9DwwPwzNAvuFzYNuSZ7Ba3QMw\r\n' +
  'FjVyI1jzOKny7LSQDM9CQhzv1loXpQxdRkDBDS94boSAZRbwK9636dN4xYkv6Yx9\r\n' +
  'eNGD9d9cWObGqiDntj8EIf2uKd+gW+gUjdEmLBgRM1dUO4AJ49y4zRBWQUjOcJJ0\r\n' +
  'YPoi8dUCgYEA5wgOWxgeu4eU4Q9QM6X6TE9IhIayvldHwuJWSHUjP0F0ZJJOyn/s\r\n' +
  'ntD8mrp70y3VxXjeoC64GQZI7TPPN1dSghcK3R6483l1pOxHHsUFcR/cVI321aYT\r\n' +
  'q7N6j3WInB90Hsw0cCP4uoAy5qFFHLSZIGPQwf++m2kl3ST3LA7xIfcCgYEAm9nm\r\n' +
  'Drr1oVBaP30aNAuqHDiU0zjo04iNntJXTtRQZuzvurKWukKyC68o7966do5MAiXh\r\n' +
  '8h8L5MYl0UBIDR9jkKGa+lp8DciG5T8UfStJoo6ZyrUmm8Av/JoG1zEMMLtqfAnq\r\n' +
  'upWMQkNepB/HgBcidinytw1GsFGxjQqQAki7M+8CgYEAvjS/vPfKtZIWXISC/0Kz\r\n' +
  'I4hSp+lN1698AVLevqDR+A4niXV7MPTJFqfwkGLf9ylRSlcM0swj/VZTTBbPjzxx\r\n' +
  'TXEzHIFiu/FPjgyJMSf8JvqYJ3UJtzQYFdCaIuodIowyyfhNY9X5vXI2dfJoOA3n\r\n' +
  '0+bZxB6OCt0yszLv3HIgzFkCgYEAgP2t/Y8b8bGxoE6Iu37UApuKAfBeM4YXwNXS\r\n' +
  '0TnEegusttdNDUhaWHVW6oFrzugjXLvB8EVl8KlXb4NGnyXVoEVBIeh2OGo5y8+T\r\n' +
  'w61qOpLQEwgvtkUw8l8BPmYn8sWLcrI6hsdz2PwtfqWW1xtOuIIrkvn4AcL7swKF\r\n' +
  'An70Ah0CgYATjmy0e7UxZ0kquqdAFqPDtURcC7jGrjqE9TMfyfctKmcc+rhvfd1T\r\n' +
  'RklPrURV0qb1hEh0X9iEbzQhfHawfyVqHR+ihJM4h4IF8qhEAQXhrpSBaJi7NQxq\r\n' +
  '3ZMJNx34XdSGdpvCJtu3XzbqMbjDnGw7Qa65xeK7ygHFzObG0lS4+w==\r\n' +
  '-----END RSA PRIVATE KEY-----\r\n'

const ed25519Issuer = createIssuerFromPrivateKey(ed25519Base58PrivateKey)
const rsaIssuer = createIssuerFromPrivateKey(rsaPemPrivateKey, SigningAlgorithm.RsaSignature2018)

const rsaSigProof = {
  'sec:proof': {
    '@graph': {
      '@type': 'sec:RsaSignature2018',
      'dc:created': {
        '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
        '@value': '2018-10-08T20:03:24Z',
      },
      'dc:creator': {
        '@id':
          'data:;base64,eyJhbGdvcml0aG0iOiJSc2FTaWduYXR1cmUyMDE4IiwicHVibGljS2V5IjoiLS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS1cclxuTUlJQklqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FROEFNSUlCQ2dLQ0FRRUFqS2FHSTlyaU5QZDg3ZGx5M252aFxyXG4ySVNTQjJpOU1WTzAyblZzZnpEK0Qxa2FoZS9tUU1nd3d3b2JzOUFya3VyRnFzNGozZndiU1BsUlU3Ri9kUG9uXHJcbnlyUVRNZ0tHTitqeU5WNGZHUkkxNmxGYlBUS2thc1JwQjlmUTJJbklIWmtJcFV5Wkh3SllNUzF4Zjh6ZHRNMWlcclxucDFCcmV2aHc4dzZRdFBJaEZNZ2ViV0oyTGhhbmp3WmhneWhBUXRPMEZrVWdkU2Vnb2xSY3JGZjFjRWFEVkVVY1xyXG4ya2NKVm5McEV4TjFWTHBFNFZuYnk0WnJOQTByNU5nbUNQTXgxNUZwL1Z3NnY4SDF3K2tTbWdIQVd6UmxtaFVIXHJcbmxLQ0d0dkVuS2twRmZvV0pjbjU5SG90b2ZSNms0TEQvcGtyTld0ZlJRSWF1cDhOMTVsTnlZNVBqeG5pN1JFL3FcclxubVFJREFRQUJcclxuLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0tXHJcbiJ9',
      },
      'sec:jws':
        'eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..OoOrMRs-s_rhrtEbcyHFmGlerQqfq1fzXJC-lXTtYoKhGcc-V5xeHbOFnotdj9UZTjtj66yObmM4MvAv5y3mBOXcCQ5akBigxGk6ECzNV23h8vj9r221PCwEP4dPushwW0RYS2d_80ymsztenyU9Z9iCOXc4GMNBzVbeALhbYLt0BssqR0SHJFtNbh4NE81VDZs97jdR-DzFyZHLF9N_b0ANbzJv95_w9cOax08YMlY_vF-XdGtFfSNgxC_-f_z2lag3oen4VhRbtk-FrSCFehWRX5oRlwUy5rcXWvGLZdVX74SuXuP1oLk5xc1mqCrSe3jEMK_a-__wfelzSV4ZFQ',
      'sec:nonce': 'cjn0q4sbj0003rhc91v7649xh',
    },
  },
}

export const MyIdentity: Identity = {
  '@context': { ...DefaultClaimContext, ...DefaultIdentityClaimContext },
  id: '2b28274e3e88304f7baacec37c9959f8b237955c4e242f882150090b033966f4',
  type: ClaimType.Identity,
  issuer: ed25519Issuer,
  issuanceDate: '2017-11-13T15:00:00.000Z',
  claim: {
    publicKey: ed25519Base58PublicKey,
  },
}

export const TheRavenClaim: object = {
  name: 'The Raven',
  author: 'Edgar Allan Poe',
  tags: 'poem',
  dateCreated: '',
  copyrightHolder: ed25519Issuer,
  license: 'https://creativecommons.org/licenses/by/2.0/',
  datePublished: '1845-01-29T03:00:00.000Z',
  hash: 'de1c818f9be211a78dff90a03b9e297bbb61b3c292f1c1bbc3a5283e9b203cb1',
  archiveUrl: 'ipfs:/theRaven',
  canonicalUrl: 'https://amazon.com/Ed25519TheRaven',
}

export const BaseEd25519RavenClaim: BaseVerifiableClaim = {
  '@context': workContext,
  type: ClaimType.Work,
  issuer: ed25519Issuer,
  issuanceDate: '2017-11-13T15:00:00.000Z',
  claim: TheRavenClaim,
}

export const BaseRsaRavenClaim: BaseVerifiableClaim = {
  '@context': workContext,
  type: ClaimType.Work,
  issuer: rsaIssuer,
  issuanceDate: '2017-11-13T15:00:00.000Z',
  claim: TheRavenClaim,
}

export const Ed25519TheRaven: Work = {
  ...BaseEd25519RavenClaim,
  id: '04369f7eca0c8b8bdd4f13392e64caf66724bc8b3f6e4a043c34be466619f976',
}

export const RsaTheRaven: Work = {
  ...BaseRsaRavenClaim,
  id: 'baa06c1f301d3425bf46de18e044dce609620e7c34d7a68e9fb06093c038c1e9',
}

export const Ed25519SignedRaven: SignedVerifiableClaim = {
  '@context': workContext,
  id: 'a2f3975a47ed18cd2cdaa2e31c04ca4a3b1256ad0711d98d5fdae1ae31440cf5',
  type: ClaimType.Work,
  issuer:
    'data:;base64,eyJhbGdvcml0aG0iOiJFZDI1NTE5U2lnbmF0dXJlMjAxOCIsInB1YmxpY0tleSI6IkpBaTlZb3lEZGdCUUxlbnlWem9YV0g0QzI2d0tNekhyamVydHhWcmpMV1RlIn0=',
  issuanceDate: '2018-10-09T19:06:06.508Z',
  claim: {
    name: 'The Raven',
    author: 'Edgar Allan Poe',
    tags: 'poem',
    dateCreated: '',
    copyrightHolder:
      'data:;base64,eyJhbGdvcml0aG0iOiJFZDI1NTE5U2lnbmF0dXJlMjAxOCIsInB1YmxpY0tleSI6IkpBaTlZb3lEZGdCUUxlbnlWem9YV0g0QzI2d0tNekhyamVydHhWcmpMV1RlIn0=',
    license: 'https://creativecommons.org/licenses/by/2.0/',
    datePublished: '1845-01-29T03:00:00.000Z',
    hash: 'de1c818f9be211a78dff90a03b9e297bbb61b3c292f1c1bbc3a5283e9b203cb1',
    archiveUrl: 'ipfs:/theRaven',
    canonicalUrl: 'https://amazon.com/Ed25519TheRaven',
  },
  'sec:proof': {
    '@graph': {
      '@type': 'sec:Ed25519Signature2018',
      'dc:created': {
        '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
        '@value': '2018-10-09T19:06:06Z',
      },
      'dc:creator': {
        '@id':
          'data:;base64,eyJhbGdvcml0aG0iOiJFZDI1NTE5U2lnbmF0dXJlMjAxOCIsInB1YmxpY0tleSI6IkpBaTlZb3lEZGdCUUxlbnlWem9YV0g0QzI2d0tNekhyamVydHhWcmpMV1RlIn0=',
      },
      'sec:jws':
        'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..SjLCvnnaKXATF1LUyAtJDFvu8SmqrVSqpW2j4kUEw1fgsegDy2APfeeNxSa4bR4egeSs_1UXI380f7BW5JURAQ',
      'sec:nonce': 'cjn23ixwu0000stc9dufk76i1',
    },
  },
}

export const RsaSignedRaven: SignedVerifiableClaim = {
  ...RsaTheRaven,
  ...rsaSigProof,
}

export const externalContext: any = {
  claim: 'http://schema.org/Book',
  edition: 'http://schema.org/bookEdition',
  isbn: 'http://schema.org/isbn',
}

export const TheRavenBookClaim = {
  ...TheRavenClaim,
  edition: '1',
  isbn: '9781458318404',
  contributors: [ed25519Issuer],
}

export const TheRavenBook: Work = {
  ...Ed25519TheRaven,
  claim: TheRavenBookClaim,
}
