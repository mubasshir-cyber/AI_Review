import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { db } from '../../../database/store';
import { Branch, User } from '../../../../types';

@Injectable()
export class BranchesService {
  async findAll(requestedBusinessId?: string, user?: User) {
    let effectiveBusinessId = requestedBusinessId;

    if (user && user.role === 'BUSINESS_OWNER') {
      let ownerBiz = user.businessId ? await db.getBusinessById(user.businessId) : undefined;
      if (!ownerBiz) {
        ownerBiz = await db.getBusinessByOwnerId(user.id);
      }
      if (!ownerBiz) {
        const list = await db.getBusinesses(user.id);
        if (list.length > 0) ownerBiz = list[0];
      }

      if (ownerBiz) {
        effectiveBusinessId = ownerBiz.id;
      } else {
        return { message: 'No business found for user', data: [] };
      }
    }

    const list = await db.getBranches(effectiveBusinessId);
    return { message: 'Branches retrieved successfully', data: list };
  }

  async findPublic(businessId?: string) {
    const list = await db.getBranches(businessId);
    return { message: 'Public branches retrieved successfully', data: list };
  }

  async findOne(id: string) {
    const branch = await db.getBranchById(id);
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }
    return { message: 'Branch retrieved successfully', data: branch };
  }

  async create(dto: Omit<Branch, 'id' | 'createdAt' | 'totalReviews' | 'avgRating'>, user?: User) {
    if (!dto.businessId) {
      throw new BadRequestException('businessId is required to create a branch');
    }

    if (user && user.role === 'BUSINESS_OWNER') {
      let ownerBiz = user.businessId ? await db.getBusinessById(user.businessId) : undefined;
      if (!ownerBiz) {
        ownerBiz = await db.getBusinessByOwnerId(user.id);
      }
      if (!ownerBiz || ownerBiz.id !== dto.businessId) {
        throw new ForbiddenException('You can only create branches for your own business');
      }
    }

    try {
      const created = await db.createBranch(dto);
      return { message: 'Branch created successfully', data: created };
    } catch (err: any) {
      throw new BadRequestException(err.message || 'Could not create branch');
    }
  }

  async update(id: string, dto: Partial<Branch>, user?: User) {
    const current = await db.getBranchById(id);
    if (!current) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }

    if (user && user.role === 'BUSINESS_OWNER') {
      let ownerBiz = user.businessId ? await db.getBusinessById(user.businessId) : undefined;
      if (!ownerBiz) {
        ownerBiz = await db.getBusinessByOwnerId(user.id);
      }
      if (!ownerBiz || ownerBiz.id !== current.businessId) {
        throw new ForbiddenException('You can only update branches for your own business');
      }
    }

    const updated = await db.updateBranch(id, dto);
    return { message: 'Branch updated successfully', data: updated };
  }

  async remove(id: string, user?: User) {
    const current = await db.getBranchById(id);
    if (!current) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }

    if (user && user.role === 'BUSINESS_OWNER') {
      let ownerBiz = user.businessId ? await db.getBusinessById(user.businessId) : undefined;
      if (!ownerBiz) {
        ownerBiz = await db.getBusinessByOwnerId(user.id);
      }
      if (!ownerBiz || ownerBiz.id !== current.businessId) {
        throw new ForbiddenException('You can only delete branches for your own business');
      }
    }

    const deleted = await db.deleteBranch(id);
    return { message: 'Branch deleted successfully', data: null };
  }
}
