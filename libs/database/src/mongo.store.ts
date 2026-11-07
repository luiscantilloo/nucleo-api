import { Injectable, OnModuleDestroy } from '@nestjs/common';
import dns from 'node:dns';
import { MongoClient, type Db, type Document } from 'mongodb';
import type { DocumentStore } from '@nara/common';

/** Hotspots / DNS captive rompen mongodb+srv (querySrv EBADRESP). */
function ensurePublicDnsForMongoSrv() {
  const raw = String(process.env.NODE_DNS_SERVERS || '1.1.1.1,8.8.8.8').trim();
  if (!raw || raw === 'system') return;
  const servers = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (!servers.length) return;
  try {
    const current = dns.getServers().join(',');
    if (current === servers.join(',')) return;
    dns.setServers(servers);
  } catch {
    /* ignore */
  }
}

@Injectable()
export class MongoStore implements DocumentStore, OnModuleDestroy {
  private client: MongoClient | null = null;
  private cachedDb: Db | null = null;

  private async ensure(): Promise<Db> {
    if (this.cachedDb) return this.cachedDb;
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('Falta MONGODB_URI');
    const dbName = process.env.MONGODB_DB || 'nara';
    ensurePublicDnsForMongoSrv();
    this.client = new MongoClient(uri);
    await this.client.connect();
    this.cachedDb = this.client.db(dbName);
    return this.cachedDb;
  }

  async onModuleDestroy() {
    await this.client?.close();
  }

  async ping() {
    const db = await this.ensure();
    await db.command({ ping: 1 });
    return { ok: true, db: db.databaseName };
  }

  async findOne(collection: string, filter: Record<string, unknown>) {
    const db = await this.ensure();
    const doc = await db.collection(collection).findOne(filter as Document);
    return doc ? (doc as unknown as Record<string, unknown>) : null;
  }

  async findMany(
    collection: string,
    filter: Record<string, unknown> = {},
    opts?: { sort?: Record<string, 1 | -1>; limit?: number; skip?: number },
  ) {
    const db = await this.ensure();
    let cursor = db.collection(collection).find(filter as Document);
    if (opts?.sort) cursor = cursor.sort(opts.sort);
    if (opts?.skip) cursor = cursor.skip(opts.skip);
    if (opts?.limit) cursor = cursor.limit(opts.limit);
    return (await cursor.toArray()) as unknown as Record<string, unknown>[];
  }

  async count(collection: string, filter: Record<string, unknown> = {}) {
    const db = await this.ensure();
    return db.collection(collection).countDocuments(filter);
  }

  async upsert(
    collection: string,
    filter: Record<string, unknown>,
    doc: Record<string, unknown>,
  ) {
    const db = await this.ensure();
    await db
      .collection(collection)
      .updateOne(filter, { $set: doc }, { upsert: true });
  }

  async updateOne(
    collection: string,
    filter: Record<string, unknown>,
    update: Record<string, unknown>,
  ) {
    const db = await this.ensure();
    const r = await db.collection(collection).updateOne(filter, update);
    return r.modifiedCount;
  }

  /** Acceso Mongo tipado para agregaciones / updates complejos. */
  async db(): Promise<Db> {
    return this.ensure();
  }
}
