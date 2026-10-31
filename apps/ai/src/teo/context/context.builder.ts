import { MongoStore } from '@nara/database';
import { appOverview } from '../prompts/app-overview';
import { buildObserverContext } from './observer.context';
import { buildPatientContext } from './patient.context';
import { buildStaffContext } from './staff.context';

export async function buildContext(
  mongo: MongoStore,
  roleId: string,
  question: string,
  userId?: string,
) {
  const db = await mongo.db();
  if (roleId === 'observador') {
    return buildObserverContext(db, roleId);
  }
  if (roleId === 'paciente' && userId) {
    return buildPatientContext(db, userId, question);
  }
  if (roleId === 'admin' || roleId === 'clinico' || roleId === 'experto') {
    return buildStaffContext(db, roleId, question, userId);
  }
  return [appOverview(), `Rol del usuario que pregunta: ${roleId}`].join('\n');
}
