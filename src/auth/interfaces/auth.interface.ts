import { User } from '../../user/entity/user.entity.js';
import { LoginDTO } from '../dto/login.dto.js';
import { RegisterDTO } from '../dto/register.dto.js';

export interface IAuthServiceAccessToken {
  accessToken: string;
}

export interface IAuthServiceTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IAuthService {
  register: (dto: RegisterDTO) => Promise<User>;
  login: (dto: LoginDTO) => Promise<User | null>;
  issueSession(user: User, res: Response): Promise<IAuthServiceAccessToken>;
  refresh(
    oldRefreshToken: string,
    res: Response,
  ): Promise<IAuthServiceAccessToken>;
}
