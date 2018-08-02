/* tslint:disable:no-relative-imports */
import { describe } from 'riteway'
import { Claim, ClaimAttributes, ClaimType, Work } from './Interfaces'
import { Serialization } from './Serialization'

const TheRaven: Work = {
  id: '1bb5e7959c7cb28936ec93eb6893094241a5bc396f08845b4f52c86034f0ddf8',
  publicKey: '02badf4650ba545608242c2d303d587cf4f778ae3cf2b3ef99fbda37555a400fd2',
  signature:
    '3045022100e020a7ffeffa5d40ffde618c6c861678e38de69fd377028ec57ad93893883b3702201f085284a9064bab7e1cd39349e65d136d8f67e4b6b897c3e7db6b400ed91034',
  type: ClaimType.Work,
  dateCreated: new Date('2017-11-13T15:00:00.000Z'),
  attributes: {
    name: 'The Raven',
    author: 'Edgar Allan Poe',
    tags: 'poem',
    dateCreated: '',
    datePublished: '1845-01-29T03:00:00.000Z',
    content: 'Once upon a midnight dreary...',
  },
}

const TheRavenHex =
  '0a201bb5e7959c7cb28936ec93eb6893094241a5bc396f08845b4f52c86034f0ddf8122102badf4650ba545608242c2d303d587cf4f778ae3cf2b3ef99fbda37555a400fd21a473045022100e020a7ffeffa5d40ffde618c6c861678e38de69fd377028ec57ad93893883b3702201f085284a9064bab7e1cd39349e65d136d8f67e4b6b897c3e7db6b400ed910342204576f726b2880db93affb2b32190a06617574686f72120f456467617220416c6c616e20506f6532290a07636f6e74656e74121e4f6e63652075706f6e2061206d69646e69676874206472656172792e2e2e320f0a0b6461746563726561746564120032290a0d646174657075626c69736865641218313834352d30312d32395430333a30303a30302e3030305a32110a046e616d65120954686520526176656e320c0a04746167731204706f656d'

/**
 * Simple function to help editing a Claim's attributes in an immutable fashion.
 * TODO: support generics once https://github.com/Microsoft/TypeScript/issues/10727 is fixed.
 */
const editAttributes = (claim: Claim, attributes: ClaimAttributes): Claim => {
  return {
    ...claim,
    attributes: {
      ...claim.attributes,
      ...attributes,
    },
  }
}

describe('Serialization', async (should: any) => {
  const { assert } = should('')

  {
    const serializedClaim = Serialization.claimToHex(TheRaven)

    assert({
      given: 'a serializated Claim',
      should: 'be equal to TheRavenHex',
      actual: serializedClaim,
      expected: TheRavenHex,
    })
  }

  {
    const serializedClaim = Serialization.claimToHex(
      editAttributes(TheRaven, {
        name: 'Nevermore',
      })
    )

    assert({
      given: 'a serialized Claim with attributes changed',
      should: 'be not equal to TheRavenHex',
      actual: serializedClaim !== TheRavenHex,
      expected: true,
    })
  }

  {
    const serializedClaim = Serialization.claimToHex(
      editAttributes(TheRaven, {
        author: 'E.A.P.',
      })
    )

    assert({
      given: 'a serialized Claim with attributes changed',
      should: 'be not equal to TheRavenHex',
      actual: serializedClaim !== TheRavenHex,
      expected: true,
    })
  }

  {
    const serializedClaim = Serialization.claimToHex(
      editAttributes(TheRaven, {
        dateCreated: new Date().toISOString(),
      })
    )

    assert({
      given: 'a serialized Claim with attributes changed',
      should: 'be not equal to TheRavenHex',
      actual: serializedClaim !== TheRavenHex,
      expected: true,
    })
  }

  {
    const serializedClaim = Serialization.claimToHex(
      editAttributes(TheRaven, {
        id: 'X' + TheRaven.id.slice(1),
      })
    )

    assert({
      given: 'a serialized Claim with different id',
      should: 'be not equal to TheRavenHex',
      actual: serializedClaim !== TheRavenHex,
      expected: true,
    })
  }

  {
    const serializedClaim = Serialization.claimToHex(
      editAttributes(TheRaven, {
        publicKey: 'a' + TheRaven.publicKey.slice(1),
      })
    )

    assert({
      given: 'a serialized Claim with different publicKey',
      should: 'be not equal to TheRavenHex',
      actual: serializedClaim !== TheRavenHex,
      expected: true,
    })
  }

  {
    const serializedClaim = Serialization.claimToHex(
      editAttributes(TheRaven, {
        signature: 'b' + TheRaven.signature.slice(1),
      })
    )

    assert({
      given: 'a serialized Claim with different signature',
      should: 'be not equal to TheRavenHex',
      actual: serializedClaim !== TheRavenHex,
      expected: true,
    })
  }

  {
    const serializedClaim = Serialization.claimToHex(
      editAttributes(TheRaven, {
        type: 'Asd' as ClaimType,
      })
    )

    assert({
      given: 'a serialized Claim with different type',
      should: 'be not equal to TheRavenHex',
      actual: serializedClaim !== TheRavenHex,
      expected: true,
    })
  }

  {
    const serializedClaim = Serialization.claimToHex({
      ...TheRaven,
      dateCreated: new Date(),
    })

    assert({
      given: 'a serialized Claim with different dateCreated',
      should: 'be not equal to TheRavenHex',
      actual: serializedClaim !== TheRavenHex,
      expected: true,
    })
  }

  {
    const work = Serialization.hexToClaim(TheRavenHex)

    assert({
      given: `a Hex of Claim to 'hexToClaim'`,
      should: 'be the ids equals',
      actual: TheRaven.id === work.id,
      expected: true,
    })
  }

  {
    const work = Serialization.hexToClaim(TheRavenHex)

    assert({
      given: `a Hex of Claim to 'hexToClaim'`,
      should: 'be the publicKeys equals',
      actual: TheRaven.publicKey === work.publicKey,
      expected: true,
    })
  }

  {
    const work = Serialization.hexToClaim(TheRavenHex)

    assert({
      given: `a Hex of Claim to 'hexToClaim'`,
      should: 'be the signatures equals',
      actual: TheRaven.signature === work.signature,
      expected: true,
    })
  }

  {
    const work = Serialization.hexToClaim(TheRavenHex)

    assert({
      given: `a Hex of Claim to 'hexToClaim'`,
      should: 'be the types equals',
      actual: TheRaven.type === work.type,
      expected: true,
    })
  }

  {
    const work = Serialization.hexToClaim(TheRavenHex)

    assert({
      given: `a Hex of Claim to 'hexToClaim'`,
      should: 'be the dateCreated equals',
      actual: TheRaven.dateCreated.getTime() === work.dateCreated.getTime(),
      expected: true,
    })
  }
})
