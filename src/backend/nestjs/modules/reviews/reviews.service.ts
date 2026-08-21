import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { db } from '../../../database/store';
import { generateGoogleReview } from '../../../services/aiService';
import { Review, User } from '../../../../types';
import { TokenUsageService } from '../token-usage/token-usage.service';

@Injectable()
export class ReviewsService {
  constructor(
    @Inject(TokenUsageService) private readonly tokenUsageService: TokenUsageService
  ) {}

  async generateAiReview(body: {
    branchId?: string;
    businessName?: string;
    branchName?: string;
    rating?: number;
    serviceTags?: string[];
    selectedTags?: string[];
    customNote?: string;
    language?: string;
  }) {
    let branchId = body.branchId;
    let businessId: string | undefined;
    let businessName = body.businessName;
    let branchName = body.branchName;
    let category = "";

    // 1. Resolve Branch and Business automatically from branchId (QR flow)
    if (branchId) {
      const branch = await db.getBranchById(branchId);
      if (branch) {
        businessId = branch.businessId;
        branchName = branch.name;
        const biz = await db.getBusinessById(branch.businessId);
        if (biz) {
          businessName = biz.name;
          category = biz.category;
        }
      }
    }

    // Fallback: Resolve by businessName & branchName if branchId not found
    if (!businessId && businessName) {
      const businesses = await db.getBusinesses();
      const matchBiz = businesses.find(b => b.name.toLowerCase() === businessName?.toLowerCase());
      if (matchBiz) {
        businessId = matchBiz.id;
        category = matchBiz.category;
        if (!branchId) {
          const branches = await db.getBranches(businessId);
          const matchBr = branches.find(b => b.name.toLowerCase() === branchName?.toLowerCase());
          if (matchBr) branchId = matchBr.id;
        }
      }
    }

    // Ultimate fallback if missing
    if (!businessId) {
      const businesses = await db.getBusinesses();
      const firstBiz = businesses[0];
      businessId = firstBiz?.id || 'biz-smile';
      businessName = businessName || firstBiz?.name || 'Smile Dental Clinic';
      category = category || firstBiz?.category || 'General Service';
      const branches = await db.getBranches(businessId);
      const firstBranch = branches[0];
      branchId = branchId || firstBranch?.id || 'branch-smile-main';
      branchName = branchName || firstBranch?.name || 'Main Branch';
    }

    // 2. Pre-Check Monthly Token Limit (Throws 429 if limit exceeded)
    await this.tokenUsageService.checkTokenLimit(businessId);

    // 3. Call Gemini / OpenRouter AI Engine
    const tags = body.serviceTags || body.selectedTags || [];
    const aiResult = await generateGoogleReview({
      businessId,
      branchId,
      businessName: businessName || 'Business',
      category: category,
      location: branchName || '',
      rating: body.rating || 5,
      experience: body.customNote || 'Great overall experience',
      keywords: tags,
      tone: 'natural and friendly',
      length: 'medium',
      language: body.language || 'English',
    });

    // 4. Record Token Usage Transaction & Calculate Model Costs
    const usageResult = await this.tokenUsageService.recordUsage({
      businessId,
      branchId,
      provider: aiResult.provider,
      model: aiResult.model,
      promptTokens: aiResult.promptTokens,
      completionTokens: aiResult.completionTokens,
      totalTokens: aiResult.totalTokens,
      status: 'SUCCESS',
    });

    // 5. Return response adhering strictly to platform standard
    return {
      success: true,
      message: 'Review generated successfully',
      data: {
        reviewText: aiResult.reviewText,
        provider: aiResult.provider,
        model: aiResult.model,
        promptTokens: aiResult.promptTokens,
        completionTokens: aiResult.completionTokens,
        totalTokens: aiResult.totalTokens,
        estimatedCost: usageResult.estimatedCost,
        remainingTokens: usageResult.remainingTokens,
        tokenUsageId: usageResult.usageRecord.id,
      },
    };
  }

  async findAll(requestedBusinessId?: string, branchId?: string, user?: User) {
    let effectiveBusinessId = requestedBusinessId;

    if (user && user.role === 'BUSINESS_OWNER') {
      let ownerBiz = user.businessId ? await db.getBusinessById(user.businessId) : undefined;
      if (!ownerBiz) {
        ownerBiz = await db.getBusinessByOwnerId(user.id);
      }
      if (ownerBiz) {
        effectiveBusinessId = ownerBiz.id;
      } else {
        return { message: 'No business found for user', data: [] };
      }
    }

    const list = await db.getReviews(effectiveBusinessId, branchId);
    return { message: 'Reviews retrieved successfully', data: list };
  }

  async create(dto: Omit<Review, 'id' | 'createdAt'>) {
    const review = await db.addReview(dto);
    return { message: 'Review logged successfully', data: review };
  }
}

