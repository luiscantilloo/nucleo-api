import assert from 'node:assert/strict';
import { test } from 'node:test';
import { evaluarInstrumento } from '../libs/reglas/src/puntaje.ts';
import { aplicarReglasRuta } from '../libs/reglas/src/ruta.ts';
import { redactTextForTeo } from '../libs/privacidad/src/redact.ts';
import { loadProgram, resetProgramCache } from '../libs/program/src/load-program.ts';

process.env.PROGRAM_ID = 'parienta';
resetProgramCache();

test('loadProgram carga plateado', () => {
  const p = loadProgram('plateado');
  assert.equal(p.id, 'plateado');
  assert.ok(p.crisis.categorias.riesgo_suicida);
  assert.ok(p.instrumentos.animo);
});

test('puntaje de instrumento provisional', () => {
  const p = loadProgram('plateado');
  const animo = p.instrumentos.animo as {
    id: string;
    preguntas: { i: number; texto: string; opciones: { v: number; label: string }[] }[];
    cortes: { max: number; nivel: string }[];
  };
  const r = evaluarInstrumento(animo, { '1': 1, '2': 1, '3': 0 });
  assert.equal(r.total, 2);
  assert.equal(r.nivel, 'alto');
});

test('R5 sin cuidador quita orientación y agrega llamada', () => {
  const r = aplicarReglasRuta({
    servicios: ['orientacion_cuidador', 'recordatorios'],
    tieneCuidador: false,
    alertasAbiertas: [],
    reglas: [
      {
        id: 'R5',
        si: 'sin_cuidador',
        quitar: ['orientacion_cuidador'],
        agregar: ['llamada_acompanamiento'],
      },
    ],
  });
  assert.ok(!r.servicios.includes('orientacion_cuidador'));
  assert.ok(r.servicios.includes('llamada_acompanamiento'));
});

test('R6 alerta abandono bloquea quitar protección', () => {
  const r = aplicarReglasRuta({
    servicios: ['visita_domiciliaria'],
    tieneCuidador: true,
    alertasAbiertas: ['abandono_maltrato'],
    reglas: [
      {
        id: 'R6',
        si: 'alerta_abierta:abandono_maltrato',
        agregar: ['proteccion'],
        bloquear_quitar: true,
      },
    ],
  });
  assert.ok(r.servicios.includes('proteccion'));
  assert.ok(r.bloqueados.includes('proteccion'));
});

test('privacidad redacta correo y teléfono', () => {
  const out = redactTextForTeo('escriba a ana@correo.com o al 3001234567');
  assert.ok(out.includes('[correo]'));
  assert.ok(out.includes('[teléfono]'));
});
