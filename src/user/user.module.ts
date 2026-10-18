import { Module } from '@nestjs/common';
import { UserService } from './user.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
