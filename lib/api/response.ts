import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "VALIDATION_ERROR"
  | "RATE_LIMITED"
  | "NOT_FOUND"
  | "CONFLICT"
  | "PROVIDER_UNAVAILABLE"
  | "SERVER_ERROR";

export function apiOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data, error: null }, init);
}

export function apiError(code: ApiErrorCode, message: string, status: number) {
  return NextResponse.json({ data: null, error: { code, message } }, { status });
}

