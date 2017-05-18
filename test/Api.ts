import { expect } from 'chai'

import { Api } from '../src/Api'

describe('Api.Work', () => {
  it(`url('123') returns /works/123`, () => expect(Api.Works.url('123')).to.deep.equal({
    url: '/works/123',
    query: undefined
  }))
  it(`url({offset: 20, limit: 10}) returns /works?offset=20&limit=10`, () => expect(Api.Works.url({offset: 20, limit: 10})).to.deep.equal({
    url: '/works',
    query: {
      offset: 20,
      limit: 10
    }
  }))
  it(`url('123', {offset: 20, limit: 10}) returns /works?offset=20&limit=10`, () => expect(Api.Works.url('123', {offset: 20, limit: 10})).to.deep.equal({
    url: '/works/123',
    query: {
      offset: 20,
      limit: 10
    }
  }))
})