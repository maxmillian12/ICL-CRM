"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Permission, UserRole } from "./types";
import { ROLE_PERMISSIONS } from "./types";
import { tokenStorage, authApi, getApiError } from "./api-client";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  department_id?: string;
  phone?: string;
  status: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  can: (permission: Permission) => boolean;
  canAny: (permissions: Permission[]) => boolean;
  isRole: (role: UserRole) => boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadUser = useCallback(async () => {
    const token = tokenStorage.get();
    if (!token) { setLoading(false); return; }
    try {
      const res = await authApi.me();
      setUser(res.data as AuthUser);
    } catch {
      tokenStorage.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    const { token, user: u } = res.data as { token: string; user: AuthUser };
    tokenStorage.set(token);
    setUser(u);
    router.push("/dashboard");
  };

  const logout = useCallback(() => {
    authApi.logout().catch(() => {});
    tokenStorage.clear();
    setUser(null);
    router.push("/login");
  }, [router]);

  const refreshUser = async () => { await loadUser(); };

  const can = useCallback(
    (permission: Permission): boolean => {
      if (!user) return false;
      const perms = ROLE_PERMISSIONS[user.role] ?? [];
      return perms.includes(permission);
    },
    [user]
  );

  const canAny = useCallback(
    (permissions: Permission[]) => permissions.some((p) => can(p)),
    [can]
  );

  const isRole = useCallback((role: UserRole) => user?.role === role, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      can,
      canAny,
      isRole,
      isSuperAdmin: user?.role === "super_admin",
      isAdmin: user?.role === "super_admin" || user?.role === "admin",
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
