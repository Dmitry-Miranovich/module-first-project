import { ConflictException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service.js';
import { IAuthService } from './interfaces/auth.interface.js';
import { RegisterDTO } from './dto/register.dto.js';
import { LoginDTO } from './dto/login.dto.js';
import { PasswordHasherService } from '../passwordHasher/passwordHasher.service.js';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private readonly userRepository: UserService,
    private readonly passwordHash: PasswordHasherService,
  ) {}

  public readonly TOKEN_SECRET: string = 'super_secret_key';
  public readonly REFRESH_SECRET: string = 'super_secret_refresh_key';

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
    const valid = await this.passwordHash.verify(
      dto.password,
      found?.passwordHash,
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
