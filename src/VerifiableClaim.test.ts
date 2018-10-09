/* tslint:disable:no-relative-imports */
import { describe } from 'riteway'

import {
  BaseEd25519RavenClaim,
  externalContext,
  getErrorMessage,
  makeClaim,
  MyIdentity,
  ed25519Base58PrivateKey,
  Ed25519TheRaven,
  TheRavenBook,
  TheRavenClaim,
} from '../tests/unit/shared'
import { BaseVerifiableClaim, isVerifiableClaim, SigningAlgorithm } from './Interfaces'
import { configureCreateVerifiableClaim, generateClaimId } from './VerifiableClaim'
import { createIssuerFromPrivateKey, generateRsaKeyPems } from './util/KeyHelper'

const ravenClaim: any = { ...Ed25519TheRaven.claim }

const ravenBookClaim: any = { ...TheRavenBook.claim }

describe('VerifiableClaim.generateClaimId', async (assert: any) => {
  {
    assert({
      given: 'a claim id',
      should: 'be equal to the work id',
      actual: await generateClaimId(Ed25519TheRaven).catch(getErrorMessage),
      expected: Ed25519TheRaven.id,
    })
  }

  {
    const id = await generateClaimId({ ...BaseEd25519RavenClaim, issuanceDate: '2017-09-13T15:00:00.000Z' }).catch(
      getErrorMessage
    )

    assert({
      given: 'a claim with extra dateCreated, the new dateCreated',
      should: 'be included in the calculation of the id and should be not equal to the work id',
      actual: id !== Ed25519TheRaven.id,
      expected: true,
    })
  }

  {
    const work1: BaseVerifiableClaim = makeClaim({
      name: ravenClaim.name,
      author: ravenClaim.author,
    })

    const work2: BaseVerifiableClaim = makeClaim({
      author: ravenClaim.author,
      name: ravenClaim.name,
    })

    const id1 = await generateClaimId(work1).catch(getErrorMessage)
    const id2 = await generateClaimId(work2).catch(getErrorMessage)

    assert({
      given: 'two claims with disordered keys',
      should: 'have the same claims id',
      actual: id1 === id2,
      expected: true,
    })
  }

  {
    const work1: BaseVerifiableClaim = makeClaim({
      name: ravenClaim.name,
      author: ravenClaim.author,
    })

    const work2: BaseVerifiableClaim = makeClaim({
      author: ravenClaim.author,
      nAME: ravenClaim.name,
      dateCreated: ravenClaim.dateCreated,
      datePublished: ravenClaim.datePublished,
    })

    const id1 = await generateClaimId(work1).catch(getErrorMessage)
    const id2 = await generateClaimId(work2).catch(getErrorMessage)

    assert({
      given: 'two claims with different keys casing',
      should: 'NOT have the same claims id',
      actual: id1 !== id2,
      expected: true,
    })
  }

  {
    const workClaim = makeClaim({
      name: ravenClaim.name,
      author: ravenClaim.author,
    })

    const TheRavenId = '9bd16701a14884f129625f399ddad0b956b7883a5ef30142d0cda28f38988eca'

    assert({
      given: 'A work claim',
      should: 'generate an id for the claim',
      actual: await generateClaimId(workClaim),
      expected: TheRavenId,
    })

    const identityClaim = makeClaim({ ...MyIdentity.claim })

    assert({
      given: 'an verifiable identity claim',
      should: 'generate an id for the claim',
      actual: await generateClaimId(identityClaim),
      expected: 'b609122e7988bf3e9a4fd7b4336748bce1ae7134a7317e7009661c6936d55722',
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
      actual: await generateClaimId(workClaim2),
      expected: TheRavenId,
    })

    assert({
      given: 'an extended work claim WITH proper context',
      should: 'generate a different id',
      actual: (await generateClaimId({ ...workClaim2, '@context': externalContext })) !== TheRavenId,
      expected: true,
    })
  }
})

describe('Claim.configureCreateVerifiableClaim with Ed25519 Issuer', async (assert: any) => {
  {
    const issuer = createIssuerFromPrivateKey(ed25519Base58PrivateKey)
    const createWorkClaim = configureCreateVerifiableClaim({ issuer })
    const verifiableClaim = await createWorkClaim(TheRavenClaim)

    assert({
      given: 'a claim',
      should: 'create a Verifiable Claim',
      actual: isVerifiableClaim(verifiableClaim),
      expected: true,
    })
  }
})

describe('Claim.configureCreateVerifiableClaim with RSA Issuer', async (assert: any) => {
  {
    const rsaPrivateKeyPem = generateRsaKeyPems().privateKey
    const issuer = createIssuerFromPrivateKey(rsaPrivateKeyPem, SigningAlgorithm.RsaSignature2018)
    const createWorkClaim = configureCreateVerifiableClaim({ issuer })
    const verifiableClaim = await createWorkClaim(TheRavenClaim)

    assert({
      given: 'a claim',
      should: 'create a Verifiable Claim',
      actual: isVerifiableClaim(verifiableClaim),
      expected: true,
    })
  }
})
