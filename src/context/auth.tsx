import { createContext, use, type PropsWithChildren } from 'react';

import { useStorageState } from '@/hooks/use-storage-state';

export type AuthUser = {
  name: string;
  email: string;
};

type AuthContextValue = {
  signIn: (email: string, password: string) => void;
  signUp: (name: string, email: string, password: string) => void;
  signOut: () => void;
  completeOnboarding: () => void;
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
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function useSession() {
  const value = use(AuthContext);
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

  function persistSession(nextUser: AuthUser) {
    setSession(`mock-token-${Date.now()}`);
    setUserRaw(JSON.stringify(nextUser));
  }

  return (
    <AuthContext.Provider
      value={{
        signIn: (email) => {
          persistSession({
            name: email.split('@')[0] || 'Plant Lover',
            email: email.trim().toLowerCase(),
          });
        },
        signUp: (name, email) => {
          persistSession({
            name: name.trim() || 'Plant Lover',
            email: email.trim().toLowerCase(),
          });
          setOnboardedRaw('true');
        },
        signOut: () => {
          setSession(null);
        },
        completeOnboarding: () => {
          setOnboardedRaw('true');
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
