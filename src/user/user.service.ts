import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    @InjectRepository(User) private readonly userRep: Repository<User>,
    private readonly passwordHash: PasswordHasherService,
  ) {}
  async findAll(searchLogin?: string): Promise<User[] | null> {
    return await this.userRep.find({
      select: {
        email: true,
        age: true,
        description: true,
        createdAt: true,
      },
      where: searchLogin
        ? {
            login: ILike(`%${searchLogin}%`),
          }
        : undefined,
    });
  }
  async updateUser(user_id: string, dto: UpdateUserDTO): Promise<boolean> {
    const change_user = {
      passwordHash: dto.password
        ? await this.passwordHash.hash(dto.password)
        : undefined,
      age: dto.age,
      email: dto.email,
      description: dto.description,
    };
    const u_user = await this.userRep.update(user_id, change_user);
    if (u_user.affected === 0) {
      throw new NotFoundException('User is not found');
    }
    return true;
  }
  async delete(user_id: string): Promise<string> {
    try {
      const deleteRes = await this.userRep.softDelete(user_id);
      if (deleteRes.affected === 0) {
        throw new NotFoundException('User to delete was not found');
      }
      return 'User was successfully deleted';
    } catch {
      throw new NotFoundException('User to delete was not found');
    }
  }

  async findByID(id: string): Promise<User | null> {
    const user = await this.userRep.findOne({
      where: {
        id: id,
      },
      select: {
        email: true,
        age: true,
        description: true,
        createdAt: true,
      },
    });
    return user;
  }
  async findByCriteria(value: string, key: keyof User): Promise<User | null> {
    const user = await this.userRep.findOne({
      where: {
        [key]: value,
      },
    });
    return user;
  }
  async create(dto: CreateUserDTO): Promise<User> {
    try {
      const newUser = this.userRep.create({
        login: dto.login,
        age: dto.age,
        email: dto.email,
        description: dto.description,
        passwordHash: dto.passwordHash,
        role: UserRole.USER,
      });
      await this.userRep.save(newUser);
      return newUser;
    } catch (err) {
      console.log(err);
      throw new HttpException(
        'Failed to save user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async updatePasswordHash(id: string, n_hash?: string) {
    try {
      await this.userRep.update({ id: id }, { passwordHash: n_hash });
    } catch {
      throw new HttpException(
        'Failed to save update password hash',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
