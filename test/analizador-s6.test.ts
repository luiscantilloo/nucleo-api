// TRL6 A-01 §6: patrones nuevos y política de lectura del analizador.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Patterns } from '../libs/common/src/patterns.ts';
import { filtrarLectura } from '../apps/ops/src/app-state/app-state.policy.ts';

test('patterns §6 existen', () => {
  assert.equal(Patterns.EVENTOS_LOTE, 'ops.eventos.lote');
  assert.equal(Patterns.ANALIZADOR_PANEL, 'ops.analizador.panel');
  assert.equal(Patterns.ANALIZADOR_PERSONA, 'ops.analizador.persona');
  assert.equal(Patterns.INFORMES_ANALIZADOR, 'ops.informes.analizador');
});

test('experto sin analizadorByPid; clínico con territorio', () => {
  const slices = {
    rules: { v: 1 },
    analizadorByPid: {
      a: { estado: 'estable', lecturas: 1 },
      b: { estado: 'cambio' },
    },
  };
  const ids = new Set(['a']);
  const e = filtrarLectura(slices, { id: 'e1', roleId: 'experto', terr: 'T' }, ids);
  assert.equal(e.analizadorByPid, undefined);
  const c = filtrarLectura(slices, { id: 'c1', roleId: 'clinico', terr: 'T' }, ids);
  assert.deepEqual(c.analizadorByPid, { a: { estado: 'estable', lecturas: 1 } });
});
