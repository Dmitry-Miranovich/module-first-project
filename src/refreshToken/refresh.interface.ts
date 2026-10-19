import { RefreshToken } from './entity/token.entity.js';

export interface IRefreshTokenService {
  create(userId: string, refreshToken: string): Promise<RefreshToken | null>;
  get(incomingToken: string): Promise<RefreshToken | null>;
  update(userId: string, refreshToken: string): Promise<void>;
  validate(token: RefreshToken): boolean;
}
