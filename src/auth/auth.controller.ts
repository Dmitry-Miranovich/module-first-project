import {
  Body,
  Controller,
  Cookies,
  Post,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { HttpAdapterHost } from '@nestjs/core';

import { RegisterDTO } from './dto/register.dto.js';
import { LoginDTO } from './dto/login.dto.js';
import { JwtService } from '@nestjs/jwt';
import type { ResponseUser } from '../user/interfaces/user.interface.js';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenService } from '../refreshToken/refresh.service.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly service: AuthService,
    private readonly jwtService: JwtService,
    private readonly host: HttpAdapterHost,
    private readonly config: ConfigService,
    private readonly refreshService: RefreshTokenService,
  ) {}
  @Post('sign-up')
  async signUp(@Body() dto: RegisterDTO) {
    return await this.service.register(dto);
  }

  @Post()
  async shit(@Body() param: { piss: string }) {
    console.log(param);
  }

  @Post('sign-in')
  async signIn(
    @Body() dto: LoginDTO,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ResponseUser> {
    const user = await this.service.login(dto);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const accessToken = await this.jwtService.signAsync(
      { sub: user.id, role: user.role },
      {
        expiresIn: '15m',
        secret: this.config.getOrThrow('ACCESS_TOKEN_SECRET'),
      },
    );
    const refreshToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        type: 'refresh',
      },
      {
        expiresIn: '7d',
        secret: this.config.getOrThrow('REFRESH_TOKEN_SECRET'),
      },
    );
    this.refreshService.create(user.id, refreshToken);
    this.host.httpAdapter.setCookie(res, 'refresh', refreshToken, {
      httpOnly: true,
      secure: this.config.getOrThrow('NODE_ENV') === 'prod' ? true : false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'strict',
      path: '/auth/refresh',
    });
    return {
      user,
      accessToken,
    };
  }

  @Post('refresh')
  async refreshToken(@Cookies('refresh') refresh: string) {
    const refreshToken = await this.refreshService.get(refresh);
    if (!refreshToken) {
      throw new UnauthorizedException(
        'Refresh token is invalid or does not exists',
      );
    }

    return refreshToken;
  }
}
