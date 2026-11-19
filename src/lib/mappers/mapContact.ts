import { pickString } from "@/lib/unwrapList";

export type ContactStatus = "pending" | "replied" | "resolved";
export type ContactPriority = "low" | "medium" | "high" | "urgent";

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactStatus;
  priority: ContactPriority;
  createdAt: string;
  updatedAt: string;
};

function mapStatus(raw: string): ContactStatus {
  const value = raw.toLowerCase();
  if (value.includes("reply") || value === "replied") return "replied";
  if (value.includes("resolve") || value === "closed") return "resolved";
  return "pending";
}

function mapPriority(raw: string): ContactPriority {
  const value = raw.toLowerCase();
  if (value === "urgent" || value === "critical") return "urgent";
  if (value === "high") return "high";
  if (value === "medium") return "medium";
  return "low";
}

export function mapContactMessage(raw: unknown): ContactMessage {
  const record = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    id: pickString(record, ["_id", "id"]),
    name: pickString(record, ["name"], "Unknown"),
    email: pickString(record, ["email"]),
    subject: pickString(record, ["subject"], "(No subject)"),
    message: pickString(record, ["message"]),
    status: mapStatus(pickString(record, ["status"], "pending")),
    priority: mapPriority(pickString(record, ["priority"], "low")),
    createdAt: pickString(record, ["createdAt"]),
    updatedAt: pickString(record, ["updatedAt"]),
  };
}
