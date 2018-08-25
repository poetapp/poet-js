export interface Claim<T extends ClaimAttributes = ClaimAttributes> {
  readonly '@context'?: any
  readonly id?: string
  readonly publicKey?: string
  readonly signature?: string
  readonly created?: Date
  readonly type: ClaimType
  readonly attributes: T
}

export function isClaim(object: any): object is Claim {
  // TODO: use joi or protobuf
  return (
    object.id &&
    object.publicKey &&
    object.signature &&
    object.type &&
    object.attributes &&
    object.created instanceof Date
  )
}

// WARNING: This MUST account for ALL of the attributes in a Claim, except for id, @context, and signature.
// Otherwise those attributes without context will be left out of the canonized/signed claim.
// Refer to https://www.w3.org/2018/jsonld-cg-reports/json-ld/#the-context
export function getClaimContext(): any {
  return {
    '@context': {
      attributes: 'http://schema.org/CreativeWork',
      author: 'http://schema.org/author',
      text: 'http://schema.org/text',
      created: 'http://purl.org/dcterms/created',
      dateCreated: 'http://schema.org/dateCreated',
      datePublished: 'http://schema.org/datePublished',
      name: 'http://schema.org/name',
      tags: 'http://schema.org/keyword',
      type: 'http://schema.org/additionalType',
      publicKey: 'http://schema.org/Text',
    },
  }
}

export interface ClaimAttributes {
  readonly [key: string]: string
}

export enum ClaimType {
  Work = 'Work',
}

export interface WorkAttributes extends ClaimAttributes {
  readonly name: string
  readonly datePublished: string
  readonly dateCreated: string
  readonly author: string
  readonly tags?: string
  readonly text: string
}

export interface Work extends Claim<WorkAttributes> {}

export function isWork(claim: Claim): claim is Work {
  return claim.type === ClaimType.Work
}

export interface TransactionPoetTimestamp {
  readonly transactionId: string
  readonly outputIndex: number
  readonly prefix: string
  readonly version: ReadonlyArray<number>
  readonly ipfsDirectoryHash: string
}

export interface PoetTimestamp extends TransactionPoetTimestamp {
  readonly blockHeight: number
  readonly blockHash: string
  readonly ipfsFileHash?: string
}
