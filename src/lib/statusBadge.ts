import type { BadgeProps } from "@/components/ui/Badge";
import type { Order } from "@/types/common.types";

export function getFulfillmentBadgeVariant(
  status: Order["fulfillmentStatus"]
): NonNullable<BadgeProps["variant"]> {
  switch (status) {
    case "completed":
      return "success";
    case "awaiting_confirm":
      return "warning";
    case "on_the_way":
    case "in_progress":
      return "info";
    case "disputed":
    case "cancelled":
      return "error";
    default:
      return "warning";
  }
}
