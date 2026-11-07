// email.processor.ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { BeforeApplicationShutdown } from '@nestjs/common';
import { Job } from 'bullmq';

@Processor('balance')
export class BalanceProcessor
  extends WorkerHost
  implements BeforeApplicationShutdown
{
  async process(job: Job): Promise<any> {
    // Distinguish job types by name
    switch (job.name) {
      case 'balance_reset':
        await this.sendWelcome(job.data);
        break;
      default:
        throw new Error(`Unknown job: ${job.name}`);
    }
    return { done: true };
  }

  private async sendWelcome(data: { userId: string; email: string }) {
    console.log(`Sending welcome email to ${data.email}`);
  }

  async beforeApplicationShutdown() {
    console.log('Shutdown inbound');
    await this.worker.close();
  }
}
