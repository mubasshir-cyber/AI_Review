import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Optional,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import jwt from 'jsonwebtoken';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { db } from '../../../database/store';

const JWT_SECRET = process.env.JWT_SECRET || '';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private reflector: Reflector;

  constructor(@Optional() reflector?: Reflector) {
    this.reflector = reflector || new Reflector();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization || request.headers.Authorization;

    if (!authHeader || typeof authHeader !== 'string') {
      throw new UnauthorizedException('Authentication token is missing. Please log in.');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedException('Invalid Authorization header format. Format must be "Bearer <token>".');
    }

    const token = parts[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string;
        email: string;
        role: string;
        businessId?: string;
      };

      // Verify user in database
      const user = await db.getUserById(decoded.userId);
      if (!user) {
        throw new UnauthorizedException('User account no longer exists in database.');
      }
      if (user.status === 'INACTIVE') {
        throw new UnauthorizedException('Account is inactive. Access denied.');
      }

      // Attach sanitized user to request
      const { password: _, ...sanitizedUser } = user;
      request.user = sanitizedUser;
      return true;
    } catch (err: any) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      throw new UnauthorizedException('Invalid or expired authentication token. Please log in again.');
    }
  }
}
