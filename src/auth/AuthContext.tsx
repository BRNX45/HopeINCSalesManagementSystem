import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { addLoginActivity, getAppUserByEmail } from '../data/mockData';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

export type RightCode =
  | 'SALES_VIEW'
  | 'SALES_ADD'
  | 'SALES_EDIT'
  | 'SALES_DEL'
  | 'SD_VIEW'
  | 'SD_ADD'
  | 'SD_EDIT'
  | 'SD_DEL'
  | 'CUST_LOOKUP'
  | 'EMP_LOOKUP'
  | 'PROD_LOOKUP'
  | 'PRICE_LOOKUP'
  | 'ADM_USER';

export type RightsMap = Record<RightCode, 0 | 1>;
export type UserType = 'USER' | 'ADMIN' | 'SUPERADMIN';

type User = {
  id: string;
  email: string;
  fullName: string;
  username?: string;
  user_type: UserType;
};

type AuthContextValue = {
  currentUser: User | null;
  rights: RightCode[];
  rightsMap: RightsMap;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    firstName: string,
    lastName: string,
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  googleSignIn: () => Promise<void>;
  googleRegister: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const ALL_RIGHTS: RightCode[] = [
  'SALES_VIEW',
  'SALES_ADD',
  'SALES_EDIT',
  'SALES_DEL',
  'SD_VIEW',
  'SD_ADD',
  'SD_EDIT',
  'SD_DEL',
  'CUST_LOOKUP',
  'EMP_LOOKUP',
  'PROD_LOOKUP',
  'PRICE_LOOKUP',
  'ADM_USER',
];

function buildRightsMap(rights: RightCode[]): RightsMap {
  return ALL_RIGHTS.reduce(
    (map, code) => ({ ...map, [code]: rights.includes(code) ? 1 : 0 }),
    {} as RightsMap
  );
}

function normalizeUser(user: SupabaseUser | null): User | null {
  if (!user || !user.email) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    fullName:
      (user.user_metadata as Record<string, unknown> | null)?.full_name?.toString() || user.email,
    username: (user.user_metadata as Record<string, unknown> | null)?.username?.toString(),
    user_type: 'USER',
  };
}

