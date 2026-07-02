import { apiOk } from "@/lib/api/response";

export async function GET() {
  return apiOk({
    status: "ok",
    service: "healpoint",
    timestamp: new Date().toISOString(),
  });
}

