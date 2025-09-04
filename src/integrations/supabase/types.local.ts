
// Local types based on the Supabase database schema
// This file complements the auto-generated types.ts file

import { Severity, Status } from "@/types";

export interface SupabasePothole {
  id: string;
  road_id: string;
  pothole_number: number;
  latitude: number;
  longitude: number;
  severity: Severity;
  detection_accuracy: number;
  status: Status;
  report_date: string;
  scheduled_repair_date: string | null;
  completion_date: string | null;
  description: string | null;
  reported_by: string | null;
  image_url: string | null;
  created_at: string;
}
