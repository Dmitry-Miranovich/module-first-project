import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { UserModule } from '../user/user.module.js';
import { AuthService } from './auth.service.js';
import { PasswordHasherModule } from '../passwordHasher/passwordHasher.module.js';
import { RefreshTokenModule } from '../refreshToken/refresh.module.js';
import { AuthJWTGuard } from './auth.guard.js';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      global: true,
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow('ACCESS_TOKEN_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
    PasswordHasherModule,
    UserModule,
    RefreshTokenModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthJWTGuard],
  exports: [AuthService, AuthJWTGuard],
})
export class AuthModule {}
