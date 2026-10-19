import { Injectable, NotFoundException } from '@nestjs/common';
import { RefreshToken } from './entity/token.entity.js';
import { IRefreshTokenService } from './refresh.interface.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash } from 'crypto';

@Injectable()
export class RefreshTokenService implements IRefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRep: Repository<RefreshToken>,
  ) {}

  async create(
    userId: string,
    refreshToken: string,
  ): Promise<RefreshToken | null> {
    try {
      const tokenHash = createHash('sha256').update(refreshToken).digest('hex');
      const tokenEntity = this.refreshTokenRep.create({
        userId: userId,
        tokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      const s_token = await this.refreshTokenRep.save(tokenEntity);
      return s_token;
    } catch (err) {
      throw new Error('Error while creating the refreshToken', { cause: err });
    }
  }
  async get(refreshToken: string): Promise<RefreshToken | null> {
    const hashedIncome = createHash('sha256')
      .update(refreshToken)
      .digest('hex');
    const e_token = await this.refreshTokenRep.findOne({
      where: {
        tokenHash: hashedIncome,
      },
      relations: {
        user: true,
      },
    });
    return e_token;
  }
  async update(userId: string, refreshToken: string): Promise<void> {
    const hashedIncome = createHash('sha256')
      .update(refreshToken)
      .digest('hex');
    try {
      const updateRes = await this.refreshTokenRep.update(
        { userId },
        {
          tokenHash: hashedIncome,
        },
      );
      if (updateRes.affected === 0) {
        throw new NotFoundException('No Token was updated');
      }
    } catch (err) {
      throw new Error('Failed to update the token', { cause: err });
    }
  }

  validate(token: RefreshToken): boolean {
    return !token.revoked && token.expiresAt.getTime() > Date.now();
  }
}
