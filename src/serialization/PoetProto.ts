import * as protobuf from 'protobufjs'

import { PoetProto } from './PoetProtoJson'

const poetProtoRoot = protobuf.Root.fromJSON(PoetProto)

export const ClaimProto = poetProtoRoot.lookup('Poet.Claim') as protobuf.Type
export const AttributeProto = poetProtoRoot.lookup('Poet.Attribute') as protobuf.Type
export const BlockProto = poetProtoRoot.lookup('Poet.Block') as protobuf.Type