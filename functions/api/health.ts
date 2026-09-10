import { json } from './shared';

/** Health check compatible con Cloudflare Pages Functions y Workers. */
export function handle(request: Request): Response {
  if (request.method !== 'GET') {
    return json({ error: 'method_not_allowed' }, 405);
  }

  return json({ ok: true, service: 'punto-fuerte', timestamp: new Date().toISOString() });
}

export const onRequestGet = (context: { request: Request }): Response => handle(context.request);

export default {
  fetch: (request: Request): Response => handle(request),
};
