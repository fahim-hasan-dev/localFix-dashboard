import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Eye, Download, AlertTriangle } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/layout/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import {
  setSearchQuery,
  setRoleFilter,
  setStatusFilter,
} from "@/store/slices/usersSlice";
import { useGetUsersQuery } from "@/api/users.api";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import { ROUTES } from "@/constants/routes";
import { formatDate, exportToCsv } from "@/lib/utils";

const ROLE_TABS = [
  { value: "all", label: "All" },
  { value: "homeowner", label: "Homeowners" },
  { value: "pro", label: "Pros" },
] as const;

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();

  const { searchQuery, roleFilter, statusFilter } = useAppSelector(
    (state) => state.users
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const debouncedSearch = useDebouncedValue(searchQuery.trim());

  // Legacy ?tab=clearance links now live on their own page
  const isLegacyClearanceTab = searchParams.get("tab") === "clearance";
  useEffect(() => {
    if (isLegacyClearanceTab) navigate(ROUTES.CLEARANCE, { replace: true });
  }, [isLegacyClearanceTab, navigate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, roleFilter, statusFilter, pageSize]);

  const { data, isLoading, isFetching, isError, error, refetch } = useGetUsersQuery({
    page: currentPage,
    limit: pageSize,
    searchTerm: debouncedSearch || undefined,
    role: roleFilter,
    status: statusFilter,
  });

  const total = data?.total ?? 0;
  const users = data?.items ?? [];

  const handleExport = () => {
    exportToCsv(
      "localfix_users_directory",
      users.map((u) => ({
        "User ID": u.id,
        Name: u.name,
        Email: u.email,
        Role: u.role === "pro" ? "Pro" : "Homeowner",
        Status: u.status,
        "Joined Date": u.joinedDate,
        Location: u.location || "N/A",
        Phone: u.phone || "N/A",
      }))
    );
  };

  const renderBody = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={6} className="py-12 text-center text-muted whitespace-nowrap">
            Loading users...
          </td>
        </tr>
      );
    }

    if (isError) {
      return (
        <tr>
          <td colSpan={6} className="py-12 text-center whitespace-nowrap">
            <div className="flex flex-col items-center gap-2 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm">
                {getApiErrorMessage(error, "Failed to load users.")}
              </span>
              <Button size="sm" variant="outline" onClick={refetch}>
                Retry
              </Button>
            </div>
          </td>
        </tr>
      );
    }

    if (users.length === 0) {
      return (
        <tr>
          <td colSpan={6} className="py-12 text-center text-muted whitespace-nowrap">
            No users matching the selected filters.
          </td>
        </tr>
      );
    }

    return users.map((u) => (
      <tr
        key={u.id}
        onClick={() => navigate(ROUTES.USERS.DETAIL(u.id))}
        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
      >
        <td className="py-3.5 px-5 whitespace-nowrap">
          <div className="flex items-center gap-3">
            {u.avatar ? (
              <img
                src={u.avatar}
                alt={u.name}
                className="h-8 w-8 rounded-full object-cover ring-1 ring-line shrink-0"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-700 font-semibold text-xs grid place-items-center ring-1 ring-line shrink-0">
                {getInitials(u.name)}
              </div>
            )}
            <span className="font-semibold text-title group-hover:text-slate-900 transition-colors">
              {u.name}
            </span>
          </div>
        </td>
        <td className="py-3.5 px-4 text-xs text-muted whitespace-nowrap">{u.email}</td>
        <td className="py-3.5 px-4 whitespace-nowrap">
          <span
            className={`inline-flex rounded-md px-2.5 py-0.5 text-xs font-medium ${
              u.role === "pro"
                ? "bg-slate-100 text-slate-800 font-semibold"
                : "bg-slate-50 text-slate-600 border border-slate-200/60"
            }`}
          >
            {u.role === "pro" ? "Pro" : "Homeowner"}
          </span>
        </td>
        <td className="py-3.5 px-4 whitespace-nowrap">
          <span className="inline-block whitespace-nowrap">
            {u.status === "active" && <Badge variant="success" dot>Active</Badge>}
            {u.status === "banned" && <Badge variant="error" dot>Banned</Badge>}
            {u.status === "pending_clearance" && (
              <Badge variant="warning" dot>Pending</Badge>
            )}
          </span>
        </td>
        <td className="py-3.5 px-4 text-xs text-muted whitespace-nowrap">
          <span className="whitespace-nowrap font-medium text-slate-600">
            {formatDate(u.joinedDate)}
          </span>
        </td>
        <td className="py-3.5 px-5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            variant="ghost"
            className="text-xs h-8 px-3 text-slate-600 hover:text-blue-600 hover:bg-blue-50/60 font-medium whitespace-nowrap border-0 shadow-none cursor-pointer rounded-lg"
            onClick={() => navigate(ROUTES.USERS.DETAIL(u.id))}
          >
            <Eye className="h-3.5 w-3.5 mr-1.5 text-slate-400 group-hover:text-blue-600" />
            Details
          </Button>
        </td>
      </tr>
    ));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Manage homeowners, verified pros, credentials, and platform accounts."
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={users.length === 0}
            className="gap-2 bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm cursor-pointer"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>Export Users CSV</span>
          </Button>
        }
      />

      <Card className="p-3.5 sm:p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search by name, email, or city..."
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              className="w-full rounded-xl border border-line bg-slate-50/70 py-2 pl-10 pr-4 text-xs sm:text-sm text-title placeholder:text-muted outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-xl border border-slate-200/70">
              {ROLE_TABS.map((tab) => {
                const isActive = roleFilter === tab.value;
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => dispatch(setRoleFilter(tab.value))}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? "bg-white text-slate-900 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                    }`}
                  >
                    <span>{tab.label}</span>
                    {isActive && !isError && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-900 font-bold">
                        {total}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1.5 rounded-xl border border-line bg-slate-50/70 px-3 py-1.5 text-xs">
              <span className="text-muted font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) =>
                  dispatch(setStatusFilter(e.target.value as typeof statusFilter))
                }
                className="bg-transparent font-medium text-slate-800 outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="pending_clearance">Pending Verification</option>
                <option value="banned">Banned Accounts</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      <Card className={`p-0 overflow-hidden ${isFetching && !isLoading ? "opacity-70" : ""}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line/70 bg-slate-50/60 text-xs font-medium text-muted uppercase tracking-wider">
                <th className="py-3 px-5 whitespace-nowrap">User</th>
                <th className="py-3 px-4 whitespace-nowrap">Email</th>
                <th className="py-3 px-4 whitespace-nowrap">Role</th>
                <th className="py-3 px-4 whitespace-nowrap">Status</th>
                <th className="py-3 px-4 whitespace-nowrap">Registration</th>
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
          itemLabel="users"
        />
      </Card>
    </div>
  );
};

export default UsersPage;
