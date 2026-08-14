import { Controller, Get } from '@nestjs/common';
import { db } from '../../../database/store';
import { Public } from '../../common/decorators/public.decorator';

@Controller('health')
export class HealthController {
  @Public()
  @Get()
  async getHealth() {
    const isDbConnected = await db.checkConnection();
    return {
      status: isDbConnected ? 'ok' : 'error',
      isDbConnected,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      framework: 'NestJS',
      service: 'ReviewScore AI Core Engine',
      database: isDbConnected ? 'PostgreSQL Connected' : 'database is not connected',
    };
  }
}
