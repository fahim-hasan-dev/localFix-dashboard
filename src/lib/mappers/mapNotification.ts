import { pickString } from "@/lib/unwrapList";

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export function mapAdminNotification(raw: unknown): AdminNotification {
  const type = pickString(raw, ["type", "category", "kind"], "general").toLowerCase();
  const title = pickString(raw, ["title", "subject", "heading"], "Notification");
  const message = pickString(raw, ["text", "message", "body", "description", "content"], "");
  const isRead = Boolean(
    (raw as { isRead?: boolean; read?: boolean })?.isRead ??
      (raw as { read?: boolean })?.read ??
      false
  );

  let link: string | undefined;
  if (type.includes("clearance") || type.includes("approval") || type.includes("professional")) {
    link = "/clearance";
  } else if (type.includes("ticket") || type.includes("support")) {
    link = "/tickets";
  } else if (type.includes("order") || type.includes("booking")) {
    link = "/orders";
  } else if (type.includes("user")) {
    link = "/users";
  }

  return {
    id: pickString(raw, ["_id", "id"]),
    title,
    message,
    type,
    isRead,
    createdAt: pickString(raw, ["createdAt", "updatedAt"]),
    link,
  };
}
