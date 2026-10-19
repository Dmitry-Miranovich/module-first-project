import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
  async update(
    token_id: string,
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const hashedIncome = createHash('sha256')
      .update(refreshToken)
      .digest('hex');
    try {
      const updateRes = await this.refreshTokenRep.update(
        { id: token_id, userId },
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
  async deleteByUser(userId: string): Promise<boolean> {
    try {
      await this.refreshTokenRep.delete({ userId });
      return true;
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw new NotFoundException('User is not found');
      }
      throw new HttpException(
        `Failed to delete refresh token by user ${userId}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
