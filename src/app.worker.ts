import { WorkerHost } from '@nestjs/bullmq';
import { BeforeApplicationShutdown, Injectable, Logger } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { Queue } from 'bullmq';

@Injectable()
export class WorkerCleanserService implements BeforeApplicationShutdown {
  private readonly logger = new Logger(WorkerCleanserService.name);

  constructor(private readonly discoveryService: DiscoveryService) {}

  async beforeApplicationShutdown() {
    const providers = this.discoveryService.getProviders();

    // 1. Fix the filter: check provider.instance, not provider
    const workers = providers
      .filter((p) => p.instance instanceof WorkerHost)
      .map((p) => (p.instance as WorkerHost).worker);

    // 2. Check for Queue safely (duck typing)
    const queues = providers
      .filter(
        (p) =>
          p.instance &&
          typeof p.instance.close === 'function' &&
          p.instance.name,
      )
      .map((p) => p.instance as Queue);

    this.logger.log(
      `Shutting down ${workers.length} workers and ${queues.length} queues...`,
    );

    // 3. Close workers first, then queues
    await Promise.race(workers.map((w) => w.close()));
    await Promise.race(queues.map((q) => q.close()));

    this.logger.log('BullMQ shutdown complete.');
  }
}
