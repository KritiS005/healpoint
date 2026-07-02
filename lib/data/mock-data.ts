import { hasSupabaseConfig, supabase } from "./supabase-client";

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
    ai_summary: "Hemoglobin is slightly above the usual range, while cholesterol remains moderate. This should be reviewed with a clinician for context.",
  },
  {
    id: "record-002",
    patient_id: "patient-asha",
    file_url: "/records/prescription.pdf",
    record_type: "Prescription Summary",
    uploaded_at: "2026-06-04T09:30:00.000Z",
    ai_summary: "Medication plan includes hydration reminders and follow-up guidance for blood pressure monitoring.",
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
    response: "This summary points to a few markers that may be worth discussing with your clinician. It is not a diagnosis.",
    context_type: "report",
    created_at: "2026-06-30T09:00:00.000Z",
  },
  {
    id: "ai-conversation-002",
    user_id: "profile-patient-001",
    message: "Should I be worried about these values?",
    response: "The assistant can explain the terms, but a clinician should confirm the meaning for your personal case.",
    context_type: "general",
    created_at: "2026-06-30T09:10:00.000Z",
  },
];

async function getSupabaseRows<T>(table: string): Promise<T[]> {
  if (!hasSupabaseConfig() || !supabase) {
    return [];
  }

  const { data, error } = await supabase.from(table).select("*");

  if (error) {
    console.error(`Failed to load ${table} from Supabase`, error);
    return [];
  }

  return (data as T[]) ?? [];
}

export async function getProfiles(): Promise<ProfileRow[]> {
  if (hasSupabaseConfig() && supabase) {
    const rows = await getSupabaseRows<ProfileRow>("profiles");
    if (rows.length > 0) {
      return rows;
    }
  }

  return profiles;
}

export async function getPatientProfile(): Promise<ProfileRow> {
  if (hasSupabaseConfig() && supabase) {
    const rows = await getSupabaseRows<ProfileRow>("profiles");
    const patientRow = rows.find((profile) => profile.role === "patient");
    if (patientRow) {
      return patientRow;
    }
  }

  return profiles.find((profile) => profile.role === "patient") ?? profiles[0];
}

export async function getDoctors(): Promise<DoctorRow[]> {
  if (hasSupabaseConfig() && supabase) {
    const rows = await getSupabaseRows<DoctorRow>("doctors");
    if (rows.length > 0) {
      return rows;
    }
  }

  return doctors;
}

export async function getPatients(): Promise<PatientRow[]> {
  if (hasSupabaseConfig() && supabase) {
    const rows = await getSupabaseRows<PatientRow>("patients");
    if (rows.length > 0) {
      return rows;
    }
  }

  return patients;
}

export async function getAppointments(): Promise<AppointmentRow[]> {
  if (hasSupabaseConfig() && supabase) {
    const rows = await getSupabaseRows<AppointmentRow>("appointments");
    if (rows.length > 0) {
      return rows;
    }
  }

  return appointments;
}

export async function getMedicalRecords(): Promise<MedicalRecordRow[]> {
  if (hasSupabaseConfig() && supabase) {
    const rows = await getSupabaseRows<MedicalRecordRow>("medical_records");
    if (rows.length > 0) {
      return rows;
    }
  }

  return medicalRecords;
}

export async function getPrescriptions(): Promise<PrescriptionRow[]> {
  if (hasSupabaseConfig() && supabase) {
    const rows = await getSupabaseRows<PrescriptionRow>("prescriptions");
    if (rows.length > 0) {
      return rows;
    }
  }

  return prescriptions;
}

export async function getPayments(): Promise<PaymentRow[]> {
  if (hasSupabaseConfig() && supabase) {
    const rows = await getSupabaseRows<PaymentRow>("payments");
    if (rows.length > 0) {
      return rows;
    }
  }

  return payments;
}

export async function getNotifications(): Promise<NotificationRow[]> {
  if (hasSupabaseConfig() && supabase) {
    const rows = await getSupabaseRows<NotificationRow>("notifications");
    if (rows.length > 0) {
      return rows;
    }
  }

  return notifications;
}

export async function getAiConversations(): Promise<AiConversationRow[]> {
  if (hasSupabaseConfig() && supabase) {
    const rows = await getSupabaseRows<AiConversationRow>("ai_conversations");
    if (rows.length > 0) {
      return rows;
    }
  }

  return aiConversations;
}
