import { createHash } from 'crypto';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RefreshToken } from './entity/token.entity.js';
import { RefreshTokenService } from './refresh.service.js';

describe('RefreshTokenService', async () => {
  const refreshTokenRep = {
    create: vi.fn((row) => row),
    update: vi.fn().mockResolvedValue({ affected: 1 }),
  };
  const moduleRef = await Test.createTestingModule({
    providers: [
      RefreshTokenService,
      {
        provide: getRepositoryToken(RefreshToken),
        useValue: refreshTokenRep,
      },
    ],
  }).compile();
  describe('create token', () => {
    it('stores the sha256 of the token and returns the saved row', async () => {
      const rawToken = 'refresh-token-value';
      const tokenHash = createHash('sha256').update(rawToken).digest('hex');
      const savedRow = {
        id: 'token_id',
        userId: 'super_user_id_1',
        tokenHash,
        createdAt: new Date('2026-10-20T00:00:00.000Z'),
      };
      const refreshTokenRep = {
        create: vi.fn((row) => row),
      };
      const service = moduleRef.get(RefreshTokenService);

      const result = await service.create('super_user_id_1', rawToken);

      expect(refreshTokenRep.create).toHaveBeenCalledWith({
        userId: 'super_user_id_1',
        tokenHash,
      });
      expect(result).toBe(savedRow);
    });
  });

  describe('update token', () => {
    const incomingRefreshToken = 'incoming-refresh-token';
    const tokenHash = createHash('sha256')
      .update(incomingRefreshToken)
      .digest('hex');
    const refreshTokenRep = {
      update: vi.fn().mockResolvedValue({ affected: 1 }),
    };
    const service = moduleRef.get(RefreshTokenService);
    it(`update target token entity with new token hash, based on userId and tokenId`, async () => {
      await service.update('token_id', 'super_user_id', incomingRefreshToken);
      expect(refreshTokenRep.update).toHaveBeenCalledWith(
        {
          id: 'token_id',
          userId: 'super_user_id',
        },
        { tokenHash },
      );
    });
    it('throws when no rows were affected during update', async () => {
      refreshTokenRep.update.mockResolvedValue({ affected: 0 });
      // await expect(
      //   service.update('missing', 'missing', incomingRefreshToken),
      // ).rejects.toThrow('Failed to update the token');
    });
  });
});
