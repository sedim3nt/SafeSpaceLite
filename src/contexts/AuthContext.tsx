import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

const OAUTH_RETURN_PATH_KEY = 'safespace.oauth.returnPath';

function getCurrentAppPath() {
  if (typeof window === 'undefined') return '/';
  return window.location.hash.startsWith('#/') ? window.location.hash.slice(1) : '/';
}

function getOAuthParamsFromHash() {
  if (typeof window === 'undefined') return null;

  const { hash } = window.location;
  const tokenHashIndex = hash.indexOf('#access_token=');
  const errorHashIndex = hash.indexOf('#error=');

  if (!hash.startsWith('#access_token=') && !hash.startsWith('#error=') && tokenHashIndex === -1 && errorHashIndex === -1) {
    return null;
  }

  const startIndex = tokenHashIndex >= 0 ? tokenHashIndex + 1 : errorHashIndex >= 0 ? errorHashIndex + 1 : 1;
  return new URLSearchParams(hash.slice(startIndex));
}

function consumeSavedReturnPath() {
  if (typeof window === 'undefined') return null;
  const savedPath = window.sessionStorage.getItem(OAUTH_RETURN_PATH_KEY);
  if (savedPath) {
    window.sessionStorage.removeItem(OAUTH_RETURN_PATH_KEY);
  }
  return savedPath;
}

function replaceHashRoute(path: string) {
  if (typeof window === 'undefined') return;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const nextUrl = `${window.location.origin}${window.location.pathname}${window.location.search}#${normalizedPath}`;
  window.history.replaceState({}, document.title, nextUrl);
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  googleAuthEnabled: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const googleAuthEnabled = import.meta.env.VITE_GOOGLE_AUTH_ENABLED === 'true';

  useEffect(() => {
    let active = true;

    const initializeSession = async () => {
      const oauthParams = getOAuthParamsFromHash();
      const accessToken = oauthParams?.get('access_token');
      const refreshToken = oauthParams?.get('refresh_token');
      const savedReturnPath = consumeSavedReturnPath();

      if (accessToken && refreshToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (!error && active) {
          setSession(data.session);
          setUser(data.session?.user ?? null);
          replaceHashRoute(savedReturnPath || '/');
          setLoading(false);
          return;
        }
      }

      const { data: { session } } = await supabase.auth.getSession();

      if (!active) return;

      setSession(session);
      setUser(session?.user ?? null);

      if (session && savedReturnPath && oauthParams) {
        replaceHashRoute(savedReturnPath);
      }

      setLoading(false);
    };

    void initializeSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error as Error | null };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!googleAuthEnabled) {
      return { error: new Error('Google sign-in is not available in SafeSpace yet. Use email sign-in for now.') };
    }

    window.sessionStorage.setItem(OAUTH_RETURN_PATH_KEY, getCurrentAppPath());

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${window.location.pathname}${window.location.search}`,
      },
    });
    return { error: error as Error | null };
  }, [googleAuthEnabled]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, googleAuthEnabled, signUp, signIn, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
