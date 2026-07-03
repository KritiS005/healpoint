import { createServerSupabaseClient } from "@/lib/supabase/server";

export type ProfileRole = "patient" | "doctor" | "admin";

export interface ProfileRow {
  id: string;
  full_name: string;
  role: ProfileRole;
  avatar_url: string;
  created_at: string;
}

export interface DoctorRow {
  id: string;
  profile_id: string;
  specialty: string;
  bio: string;
  verified: boolean;
  rating: number;
}

export interface PatientRow {
  id: string;
  profile_id: string;
  date_of_birth: string;
  gender: string;
  medical_history_summary: string;
}

export interface AppointmentRow {
  id: string;
  patient_id: string;
  doctor_id: string;
  scheduled_at: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes: string;
}

export interface MedicalRecordRow {
  id: string;
  patient_id: string;
  file_url: string;
  record_type: string;
  uploaded_at: string;
  ai_summary: string;
}

export interface PrescriptionRow {
  id: string;
  appointment_id: string;
  doctor_id: string;
  patient_id: string;
  content: string;
  issued_at: string;
}

export interface PaymentRow {
  id: string;
  appointment_id: string;
  amount: number;
  status: string;
  provider_ref: string;
  created_at: string;
}

export interface NotificationRow {
  id: string;
  user_id: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface AiConversationRow {
  id: string;
  user_id: string;
  message: string;
  response: string;
  context_type: "report" | "prescription" | "general";
  created_at: string;
}

// ---------------------------------------------------------------------------
// MOCK DATA — used ONLY as a last-resort fallback. Kept intentionally for
// debugging / offline development. Every place this is returned logs a
// warning via warnFallback() so you can see it happening in real time.
// ---------------------------------------------------------------------------

const profiles: ProfileRow[] = [
  {
    id: "profile-patient-001",
    full_name: "Asha Raman",
    role: "patient",
    avatar_url: "/avatars/patient.png",
    created_at: "2026-01-18T10:00:00.000Z",
  },
  {
    id: "profile-doctor-001",
    full_name: "Dr. Ananya Sen",
    role: "doctor",
    avatar_url: "/avatars/doctor-1.png",
    created_at: "2025-12-02T09:15:00.000Z",
  },
  {
    id: "profile-doctor-002",
    full_name: "Dr. Rahim Khan",
    role: "doctor",
    avatar_url: "/avatars/doctor-2.png",
    created_at: "2025-12-05T14:20:00.000Z",
  },
  {
    id: "profile-admin-001",
    full_name: "Mina Patel",
    role: "admin",
    avatar_url: "/avatars/admin.png",
    created_at: "2025-11-10T08:45:00.000Z",
  },
];

const doctors: DoctorRow[] = [
  {
    id: "doctor-ananya",
    profile_id: "profile-doctor-001",
    specialty: "Cardiology",
    bio: "Specializes in heart health screening and treatment planning.",
    verified: true,
    rating: 4.9,
  },
  {
    id: "doctor-rahim",
    profile_id: "profile-doctor-002",
    specialty: "Neurology",
    bio: "Specializes in neurological symptom review and recovery coaching.",
    verified: true,
    rating: 4.8,
  },
  {
    id: "doctor-meera",
    profile_id: "profile-doctor-003",
    specialty: "Pediatrics",
    bio: "Supports families with pediatric illness guidance and follow-ups.",
    verified: false,
    rating: 4.9,
  },
];

const patients: PatientRow[] = [
  {
    id: "patient-asha",
    profile_id: "profile-patient-001",
    date_of_birth: "1992-04-12",
    gender: "female",
    medical_history_summary: "History of elevated cholesterol and hypertension monitoring.",
  },
];

const appointments: AppointmentRow[] = [
  {
    id: "appointment-001",
    patient_id: "patient-asha",
    doctor_id: "doctor-ananya",
    scheduled_at: "2026-06-30T17:30:00.000Z",
    status: "confirmed",
    notes: "Cardiology review and follow-up discussion",
  },
  {
    id: "appointment-002",
    patient_id: "patient-asha",
    doctor_id: "doctor-rahim",
    scheduled_at: "2026-07-01T11:00:00.000Z",
    status: "pending",
    notes: "Neurology symptom review",
  },
  {
    id: "appointment-003",
    patient_id: "patient-asha",
    doctor_id: "doctor-meera",
    scheduled_at: "2026-07-02T18:00:00.000Z",
    status: "pending",
    notes: "Pediatric follow-up preparation",
  },
];

const medicalRecords: MedicalRecordRow[] = [
  {
    id: "record-001",
    patient_id: "patient-asha",
    file_url: "/records/blood-report.pdf",
    record_type: "Blood Report",
    uploaded_at: "2026-06-12T08:00:00.000Z",
    ai_summary:
      "Hemoglobin is slightly above the usual range, while cholesterol remains moderate. This should be reviewed with a clinician for context.",
  },
  {
    id: "record-002",
    patient_id: "patient-asha",
    file_url: "/records/prescription.pdf",
    record_type: "Prescription Summary",
    uploaded_at: "2026-06-04T09:30:00.000Z",
    ai_summary:
      "Medication plan includes hydration reminders and follow-up guidance for blood pressure monitoring.",
  },
];

const prescriptions: PrescriptionRow[] = [
  {
    id: "prescription-001",
    appointment_id: "appointment-001",
    doctor_id: "doctor-ananya",
    patient_id: "patient-asha",
    content: "Continue your current plan and review blood pressure trends for the next two weeks.",
    issued_at: "2026-06-30T17:30:00.000Z",
  },
  {
    id: "prescription-002",
    appointment_id: "appointment-002",
    doctor_id: "doctor-rahim",
    patient_id: "patient-asha",
    content: "Keep a symptom journal and schedule a follow-up if intensity rises.",
    issued_at: "2026-07-01T11:00:00.000Z",
  },
];

const payments: PaymentRow[] = [
  {
    id: "payment-001",
    appointment_id: "appointment-001",
    amount: 45,
    status: "completed",
    provider_ref: "mock-card-001",
    created_at: "2026-06-28T12:00:00.000Z",
  },
  {
    id: "payment-002",
    appointment_id: "appointment-002",
    amount: 18,
    status: "pending",
    provider_ref: "mock-card-002",
    created_at: "2026-06-29T09:00:00.000Z",
  },
];

const notifications: NotificationRow[] = [
  {
    id: "notification-001",
    user_id: "profile-patient-001",
    message: "Your consultation has been confirmed.",
    read: false,
    created_at: "2026-06-30T08:00:00.000Z",
  },
];

const aiConversations: AiConversationRow[] = [
  {
    id: "ai-conversation-001",
    user_id: "profile-patient-001",
    message: "What does this report mean in simple words?",
    response:
      "This summary points to a few markers that may be worth discussing with your clinician. It is not a diagnosis.",
    context_type: "report",
    created_at: "2026-06-30T09:00:00.000Z",
  },
  {
    id: "ai-conversation-002",
    user_id: "profile-patient-001",
    message: "Should I be worried about these values?",
    response:
      "The assistant can explain the terms, but a clinician should confirm the meaning for your personal case.",
    context_type: "general",
    created_at: "2026-06-30T09:10:00.000Z",
  },
];

// ---------------------------------------------------------------------------
// Diagnostics helper — logs WHY a fallback happened, instead of swallowing it.
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
    // Previously invisible: a real Supabase error (RLS denial, missing
    // table, bad column, etc.) was silently swallowed and treated the
    // same as "no rows". Now it's surfaced explicitly.
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
        `If this happens on first load, make sure middleware.ts is refreshing the ` +
        `Supabase session cookie on every request (see note below).`
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
// Public getters
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

  if (error) {
    warnFallback(
      "profiles (current patient)",
      `Query for id="${user.id}" failed — ${error.message} (code: ${error.code ?? "unknown"}). ` +
        `Check that a row exists in "profiles" whose "id" column exactly matches the ` +
        `Supabase Auth user id, and that RLS allows the user to select their own row.`
    );
    return profiles[0];
  }

  if (!data) {
    warnFallback(
      "profiles (current patient)",
      `No profile row found with id="${user.id}". The profiles table likely has no ` +
        `matching row for this auth user — check your signup/profile-creation flow.`
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