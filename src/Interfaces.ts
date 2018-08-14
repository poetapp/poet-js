export interface Claim<T extends ClaimAttributes = ClaimAttributes> {
  readonly '@context'?: T
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
