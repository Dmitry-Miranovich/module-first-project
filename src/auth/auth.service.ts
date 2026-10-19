import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service.js';
import { IAuthService } from './interfaces/auth.interface.js';
import { RegisterDTO } from './dto/register.dto.js';
import { LoginDTO } from './dto/login.dto.js';
import { PasswordHasherService } from '../passwordHasher/passwordHasher.service.js';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private readonly userService: UserService,
    private readonly passwordHash: PasswordHasherService,
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
}
