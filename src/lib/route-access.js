import {
  canProfileManagePolitics,
  canProfileManageStudy,
  isAdminProfile,
} from './auth.js';

const PROTECTED_PREFIXES = [
  '/theory',
  '/analysis',
  '/submit',
  '/article',
  '/profile',
  '/directory',
  '/glossary',
  '/study',
  '/science-tech',
  '/politics',
  '/visualizations',
  '/forum',
  '/knowledge',
];

export const isProtectedPath = (pathname) =>
  PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

export const isAdminPath = (pathname) => pathname === '/admin' || pathname.startsWith('/admin/');

export const getRouteAccessDecision = (pathname, { user, profile, isDevAdmin = false } = {}) => {
  if (!isProtectedPath(pathname) && !isAdminPath(pathname)) {
    return { allowed: true, redirectTo: null };
  }

  if (!isDevAdmin && !user) {
    return { allowed: false, redirectTo: '/login' };
  }

  if (isAdminPath(pathname)) {
    if (pathname === '/admin/politics/upload') {
      return canProfileManagePolitics(profile)
        ? { allowed: true, redirectTo: null }
        : { allowed: false, redirectTo: '/coming-soon' };
    }

    if (pathname === '/admin/study') {
      return canProfileManageStudy(profile)
        ? { allowed: true, redirectTo: null }
        : { allowed: false, redirectTo: '/coming-soon' };
    }

    return isAdminProfile(profile)
      ? { allowed: true, redirectTo: null }
      : { allowed: false, redirectTo: '/coming-soon' };
  }

  if (!isAdminProfile(profile) && !profile?.has_invite_access) {
    return { allowed: false, redirectTo: '/pending-access' };
  }

  return { allowed: true, redirectTo: null };
};
