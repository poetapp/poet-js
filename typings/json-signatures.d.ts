declare module 'jsonld-signatures' {
  let suites: object
  let SECURITY_CONTEXT_URL: string
  interface VerifiedResults {
    readonly keyResults: ReadonlyArray<any>
    readonly verified: boolean
  }
  export function sign(doc: any, signingOptions: any): Promise<any>
  export function verify(doc: any, verificationOptions: any): Promise<VerifiedResults>
  export function use(libraryName: string, library: any): void
}
