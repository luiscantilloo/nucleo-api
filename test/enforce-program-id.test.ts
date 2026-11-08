import assert from 'node:assert/strict';
import { describe, it, before, after } from 'node:test';
import type { Request, Response, NextFunction } from 'express';
import { enforceProgramId } from '../apps/gateway/src/request-log.ts';

function mockReq(headers: Record<string, string> = {}): Request {
  return { headers } as unknown as Request;
}

function mockRes(): Response & {
  statusCode: number;
  body: unknown;
  headers: Record<string, string>;
} {
  const r = {
    statusCode: 200,
    body: null as unknown,
    headers: {} as Record<string, string>,
    setHeader(k: string, v: string) {
      r.headers[k] = v;
      return r;
    },
    status(code: number) {
      r.statusCode = code;
      return r;
    },
    json(body: unknown) {
      r.body = body;
      return r;
    },
  };
  return r as unknown as Response & {
    statusCode: number;
    body: unknown;
    headers: Record<string, string>;
  };
}

describe('enforceProgramId (TRL6 Paso 0)', () => {
  let prev: string | undefined;

  before(() => {
    prev = process.env.PROGRAM_ID;
    process.env.PROGRAM_ID = 'quintia';
  });

  after(() => {
    if (prev === undefined) delete process.env.PROGRAM_ID;
    else process.env.PROGRAM_ID = prev;
  });

  it('sin header → next()', () => {
    let nextCalls = 0;
    const res = mockRes();
    enforceProgramId(mockReq(), res, (() => {
      nextCalls += 1;
    }) as NextFunction);
    assert.equal(nextCalls, 1);
    assert.equal(res.statusCode, 200);
  });

  it('x-program-id igual a PROGRAM_ID → next()', () => {
    let nextCalls = 0;
    const res = mockRes();
    enforceProgramId(mockReq({ 'x-program-id': 'quintia' }), res, (() => {
      nextCalls += 1;
    }) as NextFunction);
    assert.equal(nextCalls, 1);
  });

  it('alias consiente ≡ quintia → next()', () => {
    let nextCalls = 0;
    enforceProgramId(mockReq({ 'x-program-id': 'consiente' }), mockRes(), (() => {
      nextCalls += 1;
    }) as NextFunction);
    assert.equal(nextCalls, 1);
  });

  it('mismatch parienta → 403 program_mismatch', () => {
    let nextCalls = 0;
    const res = mockRes();
    enforceProgramId(mockReq({ 'x-program-id': 'parienta' }), res, (() => {
      nextCalls += 1;
    }) as NextFunction);
    assert.equal(nextCalls, 0);
    assert.equal(res.statusCode, 403);
    const body = res.body as { error?: string; programId?: string; clientProgramId?: string };
    assert.equal(body.error, 'program_mismatch');
    assert.equal(body.programId, 'quintia');
    assert.equal(body.clientProgramId, 'parienta');
  });

  it('mismatch nara → 403', () => {
    const res = mockRes();
    enforceProgramId(mockReq({ 'x-program-id': 'nara' }), res, (() => {}) as NextFunction);
    assert.equal(res.statusCode, 403);
    assert.equal((res.body as { error: string }).error, 'program_mismatch');
  });

  it('alias plateado ≡ parienta al servir parienta → next()', () => {
    process.env.PROGRAM_ID = 'parienta';
    let nextCalls = 0;
    enforceProgramId(mockReq({ 'x-program-id': 'plateado' }), mockRes(), (() => {
      nextCalls += 1;
    }) as NextFunction);
    assert.equal(nextCalls, 1);
    process.env.PROGRAM_ID = 'quintia';
  });
});

describe('health payload (db + startedAt)', () => {
  it('incluye db y startedAt en la forma esperada del Paso 0', () => {
    const prevDb = process.env.MONGODB_DB;
    process.env.MONGODB_DB = 'nucleo_consiente';
    process.env.PROGRAM_ID = 'quintia';
    const programId = process.env.PROGRAM_ID || 'parienta';
    const payload = {
      ok: true,
      service: 'nucleo-gateway',
      programId,
      commit: process.env.NARA_COMMIT || process.env.RENDER_GIT_COMMIT || null,
      db: process.env.MONGODB_DB || null,
      startedAt: new Date().toISOString(),
    };
    assert.equal(payload.programId, 'quintia');
    assert.equal(payload.db, 'nucleo_consiente');
    assert.match(payload.startedAt, /^\d{4}-\d{2}-\d{2}T/);
    if (prevDb === undefined) delete process.env.MONGODB_DB;
    else process.env.MONGODB_DB = prevDb;
  });
});
