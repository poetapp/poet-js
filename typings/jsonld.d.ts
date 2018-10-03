declare module 'jsonld' {
  interface Jsonld {
    canonize: (doc: any) => Promise<string>
    documentLoader: (url: string, callback: (error: any, data: any) => any) => any
  }
  function factory(): Jsonld

  export = factory
}
