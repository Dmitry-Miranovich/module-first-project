// email.producer.ts
import {
  BeforeApplicationShutdown,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { randomUUID } from 'node:crypto';

@Injectable()
export class BalanceProducer
  implements BeforeApplicationShutdown, OnModuleInit
{
  constructor(@InjectQueue('balance') private balanceQueue: Queue) {}

  private jobId: string = 'scheduled_reset';
  private singleProcessJobId: string = 'singular_process';

  async setBalancesEmptyOnce() {
    const designatedJobId = `${this.singleProcessJobId}_${randomUUID()}`;
    await this.balanceQueue.add(
      'balance_reset',
      {},
      {
        jobId: designatedJobId,
      },
    );
    return {
      id: designatedJobId,
      message: 'Job is tasked for completion',
    };
  }
  async onModuleInit() {
    await this.balanceQueue.upsertJobScheduler(
      this.jobId,
      { every: 10 * 60 * 1000 },
      {
        name: 'balance_reset',
      },
    );
  }
  async beforeApplicationShutdown() {
    await this.balanceQueue.removeJobScheduler(this.jobId);
    await this.balanceQueue.close();
  }
}
