/* tslint:disable:no-relative-imports */
import { EncodeBuffer } from 'base-x'
import * as bs58 from 'bs58'
import * as cuid from 'cuid'
import { pki, random } from 'node-forge'

import {
  AlgorithmPublicKeyType,
  Ed25519SigningOptions,
  RsaSigningOptions,
  SigningAlgorithm,
  SigningOptions,
} from '../Interfaces'

interface KeyPair {
  readonly publicKey: EncodeBuffer
  readonly privateKey: EncodeBuffer
}

interface StringKeyPair {
  readonly publicKey: string
  readonly privateKey: string
}

interface PrivateKey {
  readonly n: number
  readonly e: number
}

const generateRsaPublicKeyFromPrivateKey = ({ privateKey }: { privateKey: PrivateKey }) =>
  pki.rsa.setPublicKey(privateKey.n, privateKey.e)

interface GenerateKeyPairOptions {
  bits?: number
  readonly seed?: string | ArrayBuffer | Buffer
  workers?: number
}

interface PublicKey {
  readonly id: string
  readonly type: AlgorithmPublicKeyType
  readonly owner: string
}

interface Ed25519PublicKey extends PublicKey {
  publicKeyBase58: string
}

interface RsaPublicKey extends PublicKey {
  publicKeyPem: string
}

type Algorithms = { [P in SigningAlgorithm]: Algorithm }

interface Algorithm {
  readonly engine: {
    readonly generateKeyPair: (options: GenerateKeyPairOptions) => KeyPair
  }
  readonly getPublicKeyFromPrivateKey: (privateKey: any) => any
  readonly getPublicKeyStringFromPrivateKeyString: (privateKey: string) => string
  readonly getSigningOptions?: (privateKey: string) => SigningOptions
  readonly publicKey: (id: string, publicKey: string) => PublicKey
}

export const getED25519Base58PublicKeyFromBase58PrivateKey = (privateKey: string): string =>
  bs58.encode(getED25519PublicKeyFromPrivateKey(bs58.decode(privateKey)))

export const getRsaPublicPemFromPrivatePem = (privateKey: string): string =>
  pki.publicKeyToPem(getRsaPublicKeyFromPrivateKey(pki.privateKeyFromPem(privateKey)))

export const SupportedAlgorithms: Algorithms = {
  [SigningAlgorithm.Ed25519Signature2018]: {
    engine: pki.ed25519,
    getPublicKeyFromPrivateKey: pki.ed25519.publicKeyFromPrivateKey,
    getPublicKeyStringFromPrivateKeyString: getED25519Base58PublicKeyFromBase58PrivateKey,
    getSigningOptions: (privateKeyBase58: string): Ed25519SigningOptions => ({
      privateKeyBase58,
      algorithm: SigningAlgorithm.Ed25519Signature2018,
      nonce: cuid(),
    }),
    publicKey: (id: string, publicKey: string): Ed25519PublicKey => ({
      id,
      type: AlgorithmPublicKeyType.Ed25519VerificationKey2018,
      owner: id,
      publicKeyBase58: publicKey,
    }),
  },
  [SigningAlgorithm.RsaSignature2018]: {
    engine: pki.rsa,
    getPublicKeyFromPrivateKey: generateRsaPublicKeyFromPrivateKey,
    getPublicKeyStringFromPrivateKeyString: getRsaPublicPemFromPrivatePem,
    getSigningOptions: (privateKeyPem: string): RsaSigningOptions => ({
      privateKeyPem,
      algorithm: SigningAlgorithm.RsaSignature2018,
      nonce: cuid(),
    }),
    publicKey: (id: string, publicKey): RsaPublicKey => ({
      id,
      type: AlgorithmPublicKeyType.RsaVerificationKey2018,
      owner: id,
      publicKeyPem: publicKey,
    }),
  },
}

export const createIssuerFromPublicKey = (
  publicKey: string,
  algorithm: SigningAlgorithm = SigningAlgorithm.Ed25519Signature2018
): string => {
  const signingInfo = {
    algorithm,
    publicKey,
  }
  const base64SigningInfo = Buffer.from(JSON.stringify(signingInfo)).toString('base64')
  return `data:;base64,${base64SigningInfo}`
}

export const createIssuerFromPrivateKey = (
  privateKey: string,
  algorithm: SigningAlgorithm = SigningAlgorithm.Ed25519Signature2018
): string =>
  createIssuerFromPublicKey(
    SupportedAlgorithms[algorithm].getPublicKeyStringFromPrivateKeyString(privateKey),
    algorithm
  )

const generateKeyPair = (algorithm: SigningAlgorithm = SigningAlgorithm.Ed25519Signature2018) => (
  options: GenerateKeyPairOptions = {}
): KeyPair => {
  const keyPair = SupportedAlgorithms[algorithm].engine.generateKeyPair(options)
  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
  }
}

const generateED25519KeyPair = generateKeyPair(SigningAlgorithm.Ed25519Signature2018)

const generateRsaKeyPair = generateKeyPair(SigningAlgorithm.RsaSignature2018)

const getPublicKeyFromPrivateKey = (algorithm: SigningAlgorithm = SigningAlgorithm.Ed25519Signature2018) => (
  privateKey: number[]
): EncodeBuffer => {
  return SupportedAlgorithms[algorithm].getPublicKeyFromPrivateKey({ privateKey })
}

const getED25519PublicKeyFromPrivateKey = getPublicKeyFromPrivateKey(SigningAlgorithm.Ed25519Signature2018)
const getRsaPublicKeyFromPrivateKey = getPublicKeyFromPrivateKey(SigningAlgorithm.RsaSignature2018)

export const generateED25519Base58Keys = (entropy: string = ''): StringKeyPair => {
  const seed = entropy.length === 0 ? random.getBytesSync(32) : Buffer.from(entropy)
  const keyPair = generateED25519KeyPair({ seed })
  return {
    publicKey: bs58.encode(keyPair.publicKey).toString(),
    privateKey: bs58.encode(keyPair.privateKey).toString(),
  }
}

export const generateRsaKeyPems = () => {
  const keyPair = generateRsaKeyPair()
  return {
    publicKey: pki.publicKeyToPem(keyPair.publicKey),
    privateKey: pki.privateKeyToPem(keyPair.privateKey),
  }
}
