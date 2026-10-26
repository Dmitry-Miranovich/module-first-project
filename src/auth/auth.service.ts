import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service.js';
import {
  IAuthService,
  IAuthServiceAccessToken,
  IAuthServiceTokens,
} from './interfaces/auth.interface.js';
import { RegisterDTO } from './dto/register.dto.js';
import { LoginDTO } from './dto/login.dto.js';
import { PasswordHasherService } from '../passwordHasher/passwordHasher.service.js';
import { User, UserRole } from '../user/entity/user.entity.js';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { RefreshTokenService } from '../refreshToken/refresh.service.js';
import { HttpAdapterHost } from '@nestjs/core';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private readonly userService: UserService,
    private readonly passwordHash: PasswordHasherService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly refreshService: RefreshTokenService,
    private readonly host: HttpAdapterHost,
  ) {}

  async register(dto: RegisterDTO) {
    if (await this.userService.findByCriteria(dto.email, 'email')) {
      throw new ConflictException('Email already registered');
    }
    if (await this.userService.findByCriteria(dto.login, 'login')) {
      throw new ConflictException('Such login already exists');
    }
    if (!dto.password) {
      throw new BadRequestException('Password is required');
    }
    return await this.userService.create({
      login: dto.login,
      age: dto.age,
      description: dto.description,
      email: dto.email,
      passwordHash: await this.passwordHash.hash(dto.password),
    });
  }
  async login(dto: LoginDTO) {
    const found = await this.userService.findByCriteria(dto.login, 'login');
    if (!found) {
      throw new UnauthorizedException('User with such login does not exists');
    }
    const valid = await this.passwordHash.verify(
      dto.password,
      found.passwordHash,
    );
    if (!valid || !found?.passwordHash) {
      throw new UnauthorizedException('Incorrect password');
    }
    if (this.passwordHash.needsRehash(found.passwordHash)) {
      await this.userService.updatePasswordHash(
        found.id,
        await this.passwordHash.hash(dto.password),
      );
    }
    return found;
  }
  private async generateTokens(
    userId: string,
    role: UserRole,
  ): Promise<IAuthServiceTokens> {
    const accessToken = await this.jwtService.signAsync(
      { sub: userId, role: role },
      {
        expiresIn: '15m',
        secret: this.config.getOrThrow('ACCESS_TOKEN_SECRET'),
      },
    );
    const refreshToken = await this.jwtService.signAsync(
      {
        sub: userId,
        type: 'refresh',
        jti: randomUUID(),
      },
      {
        expiresIn: '7d',
        secret: this.config.getOrThrow('REFRESH_TOKEN_SECRET'),
      },
    );
    return {
      accessToken,
      refreshToken,
    };
  }

  async issueSession(
    user: User,
    res: Response,
  ): Promise<IAuthServiceAccessToken> {
    const tokens = await this.generateTokens(user.id, user.role);
    await this.refreshService.create(user.id, tokens.refreshToken);
    this.host.httpAdapter.setCookie(res, 'refresh', tokens.refreshToken, {
      httpOnly: true,
      secure: this.config.getOrThrow('NODE_ENV') === 'prod' ? true : false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'strict',
      path: '/auth/refresh',
    });
    return tokens;
  }
  async refresh(
    oldRefreshToken: string,
    res: Response,
  ): Promise<IAuthServiceAccessToken> {
    const refreshTokenEntity = await this.refreshService.get(oldRefreshToken);
    if (!refreshTokenEntity) {
      throw new UnauthorizedException(
        'Refresh token is invalid or does not exists',
      );
    }
    if (!refreshTokenEntity.user) {
      throw new UnauthorizedException('User no longer exists');
    }

    try {
      const payload = await this.jwtService.verifyAsync(oldRefreshToken, {
        secret: this.config.getOrThrow('REFRESH_TOKEN_SECRET'),
      });
      const tokens = await this.generateTokens(
        payload.sub,
        refreshTokenEntity.user.role,
      );
      await this.refreshService.update(
        refreshTokenEntity.id,
        payload.sub,
        tokens.refreshToken,
      );
      this.host.httpAdapter.setCookie(res, 'refresh', tokens.refreshToken, {
        httpOnly: true,
        secure: this.config.getOrThrow('NODE_ENV') === 'prod' ? true : false,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: 'strict',
        path: '/auth/refresh',
      });
      return {
        accessToken: tokens.accessToken,
      };
    } catch {
      throw new UnauthorizedException('Refresh token expired. Login again.');
    }
  }
}
