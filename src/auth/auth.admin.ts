import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { UserService } from '../user/user.service.js';
import { PasswordHasherService } from '../passwordHasher/passwordHasher.service.js';
import { defaultAdminUser } from './utils/utils.admin.js';

@Injectable()
export class AuthAdminService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AuthAdminService.name);
  constructor(
    private readonly userService: UserService,
    private readonly passwordHashService: PasswordHasherService,
  ) {}
  async onApplicationBootstrap() {
    this.logger.log('Attempt to create default admin user');
    const adminEmail = defaultAdminUser.email;
    const existingAdmin = await this.userService.findByCriteria(
      adminEmail,
      'email',
    );
    if (existingAdmin) {
      this.logger.warn(
        'Admin already exists. Exiting the application bootstrap function',
      );
      return;
    }
    const passwordHash = await this.passwordHashService.hash(
      defaultAdminUser.password,
    );
    await this.userService.createAdmin({
      ...defaultAdminUser,
      passwordHash: passwordHash,
    });
    this.logger.log('Admin user successfully created');
  }
}
