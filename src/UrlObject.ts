export interface UrlObject {
  readonly url: string;
  readonly query?: UrlObjectQuery
}

export interface UrlObjectQuery {
  readonly [index: string]: string | number;
}

export function isUrlObject(a: any): a is UrlObject {
  return !!a.url;
}

export function urlObjectQueryParams(urlObject: UrlObject): string {
  return urlObject.query
    ? Object.keys(urlObject.query).filter(key => urlObject.query[key]).map(key => `${key}=${urlObject.query[key]}`).join('&')
    : '';
}

export function urlObjectToUrl(urlObject: UrlObject): string {
  const queryParams = urlObjectQueryParams(urlObject);
  return urlObject.url + '?' + queryParams;
}