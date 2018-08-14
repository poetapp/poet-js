/* tslint:disable:no-relative-imports */
import { describe } from 'riteway'

import { throwError, InsightError, BlockHeightOutOfRangeError } from './Insight'

describe('throwError', async (should: any) => {
  const { assert } = should()

  {
    const error = () => {
      try {
        return throwError('random')
      } catch (e) {
        return e
      }
    }

    assert({
      given: 'random string',
      should: 'throw new InsightError with random string',
      actual: error(),
      expected: new InsightError('random'),
    })
  }
  {
    const error = () => {
      try {
        return throwError('Block height out of range. Code:-8')
      } catch (e) {
        return e
      }
    }

    assert({
      given: 'Block height out of range. Code:-8',
      should: 'throw new BlockHeightOutOfRangeError',
      actual: error(),
      expected: new BlockHeightOutOfRangeError(),
    })
  }
})
