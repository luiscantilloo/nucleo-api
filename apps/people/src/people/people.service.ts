import { Inject, Injectable } from '@nestjs/common';
import type { DocumentStore } from '@nara/common';
import {
  andScope,
  PROGRAM_ORG,
  caregiverAccountDoc,
  clinicoDelTerritorio,
  errorEdadCuidador,
  errorFechaNacimiento,
  errorTelefono,
  inScope,
  normalizeCaregiverInput,
  parseCaregiverFlag,
  passwordPolicyError,
  terrFilter,
} from '@nara/common';
import { DOCUMENT_STORE } from '@nara/database';
import { SessionService, hashPassword } from '@nara/auth-core';
import { requireRoles } from '../shared/require-roles';
import { publicPerson } from '../shared/mappers/person.mapper';
import { observerSummary } from '../shared/mappers/observer-summary';

@Injectable()
export class PeopleService {
  constructor(
    @Inject(DOCUMENT_STORE) private readonly store: DocumentStore,
    private readonly sessions: SessionService,
  ) {}

  async list(data: {
    token: string | null;
    limit?: number;
    skip?: number;
    terr?: string;
    q?: string;
  }) {
    const auth = await requireRoles(this.sessions, data.token, [
      'admin',
      'experto',
      'clinico',
      'observador',
      'cuidador',
    ]);
    if ('error' in auth) return auth.error;

    // H-004 (TRL 2026-10-10): el observador solo recibe conteos agregados, nunca filas por persona.
    if (auth.user.roleId === 'observador') {
      const rows = await this.store.findMany('people', { archived: { $ne: true } }, { limit: 20000 });
      return { ok: true, status: 200, summary: observerSummary(rows) };
    }

    const limit = Math.min(Math.max(Number(data.limit) || 5000, 1), 20000);
    const skip = Math.max(Number(data.skip) || 0, 0);

    // Cuidador: solo personas vinculadas a su cuenta (no por territorio).
    if (auth.user.roleId === 'cuidador') {
      const filter = {
        archived: { $ne: true },
        $or: [
          { caregiverAccountId: auth.user.id },
          { caregiverId: auth.user.id },
        ],
      };
      const [total, rows] = await Promise.all([
        this.store.count('people', filter),
        this.store.findMany('people', filter, { sort: { name: 1 }, limit, skip }),
      ]);
      return {
        ok: true,
        status: 200,
        total,
        limit,
        skip,
        people: rows.map(publicPerson),
      };
    }

    const client: Record<string, unknown> = {};
    if (data.terr) client.terr = data.terr;
    if (data.q) client.name = { $regex: data.q, $options: 'i' };
    // SPEC-02 FR-02.1: el servidor aplica el territorio.
    const scope = terrFilter(auth.user);
    if (!scope) {
      void this.sessions.logAccess({
        action: 'http_403',
        status: 403,
        accountId: auth.user.id,
        email: auth.user.email,
        path: '/people',
      });
      return { ok: false, status: 403, error: 'Sin permiso para esta acción.' };
    }
    const filter = andScope(andScope(scope, client), { archived: { $ne: true } });
    const [total, rows] = await Promise.all([
      this.store.count('people', filter),
      this.store.findMany('people', filter, { sort: { name: 1 }, limit, skip }),
    ]);
    return {
      ok: true,
      status: 200,
      total,
      limit,
      skip,
      people: rows.map(publicPerson),
    };
  }

  /**
   * H-013: archivar una persona (solo admin). No se borra: queda `archived` con quién y cuándo,
   * y deja de aparecer en las listas. Sirve para retirar registros de prueba o duplicados.
   */
  async archive(data: { token: string | null; id: string; reason?: string }) {
    const auth = await requireRoles(this.sessions, data.token, ['admin']);
    if ('error' in auth) return auth.error;
    const id = String(data.id || '').trim();
    if (!id) return { ok: false, status: 400, error: 'Falta el id.' };
    const person = await this.store.findOne('people', { id });
    if (!person) return { ok: false, status: 404, error: 'Persona no encontrada.' };
    const now = new Date();
    const archivedBy = { id: auth.user.id, at: now, reason: String(data.reason || '').slice(0, 200) };
    await this.store.updateOne('people', { id }, { $set: { archived: true, archivedBy, updatedAt: now } });
    await this.store.updateOne('patients', { id }, { $set: { archived: true, archivedBy, updatedAt: now } });
    return { ok: true, status: 200, id, archived: true };
  }

