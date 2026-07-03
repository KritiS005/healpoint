import "server-only";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !key) {
    throw new Error("Supabase environment variables are not configured.");
  }

  return createServerClient(url, key, {
    cookies: {
      async getAll() {
        return (await cookieStore).getAll();
      },
      async setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
        try {
          const cookieStoreInstance = await cookieStore;
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStoreInstance.set(name, value, options);
          });
        } catch {
          // The `setAll` method will be called from Server Components
          // where cookies cannot be set. This catch block prevents
          // the app from crashing.
        }
      },
    },
  });
}