import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  doctors,
  patients,
  profiles,
  appointments,
  medicalRecords,
  prescriptions,
  payments,
  notifications,
  aiConversations,
  type ProfileRow,
  type DoctorRow,
  type PatientRow,
  type AppointmentRow,
  type MedicalRecordRow,
  type PrescriptionRow,
  type PaymentRow,
  type NotificationRow,
  type AiConversationRow,
} from "./mock-data";

// ---------------------------------------------------------------------------
// Diagnostics helper
// ---------------------------------------------------------------------------

function warnFallback(table: string, reason: string) {
  // eslint-disable-next-line no-console
  console.warn(
    `[mock-data] Falling back to MOCK data for "${table}". Reason: ${reason}`
  );
}

async function getSupabaseRows<T>(table: string): Promise<T[] | null> {
  let client;
  try {
    client = await createServerSupabaseClient();
  } catch (err) {
    warnFallback(table, `Failed to create Supabase server client — ${(err as Error).message}`);
    return null;
  }

  const { data, error } = await client.from(table).select("*");

  if (error) {
    warnFallback(
      table,
      `Supabase query failed — ${error.message} (code: ${error.code ?? "unknown"}). ` +
        `This is very often caused by a Row Level Security (RLS) policy blocking the SELECT.`
    );
    return null;
  }

  if (!data || data.length === 0) {
    warnFallback(table, `Supabase query succeeded but returned 0 rows. Table may be empty.`);
    return null;
  }

  return data as T[];
}

async function getCurrentUser() {
  let client;
  try {
    client = await createServerSupabaseClient();
  } catch (err) {
    warnFallback("auth.getUser", `Failed to create Supabase server client — ${(err as Error).message}`);
    return null;
  }

  const { data, error } = await client.auth.getUser();

  if (error) {
    warnFallback(
      "auth.getUser",
      `Auth session lookup failed — ${error.message}. ` +
        `Make sure middleware.ts is refreshing the Supabase session cookie on every request.`
    );
    return null;
  }

  if (!data.user) {
    warnFallback("auth.getUser", "No authenticated user found for this request (no active session).");
    return null;
  }

  return data.user;
}

// ---------------------------------------------------------------------------
// Public getters — server-only
// ---------------------------------------------------------------------------

export async function getProfiles(): Promise<ProfileRow[]> {
  const rows = await getSupabaseRows<ProfileRow>("profiles");
  return rows ?? profiles;
}

export async function getPatientProfile(): Promise<ProfileRow> {
  const user = await getCurrentUser();

  if (!user) {
    warnFallback("profiles (current patient)", "No authenticated user — returning mock profile.");
    return profiles[0];
  }

  let client;
  try {
    client = await createServerSupabaseClient();
  } catch (err) {
    warnFallback("profiles (current patient)", `Failed to create Supabase server client — ${(err as Error).message}`);
    return profiles[0];
  }

  const { data, error } = await client
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !data) {
    warnFallback(
      "profiles (current patient)",
      error
        ? `Query for id="${user.id}" failed — ${error.message} (code: ${error.code ?? "unknown"}).`
        : `No profile row found with id="${user.id}".`
    );
    return profiles[0];
  }

  return data as ProfileRow;
}

export async function getDoctors(): Promise<DoctorRow[]> {
  const rows = await getSupabaseRows<DoctorRow>("doctors");
  return rows ?? doctors;
}

export async function getPatients(): Promise<PatientRow[]> {
  const rows = await getSupabaseRows<PatientRow>("patients");
  return rows ?? patients;
}

export async function getAppointments(): Promise<AppointmentRow[]> {
  const rows = await getSupabaseRows<AppointmentRow>("appointments");
  return rows ?? appointments;
}

export async function getMedicalRecords(): Promise<MedicalRecordRow[]> {
  const rows = await getSupabaseRows<MedicalRecordRow>("medical_records");
  return rows ?? medicalRecords;
}

export async function getPrescriptions(): Promise<PrescriptionRow[]> {
  const rows = await getSupabaseRows<PrescriptionRow>("prescriptions");
  return rows ?? prescriptions;
}

export async function getPayments(): Promise<PaymentRow[]> {
  const rows = await getSupabaseRows<PaymentRow>("payments");
  return rows ?? payments;
}

export async function getNotifications(): Promise<NotificationRow[]> {
  const rows = await getSupabaseRows<NotificationRow>("notifications");
  return rows ?? notifications;
}

export async function getAiConversations(): Promise<AiConversationRow[]> {
  const rows = await getSupabaseRows<AiConversationRow>("ai_conversations");
  return rows ?? aiConversations;
}
