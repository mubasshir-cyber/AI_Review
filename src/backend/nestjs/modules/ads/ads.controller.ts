import { Controller, Get, Post, Put, Delete, Param, Query, Body, Inject } from '@nestjs/common';
import { AdsService } from './ads.service';
import { Advertisement } from '../../../../types';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('ads')
export class AdsController {
  constructor(@Inject(AdsService) private readonly adsService: AdsService) {}

  @Public()
  @Get()
  findAll(@Query('all') all?: string) {
    return this.adsService.findAll(all === 'true');
  }

  @Roles('AGENCY_ADMIN')
  @Post()
  create(@Body() body: Omit<Advertisement, 'id' | 'createdAt' | 'impressions' | 'clicks'>) {
    return this.adsService.create(body);
  }

  @Roles('AGENCY_ADMIN')
  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<Advertisement>) {
    return this.adsService.update(id, body);
  }

  @Roles('AGENCY_ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adsService.remove(id);
  }
}
