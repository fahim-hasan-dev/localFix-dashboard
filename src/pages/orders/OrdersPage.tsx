import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  Filter,
  Eye,
  Briefcase,
  ClipboardList,
  MessageSquare,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useGetAdminJobsQuery, useGetAdminOrdersQuery } from "@/api/jobsOrders.api";
import { useGetCategoriesQuery } from "@/api/cms.api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/layout/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { setFulfillmentFilter } from "@/store/slices/ordersSlice";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { ROUTES } from "@/constants/routes";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import { getFulfillmentBadgeVariant } from "@/lib/statusBadge";
import { formatDate, formatShortId } from "@/lib/utils";
import type { Order } from "@/types/common.types";

type OrdersTab = "quotes" | "orders";

const TABLE_COLUMNS = 7;

const TableMessageRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <tr>
    <td colSpan={TABLE_COLUMNS} className="py-12 text-center text-muted">
      {children}
    </td>
  </tr>
);

const TableErrorRow: React.FC<{ error: unknown; fallback: string; onRetry: () => void }> = ({
  error,
  fallback,
  onRetry,
}) => (
  <TableMessageRow>
    <p className="font-medium text-rose-600">{getApiErrorMessage(error, fallback)}</p>
    <Button size="sm" variant="outline" className="mt-3 text-xs" onClick={onRetry}>
      Retry
    </Button>
  </TableMessageRow>
);

