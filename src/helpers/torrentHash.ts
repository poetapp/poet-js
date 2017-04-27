import * as Rx from 'rxjs'

const createTorrentLib = require('create-torrent')
const parseTorrent = require('parse-torrent')

export function getCreateOpts(hash: string) {
  return {
    name: hash,
    comment: 'Poet Block #' + hash,
    createdBy: 'Poet'
  }
}

export function createTorrent(data: any, hash: string): Promise<any> {
  let torrent: any
  if (data instanceof Buffer) {
    torrent = new Buffer(data) as any
    torrent.name = hash
  } else {
    torrent = data
  }

  const opts = getCreateOpts(hash)

  return new Promise<string>((resolve, reject) => {
    createTorrentLib(torrent, opts, (error: any, file: Buffer) => {
      if (error) {
        return reject(error)
      }
      return resolve(parseTorrent(file))
    })
  })
}

export async function getHash(data: Buffer, hash: string): Promise<string> {
  const torrent = await createTorrent(data, hash)
  return torrent.infoHash
}

export function createObservableDownload(client: any, pathFunction: (_: string) => string, hash: string) {
  return Rx.Observable.create((observer: Rx.Subscriber<any>) => {
    const uri = 'magnet:?xt=urn:btih:' + hash
    client.add(
      uri,
      { path: pathFunction(hash) },
      (torrent: any) => {
        torrent.on('error', (error: any) => {
          observer.error(error)
        })
        torrent.on('download', () => {
          observer.next(torrent.progress)
        })
        torrent.on('done', () => {
          console.log(uri, 'downloaded')
          observer.complete()
        })
      }
    )
  }).publish().refCount()
}
