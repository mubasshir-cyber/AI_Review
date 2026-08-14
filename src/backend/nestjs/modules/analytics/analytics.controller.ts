import { Controller, Get, Param, Inject, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../../../types';

@Controller('analytics')
export class AnalyticsController {
  constructor(@Inject(AnalyticsService) private readonly analyticsService: AnalyticsService) {}

  @Roles('AGENCY_ADMIN')
  @Get('agency')
  getAgencyStats() {
    return this.analyticsService.getAgencyStats();
  }

  @Roles('AGENCY_ADMIN', 'BUSINESS_OWNER')
  @Get('business/:id')
  getBusinessStats(@Param('id') id: string, @CurrentUser() user?: any) {
    return this.analyticsService.getBusinessStats(id, user);
  }

  @Roles('AGENCY_ADMIN', 'BUSINESS_OWNER')
  @Get('qr-scans')
  getQrScans(@Query('businessId') businessId: string, @CurrentUser() user?: any) {
    if (!businessId) {
      throw new Error('businessId query parameter is required');
    }
    return this.analyticsService.getQrScans(businessId, user);
  }
}
