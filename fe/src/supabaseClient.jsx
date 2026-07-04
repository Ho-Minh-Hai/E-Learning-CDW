import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

export const authFetch = async (url, options = {}) => {
  const session = supabase.auth.getSession ? await supabase.auth.getSession().then(({ data }) => data?.session) : null;
  const token = session?.access_token || session?.provider_token;
  const headers = {
    ...(options.headers || {}),
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const fetchOptions = {
    credentials: 'include',
    ...options,
    headers,
  };

  return fetch(url, fetchOptions);
};
