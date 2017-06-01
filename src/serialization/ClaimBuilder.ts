import { hex, KeyValue, POET, sha256, sign, VERSION } from '../Common'
import { Claim, Block, ClaimAttributes } from '../Claim'

import { ClaimProto, AttributeProto, BlockProto } from './PoetProto'

const bitcore = require('bitcore-lib')

export namespace ClaimBuilder {

  export function createSignedClaim(claim: Claim, privateKey: string): Claim {
    const key = typeof privateKey === 'string'
              ? new bitcore.PrivateKey(privateKey)
              : privateKey
    const id = getId({...claim, publicKey: key.publicKey})
    const signature = sign(key, id)

    return {
      id: hex(id),
      publicKey: key.publicKey.toString(),
      signature: hex(signature),

      type: claim.type,
      attributes: claim.attributes
    }
  }

  export function getId(claim: Claim): Uint8Array {
    return sha256(getEncodedForSigning(claim))
  }

  export function getIdForBlock(block: any): string {
    return sha256(BlockProto.encode(block).finish()).toString('hex')
  }

  export function getEncodedForSigning(claim: Claim): string {
    return new Buffer(ClaimProto.encode(ClaimProto.create({
      id: new Buffer(''),
      publicKey: new Buffer(claim.publicKey, 'hex'),
      signature: new Buffer(''),
      type: claim.type,
      attributes: getAttributes(claim.attributes)
    })).finish()).toString('hex')
  }

  export function protoToBlockObject(proto: any): Block {
    return {
      id: proto.id.toString('hex'),
      claims: proto.claims.map(protoToClaimObject)
    }
  }

  export function serializedToBlock(block: Buffer) {
    try {
      const decoded = BlockProto.decode(block)
      return protoToBlockObject(decoded)
    } catch (e) {
      console.log(e, e.stack)
    }
  }

  export function serializeBlockForSave(block: Block) {
    return new Buffer(BlockProto.encode(BlockProto.create({
      id: new Buffer(block.id, 'hex'),
      claims: block.claims.map(claimToProto)
    })).finish())
  }

  export function serializeClaimForSave(claim: Claim) {
    return new Buffer(ClaimProto.encode(claimToProto(claim)).finish())
  }

  export function serializedToClaim(claim: Buffer) {
    try {
      const decoded = ClaimProto.decode(claim)
      return protoToClaimObject(decoded)
    } catch (e) {
      console.log(e, e.stack)
    }
  }

  export function protoToClaimObject(proto: any): Claim {
    const attributes: any = {}
    proto.attributes.forEach((attr: any) => {
      attributes[attr.key] = attr.value
    })

    return {
      id: proto.id.toString('hex'),
      publicKey: proto.publicKey.toString('hex'),
      signature: proto.signature.toString('hex'),
      type: proto.type,
      attributes
    }
  }

  export function claimToProto(claim: Claim) {
    return ClaimProto.create({
      id: new Buffer(claim.id, 'hex'),
      publicKey: new Buffer(claim.publicKey, 'hex'),
      signature: new Buffer(claim.signature, 'hex'),
      type: claim.type,
      attributes: getAttributes(claim.attributes)
    })
  }

  export function createBlock(claims: Claim[]): Block {
    const block = BlockProto.create({
      id: new Buffer(''),
      claims: claims.map(claimToProto)
    })
    const id = getIdForBlock(block)
    return {
      id,
      claims
    }
  }

  export function createTransaction(blockId: string, utxos: any, changeAddress: any, privateKey: any) {
    const data = Buffer.concat([
      POET,
      VERSION,
      new Buffer(blockId, 'hex')
    ])
    return new bitcore.Transaction()
      .from(utxos)
      .change(changeAddress)
      .addData(data)
      .sign(privateKey)
  }

  // TODO: attributes should always be of type ClaimAttributes
  function getAttributes(attributes: ClaimAttributes | ReadonlyArray<KeyValue>) {
    const attributesArray = attributes instanceof Array ? attributes : Object.entries(attributes).map(([key, value]) => ({key, value}))
    return attributesArray.map(AttributeProto.create, AttributeProto)
  }
}
