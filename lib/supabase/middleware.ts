import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const protectedPrefixes = ["/dashboard", "/admin"];
const authRoutes = ["/auth/login", "/auth/signup", "/auth/forgot-password", "/auth/reset-password", "/auth/verify"];
const securityHeaders = {
  "Cross-Origin-Opener-Policy": "same-origin",
  "Permissions-Policy": "camera=(self), microphone=(self), display-capture=(self), geolocation=(), payment=(self)",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

function withSecurityHeaders(response: NextResponse) {
  Object.entries(securityHeaders).forEach(([name, value]) => {
    response.headers.set(name, value);
  });

  return response;
}

function isProtectedRoute(pathname: string) {
  return protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"));
}

function isAuthRoute(pathname: string) {
  return authRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"));
}

function getRoleRedirect(pathname: string, role: string | null) {
  if (pathname.startsWith("/admin") && role !== "admin") {
    return role === "doctor" ? "/dashboard/doctor" : role === "patient" ? "/dashboard/patient" : "/dashboard";
  }

  if (pathname.startsWith("/dashboard/doctor") && role !== "doctor") {
    return role === "admin" ? "/admin" : role === "patient" ? "/dashboard/patient" : "/dashboard";
  }

  if (pathname.startsWith("/dashboard/patient") && role !== "patient") {
    return role === "admin" ? "/admin" : role === "doctor" ? "/dashboard/doctor" : "/dashboard";
  }

  if (pathname === "/dashboard" && role === "doctor") {
    return "/dashboard/doctor";
  }

  if (pathname === "/dashboard" && role === "admin") {
    return "/admin";
  }

  if (pathname === "/dashboard" && role === "patient") {
    return "/dashboard/patient";
  }

  return null;
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request: { headers: request.headers } });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (user && isAuthRoute(pathname)) {
    return withSecurityHeaders(NextResponse.redirect(new URL("/dashboard", request.url)));
  }

  if (!user && isProtectedRoute(pathname)) {
    const redirectUrl = new URL("/auth/login", request.url);
    redirectUrl.searchParams.set("redirectTo", pathname);
    return withSecurityHeaders(NextResponse.redirect(redirectUrl));
  }

  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    const redirectTo = getRoleRedirect(pathname, profile?.role ?? null);

    if (redirectTo) {
      return withSecurityHeaders(NextResponse.redirect(new URL(redirectTo, request.url)));
    }
  }

  return withSecurityHeaders(response);
}
