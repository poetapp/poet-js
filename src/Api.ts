import { HexString } from './Common'
import { UrlObjectQuery, urlObjectToUrl } from './UrlObject'
import { Block, Claim, License, Profile, Work } from './Claim'

export namespace Api {

  export interface Pagination extends UrlObjectQuery {
    readonly limit?: number
    readonly offset?: number
  }

  export namespace Node {
    export const Path = '/node'

    export interface Resource {
      readonly peers: number
      readonly status: string
    }
  }

  export namespace Claims {
    export const Path = '/claims'

    export function url(idOrQuery: string | Query): string
    export function url(idOrQuery: string | Query, query?: Query): string
    export function url(idOrQuery: string | Query, query?: Query): string {
      return urlObjectToUrl({
        url: [Path, typeof idOrQuery === 'string' && idOrQuery].filter(a => a).join('/'),
        query: typeof idOrQuery === 'object' ? idOrQuery : query
      })
    }

    export interface Query extends Pagination {}

    export interface Resource extends Claim {}
  }

  export namespace Works {
    export const Path = '/works'

    export function url(idOrQuery: string | Query): string
    export function url(idOrQuery: string | Query, query?: Query): string
    export function url(idOrQuery: string | Query, query?: Query): string {
      return urlObjectToUrl({
        url: [Path, typeof idOrQuery === 'string' && idOrQuery].filter(a => a).join('/'),
        query: typeof idOrQuery === 'object' ? idOrQuery : query
      })
    }

    export interface Resource extends Work {}

    export interface Query extends Pagination {
      readonly author?: string
      readonly owner?: string
      readonly relatedTo?: string
      readonly licensedTo?: string
      readonly query?: string
    }
  }

  export namespace Licenses {
    export const Path = '/licenses'

    export function url(idOrQuery: string | Query): string
    export function url(idOrQuery: string | Query, query?: Query): string
    export function url(idOrQuery: string | Query, query?: Query): string {
      return urlObjectToUrl({
        url: [Path, typeof idOrQuery === 'string' && idOrQuery].filter(a => a).join('/'),
        query: typeof idOrQuery === 'object' ? idOrQuery : query
      })
    }

    export interface Resource extends License {}

    export interface Query extends Pagination {
      readonly relatedTo?: string
      readonly emitter?: string
      readonly holder?: string
      readonly query?: string
    }
  }

  export namespace Profiles {
    export const Path = '/profiles/'

    export function url(profileId: string) {
      return Path + profileId
    }

    export interface Resource extends Profile {}
  }

  export namespace ProfileAutocomplete {

    export const Path = '/profiles/autocomplete/'

    export function url(value: string) {
      return Path + value
    }

    export interface Resource {
      readonly id: string;
      readonly displayName: string;
    }

  }

  export namespace Notifications {

    export const Path = '/notifications/'

    export function url(sessionPublicKey: HexString, query?: Pagination): string {
      return urlObjectToUrl({
        url: Path + sessionPublicKey,
        query
      })
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

    export function url(query: Query): string {
      return urlObjectToUrl({
        url: Path,
        query
      })
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

  export namespace Blocks {
    export const Path = '/blocks'

    export function url(idOrQuery: string | Query): string
    export function url(idOrQuery: string | Query, query?: Query): string
    export function url(idOrQuery: string | Query, query?: Query): string {
      return urlObjectToUrl({
        url: [Path, typeof idOrQuery === 'string' && idOrQuery].filter(a => a).join('/'),
        query: typeof idOrQuery === 'object' ? idOrQuery : query
      })
    }

    export interface Query extends Pagination {}

    export interface Resource extends Block {}
  }

}

