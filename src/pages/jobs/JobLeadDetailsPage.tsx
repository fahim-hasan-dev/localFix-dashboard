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
  Image as ImageIcon,
  Check,
  ExternalLink,
  Star,
} from "lucide-react";
import { useGetAdminJobByIdQuery } from "@/api/jobsOrders.api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/layout/PageHeader";
import { ROUTES } from "@/constants/routes";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import { formatDate, formatShortId } from "@/lib/utils";

const BACK_TO_JOBS = `${ROUTES.ORDERS.LIST}?tab=quotes`;

export const JobLeadDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: job,
    isLoading,
    error,
    refetch,
  } = useGetAdminJobByIdQuery(id ?? "", { skip: !id });

  const [selectedQuoteDetail, setSelectedQuoteDetail] = useState<any | null>(null);

  if (!job) {
    return (
      <div className="space-y-6">
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate(BACK_TO_JOBS)}
          className="flex items-center gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Jobs &amp; Orders</span>
        </Button>
        <Card className="p-12 text-center text-muted">
          {isLoading ? (
            <p className="text-sm font-semibold text-title">Loading job request…</p>
          ) : (
            <>
              <p className="text-sm font-semibold text-title">Job Request Not Found</p>
              <p className="text-xs mt-1">
                {getApiErrorMessage(error, "The requested job request could not be found.")}
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate(BACK_TO_JOBS)}
          className="flex items-center gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Jobs &amp; Orders</span>
        </Button>
      </div>

      <PageHeader
        title={job.title}
        description={`Request ${formatShortId(job.id)} • Posted ${formatDate(job.postedAt)}`}
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted font-medium">Live Stage:</span>
            <Badge
              variant={
                job.status === "completed"
                  ? "success"
                  : job.status === "in_progress"
                  ? "info"
                  : job.status === "quotes_in"
                  ? "primary"
                  : "warning"
              }
              dot
              className="text-xs font-semibold px-2.5 py-1"
            >
              {job.status === "getting_quotes"
                ? "Getting Quotes"
                : job.status === "quotes_in"
                ? "Quotes In (Reviewing)"
                : job.status.replace("_", " ")}
            </Badge>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Minimal Request Overview & Quotes Table */}
        <div className="lg:col-span-2 space-y-6">
          {/* Minimal Request Summary Card */}
          <Card className="p-5 bg-white border-line shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/70 pb-3">
              <div className="flex items-center gap-2">
                <Badge variant="primary" className="text-xs font-semibold">
                  {job.category}
                </Badge>
                {job.subCategory && (
                  <Badge variant="neutral" className="text-xs">
                    {job.subCategory}
                  </Badge>
                )}
                {job.urgency === "emergency_asap" && (
                  <Badge variant="error" className="text-xs font-bold animate-pulse">
                    <Flame className="h-3 w-3 mr-1" /> Emergency ASAP
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-muted">
                <span>Budget: <strong className="text-title">{job.budgetRange}</strong></span>
                <span>Property: <strong className="text-title capitalize">{job.propertyType.replace("_", " ")}</strong></span>
              </div>
            </div>

            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted mb-1">
                Client Description
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-line/60">
                {job.description}
              </p>
            </div>

            {/* Damage photos thumbnail strip */}
            {job.photos && job.photos.length > 0 && (
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted mb-2">
                  Damage Photos ({job.photos.length})
                </h4>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {job.photos.map((photo, i) => (
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

          {/* Clean Minimal Pro Quotes Table */}
          <Card className="p-0 overflow-hidden shadow-xs bg-white border-line">
            <div className="p-4 border-b border-line flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-title flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                  Pro Quotes ({job.quotes.length})
                </h3>
                <p className="text-[11px] text-muted">
                  Itemized estimates submitted by local pros within service radius
                </p>
              </div>
              <Badge variant="neutral" className="text-xs font-semibold">
                Budget: {job.budgetRange}
              </Badge>
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
                  {job.quotes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-muted">
                        No pro quotes submitted yet for this request.
                      </td>
                    </tr>
                  ) : (
                    job.quotes.map((q) => (
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
                              src={
                                q.proAvatar ||
                                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"
                              }
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
                        <td className="py-2.5 px-2 font-black text-xs text-emerald-700 whitespace-nowrap">
                          ${q.amount}
                        </td>

                        {/* Availability & Duration */}
                        <td className="py-2.5 px-2 text-[11px] text-slate-600">
                          <div className="font-medium text-title text-[11px] truncate max-w-[85px]">
                            {q.earliestAvailability}
                          </div>
                          <span className="text-muted text-[10px] block truncate max-w-[85px]">
                            {q.estimatedDuration}
                          </span>
                        </td>

                        {/* Proposal Note (Compact preview with View note trigger) */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-600 text-xs truncate max-w-[120px] block" title={q.message}>
                              "{q.message}"
                            </span>
                            <button
                              type="button"
                              onClick={() => setSelectedQuoteDetail(q)}
                              className="text-[11px] font-semibold text-primary hover:underline hover:text-blue-700 whitespace-nowrap shrink-0 cursor-pointer"
                            >
                              Details →
                            </button>
                          </div>
                        </td>

                        {/* Status / Outcome */}
                        <td className="py-2.5 px-3 text-right">
                          {q.status === "accepted" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 whitespace-nowrap">
                              <Check className="h-3 w-3" /> Hired
                            </span>
                          ) : q.status === "declined" ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500 whitespace-nowrap">
                              Declined
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

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
                      src={
                        selectedQuoteDetail.proAvatar ||
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"
                      }
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
                  ) : selectedQuoteDetail.status === "declined" ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                      Declined
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                      Pending Review
                    </span>
                  )}
                </div>
              </div>
            )}
          </Modal>
        </div>

        {/* Right Column: Homeowner Details & Direct Settlement Badge */}
        <div className="space-y-5">
          <Card className="p-4 bg-white border-line shadow-xs space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted">
              Homeowner Contact
            </h4>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                {job.homeownerName.charAt(0)}
              </div>
              <div>
                <h5 className="text-xs font-bold text-title">{job.homeownerName}</h5>
                <span className="text-[11px] text-muted">Verified Client</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs pt-2 border-t border-line text-slate-600">
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                <span>{job.city}, {job.state} {job.zipCode}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                <span>{job.homeownerPhone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <span>{job.homeownerEmail}</span>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-blue-50/50 border border-blue-200 shadow-xs space-y-2">
            <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              0% Direct Pay Policy
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              LocalHomeFix charges zero middleman fee on service quotes. The homeowner settles payment directly with the selected pro upon work completion.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default JobLeadDetailsPage;
