import { Injectable } from '@nestjs/common';
import { db } from '../../../database/store';
import { User } from '../../../../types';

@Injectable()
export class AnalyticsService {
  async getAgencyStats() {
    const stats = await db.getAgencyStats();
    return { message: 'Agency analytics retrieved successfully', data: stats };
  }

  async getBusinessStats(requestedBizId: string, user?: User) {
    let effectiveBizId = requestedBizId;

    if (user && user.role === 'BUSINESS_OWNER') {
      let ownerBiz = user.businessId ? await db.getBusinessById(user.businessId) : undefined;
      if (!ownerBiz) {
        ownerBiz = await db.getBusinessByOwnerId(user.id);
      }
      if (ownerBiz) {
        effectiveBizId = ownerBiz.id;
      }
    }

    const stats = await db.getBusinessOwnerStats(effectiveBizId);
    return { message: 'Business owner analytics retrieved successfully', data: stats };
  }
}
