import React, { createContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../supabaseClient';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const syncedRef = useRef(new Set()); // Track synced user IDs

  useEffect(() => {
    const syncProfile = async (sessionUser) => {
      if (!sessionUser) return;
      // Only sync once per user session
      if (syncedRef.current.has(sessionUser.id)) return;
      syncedRef.current.add(sessionUser.id);
      
      const rawRole = sessionUser.user_metadata?.role || 'user';
      let dbRole = 'user';
      if (rawRole === 'instructor') dbRole = 'teacher';
      else if (rawRole === 'admin') dbRole = 'admin';
      else dbRole = 'user';

      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        await fetch('http://localhost:8080/api/profiles/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            id: sessionUser.id,
            fullName: sessionUser.user_metadata?.full_name,
            avatarUrl: sessionUser.user_metadata?.avatar_url,
            role: dbRole
          })
        });
      } catch (err) {
        console.error('Failed to sync profile:', err);
      }
    };

    // Check active sessions and sets the user
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        syncProfile(session.user);
      }
      setLoading(false);
    };

    checkUser();

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        syncProfile(session.user);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = (email, password, metadata) => {
    return supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
  };

  const signIn = (email, password) => {
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signOut = () => {
    return supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, signUp, signIn, signOut, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
