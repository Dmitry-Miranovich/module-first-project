// email.producer.ts
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { UserService } from '../user/user.service.js';

@Injectable()
export class BalanceProducer {
  constructor(
    @InjectQueue('balance') private balanceQueue: Queue,
    private readonly userService: UserService,
  ) {}

  async emptyBalances() {
    // The first parameter is the job name, the second is the data
    await this.balanceQueue.upsertJobScheduler(
      'scheduled_reset',
      { every: 10 * 60 },
      {
        name: 'balance_reset',
      },
    );
  }
}
