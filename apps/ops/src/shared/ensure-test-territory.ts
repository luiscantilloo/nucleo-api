/** Territorio de QA / demos; debe existir en BD si se asigna a usuarios o expertos. */
export const TEST_TERRITORY_NAME = 'Prueba';

type DbLike = {
  collection: (name: string) => {
    findOne: (q: Record<string, unknown>) => Promise<Record<string, unknown> | null>;
    updateOne: (
      filter: Record<string, unknown>,
      update: Record<string, unknown>,
      opts?: { upsert?: boolean },
    ) => Promise<unknown>;
  };
};

/** Crea el territorio «Prueba» si aún no está en la colección. */
export async function ensureTestTerritory(
  db: DbLike,
  name: string,
): Promise<void> {
  const terr = String(name || '').trim();
  if (terr.toLowerCase() !== TEST_TERRITORY_NAME.toLowerCase()) return;
  const existing = await db.collection('territories').findOne({ name: TEST_TERRITORY_NAME });
  if (existing) return;
  const now = new Date();
  await db.collection('territories').updateOne(
    { name: TEST_TERRITORY_NAME },
    {
      $set: {
        name: TEST_TERRITORY_NAME,
        dep: TEST_TERRITORY_NAME,
        level: 'Municipio completo',
        updatedAt: now,
      },
      $setOnInsert: {
        createdAt: now,
        active: true,
        experts: 0,
        cap: 0,
        goal: 0,
        rural: 0,
        ruralG: 0,
        sixty: 0,
        sixtyG: 0,
        br: 0,
        brA: 0,
        brD: 0,
        brAv: 0,
        insts: 0,
        content: ['PHQ-9 + capacidad digital (base)'],
        places: [],
        isNew: true,
        pace: 0,
      },
    },
    { upsert: true },
  );
}
