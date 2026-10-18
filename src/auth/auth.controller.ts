import {
  Body,
  Controller,
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

@Controller('auth')
export class AuthController {
  constructor(
    private readonly service: AuthService,
    private readonly jwtService: JwtService,
    private readonly host: HttpAdapterHost,
    private readonly config: ConfigService,
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
      { expiresIn: '15m', secret: this.service.TOKEN_SECRET },
    );
    const refreshToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        type: 'refresh',
      },
      { expiresIn: '7d', secret: this.service.REFRESH_SECRET },
    );
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
}
