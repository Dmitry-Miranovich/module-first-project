import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { UserModule } from '../user/user.module.js';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service.js';
import { PasswordHasherModule } from '../passwordHasher/passwordHasher.module.js';

@Module({
  imports: [PasswordHasherModule, UserModule, JwtModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