export const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab state: "quotes" (RFQ pipeline) vs "orders" (confirmed bookings)
  const currentTab: OrdersTab = searchParams.get("tab") === "orders" ? "orders" : "quotes";

  const fulfillmentFilter = useAppSelector((state) => state.orders.fulfillmentFilter);

  // Server-side search (debounced) shared by both tabs
  const [searchInput, setSearchInput] = useState("");
  const searchTerm = useDebouncedValue(searchInput.trim());

  // Server-side pagination per tab
  const [quotesPage, setQuotesPage] = useState(1);
  const [quotesPageSize, setQuotesPageSize] = useState(10);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersPageSize, setOrdersPageSize] = useState(10);

  const [jobCategoryFilter, setJobCategoryFilter] = useState<string>("all");
  const { data: categoriesData, isLoading: categoriesLoading } =
    useGetCategoriesQuery();
  const jobCategories = categoriesData?.items ?? [];

  useEffect(() => {
    setQuotesPage(1);
    setOrdersPage(1);
  }, [searchTerm, jobCategoryFilter, fulfillmentFilter]);

  const jobsQuery = useGetAdminJobsQuery({
    page: quotesPage,
    limit: quotesPageSize,
    searchTerm: searchTerm || undefined,
    category: jobCategoryFilter === "all" ? undefined : jobCategoryFilter,
  });
  const orderStageParam =
    fulfillmentFilter === "all"
      ? undefined
      : fulfillmentFilter === "awaiting_confirm"
        ? "pending_completion"
        : fulfillmentFilter;

  const ordersQuery = useGetAdminOrdersQuery({
    page: ordersPage,
    limit: ordersPageSize,
    searchTerm: searchTerm || undefined,
    stage: orderStageParam,
  });

  const filteredJobs = jobsQuery.data?.items ?? [];
  const filteredOrders = ordersQuery.data?.items ?? [];

  const handleTabChange = (tab: OrdersTab) => {
    setSearchParams({ tab });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jobs & Orders"
        description="Manage homeowner job requests and confirmed orders."
      />

      {/* Unified Search and Filter Bar Card with Job Requests vs Orders Switcher */}
      <Card className="p-3.5 sm:p-4 bg-white border-line shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder={currentTab === "quotes" ? "Search by job ID, title, homeowner, or zip..." : "Search by Job ID, service, client, or pro..."}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-xl border border-line bg-slate-50/70 py-2 pl-10 pr-4 text-xs sm:text-sm text-title placeholder:text-muted outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
            />
          </div>

          {/* Segmented Job Requests vs Orders Pills + Context Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Segmented Switcher inside the box */}
            <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-xl border border-slate-200/70">
              <button
                type="button"
                onClick={() => handleTabChange("quotes")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentTab === "quotes"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                <ClipboardList className="h-3.5 w-3.5 text-blue-600" />
                <span>Job Requests</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    currentTab === "quotes"
                      ? "bg-blue-100 text-blue-700 font-bold"
                      : "bg-slate-200/70 text-slate-600"
                  }`}
                >
                  {jobsQuery.data ? jobsQuery.data.total : "–"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange("orders")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentTab === "orders"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                <Briefcase className="h-3.5 w-3.5 text-emerald-600" />
                <span>Orders</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    currentTab === "orders"
                      ? "bg-emerald-100 text-emerald-700 font-bold"
                      : "bg-slate-200/70 text-slate-600"
                  }`}
                >
                  {ordersQuery.data ? ordersQuery.data.total : "–"}
                </span>
              </button>
            </div>

            {/* If tab is quotes: Category filter */}
            {currentTab === "quotes" && (
              <div className="flex items-center gap-1.5 rounded-xl border border-line bg-slate-50/70 px-3 py-1.5 text-xs">
                <span className="text-muted font-medium">Category:</span>
                <select
                  value={jobCategoryFilter}
                  onChange={(e) => setJobCategoryFilter(e.target.value)}
                  disabled={categoriesLoading}
                  className="bg-transparent font-medium text-slate-800 outline-none cursor-pointer disabled:opacity-60"
                >
                  <option value="all">
                    {categoriesLoading ? "Loading…" : "All Categories"}
                  </option>
                  {jobCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* If tab is orders: Stage filter */}
            {currentTab === "orders" && (
              <div className="flex items-center gap-1.5 rounded-xl border border-line bg-slate-50/70 px-3 py-1.5 text-xs">
                <Filter className="h-3.5 w-3.5 text-muted" />
                <span className="text-muted font-medium">Stage:</span>
                <select
                  value={fulfillmentFilter}
                  onChange={(e) =>
                    dispatch(
                      setFulfillmentFilter(e.target.value as "all" | Order["fulfillmentStatus"])
                    )
                  }
                  className="bg-transparent font-medium text-slate-800 outline-none cursor-pointer"
                >
                  <option value="all">All Stages</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="on_the_way">On the way</option>
                  <option value="in_progress">In Progress</option>
                  <option value="awaiting_confirm">Awaiting confirmation</option>
                  <option value="completed">Completed</option>
                  <option value="disputed">Disputed</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* TAB 1: LIVE JOB REQUESTS & QUOTES TABLE */}
      {currentTab === "quotes" && (
        <div className="space-y-4">
          <Card className="p-0 overflow-hidden shadow-xs bg-white border-line">
            <div
              className={`overflow-x-auto min-w-0 transition-opacity ${
                jobsQuery.isFetching && !jobsQuery.isLoading ? "opacity-60" : ""
              }`}
            >
              <table className="w-full min-w-[640px] text-left text-xs">
                <thead>
                  <tr className="border-b border-line/70 bg-slate-50/70 text-[11px] font-semibold text-muted uppercase tracking-wider">
                    <th className="py-3 px-4 whitespace-nowrap">Job ID</th>
                    <th className="py-3 px-3 whitespace-nowrap">Category</th>
                    <th className="py-3 px-4 whitespace-nowrap">Service Request</th>
                    <th className="py-3 px-3 whitespace-nowrap">Homeowner</th>
                    <th className="py-3 px-3 whitespace-nowrap">Quotes Received</th>
                    <th className="py-3 px-3 whitespace-nowrap">Date</th>
                    <th className="py-3 px-4 text-right whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60">
                  {jobsQuery.isLoading ? (
                    <TableMessageRow>Loading job requests…</TableMessageRow>
                  ) : jobsQuery.isError ? (
                    <TableErrorRow
                      error={jobsQuery.error}
                      fallback="Could not load job requests."
                      onRetry={jobsQuery.refetch}
                    />
                  ) : filteredJobs.length === 0 ? (
                    <TableMessageRow>No job requests matching your filters.</TableMessageRow>
                  ) : (
                    filteredJobs.map((job) => (
                      <tr
                        key={job.id}
                        onClick={() => navigate(ROUTES.JOBS.DETAIL(job.id))}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-600 whitespace-nowrap">
                          {formatShortId(job.id)}
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200/80">
                            {job.category}
                          </span>
                        </td>

                        {/* Service Request Title */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-title group-hover:text-blue-600 transition-colors line-clamp-1 max-w-sm">
                              {job.title}
                            </span>
                            {job.urgency === "emergency_asap" && (
                              <span className="inline-flex items-center px-1.5 py-0.2 text-[10px] font-bold rounded-md bg-rose-100 text-rose-700 shrink-0">
                                Emergency
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Homeowner */}
                        <td className="py-3.5 px-3 text-muted whitespace-nowrap">
                          {job.homeownerName}
                        </td>

                        {/* Quotes count with clear badge */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {job.quotesCount > 0 ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              <MessageSquare className="h-3 w-3" />
                              {job.quotesCount} {job.quotesCount === 1 ? "Quote" : "Quotes"}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                              0 Quotes (Awaiting)
                            </span>
                          )}
                        </td>

                        {/* Posted Date */}
                        <td className="py-3.5 px-3 text-muted whitespace-nowrap">
                          {formatDate(job.postedAt)}
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs h-7 px-2.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50/60 font-medium whitespace-nowrap rounded-lg"
                            onClick={() => navigate(ROUTES.JOBS.DETAIL(job.id))}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1 text-slate-400 group-hover:text-blue-600" />
                            Details
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {(jobsQuery.data?.total ?? 0) > 0 && (
              <Pagination
                currentPage={quotesPage}
                totalItems={jobsQuery.data?.total ?? 0}
                pageSize={quotesPageSize}
                onPageChange={setQuotesPage}
                onPageSizeChange={setQuotesPageSize}
                itemLabel="job requests"
              />
            )}
          </Card>
        </div>
      )}

      {/* TAB 2: CONFIRMED ORDERS & SETTLEMENTS TABLE */}
      {currentTab === "orders" && (
        <div className="space-y-4">
          <Card className="p-0 overflow-hidden shadow-xs bg-white border-line">
            <div
              className={`overflow-x-auto transition-opacity ${
                ordersQuery.isFetching && !ordersQuery.isLoading ? "opacity-60" : ""
              }`}
            >
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-line/70 bg-slate-50/70 text-[11px] font-semibold text-muted uppercase tracking-wider">
                    <th className="py-3 px-4 whitespace-nowrap">Job ID</th>
                    <th className="py-3 px-4 whitespace-nowrap">Service</th>
                    <th className="py-3 px-3 whitespace-nowrap">Homeowner</th>
                    <th className="py-3 px-3 whitespace-nowrap">Pro</th>
                    <th className="py-3 px-3 whitespace-nowrap">Status</th>
                    <th className="py-3 px-3 whitespace-nowrap">Date</th>
                    <th className="py-3 px-4 text-right whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60">
                  {ordersQuery.isLoading ? (
                    <TableMessageRow>Loading orders…</TableMessageRow>
                  ) : ordersQuery.isError ? (
                    <TableErrorRow
                      error={ordersQuery.error}
                      fallback="Could not load orders."
                      onRetry={ordersQuery.refetch}
                    />
                  ) : filteredOrders.length === 0 ? (
                    <TableMessageRow>No orders matching your criteria.</TableMessageRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr
                        key={order.id}
                        onClick={() => navigate(ROUTES.ORDERS.DETAIL(order.id))}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-600 whitespace-nowrap">
                          {formatShortId(order.id)}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-title group-hover:text-blue-600 transition-colors whitespace-nowrap">
                          <span className="truncate max-w-[220px] block" title={order.jobTitle}>
                            {order.jobTitle}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-muted whitespace-nowrap">
                          {order.homeownerName}
                        </td>
                        <td className="py-3.5 px-3 font-medium text-title whitespace-nowrap">
                          {order.proName}
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <Badge variant={getFulfillmentBadgeVariant(order.fulfillmentStatus)} dot>
                            {order.fulfillmentStatus.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-3 text-muted whitespace-nowrap">
                          {formatDate(order.orderDate)}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs h-7 px-2.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50/60 font-medium whitespace-nowrap rounded-lg"
                            onClick={() => navigate(ROUTES.ORDERS.DETAIL(order.id))}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1 text-slate-400 group-hover:text-blue-600" />
                            Details
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {(ordersQuery.data?.total ?? 0) > 0 && (
              <Pagination
                currentPage={ordersPage}
                totalItems={ordersQuery.data?.total ?? 0}
                pageSize={ordersPageSize}
                onPageChange={setOrdersPage}
                onPageSizeChange={setOrdersPageSize}
                itemLabel="orders"
              />
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
