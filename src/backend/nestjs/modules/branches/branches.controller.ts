import { Controller, Get, Post, Put, Delete, Param, Query, Body, Inject } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { Branch, User } from '../../../../types';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('branches')
export class BranchesController {
  constructor(@Inject(BranchesService) private readonly branchesService: BranchesService) {}

  @Roles('AGENCY_ADMIN', 'BUSINESS_OWNER')
  @Get()
  findAll(@Query('businessId') businessId?: string, @CurrentUser() user?: any) {
    return this.branchesService.findAll(businessId, user);
  }

  @Public()
  @Get('public')
  findPublic(@Query('businessId') businessId?: string) {
    return this.branchesService.findPublic(businessId);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.branchesService.findOne(id);
  }

  @Roles('AGENCY_ADMIN', 'BUSINESS_OWNER')
  @Post()
  create(@Body() body: Omit<Branch, 'id' | 'createdAt' | 'totalReviews' | 'avgRating'>, @CurrentUser() user?: any) {
    return this.branchesService.create(body, user);
  }

  @Roles('AGENCY_ADMIN', 'BUSINESS_OWNER')
  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<Branch>, @CurrentUser() user?: any) {
    return this.branchesService.update(id, body, user);
  }

  @Roles('AGENCY_ADMIN', 'BUSINESS_OWNER')
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user?: any) {
    return this.branchesService.remove(id, user);
  }
}
