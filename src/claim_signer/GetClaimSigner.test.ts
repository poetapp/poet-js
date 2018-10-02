/* tslint:disable:no-relative-imports */
import { describe } from 'riteway'

import { getErrorMessage, validClaimSigner, TheRaven } from '../../tests/unit/shared'

describe('getClaimSigner.signClaim', async (should: any) => {
  const { assert } = should('')

  {
    const expected = 'Cannot sign a claim that has an empty .id field.'

    assert({
      given: 'a claim without id',
      should: `throw an error with the message ${expected}`,
      actual: await validClaimSigner.signClaim({ ...TheRaven, id: '' }).catch(getErrorMessage),
      expected,
    })
  }

  {
    const expected = 'Cannot sign a claim whose id has been altered or generated incorrectly.'

    assert({
      given: 'a claim with an altered id',
      should: `throw an error with the message ${expected}`,
      actual: await validClaimSigner
        .signClaim({ ...TheRaven, id: 'be81cc75bcf6ca0f1fdd356f460e6ec920ba36ec78bd9e70c4d04a19f8943102' })
        .catch(getErrorMessage),
      expected,
    })
  }
})