  /**
   * Experto activo del territorio (uno solo). Si hay varios, el de menor carga.
   */
  private async resolveTerritoryExpert(terr: string): Promise<{
    id: string;
    name: string;
  } | null> {
    if (!terr) return null;
    const experts = await this.store.findMany(
      'experts',
      { terr, active: { $ne: false } },
      { sort: { name: 1 }, limit: 20 },
    );
    if (!experts.length) return null;
    if (experts.length === 1) {
      return {
        id: String(experts[0].id),
        name: String(experts[0].name || ''),
      };
    }
    const counts = await Promise.all(
      experts.map(async (e) => ({
        e,
        n: await this.store.count('people', {
          $or: [{ expertId: e.id }, { expert: e.name }],
        }),
      })),
    );
    counts.sort((a, b) => a.n - b.n);
    const pick = counts[0].e;
    return { id: String(pick.id), name: String(pick.name || '') };
  }

  async upsert(data: { token: string | null; body: Record<string, unknown> }) {
    const auth = await requireRoles(this.sessions, data.token, [
      'admin',
      'experto',
      'clinico',
      'paciente',
    ]);
    if ('error' in auth) return auth.error;

    const body = data.body || {};
    const name = String(body.name || '').trim();
    if (!name)
      return { ok: false, status: 400, error: 'El nombre es obligatorio.' };
    const now = new Date();
    const bodyId = String(body.id || '').trim();
    const bodyCode = String(body.code || '').trim();
    // Punto 7 · T1: misma clientKey en reintentos → no se crea una segunda ficha.
    const clientKey = String(body.clientKey || body.idempotencyKey || '').trim();

    // Paciente: Crisis (ayuda) o Activo (estoy bien) en su propia persona.
    if (auth.user.roleId === 'paciente') {
      const account = await this.store.findOne('accounts', {
        id: auth.user.id,
      });
      // Punto 5 · T5: nunca usar body.id; solo ficha vinculada / accountId.
      const linked =
        (account?.patientId ? String(account.patientId) : '') ||
        (
          await this.store.findOne('patients', { accountId: auth.user.id })
        )?.id ||
        (
          await this.store.findOne('people', { accountId: auth.user.id })
        )?.id;
      const ownId = linked ? String(linked) : '';
      if (!ownId) {
        void this.sessions.logAccess({
          action: 'http_403',
          status: 403,
          accountId: auth.user.id,
          email: auth.user.email,
          path: '/people#sin-ficha',
        });
        return {
          ok: false,
          status: 403,
          error: 'Sin ficha vinculada',
        };
      }
      const status = String(body.status || body.signal || '').trim();
      const isCrisis = /^crisis$/i.test(status);
      const isInactive =
        /^inactivo$/i.test(status) || body.inactiveLock === true;
      const isWell =
        /^activo$/i.test(status) ||
        body.crisisLock === false ||
        body.inactiveLock === false;
      if (!isCrisis && !isInactive && !isWell) {
        return {
          ok: false,
          status: 403,
          error:
            'El paciente solo puede reportar Crisis, Inactivo o confirmar Volví / estoy bien.',
        };
      }
      const nextStatus = isCrisis
        ? 'Crisis'
        : isInactive && !isWell
          ? 'Inactivo'
          : 'Activo';
      const patientPatch: Record<string, unknown> = isCrisis
        ? {
            status: 'Crisis',
            signal: 'Crisis',
            crisisLock: true,
            inactiveLock: false,
            crisisAttendedAt: null,
            crisisAttendedOutcome: null,
            crisisBtnReady: false,
            updatedAt: now,
          }
        : isInactive && !isWell
          ? {
              status: 'Inactivo',
              signal: 'Inactivo',
              inactiveLock: true,
              updatedAt: now,
            }
          : {
              status: 'Activo',
              signal: 'Activo',
              crisisLock: false,
              inactiveLock: false,
              activeAt: Date.now(),
              crisisAttendedAt: null,
              crisisAttendedOutcome: null,
              crisisBtnReady: true,
              crisisBtnReadyAt: Date.now(),
              updatedAt: now,
            };
      await this.store.updateOne(
        'people',
        { id: ownId },
        {
          $set: {
            status: nextStatus,
            inactiveLock: nextStatus === 'Inactivo',
            ...(nextStatus === 'Activo' ? { activeAt: Date.now() } : {}),
            updatedAt: now,
          },
        },
      );
      await this.store.updateOne('patients', { id: ownId }, { $set: patientPatch });
      const person = await this.store.findOne('people', { id: ownId });
      if (!person)
        return { ok: false, status: 404, error: 'Persona no encontrada.' };
      return { ok: true, status: 200, person: publicPerson(person) };
    }

    // Resolver ficha real: el worklist a veces manda otro id distinto al de people.
    // Reporte TRL 2026-10-10: las búsquedas por código o nombre nunca devuelven una ficha archivada, y la de
    // nombre exige el mismo territorio. Antes una persona nueva podía caer sobre la ficha de otra (el código del
    // front sale de un conteo y se repite) y sobrescribirla.
    const activa = { archived: { $ne: true } };
    const terrBody = String(body.terr || '').trim();
    let existing =
      (clientKey
        ? await this.store.findOne('people', { clientKey })
        : null) ||
      (bodyId ? await this.store.findOne('people', { id: bodyId }) : null) ||
      (bodyCode
        ? await this.store.findOne('people', { code: bodyCode, ...activa })
        : null) ||
      (name && terrBody ? await this.store.findOne('people', { name, terr: terrBody, ...activa }) : null);
    const id = String(existing?.id || bodyId || clientKey || `p${Date.now().toString(36)}`);
    if (!existing && bodyId) {
      existing = await this.store.findOne('people', { id: bodyId });
    }
    const terr = String(body.terr ?? existing?.terr ?? '').trim();
    // H-007 (SPEC-005 FR-003): al crear o al cambiar el dato, mismas reglas que el formulario (400).
    const cambia = (k: string) => body[k] !== undefined && String(body[k] ?? '') !== String(existing?.[k] ?? '');
    const invalido =
      (cambia('birthDate') && errorFechaNacimiento(body.birthDate)) ||
      (cambia('phone') && errorTelefono(body.phone));
    if (invalido) return { ok: false, status: 400, error: invalido };
    // H-009: clínico real del territorio (solo si la ficha todavía no tiene uno).
    const clinTerr =
      body.clin || body.clin === null || existing?.clin
        ? null
        : await clinicoDelTerritorio((c, q) => this.store.findOne(c, q), terr);
    // SPEC-02 FR-02.2: experto y clínico solo escriben personas de su territorio.
    if (
      auth.user.roleId !== 'admin' &&
      ((existing && !inScope(auth.user, existing)) ||
        !inScope(auth.user, { terr }))
    ) {
      void this.sessions.logAccess({
        action: 'http_403',
        status: 403,
        accountId: auth.user.id,
        email: auth.user.email,
        path: '/people',
      });
      return { ok: false, status: 403, error: 'Sin permiso para esta acción.' };
    }
    const pre =
      (
        { Salento: 'SAL', Armenia: 'ARM', Calarcá: 'CAL' } as Record<
          string,
          string
        >
      )[terr] ||
      terr.slice(0, 3).toUpperCase() ||
      'NAR';
    const count = await this.store.count('people');
    // El código es único (índice). Si el que propone el cliente ya pertenece a otra ficha (por ejemplo, una
    // archivada), la API asigna el siguiente libre en vez de fallar con 500.
    let code = String(existing?.code || body.code || `${pre}-${1000 + count + 1}`);
    const dueño = await this.store.findOne('people', { code });
    if (dueño && String(dueño.id) !== id) {
      let n = 1000 + count + 1;
      while (await this.store.findOne('people', { code: `${pre}-${n}` })) n += 1;
      code = `${pre}-${n}`;
    }

    let expert = String(body.expert ?? existing?.expert ?? '').trim();
    let expertId =
      body.expertId != null
        ? body.expertId
          ? String(body.expertId)
          : null
        : (existing?.expertId as string | null) || null;
    // Autoasignación: persona nueva en un territorio → el experto de ese territorio.
    if (terr && (!expert || !expertId)) {
      const assigned = await this.resolveTerritoryExpert(terr);
      if (assigned) {
        if (!expert) expert = assigned.name;
        if (!expertId) expertId = assigned.id;
      }
    }

    const profileRaw =
      body.profile !== undefined ? body.profile : existing?.profile;
    const status =
      body.status != null
        ? String(body.status)
        : String(existing?.status || 'Sin evaluación');

    const pick = (key: string, fallback = '') =>
      body[key] != null ? String(body[key]) : String(existing?.[key] ?? fallback);

    const doc: Record<string, unknown> = {
      id,
      code,
      ...(clientKey || existing?.clientKey
        ? { clientKey: clientKey || String(existing?.clientKey) }
        : {}),
      name: name || String(existing?.name || ''),
      firstName: pick('firstName'),
      lastName: pick('lastName'),
      age:
        body.age != null
          ? Number(body.age) || 0
          : Number(existing?.age) || 0,
      birthDate: pick('birthDate'),
      place:
        body.place != null
          ? String(body.place)
          : String(existing?.place || ''),
      rural:
        body.rural !== undefined
          ? body.rural !== false
          : existing?.rural !== false,
      terr,
      profile:
        profileRaw && /^P\d+$/i.test(String(profileRaw))
          ? String(profileRaw)
          : profileRaw === null
            ? null
            : existing?.profile || null,
      week:
        body.week != null
          ? Number(body.week) || 0
          : Number(existing?.week) || 0,
      weeks:
        body.weeks != null
          ? Number(body.weeks) || 13
          : Number(existing?.weeks) || 13,
      expert,
      expertId,
      status,
      inactiveLock:
        body.inactiveLock !== undefined
          ? body.inactiveLock === true
          : existing?.inactiveLock === true,
      activeAt:
        body.activeAt !== undefined
          ? body.activeAt == null
            ? null
            : Number(body.activeAt) || Date.now()
          : /^activo$/i.test(String(status)) &&
              !/^activo$/i.test(String(existing?.status || ''))
            ? Date.now() // primera vez que pasa a Activo → arranca reloj de inactividad
            : existing?.activeAt != null
              ? Number(existing.activeAt) || null
              : null,
      clin: (() => {
        if (body.clin) return String(body.clin);
        if (body.clin === null) return null;
        if (existing?.clin) return existing.clin;
        // Clínico por territorio al crear la ficha (no esperar evaluación).
        return clinTerr;
      })(),
      phone:
        body.phone != null
          ? String(body.phone)
          : String(existing?.phone || ''),
      email: pick('email').trim().toLowerCase(),
      sexo: pick('sexo'),
      genero: pick('genero'),
      estadoCivil: pick('estadoCivil'),
      estrato: pick('estrato'),
      pendingEval:
        body.pendingEval !== undefined
          ? body.pendingEval === true
          : existing?.pendingEval === true,
      evalAt:
        body.evalAt !== undefined
          ? body.evalAt == null
            ? null
            : Number(body.evalAt) || Date.now()
          : existing?.evalAt || null,
      evalBy:
        body.evalBy !== undefined
          ? body.evalBy == null
            ? null
            : String(body.evalBy)
          : existing?.evalBy || null,
      evalPhq:
        body.evalPhq !== undefined
          ? body.evalPhq == null
            ? null
            : Number(body.evalPhq)
          : existing?.evalPhq ?? null,
      evalDig:
        body.evalDig !== undefined
          ? body.evalDig == null
            ? null
            : Number(body.evalDig)
          : existing?.evalDig ?? null,
      finalEvalAt:
        body.finalEvalAt !== undefined
          ? body.finalEvalAt == null
            ? null
            : Number(body.finalEvalAt) || Date.now()
          : existing?.finalEvalAt || null,
      updatedAt: now,
    };
    if (body.previousProfile !== undefined) {
      doc.previousProfile =
        body.previousProfile && /^P\d+$/i.test(String(body.previousProfile))
          ? String(body.previousProfile)
          : null;
    } else if (existing && 'previousProfile' in existing) {
      doc.previousProfile = existing.previousProfile;
    }
    // Conservar vínculo de cuidador previo si no se está creando uno nuevo.
    if (existing?.caregiverAccountId && body.caregiverAccountId === undefined) {
      doc.caregiverAccountId = existing.caregiverAccountId;
      doc.caregiverId = existing.caregiverId || existing.caregiverAccountId;
      doc.caregiverName = existing.caregiverName;
      doc.caregiverEmail = existing.caregiverEmail;
      doc.caregiverPhone = existing.caregiverPhone;
      doc.tieneCuidador = true;
    }

    await this.store.upsert('people', { id }, doc);

    // Espejo clínico: Mis pacientes / admin leen colección patients.
    if (
      doc.profile ||
      doc.pendingEval === true ||
      body.pendingEval === false ||
      /por\s*aprobar|activo|aprobado|rechazad|terminado|sin\s*evaluación/i.test(
        String(doc.status || ''),
      )
    ) {
      const existingPat = await this.store.findOne('patients', { id });
      const patSet: Record<string, unknown> = {
        id,
        code: doc.code,
        name: doc.name,
        age: doc.age,
        place: doc.place || doc.terr || '',
        terr: doc.terr,
        phone: doc.phone,
        expert: doc.expert,
        clin: doc.clin,
        profile: doc.profile,
        status: doc.status,
        signal: doc.status,
        pendingEval: doc.pendingEval === true,
        previousProfile: doc.previousProfile ?? null,
        evalAt: doc.evalAt,
        evalBy: doc.evalBy,
        evalPhq: doc.evalPhq,
        evalDig: doc.evalDig,
        finalEvalAt: doc.finalEvalAt,
        inactiveLock: doc.inactiveLock === true,
        activeAt: doc.activeAt ?? null,
        updatedAt: now,
      };
      if (doc.evalPhq != null) {
        const prevPhq = Array.isArray(existingPat?.phq)
          ? (existingPat!.phq as number[])
          : [];
        const last = prevPhq.length ? prevPhq[prevPhq.length - 1] : null;
        if (last !== Number(doc.evalPhq)) {
          patSet.phq = prevPhq.concat([Number(doc.evalPhq)]);
          const prevDates = Array.isArray(existingPat?.phqDates)
            ? (existingPat!.phqDates as string[])
            : [];
          patSet.phqDates = prevDates.concat([new Date().toISOString().slice(0, 10)]); // H-013: fecha ISO
        }
      }
      Object.keys(patSet).forEach((k) => {
        if (patSet[k] === undefined) delete patSet[k];
      });
      await this.store.upsert('patients', { id }, {
        ...(existingPat || {}),
        ...patSet,
      });
    }

    try {
      const acc = await this.ensurePatientAccount(id, doc, body, now);
      if (acc?.accountId) {
        doc.accountId = acc.accountId;
      }
    } catch (err) {
      return {
        ok: false,
        status: 409,
        error:
          err instanceof Error
            ? err.message
            : 'No se pudo crear la cuenta de la persona acompañada.',
      };
    }

    try {
      const cg = await this.attachCaregiver(id, String(terr || ''), body, now);
      if (cg) Object.assign(doc, cg.link);
    } catch (err) {
      return {
        ok: false,
        status: 409,
        error:
          err instanceof Error
            ? err.message
            : 'No se pudo crear la cuenta del cuidador.',
      };
    }

    return {
      ok: true,
      status: 200,
      person: publicPerson(doc),
    };
  }

