import { createServerSupabaseClient } from "@/lib/supabase/server";

export type AuthContext = {
  userId: string;
  role: "patient" | "doctor" | "admin";
};

export async function getAuthContext(): Promise<AuthContext | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const role = profile?.role;

  if (role !== "patient" && role !== "doctor" && role !== "admin") {
    return null;
  }

  return { userId: user.id, role };
}

export function requireRole(auth: AuthContext | null, roles: AuthContext["role"][]) {
  if (!auth) {
    return false;
  }

  return roles.includes(auth.role);
}

