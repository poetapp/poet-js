/* tslint:disable:no-relative-imports */
import { describe, Try } from 'riteway'

import {
  responseNotOk,
  isNotArray,
  UnexpectedResponseError,
  throwError,
  InsightError,
  BlockHeightOutOfRangeError,
} from './Insight'

describe('responseNotOk()', async (should: any) => {
  const { assert } = should()
  const createResponse = (ok: boolean = false) => ({
    ok,
    text() {
      return Promise.resolve('text')
    },
  })

  {
    let actual

    await responseNotOk(createResponse(true))
      .then(res => (actual = 'did not throw'))
      .catch(e => (actual = 'threw error'))

    assert({
      given: 'response.ok is true',
      should: 'should not throw',
      actual,
      expected: 'did not throw',
    })
  }

  {
    let actual

    await responseNotOk(createResponse())
      .then(res => (actual = 'did not throw'))
      .catch(e => (actual = 'threw error'))

    assert({
      given: 'response.ok is true',
      should: 'should throw',
      actual,
      expected: 'threw error',
    })
  }
})

describe('isNotArray()', async (should: any) => {
  const { assert } = should()
  assert({
    given: 'array',
    should: 'should not throw/ return undefined',
    actual: Try(isNotArray, ['test', 'array']),
    expected: undefined,
  })

  assert({
    given: 'array of undefined values',
    should: 'should not throw/ return undefined',
    actual: Try(isNotArray, [undefined, undefined]),
    expected: undefined,
  })

  assert({
    given: 'string',
    should: 'should throw new UnexpectedResponseError',
    actual: Try(isNotArray, 'test string'),
    expected: new UnexpectedResponseError('InsightHelper.getUtxo was expecting server response to be an Array. '),
  })

  assert({
    given: 'object',
    should: 'should throw new UnexpectedResponseError',
    actual: Try(isNotArray, { test: 'test Object' }),
    expected: new UnexpectedResponseError('InsightHelper.getUtxo was expecting server response to be an Array. '),
  })

  assert({
    given: 'nothing',
    should: 'should throw new UnexpectedResponseError',
    actual: Try(isNotArray),
    expected: new UnexpectedResponseError('InsightHelper.getUtxo was expecting server response to be an Array. '),
  })
})

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
