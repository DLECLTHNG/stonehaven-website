import { createApplicationHandler } from './lib/heloc-application-delivery.mjs';

export default createApplicationHandler();

export const config = {
  path: ['/api/heloc-application', '/.netlify/functions/heloc-application'],
  rateLimit: { windowSize: 60, windowLimit: 5, aggregateBy: ['ip', 'domain'] },
};
