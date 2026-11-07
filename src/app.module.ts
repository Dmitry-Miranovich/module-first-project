import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entity/user.entity.js';
import { AuthModule } from './auth/auth.module.js';
import { RefreshToken } from './refreshToken/entity/token.entity.js';
import { FilesModule } from './providers/files.module.js';
import { UserFile } from './providers/entity/user-file.entity.js';
import { BullModule } from '@nestjs/bullmq';
import { BalanceModule } from './balance/balance.module.js';
import { DiscoveryModule } from '@nestjs/core';
import { WorkerCleanserService } from './app.worker.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DiscoveryModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const database = config.getOrThrow('POSTGRES_DB') ?? 'localhost';
        return {
          type: 'postgres',
          username: config.getOrThrow('POSTGRES_USER'),
          password: config.getOrThrow('POSTGRES_PASSWORD') ?? '',
          database: database,
          port: Number(config.getOrThrow('POSTGRES_PORT')),
          synchronize: true,
          entities: [User, RefreshToken, UserFile],
        };
      },
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      useFactory: (config: ConfigService) => {
        const host = config.getOrThrow('REDIS_HOST') ?? 'localhost';
        const port = config.getOrThrow('REDIS_PORT') ?? '6379';
        const password = config.getOrThrow('REDIS_PASSWORD');
        return {
          connection: {
            host,
            port,
            password,
          },
        };
      },
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'balance',
    }),
    AuthModule,
    FilesModule,
    BalanceModule,
  ],
  providers: [WorkerCleanserService],
})
export class AppModule {}
