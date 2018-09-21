import * as ParseDataUrl from 'parse-data-url'

export const DataParser = (jsonld: any) => {
  const nodeDocumentLoader = jsonld.documentLoaders.node({ usePromise: true })

  const customLoader = async (url: string, callback: (error: any, data: any) => any) => {
    const parsedData = ParseDataUrl(url)
    if (parsedData) {
      const publicKey = {
        id: url,
        type: 'Ed25519VerificationKey2018',
        owner: url,
        publicKeyBase58: parsedData.data,
      }
      return callback(null, {
        contextUrl: ['https://w3id.org/security/v2'],
        document: {
          owner: {
            id: url,
            publicKey: [publicKey],
          },
          publicKey,
        },
      })
    }
    nodeDocumentLoader(url, callback)
  }

  jsonld.documentLoader = customLoader
}
