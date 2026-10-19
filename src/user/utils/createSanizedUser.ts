import { User } from '../entity/user.entity.js';
import { SanitizedUser } from '../interfaces/user.interface.js';

export const getSanitizedUser = (user: User): SanitizedUser => {
  return {
    age: user.age,
    email: user.email,
    description: user.description,
    createdAt: user.createdAt,
  };
};
