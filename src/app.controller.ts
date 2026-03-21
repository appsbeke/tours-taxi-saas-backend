import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DataSource } from 'typeorm';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private dataSource: DataSource) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  async healthCheck() {
    const dbConnected = this.dataSource.isInitialized;
    
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: dbConnected ? 'connected' : 'disconnected',
      uptime: process.uptime(),
    };
  }

  @Get()
  getRoot() {
    return {
      message: 'Tours and Taxi Booking Platform API',
      version: '1.0.0',
      documentation: '/api/docs',
    };
  }
}
