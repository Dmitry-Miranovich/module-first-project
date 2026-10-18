import { Module } from '@nestjs/common';
import { PasswordHasherService } from './passwordHasher.service.js';

@Module({
  providers: [PasswordHasherService],
  exports: [PasswordHasherService],
})
export class PasswordHasherModule {}
