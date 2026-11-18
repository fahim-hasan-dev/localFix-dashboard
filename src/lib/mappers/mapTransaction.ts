import { pickNumber, pickString } from "@/lib/unwrapList";
import type { Transaction, UserRole } from "@/types/common.types";

function mapRole(raw: string): UserRole {
  const role = raw.toLowerCase();
  if (role.includes("home")) return "homeowner";
  if (role.includes("pro") || role.includes("contractor")) return "pro";
  return "admin";
}

function mapTxType(raw: unknown): Transaction["type"] {
  const value = pickString(raw, ["type", "transactionType", "kind"]).toLowerCase();
  if (value.includes("payout") || value.includes("job") || value.includes("booking")) {
    return "direct_job_payout";
  }
  return "pro_subscription";
}

function mapTxStatus(raw: unknown): Transaction["status"] {
  const value = pickString(raw, ["status", "paymentStatus"]).toLowerCase();
  if (value.includes("refund")) return "refunded";
  if (value.includes("process") || value.includes("pending")) return "processing";
  return "settled";
}

function mapRefundStatus(raw: unknown): Transaction["refundStatus"] {
  const value = pickString(raw, ["refundStatus", "status"]).toLowerCase();
  if (value.includes("partial")) return "partially_refunded";
  if (value.includes("pending")) return "pending";
  if (value.includes("refund")) return "refunded";
  return "none";
}

export function mapTransaction(raw: unknown): Transaction {
  const userObj = pickString(raw, ["user.name", "professional.name", "customer.name"]);
  return {
    id: pickString(raw, ["_id", "id"]),
    orderId: pickString(raw, ["orderId", "booking", "bookingId", "order._id"]) || undefined,
    type: mapTxType(raw),
    title: pickString(raw, ["title", "description", "package.name", "planName"], "Transaction"),
    amount: pickNumber(raw, ["amount", "total", "price", "grossAmount"]),
    feeAmount: pickNumber(raw, ["feeAmount", "fee", "platformFee"]),
    status: mapTxStatus(raw),
    user: userObj || pickString(raw, ["user", "userName", "customerName"], "—"),
    userRole: mapRole(pickString(raw, ["userRole", "user.role", "role"], "professional")),
    customerEmail: pickString(raw, ["customerEmail", "user.email", "email"]) || undefined,
    date: pickString(raw, ["createdAt", "date", "paidAt", "billingDate"]),
    invoiceId: pickString(raw, ["invoiceId", "invoiceNumber", "stripeInvoiceId"], ""),
    paymentMethod: pickString(raw, ["paymentMethod", "method"], "Card"),
    providerReference: pickString(raw, ["providerReference", "stripePaymentIntentId", "reference"]) || undefined,
    refundStatus: mapRefundStatus(raw),
    refundAmount: pickNumber(raw, ["refundAmount"]) || undefined,
    refundReason: pickString(raw, ["refundReason"]) || undefined,
    refundedAt: pickString(raw, ["refundedAt"]) || undefined,
  };
}

export interface TransactionStats {
  totalRevenue: number;
  settledCount: number;
  refundedCount: number;
  processingCount: number;
  totalTransactions: number;
}

export function mapTransactionStats(response: unknown): TransactionStats {
  const root = (response as { data?: unknown })?.data ?? response;
  return {
    totalRevenue: pickNumber(root, ["totalRevenue", "revenue", "totalAmount", "grossRevenue"]),
    settledCount: pickNumber(root, ["settledCount", "settled", "successful"]),
    refundedCount: pickNumber(root, ["refundedCount", "refunded"]),
    processingCount: pickNumber(root, ["processingCount", "processing", "pending"]),
    totalTransactions: pickNumber(root, ["totalTransactions", "total", "count"]),
  };
}
