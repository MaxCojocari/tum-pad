import * as crypto from 'crypto';

export class ConsistentHashing {
  private ring: Map<number, string>;
  private sortedKeys: number[];

  constructor(
    private nodes: string[],
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

    this.sortedKeys.sort((a, b) => a - b);
  }

  private hash(key: string): number {
    const hash = crypto.createHash('sha256').update(key).digest('hex');
    return parseInt(hash.substring(0, 8), 16);
  }

  public getNode(key: string): string {
    const keyHash = this.hash(key);
    for (const hash of this.sortedKeys) {
      if (keyHash <= hash) {
        return this.ring.get(hash) as string;
      }
    }
    return this.ring.get(this.sortedKeys[0]) as string;
  }
}
