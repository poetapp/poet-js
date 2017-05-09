import { Proof, hexsha256string } from '../src/merkle'
import { expect } from 'chai'

const proofs = [
  new Proof(
    2,
    1,
    '0000000000000000000000000000000000000000000000000000000000000000',
    [
      '267a2859893fd88e28d032d4917a1cdc87c891f45cca55d4a8dcafb8e045ed57',
      'c493f6f146685f76b44f0c77ca88120cb8bc89f534fe69b6828827b974e68849'
    ]
  ),

  new Proof(
    3,
    2,
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    [
      'dd8d288cfb3ec19f11077a4e382bcf6f9efa1c716f9a477ffcc71c670c30f40e',
      'e0d3714ea853c268ba40f7f7b0577d28811c43f63c0d43fc33a929a1994895c3',
      '0000000000000000000000000000000000000000000000000000000000000000'
    ]
  ),

  new Proof(
    4,
    3,
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    [
      '12563ea5fcbf672ed42149b80cd080f940df3eb3493b47fd1d6116e87e8bbd0d',
      'e0d3714ea853c268ba40f7f7b0577d28811c43f63c0d43fc33a929a1994895c3',
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
    ]
  ),

  new Proof(
    5,
    4,
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    [
      '3634a3ed2b4fd3b3431ba3a3531bb130591cff2e74b8e07f0f63e877e96d6cc9',
      '12563ea5fcbf672ed42149b80cd080f940df3eb3493b47fd1d6116e87e8bbd0d',
      '0000000000000000000000000000000000000000000000000000000000000000',
      '0000000000000000000000000000000000000000000000000000000000000000'
    ]
  ),

  new Proof(
    8,
    7,
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    [
      '9182ef48144489a973552075d356f0db8bfb3853b96ede95f78f47ca9e934805',
      '12563ea5fcbf672ed42149b80cd080f940df3eb3493b47fd1d6116e87e8bbd0d',
      '0000000000000000000000000000000000000000000000000000000000000000',
      '0000000000000000000000000000000000000000000000000000000000000000'
    ]
  ),

  new Proof(
    8,
    6,
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    [
      'f4f940b0a4714522aed1f0788e4941e165d4f6594b591635348ad54e77393d84',
      '12563ea5fcbf672ed42149b80cd080f940df3eb3493b47fd1d6116e87e8bbd0d',
      '0000000000000000000000000000000000000000000000000000000000000000',
      '0000000000000000000000000000000000000000000000000000000000000000'
    ]
  )
]

describe('merkle test', () => {
  proofs.forEach((element, index) => {
    it(`number ${index + 1} verifies`, () => expect(element.verify()).to.be.true)
  })
})
