export const DOCTOR_SPECIALTIES = [
  "Cardiology",
  "Dermatology",
  "ENT",
  "General Practice",
  "Gynecology",
  "Neurology",
  "Ophthalmology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
] as const;

export type DoctorSpecialty = (typeof DOCTOR_SPECIALTIES)[number];
