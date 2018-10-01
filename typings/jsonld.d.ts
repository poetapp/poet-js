declare module 'jsonld' {
  interface JsonldFactory {
    canonize: (doc: any) => Promise<string>
  }
  function factory(): JsonldFactory

  export = factory
}
