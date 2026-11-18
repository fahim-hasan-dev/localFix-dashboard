import { pickString } from "@/lib/unwrapList";
import type { ProClearance } from "@/types/common.types";

function mapClearanceLevel(
  raw: unknown
): ProClearance["clearanceLevel"] {
  const approval = pickString(raw, ["approvalStatus", "clearanceLevel", "status"]).toLowerCase();
  if (approval === "approved" || approval === "cleared" || approval === "verified") {
    return "cleared";
  }
  if (approval === "rejected" || approval === "denied") return "rejected";
  if (approval === "action_required" || approval === "changes_requested") {
    return "action_required";
  }
  return "pending";
}

function mapLicenseStatus(raw: unknown): ProClearance["licenseStatus"] {
  const value = pickString(raw, [
    "tradeLicense.isVerified",
    "licenseStatus",
    "tradeLicense.status",
  ]).toLowerCase();
  if (value === "true" || value === "verified" || value === "approved") return "verified";
  if (value === "rejected" || value === "expired") return value;
  return "pending";
}

function mapInsuranceStatus(raw: unknown): ProClearance["insuranceStatus"] {
  const value = pickString(raw, [
    "liabilityInsurance.isVerified",
    "insuranceStatus",
  ]).toLowerCase();
  if (value === "true" || value === "verified" || value === "approved") return "verified";
  if (value === "rejected") return "rejected";
  return "pending";
}

function mapCheckrStatus(raw: unknown): ProClearance["checkrStatus"] {
  const value = pickString(raw, [
    "backgroundCheck.status",
    "checkrStatus",
    "backgroundCheck.result",
  ]).toLowerCase();
  if (value === "clear" || value === "passed" || value === "complete") return "clear";
  if (value === "consider" || value === "review") return "consider";
  if (value === "pending" || value === "in_progress") return "pending";
  return "not_started";
}

/** Map clearance / professional application DTO → ProClearance. */
export function mapClearance(raw: unknown): ProClearance {
  const id = pickString(raw, ["_id", "id", "proId", "userId"]);
  const category = pickString(raw, ["category.name", "category", "trade"]);
  const company = pickString(raw, ["companyName", "businessName", "name"]);

  return {
    id,
    proId: pickString(raw, ["proId", "userId", "_id", "id"], id),
    businessName: company || pickString(raw, ["name"], "Business"),
    ownerName: pickString(raw, ["ownerName", "name"], "Unknown"),
    email: pickString(raw, ["email"]),
    phone: pickString(raw, ["phone"]),
    trade: category || "General",
    licenseNumber: pickString(raw, [
      "tradeLicense.licenseNumber",
      "licenseNumber",
      "license.number",
    ]),
    licenseState: pickString(raw, [
      "tradeLicense.state",
      "licenseState",
      "state",
    ]),
    licenseStatus: mapLicenseStatus(raw),
    licenseDocumentUrl: pickString(raw, [
      "tradeLicense.certificateUrl",
      "licenseDocumentUrl",
      "tradeLicenseCertificate",
    ]),
    insurancePolicyNumber: pickString(raw, [
      "liabilityInsurance.policyNumber",
      "insurancePolicyNumber",
      "insuranceCarrier",
    ]),
    insuranceCoverageAmount: pickString(raw, [
      "liabilityInsurance.coverage",
      "insuranceCoverageAmount",
      "insuranceCoverage",
    ]),
    insuranceStatus: mapInsuranceStatus(raw),
    checkrStatus: mapCheckrStatus(raw),
    checkrReportUrl: pickString(raw, [
      "backgroundCheck.checkrInvitationUrl",
      "checkrReportUrl",
    ]) || undefined,
    submittedAt: pickString(raw, ["createdAt", "submittedAt", "updatedAt"]),
    reviewedAt: pickString(raw, ["reviewedAt", "updatedAt"]) || undefined,
    reviewedBy: pickString(raw, ["reviewedBy", "reviewedByName"]) || undefined,
    decisionNotes: pickString(raw, ["decisionNotes", "rejectionReason", "notes"]) || undefined,
    clearanceLevel: mapClearanceLevel(raw),
  };
}
