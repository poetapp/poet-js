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