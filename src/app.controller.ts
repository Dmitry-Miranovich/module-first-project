import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Post,
  Query,
} from '@nestjs/common';
import { User } from './user/entity/user.entity.js';
import { UserService } from './user/user.service.js';
import { CreateUserDTO } from './user/dto/create-user.dto.js';

@Controller()
export class AppController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @HttpCode(200)
  async findByEmail(@Query('email') email: string) {
    return this.userService.findByEmail(email);
  }

  @Post()
  @HttpCode(201)
  async create(@Body() dto: CreateUserDTO): Promise<User> {
    return await this.userService.create(dto);
  }
}