function getDefaultRights(email: string | null): RightCode[] {
  const allRights: RightCode[] = [
    'SALES_VIEW',
    'SALES_ADD',
    'SALES_EDIT',
    'SALES_DEL',
    'SD_VIEW',
    'SD_ADD',
    'SD_EDIT',
    'SD_DEL',
    'CUST_LOOKUP',
    'EMP_LOOKUP',
    'PROD_LOOKUP',
    'PRICE_LOOKUP',
    'ADM_USER',
  ];

  const superadminEmails = ['jcesperanza@neu.edu.ph', 'brix.delossantos@neu.edu.ph'];
  const adminEmails = ['brixconde123@gmail.com'];

  if (superadminEmails.includes(email ?? '')) {
    return allRights;
  }

  if (adminEmails.includes(email ?? '')) {
    return allRights;
  }

  return [
    'SALES_VIEW',
    'SD_VIEW',
    'CUST_LOOKUP',
    'EMP_LOOKUP',
    'PROD_LOOKUP',
    'PRICE_LOOKUP',
  ];
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [rights, setRights] = useState<RightCode[]>([]);
  const [rightsMap, setRightsMap] = useState<RightsMap>(() => buildRightsMap([]));
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const fetchUserRights = async (authId: string) => {
    const { data: appUserData, error: appUserError } = await supabase
      .from('app_user')
      .select('id')
      .eq('auth_id', authId)
      .single();

    if (appUserError || !appUserData?.id) {
      return { codes: [] as RightCode[], map: buildRightsMap([]) };
    }

    const { data, error } = await supabase
      .from('user_module_rights')
      .select('can, rights(code), user_module(user_id)')
      .eq('user_module.user_id', appUserData.id);

    if (error || !Array.isArray(data)) {
      return { codes: [] as RightCode[], map: buildRightsMap([]) };
    }

    const codes: RightCode[] = [];
    const map = buildRightsMap([]);

    data.forEach((row: any) => {
      const code = row?.rights?.code as RightCode | undefined;
      const can = row?.can;
      if (code && ALL_RIGHTS.includes(code)) {
        map[code] = can ? 1 : 0;
        if (can && !codes.includes(code)) {
          codes.push(code);
        }
      }
    });

    return { codes, map };
  };

  const guardUserStatus = async (session: Session | null) => {
    const user = session?.user;
    if (!user) {
      return false;
    }

    const metadata = user.user_metadata as Record<string, unknown> | null;
    let recordStatus = metadata?.record_status?.toString().toUpperCase();

    if (!recordStatus) {
      const { data, error } = await supabase
        .from('app_user')
        .select('record_status')
        .eq('auth_id', user.id)
        .single();

      if (!error && data?.record_status) {
        recordStatus = data.record_status.toString().toUpperCase();
      }
    }

    const blockedUser = getAppUserByEmail(user.email ?? '');
    if (blockedUser?.blocked) {
      addLoginActivity({
        userId: blockedUser.id,
        username: user.email ?? '',
        user_type: blockedUser.user_type,
        action: 'Logged In',
        status: 'BLOCKED',
        timestamp: new Date().toISOString(),
      });
      await supabase.auth.signOut();
      setCurrentUser(null);
      setAuthError('Your account is blocked.');
      navigate('/login?error=blocked', { replace: true });
      return false;
    }

    if (recordStatus && recordStatus !== 'ACTIVE') {
      await supabase.auth.signOut();
      setCurrentUser(null);
      setAuthError('Your account is not activated.');
      navigate('/login?error=not_activated', { replace: true });
      return false;
    }

    return true;
  };

  const handleSignedIn = async (session: Session | null) => {
    if (!(await guardUserStatus(session))) {
      return;
    }

    const user = normalizeUser(session?.user ?? null);
    const effectiveRights = await fetchUserRights(session?.user?.id ?? '');
    const grants =
      effectiveRights.codes.length > 0
        ? effectiveRights.codes
        : getDefaultRights(user?.email ?? null);
    const grantsMap =
      effectiveRights.codes.length > 0
        ? effectiveRights.map
        : buildRightsMap(getDefaultRights(user?.email ?? null));

    const superadminEmails = ['jcesperanza@neu.edu.ph', 'brix.delossantos@neu.edu.ph'];
    const adminEmails = ['brixconde123@gmail.com'];
    const userType: UserType = superadminEmails.includes(user?.email ?? '')
      ? 'SUPERADMIN'
      : adminEmails.includes(user?.email ?? '') || grants.includes('ADM_USER')
      ? 'ADMIN'
      : 'USER';

    const normalizedUser = user ? { ...user, user_type: userType } : null;
    setCurrentUser(normalizedUser);
    setRights(grants);
    setRightsMap(grantsMap);
    setAuthError(null);

    if (normalizedUser) {
      addLoginActivity({
        userId: getAppUserByEmail(normalizedUser.email)?.id ?? null,
        username: normalizedUser.email,
        user_type: normalizedUser.user_type,
        action: 'Logged In',
        status: 'SUCCESS',
        timestamp: new Date().toISOString(),
      });
    }
  };

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (mounted && session) {
        await handleSignedIn(session);
      }

      if (mounted) {
        setLoading(false);
      }
    };

    initialize();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        await handleSignedIn(session);
        navigate('/sales', { replace: true });
      }

      if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setAuthError(null);
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const login = async (email: string, password: string) => {
    setAuthError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data.session) {
      await handleSignedIn(data.session);
      navigate('/sales', { replace: true });
    }
  };

  const register = async (
    firstName: string,
    lastName: string,
    username: string,
    email: string,
    password: string
  ) => {
    setAuthError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: `${firstName} ${lastName}`,
          username,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data.session) {
      await handleSignedIn(data.session);
      navigate('/sales', { replace: true });
    }
  };

  const googleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data?.url) {
      window.location.href = data.url;
    }
  };

  const googleRegister = async () => {
    await googleSignIn();
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('Logout failed', error);
      setAuthError(error?.message || 'Logout failed.');
    } finally {
      setCurrentUser(null);
      navigate('/login', { replace: true });
    }
  };

  const value = useMemo(
    () => ({
      currentUser,
      rights,
      rightsMap,
      isAdmin: rights.includes('ADM_USER'),
      isSuperAdmin: currentUser?.user_type === 'SUPERADMIN',
      loading,
      authError,
      login,
      register,
      googleSignIn,
      googleRegister,
      logout,
    }),
    [currentUser, rights, rightsMap, loading, authError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function useRights() {
  const { rightsMap } = useAuth();
  return rightsMap;
}
