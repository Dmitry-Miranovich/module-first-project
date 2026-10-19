import { CreateUserDTO } from '../dto/create-user.dto.js';
import { UpdateUserDTO } from '../dto/update-user.dto.js';
import { User } from '../entity/user.entity.js';

export interface SanitizedUser {
  email: string;
  age: number;
  description: string;
  createdAt?: Date;
}

export interface ResponseUser {
  user: SanitizedUser;
  accessToken: string;
}

export interface IUserService {
  findByID: (id: string) => Promise<User | null>;
  findByEmail: (email: string) => Promise<User | null>;
  updatePasswordHash: (id: string, n_hash: string) => Promise<void>;
  create(dto: CreateUserDTO): Promise<User>;
  findAll(searchEmail?: string): Promise<User[] | null>;
  updateUser(user_id: string, dto: UpdateUserDTO): Promise<boolean>;
  delete(user_id: string): Promise<string>;
}
