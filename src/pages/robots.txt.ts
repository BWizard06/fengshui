import type { APIRoute } from 'astro';
import { deployment } from '../config';

export const GET: APIRoute = ({ site }) => {
  const body = deployment.live
    ? ['User-agent: *', 'Allow: /', '', `Sitemap: ${new URL('sitemap-index.xml', site)}`, ''].join(
        '\n'
      )
    : ['User-agent: *', 'Disallow: /', ''].join('\n');

  return new Response(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
};
