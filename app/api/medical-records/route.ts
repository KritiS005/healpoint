import { getAuthContext } from "@/lib/api/auth";
import { apiError, apiOk } from "@/lib/api/response";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  const auth = await getAuthContext();
  if (!auth) {
    return apiError("UNAUTHENTICATED", "Sign in to view medical records.", 401);
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("medical_records")
    .select("*, patients(profile_id, profiles(full_name))")
    .is("deleted_at", null)
    .order("uploaded_at", { ascending: false });

  if (error) {
    return apiError("SERVER_ERROR", "Could not load medical records.", 500);
  }

  return apiOk({ records: data ?? [] });
}

