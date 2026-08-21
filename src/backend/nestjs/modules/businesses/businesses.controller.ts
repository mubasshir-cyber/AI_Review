import { Controller, Get, Post, Put, Delete, Param, Query, Body, Inject } from '@nestjs/common';
import { BusinessesService } from './businesses.service';
import { Business, User } from '../../../../types';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('businesses')
export class BusinessesController {
  constructor(@Inject(BusinessesService) private readonly businessesService: BusinessesService) {}

  @Roles('AGENCY_ADMIN', 'BUSINESS_OWNER')
  @Get()
  findAll(@Query('ownerId') ownerId?: string, @CurrentUser() user?: any) {
    return this.businessesService.findAll(ownerId, user);
  }

  @Public()
  @Get('public')
  findPublic() {
    return this.businessesService.findAll();
  }

  @Roles('AGENCY_ADMIN', 'BUSINESS_OWNER')
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user?: any) {
    return this.businessesService.findOne(id, user);
  }

  @Roles('AGENCY_ADMIN')
  @Post()
  create(@Body() body: {
    name: string;
    ownerName: string;
    ownerEmail: string;
    password: string;
    phone?: string;
    googleReviewUrl?: string;
    category?: string;
    planId?: string;
    logoUrl?: string;
    branchLimit?: number;
    monthlyTokenLimit?: number;
    aiGrounding?: any;
  }) {
    return this.businessesService.create(body);
  }

  @Roles('AGENCY_ADMIN', 'BUSINESS_OWNER')
  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<Business> & { password?: string }, @CurrentUser() user?: any) {
    return this.businessesService.update(id, body, user);
  }

  @Roles('AGENCY_ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.businessesService.remove(id);
  }
}
