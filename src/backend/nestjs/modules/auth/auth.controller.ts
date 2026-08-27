import { Controller, Post, Get, Body, Inject } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('login')
  async login(@Body() body: { loginId?: string; email?: string; password?: string }) {
    const id = body.loginId || body.email || '';
    return this.authService.login(id, body.password);
  }

  @Public()
  @Throttle({ default: { ttl: 300000, limit: 3 } })
  @Post('forgot-password')
  async forgotPassword(@Body() body: { email?: string }) {
    return this.authService.forgotPassword(body.email);
  }

  @Public()
  @Throttle({ default: { ttl: 300000, limit: 5 } })
  @Post('reset-password-with-token')
  async resetPasswordWithToken(@Body() body: { token?: string; newPassword?: string }) {
    return this.authService.resetPasswordWithToken(body);
  }

  @Public()
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @Post('refresh')
  async refresh(@Body() body: { refreshToken?: string }) {
    return this.authService.refreshToken(body.refreshToken || '');
  }

  @Post('logout')
  async logout(@CurrentUser('id') userId: string, @Body() body: { refreshToken?: string }) {
    return this.authService.logout(userId, body.refreshToken);
  }

  @Get('me')
  async me(@CurrentUser('id') userId: string) {
    return this.authService.getProfile(userId);
  }

  @Post('reset-password')
  async resetPassword(
    @CurrentUser('id') userId: string,
    @Body() body: { targetEmail?: string; targetUserId?: string; newPassword?: string; currentPassword?: string }
  ) {
    return this.authService.resetPassword(userId, body);
  }
}
