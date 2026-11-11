// email.processor.ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import {
  BeforeApplicationShutdown,
  InternalServerErrorException,
} from '@nestjs/common';
import { Job } from 'bullmq';
import { UserService } from '../user/user.service.js';

@Processor('balance')
export class BalanceProcessor
  extends WorkerHost
  implements BeforeApplicationShutdown
{
  constructor(private readonly userService: UserService) {
    super();
  }
  async process(job: Job): Promise<any> {
    switch (job.name) {
      case 'balance_reset':
        await this.userService.resetAllBalances();
        break;
      default:
        throw new InternalServerErrorException(`Unknown job: ${job.name}`);
    }
    return { done: true };
  }

  async beforeApplicationShutdown() {
    await this.worker.close();
  }
}
