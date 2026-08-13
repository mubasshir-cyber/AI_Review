import { Controller, Get, Post, Body, Query, Inject } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { Review, User } from '../../../../types';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(@Inject(ReviewsService) private readonly reviewsService: ReviewsService) {}

  @Public()
  @Post('generate')
  async generateAi(
    @Body()
    body: {
      businessName: string;
      branchName: string;
      rating: number;
      selectedTags: string[];
      customNote?: string;
    }
  ) {
    return this.reviewsService.generateAiReview(body);
  }

  @Roles('AGENCY_ADMIN', 'BUSINESS_OWNER')
  @Get()
  findAll(
    @Query('businessId') businessId?: string,
    @Query('branchId') branchId?: string,
    @CurrentUser() user?: any
  ) {
    return this.reviewsService.findAll(businessId, branchId, user);
  }

  @Public()
  @Post()
  create(@Body() body: Omit<Review, 'id' | 'createdAt'>) {
    return this.reviewsService.create(body);
  }
}
