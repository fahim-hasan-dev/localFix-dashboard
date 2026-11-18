import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LifeBuoy,
  Search,
  Filter,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Loader2,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  useCreateSupportTicketMutation,
  useGetSupportTicketsQuery,
} from "@/api/tickets.api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/layout/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import {
  setSearchQuery,
  setStatusFilter,
  setPriorityFilter,
} from "@/store/slices/ticketsSlice";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { ROUTES } from "@/constants/routes";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import { formatDate, formatShortId, exportToCsv } from "@/lib/utils";
import type { TicketPriority, TicketStatus } from "@/types/common.types";

const TABLE_COLUMNS = 7;

const getPriorityLabel = (priority: TicketPriority) => {
  switch (priority) {
    case "urgent":
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-600 animate-pulse"></span>
          Urgent
        </span>
      );
    case "high":
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
          High
        </span>
      );
    case "medium":
      return (
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
          Medium
        </span>
      );
    case "low":
      return (
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-300"></span>
          Low
        </span>
      );
  }
};

const getStatusBadge = (status: TicketStatus) => {
  switch (status) {
    case "open":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200/60">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
          Open
        </span>
      );
    case "in_progress":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/60">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          In Progress
        </span>
      );
    case "resolved":
    case "closed":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Resolved
        </span>
      );
  }
};

