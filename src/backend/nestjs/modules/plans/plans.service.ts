import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../../../database/store';
import { Plan } from '../../../../types';

@Injectable()
export class PlansService {
  async findAll() {
    const list = await db.getPlans();
    return { message: 'SaaS Plans retrieved successfully', data: list };
  }

  async findOne(id: string) {
    const plan = await db.getPlanById(id);
    if (!plan) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }
    return { message: 'Plan retrieved successfully', data: plan };
  }

  async create(dto: Omit<Plan, 'id'>) {
    const created = await db.createPlan(dto);
    return { message: 'SaaS Plan created successfully', data: created };
  }

  async update(id: string, dto: Partial<Plan>) {
    const updated = await db.updatePlan(id, dto);
    if (!updated) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }
    return { message: 'SaaS Plan updated successfully', data: updated };
  }

  async delete(id: string) {
    const deleted = await db.deletePlan(id);
    if (!deleted) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }
    return { message: 'SaaS Plan deleted successfully' };
  }
}
