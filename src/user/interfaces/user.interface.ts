import { CreateUserDTO } from '../dto/create-user.dto.js';
import { User } from '../entity/user.entity.js';

export interface ResponseUser {
  user: User;
  accessToken: string;
}

export interface IUserService {
  findByID: (id: string) => Promise<User | null>;
  findByEmail: (email: string) => Promise<User | null>;
  updatePasswordHash: (id: string, n_hash: string) => Promise<void>;
  create(dto: CreateUserDTO): Promise<User>;
}
