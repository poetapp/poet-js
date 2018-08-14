import { readFileSync } from 'fs'
import * as jsonld from 'jsonld'

// Reference: https://github.com/msporny/json-jsonld-basic-perftest/blob/master/nodejs/jsonld-cached-perftest.js
export const loadContext = (): void => {
  const ctx = readFileSync('./src/contexts/schema.org.json', 'utf8')
  const contexts = new Map<string, string>()
  contexts.set('http://schema.org', ctx)

  jsonld.documentLoader = (url: string, callback: (err: any, value: any) => void) => {
    if (url in contexts)
      callback(null, {
        contextUrl: null,
        document: contexts.get(url),
        documentUrl: url,
      })
    else callback(new Error(`Invalid Context: ${url}`), {})
  }
}
