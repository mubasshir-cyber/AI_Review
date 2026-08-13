import { Injectable, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { db } from '../../../database/store';
import { TokenUsage } from '../../../../types';

@Injectable()
export class TokenUsageService {
  /**
   * Pre-check business AI token limits, status, and subscription before invoking Gemini
   */
  async checkTokenLimit(businessId: string) {
    const business = await db.getBusinessById(businessId);
    if (!business) {
      throw new NotFoundException(`Business with ID ${businessId} not found`);
    }

    // 1. Business Status Check (Suspended/Inactive)
    if (business.status === 'SUSPENDED' || (business.status as string) === 'INACTIVE' || (business.status as string) === 'EXPIRED') {
      throw new HttpException(
        {
          success: false,
          code: 'BUSINESS_SUSPENDED',
          message: 'This business is currently unavailable.',
        },
        HttpStatus.FORBIDDEN
      );
    }

    // 2. Subscription Expiry Check
    const sub = await db.getSubscriptionByBusinessId(businessId);
    if (sub) {
      const isExpired = sub.status === 'CANCELLED' || sub.status === 'PAST_DUE' || (sub.expiresAt && new Date(sub.expiresAt).getTime() < Date.now());
      if (isExpired) {
        throw new HttpException(
          {
            success: false,
            code: 'SUBSCRIPTION_EXPIRED',
            message: 'This business subscription has expired.',
          },
          HttpStatus.FORBIDDEN
        );
      }
    }

    // 3. Token Quota Limit Check
    const monthlyLimit = business.monthlyTokenLimit || 50000;
    const tokensUsed = business.tokensUsedThisMonth || 0;
    const remainingTokens = business.remainingTokens !== undefined
      ? business.remainingTokens
      : Math.max(0, monthlyLimit - tokensUsed);

    const usagePercent = monthlyLimit > 0 ? (tokensUsed / monthlyLimit) * 100 : 0;

    if (remainingTokens <= 0 || tokensUsed >= monthlyLimit) {
      throw new HttpException(
        {
          success: false,
          code: 'QUOTA_EXHAUSTED',
          message: 'Your monthly AI token limit has been reached. Please contact the administrator or upgrade your plan.',
          usagePercent: 100,
          tokensUsed,
          monthlyLimit,
        },
        HttpStatus.TOO_MANY_REQUESTS // 429
      );
    }

    let warningLevel: 'NORMAL' | 'WARNING_80' | 'CRITICAL_90' | 'CRITICAL_100' = 'NORMAL';
    if (usagePercent >= 90) {
      warningLevel = 'CRITICAL_90';
    } else if (usagePercent >= 80) {
      warningLevel = 'WARNING_80';
    }

    return {
      business,
      monthlyLimit,
      tokensUsed,
      remainingTokens,
      usagePercent: Math.round(usagePercent),
      warningLevel,
    };
  }

  /**
   * Calculate cost and record actual token usage returned by Gemini
   */
  async recordUsage(params: {
    businessId: string;
    branchId?: string;
    reviewId?: string;
    provider: string;
    model: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    status?: 'SUCCESS' | 'EXCEEDED' | 'FAILED';
  }) {
    const {
      businessId, branchId, reviewId,
      provider = 'Google', model = 'gemini-1.5-flash',
      promptTokens, completionTokens, totalTokens,
      status = 'SUCCESS'
    } = params;

    // Get pricing from database
    const modelPricing = await db.getAiModelByName(model);
    const inputCostPer1m = modelPricing?.inputCostPer1m ?? 0.075;
    const outputCostPer1m = modelPricing?.outputCostPer1m ?? 0.300;

    const estimatedCost = parseFloat(
      (
        (promptTokens / 1000000) * inputCostPer1m +
        (completionTokens / 1000000) * outputCostPer1m
      ).toFixed(6)
    );

    // Record token usage transaction
    const usageRecord = await db.addTokenUsage({
      businessId,
      branchId,
      reviewId,
      provider,
      model,
      promptTokens,
      completionTokens,
      totalTokens,
      estimatedCost,
      requestStatus: status,
    });

    // Update business counters in store/DB
    const updatedBiz = await db.updateBusinessTokenUsage(businessId, totalTokens);

    return {
      usageRecord,
      remainingTokens: updatedBiz?.remainingTokens ?? 0,
      monthlyTokensUsed: updatedBiz?.tokensUsedThisMonth ?? 0,
      estimatedCost,
    };
  }

  /**
   * Get list of usage records
   */
  async findAll(businessId?: string, branchId?: string) {
    const records = await db.getTokenUsageList(businessId, branchId);
    return {
      success: true,
      message: 'Token usage records retrieved successfully',
      data: records,
    };
  }

  /**
   * Get token usage for specific business
   */
  async getBusinessUsage(businessId: string) {
    const records = await db.getTokenUsageList(businessId);
    const business = await db.getBusinessById(businessId);
    return {
      success: true,
      message: `Token usage for business ${businessId}`,
      data: {
        business,
        history: records,
      },
    };
  }

  /**
   * Get token usage for specific branch
   */
  async getBranchUsage(branchId: string) {
    const records = await db.getTokenUsageList(undefined, branchId);
    return {
      success: true,
      message: `Token usage for branch ${branchId}`,
      data: records,
    };
  }

  /**
   * Consolidated Business & Agency Dashboard Statistics
   */
  async getDashboardSummary(businessId?: string) {
    const allRecords = await db.getTokenUsageList();
    const businesses = await db.getBusinesses();
    const branches = await db.getBranches();

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    if (businessId) {
      // BUSINESS DASHBOARD STATS
      const biz = await db.getBusinessById(businessId);
      const bizRecords = allRecords.filter(r => r.businessId === businessId);

      const monthlyLimit = biz?.monthlyTokenLimit || 50000;
      const usedTokens = biz?.tokensUsedThisMonth || 0;
      const remainingTokens = biz?.remainingTokens ?? Math.max(0, monthlyLimit - usedTokens);

      const todayRecords = bizRecords.filter(r => new Date(r.createdAt).getTime() >= startOfToday);
      const todayTokens = todayRecords.reduce((acc, r) => acc + r.totalTokens, 0);
      const todayCost = parseFloat(todayRecords.reduce((acc, r) => acc + r.estimatedCost, 0).toFixed(6));
      const monthlyCost = parseFloat(bizRecords.reduce((acc, r) => acc + r.estimatedCost, 0).toFixed(6));

      const avgTokensPerReview = bizRecords.length > 0
        ? Math.round(bizRecords.reduce((acc, r) => acc + r.totalTokens, 0) / bizRecords.length)
        : 185;

      return {
        success: true,
        message: 'Business AI Token Dashboard Stats',
        data: {
          monthlyTokenLimit: monthlyLimit,
          usedTokens,
          remainingTokens,
          todayTokens,
          todayCost,
          monthlyCost,
          avgTokensPerReview,
          totalReviewsGenerated: bizRecords.length,
        },
      };
    }

    // AGENCY DASHBOARD STATS
    const totalPlatformTokens = allRecords.reduce((acc, r) => acc + r.totalTokens, 0);
    const totalPlatformCost = parseFloat(allRecords.reduce((acc, r) => acc + r.estimatedCost, 0).toFixed(4));

    // Top Businesses By Usage
    const businessMap = new Map<string, { businessId: string; name: string; tokens: number; cost: number }>();
    businesses.forEach(b => {
      businessMap.set(b.id, { businessId: b.id, name: b.name, tokens: b.tokensUsedThisMonth || 0, cost: 0 });
    });
    allRecords.forEach(r => {
      const entry = businessMap.get(r.businessId);
      if (entry) {
        entry.cost += r.estimatedCost;
      }
    });

    const topBusinessesByUsage = Array.from(businessMap.values())
      .sort((a, b) => b.tokens - a.tokens)
      .slice(0, 10);

    // Top Branches By Usage
    const branchMap = new Map<string, { branchId: string; name: string; tokens: number; cost: number }>();
    allRecords.forEach(r => {
      if (r.branchId) {
        const br = branches.find(b => b.id === r.branchId);
        const name = br ? `${br.name}` : r.branchId;
        const current = branchMap.get(r.branchId) || { branchId: r.branchId, name, tokens: 0, cost: 0 };
        current.tokens += r.totalTokens;
        current.cost += r.estimatedCost;
        branchMap.set(r.branchId, current);
      }
    });

    const topBranchesByUsage = Array.from(branchMap.values())
      .sort((a, b) => b.tokens - a.tokens)
      .slice(0, 10);

    // Monthly & Daily Consumption
    const dailyMap = new Map<string, { date: string; tokens: number; cost: number }>();
    allRecords.forEach(r => {
      const dateStr = r.createdAt.substring(0, 10);
      const current = dailyMap.get(dateStr) || { date: dateStr, tokens: 0, cost: 0 };
      current.tokens += r.totalTokens;
      current.cost += r.estimatedCost;
      dailyMap.set(dateStr, current);
    });

    const dailyConsumption = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    return {
      success: true,
      message: 'Agency AI Token Accounting Platform Stats',
      data: {
        totalPlatformTokens,
        totalPlatformCost,
        topBusinessesByUsage,
        topBranchesByUsage,
        monthlyConsumption: {
          tokens: totalPlatformTokens,
          cost: totalPlatformCost,
        },
        dailyConsumption,
      },
    };
  }

  /**
   * Monthly Reset Engine
   */
  async resetMonthlyTokens() {
    const result = await db.resetMonthlyTokensForAll();
    return {
      success: true,
      message: 'Monthly AI token limits reset successfully',
      data: result,
    };
  }
}
