import { HexString } from './Common'
import { UrlObject, UrlObjectQuery } from './UrlObject'
import { Profile, Work } from './Claim'

export namespace Api {

  export interface Pagination extends UrlObjectQuery {
    readonly limit?: number
    readonly offset?: number
  }

  export namespace Works {
    export const Path = '/works'

    export function url(idOrQuery: string | Query): UrlObject
    export function url(idOrQuery: string | Query, query?: Query): UrlObject
    export function url(idOrQuery: string | Query, query?: Query): UrlObject {
      return {
        url: [Path, typeof idOrQuery === 'string' && idOrQuery].filter(a => a).join('/'),
        query: typeof idOrQuery === 'object' ? idOrQuery : query
      }
    }

    export interface Resource extends Work {}

    export interface Query extends Pagination {

    }
  }

  export namespace Profile {
    export const Path = '/profiles/'

    export function url(profileId: string) {
      return Path + profileId
    }

    export interface Resource extends Profile {}
  }

  export namespace ProfileAutocomplete {

    export const Path = '/profiles/autocomplete/'

    export function url(value: string) {
      return Path + this.props.value
    }

    export interface Resource {
      readonly id: string;
      readonly displayName: string;
    }

  }

  export namespace Notifications {

    export const Path = '/notifications/'

    export function url(sessionPublicKey: HexString, query?: Pagination): UrlObject {
      return {
        url: Path + sessionPublicKey,
        query
      }
    }

    export interface Resource {
      readonly id: number,
      readonly user: string,
      readonly read: boolean,
      readonly event: Api.Events.Resource
    }

  }

  export namespace Events {

    export const Path = '/events/'

    export function url(query: Query): UrlObject {
      return {
        url: Path,
        query
      }
    }

    export interface Query extends UrlObjectQuery {
      work: string
    }

    export interface Resource {
      readonly id: number,
      readonly type: EventType,
      readonly timestamp: number,
      readonly claimReference: string,
      readonly workId: string,
      readonly workDisplayName?: string,
      readonly actorId: string,
      readonly actorDisplayName?: string
    }

    export enum EventType {
      WORK_CREATED,
      PROFILE_CREATED,
      TITLE_ASSIGNED,
      TITLE_REVOKED,
      LICENSE_OFFERED,
      LICENSE_BOUGHT,
      LICENSE_SOLD,
      SELF_LICENSE,
      WORK_MODIFIED,
      WORK_TRANSFERRED,
      BLOCKCHAIN_STAMP,
    }

  }


}

