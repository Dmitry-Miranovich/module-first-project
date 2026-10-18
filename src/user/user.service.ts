import { Injectable } from '@nestjs/common';
import { IUserService } from './interfaces/user.interface.js';
import { User, UserRole } from './entity/user.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDTO } from './dto/create-user.dto.js';

@Injectable()
export class UserService implements IUserService {
  constructor(
    @InjectRepository(User) private readonly dataSource: Repository<User>,
  ) {}
  async findByID(id: string): Promise<User | null> {
    const user = await this.dataSource.findOne({
      where: {
        id: id,
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
