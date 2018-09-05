declare module 'jsonld-signatures' {
  export function sign(doc: any, signingOptions: any): Promise<any>
  export function verify(doc: any, verificationOptions: any): Promise<any>
}
