/* tslint:disable:no-relative-imports */
import * as JSONLD from 'jsonld'
import * as ParseDataUrl from 'parse-data-url'

import { getSigningAlgorithm } from '../Interfaces'
import { SupportedAlgorithms } from './KeyHelper'

const nodeDocumentLoader = JSONLD.documentLoaders.node({ usePromise: true })

const fromBase64 = (base64String: string): { algorithm: string; publicKey: string } =>
  JSON.parse(Buffer.from(base64String, 'base64').toString())

export const dataDocumentLoader = async (url: string, callback: (error: any, data: any) => any) => {
  const parsedData = ParseDataUrl(url)

  if (parsedData) {
    const extractedParsedData = parsedData.base64 ? fromBase64(parsedData.data) : parsedData.data
    const publicKey = SupportedAlgorithms[getSigningAlgorithm(extractedParsedData.algorithm)].publicKey(
      url,
      extractedParsedData.publicKey
    )
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
