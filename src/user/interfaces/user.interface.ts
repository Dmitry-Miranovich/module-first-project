import { CreateUserDTO } from '../dto/create-user.dto.js';
import { CursorPaginationDto } from '../dto/cursor-pagination.dto.js';
import { UpdateUserDTO } from '../dto/update-user.dto.js';
import { User } from '../entity/user.entity.js';

export interface SanitizedUser {
  login: string;
  email: string;
  age: number;
  description: string;
  createdAt?: Date;
}

export interface ResponseUser {
  user: SanitizedUser;
  accessToken: string;
}

export interface UserPage {
  users: User[];
  nextCursor: string | null;
}

export interface IUserService {
  findByID: (id: string) => Promise<User | null>;
  findByCriteria: (value: string, key: keyof User) => Promise<User | null>;
  updatePasswordHash: (id: string, n_hash: string) => Promise<void>;
  create(dto: CreateUserDTO): Promise<User>;
  findUsers(cursorPagination: CursorPaginationDto): Promise<UserPage>;
  updateUser(user_id: string, dto: UpdateUserDTO): Promise<boolean>;
  delete(user_id: string): Promise<string>;
}
