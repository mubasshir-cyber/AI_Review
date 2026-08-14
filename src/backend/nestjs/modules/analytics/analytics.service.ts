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

  async getQrScans(businessId: string, user?: User) {
    // Validate if the requesting user is allowed to access this business's stats
    if (user && user.role === 'BUSINESS_OWNER') {
      let ownerBiz = user.businessId ? await db.getBusinessById(user.businessId) : undefined;
      if (!ownerBiz) {
        ownerBiz = await db.getBusinessByOwnerId(user.id);
      }
      if (ownerBiz && ownerBiz.id !== businessId) {
        throw new Error('Forbidden: Cannot access QR scans of another business');
      }
    }

    const analytics = await db.getQrScanAnalytics(businessId);
    return { message: 'QR Scan analytics retrieved successfully', data: analytics };
  }
}
