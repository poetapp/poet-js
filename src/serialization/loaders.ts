import * as protobuf from 'protobufjs'

export interface Builders {
  claim     : protobuf.Type
  attribute : protobuf.Type
  block     : protobuf.Type
}

const jsonDescriptor = require(`../serialization/claim.json`)
const root = protobuf.Root.fromJSON(jsonDescriptor)

export const builder = {
  claim     : root.lookup(`Poet.Claim`) as protobuf.Type,
  attribute : root.lookup(`Poet.Attribute`) as protobuf.Type,
  block     : root.lookup(`Poet.Block`) as protobuf.Type,
}

