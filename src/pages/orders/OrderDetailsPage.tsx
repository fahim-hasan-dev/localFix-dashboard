import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  ShieldCheck,
  Briefcase,
  User,
  CreditCard,
  FileText,
  Calendar,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
  Clock,
  Phone,
  Mail,
  Flame,
  MessageSquare,
  Building,
  Check,
  ExternalLink,
  Star,
} from "lucide-react";
import { useGetAdminOrderByIdQuery } from "@/api/jobsOrders.api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/layout/PageHeader";
import { ROUTES } from "@/constants/routes";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import { getFulfillmentBadgeVariant } from "@/lib/statusBadge";
import { formatCurrency, formatDate, formatShortId } from "@/lib/utils";

const BACK_TO_ORDERS = `${ROUTES.ORDERS.LIST}?tab=orders`;

export const OrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: order,
    isLoading,
    error,
    refetch,
  } = useGetAdminOrderByIdQuery(id ?? "", { skip: !id });

  const [selectedQuoteDetail, setSelectedQuoteDetail] = useState<any | null>(null);

  if (!order) {
    return (
      <div className="space-y-6">
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate(BACK_TO_ORDERS)}
          className="flex items-center gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Jobs &amp; Orders</span>
        </Button>
        <Card className="p-12 text-center text-muted">
          {isLoading ? (
            <p className="text-sm font-semibold text-title">Loading order…</p>
          ) : (
            <>
              <p className="text-sm font-semibold text-title">Order Not Found</p>
              <p className="text-xs mt-1">
                {getApiErrorMessage(error, "The requested order could not be found.")}
              </p>
              {id && (
                <Button size="sm" variant="outline" className="mt-3 text-xs" onClick={refetch}>
                  Retry
                </Button>
              )}
            </>
          )}
        </Card>
      </div>
    );
  }

  const damagePhotos = order.photos ?? [];
  const statusVariant = getFulfillmentBadgeVariant(order.fulfillmentStatus);

  return (
    <div className="space-y-6">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate(BACK_TO_ORDERS)}
          className="flex items-center gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Jobs &amp; Orders</span>
        </Button>
      </div>

      <PageHeader
        title={order.jobTitle}
        description={`Job ${formatShortId(order.id)} • Confirmed ${formatDate(order.orderDate)}`}
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted font-medium">Live Stage:</span>
            <Badge
              variant={statusVariant}
              dot
              className="text-xs font-semibold px-2.5 py-1 capitalize"
            >
              {order.fulfillmentStatus.replace("_", " ")}
            </Badge>
          </div>
        }
      />

      {/* Main 2-Column Responsive Grid (Exact parity with JobLeadDetailsPage) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Job Overview, Final Price, Hired Pro & Damage Photos */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Overview Card */}
          <Card className="p-5 bg-white border-line shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/70 pb-3">
              <div className="flex items-center gap-2">
                <Badge variant="primary" className="text-xs font-semibold">
                  {order.category}
                </Badge>
                <Badge variant={statusVariant} dot className="text-xs">
                  {order.fulfillmentStatus.replace("_", " ")}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted">
                <span>Final Price: <strong className="text-emerald-700 text-sm font-bold">{formatCurrency(order.amount)}</strong></span>
                {order.budgetRange && (
                  <span>Est. Budget: <strong className="text-title">{order.budgetRange}</strong></span>
                )}
                {order.propertyType && (
                  <span>Property: <strong className="text-title capitalize">{order.propertyType.replace("_", " ")}</strong></span>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted mb-1">
                Client Description
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-line/60">
                {order.description}
              </p>
              {order.notes && (
                <div className="mt-2 text-xs text-slate-600 bg-amber-50/60 border border-amber-200/60 p-2.5 rounded-xl">
                  <span className="font-semibold text-amber-900">Completion Notes: </span>
                  {order.notes}
                </div>
              )}
            </div>

            {/* Damage photos thumbnail strip */}
            {damagePhotos.length > 0 && (
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted mb-2">
                Damage Photos ({damagePhotos.length})
              </h4>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {damagePhotos.map((photo, i) => (
                  <a
                    key={i}
                    href={photo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative h-20 w-24 shrink-0 rounded-lg overflow-hidden border border-line block shadow-xs"
                  >
                    <img
                      src={photo}
                      alt="Damage photo"
                      className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-semibold gap-1">
                      <ExternalLink className="h-3 w-3" /> View
                    </div>
                  </a>
                ))}
              </div>
            </div>
            )}
          </Card>

          {/* Hired Pro Card (Confirmed Quote) */}
          <Card className="p-5 bg-white border-line shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-line/70 pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-title">
                  Hired Pro (Confirmed Contractor)
                </h3>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                <Check className="h-3.5 w-3.5" /> Hired by Homeowner
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-line/60">
              <div className="flex items-center gap-3">
                <img
                  src={
                    order.proAvatar ||
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80"
                  }
                  alt={order.proName}
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-emerald-500/30"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-title">{order.proName}</span>
                    {order.proRating ? (
                      <span className="text-[11px] font-bold text-amber-600 flex items-center">
                        <Star className="h-3 w-3 fill-amber-500 mr-0.5" />
                        {order.proRating}
                      </span>
                    ) : null}
                  </div>
                  {order.proBusiness && (
                    <p className="text-xs text-muted">{order.proBusiness}</p>
                  )}
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium mt-1">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>TDLR Licensed &amp; Background Screened</span>
                  </div>
                </div>
              </div>

              <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-line/60">
                <div className="text-xs text-muted">Final Agreed Price</div>
                <div className="text-xl font-black text-emerald-700">
                  {formatCurrency(order.amount)}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Scheduled: {formatDate(order.orderDate)}
                </div>
              </div>
            </div>
          </Card>

          {/* Quotes Comparison & Submitted Proposals (Compact No-Scroll Table) */}
          {order.quotes && order.quotes.length > 0 && (
            <Card className="p-0 overflow-hidden shadow-xs bg-white border-line">
              <div className="p-4 border-b border-line flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-title flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                    Quote Bidding History ({order.quotes.length})
                  </h3>
                  <p className="text-[11px] text-muted">
                    Pro estimates submitted before homeowner confirmed hire
                  </p>
                </div>
              </div>

              <div>
                <table className="w-full text-left text-xs table-auto">
                  <thead>
                    <tr className="border-b border-line/70 bg-slate-50/70 text-[11px] font-semibold text-muted uppercase tracking-wider">
                      <th className="py-2.5 px-3">Pro</th>
                      <th className="py-2.5 px-2">Quote</th>
                      <th className="py-2.5 px-2">Duration</th>
                      <th className="py-2.5 px-3">Proposal Note</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/60">
                    {order.quotes.map((q) => (
                      <tr
                        key={q.id}
                        className={`transition-colors ${
                          q.status === "accepted" ? "bg-emerald-50/40" : "hover:bg-slate-50/60"
                        }`}
                      >
                        {/* Pro Avatar & Name */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <img
                              src={q.proAvatar}
                              alt={q.proName}
                              className="h-7 w-7 rounded-full object-cover border border-line shrink-0"
                            />
                            <div className="min-w-0">
                              <span className="font-bold text-title text-xs block truncate max-w-[105px]">
                                {q.proName}
                              </span>
                              <span className="text-[10px] text-amber-600 font-bold flex items-center">
                                <Star className="h-2.5 w-2.5 fill-amber-500 mr-0.5" />
                                {q.proRating}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Quote Amount */}
                        <td className="py-2.5 px-2">
                          <span className="font-extrabold text-xs text-emerald-700 block">
                            ${q.amount}
                          </span>
                        </td>

                        {/* Availability & Duration */}
                        <td className="py-2.5 px-2 text-[11px] text-slate-600">
                          <span className="font-medium text-slate-800 block text-xs truncate max-w-[85px]">
                            {q.earliestAvailability}
                          </span>
                          <span className="text-muted text-[10px] block">
                            {q.estimatedDuration}
                          </span>
                        </td>

                        {/* Compact Proposal Note Snippet + Details Modal Trigger */}
                        <td className="py-2.5 px-3">
                          <button
                            type="button"
                            onClick={() => setSelectedQuoteDetail(q)}
                            className="text-left text-xs text-slate-600 hover:text-blue-600 transition-colors group/note block max-w-[120px] sm:max-w-[160px] cursor-pointer"
                            title="Click to view full proposal scope"
                          >
                            <span className="truncate block font-medium group-hover/note:underline">
                              "{q.message}"
                            </span>
                            <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-0.5">
                              View note →
                            </span>
                          </button>
                        </td>

                        {/* Status Outcome */}
                        <td className="py-2.5 px-3 text-right">
                          {q.status === "accepted" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 whitespace-nowrap">
                              <Check className="h-3 w-3" /> Hired
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500 whitespace-nowrap">
                              Declined
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Full Proposal Note Details Modal */}
          <Modal
            isOpen={!!selectedQuoteDetail}
            onClose={() => setSelectedQuoteDetail(null)}
            title={`Proposal from ${selectedQuoteDetail?.proName}`}
            description="Itemized estimate and scope of work submitted by the professional."
            maxWidth="md"
            footer={
              <div className="flex items-center justify-end w-full">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedQuoteDetail(null)}
                  className="cursor-pointer text-xs"
                >
                  Close
                </Button>
              </div>
            }
          >
            {selectedQuoteDetail && (
              <div className="space-y-4 text-xs">
                {/* Pro Info & Quote Summary */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={selectedQuoteDetail.proAvatar}
                      alt={selectedQuoteDetail.proName}
                      className="h-10 w-10 rounded-full object-cover border border-line"
                    />
                    <div>
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-1">
                        {selectedQuoteDetail.proName}
                        <span className="text-[10px] text-amber-600 font-bold flex items-center">
                          <Star className="h-3 w-3 fill-amber-500 mr-0.5" />
                          {selectedQuoteDetail.proRating}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted">
                        Earliest: {selectedQuoteDetail.earliestAvailability} ({selectedQuoteDetail.estimatedDuration})
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-muted block uppercase font-semibold">Estimate</span>
                    <span className="text-base font-extrabold text-emerald-700">
                      ${selectedQuoteDetail.amount}
                    </span>
                  </div>
                </div>

                {/* Full Proposal Message */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 block text-xs">
                    Proposal Scope &amp; Statement of Work
                  </label>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs leading-relaxed whitespace-pre-wrap">
                    "{selectedQuoteDetail.message}"
                  </div>
                </div>

                {/* Outcome Status */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-muted">Hire Status:</span>
                  {selectedQuoteDetail.status === "accepted" ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      <Check className="h-3.5 w-3.5" /> Selected &amp; Hired by Homeowner
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                      Declined
                    </span>
                  )}
                </div>
              </div>
            )}
          </Modal>
        </div>

        {/* Right Column: Homeowner Details & Payment Summary */}
        <div className="space-y-5">
          {/* Homeowner Card */}
          <Card className="p-5 bg-white border-line shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              Homeowner Information
            </h3>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 font-bold text-sm grid place-items-center">
                {order.homeownerName.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold text-title">{order.homeownerName}</p>
                <p className="text-xs text-muted">Client Account Verified</p>
              </div>
            </div>

            <div className="space-y-2 text-xs border-t border-line/60 pt-3">
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="h-3.5 w-3.5 text-muted shrink-0" />
                <span>{order.address}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="h-3.5 w-3.5 text-muted shrink-0" />
                <span>{order.homeownerPhone}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="h-3.5 w-3.5 text-muted shrink-0" />
                <span>{order.homeownerEmail}</span>
              </div>
            </div>
          </Card>

          {/* Payment & Settlement Summary Card */}
          <Card className="p-5 bg-white border-line shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-emerald-600" />
              Payment Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-line/60">
                <span className="text-muted">Final Price</span>
                <span className="font-black text-sm text-emerald-700">
                  {formatCurrency(order.amount)}
                </span>
              </div>

              {order.paymentMethod ? (
                <div className="flex items-center justify-between pb-2 border-b border-line/60">
                  <span className="text-muted">Payment method</span>
                  <span className="font-semibold capitalize text-title">
                    {order.paymentMethod.replace(/_/g, " ")}
                  </span>
                </div>
              ) : null}

              <div className="flex items-center justify-between pb-2 border-b border-line/60">
                <span className="text-muted">Payment Status</span>
                <Badge
                  variant={
                    order.paymentStatus === "paid_direct" || order.paymentStatus === "paid"
                      ? "success"
                      : order.paymentStatus === "disputed"
                      ? "error"
                      : "warning"
                  }
                  className="text-xs capitalize"
                >
                  {order.paymentStatus === "paid_direct" ? "Paid" : order.paymentStatus.replace("_", " ")}
                </Badge>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-line/60">
                <span className="text-muted">Platform Fee</span>
                <span className="font-semibold text-title">
                  {order.platformFee > 0
                    ? formatCurrency(order.platformFee)
                    : "$0.00 (0% Fee)"}
                </span>
              </div>

              {order.transactionId && (
                <div className="flex items-center justify-between pb-2 border-b border-line/60">
                  <span className="text-muted">Transaction ID</span>
                  <span className="font-mono text-[11px] font-bold text-blue-600">
                    #{order.transactionId.replace('#', '')}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-muted">Confirmed Date</span>
                <span className="font-medium text-title">
                  {formatDate(order.orderDate)}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
