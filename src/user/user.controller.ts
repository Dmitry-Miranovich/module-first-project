import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UpdateUserDTO } from './dto/update-user.dto.js';
import { AuthJWTGuard } from '../auth/auth.guard.js';
import { UserService } from './user.service.js';
import type { Request } from 'express';

@UseGuards(AuthJWTGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @HttpCode(200)
  async findAll(@Query('searchEmail') searchEmail: string) {
    return this.userService.findAll(searchEmail);
  }

  @Get('my')
  async findUser(@Req() req: any) {
    const { user } = req;
    return this.userService.findByID(user.sub);
  }

  @Get(':id')
  async findByID(@Param(':id') id: string) {
    return this.userService.findByID(id);
  }

  @Put('my')
  async updateUser(@Req() req: any, @Body() dto: UpdateUserDTO) {
    return this.userService.updateUser(req.user.sub, dto);
  }
  @Delete('my')
  @HttpCode(204)
  async deleteUser(@Req() req: any) {
    return this.userService.delete(req.user.sub);
  }
}
