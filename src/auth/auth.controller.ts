import {
  Body,
  Controller,
  Cookies,
  HttpCode,
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
import type { IAuthServiceTokens } from './interfaces/auth.interface.js';

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
  @HttpCode(201)
  async signUp(@Body() dto: RegisterDTO) {
    return await this.service.register(dto);
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
  async refreshToken(
    @Res({ passthrough: true }) res: Response,
    @Cookies('refresh') refresh: string,
  ): Promise<IAuthServiceTokens> {
    const refreshTokenEntity = await this.refreshService.get(refresh);
    if (!refreshTokenEntity) {
      throw new UnauthorizedException(
        'Refresh token is invalid or does not exists',
      );
    }
    if (!refreshTokenEntity.user) {
      throw new UnauthorizedException('User no longer exists');
    }
    try {
      const payload = await this.jwtService.verifyAsync(refresh, {
        secret: this.config.getOrThrow('REFRESH_TOKEN_SECRET'),
      });
      const accessToken = await this.jwtService.signAsync(
        { sub: payload.sub, role: refreshTokenEntity.user.role },
        {
          expiresIn: '15m',
          secret: this.config.getOrThrow('ACCESS_TOKEN_SECRET'),
        },
      );
      const n_refreshToken = await this.jwtService.signAsync(
        {
          sub: payload.sub,
          type: 'refresh',
        },
        {
          expiresIn: '7d',
          secret: this.config.getOrThrow('REFRESH_TOKEN_SECRET'),
        },
      );
      this.host.httpAdapter.setCookie(res, 'refresh', n_refreshToken, {
        httpOnly: true,
        secure: this.config.getOrThrow('NODE_ENV') === 'prod' ? true : false,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: 'strict',
        path: '/auth/refresh',
      });
      await this.refreshService.update(payload.sub, n_refreshToken);
      return {
        accessToken,
      };
    } catch {
      throw new UnauthorizedException('Refresh token expired. Login again.');
    }
  }
}
