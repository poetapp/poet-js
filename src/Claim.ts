import { HexString } from './Common'

export interface Claim<T extends ClaimAttributes = ClaimAttributes> {
  id?: string

  publicKey?: string
  signature?: string

  type: ClaimTypes.ClaimType
  attributes: T
}

export interface ClaimAttributes {
  readonly [key: string]: string;
}

export namespace ClaimTypes {

  export type Work = 'Work'
  export type Title = 'Title'
  export type License = 'License'
  export type Offering = 'Offering'
  export type Profile = 'Profile'
  export type Certificate = 'Certificate'
  export type Revocation = 'Revocation'

  export const WORK: Work = 'Work'
  export const TITLE: Title = 'Title'
  export const LICENSE: License = 'License'
  export const OFFERING: Offering = 'Offering'
  export const PROFILE: Profile = 'Profile'
  export const CERTIFICATE: Certificate = 'Certificate'
  export const REVOCATION: Revocation = 'Revocation'

  export type ClaimType = Work | Title | License | Offering | Profile | Certificate | Revocation
  export type Judgement = Certificate | Revocation

}

export interface Block {
  id: string
  claims: Claim[]
}

export interface TitleClaim extends Claim<TitleClaimAttributes> {}

export interface TitleClaimAttributes extends ClaimAttributes {
  readonly owner: string;
  readonly typeOfOwnership: string;
  readonly status: string;
}

// TODO: these attributes are not really part of the WorkClaim,
// they're actually what the Poet API responds
export interface Work extends Claim<WorkAttributes> {
  readonly claimInfo?: ClaimInfo
  readonly owner?: {
    readonly claim: HexString;
    readonly displayName: string;
    readonly id: HexString;
  }
  readonly title?: TitleClaim
  readonly author?: {
    readonly claim: HexString;
    readonly displayName: string;
    readonly id: HexString;
  }
  readonly offerings?: ReadonlyArray<WorkOffering>
}

export interface WorkAttributes extends ClaimAttributes {
  readonly name: string;
  readonly datePublished: string;
  readonly dateCreated: string;
  readonly author: string; // Can be a publicKey referencing a profile or a free text
  readonly lastModified: string;
  readonly contentHash: string;
  readonly tags: string;
  readonly type: string;
  readonly articleType: string;
  readonly content?: string;
}

export interface WorkOffering extends Claim {
  readonly owner: string
  readonly attributes: {
    readonly [key: string]: string;
    readonly licenseType: string;
    readonly licenseDescription: string;
    readonly pricingFrequency: string;
    readonly pricingPriceAmount: string;
    readonly pricingPriceCurrency: string;
  }
  readonly licenses: ReadonlyArray<any>
}

// TODO: what's the difference between a WorkOffering and a plain Offering?
export interface Offering {
  readonly id: string;
  readonly owner: string;
  readonly attributes: {
    readonly licenseType: string;
    readonly licenseDescription: string;
  };
}

export interface Profile extends Claim<ProfileAttributes> {
  readonly id: string
  readonly displayName: string
}

export interface ProfileAttributes extends ClaimAttributes {
  readonly displayName?: string;
  readonly name?: string;
  readonly bio?: string;
  readonly url?: string;
  readonly email?: string;
  readonly location?: string;
  readonly imageData?: string;
}

export interface License {
  readonly id: string;
  readonly publicKey: string;
  readonly title: string;
  readonly licenseType: string;
  readonly owner: string;

  readonly licenseHolder: Profile;

  readonly reference: Work;
  readonly claimInfo?: ClaimInfo

  readonly referenceOffering: Offering;

  readonly attributes: {
    readonly licenseHolder: string;
    readonly issueDate: string;
    readonly reference: string;
  }
}

export interface ClaimInfo {
  readonly hash: string
  readonly torrentHash: string
  readonly timestamp?: number
  readonly bitcoinHeight?: number
  readonly bitcoinHash?: string
  readonly blockHeight?: number
  readonly blockHash?: string
  readonly transactionOrder?: string
  readonly transactionHash: string
  readonly outputIndex: number
  readonly claimOrder?: number
}

export interface BlockInfo {
  readonly torrentHash: string

  readonly transactionHash?: string
  readonly outputIndex?: number

  // Only available if confirmed
  readonly bitcoinHash?: string
  readonly bitcoinHeight?: number
  readonly transactionOrder?: number
  readonly timestamp?: number

  // Only available if downloaded
  readonly hash?: string

  // Only available if indexed
  readonly height?: number
}
