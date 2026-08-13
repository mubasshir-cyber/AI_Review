import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { db } from '../../../database/store';
import { Feedback, User } from '../../../../types';

@Injectable()
export class FeedbackService {
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

    const list = await db.getFeedback(effectiveBusinessId, branchId);
    return { message: 'Feedback list retrieved successfully', data: list };
  }

  async create(dto: Omit<Feedback, 'id' | 'createdAt' | 'status'>) {
    const created = await db.addFeedback(dto);
    return { message: 'Feedback submitted successfully', data: created };
  }

  async update(id: string, dto: Partial<Feedback>, user?: User) {
    const current = await db.getFeedbackById ? await db.getFeedbackById(id) : undefined;
    if (user && user.role === 'BUSINESS_OWNER' && current) {
      let ownerBiz = user.businessId ? await db.getBusinessById(user.businessId) : undefined;
      if (!ownerBiz) ownerBiz = await db.getBusinessByOwnerId(user.id);
      if (ownerBiz && current.businessId && ownerBiz.id !== current.businessId) {
        throw new ForbiddenException('You can only update feedback for your own business');
      }
    }

    const updated = await db.updateFeedback(id, dto);
    if (!updated) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }
    return { message: 'Feedback updated successfully', data: updated };
  }
}
