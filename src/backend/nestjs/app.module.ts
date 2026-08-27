import { Module } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { BusinessesModule } from './modules/businesses/businesses.module';
import { BranchesModule } from './modules/branches/branches.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { PlansModule } from './modules/plans/plans.module';
import { AdsModule } from './modules/ads/ads.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { SettingsModule } from './modules/settings/settings.module';
import { TokenUsageModule } from './modules/token-usage/token-usage.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      name: 'default',
      ttl: 60000,
      limit: 100,
    }]),
    HealthModule,
    AuthModule,
    BusinessesModule,
    BranchesModule,
    ReviewsModule,
    FeedbackModule,
    PlansModule,
    AdsModule,
    AnalyticsModule,
    SettingsModule,
    TokenUsageModule,
  ],
  providers: [
    Reflector,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}

