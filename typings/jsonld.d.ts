declare module 'jsonld' {
  interface Jsonld {
    (): Jsonld
    canonize: (doc: any) => Promise<string>
    documentLoader: (url: string, callback: (error: any, data: any) => any) => any
    documentLoaders: {
      node: (options: object) => (url: string, callback: (err: Error, payload: object) => void) => any
    }
  }
  const jsonld: Jsonld

  export = jsonld
}
