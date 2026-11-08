import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Patterns } from '@nara/common';
import { AnalizadorService } from './analizador.service';

@Controller()
export class AnalizadorController {
  constructor(private readonly analizador: AnalizadorService) {}

  @MessagePattern(Patterns.ANALIZADOR_PANEL)
  panel(@Payload() d: { token: string | null }) {
    return this.analizador.panel(d.token);
  }

  @MessagePattern(Patterns.ANALIZADOR_PERSONA)
  persona(@Payload() d: { token: string | null; id: string }) {
    return this.analizador.persona(d.token, d.id);
  }

  @MessagePattern(Patterns.INFORMES_ANALIZADOR)
  informe(@Payload() d: { token: string | null }) {
    return this.analizador.informe(d.token);
  }

  @MessagePattern(Patterns.EVENTOS_LOTE)
  eventosLote(@Payload() d: { token: string | null; body: Record<string, unknown> }) {
    return this.analizador.eventosLote(d.token, d.body || {});
  }
}
