import { expect } from 'chai'

import { hex } from '../src/Common'

describe('hex', () => {
  const helloWorld = 'hello world'
  const helloWorldHex = '68656c6c6f20776f726c64'
  it(`it can hex a string`, () => expect(hex(helloWorld)).to.equal(helloWorldHex))
  it(`it can hex a Buffer`, () => expect(hex(new Buffer(helloWorld))).to.equal(helloWorldHex))
})