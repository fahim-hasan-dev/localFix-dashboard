import { pick, pickString } from "@/lib/unwrapList";
import type {
  SupportTicket,
  TicketCategory,
  TicketMessage,
  TicketPriority,
  TicketStatus,
} from "@/types/common.types";

function mapPriority(raw: string): TicketPriority {
  const value = raw.toLowerCase();
  if (value === "urgent" || value === "critical") return "urgent";
  if (value === "high") return "high";
  if (value === "low") return "low";
  return "medium";
}

function mapStatus(raw: string): TicketStatus {
  const value = raw.toLowerCase();
  if (value.includes("progress") || value.includes("review")) return "in_progress";
  if (value.includes("resolve")) return "resolved";
  if (value.includes("close")) return "closed";
  return "open";
}

function mapCategory(raw: string): TicketCategory {
  const value = raw.toLowerCase();
  if (value.includes("bill") || value.includes("sub")) return "billing";
  if (value.includes("account") || value.includes("profile")) return "account";
  if (value.includes("job") || value.includes("dispatch")) return "job_issue";
  if (value.includes("tech")) return "technical";
  if (value.includes("verif") || value.includes("clearance") || value.includes("checkr")) {
    return "pro_verification";
  }
  return "general";
}

function mapRole(raw: string): "homeowner" | "pro" {
  return raw.toLowerCase().includes("home") ? "homeowner" : "pro";
}

function mapMessages(raw: unknown): TicketMessage[] {
  const list = pick<unknown[]>(raw, ["discussion", "messages", "replies", "thread"]) ?? [];
  if (!Array.isArray(list)) return [];
  return list.map((item, index) => {
    const senderRoleRaw = pickString(item, ["senderRole", "role", "sender.role"], "admin");
    const senderRole: TicketMessage["senderRole"] = senderRoleRaw.toLowerCase().includes("home")
      ? "homeowner"
      : senderRoleRaw.toLowerCase().includes("pro")
        ? "pro"
        : "admin";

    return {
      id: pickString(item, ["_id", "id"], `msg-${index}`),
      senderId: pickString(item, ["senderId", "sender._id", "user._id"], ""),
      senderName: pickString(item, ["senderName", "sender.name", "name"], "Support"),
      senderRole,
      message: pickString(item, ["message", "text", "body"], ""),
      createdAt: pickString(item, ["createdAt", "sentAt"]),
      attachments: Array.isArray((item as { attachments?: string[] }).attachments)
        ? (item as { attachments: string[] }).attachments
        : undefined,
    };
  });
}

export function mapSupportTicket(raw: unknown): SupportTicket {
  const id = pickString(raw, ["_id", "id"]);
  const requesterRole = pickString(raw, ["requesterRole", "userRole", "user.role"], "professional");

  return {
    id,
    ticketNumber: pickString(raw, ["ticketId", "ticketNumber", "number", "code"], id.slice(-8).toUpperCase()),
    subject: pickString(raw, ["subject", "title"], "Support ticket"),
    description: pickString(raw, ["description", "message", "body"], ""),
    category: mapCategory(pickString(raw, ["category", "type"], "general")),
    priority: mapPriority(pickString(raw, ["priority"], "medium")),
    status: mapStatus(pickString(raw, ["status"], "open")),
    userId: pickString(raw, ["requester._id", "userId", "user._id", "requesterId", "requester"], ""),
    userName: pickString(raw, ["requesterName", "userName", "user.name"], "User"),
    userEmail: pickString(raw, ["requesterEmail", "userEmail", "user.email"], ""),
    userRole: mapRole(requesterRole),
    assignedTo: pickString(raw, ["assignedAdmin.name", "assignedTo", "assignee.name"]) || undefined,
    orderId: pickString(raw, ["relatedJobId", "orderId", "jobId"]) || undefined,
    createdAt: pickString(raw, ["createdAt"]),
    updatedAt: pickString(raw, ["updatedAt", "createdAt"]),
    messages: mapMessages(raw),
  };
}

/** Admin create ticket body (Postman). */
export interface CreateTicketPayload {
  requesterName: string;
  requesterEmail: string;
  requesterRole: "professional" | "home_owner";
  priority: TicketPriority;
  subject: string;
  description: string;
  relatedJobId?: string;
}
