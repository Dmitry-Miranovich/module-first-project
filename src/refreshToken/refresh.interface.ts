import { RefreshToken } from './entity/token.entity.js';

export interface IRefreshTokenService {
  create(userId: string, refreshToken: string): Promise<RefreshToken | null>;
  get(incomingToken: string): Promise<RefreshToken | null>;
  update(token_id: string, userId: string, refreshToken: string): Promise<void>;
  deleteByUser(userId: string): Promise<boolean>;
}
