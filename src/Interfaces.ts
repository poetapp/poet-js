export interface Claim<T extends ClaimAttributes = ClaimAttributes> {
  readonly id?: string

  readonly publicKey?: string
  readonly signature?: string
  readonly dateCreated?: Date

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
    object.dateCreated instanceof Date
  )
}

export interface ClaimAttributes {
  readonly [key: string]: string
}

export enum ClaimType {
  Identity = 'Identity',
  Work = 'Work',
}

export interface Work extends Claim<WorkAttributes> {}

export interface WorkAttributes extends ClaimAttributes {
  readonly name: string
  readonly datePublished: string
  readonly dateCreated: string
  readonly author: string
  readonly tags?: string
  readonly content: string
}

export interface Identity extends Claim<IdentityAttributes> {}

export interface IdentityAttributes extends ClaimAttributes {
  readonly profileUrl?: string
  readonly publicKey: string
}

export function isWork(claim: Claim): claim is Work {
  return claim.type === ClaimType.Work
}

export function isIdentity(claim: Claim): claim is Identity {
  return claim.type === ClaimType.Identity
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
