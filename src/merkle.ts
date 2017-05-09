import * as crypto from 'crypto'

export const  zero = '0000000000000000000000000000000000000000000000000000000000000000'

export function hexsha256string(hex: string): string {
  const value = new Buffer(hex,'hex')
  const hash = crypto.createHash('SHA256')
  hash.update(value)
  return hash.digest().toString('hex')
}

export class Proof {
  public readonly treeSize: number
  public readonly position: number
  public readonly leaveValue: string
  public readonly hashes: ReadonlyArray<string>

  constructor(treeSize: number, position: number, leaveValue: string, hashes: ReadonlyArray<string>) {
    this.treeSize = treeSize
    this.position = position
    this.leaveValue = leaveValue
    this.hashes = hashes
  }

  verify(): boolean {
    if (this.position >= this.treeSize) {
      return false
    }
    let height = this.hashes.length - 1
    let currentValue = this.position
    let currentHash = this.leaveValue

    while (height > 0) {
      let parity = currentValue & 1
      let appendHash = this.hashes[height] 

      let prefix = (parity ? appendHash : '')
      let postfix = (parity ? '' : appendHash)

      let preimage =  prefix + currentHash + postfix
      currentHash = hexsha256string(preimage)

      currentValue = Math.floor(currentValue / 2)
      height--
    }
    return currentHash === this.hashes[0]
  }
}
