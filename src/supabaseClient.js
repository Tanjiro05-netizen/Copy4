import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key are required. Make sure they are set in your .env file and prefixed with REACT_APP_');
}

const authLockNoop = async (_name, _acquireTimeout, fn) => fn();

const createSupabaseClient = () =>
  createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      lock: authLockNoop,
    },
  });

const getSupabaseClient = () => {
  if (typeof window === 'undefined') {
    return createSupabaseClient();
  }

  if (!window.__MARXIST_SUPABASE_CLIENT__) {
    window.__MARXIST_SUPABASE_CLIENT__ = createSupabaseClient();
  }

  return window.__MARXIST_SUPABASE_CLIENT__;
};

export const supabase = getSupabaseClient();
