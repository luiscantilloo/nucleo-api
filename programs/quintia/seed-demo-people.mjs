import {
  DEMO_TAG,
  FEATURED,
  PROFILES_CYCLE,
  TERR_COUNTS,
} from './seed-demo-constants.mjs';
import { buildPrototypeCohort } from './prototype-data.mjs';

const FIRST = [
  'Adelina', 'Bernardo', 'Carmenza', 'Domingo', 'Esperanza', 'Félix', 'Graciela', 'Héctor',
  'Isabel', 'José', 'Luz', 'Mario', 'Nora', 'Orlando', 'Patricia', 'Ricardo', 'Sofía', 'Tomás',
  'Úrsula', 'Víctor',
];
const LAST = [
  'Aguilar', 'Bermúdez', 'Castaño', 'Duarte', 'Escobar', 'Franco', 'Giraldo', 'Henao', 'Ibarra',
  'Jaramillo', 'Londoño', 'Mejía', 'Naranjo', 'Ospina', 'Parra', 'Quintero', 'Restrepo', 'Salazar',
  'Torres', 'Uribe',
];
const STATUS_SLOTS = [
  ...Array(40).fill('Activo'),
  ...Array(15).fill('Sin evaluación'),
  ...Array(15).fill('Inactivo'),
];

function pad(n) {
  return String(n).padStart(3, '0');
}

function terrPrefix(terr) {
  if (terr === 'Valle Alto') return 'QVA';
  if (terr === 'Río Claro') return 'QRC';
  return 'QSN';
}

function rowFromFeatured(f, expert) {
  const p = f.prototype || {};
  return {
    id: f.id,
    code: f.code,
    name: f.name,
    firstName: f.firstName,
    lastName: f.lastName,
    age: f.age,
    birthDate: '',
    place: f.place,
    rural: f.rural,
    terr: f.terr,
    profile: f.profile,
    status: f.status,
    week: p.semana ? p.semana[0] : 4,
    weeks: p.semanas || 13,
    expert: expert?.name || 'Andrés Molina',
    expertId: expert?.id || null,
    phone: '',
    pendingEval: false,
    demoTag: DEMO_TAG,
    featured: true,
    slug: f.slug,
    trato: f.trato,
    riskLabel: f.riskLabel || p.riesgo,
    digital: f.digital || p.digital,
    analizador: p.analizador || null,
    monedas: p.monedas || 0,
    juegos: p.juegos || [],
    prototype: p,
  };
}

/** Personas clínicas extra del prototipo (Gilberto…Ramiro) + OTHERS. */
function clinicExtras(expert) {
  const cs = buildPrototypeCohort();
  const main = new Set(cs.MAIN);
  const out = [];
  for (const id of cs.ORDER) {
    if (main.has(id)) continue;
    const p = cs.PATIENTS[id];
    if (!p) continue;
    out.push({
      id: `qdemo-p-${id}`,
      code: `QVA-${(p.iniciales || id.slice(0, 2).toUpperCase())}01`,
      name: p.nombre,
      firstName: p.nombre.split(' ')[0],
      lastName: p.nombre.split(' ').slice(1).join(' '),
      age: p.edad,
      birthDate: '',
      place: 'Valle Alto',
      rural: true,
      terr: p.territorio || 'Valle Alto',
      profile: p.perfil,
      status: p.estado,
      week: p.semana ? p.semana[0] : 3,
      weeks: p.semanas || 8,
      expert: expert?.name || 'Andrés Molina',
      expertId: expert?.id || null,
      phone: '',
      pendingEval: false,
      demoTag: DEMO_TAG,
      featured: false,
      clinicDemo: true,
      slug: id,
      trato: p.trato,
      riskLabel: p.riesgo,
      digital: p.digital,
      analizador: p.analizador,
      monedas: p.monedas,
      juegos: p.juegos,
      prototype: p,
    });
  }
  for (const o of cs.OTHERS) {
    out.push({
      id: `qdemo-p-${o.id}`,
      code: `QRC-${o.id.slice(0, 2).toUpperCase()}01`,
      name: o.nombre,
      firstName: o.nombre.split(' ')[0],
      lastName: o.nombre.split(' ').slice(1).join(' '),
      age: o.edad,
      birthDate: '',
      place: o.territorio,
      rural: o.territorio !== 'Valle Alto',
      terr: o.territorio,
      profile: o.perfil === '—' ? '' : o.perfil,
      status: o.estado,
      week: 0,
      weeks: 0,
      expert: expert?.name || 'Andrés Molina',
      expertId: expert?.id || null,
      phone: '',
      pendingEval: o.estado !== 'Activo',
      demoTag: DEMO_TAG,
      featured: false,
      clinicDemo: true,
      slug: o.id,
      riesgo: 'Sin evaluación',
      analizador: null,
      monedas: 0,
      juegos: [],
      prototype: o,
    });
  }
  return out;
}

