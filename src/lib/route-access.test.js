import { getRouteAccessDecision } from './route-access.js';

describe('route access decisions', () => {
  test('redirects unauthenticated protected routes before render', () => {
    expect(getRouteAccessDecision('/theory')).toEqual({
      allowed: false,
      redirectTo: '/login',
    });
  });

  test('redirects authenticated users without invite access to pending access', () => {
    expect(
      getRouteAccessDecision('/study', {
        user: { id: 'user-1' },
        profile: { id: 'user-1', role: 'user', has_invite_access: false },
      })
    ).toEqual({
      allowed: false,
      redirectTo: '/pending-access',
    });
  });

  test('lets the local dev admin through admin routes', () => {
    expect(
      getRouteAccessDecision('/admin/tags', {
        isDevAdmin: true,
        profile: { role: 'admin', is_admin: true },
      })
    ).toEqual({
      allowed: true,
      redirectTo: null,
    });
  });

  test('redirects non-admin users away from admin routes', () => {
    expect(
      getRouteAccessDecision('/admin/tags', {
        user: { id: 'user-2' },
        profile: { id: 'user-2', role: 'user', has_invite_access: true },
      })
    ).toEqual({
      allowed: false,
      redirectTo: '/coming-soon',
    });
  });
});
