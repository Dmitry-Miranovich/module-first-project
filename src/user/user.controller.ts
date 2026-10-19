import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UpdateUserDTO } from './dto/update-user.dto.js';
import { AuthJWTGuard } from '../auth/auth.guard.js';

@UseGuards(AuthJWTGuard)
@Controller('users')
export class UserController {
  @Get()
  async findAll() {
    return 'some';
  }
  @Get('my')
  async findUser(@Req() req: Request) {}

  @Get(':id')
  async findByID(@Param(':id') id: string) {}

  @Put('my')
  async updateUser(@Req() req: Request, dto: UpdateUserDTO) {}
  @Delete('my')
  @HttpCode(204)
  async deleteUser(@Req() req: Request) {}
}
