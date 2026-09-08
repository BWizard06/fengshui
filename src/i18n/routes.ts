export const routes = [
  { key: 'home', path: '/' },
  { key: 'about', path: '/about' },
  { key: 'fengShui', path: '/feng-shui' },
  { key: 'offer', path: '/offer' },
  { key: 'blog', path: '/blog' },
  { key: 'contact', path: '/contact' },
  { key: 'partners', path: '/partners' },
] as const;

export type RouteKey = (typeof routes)[number]['key'];

export const routePath = Object.fromEntries(
  routes.map((route) => [route.key, route.path])
) as Record<RouteKey, string>;

export const legalRoutes = [
  { key: 'imprint', path: '/imprint' },
  { key: 'privacy', path: '/privacy' },
] as const;

export type LegalRouteKey = (typeof legalRoutes)[number]['key'];

export const legalPath = Object.fromEntries(
  legalRoutes.map((route) => [route.key, route.path])
) as Record<LegalRouteKey, string>;

export const rubrikOrder = ['about', 'fengShui', 'offer', 'blog', 'contact', 'partners'] as const;

export type RubrikKey = (typeof rubrikOrder)[number];
