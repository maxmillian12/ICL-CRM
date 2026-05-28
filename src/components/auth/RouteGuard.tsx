"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { PageLoader } from "@/components/ui/loading";
import type { Permission } from "@/lib/types";

interface RouteGuardProps {
  children: React.ReactNode;
  permission?: Permission;
  requireAdmin?: boolean;
  requireSuperAdmin?: boolean;
}

export function RouteGuard({ children, permission, requireAdmin, requireSuperAdmin }: RouteGuardProps) {
  const { user, loading, can, isAdmin, isSuperAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/login"); return; }
    if (requireSuperAdmin && !isSuperAdmin) { router.push("/dashboard"); return; }
    if (requireAdmin && !isAdmin) { router.push("/dashboard"); return; }
    if (permission && !can(permission)) { router.push("/dashboard"); return; }
  }, [loading, user, permission, requireAdmin, requireSuperAdmin, can, isAdmin, isSuperAdmin, router]);

  if (loading) return <PageLoader message="Verifying access..." />;
  if (!user) return <PageLoader message="Redirecting to login..." />;
  if (requireSuperAdmin && !isSuperAdmin) return null;
  if (requireAdmin && !isAdmin) return null;
  if (permission && !can(permission)) return null;

  return <>{children}</>;
}
