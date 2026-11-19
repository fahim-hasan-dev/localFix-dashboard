import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  Filter,
  Loader2,
  Mail,
  Search,
  Trash2,
} from "lucide-react";
import {
  useDeleteContactMessageMutation,
  useGetContactMessagesQuery,
  useUpdateContactMessageMutation,
} from "@/api/contact.api";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import type { ContactMessage, ContactStatus } from "@/lib/mappers/mapContact";
import { exportToCsv, formatDate, formatShortId } from "@/lib/utils";

const TABLE_COLUMNS = 7;

function statusBadge(status: ContactStatus) {
  if (status === "resolved") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/60 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Resolved
      </span>
    );
  }
  if (status === "replied") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/60 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
        Replied
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/60 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      Pending
    </span>
  );
}

export default function ContactsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ContactStatus>("all");
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const debouncedSearch = useDebouncedValue(searchQuery.trim());

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, pageSize]);

  const {
    data: listData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetContactMessagesQuery({
    page: currentPage,
    limit: pageSize,
    searchTerm: debouncedSearch || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const { data: summaryData } = useGetContactMessagesQuery({ limit: 100 });
  const [updateContact, { isLoading: isUpdating }] = useUpdateContactMessageMutation();
  const [deleteContact, { isLoading: isDeleting }] = useDeleteContactMessageMutation();

  const messages = listData?.items ?? [];
  const totalItems = listData?.total ?? 0;
  const summaryItems = summaryData?.items ?? [];
  const totalCount = summaryData?.total ?? summaryItems.length;
  const pendingCount = summaryItems.filter((m) => m.status === "pending").length;
  const repliedCount = summaryItems.filter((m) => m.status === "replied").length;
  const resolvedCount = summaryItems.filter((m) => m.status === "resolved").length;

  const handleStatusChange = async (id: string, status: ContactStatus) => {
    setActionError(null);
    try {
      const updated = await updateContact({ id, status }).unwrap();
      setSelected(updated);
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Could not update contact status."));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionError(null);
    try {
      await deleteContact(deleteTarget.id).unwrap();
      if (selected?.id === deleteTarget.id) setSelected(null);
      setDeleteTarget(null);
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Could not delete contact message."));
    }
  };

  const handleExport = () => {
    exportToCsv(
      "localfix_contact_messages",
      messages.map((m) => ({
        ID: m.id,
        Name: m.name,
        Email: m.email,
        Subject: m.subject,
        Status: m.status,
        Priority: m.priority,
        "Created At": m.createdAt,
      })),
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Contact Messages"
          description="Website Contact Us form submissions from visitors and users."
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={messages.length === 0}
          className="gap-2 border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <Download className="h-4 w-4 text-slate-500" />
          <span>Export CSV</span>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-muted">Total</span>
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-50 text-blue-600">
              <Mail className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-title">{totalCount}</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-muted">Pending</span>
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-50 text-amber-600">
              <AlertCircle className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-amber-600">{pendingCount}</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-muted">Replied</span>
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-50 text-blue-600">
              <Clock className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-blue-600">{repliedCount}</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-muted">Resolved</span>
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-emerald-600">{resolvedCount}</p>
        </Card>
      </div>

      <Card className="p-4 sm:p-5">
        <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search by name, email, or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-xl border border-line bg-slate-50/70 pl-10 pr-4 text-xs text-title outline-none transition-all placeholder:text-muted focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
            />
          </div>
          <div className="flex h-10 items-center gap-1.5 rounded-xl border border-line bg-slate-50/70 px-3.5 text-xs">
            <Filter className="h-3.5 w-3.5 text-muted" />
            <span className="font-medium text-muted">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="cursor-pointer bg-transparent font-medium text-slate-800 outline-none"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="replied">Replied</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </Card>

      {actionError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700">
          {actionError}
        </div>
      ) : null}

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line/70 bg-slate-50/60 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="whitespace-nowrap px-5 py-3">ID</th>
                <th className="whitespace-nowrap px-4 py-3">Sender</th>
                <th className="whitespace-nowrap px-4 py-3">Subject</th>
                <th className="whitespace-nowrap px-4 py-3">Status</th>
                <th className="whitespace-nowrap px-4 py-3">Priority</th>
                <th className="whitespace-nowrap px-4 py-3">Received</th>
                <th className="whitespace-nowrap px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {isLoading ? (
                <tr>
                  <td colSpan={TABLE_COLUMNS} className="px-5 py-16 text-center text-sm text-muted">
                    <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin text-primary" />
                    Loading contact messages…
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={TABLE_COLUMNS} className="px-5 py-16 text-center">
                    <p className="text-sm font-medium text-rose-700">
                      {getApiErrorMessage(error, "Could not load contact messages.")}
                    </p>
                    <Button size="sm" variant="outline" className="mt-3" onClick={() => refetch()}>
                      Try again
                    </Button>
                  </td>
                </tr>
              ) : messages.length === 0 ? (
                <tr>
                  <td colSpan={TABLE_COLUMNS} className="px-5 py-16 text-center text-sm text-muted">
                    No contact messages found.
                  </td>
                </tr>
              ) : (
                messages.map((item) => (
                  <tr
                    key={item.id}
                    className="cursor-pointer transition-colors hover:bg-slate-50/80"
                    onClick={() => setSelected(item)}
                  >
                    <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs text-slate-500">
                      {formatShortId(item.id)}
                      {isFetching ? (
                        <Loader2 className="ml-1 inline h-3 w-3 animate-spin text-muted" />
                      ) : null}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-title">{item.name}</p>
                        <p className="truncate text-xs text-muted">{item.email}</p>
                      </div>
                    </td>
                    <td className="max-w-[220px] px-4 py-3.5">
                      <p className="truncate text-sm text-title">{item.subject}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">{statusBadge(item.status)}</td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-xs font-medium capitalize text-slate-600">
                      {item.priority}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-xs text-muted">
                      {item.createdAt ? formatDate(item.createdAt) : "—"}
                    </td>
                    <td
                      className="whitespace-nowrap px-5 py-3.5 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="inline-flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2 text-slate-600"
                          onClick={() => setSelected(item)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2 text-rose-600 hover:bg-rose-50"
                          onClick={() => setDeleteTarget(item)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalItems > 0 ? (
          <div className="border-t border-line px-4 py-3">
            <Pagination
              currentPage={currentPage}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              itemLabel="messages"
            />
          </div>
        ) : null}
      </Card>

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.subject || "Contact message"}
        description={selected ? `From ${selected.name} · ${selected.email}` : undefined}
        maxWidth="lg"
        footer={
          selected ? (
            <div className="flex w-full flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted">Mark as:</span>
                {(["pending", "replied", "resolved"] as const).map((status) => (
                  <Button
                    key={status}
                    size="sm"
                    variant={selected.status === status ? "primary" : "outline"}
                    disabled={isUpdating}
                    className="capitalize"
                    onClick={() => handleStatusChange(selected.id, status)}
                  >
                    {status}
                  </Button>
                ))}
              </div>
              <Button size="sm" variant="outline" onClick={() => setSelected(null)}>
                Close
              </Button>
            </div>
          ) : null
        }
      >
        {selected ? (
          <div className="space-y-4 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              {statusBadge(selected.status)}
              <span className="rounded-full border border-line bg-slate-50 px-2.5 py-0.5 text-xs font-medium capitalize text-slate-600">
                {selected.priority} priority
              </span>
              <span className="text-xs text-muted">
                {selected.createdAt ? formatDate(selected.createdAt) : ""}
              </span>
            </div>
            <div className="rounded-xl border border-line bg-slate-50/70 p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-title">
                {selected.message || "—"}
              </p>
            </div>
            <a
              href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              <Mail className="h-3.5 w-3.5" />
              Reply by email
            </a>
          </div>
        ) : null}
      </Modal>

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete contact message?"
        description={
          deleteTarget
            ? `This will remove the message from ${deleteTarget.name} (${deleteTarget.email}).`
            : undefined
        }
        footer={
          <div className="flex w-full items-center justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button size="sm" variant="danger" disabled={isDeleting} onClick={handleDelete}>
              {isDeleting ? "Deleting…" : "Delete"}
            </Button>
          </div>
        }
      >
        <p className="text-xs text-muted">This action cannot be undone.</p>
      </Modal>
    </div>
  );
}
