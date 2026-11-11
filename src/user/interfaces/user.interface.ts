import { CreateUserDTO } from '../dto/create-user.dto.js';
import { CursorPaginationDto } from '../dto/cursor-pagination.dto.js';
import { TransferDto } from '../dto/transfer.dto.js';
import { UpdateUserDTO } from '../dto/update-user.dto.js';
import { User, UserRole } from '../entity/user.entity.js';

export interface SanitizedUser {
  login: string;
  email: string;
  age: number;
  description: string;
  balance: string;
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

export interface UpdatedTransferUser {
  id: string;
  email: string;
  login: string;
  balance: string;
  createdAt: Date;
}

export interface CreateAdminUser {
  email: string;
  login: string;
  passwordHash: string;
  age: number;
  balance: string;
  description: string;
  role: UserRole;
}

export interface IUserService {
  findByCriteria: (value: string, key: keyof User) => Promise<User | null>;
  updatePasswordHash: (id: string, n_hash: string) => Promise<void>;
  create(dto: CreateUserDTO): Promise<User>;
  createAdmin(dto: CreateAdminUser): Promise<User>;
  findUsers(cursorPagination: CursorPaginationDto): Promise<UserPage>;
  updateUser(user_id: string, dto: UpdateUserDTO): Promise<boolean>;
  delete(user_id: string): Promise<string>;
  transferFunds(
    senderId: string,
    dto: TransferDto,
  ): Promise<UpdatedTransferUser>;
  resetAllBalances(): Promise<number>;
}
