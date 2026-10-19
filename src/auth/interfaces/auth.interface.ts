import { User } from '../../user/entity/user.entity.js';
import { LoginDTO } from '../dto/login.dto.js';
import { RegisterDTO } from '../dto/register.dto.js';

export interface IAuthServiceTokens {
  accessToken: string;
}

export interface IAuthService {
  register: (dto: RegisterDTO) => Promise<User>;
  login: (dto: LoginDTO) => Promise<User | null>;
}
