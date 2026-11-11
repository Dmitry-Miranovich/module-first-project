import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../user/user.service.js';
import { UserRole } from '../../user/entity/user.entity.js';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(
    @Inject(JwtService) private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { authorization }: any = request.headers;
    if (!authorization || authorization.trim() === '') {
      throw new UnauthorizedException('Please provide token');
    }
    const authToken: string = authorization.replace(/bearer/gim, '').trim();
    try {
      const payload = await this.jwtService.verifyAsync(authToken);
      const user_id: string = payload.sub as string;
      const userEntity = await this.userService.findByCriteria(user_id, 'id');
      if (!userEntity) {
        throw new NotFoundException('User not found');
      }
      if (userEntity.role !== UserRole.ADMIN) {
        throw new ForbiddenException('Insufficient rights for the user');
      }
      return true;
    } catch (err) {
      if (
        err instanceof NotFoundException ||
        err instanceof ForbiddenException
      ) {
        throw err;
      }
      throw new UnauthorizedException('Invalid or Expired Token');
    }
  }
}
