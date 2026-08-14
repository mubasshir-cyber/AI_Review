import { Injectable } from '@nestjs/common';
import { db } from '../../../database/store';
import { ApiKeyConfig, SystemSettings, Business, Branch } from '../../../../types';

@Injectable()
export class SettingsService {
  async getApiKeyConfig() {
    const config = await db.getApiKeyConfig();
    return { message: 'API Key Configuration retrieved successfully', data: config };
  }

  async updateApiKeyConfig(dto: Partial<ApiKeyConfig>) {
    const updated = await db.updateApiKeyConfig(dto);
    return { message: 'API Key Configuration updated successfully', data: updated };
  }

  async getSettings() {
    const settings = await db.getSettings();
    return { message: 'System settings retrieved successfully', data: settings };
  }

  async updateSettings(dto: Partial<SystemSettings>) {
    const updated = await db.updateSettings(dto);
    return { message: 'System settings updated successfully', data: updated };
  }

  async getAgencyProfile() {
    const result = await db.getAgencyProfile();
    return { message: 'Agency profile retrieved successfully', data: result };
  }

  async updateAgencyProfile(dto: { business?: Partial<Business>; branch?: Partial<Branch> }) {
    const result = await db.updateAgencyProfile(dto || {});
    return { message: 'Agency profile updated successfully', data: result };
  }

  async resetDemoData(bizId = 'biz-agency') {
    const res = await db.resetDemoData(bizId);
    return { message: res.message, data: res };
  }

  async seedDemoReviews(count = 5, bizId = 'biz-agency', branchId = 'branch-agency-main') {
    const reviews = await db.seedDemoReviews(count, bizId, branchId);
    return { message: `Generated ${reviews.length} demo reviews successfully`, data: reviews };
  }

  async seedDemoFeedback(count = 2, bizId = 'biz-agency', branchId = 'branch-agency-main') {
    const feedback = await db.seedDemoFeedback(count, bizId, branchId);
    return { message: `Generated ${feedback.length} demo feedback entries successfully`, data: feedback };
  }

  async recordQrScanTrack(dto: { branchId: string; businessId: string; deviceType?: string; browser?: string; city?: string; country?: string; referrer?: string }) {
    const result = await db.recordQrScanTrack(dto);
    return { message: 'QR scan tracked successfully', data: result };
  }

  async getQrScanAnalytics(businessId?: string, branchId?: string) {
    const analytics = await db.getQrScanAnalytics(businessId, branchId);
    return { message: 'QR scan analytics retrieved successfully', data: analytics };
  }
}
