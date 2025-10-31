import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  HealthCheckService,
  HealthCheck,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Verificação geral de saúde da aplicação' })
  @ApiResponse({
    status: 200,
    description: 'Aplicação saudável',
  })
  @ApiResponse({
    status: 503,
    description: 'Serviço indisponível',
  })
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024), // 150MB
      () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024), // 150MB
    ]);
  }

  @Get('ready')
  @ApiOperation({ summary: 'Verificação de prontidão da aplicação' })
  @ApiResponse({
    status: 200,
    description: 'Aplicação pronta para receber requisições',
  })
  @HealthCheck()
  readiness() {
    return this.health.check([
      // Notification service doesn't have direct DB connection
      // Just check memory
      () => this.memory.checkHeap('memory_heap', 100 * 1024 * 1024), // 100MB
    ]);
  }

  @Get('live')
  @ApiOperation({ summary: 'Verificação de vivacidade da aplicação' })
  @ApiResponse({
    status: 200,
    description: 'Aplicação está viva',
  })
  @HealthCheck()
  liveness() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 200 * 1024 * 1024), // 200MB
    ]);
  }
}
