import { createContext, useContext, type PropsWithChildren } from 'react';

import { useStorageState } from '@/hooks/use-storage-state';

import { ADMIN_DEMO_EMAIL } from '@/constants/mock-marketplace';

export type UserRole = 'user' | 'admin';

export type AuthUser = {
  name: string;
  email: string;
  role: UserRole;
  avatarUri?: string;
};

type AuthContextValue = {
  signIn: (email: string, password: string) => void;
  signUp: (name: string, email: string, password: string) => void;
  signOut: () => void;
  completeOnboarding: () => void;
  updateProfile: (updates: Partial<Pick<AuthUser, 'name' | 'avatarUri'>>) => void;
  session: string | null;
  user: AuthUser | null;
  hasOnboarded: boolean;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const SESSION_KEY = 'plantcare_session';
const USER_KEY = 'plantcare_user';
const ONBOARDED_KEY = 'plantcare_onboarded';

function parseUser(raw: string | null): AuthUser | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AuthUser;
    return {
      ...parsed,
      role: parsed.role ?? (parsed.email === ADMIN_DEMO_EMAIL ? 'admin' : 'user'),
    };
  } catch {
    return null;
  }
}

export function useSession() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useSession must be wrapped in a <SessionProvider />');
  }
  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isSessionLoading, session], setSession] = useStorageState(SESSION_KEY);
  const [[isUserLoading, userRaw], setUserRaw] = useStorageState(USER_KEY);
  const [[isOnboardedLoading, onboardedRaw], setOnboardedRaw] = useStorageState(ONBOARDED_KEY);

  const isLoading = isSessionLoading || isUserLoading || isOnboardedLoading;
  const hasOnboarded = onboardedRaw === 'true';
  const user = parseUser(userRaw);

  function resolveRole(email: string): UserRole {
    return email.trim().toLowerCase() === ADMIN_DEMO_EMAIL ? 'admin' : 'user';
  }

  function persistSession(nextUser: AuthUser) {
    setSession(`mock-token-${Date.now()}`);
    setUserRaw(JSON.stringify(nextUser));
  }

  function buildUser(name: string, email: string, avatarUri?: string): AuthUser {
    const normalized = email.trim().toLowerCase();
    return {
      name: name.trim() || 'Plant Lover',
      email: normalized,
      role: resolveRole(normalized),
      avatarUri,
    };
  }

  return (
    <AuthContext.Provider
      value={{
        signIn: (email) => {
          persistSession(
            buildUser(email.split('@')[0] || 'Plant Lover', email),
          );
        },
        signUp: (name, email) => {
          persistSession(buildUser(name, email));
          setOnboardedRaw('true');
        },
        signOut: () => {
          setSession(null);
        },
        completeOnboarding: () => {
          setOnboardedRaw('true');
        },
        updateProfile: (updates) => {
          if (!user) return;
          const next: AuthUser = {
            ...user,
            ...updates,
            name: updates.name?.trim() || user.name,
          };
          setUserRaw(JSON.stringify(next));
        },
        session,
        user,
        hasOnboarded,
        isLoading,
      }}>
      {children}
    </AuthContext.Provider>
  );
}
