declare module 'jsonld' {
  interface JsonldFactory {
    canonize: (doc: any) => Promise<string>
    documentLoader: (url: string, callback: (error: any, data: any) => any) => any
  }
  function factory(): JsonldFactory

  export = factory
}
