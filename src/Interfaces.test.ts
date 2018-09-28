/* tslint:disable:no-relative-imports */
import { describe } from 'riteway'
import { ClaimType, Identity, isClaim, isIdentity, isWork, Work } from './Interfaces'

const signatureBlock = {
  '@graph': {
    '@type': 'https://w3id.org/security#Ed25519Signature2018',
    created: {
      '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
      '@value': '2018-09-05T20:19:20Z',
    },
    'http://purl.org/dc/terms/creator': {
      '@id': 'po.et://entities/1bb5e7959c7cb28936ec93eb6893094241a5bc396f08845b4f52c86034f0ddf8',
    },
    'https://w3id.org/security#jws':
      'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..neh08G8ljeqeEnqqPS06tgV7OGrlVRDa6ZfidRy8cGztWX9QbzwYz5VXtdO8SLy-H8alKeRiwGy67Q_QyEtuCg',
  },
}

const TheRaven: Work = {
  id: '1bb5e7959c7cb28936ec93eb6893094241a5bc396f08845b4f52c86034f0ddf8',
  issuer: 'po.et://entities/1bb5e7959c7cb28936ec93eb6893094241a5bc396f08845b4f52c86034f0ddf8',
  type: ClaimType.Work,
  issuanceDate: '2017-11-13T15:00:00.000Z',
  claim: {
    name: 'The Raven',
    author: 'Edgar Allan Poe',
    keywords: 'poem',
    dateCreated: '',
    datePublished: '1845-01-29T03:00:00.000Z',
    text: 'Once upon a midnight dreary...',
  },
  'https://w3id.org/security#proof': signatureBlock,
}

const Me: Identity = {
  id: '1bb5e7959c7cb28936ec93eb6893094241a5bc396f08845b4f52c86034f0ddf8',
  issuer: 'did:po.et:1bb5e7959c7cb28936ec93eb6893094241a5bc396f08845b4f52c86034f0ddf8',
  type: ClaimType.Identity,
  issuanceDate: '2017-11-13T15:00:00.000Z',
  claim: {
    publicKey: '02badf4650ba545608242c2d303d587cf4f778ae3cf2b3ef99fbda37555a400fd2',
  },
  'https://w3id.org/security#proof': signatureBlock,
}

const InvalidClaim = {
  id: '1bb5e7959c7cb28936ec93eb6893094241a5bc396f08845b4f52c86034f0ddf8',
  signature:
    '3045022100e020a7ffeffa5d40ffde618c6c861678e38de69fd377028ec57ad93893883b3702201f085284a9064bab7e1cd39349e65d136d8f67e4b6b897c3e7db6b400ed91034',
  type: ClaimType.Identity,
  created: '2017-11-13T15:00:00.000Z',
  attributes: {
    publicKey: '02badf4650ba545608242c2d303d587cf4f778ae3cf2b3ef99fbda37555a400fd2',
  },
}

describe('Interfaces.isClaim', async (should: any) => {
  const { assert } = should('')

  {
    assert({
      given: 'a valid claim',
      should: 'return true',
      actual: isClaim(TheRaven),
      expected: true,
    })

    assert({
      given: 'an invalid claim, isClaim',
      should: 'return false',
      actual: isClaim(InvalidClaim),
      expected: false,
    })
  }

  {
    assert({
      given: 'a valid Identity claim, isClaim',
      should: 'return true',
      actual: isClaim(Me),
      expected: true,
    })
  }

  {
    assert({
      given: 'a valid claim with a context',
      should: 'return true',
      actual: isClaim(TheRaven),
      expected: true,
    })
  }

  ;['', false, null, undefined].forEach(value => {
    {
      assert({
        given: 'a claim with an invalid date',
        should: `return false`,
        actual: isClaim({ ...TheRaven, created: value }),
        expected: false,
      })
    }
  })
})

describe('Interfaces.isIdentity', async (should: any) => {
  const { assert } = should('')

  {
    assert({
      given: 'a valid Identity claim',
      should: 'return true',
      actual: isIdentity(Me),
      expected: true,
    })

    assert({
      given: 'a valid Work claim',
      should: 'return false',
      actual: isIdentity(TheRaven),
      expected: false,
    })
  }
})

describe('Interfaces.isWork', async (should: any) => {
  const { assert } = should('')

  {
    assert({
      given: 'a valid Work claim',
      should: 'return true',
      actual: isWork(TheRaven),
      expected: true,
    })
  }

  {
    assert({
      given: 'a valid Identity Claim',
      should: 'return false',
      actual: isWork(Me),
      expected: false,
    })
  }
})
