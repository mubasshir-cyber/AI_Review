import { Controller, Get, Post, Put, Body, Inject } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { ApiKeyConfig, SystemSettings, Business, Branch } from '../../../../types';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('settings')
export class SettingsController {
  constructor(@Inject(SettingsService) private readonly settingsService: SettingsService) {}

  @Roles('AGENCY_ADMIN')
  @Get('config')
  getApiKeyConfig() {
    return this.settingsService.getApiKeyConfig();
  }

  @Roles('AGENCY_ADMIN')
  @Post('config')
  updateApiKeyConfig(@Body() body: Partial<ApiKeyConfig>) {
    return this.settingsService.updateApiKeyConfig(body);
  }

  @Public()
  @Get('system')
  getSettings() {
    return this.settingsService.getSettings();
  }

  @Roles('AGENCY_ADMIN')
  @Post('system')
  updateSettings(@Body() body: Partial<SystemSettings>) {
    return this.settingsService.updateSettings(body);
  }

  @Roles('AGENCY_ADMIN')
  @Get('agency-profile')
  getAgencyProfile() {
    return this.settingsService.getAgencyProfile();
  }

  @Roles('AGENCY_ADMIN')
  @Put('agency-profile')
  updateAgencyProfile(@Body() body: { business?: Partial<Business>; branch?: Partial<Branch> }) {
    return this.settingsService.updateAgencyProfile(body);
  }

  @Roles('AGENCY_ADMIN')
  @Post('demo/reset')
  resetDemoData(@Body() body: { businessId?: string }) {
    return this.settingsService.resetDemoData(body?.businessId || 'biz-agency');
  }

  @Roles('AGENCY_ADMIN', 'BUSINESS_OWNER')
  @Post('demo/generate-reviews')
  seedDemoReviews(@Body() body: { count?: number; businessId?: string; branchId?: string }) {
    return this.settingsService.seedDemoReviews(body?.count || 5, body?.businessId || 'biz-agency', body?.branchId || 'branch-agency-main');
  }

  @Roles('AGENCY_ADMIN', 'BUSINESS_OWNER')
  @Post('demo/generate-feedback')
  seedDemoFeedback(@Body() body: { count?: number; businessId?: string; branchId?: string }) {
    return this.settingsService.seedDemoFeedback(body?.count || 2, body?.businessId || 'biz-agency', body?.branchId || 'branch-agency-main');
  }

  @Public()
  @Post('qr/track')
  recordQrScanTrack(@Body() body: { branchId: string; businessId: string; deviceType?: string; browser?: string; city?: string; country?: string; referrer?: string }) {
    return this.settingsService.recordQrScanTrack(body);
  }

  @Roles('AGENCY_ADMIN', 'BUSINESS_OWNER')
  @Get('qr/analytics')
  getQrScanAnalytics(@Body() body: { businessId?: string; branchId?: string }) {
    return this.settingsService.getQrScanAnalytics(body?.businessId, body?.branchId);
  }
}
