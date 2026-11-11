import { Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { AuthJWTGuard } from '../auth/guards/auth.guard.js';
import { BalanceProducer } from './balance.producer.js';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard.js';

@UseGuards(AuthJWTGuard)
@Controller('balance')
export class BalanceController {
  constructor(private readonly balanceProducer: BalanceProducer) {}

  @ApiBearerAuth()
  @Post('empty')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Authorized Balance nullification',
    description: 'Emptying the balance of all users every on one request',
  })
  @UseGuards(AdminAuthGuard)
  async singularEmptyUsersBalance() {
    return this.balanceProducer.setBalancesEmptyOnce();
  }
}
