import { Controller, Get } from '@nestjs/common';
import type { ApiResponseEnvelope } from '../shared/api-response-envelope';

@Controller('health')
export class HealthController {
  @Get()
  getHealth(): ApiResponseEnvelope<{ ok: true }> {
    return {
      success: true,
      data: { ok: true },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: 'health',
      },
    };
  }
}


