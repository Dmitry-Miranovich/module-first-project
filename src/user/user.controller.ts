import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UpdateUserDTO } from './dto/update-user.dto.js';
import { AuthJWTGuard } from '../auth/auth.guard.js';
import { UserService } from './user.service.js';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';

@UseGuards(AuthJWTGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth()
  @Get()
  @ApiOperation({
    summary: 'Users search',
    description: 'Searching for all of the users, based on their email or not',
  })
  @ApiQuery({
    name: 'searchEmail',
    required: false,
    type: String,
  })
  @HttpCode(200)
  async findAll(
    @Query('searchEmail')
    searchEmail?: string,
  ) {
    return await this.userService.findAll(searchEmail);
  }

  @ApiBearerAuth()
  @Get('my')
  @ApiOperation({
    summary: 'Authorized User search',
    description:
      'Searching user info based on its token payload (parsed in the guard operation)',
  })
  async findUser(@Req() req: any) {
    const { user } = req;
    return await this.userService.findByID(user.sub);
  }
  @ApiBearerAuth()
  @Put('my')
  @ApiOperation({
    summary: 'Update user params',
    description: 'Updating user based on its UpdateUserDTO',
  })
  @ApiBody({ type: UpdateUserDTO })
  async updateUser(@Req() req: any, @Body() dto: UpdateUserDTO) {
    return await this.userService.updateUser(req.user.sub, dto);
  }
  @ApiBearerAuth()
  @Delete('my')
  @ApiOperation({
    summary: 'Soft-delete a user',
    description: 'Setting a deletedAt record into table row',
  })
  @ApiBearerAuth()
  @HttpCode(204)
  async deleteUser(@Req() req: any) {
    return this.userService.delete(req.user.sub);
  }
}
