import { Body, Controller, Cookies, HttpCode, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service.js';

import { RegisterDTO } from './dto/register.dto.js';
import { LoginDTO } from './dto/login.dto.js';
import type { ResponseUser } from '../user/interfaces/user.interface.js';
import type { IAuthServiceAccessToken } from './interfaces/auth.interface.js';
import { ApiOperation } from '@nestjs/swagger';
import { getSanitizedUser } from '../user/utils/createSanitizedUser.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}
  @Post('sign-up')
  @ApiOperation({
    summary: 'User registration',
    description: 'Registering user based on requirements from DTO',
  })
  @HttpCode(201)
  async signUp(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: RegisterDTO,
  ): Promise<ResponseUser> {
    const createdUser = await this.service.register(dto);
    const { accessToken } = await this.service.issueSession(createdUser, res);
    return {
      user: getSanitizedUser(createdUser),
      accessToken: accessToken,
    };
  }

  @ApiOperation({
    summary: 'User login',
    description: 'Login in the user account, returning token',
  })
  @Post('sign-in')
  async signIn(
    @Body() dto: LoginDTO,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ResponseUser> {
    const user = await this.service.login(dto);
    const { accessToken } = await this.service.issueSession(user, res);
    return {
      user: getSanitizedUser(user),
      accessToken,
    };
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Receive a new token',
    description:
      'Get a new access_token based on your refreshToken from cookies',
  })
  async refreshToken(
    @Res({ passthrough: true }) res: Response,
    @Cookies('refresh') refresh: string,
  ): Promise<IAuthServiceAccessToken> {
    const { accessToken } = await this.service.refresh(refresh, res);
    return { accessToken };
  }
}
