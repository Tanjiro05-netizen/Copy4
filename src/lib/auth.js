export const DEV_ADMIN_USER = { id: 'dev-admin', email: 'admin@localhost', role: 'authenticated' };
export const DEV_ADMIN_PROFILE = { id: 'dev-admin', username: 'DevAdmin', role: 'admin', is_admin: true };
export const DEV_ADMIN_PASSWORD = 'admin123';
export const DEV_AUTH_STORAGE_KEY = 'marxist_dev_auth';
export const DEV_AUTH_COOKIE_KEY = 'marxist_dev_auth';

export const normalizeRoleToken = (value) => `${value || ''}`.trim().toLowerCase();

export const isAdminProfile = (profile) =>
  profile?.is_admin === true || normalizeRoleToken(profile?.role) === 'admin';

export const hasEditorialRoleInProfile = (profile, roleName) => {
  const normalizedTarget = normalizeRoleToken(roleName);
  if (!normalizedTarget) return false;

  const editorialRoles = Array.isArray(profile?.editorial_roles) ? profile.editorial_roles : [];
  const matchesEditorialArray = editorialRoles.some(
    (role) => normalizeRoleToken(role) === normalizedTarget
  );
  const matchesLegacyRole = normalizeRoleToken(profile?.role) === normalizedTarget;

  return matchesEditorialArray || matchesLegacyRole;
};

export const canProfileManagePolitics = (profile) =>
  isAdminProfile(profile) || hasEditorialRoleInProfile(profile, 'News');

export const canProfileManageStudy = (profile) =>
  isAdminProfile(profile) || hasEditorialRoleInProfile(profile, 'Teacher');

export const isLocalDevelopmentHost = (hostname) => {
  const currentHostname =
    hostname ?? (typeof window !== 'undefined' ? window.location.hostname : '');
  const normalizedHostname = `${currentHostname || ''}`.trim().toLowerCase();

  return (
    normalizedHostname === 'localhost' ||
    normalizedHostname === '127.0.0.1' ||
    normalizedHostname === '0.0.0.0' ||
    normalizedHostname === '::1' ||
    normalizedHostname === '[::1]' ||
    normalizedHostname.endsWith('.localhost')
  );
};
