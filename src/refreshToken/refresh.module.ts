import { Module } from '@nestjs/common';
import { RefreshTokenService } from './refresh.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from './entity/token.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([RefreshToken])],
  providers: [RefreshTokenService],
  exports: [RefreshTokenService],
})
export class RefreshTokenModule {}
