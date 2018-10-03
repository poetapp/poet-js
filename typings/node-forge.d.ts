declare module 'node-forge' {
  type NativeBuffer = Buffer | Uint8Array | number[]

  interface KeyPair {
    readonly publicKey: any
    readonly privateKey: any
  }

  namespace pki {
    type PEM = string
    type Key = any

    function privateKeyFromPem(pem: PEM): Key
    function privateKeyToPem(key: Key, maxline?: number): PEM
    function publicKeyToPem(key: Key, maxline?: number): PEM

    namespace ed25519 {
      function sign(options: { message: any; encoding: string; privateKey: NativeBuffer }): NativeBuffer
      function verify(options: {
        message: any
        encoding: string
        publicKey: NativeBuffer
        signature: NativeBuffer
      }): boolean
      function publicKeyFromPrivateKey(options: { privateKey: NativeBuffer }): NativeBuffer
      function generateKeyPair(options: { seed: string | ArrayBuffer }): KeyPair
    }

    namespace rsa {
      interface GenerateKeyPairOptions {
        bits?: number
        e?: number
        workerScript?: string
        workers?: number
        workLoad?: number
        prng?: any
        algorithm?: string
      }

      function generateKeyPair(bits?: number, e?: number, callback?: (err: Error, keypair: KeyPair) => void): KeyPair
      function generateKeyPair(
        options?: GenerateKeyPairOptions,
        callback?: (err: Error, keypair: KeyPair) => void
      ): KeyPair
      function setPublicKey(n: number, e: number): Key
    }
  }
  namespace random {
    function getBytesSync(count: number): string
  }
}
