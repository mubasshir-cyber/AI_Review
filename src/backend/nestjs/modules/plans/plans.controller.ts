import { Controller, Get, Post, Put, Delete, Param, Body, Inject } from '@nestjs/common';
import { PlansService } from './plans.service';
import { Plan } from '../../../../types';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('plans')
export class PlansController {
  constructor(@Inject(PlansService) private readonly plansService: PlansService) {}

  @Public()
  @Get()
  findAll() {
    return this.plansService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.plansService.findOne(id);
  }

  @Roles('AGENCY_ADMIN')
  @Post()
  create(@Body() body: Omit<Plan, 'id'>) {
    return this.plansService.create(body);
  }

  @Roles('AGENCY_ADMIN')
  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<Plan>) {
    return this.plansService.update(id, body);
  }

  @Roles('AGENCY_ADMIN')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.plansService.delete(id);
  }
}
