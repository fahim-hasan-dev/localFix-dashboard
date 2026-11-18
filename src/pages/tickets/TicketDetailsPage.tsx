import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Briefcase,
  ExternalLink,
  MessageSquare,
  Loader2,
  Trash2,
} from "lucide-react";
import {
  useDeleteSupportTicketMutation,
  useGetSupportTicketByIdQuery,
  useReplySupportTicketMutation,
  useUpdateSupportTicketMutation,
} from "@/api/tickets.api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants/routes";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import { formatDate, formatShortId } from "@/lib/utils";
import type { TicketPriority, TicketStatus } from "@/types/common.types";

const getPriorityBadge = (p: TicketPriority) => {
  switch (p) {
    case "urgent":
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200/80 px-2.5 py-0.5 rounded-full">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
          Urgent Priority
        </span>
      );
    case "high":
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          High Priority
        </span>
      );
    case "medium":
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 rounded-full">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          Medium Priority
        </span>
      );
    case "low":
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          Low Priority
        </span>
      );
  }
};

export const TicketDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: ticket,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetSupportTicketByIdQuery(id ?? "", { skip: !id });

  const [replySupportTicket, { isLoading: isReplying }] = useReplySupportTicketMutation();
  const [updateSupportTicket, { isLoading: isUpdating }] = useUpdateSupportTicketMutation();
  const [deleteSupportTicket, { isLoading: isDeleting }] = useDeleteSupportTicketMutation();

  const [replyText, setReplyText] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const discussionRef = useRef<HTMLDivElement | null>(null);
  const discussionContentRef = useRef<HTMLDivElement | null>(null);
  const latestReplyId = ticket?.messages?.[ticket.messages.length - 1]?.id ?? "";
  const replyCount = ticket?.messages?.length ?? 0;

  useLayoutEffect(() => {
    const pane = discussionRef.current;
    if (pane) pane.scrollTop = pane.scrollHeight;
  }, [latestReplyId, replyCount]);

  useEffect(() => {
    const pane = discussionRef.current;
    const content = discussionContentRef.current;
    if (!pane || !content) return;
    const pin = () => {
      pane.scrollTop = pane.scrollHeight;
    };
    pin();
    const frame = requestAnimationFrame(() => {
      pin();
      requestAnimationFrame(pin);
    });
    const observer = new ResizeObserver(pin);
    observer.observe(content);
    const timer = window.setTimeout(() => observer.disconnect(), 500);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [latestReplyId, replyCount]);

  if (isLoading) {
    return (
      <div className="py-16 text-center text-muted">
        <Loader2 className="h-6 w-6 mx-auto animate-spin text-slate-400 mb-2" />
        <p className="text-xs">Loading ticket…</p>
      </div>
    );
  }

  if (isError || !ticket) {
    return (
      <div className="py-12 text-center space-y-4">
        <div className="h-16 w-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
          <HelpCircle className="h-8 w-8" />
        </div>
        <h2 className="text-lg font-bold text-title">Ticket Not Found</h2>
        <p className="text-xs text-muted max-w-sm mx-auto">
          {getApiErrorMessage(
            error,
            "The support ticket you are looking for does not exist or may have been deleted."
          )}
        </p>
        <div className="flex items-center justify-center gap-2">
          {isError && (
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.TICKETS.LIST)}>
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Tickets
          </Button>
        </div>
      </div>
    );
  }

  const handleSendReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const message = replyText.trim();
    if (!message || isReplying) return;
    setActionError(null);

    try {
      await replySupportTicket({ id: ticket.id, message }).unwrap();
      setReplyText("");
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Could not send the reply."));
    }
  };

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (newStatus === ticket.status) return;
    setActionError(null);
    try {
      await updateSupportTicket({ id: ticket.id, status: newStatus }).unwrap();
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Could not update the ticket status."));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this support ticket permanently? This cannot be undone.")) {
      return;
    }
    setActionError(null);
    try {
      await deleteSupportTicket(ticket.id).unwrap();
      navigate(ROUTES.TICKETS.LIST);
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Could not delete the ticket."));
    }
  };

  const isBusy = isUpdating || isDeleting;
  const isFinished = ticket.status === "resolved" || ticket.status === "closed";
  const statusValue = isFinished ? "resolved" : ticket.status;

  return (
    <div className="space-y-6">
      {/* Top Back Link & Ticket Header */}
      <div>
        <Link
          to={ROUTES.TICKETS.LIST}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Support Tickets</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-700 bg-slate-100/90 px-2.5 py-1 rounded-lg border border-slate-200">
                {ticket.ticketNumber || formatShortId(ticket.id)}
              </span>
              <span className="text-slate-300">•</span>
              {getPriorityBadge(ticket.priority)}
            </div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">{ticket.subject}</h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium mr-1">Status:</span>
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-2xs transition-all ${
                statusValue === "open"
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : statusValue === "in_progress"
                  ? "bg-blue-50 text-blue-800 border-blue-200"
                  : "bg-emerald-50 text-emerald-800 border-emerald-200"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full shrink-0 ${
                  statusValue === "open"
                    ? "bg-amber-500"
                    : statusValue === "in_progress"
                    ? "bg-blue-500"
                    : "bg-emerald-500"
                }`}
              />
              <select
                value={statusValue}
                disabled={isBusy}
                onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                className="bg-transparent font-semibold text-xs outline-none cursor-pointer pr-1 disabled:cursor-not-allowed"
              >
                <option value="open" className="bg-white text-slate-900">Open</option>
                <option value="in_progress" className="bg-white text-slate-900">In Progress</option>
                <option value="resolved" className="bg-white text-slate-900">Resolved</option>
              </select>
            </div>
          </div>
        </div>

        {actionError && (
          <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
            {actionError}
          </p>
        )}
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Messenger Thread */}
        <div className="lg:col-span-8 space-y-4">
          {/* Original Inquiry Card */}
          <Card className="p-5 border border-line bg-white">
            <div className="flex items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">
                  {ticket.userName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{ticket.userName}</span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      • {ticket.userRole === "pro" ? "Contractor Pro" : "Homeowner"}
                    </span>
                  </div>
                </div>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {formatDate(ticket.createdAt)}
              </span>
            </div>
            <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </p>
          </Card>

          {/* Conversation Stream */}
          <Card className="p-0 overflow-hidden flex flex-col border border-line shadow-xs">
            <div className="px-5 py-3.5 border-b border-line bg-slate-50/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-slate-600" />
                <span className="text-xs font-bold text-slate-900 tracking-tight">
                  Discussion ({ticket.messages?.length || 0})
                </span>
              </div>
            </div>

            <div
              ref={discussionRef}
              className="max-h-[520px] overflow-y-auto overflow-anchor-none bg-slate-50/30"
            >
              <div ref={discussionContentRef} className="space-y-4 p-5">
              {(ticket.messages?.length ?? 0) === 0 && (
                <p className="py-6 text-center text-xs text-muted">
                  No replies yet. Send the first response below.
                </p>
              )}
              {ticket.messages?.map((msg) => {
                const isAdmin = msg.senderRole === "admin";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-[11px] text-muted">
                      {!isAdmin && (
                        <span className="font-bold text-slate-700">{msg.senderName}</span>
                      )}
                      {isAdmin && (
                        <span className="font-bold text-blue-700 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                          Support Desk (Admin)
                        </span>
                      )}
                      <span>•</span>
                      <span>{msg.createdAt ? formatDate(msg.createdAt) : ""}</span>
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-2xs whitespace-pre-wrap ${
                        isAdmin
                          ? "bg-blue-600 text-white rounded-tr-xs"
                          : "bg-white border border-line text-title rounded-tl-xs"
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                );
              })}
              </div>
            </div>

            {isFinished ? (
              <p className="px-5 py-4 border-t border-line bg-slate-50 text-xs text-muted">
                This ticket is resolved. Replies are closed.
              </p>
            ) : (
            <form onSubmit={handleSendReply} className="p-4 border-t border-line bg-white">
              <div className="space-y-2.5">
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter" || e.shiftKey || e.nativeEvent.isComposing) return;
                    e.preventDefault();
                    void handleSendReply();
                  }}
                  placeholder="Type your reply to the requester... (Press Enter to send)"
                  className="w-full rounded-xl border border-line bg-white p-3 text-xs text-title placeholder:text-muted outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 leading-relaxed resize-none"
                  required
                />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted">
                    Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border text-[10px]">Enter</kbd> to send,{" "}
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border text-[10px]">Shift</kbd> +{" "}
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border text-[10px]">Enter</kbd> for a new line
                  </span>
                  <Button
                    type="submit"
                    size="sm"
                    variant="primary"
                    disabled={!replyText.trim() || isReplying}
                    className="flex items-center gap-1.5 font-semibold px-4"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isReplying ? "Sending…" : "Send Reply"}</span>
                  </Button>
                </div>
              </div>
            </form>
            )}
          </Card>
        </div>

        {/* Right Column: Metadata & Controls Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-5 space-y-4">
            <span className="text-xs font-bold text-title uppercase tracking-wider block border-b border-line pb-2">
              Requester Information
            </span>

            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-base border border-blue-100 shrink-0">
                {ticket.userName.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-bold text-title text-sm block truncate">
                  {ticket.userName}
                </span>
                <span className="text-xs text-muted block truncate">{ticket.userEmail}</span>
                <Badge
                  variant={ticket.userRole === "pro" ? "primary" : "neutral"}
                  className="text-[10px] mt-1"
                >
                  {ticket.userRole === "pro" ? "Contractor Pro" : "Homeowner"}
                </Badge>
              </div>
            </div>

            {ticket.userId && (
              <Link
                to={ROUTES.USERS.DETAIL(ticket.userId)}
                className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-xl border border-line bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-title transition-colors"
              >
                <span>View User Profile &amp; History</span>
                <ExternalLink className="w-3.5 h-3.5 text-muted" />
              </Link>
            )}
          </Card>

          {ticket.orderId && (
            <Card className="p-5 space-y-3">
              <span className="text-xs font-bold text-title uppercase tracking-wider block border-b border-line pb-2">
                Related Job
              </span>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-slate-500" />
                  <span className="font-bold text-xs text-title">
                    {formatShortId(ticket.orderId)}
                  </span>
                </div>
                <Link
                  to={ROUTES.JOBS.DETAIL(ticket.orderId)}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  <span>Open Job</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </Card>
          )}

          <Card className="p-5 space-y-3 text-xs">
            <span className="text-xs font-bold text-title uppercase tracking-wider block border-b border-line pb-2">
              Timeline
            </span>

            <div className="flex items-center justify-between py-1 border-b border-line/60">
              <span className="text-muted">Created</span>
              <span className="text-title font-medium">{formatDate(ticket.createdAt)}</span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-muted">Last Updated</span>
              <span className="text-title">{formatDate(ticket.updatedAt)}</span>
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="space-y-2">
            {ticket.status !== "resolved" && ticket.status !== "closed" && (
              <Button
                variant="primary"
                size="sm"
                disabled={isBusy}
                onClick={() => handleStatusChange("resolved")}
                className="w-full justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                <span>Mark as Resolved</span>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              disabled={isBusy}
              onClick={handleDelete}
              className="w-full justify-center text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300"
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              <span>{isDeleting ? "Deleting…" : "Delete Ticket"}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailsPage;
