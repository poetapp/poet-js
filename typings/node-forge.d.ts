declare module 'node-forge' {
  type NativeBuffer = Buffer | Uint8Array | number[]

  interface KeyPair {
    readonly publicKey: any
    readonly privateKey: any
  }

  namespace pki {
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
  }
  namespace random {
    function getBytesSync(count: number): string
  }
}
