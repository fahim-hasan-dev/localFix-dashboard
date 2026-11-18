import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  ArrowRight,
  Check,
  X,
  Download,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/layout/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import {
  useGetClearancesQuery,
  useUpdateApprovalStatusMutation,
} from "@/api/users.api";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import { ROUTES } from "@/constants/routes";
import { ProClearance } from "@/types/common.types";
import { formatDate, exportToCsv } from "@/lib/utils";

type NoticeType = "success" | "error" | "info";
type DecisionKind = "reject" | "changes";

const getInitial = (name: string) => name.trim().charAt(0).toUpperCase() || "P";

export default function ProsReviewPage() {
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, isFetching, isError, error, refetch } = useGetClearancesQuery({
    page: currentPage,
    limit: pageSize,
  });
  const [updateApprovalStatus, { isLoading: isUpdating }] = useUpdateApprovalStatusMutation();

  const clearances = data?.items ?? [];
  const total = data?.total ?? 0;

  const [inspectItem, setInspectItem] = useState<ProClearance | null>(null);
  const [decision, setDecision] = useState<{ item: ProClearance; kind: DecisionKind } | null>(null);
  const [actionNotice, setActionNotice] = useState<{ type: NoticeType; text: string } | null>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize]);

  useEffect(() => {
    if (!actionNotice) return;
    const timer = setTimeout(() => setActionNotice(null), 5000);
    return () => clearTimeout(timer);
  }, [actionNotice]);

  const submitDecision = async (
    item: ProClearance,
    approvalStatus: "approved" | "rejected",
    successText: string,
    successType: NoticeType
  ) => {
    try {
      await updateApprovalStatus({ id: item.proId, approvalStatus }).unwrap();
      setActionNotice({ type: successType, text: successText });
    } catch (err) {
      setActionNotice({
        type: "error",
        text: getApiErrorMessage(err, "Failed to update clearance status."),
      });
    } finally {
      setInspectItem(null);
      setDecision(null);
    }
  };

  const handleApprove = (item: ProClearance) =>
    submitDecision(
      item,
      "approved",
      `Contractor approved: ${item.ownerName} is now active on the marketplace.`,
      "success"
    );

  // The API only supports approved | rejected, so "Request Changes" also rejects.
  const handleConfirmDecision = () => {
    if (!decision) return;
    const { item, kind } = decision;
    return submitDecision(
      item,
      "rejected",
      kind === "reject"
        ? `Clearance rejected: ${item.ownerName} remains restricted.`
        : `Changes requested: ${item.ownerName}'s application was returned as rejected.`,
      kind === "reject" ? "error" : "info"
    );
  };

  const handleExport = () => {
    exportToCsv(
      "contractor_clearance_queue",
      clearances.map((c) => ({
        "Clearance ID": c.id,
        "Business Name": c.businessName,
        "Owner Name": c.ownerName,
        Email: c.email,
        Phone: c.phone,
        Trade: c.trade,
        "License #": c.licenseNumber,
        "License State": c.licenseState,
        "Insurance Coverage": c.insuranceCoverageAmount,
        "Checkr Status": c.checkrStatus,
        "Clearance Level": c.clearanceLevel,
        "Submitted Date": c.submittedAt,
      }))
    );
  };

  const renderBody = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={5} className="py-12 text-center text-muted whitespace-nowrap">
            Loading clearance submissions...
          </td>
        </tr>
      );
    }

    if (isError) {
      return (
        <tr>
          <td colSpan={5} className="py-12 text-center whitespace-nowrap">
            <div className="flex flex-col items-center gap-2 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm">
                {getApiErrorMessage(error, "Failed to load clearance submissions.")}
              </span>
              <Button size="sm" variant="outline" onClick={refetch}>
                Retry
              </Button>
            </div>
          </td>
        </tr>
      );
    }

    if (clearances.length === 0) {
      return (
        <tr>
          <td colSpan={5} className="py-12 text-center text-muted whitespace-nowrap">
            No clearance submissions found.
          </td>
        </tr>
      );
    }

    return clearances.map((item) => (
      <tr
        key={item.id}
        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
        onClick={() => setInspectItem(item)}
      >
        <td className="py-3.5 px-5 whitespace-nowrap">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-slate-100 text-slate-800 font-semibold text-xs grid place-items-center shrink-0 border border-line">
              {getInitial(item.ownerName)}
            </div>
            <div>
              <span
                className="font-semibold text-title group-hover:text-blue-600 transition-colors truncate max-w-[220px] block"
                title={item.ownerName}
              >
                {item.ownerName}
              </span>
              <span className="text-xs text-muted block">{item.email}</span>
            </div>
          </div>
        </td>

        <td className="py-3.5 px-4 text-xs font-medium text-title whitespace-nowrap">
          {item.trade}
        </td>

        <td className="py-3.5 px-4 text-xs font-medium text-slate-700 whitespace-nowrap">
          {item.licenseNumber || "—"}
        </td>

        <td className="py-3.5 px-4 whitespace-nowrap">
          <span className="inline-block whitespace-nowrap">
            {item.clearanceLevel === "cleared" && <Badge variant="success" dot>Cleared</Badge>}
            {item.clearanceLevel === "pending" && <Badge variant="warning" dot>Pending Audit</Badge>}
            {item.clearanceLevel === "action_required" && (
              <Badge variant="info" dot>Action Required</Badge>
            )}
            {item.clearanceLevel === "rejected" && <Badge variant="error" dot>Rejected</Badge>}
          </span>
        </td>

        <td
          className="py-3.5 px-5 text-right whitespace-nowrap"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-end gap-2">
            {item.clearanceLevel !== "cleared" && (
              <Button
                size="sm"
                variant="primary"
                disabled={isUpdating}
                className="text-xs h-8 px-3.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs"
                onClick={() => handleApprove(item)}
              >
                <Check className="h-3.5 w-3.5" />
                <span>Approve</span>
              </Button>
            )}
            {item.clearanceLevel !== "rejected" && (
              <Button
                size="sm"
                variant="outline"
                disabled={isUpdating}
                className="text-xs h-8 px-3.5 font-medium text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs"
                onClick={() => setDecision({ item, kind: "reject" })}
              >
                <X className="h-3.5 w-3.5" />
                <span>Reject</span>
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="text-xs h-8 px-3 text-slate-600 hover:text-blue-600 hover:bg-blue-50/60 font-medium rounded-lg flex items-center gap-1 cursor-pointer"
              onClick={() => navigate(ROUTES.USERS.DETAIL(item.proId))}
            >
              <span>Details</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pending Clearance & Verification"
        description="Review pro trade licenses, verify insurance policies, and activate approved pros."
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={clearances.length === 0}
            className="gap-2 bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm cursor-pointer"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>Export CSV</span>
          </Button>
        }
      />

      {actionNotice && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between shadow-2xs text-xs font-semibold animate-in fade-in ${
            actionNotice.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : actionNotice.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-800"
              : "bg-blue-50 border-blue-200 text-blue-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {actionNotice.type === "success" && (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            )}
            {actionNotice.type === "error" && (
              <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
            )}
            {actionNotice.type === "info" && (
              <AlertTriangle className="h-4 w-4 text-blue-600 shrink-0" />
            )}
            <span>{actionNotice.text}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-xs text-muted hover:text-title ml-4"
          >
            ✕
          </button>
        </div>
      )}

      <Card className={`p-0 overflow-hidden ${isFetching && !isLoading ? "opacity-70" : ""}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[960px]">
            <thead>
              <tr className="border-b border-line/70 bg-slate-50/60 text-xs font-medium text-muted uppercase tracking-wider">
                <th className="py-3 px-5 whitespace-nowrap">Pro</th>
                <th className="py-3 px-4 whitespace-nowrap">Trade</th>
                <th className="py-3 px-4 whitespace-nowrap">State License #</th>
                <th className="py-3 px-4 whitespace-nowrap">Clearance Audit</th>
                <th className="py-3 px-5 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">{renderBody()}</tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={total}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemLabel="clearances"
        />
      </Card>

      {/* Inspect Pro Clearance Detail Modal */}
      <Modal
        isOpen={!!inspectItem}
        onClose={() => setInspectItem(null)}
        title={inspectItem?.ownerName}
        description={`${inspectItem?.trade} • License ${inspectItem?.licenseNumber}`}
        maxWidth="xl"
        footer={
          inspectItem && (
            <div className="flex items-center justify-between w-full">
              <Button
                variant="danger"
                size="sm"
                disabled={isUpdating || inspectItem.clearanceLevel === "rejected"}
                onClick={() => {
                  setDecision({ item: inspectItem, kind: "reject" });
                  setInspectItem(null);
                }}
              >
                Reject
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isUpdating}
                  onClick={() => {
                    setDecision({ item: inspectItem, kind: "changes" });
                    setInspectItem(null);
                  }}
                >
                  Request Changes
                </Button>
                {inspectItem.clearanceLevel !== "cleared" ? (
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={isUpdating}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                    onClick={() => handleApprove(inspectItem)}
                  >
                    <Check className="h-3.5 w-3.5 mr-1.5" />
                    Approve
                  </Button>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold px-2.5 py-1 bg-emerald-50 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Approved
                  </span>
                )}
              </div>
            </div>
          )
        }
      >
        {inspectItem && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50/80 border border-line flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-800 font-semibold text-sm grid place-items-center shrink-0 border border-line">
                  {getInitial(inspectItem.ownerName)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-title text-sm">{inspectItem.ownerName}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs font-medium text-slate-600">{inspectItem.trade}</span>
                  </div>
                  <p className="text-xs text-muted mt-0.5">
                    {[inspectItem.email, inspectItem.phone, inspectItem.licenseState]
                      .filter(Boolean)
                      .join(" • ")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Badge
                  variant={
                    inspectItem.clearanceLevel === "cleared"
                      ? "success"
                      : inspectItem.clearanceLevel === "rejected"
                      ? "error"
                      : "warning"
                  }
                  dot
                >
                  {inspectItem.clearanceLevel === "cleared"
                    ? "Active"
                    : inspectItem.clearanceLevel === "rejected"
                    ? "Restricted"
                    : "Pending"}
                </Badge>
                <Link
                  to={ROUTES.USERS.DETAIL(inspectItem.proId)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-line bg-white hover:bg-slate-50 text-xs font-semibold text-title shadow-2xs transition-colors shrink-0"
                  title="View Profile"
                >
                  <span>Profile</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">
                Verification Documents
              </span>

              <div className="rounded-xl border border-line divide-y divide-line/60 bg-white overflow-hidden shadow-2xs">
                <div className="p-3 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-title text-xs">State Trade License</p>
                      <p className="text-[11px] text-muted">
                        {inspectItem.licenseNumber} ({inspectItem.licenseState} TDLR)
                      </p>
                    </div>
                  </div>
                  {inspectItem.licenseDocumentUrl && (
                    <a
                      href={inspectItem.licenseDocumentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-blue-600 hover:underline flex items-center gap-1 text-xs"
                    >
                      Inspect PDF <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>

                <div className="p-3 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-title text-xs">Certificate of Insurance (COI)</p>
                      <p className="text-[11px] text-muted">
                        {inspectItem.insurancePolicyNumber} • {inspectItem.insuranceCoverageAmount}
                      </p>
                    </div>
                  </div>
                  <Badge variant={inspectItem.insuranceStatus === "verified" ? "success" : "warning"}>
                    {inspectItem.insuranceStatus === "verified" ? "Active Policy" : "Pending"}
                  </Badge>
                </div>

                <div className="p-3 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-title text-xs">Checkr Background Screening</p>
                      <p className="text-[11px] text-muted">Identity &amp; Criminal Records Screening</p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      inspectItem.checkrStatus === "clear"
                        ? "success"
                        : inspectItem.checkrStatus === "consider"
                        ? "error"
                        : "warning"
                    }
                  >
                    {inspectItem.checkrStatus === "clear"
                      ? "Passed"
                      : inspectItem.checkrStatus === "consider"
                      ? "Flagged"
                      : "Pending"}
                  </Badge>
                </div>
              </div>
            </div>

            {inspectItem.decisionNotes && (
              <div className="rounded-xl border border-line p-3 bg-slate-50/60">
                <span className="text-muted block text-[10px] font-bold uppercase tracking-wider mb-0.5">
                  Audit Notes
                </span>
                <p className="text-title text-xs">{inspectItem.decisionNotes}</p>
                {inspectItem.reviewedBy && inspectItem.reviewedAt && (
                  <p className="text-[11px] text-muted mt-1">
                    Reviewed by {inspectItem.reviewedBy} on {formatDate(inspectItem.reviewedAt)}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Reject / Request Changes confirmation */}
      <Modal
        isOpen={!!decision}
        onClose={() => setDecision(null)}
        title={decision?.kind === "changes" ? "Request Document Changes" : "Reject Clearance"}
        description={`Restrict pro account for ${decision?.item.businessName}.`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setDecision(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmDecision} disabled={isUpdating}>
              {decision?.kind === "changes" ? "Confirm" : "Reject"}
            </Button>
          </>
        }
      >
        <p className="text-xs text-muted leading-relaxed">
          {decision?.kind === "changes"
            ? `The platform only supports approved or rejected decisions, so requesting changes from ${decision.item.ownerName} will mark the clearance as rejected.`
            : `${decision?.item.ownerName}'s clearance will be marked as rejected and the account will remain restricted.`}
        </p>
      </Modal>
    </div>
  );
}
