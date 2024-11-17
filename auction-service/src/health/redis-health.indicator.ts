import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  private readonly clients: Record<string, Redis>;

  constructor(private readonly configService: ConfigService) {
    super();
    const redisNodes = [
      {
        host: this.configService.get('redis.host_1'),
        port: this.configService.get('redis.port_1'),
      },
      {
        host: this.configService.get('redis.host_2'),
        port: this.configService.get('redis.port_2'),
      },
      {
        host: this.configService.get('redis.host_3'),
        port: this.configService.get('redis.port_3'),
      },
    ];

    this.clients = redisNodes.reduce(
      (clients, node, index) => {
        clients[`${node.host}:${node.port}`] = new Redis(node);
        return clients;
      },
      {} as Record<string, Redis>,
    );
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const statuses = {};

    for (const [nodeName, client] of Object.entries(this.clients)) {
      try {
        const result = await client.ping();

        if (result !== 'PONG') {
          throw new Error(`Ping failed for ${nodeName}`);
        }

        statuses[nodeName] = 'healthy';
      } catch (err) {
        statuses[nodeName] = `unhealthy: ${err.message}`;
      }
    }

    const allHealthy = Object.values(statuses).every(
      (status) => status === 'healthy',
    );

    if (!allHealthy) {
      throw new HealthCheckError(
        'Redis cluster health check failed',
        this.getStatus(key, false, { statuses }),
      );
    }

    return this.getStatus(key, true, { statuses });
  }
}
