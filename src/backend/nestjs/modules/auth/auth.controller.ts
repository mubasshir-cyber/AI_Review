import { Controller, Post, Get, Body, Inject } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { decryptPayload, encryptPayload } from '../../common/crypto/payload-crypto';

@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('login')
  async login(@Body() body: any) {
    const data = decryptPayload(body?.payload || body?.data || body) || {};
    const id = data.loginId || data.email || '';
    const res = await this.authService.login(id, data.password);
    return {
      success: true,
      payload: encryptPayload({ success: true, ...res }),
    };
  }

  @Public()
  @Throttle({ default: { ttl: 300000, limit: 3 } })
  @Post('forgot-password')
  async forgotPassword(@Body() body: any) {
    const data = decryptPayload(body?.payload || body?.data || body) || {};
    const res = await this.authService.forgotPassword(data.email);
    return {
      success: true,
      payload: encryptPayload({ success: true, ...res }),
    };
  }

  @Public()
  @Throttle({ default: { ttl: 300000, limit: 5 } })
  @Post('reset-password-with-token')
  async resetPasswordWithToken(@Body() body: any) {
    const data = decryptPayload(body?.payload || body?.data || body) || {};
    const res = await this.authService.resetPasswordWithToken(data);
    return {
      success: true,
      payload: encryptPayload({ success: true, ...res }),
    };
  }

  @Public()
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @Post('refresh')
  async refresh(@Body() body: any) {
    const data = decryptPayload(body?.payload || body?.data || body) || {};
    const refreshTokenStr = data.refreshToken || body.refreshToken || '';
    const res = await this.authService.refreshToken(refreshTokenStr);
    return {
      success: true,
      payload: encryptPayload({ success: true, ...res }),
    };
  }

  @Post('logout')
  async logout(@CurrentUser('id') userId: string, @Body() body: any) {
    const data = decryptPayload(body?.payload || body?.data || body) || {};
    const res = await this.authService.logout(userId, data.refreshToken);
    return {
      success: true,
      payload: encryptPayload({ success: true, ...res }),
    };
  }

  @Get('me')
  async me(@CurrentUser('id') userId: string) {
    const res = await this.authService.getProfile(userId);
    return {
      success: true,
      payload: encryptPayload({ success: true, ...res }),
    };
  }

  @Post('reset-password')
  async resetPassword(
    @CurrentUser('id') userId: string,
    @Body() body: any
  ) {
    const data = decryptPayload(body?.payload || body?.data || body) || {};
    const res = await this.authService.resetPassword(userId, data);
    return {
      success: true,
      payload: encryptPayload({ success: true, ...res }),
    };
  }
}


