import { redirect } from "next/navigation";

// Root → login (AppGuard will redirect to /dashboard if already authenticated)
export default function RootPage() {
  redirect("/login");
}
