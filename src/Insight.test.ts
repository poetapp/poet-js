/* tslint:disable:no-relative-imports */
import { describe, Try } from 'riteway'

import { throwError, InsightError, BlockHeightOutOfRangeError } from './Insight'

describe('throwError', async (should: any) => {
  const { assert } = should()

  assert({
    given: 'random string',
    should: 'throw new InsightError with random string',
    actual: Try(throwError, 'random'),
    expected: new InsightError('random'),
  })

  assert({
    given: 'Block height out of range. Code:-8',
    should: 'throw new BlockHeightOutOfRangeError',
    actual: Try(throwError, 'Block height out of range. Code:-8'),
    expected: new BlockHeightOutOfRangeError(),
  })
})
