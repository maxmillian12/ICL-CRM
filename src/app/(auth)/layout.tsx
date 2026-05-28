import { AuthProvider } from "@/lib/auth-context";

// Minimal layout for auth pages — no sidebar, no route guard
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
