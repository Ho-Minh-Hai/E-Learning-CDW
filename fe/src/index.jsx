import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { supabase, API_BASE_URL } from './supabaseClient';

const originalFetch = window.fetch.bind(window);

window.fetch = async (resource, config = {}) => {
  const url = typeof resource === 'string' ? resource : resource.url;
  const shouldAttachToken = typeof url === 'string' && (url.startsWith(API_BASE_URL) || url.startsWith('/api/'));

  if (!shouldAttachToken) {
    return originalFetch(resource, config);
  }

  const session = await supabase.auth.getSession().then(({ data }) => data?.session).catch(() => null);
  const token = session?.access_token || session?.provider_token;
  const headers = new Headers(config.headers || (resource instanceof Request ? resource.headers : undefined));

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!headers.has('Content-Type') && config.body && !(config.body instanceof FormData) && !(config.body instanceof URLSearchParams)) {
    headers.set('Content-Type', 'application/json');
  }

  return originalFetch(resource, {
    ...config,
    headers,
    credentials: 'include',
  });
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
