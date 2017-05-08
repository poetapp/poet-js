import * as protobuf from 'protobufjs'
import { ClaimProto } from './ClaimProto'

export interface Builders {
  claim: protobuf.Type
  attribute: protobuf.Type
  block: protobuf.Type
}

const root = protobuf.Root.fromJSON(ClaimProto)

export const builder: Builders = {
  claim: root.lookup(`Poet.Claim`) as protobuf.Type,
  attribute: root.lookup(`Poet.Attribute`) as protobuf.Type,
  block: root.lookup(`Poet.Block`) as protobuf.Type,
}

