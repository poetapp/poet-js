/* tslint:disable:no-relative-imports */
import * as bs58 from 'bs58'
import { pki } from 'node-forge'
import { describe } from 'riteway'

import {
  generateED25519Base58Keys,
  getBase58ED25519PublicKeyFromPrivateKey,
  generateRsaKeyPEMs,
  getPubicRsaPEMFromPrivatePEM,
} from './KeyHelper'

type NativeBuffer = Buffer | Uint8Array | number[]

const ed25519Sign = (privateKey: NativeBuffer): NativeBuffer =>
  pki.ed25519.sign({
    message: 'test',
    encoding: 'utf8',
    privateKey,
  })

const verify = (publicKey: NativeBuffer, signature: NativeBuffer): boolean =>
  pki.ed25519.verify({
    message: 'test',
    encoding: 'utf8',
    publicKey,
    signature,
  })

describe('KeyHelper.generateED25519Base58Keys', async (should: any) => {
  const { assert } = should('')

  {
    const keyPair = generateED25519Base58Keys()
    const signature = ed25519Sign(bs58.decode(keyPair.privateKey))
    const verified = verify(bs58.decode(keyPair.publicKey), signature)

    assert({
      given: 'no password',
      should: 'generate the base58 public key',
      actual: keyPair.publicKey.length >= 43 && keyPair.publicKey.length <= 44,
      expected: true,
    })

    assert({
      given: 'no password',
      should: 'generate the base58 private key',
      actual: keyPair.privateKey.length >= 87 && keyPair.privateKey.length <= 88,
      expected: true,
    })

    assert({
      given: 'no password',
      should: 'generate a working set of keys',
      actual: verified,
      expected: true,
    })
  }

  {
    const keyPair = generateED25519Base58Keys('thisismypassword')
    const signature = ed25519Sign(bs58.decode(keyPair.privateKey))
    const verified = verify(bs58.decode(keyPair.publicKey), signature)

    assert({
      given: 'a password',
      should: 'generate the base58 public key',
      actual: keyPair.publicKey.length >= 43 && keyPair.publicKey.length <= 44,
      expected: true,
    })

    assert({
      given: 'a password',
      should: 'generate the base58 private key',
      actual: keyPair.privateKey.length >= 87 && keyPair.privateKey.length <= 88,
      expected: true,
    })

    assert({
      given: 'a password',
      should: 'generate a working set of keys',
      actual: verified,
      expected: true,
    })
  }
})

describe('KeyHelper.getBase58ED25519PublicKeyFromPrivateKey', async (should: any) => {
  const { assert } = should('')

  const keyPair = generateED25519Base58Keys()
  const publicKey = getBase58ED25519PublicKeyFromPrivateKey(keyPair.privateKey)
  const signature = ed25519Sign(bs58.decode(keyPair.privateKey))
  const verified = verify(bs58.decode(publicKey), signature)

  assert({
    given: 'a valid base58 ED25519 private key',
    should: 'return a valid base 58 ED25519 public key',
    actual: verified,
    expected: true,
  })
})

describe('KeyHelper.generateRsaKeyPEMs', async (should: any) => {
  const { assert } = should('')
  const keyPair = generateRsaKeyPEMs()

  assert({
    given: 'generateRsaKeyPEMs',
    should: 'return a pair of public/private key PEMS',
    actual:
      keyPair.publicKey.includes('-----BEGIN PUBLIC KEY-----', 0) &&
      keyPair.privateKey.includes('-----BEGIN RSA PRIVATE KEY-----', 0),
    expected: true,
  })
})

describe('KeyHelper.getPubicRsaPEMFromPrivatePEM', async (should: any) => {
  const { assert } = should('')
  const keyPair = generateRsaKeyPEMs()
  const derivedPublicKeyPEM = getPubicRsaPEMFromPrivatePEM(keyPair.privateKey)

  assert({
    given: 'a valid private key PEM',
    should: 'return a valid public key PEM',
    actual: derivedPublicKeyPEM.includes('-----BEGIN PUBLIC KEY-----', 0),
    expected: true,
  })
})