function filler(terr, seq, slot, expert) {
  const fn = FIRST[(slot + seq) % FIRST.length];
  const ln = LAST[(slot * 3 + seq) % LAST.length];
  const profile = PROFILES_CYCLE[slot % PROFILES_CYCLE.length];
  const status = STATUS_SLOTS[slot % STATUS_SLOTS.length];
  const slug = terr.toLowerCase().replace(/\s+/g, '-');
  const analizador =
    status === 'Activo' ? ['estable', 'mejorando', 'base'][slot % 3] : null;
  return {
    id: `qdemo-p-${slug}-${pad(seq)}`,
    code: `${terrPrefix(terr)}-${pad(seq)}`,
    name: `${fn} ${ln}`,
    firstName: fn,
    lastName: ln,
    age: 62 + ((slot * 7 + seq * 3) % 27),
    birthDate: '',
    place: seq % 3 === 0 ? 'Vereda rural' : 'Cabecera municipal',
    rural: seq % 3 === 0,
    terr,
    profile,
    week: 1 + (slot % 8),
    weeks: 13,
    expert: expert?.name || '',
    expertId: expert?.id || null,
    status,
    phone: '',
    pendingEval: status === 'Sin evaluación',
    demoTag: DEMO_TAG,
    analizador,
  };
}

/** @param {{ expertByTerr: Record<string, { id: string, name: string }> }} ctx */
export function buildPeople(ctx) {
  const expertVA = ctx.expertByTerr['Valle Alto'];
  const out = [];
  const featured = FEATURED.map((f) => rowFromFeatured(f, expertVA));
  const extras = clinicExtras(expertVA);
  out.push(...featured, ...extras);

  const countByTerr = {};
  for (const p of out) countByTerr[p.terr] = (countByTerr[p.terr] || 0) + 1;

  let slot = 0;
  for (const [terr, total] of Object.entries(TERR_COUNTS)) {
    const expert = ctx.expertByTerr[terr];
    let have = countByTerr[terr] || 0;
    let seq = 1;
    while (have < total) {
      out.push(filler(terr, seq, slot, expert));
      seq += 1;
      have += 1;
      slot += 1;
    }
  }
  return out;
}

export function buildPatients(people) {
  return people.map((p) => {
    const proto = p.prototype || null;
    return {
      id: p.id,
      code: p.code,
      name: p.name,
      age: p.age,
      place: p.place,
      profile: p.profile,
      status: p.status,
      signal: p.status,
      terr: p.terr,
      expert: p.expert,
      expertId: p.expertId,
      phone: p.phone || '',
      consent: true,
      phq: proto?.phq ? [...proto.phq] : [],
      phqDates: [],
      sleep: null,
      braceletStatus: '',
      adherence: null,
      next: proto?.proxima || '',
      nextShort: proto?.proxima ? String(proto.proxima).split('·')[0].trim() : '',
      summary: proto?.lectura || null,
      audios: 0,
      timeline: [],
      ctx: { dano: 0, perdida: 0 },
      practice: [],
      lastSession: null,
      demoTag: DEMO_TAG,
      featured: !!p.featured,
      monedas: p.monedas || proto?.monedas || 0,
      analizador: p.analizador || proto?.analizador || null,
      juegos: p.juegos || proto?.juegos || [],
      prototype: proto,
    };
  });
}