  /** Crea cuenta de ingreso para la persona acompañada (alta desde gestor). */
  private async ensurePatientAccount(
    personId: string,
    doc: Record<string, unknown>,
    body: Record<string, unknown>,
    now: Date,
  ): Promise<{ accountId: string } | null> {
    const email = String(body.email || doc.email || '')
      .trim()
      .toLowerCase();
    const password = String(body.password || '').trim();
    const existingAccId = String(
      doc.accountId || body.accountId || '',
    ).trim();
    if (existingAccId) return { accountId: existingAccId };

    const linked = await this.store.findOne('accounts', {
      $or: [{ personId }, { patientId: personId }],
    });
    if (linked?.id) {
      await this.store.updateOne(
        'people',
        { id: personId },
        { $set: { accountId: linked.id, updatedAt: now } },
      );
      await this.store.updateOne(
        'patients',
        { id: personId },
        { $set: { accountId: linked.id, updatedAt: now } },
      );
      return { accountId: String(linked.id) };
    }

    // Sin correo/clave: solo ficha (no aparece en Usuarios hasta tener acceso).
    if (!email || !/@/.test(email)) return null;
    if (!password) {
      throw new Error(
        'Defina una contraseña para el acceso de la persona acompañada.',
      );
    }

    const emailTaken = await this.store.findOne('accounts', { email });
    if (emailTaken) {
      throw new Error('Ya existe una cuenta con el correo de la persona.');
    }

    const name = String(doc.name || '').trim();
    const policyErr = passwordPolicyError({
      password,
      email,
      name,
      role: 'Persona acompañada',
      roleId: 'paciente',
    });
    if (policyErr) throw new Error(policyErr);

    const accountId = `u${Date.now().toString(36)}`;
    const passwordHash = await hashPassword(password);
    await this.store.upsert('accounts', { id: accountId }, {
      id: accountId,
      name,
      firstName: String(doc.firstName || ''),
      lastName: String(doc.lastName || ''),
      email,
      contact: email,
      phone: String(doc.phone || ''),
      role: 'Persona acompañada',
      roleId: 'paciente',
      terr: String(doc.terr || ''),
      org: PROGRAM_ORG,
      status: 'Activo',
      personId,
      patientId: personId,
      passwordHash,
      mustChangePassword: false,
      createdAt: now,
      updatedAt: now,
      created: true,
    });

    await this.store.updateOne(
      'people',
      { id: personId },
      { $set: { accountId, email, updatedAt: now } },
    );
    await this.store.updateOne(
      'patients',
      { id: personId },
      { $set: { accountId, email, updatedAt: now } },
    );
    return { accountId };
  }

