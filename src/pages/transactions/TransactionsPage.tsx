import React, { useEffect, useState } from "react";
import {
  Search,
  Filter,
  RotateCcw,
  Eye,
  Download,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  DollarSign,
  Receipt,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/layout/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { setSearchQuery, setStatusFilter } from "@/store/slices/transactionsSlice";
import {
  useGetTransactionByIdQuery,
  useGetTransactionStatsQuery,
  useGetTransactionsQuery,
  useRefundTransactionMutation,
} from "@/api/transactions.api";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import { Transaction } from "@/types/common.types";
import { formatCurrency, formatDate, formatShortId, exportToCsv } from "@/lib/utils";

/** Derive a readable plan label from the transaction title. */
const getPlanLabel = (tx: Transaction): string => {
  const lower = tx.title.toLowerCase();
  if (lower.includes("annual") || lower.includes("year")) return "Annual";
  if (lower.includes("month")) return "Monthly";
  return tx.title || "—";
};

const statusBadge = (status: Transaction["status"]) => {
  if (status === "settled") return { variant: "success" as const, label: "Settled" };
  if (status === "refunded") return { variant: "error" as const, label: "Refunded" };
  return { variant: "warning" as const, label: "Processing" };
};

export const TransactionsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { searchQuery, statusFilter } = useAppSelector((state) => state.transactions);
  const debouncedSearch = useDebouncedValue(searchQuery.trim(), 400);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [refundTx, setRefundTx] = useState<Transaction | null>(null);
  const [refundAmount, setRefundAmount] = useState<string>("");
  const [refundReason, setRefundReason] = useState<string>("");
  const [isFullRefund, setIsFullRefund] = useState(true);
  const [refundError, setRefundError] = useState("");
  const [notice, setNotice] = useState("");

  // Reset pagination when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, pageSize]);

  const { data: stats } = useGetTransactionStatsQuery();

  const { data, isLoading, isFetching, isError, error, refetch } = useGetTransactionsQuery({
    page: currentPage,
    limit: pageSize,
    searchTerm: debouncedSearch || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const transactions = data?.items ?? [];
  const totalItems = data?.total ?? 0;

  // Fetch full detail for the open modal; fall back to the list item meanwhile.
  const { data: fetchedTx } = useGetTransactionByIdQuery(selectedTx?.id ?? "", {
    skip: !selectedTx?.id,
  });
  const detailTx: Transaction | null = selectedTx
    ? fetchedTx && fetchedTx.id === selectedTx.id
      ? { ...selectedTx, ...fetchedTx }
      : selectedTx
    : null;

  const [refundTransaction, { isLoading: isRefunding }] = useRefundTransactionMutation();

  const handleOpenRefund = (tx: Transaction) => {
    setRefundTx(tx);
    setIsFullRefund(true);
    setRefundAmount(tx.amount.toString());
    setRefundReason("");
    setRefundError("");
  };

  const handleConfirmRefund = async () => {
    if (!refundTx) return;
    const reason = refundReason.trim();
    if (!reason) {
      setRefundError("A reason for the refund is required.");
      return;
    }

    let amount: number | undefined;
    if (!isFullRefund) {
      amount = parseFloat(refundAmount);
      if (isNaN(amount) || amount <= 0 || amount > refundTx.amount) {
        setRefundError(`Enter an amount between $0.01 and ${formatCurrency(refundTx.amount)}.`);
        return;
      }
    }

    setRefundError("");
    try {
      await refundTransaction({ id: refundTx.id, amount, reason }).unwrap();
      setNotice(`Refund processed for ${refundTx.user}.`);
      setRefundTx(null);
      setSelectedTx(null);
    } catch (err) {
      setRefundError(getApiErrorMessage(err, "Failed to process refund."));
    }
  };

  const handleExport = () => {
    const exportData = transactions.map((t) => ({
      "Transaction ID": t.id,
      "Date": t.date,
      "Plan Tier": getPlanLabel(t),
      "Contractor": t.user,
      "Email": t.customerEmail || "",
      "Amount ($)": t.amount.toFixed(2),
      "Payment Status": t.status,
      "Stripe Invoice": t.invoiceId || "N/A",
    }));
    exportToCsv("localfix_subscription_transactions", exportData);
  };

  const kpis = [
    {
      label: "Total Revenue",
      value: formatCurrency(stats?.totalRevenue ?? 0),
      icon: <DollarSign className="h-4 w-4 text-emerald-600" />,
    },
    {
      label: "Total Transactions",
      value: (stats?.totalTransactions ?? 0).toLocaleString(),
      icon: <Receipt className="h-4 w-4 text-blue-600" />,
    },
    {
      label: "Settled",
      value: (stats?.settledCount ?? 0).toLocaleString(),
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
    },
    {
      label: "Refunded",
      value: (stats?.refundedCount ?? 0).toLocaleString(),
      icon: <RotateCcw className="h-4 w-4 text-rose-600" />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscription Billing"
        description="Direct Pro membership billing via Stripe. LocalHomeFix takes 0% commission from repair jobs."
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={transactions.length === 0}
            className="gap-2 bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>Export CSV</span>
          </Button>
        }
      />

      {notice && (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {notice}
          </span>
          <button
            type="button"
            onClick={() => setNotice("")}
            className="font-semibold hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                {kpi.label}
              </span>
              {kpi.icon}
            </div>
            <p className="mt-2 text-xl font-bold text-title">{kpi.value}</p>
          </Card>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search by Transaction ID, Job ID, User, or Invoice..."
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              className="h-10 w-full rounded-xl border border-line bg-slate-50/70 pl-10 pr-4 text-xs text-title placeholder:text-muted outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="h-10 flex items-center gap-1.5 rounded-xl border border-line bg-slate-50/70 px-3.5 text-xs">
              <Filter className="h-3.5 w-3.5 text-muted" />
              <span className="text-muted font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) =>
                  dispatch(setStatusFilter(e.target.value as "all" | "settled" | "refunded"))
                }
                className="bg-transparent font-medium text-slate-800 outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="settled">Settled / Active</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Transactions Table */}
      <Card className={`p-0 overflow-hidden ${isFetching && !isLoading ? "opacity-70" : ""}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line/70 bg-slate-50/60 text-xs font-semibold text-muted uppercase tracking-wider">
                <th className="py-3 px-5 whitespace-nowrap">Transaction ID</th>
                <th className="py-3 px-4 whitespace-nowrap">Pro</th>
                <th className="py-3 px-4 whitespace-nowrap">Subscription Plan</th>
                <th className="py-3 px-4 whitespace-nowrap">Amount</th>
                <th className="py-3 px-4 whitespace-nowrap">Billing Date</th>
                <th className="py-3 px-4 whitespace-nowrap">Status</th>
                <th className="py-3 px-5 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted whitespace-nowrap">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading transactions...
                    </span>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="inline-flex flex-col items-center gap-3 text-xs text-rose-700">
                      <span className="inline-flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        {getApiErrorMessage(error, "Failed to load transactions.")}
                      </span>
                      <Button size="sm" variant="outline" onClick={() => refetch()}>
                        Retry
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted whitespace-nowrap">
                    No transactions matching your query.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const badge = statusBadge(tx.status);

                  return (
                    <tr
                      key={tx.id}
                      onClick={() => setSelectedTx(tx)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <span className="text-xs font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/80">
                          {tx.invoiceId || formatShortId(tx.id)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors text-xs">
                          {tx.user}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                          {getPlanLabel(tx)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-950 text-sm whitespace-nowrap">
                        {formatCurrency(tx.amount)}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-muted whitespace-nowrap">
                        <span className="whitespace-nowrap font-medium text-slate-600">
                          {tx.date ? formatDate(tx.date) : "—"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-block whitespace-nowrap">
                          <Badge variant={badge.variant} dot>
                            {badge.label}
                          </Badge>
                        </span>
                      </td>

                      <td
                        className="py-3.5 px-5 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs h-8 px-3 text-slate-600 hover:text-blue-600 hover:bg-blue-50/60 font-medium whitespace-nowrap border-0 shadow-none cursor-pointer rounded-lg"
                          onClick={() => setSelectedTx(tx)}
                        >
                          <Eye className="h-3.5 w-3.5 mr-1.5 text-slate-400 group-hover:text-blue-600" />
                          Details
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemLabel="transactions"
        />
      </Card>

      {/* Transaction Details Modal */}
      {detailTx && (
        <Modal
          isOpen={!!detailTx}
          onClose={() => setSelectedTx(null)}
          title={`Transaction: ${detailTx.invoiceId || formatShortId(detailTx.id)}`}
          description={
            detailTx.date ? `Recorded on ${formatDate(detailTx.date)}` : "Transaction details"
          }
          maxWidth="md"
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                {detailTx.status === "settled" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                    onClick={() => handleOpenRefund(detailTx)}
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1" />
                    Refund
                  </Button>
                )}
              </div>
              <Button size="sm" variant="outline" onClick={() => setSelectedTx(null)}>
                Close
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-line flex items-center justify-between">
              <div>
                <span className="text-muted block text-[11px] uppercase font-medium">
                  Transaction Amount
                </span>
                <span className="text-2xl font-semibold text-title mt-0.5 block">
                  {formatCurrency(detailTx.amount)}
                </span>
                {detailTx.feeAmount > 0 && (
                  <span className="text-muted text-[11px] block mt-0.5">
                    Processing Fee: {formatCurrency(detailTx.feeAmount)}
                  </span>
                )}
              </div>
              <Badge variant={statusBadge(detailTx.status).variant}>
                {detailTx.status.toUpperCase()}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="p-3.5 rounded-xl border border-line bg-slate-50/50">
                <span className="text-slate-500 text-xs block font-medium">Payment Gateway</span>
                <span className="font-semibold text-title text-sm mt-0.5 block">
                  {detailTx.paymentMethod || "—"}
                </span>
              </div>
              <div className="p-3.5 rounded-xl border border-line bg-slate-50/50">
                <span className="text-slate-500 text-xs block font-medium">Provider Reference</span>
                <span
                  className="text-primary font-medium text-xs mt-0.5 block truncate"
                  title={detailTx.providerReference}
                >
                  {detailTx.providerReference || "—"}
                </span>
              </div>
              <div className="p-3.5 rounded-xl border border-line bg-slate-50/50">
                <span className="text-slate-500 text-xs block font-medium">Payer / Account</span>
                <span className="font-semibold text-title text-sm mt-0.5 block">
                  {detailTx.user}
                </span>
              </div>
              <div className="p-3.5 rounded-xl border border-line bg-slate-50/50">
                <span className="text-slate-500 text-xs block font-medium">Invoice Number</span>
                <span className="text-title font-semibold text-xs mt-0.5 block">
                  {detailTx.invoiceId || "—"}
                </span>
              </div>
            </div>

            {(detailTx.refundStatus === "refunded" ||
              detailTx.refundStatus === "partially_refunded") && (
              <div className="p-3.5 rounded-lg border border-rose-200 bg-rose-50/70 text-rose-900">
                <div className="flex items-center gap-1.5 font-semibold">
                  <RotateCcw className="h-4 w-4 text-rose-600" />
                  <span>
                    {detailTx.refundStatus === "partially_refunded" ? "Partially refunded" : "Refunded"}{" "}
                    on {detailTx.refundedAt ? formatDate(detailTx.refundedAt) : "N/A"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-rose-700">
                  Amount: {formatCurrency(detailTx.refundAmount || detailTx.amount)} • Reason:{" "}
                  {detailTx.refundReason || "Administrative refund."}
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Refund Execution Modal */}
      {refundTx && (
        <Modal
          isOpen={!!refundTx}
          onClose={() => !isRefunding && setRefundTx(null)}
          title="Process Transaction Refund"
          description={`Initiate full or partial refund for transaction ${
            refundTx.invoiceId || formatShortId(refundTx.id)
          }.`}
          maxWidth="md"
          footer={
            <div className="flex items-center justify-end gap-2">
              <Button
                size="sm"
                variant="ghost"
                disabled={isRefunding}
                onClick={() => setRefundTx(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="danger"
                isLoading={isRefunding}
                disabled={isRefunding}
                onClick={handleConfirmRefund}
              >
                Confirm &amp; Execute Refund
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            {refundError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{refundError}</span>
              </div>
            )}

            <div className="p-3 rounded-lg bg-slate-50 border border-line flex items-center justify-between">
              <div>
                <span className="text-muted text-[11px]">Original Amount</span>
                <p className="font-semibold text-title text-sm">{formatCurrency(refundTx.amount)}</p>
              </div>
              <div>
                <span className="text-muted text-[11px]">User</span>
                <p className="font-medium text-title text-sm">{refundTx.user}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-medium text-title block">Refund Option</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsFullRefund(true);
                    setRefundAmount(refundTx.amount.toString());
                  }}
                  className={`p-2 rounded-lg border text-center font-medium transition-colors ${
                    isFullRefund
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-line text-muted hover:text-title"
                  }`}
                >
                  Full Refund ({formatCurrency(refundTx.amount)})
                </button>
                <button
                  type="button"
                  onClick={() => setIsFullRefund(false)}
                  className={`p-2 rounded-lg border text-center font-medium transition-colors ${
                    !isFullRefund
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-line text-muted hover:text-title"
                  }`}
                >
                  Partial Refund
                </button>
              </div>
            </div>

            {!isFullRefund && (
              <div>
                <label className="font-medium text-title block mb-1">Custom Refund Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  max={refundTx.amount}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder="Enter amount to refund..."
                  className="w-full rounded-xl border border-line bg-white p-2.5 text-sm text-title outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
            )}

            <div>
              <label className="font-medium text-title block mb-1">
                Reason for Refund (Required)
              </label>
              <textarea
                rows={3}
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Document the refund eligibility, mediation outcome, or customer request..."
                className="w-full rounded-xl border border-line bg-white p-2.5 text-xs text-title placeholder:text-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                required
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default TransactionsPage;
