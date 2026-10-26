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
import { CursorPaginationDto } from './dto/cursor-pagination.dto.js';
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
    description:
      'Returns one page of users, newest first. Pass nextCursor back as cursor to load the following page. searchLogin filters the login.',
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    type: String,
    description: 'createdAt of the last user from the previous page',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Page size. Defaults are set to 10 users',
  })
  @ApiQuery({
    name: 'searchLogin',
    required: false,
    type: String,
    description: 'Login params for additional filtering of the fetched users',
  })
  @HttpCode(200)
  async findUsers(@Query() pagination: CursorPaginationDto) {
    return await this.userService.findUsers(pagination);
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
    return await this.userService.findByCriteria(user.sub, 'id');
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
