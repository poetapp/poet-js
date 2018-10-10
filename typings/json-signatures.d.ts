declare module 'jsonld-signatures' {
  interface VerifiedResults {
    readonly keyResults: ReadonlyArray<any>
    readonly verified: boolean
  }

  interface JsonldSignatureFactory {
    (): JsonldSignatureFactory
    suites: object
    SECURITY_CONTEXT_URL: string
    sign: (doc: any, signingOptions: any) => Promise<any>
    use: (libraryName: string, library: any) => void
    verify: (doc: any, verificationOptions: any) => Promise<VerifiedResults>
  }

  const jsonLdSignatureFactory: JsonldSignatureFactory

  export = jsonLdSignatureFactory
}
