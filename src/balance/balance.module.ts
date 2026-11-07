import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module.js';
import { BalanceProducer } from './balance.producer.js';
import { BullModule } from '@nestjs/bullmq';
import { BalanceController } from './balance.controller.js';
import { BalanceProcessor } from './balance.process.js';

@Module({
  imports: [UserModule, BullModule.registerQueue({ name: 'balance' })],
  controllers: [BalanceController],
  providers: [BalanceProducer, BalanceProcessor],
  exports: [BalanceProducer],
})
export class BalanceModule {}
