import { Controller, Get, Post, Param, Query, Inject } from '@nestjs/common';
import { TokenUsageService } from './token-usage.service';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller(['v1/token-usage', 'token-usage'])
export class TokenUsageController {
  constructor(@Inject(TokenUsageService) private readonly tokenUsageService: TokenUsageService) {}

  @Roles('AGENCY_ADMIN', 'BUSINESS_OWNER')
  @Get()
  findAll(
    @Query('businessId') businessId?: string,
    @Query('branchId') branchId?: string
  ) {
    return this.tokenUsageService.findAll(businessId, branchId);
  }

  @Roles('AGENCY_ADMIN', 'BUSINESS_OWNER')
  @Get('dashboard')
  getDashboardSummary(@Query('businessId') businessId?: string) {
    return this.tokenUsageService.getDashboardSummary(businessId);
  }

  @Roles('AGENCY_ADMIN', 'BUSINESS_OWNER')
  @Get('business/:businessId')
  getBusinessUsage(@Param('businessId') businessId: string) {
    return this.tokenUsageService.getBusinessUsage(businessId);
  }

  @Roles('AGENCY_ADMIN', 'BUSINESS_OWNER')
  @Get('branch/:branchId')
  getBranchUsage(@Param('branchId') branchId: string) {
    return this.tokenUsageService.getBranchUsage(branchId);
  }

  @Roles('AGENCY_ADMIN')
  @Post('reset-monthly')
  resetMonthlyTokens() {
    return this.tokenUsageService.resetMonthlyTokens();
  }
}
