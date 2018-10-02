/* tslint:disable:no-relative-imports */
import * as crypto from 'crypto'
import * as cuid from 'cuid'
import JSONLD = require('jsonld')
import JSONLD_SIGS = require('jsonld-signatures')
import * as ParseDataUrl from 'parse-data-url'

import { Claim, claimTypeDefaults, DefaultClaimContext } from '../Interfaces'

export const getJsonLD: any = () => {
  const jsonld = JSONLD()
  jsonld.documentLoader = getDataDocumentLoader(jsonld)
  const jsig = JSONLD_SIGS()
  jsig.use('jsonld', jsonld)
  return {
    jsonld,
    jsig,
    getClaimId: async (claim: Claim): Promise<string> => {
      const canonizedClaim = await canonizeClaim(claim, jsonld)
      const buffer = Buffer.from(canonizedClaim)
      return crypto
        .createHash('sha256')
        .update(buffer)
        .digest()
        .toString('hex')
    },
    isValidSignature: async (claim: Claim): Promise<boolean> => {
      const results: any = await jsig.verify(claim, { checkNonce: cuid.isCuid })

      return results.verified
    },
  }
}

const canonizeClaim = async (document: Claim, jsonld: any): Promise<string> => {
  const contextualClaim = {
    type: document.type,
    '@context': {
      ...DefaultClaimContext,
      ...claimTypeDefaults[document.type],
      ...document['@context'],
    },
    issuer: document.issuer,
    issuanceDate: document.issuanceDate,
    claim: document.claim,
  }
  return jsonld.canonize(contextualClaim)
}

const getDataDocumentLoader = (jsonld: any) => {
  const nodeDocumentLoader = jsonld.documentLoaders.node({ usePromise: true })

  return async (url: string, callback: (error: any, data: any) => any) => {
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
}
