import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export type PublicDoctor = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  specialty: string;
  bio: string | null;
  rating: number;
  consultationFee: number;
};

type PublicDoctorRow = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  specialty: string;
  bio: string | null;
  rating: number | string | null;
  consultation_fee: number;
};

function mapPublicDoctor(row: PublicDoctorRow): PublicDoctor {
  return {
    id: row.id,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    specialty: row.specialty,
    bio: row.bio,
    rating: Number(row.rating ?? 0),
    consultationFee: row.consultation_fee,
  };
}

/** Public, approved doctors only. Returns an empty list if the view is not deployed yet. */
export async function getPublicDoctors(limit?: number): Promise<PublicDoctor[]> {
  try {
    const supabase = await createServerSupabaseClient();
    let query = supabase
      .from("public_doctors")
      .select("id, full_name, avatar_url, specialty, bio, rating, consultation_fee")
      .order("rating", { ascending: false })
      .order("created_at", { ascending: false });

    if (limit) query = query.limit(limit);

    const { data, error } = await query;
    if (error) {
      console.error("[public doctors] fetch:", error.message);
      return [];
    }

    return ((data ?? []) as PublicDoctorRow[]).map(mapPublicDoctor);
  } catch (error) {
    console.error("[public doctors] unavailable:", error);
    return [];
  }
}

export async function getDoctorProfile(profileId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("doctors")
    .select("id, specialty, bio, rating, consultation_fee, profiles(full_name, avatar_url)")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const profile = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;
  return {
    id: data.id as string,
    fullName: (profile?.full_name as string | undefined) ?? "Doctor",
    avatarUrl: (profile?.avatar_url as string | undefined) ?? null,
    specialty: data.specialty as string,
    bio: (data.bio as string | null | undefined) ?? null,
    rating: Number(data.rating ?? 0),
    consultationFee: Number(data.consultation_fee ?? 0),
  };
}
