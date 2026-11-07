import { Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { AuthJWTGuard } from '../auth/auth.guard.js';
import { BalanceProducer } from './balance.producer.js';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@UseGuards(AuthJWTGuard)
@Controller('balance')
export class BalanceController {
  constructor(private readonly balanceProducer: BalanceProducer) {}
  @ApiBearerAuth()
  @Post('empty')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Authorized Balance nullification',
    description: 'Emptying the balance of all users every 10 minutes',
  })
  async emptyUsersBalance() {
    return this.balanceProducer.emptyBalances();
  }
}
