import { cookies, headers } from 'next/headers';
import {
  DEV_ADMIN_PROFILE,
  DEV_ADMIN_USER,
  DEV_AUTH_COOKIE_KEY,
  isLocalDevelopmentHost,
} from './auth.js';
import { createClient } from './supabase/server.js';

const getHostname = () => {
  const host = headers().get('host') || '';
  return host.split(':')[0];
};

export async function getServerAuthState() {
  const cookieStore = cookies();
  const isLocalDevAdmin =
    isLocalDevelopmentHost(getHostname()) &&
    cookieStore.get(DEV_AUTH_COOKIE_KEY)?.value === 'true';

  if (isLocalDevAdmin) {
    return { user: DEV_ADMIN_USER, profile: DEV_ADMIN_PROFILE };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null };
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();

  return { user, profile: profile || null };
}
