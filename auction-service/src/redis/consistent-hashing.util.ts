import * as crypto from 'crypto';

export class ConsistentHashing {
  private ring: Map<bigint, string>;
  private sortedKeys: bigint[];

  constructor(
    private nodes: string[] = [],
    private virtualNodes = 100,
  ) {
    this.ring = new Map();
    this.sortedKeys = [];
    this.initializeRing();
  }

  private initializeRing(): void {
    for (const node of this.nodes) {
      for (let i = 0; i < this.virtualNodes; ++i) {
        const virtualNodeKey = `${node}-${i}`;
        const hash = this.hash(virtualNodeKey);
        this.ring.set(hash, node);
        this.sortedKeys.push(hash);
      }
    }

    // sort keys in ascending order
    this.sortedKeys.sort((a, b) => (a < b ? -1 : 1));
  }

  private hash(key: string): bigint {
    const hash = crypto.createHash('sha256').update(key).digest('hex');
    return BigInt(`0x${hash}`);
  }

  public getNode(key: string): string {
    if (this.sortedKeys.length === 0) {
      throw new Error('No nodes available in the ring');
    }

    const keyHash = this.hash(key);

    const index = this.binarySearch(keyHash);
    return this.ring.get(this.sortedKeys[index]) as string;
  }

  private binarySearch(keyHash: bigint): number {
    let low = 0;
    let high = this.sortedKeys.length - 1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (this.sortedKeys[mid] >= keyHash) {
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }

    return low;
  }

  public addNode(node: string): void {
    for (let i = 0; i < this.virtualNodes; ++i) {
      const virtualNodeKey = `${node}-${i}`;
      const hash = this.hash(virtualNodeKey);
      this.ring.set(hash, node);
      this.sortedKeys.push(hash);
    }

    // re-sort the keys after adding new nodes
    this.sortedKeys.sort((a, b) => (a < b ? -1 : 1));
  }

  public removeNode(node: string): void {
    for (let i = 0; i < this.virtualNodes; ++i) {
      const virtualNodeKey = `${node}-${i}`;
      const hash = this.hash(virtualNodeKey);
      this.ring.delete(hash);
      const index = this.sortedKeys.indexOf(hash);
      if (index !== -1) {
        this.sortedKeys.splice(index, 1);
      }
    }
  }
}
