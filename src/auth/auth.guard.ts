import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthJWTGuard implements CanActivate {
  constructor(@Inject(JwtService) private readonly jwtService: JwtService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { authorization }: any = request.headers;
    if (!authorization || authorization.trim() === '') {
      throw new UnauthorizedException('Please provide token');
    }
    const authToken: string = authorization.replace(/bearer/gim, '').trim();

    try {
      const payload = await this.jwtService.verifyAsync(authToken);
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or Expired Token');
    }
  }
}
