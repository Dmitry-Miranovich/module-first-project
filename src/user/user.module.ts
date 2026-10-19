import { Module } from '@nestjs/common';
import { UserService } from './user.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity.js';
import { UserController } from './user.controller.js';
import { PasswordHasherModule } from '../passwordHasher/passwordHasher.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([User]), PasswordHasherModule],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
