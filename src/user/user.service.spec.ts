import { HttpException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ILike, LessThan } from 'typeorm';
import { PasswordHasherService } from '../passwordHasher/passwordHasher.service.js';
import { RefreshTokenService } from '../refreshToken/refresh.service.js';
import { User, UserRole } from './entity/user.entity.js';
import { UserService } from './user.service.js';

describe('UserService', () => {
  let service: UserService;
  let userRep: {
    find: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    softDelete: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
  };
  let passwordHash: { hash: ReturnType<typeof vi.fn> };
  let refreshTokenService: { deleteByUser: ReturnType<typeof vi.fn> };

  const ann = {
    id: 'super_id_1',
    login: 'ann',
    email: 'ann@example.com',
    age: 20,
    description: 'hi',
    createdAt: new Date('2026-10-20T00:00:00.000Z'),
  };

  beforeEach(async () => {
    userRep = {
      find: vi.fn().mockResolvedValue([ann]),
      findOne: vi.fn().mockResolvedValue(ann),
      update: vi.fn().mockResolvedValue({ affected: 1 }),
      softDelete: vi.fn().mockResolvedValue({ affected: 1 }),
      create: vi.fn((user) => user),
      save: vi.fn((user) => Promise.resolve(user)),
    };
    passwordHash = { hash: vi.fn().mockResolvedValue('hashed-password') };
    refreshTokenService = { deleteByUser: vi.fn().mockResolvedValue(true) };

    const moduleRef = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: userRep },
        { provide: PasswordHasherService, useValue: passwordHash },
        { provide: RefreshTokenService, useValue: refreshTokenService },
      ],
    }).compile();

    service = moduleRef.get(UserService);
  });

  describe('findUsers', () => {
    it('loads one page filtered by login', async () => {
      const result = await service.findUsers({
        searchLogin: 'ann',
        limit: 10,
      });

      expect(result).toEqual({ users: [ann], nextCursor: null });
      expect(userRep.find).toHaveBeenCalledWith({
        select: {
          login: true,
          email: true,
          age: true,
          description: true,
          createdAt: true,
        },
        take: 11,
        order: { createdAt: 'DESC' },
        where: {
          login: ILike('%ann%'),
          createdAt: undefined,
        },
      });
    });

    it('returns a cursor when another page exists', async () => {
      const older = {
        ...ann,
        id: 'super_id_2',
        login: 'dim',
        createdAt: new Date('2026-10-19T00:00:00.000Z'),
      };
      userRep.find.mockResolvedValue([ann, older]);

      const result = await service.findUsers({
        limit: 1,
        cursor: '2026-10-21T00:00:00.000Z',
      });

      expect(result.users).toEqual([ann]);
      expect(result.nextCursor).toBe(ann.createdAt.toISOString());
      expect(userRep.find).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 2,
          where: {
            login: undefined,
            createdAt: LessThan(new Date('2026-10-21T00:00:00.000Z')),
          },
        }),
      );
    });
  });

  describe('findByCriteria', () => {
    it('loads one user by the given field', async () => {
      const result = await service.findByCriteria('super_id_1', 'id');

      expect(result).toBe(ann);
      expect(userRep.findOne).toHaveBeenCalledWith({
        where: { id: 'super_id_1' },
      });
    });
  });

  describe('create', () => {
    it('saves a user with the default role', async () => {
      const dto = {
        login: 'ann',
        email: 'ann@example.com',
        passwordHash: 'hashed-password',
        age: 20,
        description: 'hi',
      };

      const result = await service.create(dto);

      expect(userRep.create).toHaveBeenCalledWith({
        ...dto,
        role: UserRole.USER,
      });
      expect(userRep.save).toHaveBeenCalledWith(result);
    });

    it('returns 500 when the database rejects the insert', async () => {
      userRep.save.mockRejectedValue(new Error('duplicate insert'));

      await expect(
        service.create({
          login: 'ann',
          email: 'ann@example.com',
          passwordHash: 'hashed-password',
          age: 20,
          description: 'hi',
        }),
      ).rejects.toBeInstanceOf(HttpException);
    });
  });

  describe('updateUser', () => {
    it('stores a new password hash and the other fields', async () => {
      const updated = await service.updateUser('super_id_1', {
        login: 'superLogin',
        password: 'password123',
        age: 21,
        email: 'ann@example.com',
        description: 'updated',
      });

      expect(passwordHash.hash).toHaveBeenCalledWith('password123');
      expect(userRep.update).toHaveBeenCalledWith('super_id_1', {
        login: 'superLogin',
        passwordHash: 'hashed-password',
        age: 21,
        email: 'ann@example.com',
        description: 'updated',
      });
      expect(updated).toBe(true);
    });

    it('throws when the user does not exist', async () => {
      userRep.update.mockResolvedValue({ affected: 0 });
      await expect(
        service.updateUser('missing', { description: 'updated' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('updatePasswordHash', () => {
    it('replaces the stored hash', async () => {
      await service.updatePasswordHash('super_id_1', 'new-hash');

      expect(userRep.update).toHaveBeenCalledWith(
        { id: 'super_id_1' },
        { passwordHash: 'new-hash' },
      );
    });
  });

  describe('delete', () => {
    it('soft-deletes the user and removes refresh tokens', async () => {
      const result = await service.delete('super_id_1');

      expect(userRep.softDelete).toHaveBeenCalledWith('super_id_1');
      expect(refreshTokenService.deleteByUser).toHaveBeenCalledWith(
        'super_id_1',
      );
      expect(result).toBe('User was successfully deleted');
    });

    it('throws when nothing was deleted', async () => {
      userRep.softDelete.mockResolvedValue({ affected: 0 });

      await expect(service.delete('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
