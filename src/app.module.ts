import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entity/user.entity.js';
import { UserModule } from './user/user.module.js';
import { AuthModule } from './auth/auth.module.js';
import { RefreshToken } from './passwordHasher/entity/token.entity.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const database = config.getOrThrow('POSTGRES_DB') ?? 'localhost';
        console.log();
        return {
          type: 'postgres',
          username: config.getOrThrow('POSTGRES_USER'),
          password: config.getOrThrow('POSTGRES_PASSWORD') ?? '',
          database: database,
          port: Number(config.getOrThrow('POSTGRES_PORT')),
          synchronize: true,
          entities: [User, RefreshToken],
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
