import { User } from '../entity/user.entity.js';
import { SanitizedUser } from '../interfaces/user.interface.js';

export const getSanitizedUser = (user: User): SanitizedUser => {
  return {
    login: user.login,
    age: user.age,
    email: user.email,
    description: user.description,
    balance: user.balance,
    createdAt: user.createdAt,
  };
};
