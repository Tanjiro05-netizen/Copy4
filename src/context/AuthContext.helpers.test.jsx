import {
    canProfileManagePolitics,
    hasEditorialRoleInProfile,
    isLocalDevelopmentHost,
    isAdminProfile,
} from '../lib/auth.js';

describe('AuthContext role helpers', () => {
    test('isAdminProfile returns true for is_admin flag', () => {
        expect(isAdminProfile({ is_admin: true, role: 'user' })).toBe(true);
    });

    test('isAdminProfile returns true for admin role (case-insensitive)', () => {
        expect(isAdminProfile({ role: 'Admin' })).toBe(true);
    });

    test('hasEditorialRoleInProfile matches editorial_roles entries case-insensitively', () => {
        const profile = { editorial_roles: ['News', 'Writer'] };
        expect(hasEditorialRoleInProfile(profile, 'news')).toBe(true);
        expect(hasEditorialRoleInProfile(profile, 'writer')).toBe(true);
        expect(hasEditorialRoleInProfile(profile, 'safety')).toBe(false);
    });

    test('hasEditorialRoleInProfile supports legacy role field matching', () => {
        const profile = { role: 'News' };
        expect(hasEditorialRoleInProfile(profile, 'news')).toBe(true);
    });

    test('canProfileManagePolitics returns true for News editors', () => {
        const profile = { editorial_roles: ['News'] };
        expect(canProfileManagePolitics(profile)).toBe(true);
    });

    test('canProfileManagePolitics returns false for non-admin non-News users', () => {
        const profile = { role: 'user', editorial_roles: ['Writer'] };
        expect(canProfileManagePolitics(profile)).toBe(false);
    });

    test('isLocalDevelopmentHost recognizes common localhost variants', () => {
        expect(isLocalDevelopmentHost('localhost')).toBe(true);
        expect(isLocalDevelopmentHost('127.0.0.1')).toBe(true);
        expect(isLocalDevelopmentHost('::1')).toBe(true);
        expect(isLocalDevelopmentHost('app.localhost')).toBe(true);
    });

    test('isLocalDevelopmentHost rejects public hostnames', () => {
        expect(isLocalDevelopmentHost('marxist.info')).toBe(false);
        expect(isLocalDevelopmentHost('example.com')).toBe(false);
    });
});
