import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entity/user.entity.js';
import { AuthModule } from './auth/auth.module.js';
import { RefreshToken } from './refreshToken/entity/token.entity.js';
import { FilesModule } from './providers/files.module.js';
import { UserFile } from './providers/entity/user-file.entity.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
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
    AuthModule,
    FilesModule,
  ],
})
export class AppModule {}
