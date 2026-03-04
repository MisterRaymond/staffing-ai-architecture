// ============================================================
// StaffingAI — Middleware Multi-Tenant
// Résolution du tenant par sous-domaine
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// Sous-domaines réservés (ne pas traiter comme des tenants)
const RESERVED_SUBDOMAINS = new Set([
  'www',
  'admin',
  'api',
  'app',
  'mail',
  'status',
  'docs',
  'blog',
  'staging',
  'dev',
]);

// Domaine principal de l'application
const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'staffingai.fr';

/**
 * Extraire le sous-domaine depuis le hostname
 * "acme-consulting.staffingai.fr" → "acme-consulting"
 * "staffingai.fr" → null
 * "localhost:3000" → null (développement)
 */
function extractSubdomain(hostname: string): string | null {
  // Développement local
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    // En dev, utiliser un header custom ou un cookie pour simuler le tenant
    return null;
  }

  // Retirer le port si présent
  const host = hostname.split(':')[0];

  // Vérifier qu'on est sur le bon domaine
  if (!host.endsWith(ROOT_DOMAIN)) {
    return null;
  }

  // Extraire le sous-domaine
  const subdomain = host.replace(`.${ROOT_DOMAIN}`, '');

  // Si c'est le domaine racine (pas de sous-domaine)
  if (subdomain === host || subdomain === '') {
    return null;
  }

  return subdomain;
}

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const subdomain = extractSubdomain(hostname);
  const { pathname } = request.nextUrl;

  // ─── Pas de sous-domaine → Site marketing ───
  if (!subdomain) {
    return NextResponse.next();
  }

  // ─── Super Admin ───
  if (subdomain === 'admin') {
    const url = request.nextUrl.clone();
    url.pathname = `/admin${pathname}`;
    return NextResponse.rewrite(url);
  }

  // ─── Sous-domaine réservé → Redirect vers le site principal ───
  if (RESERVED_SUBDOMAINS.has(subdomain)) {
    return NextResponse.redirect(new URL(`https://${ROOT_DOMAIN}${pathname}`));
  }

  // ─── Sous-domaine tenant → Résoudre et router ───

  // Valider le format du slug (alphanumeric + tirets, 3-50 chars)
  const slugRegex = /^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/;
  if (!slugRegex.test(subdomain)) {
    return new NextResponse('Invalid subdomain', { status: 400 });
  }

  // Réécrire vers les pages tenant
  const url = request.nextUrl.clone();
  url.pathname = `/tenant${pathname}`;

  const response = NextResponse.rewrite(url);

  // Injecter les infos tenant dans les headers pour les server components
  response.headers.set('x-tenant-slug', subdomain);

  return response;
}

// Matcher : exécuter le middleware sur toutes les routes sauf les fichiers statiques
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
