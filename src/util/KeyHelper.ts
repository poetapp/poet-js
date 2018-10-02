/* tslint:disable:no-relative-imports */
import { EncodeBuffer } from 'base-x'
import * as bs58 from 'bs58'
import { pki, random } from 'node-forge'

import { SigningAlgorithm } from '../Interfaces'

interface KeyPair {
  readonly publicKey: string
  readonly privateKey: string
}

const Algorithms: any = {
  Ed25519Signature2018: pki.ed25519,
}

const generateKeyPair = (algorithm: SigningAlgorithm = SigningAlgorithm.Ed25519Signature2018) => (
  password: string = ''
) => {
  const seed = password.length === 0 ? random.getBytesSync(32) : Buffer.from(password)
  const keyPair = Algorithms[algorithm].generateKeyPair({ seed })
  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
  }
}

const generateED25519KeyPair = generateKeyPair(SigningAlgorithm.Ed25519Signature2018)

const getPublicKeyFromPrivateKey = (algorithm: SigningAlgorithm = SigningAlgorithm.Ed25519Signature2018) => (
  privateKey: number[]
): EncodeBuffer => {
  return Algorithms[algorithm].publicKeyFromPrivateKey({ privateKey })
}

const getED25519PublicKeyFromPrivateKey = getPublicKeyFromPrivateKey(SigningAlgorithm.Ed25519Signature2018)

export const getBase58ED25519PublicKeyFromPrivateKey = (privateKey: string): string =>
  bs58.encode(getED25519PublicKeyFromPrivateKey(bs58.decode(privateKey)))

export const generateED25519Base58Keys = (password: string = ''): KeyPair => {
  const keyPair = generateED25519KeyPair(password)
  return {
    publicKey: bs58.encode(keyPair.publicKey).toString(),
    privateKey: bs58.encode(keyPair.privateKey).toString(),
  }
}
