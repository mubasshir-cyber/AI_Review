import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../../../database/store';
import { Advertisement } from '../../../../types';

@Injectable()
export class AdsService {
  async findAll(all?: boolean) {
    const list = all ? await db.getAllAds() : await db.getAds();
    return { message: 'Advertisements retrieved successfully', data: list };
  }

  async create(dto: Omit<Advertisement, 'id' | 'createdAt' | 'impressions' | 'clicks'>) {
    const created = await db.createAd(dto);
    return { message: 'Advertisement banner created successfully', data: created };
  }

  async update(id: string, dto: Partial<Advertisement>) {
    const updated = await db.updateAd(id, dto);
    if (!updated) {
      throw new NotFoundException(`Advertisement banner with ID ${id} not found`);
    }
    return { message: 'Advertisement banner updated successfully', data: updated };
  }

  async remove(id: string) {
    const deleted = await db.deleteAd(id);
    if (!deleted) {
      throw new NotFoundException(`Advertisement banner with ID ${id} not found`);
    }
    return { message: 'Advertisement banner deleted successfully', data: null };
  }
}
