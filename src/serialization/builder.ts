import { Claims } from '../claim'
import { builder } from './loaders'
import { Common } from '../common'

const bitcore = require('bitcore-lib')

export class ClaimBuilder {

  private readonly block     = builder.block
  private readonly attribute = builder.attribute
  private readonly claim     = builder.claim

  createSignedClaim(data: { type: Claims.ClaimType, attributes: any }, privateKey: string): Claims.Claim {
    const key = typeof privateKey === 'string'
              ? new bitcore.PrivateKey(privateKey)
              : privateKey
    const id = this.getId(data, key)
    const signature = Common.sign(key, id)

    return {
      id: Common.hex(id),
      publicKey: key.publicKey.toString(),
      signature: Common.hex(signature),

      type: data.type,
      attributes: data.attributes
    }
  }

  addSignatureToProtoData(data: any, signature: string): any {
    const id = this.getId(data)
    return {
      ... data,
      signature: new Buffer(signature, 'hex')
    }
  }

  getId(data: any, key?: Object): Uint8Array {
    return Common.sha256(this.getEncodedForSigning(data, key))
  }

  getIdForBlock(block: any): string {
    return Common.sha256(this.block.encode(block).finish()).toString('hex')
  }

  getAttributes(attrs: any) {
    if (attrs instanceof Array) {
      return attrs.map(attr => {
        return this.attribute.create(attr)
      })
    } else {
      return Object.keys(attrs).sort().map(attr => {
        return this.attribute.create({
          key: attr,
          value: attrs[attr]
        })
      })
    }
  }

  getEncodedForSigning(data: any, privateKey?: any): Uint8Array {
    return this.claim.encode(this.claim.create({
      id: new Buffer(''),
      publicKey: data.publicKey || privateKey['publicKey'].toBuffer(),
      signature: new Buffer(''),
      type: data.type,
      attributes: this.getAttributes(data.attributes)
    })).finish()
  }

  protoToBlockObject(proto: any): Claims.Block {
    return {
      id: proto.id.toString('hex'),
      claims: proto.claims.map(this.protoToClaimObject.bind(this))
    }
  }

  serializedToBlock(block: Buffer) {
    try {
      const decoded = this.block.decode(block)
      return this.protoToBlockObject(decoded)
    } catch (e) {
      console.log(e, e.stack)
    }
  }

  serializeBlockForSave(block: Claims.Block) {
    return new Buffer(this.block.encode(this.block.create({
      id: new Buffer(block.id, 'hex'),
      claims: block.claims.map(this.claimToProto.bind(this))
    })).finish())
  }

  serializeClaimForSave(claim: Claims.Claim) {
    return new Buffer(this.claim.encode(this.claimToProto(claim)).finish())
  }

  serializedToClaim(claim: Buffer) {
    try {
      const decoded = this.claim.decode(claim)
      return this.protoToClaimObject(decoded)
    } catch (e) {
      console.log(e, e.stack)
    }
  }

  protoToClaimObject(proto: any): Claims.Claim {
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

  claimToProto(obj: Claims.Claim) {
    return this.claim.create({
      id: new Buffer(obj.id, 'hex'),
      publicKey: new Buffer(obj.publicKey, 'hex'),
      signature: new Buffer(obj.signature, 'hex'),
      type: obj.type,
      attributes: this.getAttributes(obj.attributes)
    })
  }

  createBlock(claims: Claims.Claim[]): Claims.Block {
    const protoClaims = claims.map((claim: Claims.Claim) => {
      return this.claimToProto(claim)
    })
    const block = this.block.create({
      id: new Buffer(''),
      claims: protoClaims
    })
    const id = this.getIdForBlock(block)
    return {
      id,
      claims
    }
  }

  createTransaction(blockId: string, utxos: any, changeAddress: any, privateKey: any) {
    const data = Buffer.concat([
      Common.POET,
      Common.VERSION,
      new Buffer(blockId, 'hex')
    ])
    return new bitcore.Transaction()
      .from(utxos)
      .change(changeAddress)
      .addData(data)
      .sign(privateKey)
  }
}
