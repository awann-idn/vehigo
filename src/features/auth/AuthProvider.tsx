import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Linking from 'expo-linking';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

export type UserRole = 'penyewa' | 'mitra' | 'admin' | null;

export interface UserProfile {
  id: string;
  role: UserRole;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  role: UserRole;
  isLoading: boolean;
  profileError: string | null;
  refreshProfile: () => Promise<void>;
  updateRole: (newRole: 'penyewa' | 'mitra') => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  role: null,
  isLoading: true,
  profileError: null,
  refreshProfile: async () => {},
  updateRole: async () => {},
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw new Error(error.message);
      setProfileError(null);

      if (data) {
        setProfile({
          id: data.id,
          role: data.role || null,
          full_name: data.full_name || null,
          phone: data.phone || null,
          avatar_url: data.avatar_url || null,
        });
      } else {
        setProfile({ id: userId, role: null, full_name: null, phone: null, avatar_url: null });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setProfileError(err instanceof Error ? err.message : 'Profil gagal dimuat');
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  const updateRole = async (newRole: 'penyewa' | 'mitra') => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          role: newRole,
          updated_at: new Date().toISOString(),
        });

      if (error) throw new Error(error.message);
      setProfileError(null);
      setProfile((prev) => (prev ? { ...prev, role: newRole } : { id: user.id, role: newRole, full_name: null, phone: null, avatar_url: null }));
    } catch (err) {
      console.error('Error updating role:', err);
      throw err instanceof Error ? err : new Error('Gagal memperbarui peran');
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      setSession(null);
      setUser(null);
      setProfile(null);
      setProfileError(null);
    }
  };

  useEffect(() => {
    const handleAuthUrl = async (url: string) => {
      const parsed = Linking.parse(url);
      const query = parsed.queryParams ?? {};
      const authError = typeof query.error_description === 'string'
        ? query.error_description
        : typeof query.error === 'string' ? query.error : null;
      if (authError) {
        console.error('OAuth callback error:', authError);
        return;
      }
      const code = typeof query.code === 'string' ? query.code : null;
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) console.error('OAuth callback error:', error.message);
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) void handleAuthUrl(url);
    });
    const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
      void handleAuthUrl(url);
    });

    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) console.error('Error restoring session:', error.message);
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    }).catch((error) => {
      console.error('Error initializing auth:', error);
      setIsLoading(false);
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          await fetchProfile(newSession.user.id);
        } else {
          setProfile(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
      linkingSubscription.remove();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        role: profile?.role ?? null,
        isLoading,
        profileError,
        refreshProfile,
        updateRole,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
