import { getStore } from '@netlify/blobs';
import { APPLICATION_STORE, pruneApplicationRecords } from './lib/heloc-application-delivery.mjs';

export default async () => {
  try {
    await pruneApplicationRecords(getStore({name:APPLICATION_STORE,consistency:'strong'}));
    return new Response(null,{status:204});
  } catch {
    // Fail the scheduled invocation without logging stored records or exceptions.
    throw new Error('HELOC application retention cleanup failed');
  }
};
export const config={schedule:'0 8 * * *'};
