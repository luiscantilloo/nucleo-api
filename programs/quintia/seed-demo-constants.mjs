/** Constantes cohorte demo QUINTIA — alineadas a consciente-data.js */

import { featuredPeopleFromPrototype } from './prototype-data.mjs';

export const DEMO_TAG = 'quintia-demo-2026';

export const TERRITORIES = [
  { name: 'Valle Alto', dep: 'Quindío', level: 'Municipal', cap: 50, goal: 60, rural: 18, ruralG: 30, sixty: 42, sixtyG: 55, experts: 1, pace: 3, active: true },
  { name: 'Río Claro', dep: 'Quindío', level: 'Municipal', cap: 10, goal: 15, rural: 6, ruralG: 40, sixty: 8, sixtyG: 50, experts: 1, pace: 2, active: true },
  { name: 'Sierra Norte', dep: 'Quindío', level: 'Municipal', cap: 10, goal: 15, rural: 5, ruralG: 35, sixty: 9, sixtyG: 50, experts: 1, pace: 2, active: true },
];

export const PROFILES_CYCLE = [
  'P01', 'P02', 'P03', 'P04', 'P05', 'P06', 'P07', 'P08', 'P09', 'P10', 'P11', 'P12', 'P13', 'P14', 'P15',
];

/** Totales del prototipo: 70 en POBLACION (13 clínicas + 2 others + 55 generados). */
export const TERR_COUNTS = { 'Valle Alto': 50, 'Río Claro': 10, 'Sierra Norte': 10 };

const protoFeatured = featuredPeopleFromPrototype();

export const FEATURED = protoFeatured.map((f) => ({
  id: f.id,
  code: f.code,
  name: f.name,
  firstName: f.firstName,
  lastName: f.lastName,
  terr: f.terr,
  profile: f.profile,
  status: f.status,
  age: f.age,
  place: f.place,
  rural: f.rural,
  slug: f.slug,
  trato: f.trato,
  riskLabel: f.riskLabel,
  digital: f.digital,
  prototype: f.prototype,
}));

export const EXPERTS = [
  {
    id: 'qdemo-exp-valle-alto',
    name: 'Andrés Molina',
    terr: 'Valle Alto',
    email: 'experto+prueba@quintia.com',
    target: 9,
    weekT: 45,
    today: 3,
    week: 12,
    training: 'Completo',
    active: true,
    accountId: 'qdemo-experto',
  },
  {
    id: 'qdemo-exp-rio-claro',
    name: 'Patricia Cano',
    terr: 'Río Claro',
    email: '',
    target: 4,
    weekT: 20,
    today: 1,
    week: 6,
    training: 'Completo',
    active: true,
    accountId: null,
  },
  {
    id: 'qdemo-exp-sierra-norte',
    name: 'Iván Restrepo',
    terr: 'Sierra Norte',
    email: '',
    target: 4,
    weekT: 20,
    today: 2,
    week: 7,
    training: 'Completo',
    active: true,
    accountId: null,
  },
];

export const TRIAL_ACCOUNTS_SPEC = [
  {
    id: 'qdemo-admin',
    email: 'admin+prueba@quintia.com',
    roleId: 'admin',
    role: 'Administrador',
    name: 'Marcela Ríos (prueba)',
    org: 'Programa QUINTIA',
    terr: 'Todos',
  },
  {
    id: 'qdemo-experto',
    email: 'experto+prueba@quintia.com',
    roleId: 'experto',
    role: 'Gestor de campo',
    name: 'Andrés Molina (prueba)',
    org: 'Programa QUINTIA',
    terr: 'Valle Alto',
  },
  {
    id: 'qdemo-clinico',
    email: 'clinico+prueba@quintia.com',
    roleId: 'clinico',
    role: 'Clínica',
    name: 'Dra. Lucía Paredes (prueba)',
    org: 'Programa QUINTIA',
    terr: 'Valle Alto',
  },
  {
    id: 'qdemo-cuidador',
    email: 'cuidador+prueba@quintia.com',
    roleId: 'cuidador',
    role: 'Cuidadora / familiar',
    name: 'Gloria Pardo (prueba)',
    org: 'Programa QUINTIA',
    terr: 'Valle Alto',
    patientId: 'qdemo-p-rosa',
  },
  {
    id: 'qdemo-observador',
    email: 'observador+prueba@quintia.com',
    roleId: 'observador',
    role: 'Observador',
    name: 'Tomás Vega (prueba)',
    org: 'Aliado QUINTIA',
    orgType: 'Financiador',
    terr: 'Todos',
    modules: ['avance', 'recursos', 'resultados', 'datos', 'casos'],
  },
  {
    id: 'qdemo-paciente',
    email: 'paciente+prueba@quintia.com',
    roleId: 'paciente',
    role: 'Persona acompañada',
    name: 'Hernán Quintero (prueba)',
    org: 'Programa QUINTIA',
    terr: 'Valle Alto',
    patientId: 'qdemo-p-hernan',
  },
  {
    id: 'qdemo-paciente2',
    email: 'paciente2+prueba@quintia.com',
    roleId: 'paciente',
    role: 'Persona acompañada',
    name: 'Ernesto Villamil (prueba)',
    org: 'Programa QUINTIA',
    terr: 'Valle Alto',
    patientId: 'qdemo-p-ernesto',
  },
  {
    id: 'qdemo-paciente3',
    email: 'paciente3+prueba@quintia.com',
    roleId: 'paciente',
    role: 'Persona acompañada',
    name: 'Rosa Elena Pardo (prueba)',
    org: 'Programa QUINTIA',
    terr: 'Valle Alto',
    patientId: 'qdemo-p-rosa',
  },
  {
    id: 'qdemo-paciente4',
    email: 'paciente4+prueba@quintia.com',
    roleId: 'paciente',
    role: 'Persona acompañada',
    name: 'Elvia Rendón (prueba)',
    org: 'Programa QUINTIA',
    terr: 'Valle Alto',
    patientId: 'qdemo-p-elvia',
  },
];

/** Aviso del analizador (no crisis): Simón dice de Ernesto. */
export function ernestoAnalyzerAviso() {
  return {
    id: 'qdemo-aviso-ernesto-simon',
    pid: 'qdemo-p-ernesto',
    code: 'QVA-EV01',
    name: 'Ernesto Villamil',
    age: 79,
    profile: 'P08',
    terr: 'Valle Alto',
    sev: 'info',
    kind: 'analizador',
    game: 'simon',
    status: 'open',
    what: 'Simón dice: secuencia más larga de 6 a 4 en las últimas 3 semanas',
    source: 'analizador',
    at: Date.now() - 4 * 24 * 60 * 60 * 1000,
    plazo: 7,
    desde: 4,
    expert: 'qdemo-exp-valle-alto',
    demoTag: DEMO_TAG,
  };
}

/** @deprecated usar ernestoAnalyzerAviso — el prototipo no deja crisis abiertas */
export function ernestoOpenAlert() {
  return ernestoAnalyzerAviso();
}
