const bitcore = require('bitcore-lib')

export type HexString = string

export interface KeyValue<K = string, V = string> {
  readonly key: K;
  readonly value: V;
}

export interface Signature {
  signature: string
  publicKey: string
  message: string
}

export interface ClassNameProps {
  readonly className?: string;
}

export const POET = new Buffer('POET')
export const BARD = new Buffer('BARD')
export const VERSION = new Buffer([0, 0, 0, 2])

export async function delay(millis: number) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, millis)
  })
}

export function assert(value: boolean, message: string) {
  if (!value) {
    throw new Error(message)
  }
}

export function sha256(value: string | Uint8Array) {
  return bitcore.crypto.Hash.sha256(
    typeof value === 'string'
    ? new Buffer(value)
    : value
  )
}

//export function hexsha256string(value: string | Uint8Array): string {
//  return sha256(new Buffer(value, 'hex')).toString('hex')
//}

export function sign(privateKey: string, value: Uint8Array): Uint8Array {
  const signature = bitcore.crypto.ECDSA.sign(
    value,
    new bitcore.PrivateKey(privateKey)
  )
  return signature.toBuffer()
}

export function verify(publicKey: any, signature: Uint8Array, value: Uint8Array): Boolean {
  return bitcore.crypto.ECDSA.verify(
    value,
    bitcore.crypto.Signature.fromBuffer(signature),
    publicKey
  )
}

export function hex(buffer: string | Buffer | Uint8Array): string {
  return typeof buffer === 'string'
    ? new Buffer(buffer).toString('hex')
    : buffer instanceof Buffer
    ? buffer.toString('hex')
    : (buffer as Buffer).toString('hex')
}

export function noop() {}

export function zip<A, B, R>(a: A[], b: B[], iterator: (a: A, b: B) => R): R[] {
  const length = a.length
  assert(a.length === b.length, 'Arrays should be of the same size')
  const results = []
  for (let i = 0; i < length; i++) {
    results.push(iterator(a[i], b[i]))
  }
  return results
}

export function looksLikePublicKey(key: string) {
  if (!key) {
    return false
  }
  if (key.length !== 66) {
    return false
  }
  if (!hexRegExp.exec(key)) {
    return false
  }
  if (key[0] !== '0' && (key[1] !== '2' || key[1] !== '3')) {
    return false
  }
  return true
}

export const hexRegExp = new RegExp('^[a-fA-F0-9]+$', 'gi')

export function doubleSha(data: Buffer) {
  return bitcore.crypto.Hash.sha256sha256(data)
}

export function signMessage(bitcoin: boolean, key: any /* TODO: TYPE: PrivateKey */, message: string) {
  const hash = bitcoin ? doubleSha : sha256
  const msg = new Buffer(message, 'hex')
  const signature = sign(key, hash(msg)) as any

  return {
    message: message,
    publicKey: key.publicKey.toString(),
    signature: signature.toString('hex'),
  }
}

export function verifies(hashFn: any, encoded: Buffer, signature: string, publicKey: string) {
  if (!encoded || !signature || !publicKey) {
    return false
  }

  if (!verify(
      new bitcore.PublicKey(publicKey),
      new Buffer(signature, 'hex'),
      hashFn(encoded)))
  {
    console.log('Signature is invalid')
    return false
  }
  return true
}