export const TicketsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { searchQuery, statusFilter, priorityFilter } = useAppSelector(
    (state) => state.tickets
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);

  const debouncedSearch = useDebouncedValue(searchQuery.trim());

  // New Ticket Form State
  const [newSubject, setNewSubject] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState<TicketPriority>("medium");
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<"homeowner" | "pro">("pro");
  const [newOrderId, setNewOrderId] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, priorityFilter]);

  const {
    data: listData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetSupportTicketsQuery({
    page: currentPage,
    limit: pageSize,
    searchTerm: debouncedSearch || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    priority: priorityFilter === "all" ? undefined : priorityFilter,
  });

  // Unfiltered snapshot (shared cache with Sidebar) used for KPI counts.
  const { data: summaryData } = useGetSupportTicketsQuery({ limit: 100 });

  const [createSupportTicket, { isLoading: isCreating }] = useCreateSupportTicketMutation();

  const tickets = listData?.items ?? [];
  const totalItems = listData?.total ?? 0;

  const summaryItems = summaryData?.items ?? [];
  const totalCount = summaryData?.total ?? summaryItems.length;
  const openCount = summaryItems.filter((t) => t.status === "open").length;
  const inProgressCount = summaryItems.filter((t) => t.status === "in_progress").length;
  const resolvedCount = summaryItems.filter(
    (t) => t.status === "resolved" || t.status === "closed"
  ).length;

  const resetCreateForm = () => {
    setNewSubject("");
    setNewDesc("");
    setNewPriority("medium");
    setNewUserName("");
    setNewUserEmail("");
    setNewUserRole("pro");
    setNewOrderId("");
    setCreateError(null);
  };

  const handleCreateNewTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newUserName.trim() || !newUserEmail.trim() || !newDesc.trim()) {
      return;
    }
    setCreateError(null);

    try {
      const created = await createSupportTicket({
        requesterName: newUserName.trim(),
        requesterEmail: newUserEmail.trim(),
        requesterRole: newUserRole === "pro" ? "professional" : "home_owner",
        priority: newPriority,
        subject: newSubject.trim(),
        description: newDesc.trim(),
        relatedJobId: newOrderId.trim() || undefined,
      }).unwrap();

      setIsNewTicketModalOpen(false);
      resetCreateForm();
      setCurrentPage(1);
      if (created?.id) navigate(ROUTES.TICKETS.DETAIL(created.id));
    } catch (err) {
      setCreateError(getApiErrorMessage(err, "Could not create the support ticket."));
    }
  };

  const handleExport = () => {
    const exportData = tickets.map((t) => ({
      "Ticket ID": t.ticketNumber || t.id,
      Subject: t.subject,
      Requester: t.userName,
      "User Type": t.userRole === "pro" ? "Contractor" : "Homeowner",
      Priority: t.priority,
      Status: t.status,
      "Created At": t.createdAt,
    }));
    exportToCsv("homefix_support_tickets", exportData);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Support Tickets"
          description="Manage inquiries, verification requests, and homeowner assistance."
        />
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={tickets.length === 0}
            className="gap-2 bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>Export CSV</span>
          </Button>
          <Button
            onClick={() => {
              resetCreateForm();
              setIsNewTicketModalOpen(true);
            }}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs px-4 py-2 text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            <span>New Ticket</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-muted">
              Total Tickets
            </span>
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-50 text-blue-600">
              <LifeBuoy className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-title tracking-tight">{totalCount}</p>
        </Card>

        <Card className="p-5 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-muted">
              Open Tickets
            </span>
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-rose-50 text-rose-600">
              <AlertCircle className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-rose-600 tracking-tight">{openCount}</p>
        </Card>

        <Card className="p-5 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-muted">
              In Progress
            </span>
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-50 text-amber-600">
              <Clock className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-amber-600 tracking-tight">
            {inProgressCount}
          </p>
        </Card>

        <Card className="p-5 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-muted">
              Resolved / Closed
            </span>
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-emerald-600 tracking-tight">
            {resolvedCount}
          </p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search by subject, name, or email..."
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              className="h-10 w-full rounded-xl border border-line bg-slate-50/70 pl-10 pr-4 text-xs text-title placeholder:text-muted outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="h-10 flex items-center gap-1.5 rounded-xl border border-line bg-slate-50/70 px-3.5 text-xs">
              <Filter className="h-3.5 w-3.5 text-muted" />
              <span className="text-muted font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) =>
                  dispatch(setStatusFilter(e.target.value as typeof statusFilter))
                }
                className="bg-transparent font-medium text-slate-800 outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div className="h-10 flex items-center gap-1.5 rounded-xl border border-line bg-slate-50/70 px-3.5 text-xs">
              <span className="text-muted font-medium">Priority:</span>
              <select
                value={priorityFilter}
                onChange={(e) =>
                  dispatch(setPriorityFilter(e.target.value as typeof priorityFilter))
                }
                className="bg-transparent font-medium text-slate-800 outline-none cursor-pointer"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Tickets Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line/70 bg-slate-50/60 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 whitespace-nowrap">Ticket ID</th>
                <th className="py-3 px-4 whitespace-nowrap">Subject</th>
                <th className="py-3 px-4 whitespace-nowrap">Requester</th>
                <th className="py-3 px-3 whitespace-nowrap text-center">Priority</th>
                <th className="py-3 px-3 whitespace-nowrap text-center">Status</th>
                <th className="py-3 px-4 whitespace-nowrap">Updated</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {isLoading ? (
                <tr>
                  <td colSpan={TABLE_COLUMNS} className="text-center py-12 text-muted">
                    <Loader2 className="h-6 w-6 mx-auto animate-spin text-slate-400 mb-2" />
                    <p className="text-xs">Loading support tickets…</p>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={TABLE_COLUMNS} className="text-center py-12 text-muted">
                    <p className="font-medium text-rose-600">
                      {getApiErrorMessage(error, "Failed to load support tickets.")}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3 text-xs"
                      onClick={() => refetch()}
                    >
                      Retry
                    </Button>
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={TABLE_COLUMNS} className="text-center py-12 text-muted">
                    <LifeBuoy className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-700">No support tickets found</p>
                    <p className="text-xs text-muted mt-1">
                      Try clearing search query or adjusting your filters.
                    </p>
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className={`hover:bg-slate-50/80 transition-colors group cursor-pointer ${
                      isFetching ? "opacity-70" : ""
                    }`}
                    onClick={() => navigate(ROUTES.TICKETS.DETAIL(ticket.id))}
                  >
                    <td className="py-3 px-4 whitespace-nowrap font-semibold text-slate-900 text-xs tracking-tight">
                      {ticket.ticketNumber || formatShortId(ticket.id)}
                    </td>

                    <td className="py-3 px-4 max-w-[340px]">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-medium text-slate-900 text-xs truncate group-hover:text-primary transition-colors">
                          {ticket.subject}
                        </span>
                        {ticket.orderId && (
                          <span className="shrink-0 text-xs font-semibold text-blue-700 bg-blue-50/80 border border-blue-200/80 px-2 py-0.5 rounded-md">
                            {formatShortId(ticket.orderId)}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="font-semibold text-slate-900">{ticket.userName}</span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          • {ticket.userRole === "pro" ? "Pro" : "Homeowner"}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap text-center">
                      {getPriorityLabel(ticket.priority)}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap text-center">
                      {getStatusBadge(ticket.status)}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-xs text-slate-500 font-medium">
                      {formatDate(ticket.updatedAt)}
                    </td>

                    <td
                      className="py-3 px-4 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(ROUTES.TICKETS.DETAIL(ticket.id))}
                        className="h-7 px-3 text-xs font-semibold rounded-lg text-slate-700 hover:text-blue-600 hover:border-blue-300"
                      >
                        Details
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isError && totalItems > 0 && (
          <div className="border-t border-line/70">
            <Pagination
              currentPage={currentPage}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              itemLabel="tickets"
            />
          </div>
        )}
      </Card>

      {/* New Ticket Modal */}
      {isNewTicketModalOpen && (
        <Modal
          isOpen={isNewTicketModalOpen}
          onClose={() => setIsNewTicketModalOpen(false)}
          title="Create New Support Ticket"
          maxWidth="lg"
        >
          <form onSubmit={handleCreateNewTicket} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-title block mb-1">
                  Requester Name *
                </label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full rounded-xl border border-line p-2.5 text-sm outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-title block mb-1">
                  Requester Email *
                </label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="e.g. sarah@austinhvac.com"
                  className="w-full rounded-xl border border-line p-2.5 text-sm outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-title block mb-1">
                  Requester Role
                </label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as "homeowner" | "pro")}
                  className="w-full rounded-xl border border-line p-2.5 text-sm outline-none focus:border-blue-600 bg-white"
                >
                  <option value="pro">Pro</option>
                  <option value="homeowner">Homeowner</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-title block mb-1">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as TicketPriority)}
                  className="w-full rounded-xl border border-line p-2.5 text-sm outline-none focus:border-blue-600 bg-white"
                >
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-title block mb-1">Subject *</label>
              <input
                type="text"
                required
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="Brief summary of the issue or question..."
                className="w-full rounded-xl border border-line p-2.5 text-sm outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-title block mb-1">
                Detailed Description *
              </label>
              <textarea
                rows={4}
                required
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Full details of the request or user inquiry..."
                className="w-full rounded-xl border border-line p-2.5 text-sm outline-none focus:border-blue-600 resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-title block mb-1">
                Related Job ID (Optional)
              </label>
              <input
                type="text"
                value={newOrderId}
                onChange={(e) => setNewOrderId(e.target.value)}
                placeholder="Job ID"
                className="w-full rounded-xl border border-line p-2.5 text-sm outline-none focus:border-blue-600"
              />
            </div>

            {createError && (
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
                {createError}
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsNewTicketModalOpen(false)}
                disabled={isCreating}
                className="text-sm font-medium"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2 text-sm font-medium"
              >
                {isCreating ? "Creating…" : "Create Ticket"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default TicketsPage;
