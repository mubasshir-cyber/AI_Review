import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { db } from '../../../database/store';
import { Business, User } from '../../../../types';

@Injectable()
export class BusinessesService {
  async findAll(requestedOwnerId?: string, user?: User) {
    if (user && user.role === 'BUSINESS_OWNER') {
      let bizList: Business[] = [];
      if (user.businessId) {
        const b = await db.getBusinessById(user.businessId);
        if (b) bizList.push(b);
      }
      if (bizList.length === 0) {
        bizList = await db.getBusinesses(user.id);
      }
      return { message: 'Businesses retrieved successfully', data: bizList };
    }

    const list = await db.getBusinesses(requestedOwnerId);
    return { message: 'Businesses retrieved successfully', data: list };
  }

  async findOne(id: string, user?: User) {
    const biz = await db.getBusinessById(id);
    if (!biz) {
      throw new NotFoundException(`Business with ID ${id} not found`);
    }

    if (user && user.role === 'BUSINESS_OWNER') {
      const isOwner = biz.ownerId === user.id || biz.id === user.businessId || biz.ownerEmail?.toLowerCase() === user.email?.toLowerCase();
      if (!isOwner) {
        throw new ForbiddenException('You do not have permission to view this business');
      }
    }

    return { message: 'Business retrieved successfully', data: biz };
  }

  async create(dto: {
    name: string;
    ownerName: string;
    ownerEmail: string;
    password: string;
    category?: string;
    planId?: string;
    logoUrl?: string;
    branchLimit?: number;
    monthlyTokenLimit?: number;
  }) {
    if (!dto.name || !dto.name.trim()) {
      throw new BadRequestException('Business Name is required.');
    }
    if (!dto.ownerName || !dto.ownerName.trim()) {
      throw new BadRequestException('Owner Name is required.');
    }
    if (!dto.ownerEmail || !dto.ownerEmail.trim()) {
      throw new BadRequestException('Owner Email address is required.');
    }
    if (!dto.password || !dto.password.trim()) {
      throw new BadRequestException('Password is required.');
    }
    if (dto.password.trim().length < 6) {
      throw new BadRequestException('Password must be at least 6 characters long.');
    }

    const cleanEmail = dto.ownerEmail.trim().toLowerCase();
    const existingUser = await db.getUserByEmail(cleanEmail);
    if (existingUser) {
      throw new BadRequestException('An account with this email address already exists in the database.');
    }

    const { business, user } = await db.createBusinessWithAccount({
      name: dto.name.trim(),
      ownerName: dto.ownerName.trim(),
      ownerEmail: cleanEmail,
      password: dto.password.trim(),
      category: dto.category,
      planId: dto.planId,
      logoUrl: dto.logoUrl,
      branchLimit: dto.branchLimit,
      monthlyTokenLimit: dto.monthlyTokenLimit,
    });

    return {
      message: 'Business and owner account created successfully',
      data: { business, user },
    };
  }

  async update(id: string, dto: Partial<Business> & { password?: string }, user?: User) {
    const currentBiz = await db.getBusinessById(id);
    if (!currentBiz) {
      throw new NotFoundException(`Business with ID ${id} not found`);
    }

    if (user && user.role === 'BUSINESS_OWNER') {
      const isOwner = currentBiz.ownerId === user.id || currentBiz.id === user.businessId || currentBiz.ownerEmail?.toLowerCase() === user.email?.toLowerCase();
      if (!isOwner) {
        throw new ForbiddenException('You can only update your own business');
      }
    }

    const { password, ...bizUpdates } = dto;
    const updated = await db.updateBusiness(id, bizUpdates);

    // If password provided, update user account password
    if (password && password.trim()) {
      if (password.trim().length < 6) {
        throw new BadRequestException('Password must be at least 6 characters long.');
      }
      if (currentBiz.ownerEmail) {
        await db.updateUserPassword(currentBiz.ownerEmail, password.trim());
      }
      if (currentBiz.ownerId) {
        await db.updateUserPassword(currentBiz.ownerId, password.trim());
      }
    }

    return { message: 'Business updated successfully', data: updated };
  }

  async remove(id: string) {
    const deleted = await db.deleteBusiness(id);
    if (!deleted) {
      throw new NotFoundException(`Business with ID ${id} not found`);
    }
    return { message: 'Business deleted successfully', data: null };
  }
}
