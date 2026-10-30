import { Controller, Get, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { Patterns } from '@nara/common';
import { ProxyService } from '../proxy/proxy.service';
import { readToken, sendResult } from '../proxy/http';
import { publicProgramView, loadProgram } from '../../../../libs/program/src/load-program';

@Controller()
export class HealthController {
  constructor(private readonly proxy: ProxyService) {}

  /** Público (lo usa el monitor). SPEC-10 FR-10.5: incluye el commit desplegado. */
  @Get('health')
  health() {
    return {
      ok: true,
      service: 'nucleo-gateway',
      programId: process.env.PROGRAM_ID || 'parienta',
      commit: process.env.NARA_COMMIT || process.env.RENDER_GIT_COMMIT || null,
    };
  }

  /** Configuración pública del programa (arquitectura §6). */
  @Get('program')
  program() {
    try {
      loadProgram(process.env.PROGRAM_ID || 'parienta');
      return { ok: true, program: publicProgramView() };
    } catch (e) {
      return {
        ok: false,
        status: 500,
        error: e instanceof Error ? e.message : 'Programa no cargado',
      };
    }
  }

  /** SPEC-05 FR-05.2: solo admin (401 sin sesión, 403 otro rol). */
  @Get('health/db')
  async healthDb(@Req() req: Request, @Res() res: Response) {
    try {
      const result = await this.proxy.send<Record<string, unknown>>('ops', Patterns.HEALTH_DB, { token: readToken(req) });
      return sendResult(res, result);
    } catch {
      return res.status(503).json({ ok: false, error: 'ops offline' });
    }
  }
}
