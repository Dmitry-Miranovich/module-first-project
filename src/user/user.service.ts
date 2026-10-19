import { Injectable, NotFoundException } from '@nestjs/common';
import { IUserService } from './interfaces/user.interface.js';
import { User, UserRole } from './entity/user.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CreateUserDTO } from './dto/create-user.dto.js';
import { UpdateUserDTO } from './dto/update-user.dto.js';
import { PasswordHasherService } from '../passwordHasher/passwordHasher.service.js';

@Injectable()
export class UserService implements IUserService {
  constructor(
    @InjectRepository(User) private readonly dataSource: Repository<User>,
    private readonly passwordHash: PasswordHasherService,
  ) {}
  async findAll(searchEmail?: string): Promise<User[] | null> {
    return await this.dataSource.find({
      select: {
        email: true,
        age: true,
        description: true,
      },
      where: searchEmail
        ? {
            email: ILike(`%${searchEmail}%`),
          }
        : undefined,
    });
  }
  async updateUser(user_id: string, dto: UpdateUserDTO): Promise<boolean> {
    const u_user = await this.dataSource.update(
      user_id,
      dto.password
        ? {
            ...dto,
            passwordHash: await this.passwordHash.hash(dto.password),
          }
        : { ...dto },
    );
    if (u_user.affected === 0) {
      throw new NotFoundException('User is not found');
    }
    return true;
  }
  async delete(user_id: string): Promise<void> {
    try {
      await this.dataSource.softDelete(user_id);
    } catch (err) {
      throw new Error('Failed to delete user');
    }
  }

  async findByID(id: string): Promise<User | null> {
    const user = await this.dataSource.findOne({
      where: {
        id: id,
      },
      select: {
        email: true,
        age: true,
        description: true,
      },
    });
    return user;
  }
  async findByEmail(email: string): Promise<User | null> {
    const user = await this.dataSource.findOne({
      where: {
        email,
      },
    });
    return user;
  }
  async create(dto: CreateUserDTO): Promise<User> {
    try {
      const n_user = this.dataSource.create({
        ...dto,
        role: UserRole.USER,
      });
      this.dataSource.save(n_user);
      return n_user;
    } catch (err) {
      throw err;
    }
  }
  async updatePasswordHash(id: string, n_hash: string) {
    try {
      await this.dataSource.update({ id: id }, { passwordHash: n_hash });
    } catch (err) {
      throw err;
    }
  }
}
