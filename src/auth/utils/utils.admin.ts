import { UserRole } from '../../user/entity/user.entity.js';

export const defaultAdminUser = {
  email: 'admin@gmail.com',
  login: 'admin',
  password: 'adminPassword123',
  age: 99,
  balance: '100.00',
  description: 'Admin user',
  role: UserRole.ADMIN,
};
