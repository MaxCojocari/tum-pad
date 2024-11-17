import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { ConsistentHashing } from './consistent-hashing.util';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService {
  private clients: Record<string, Redis>;
  private hashing: ConsistentHashing;

  constructor(private readonly configService: ConfigService) {
    const extentedNodes = [
      {
        host: this.configService.get<string>('redis.host_1'),
        port: this.configService.get<number>('redis.port_1'),
      },
      {
        host: this.configService.get<string>('redis.host_2'),
        port: this.configService.get<number>('redis.port_2'),
      },
      {
        host: this.configService.get<string>('redis.host_3'),
        port: this.configService.get<number>('redis.port_3'),
      },
    ];
    const redisNodes = extentedNodes.map(
      (node) => `redis://${node.host}:${node.port}`,
    );

    this.clients = redisNodes.reduce(
      (acc, node) => {
        acc[node] = new Redis(node);
        return acc;
      },
      {} as Record<string, Redis>,
    );

    this.hashing = new ConsistentHashing(redisNodes);
  }

  private getClientForKey(key: string) {
    const node = this.hashing.getNode(key);
    return this.clients[node];
  }

  async set(key: string, value: any, ttl: number) {
    const client = this.getClientForKey(key);
    await client.set(key, JSON.stringify(value), 'EX', ttl);
  }

  async get(key: string) {
    const client = this.getClientForKey(key);
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  }

  async del(key: string) {
    const client = this.getClientForKey(key);
    await client.del(key);
  }
}
