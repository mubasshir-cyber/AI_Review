import { Controller, Get, Post, Put, Param, Query, Body, Inject } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { FeedbackService } from './feedback.service';
import { Feedback, User } from '../../../../types';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('feedback')
export class FeedbackController {
  constructor(@Inject(FeedbackService) private readonly feedbackService: FeedbackService) {}

  @Roles('AGENCY_ADMIN', 'BUSINESS_OWNER')
  @Get()
  findAll(
    @Query('businessId') businessId?: string,
    @Query('branchId') branchId?: string,
    @CurrentUser() user?: any
  ) {
    return this.feedbackService.findAll(businessId, branchId, user);
  }

  @Public()
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post()
  create(@Body() body: Omit<Feedback, 'id' | 'createdAt' | 'status'>) {
    return this.feedbackService.create(body);
  }

  @Roles('AGENCY_ADMIN', 'BUSINESS_OWNER')
  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<Feedback>, @CurrentUser() user?: any) {
    return this.feedbackService.update(id, body, user);
  }
}
