import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service.js';
import {
  IAuthService,
  IAuthServiceTokens,
} from './interfaces/auth.interface.js';
import { RegisterDTO } from './dto/register.dto.js';
import { LoginDTO } from './dto/login.dto.js';
import { PasswordHasherService } from '../passwordHasher/passwordHasher.service.js';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private readonly userRepository: UserService,
    private readonly passwordHash: PasswordHasherService,
  ) {}

  async register(dto: RegisterDTO) {
    if (await this.userRepository.findByEmail(dto.email)) {
      throw new ConflictException('Email already registered');
    }
    return await this.userRepository.create({
      ...dto,
      passwordHash: await this.passwordHash.hash(dto.password),
    });
  }
  async login(dto: LoginDTO) {
    const found = await this.userRepository.findByEmail(dto.email);
    if (!found) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const valid = await this.passwordHash.verify(
      dto.password,
      found.passwordHash,
    );
    if (!valid || !found?.passwordHash) {
      return null;
    }
    if (this.passwordHash.needsRehash(found.passwordHash)) {
      await this.userRepository.updatePasswordHash(
        found.id,
        await this.passwordHash.hash(dto.password),
      );
    }

    return found;
  }
}