  private async attachCaregiver(
    personId: string,
    terr: string,
    body: Record<string, unknown>,
    now: Date,
  ): Promise<{ link: Record<string, unknown> } | null> {
    const wants = parseCaregiverFlag(body.tieneCuidador);
    const input = normalizeCaregiverInput(body);
    if (!wants && !input) return null;

    const person = await this.store.findOne('people', { id: personId });
    const alreadyId = String(
      person?.caregiverAccountId || person?.caregiverId || '',
    ).trim();

    if (!wants) {
      return alreadyId
        ? {
            link: {
              tieneCuidador: true,
              caregiverAccountId: alreadyId,
            },
          }
        : null;
    }

    if (alreadyId && (!input?.email || !/@/.test(String(input.email)))) {
      const link = {
        tieneCuidador: true,
        caregiverAccountId: alreadyId,
        caregiverId: alreadyId,
        updatedAt: now,
      };
      await this.store.updateOne('people', { id: personId }, { $set: link });
      await this.mirrorCaregiverLinkToPatient(personId, person, link);
      return { link };
    }

    if (!input?.firstName || !input?.lastName) {
      throw new Error('Escriba nombre y apellido del cuidador.');
    }
    if (!input.email || !/@/.test(input.email)) {
      throw new Error(
        'Para el cuidador escriba un correo válido (ej. nombre@parienta.co).',
      );
    }
    if (!String(input.password || '').trim()) {
      throw new Error('Defina una contraseña para el acceso del cuidador.');
    }
    if (!input.birthDate) {
      throw new Error('Indique la fecha de nacimiento del cuidador.');
    }
    const ageErr = errorEdadCuidador(Number(input.age) || 0);
    if (ageErr) throw new Error(ageErr);

    const emailTaken = await this.store.findOne('accounts', { email: input.email });
    if (emailTaken && String(emailTaken.roleId) !== 'cuidador') {
      throw new Error('Ya existe una cuenta con el correo del cuidador.');
    }
    if (
      emailTaken &&
      alreadyId &&
      String(emailTaken.id) !== alreadyId
    ) {
      throw new Error('Ya existe una cuenta con el correo del cuidador.');
    }

    const plain = String(input.password || '').trim();
    const fullName = String(input.name || `${input.firstName} ${input.lastName}`).trim();
    const policyErr = passwordPolicyError({
      password: plain,
      email: input.email,
      name: fullName,
      role: 'Cuidadora / familiar',
      roleId: 'cuidador',
    });
    if (policyErr) throw new Error(policyErr);

    const accountId =
      alreadyId ||
      String(emailTaken?.id || `cg${Date.now().toString(36)}`);
    const passwordHash = await hashPassword(plain);
    const phone = String(input.phone || '').trim();
    const accDoc = caregiverAccountDoc({
      id: accountId,
      name: fullName,
      email: input.email,
      phone,
      terr,
      passwordHash,
      now,
      firstName: input.firstName,
      lastName: input.lastName,
      birthDate: input.birthDate,
      age: input.age,
      genero: input.genero,
      estadoCivil: input.estadoCivil,
      estrato: input.estrato,
      place: input.place,
    });
    await this.store.upsert('accounts', { id: accountId }, {
      ...accDoc,
      createdAt: now,
    });

    const link = {
      tieneCuidador: true,
      caregiverAccountId: accountId,
      caregiverId: accountId,
      caregiverName: fullName,
      caregiverFirstName: input.firstName,
      caregiverLastName: input.lastName,
      caregiverEmail: input.email,
      caregiverPhone: phone,
      caregiverBirthDate: input.birthDate || '',
      caregiverAge: input.age || 0,
      caregiverGenero: input.genero || '',
      caregiverEstadoCivil: input.estadoCivil || '',
      caregiverEstrato: input.estrato || '',
      caregiverPlace: input.place || '',
      updatedAt: now,
    };
    await this.store.updateOne('people', { id: personId }, { $set: link });
    await this.mirrorCaregiverLinkToPatient(personId, person, link);

    return { link };
  }

  /** Espejo del vínculo en patients (upsert: alta del gestor aún sin ficha clínica). */
  private async mirrorCaregiverLinkToPatient(
    personId: string,
    person: Record<string, unknown> | null | undefined,
    link: Record<string, unknown>,
  ) {
    const existingPat = await this.store.findOne('patients', { id: personId });
    await this.store.upsert('patients', { id: personId }, {
      ...(existingPat || {
        id: personId,
        name: person?.name || '',
        age: person?.age || 0,
        place: person?.place || person?.terr || '',
        terr: person?.terr || '',
        phone: person?.phone || '',
        expert: person?.expert || '',
        clin: person?.clin || null,
        profile: person?.profile || null,
        status: person?.status || 'Sin evaluación',
        code: person?.code || '',
      }),
      ...link,
    });
  }
}
