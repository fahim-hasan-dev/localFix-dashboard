import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useUrlTab } from "@/hooks/useUrlTab";
import {
  ArrowLeft,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Calendar,
  AlertTriangle,
  Briefcase,
  DollarSign,
  Clock,
  Eye,
  CheckCircle2,
  Ban,
  UserCheck,
  Check,
  ExternalLink,
  Star,
  User as UserIcon,
  Award,
  Lock,
  MessageCircle,
  ThumbsUp,
  EyeOff,
  Shield,
  BadgeCheck,
  ShieldCheck,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  useGetUserByIdQuery,
  useGetClearanceByIdQuery,
  useUpdateUserStatusMutation,
  useUpdateApprovalStatusMutation,
  useDeleteUserMutation,
} from "@/api/users.api";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import { ROUTES } from "@/constants/routes";
import {
  approveReview,
  hideReview,
  moderateProReply,
  deleteProReply,
  deleteReview,
} from "@/store/slices/reviewsSlice";
import { Review } from "@/types/common.types";
import { addAuditLog } from "@/store/slices/auditSlice";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency, formatDate } from "@/lib/utils";

const plumbingProjects = [
  {
    title: "Whole-Home PEX-A Repiping Project",
    tag: "Plumbing",
    img: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Commercial Tankless Manifold Setup",
    tag: "Installation",
    img: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Main Drain Pipe System Installation",
    tag: "Piping",
    img: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=600&q=80",
  },
];

const electricalProjects = [
  {
    title: "200-Amp Main Service Panel Upgrade",
    tag: "Upgrade",
    img: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Flush Dimmable Lutron LED Pot Lights",
    tag: "Lighting",
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Level 2 EV Charging Station Wallbox",
    tag: "Installation",
    img: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=600&q=80",
  },
];

const hvacProjects = [
  {
    title: "Trane 16 SEER2 High Efficiency Heat Pump",
    tag: "HVAC",
    img: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Attic Air Handler & Mastic Duct Seal",
    tag: "Ductwork",
    img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Smart Multi-Zone Thermostat Integration",
    tag: "Smart Home",
    img: "https://images.unsplash.com/photo-1563461660947-507ef49e9c47?auto=format&fit=crop&w=600&q=80",
  },
];

const roofingProjects = [
  {
    title: "Architectural 30-Year Timberline Shingles",
    tag: "Roofing",
    img: "https://images.unsplash.com/photo-1632759145351-1d592919f522?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Standing Seam Matte Black Metal Roof",
    tag: "Metal Roof",
    img: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Chimney Flashing & Ice/Water Shield Waterproofing",
    tag: "Waterproofing",
    img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
  },
];

const treeProjects = [
  {
    title: "Heritage Live Oak Crown Reduction & Pruning",
    tag: "Arbor Care",
    img: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Crane-Assisted Hazardous Tree Removal",
    tag: "Removal",
    img: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Deep Root Soil Fertilization Treatment",
    tag: "Tree Health",
    img: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=600&q=80",
  },
];

const handymanProjects = [
  {
    title: "Seamless Drywall Patch & Orange Peel Texture",
    tag: "Drywall",
    img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Cedar Deck Board Replacement & Solid Stain",
    tag: "Carpentry",
    img: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Interior Solid Core Door Re-Hanging & Trim",
    tag: "Installation",
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80",
  },
];

const getTradeProjects = (trade?: string) => {
  const t = (trade || "").toLowerCase();
  if (t.includes("plumb")) return plumbingProjects;
  if (t.includes("electr")) return electricalProjects;
  if (t.includes("hvac") || t.includes("air") || t.includes("cool") || t.includes("mechan")) return hvacProjects;
  if (t.includes("roof")) return roofingProjects;
  if (t.includes("tree") || t.includes("arbor")) return treeProjects;
  if (t.includes("handy") || t.includes("general") || t.includes("repair")) return handymanProjects;
  return plumbingProjects;
};

export const UserDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const reviews = useAppSelector((state) => state.reviews.reviews);

  const {
    data: details,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetUserByIdQuery(id ?? "", { skip: !id });
  const user = details?.user;
  const { data: proClearance } = useGetClearanceByIdQuery(id ?? "", {
    skip: !id || user?.role !== "pro",
  });

  const [updateUserStatus, { isLoading: isUpdatingStatus }] = useUpdateUserStatusMutation();
  const [updateApprovalStatus, { isLoading: isUpdatingApproval }] =
    useUpdateApprovalStatusMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const isBusy = isUpdatingStatus || isUpdatingApproval || isDeleting;

  const tabFallback = user?.role === "pro" ? "profile" : "orders";
  const [activeTab, setActiveTab] = useUrlTab(
    ["profile", "orders", "transactions", "reviews", "compliance", "gallery"] as const,
    tabFallback,
  );
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [notice, setNotice] = useState<{ text: string; isError: boolean } | null>(null);

  // Review Moderation State
  const [reviewToHide, setReviewToHide] = useState<Review | null>(null);
  const [hideReasonText, setHideReasonText] = useState("");
  const [reviewToReply, setReviewToReply] = useState<Review | null>(null);
  const [replyEditText, setReplyEditText] = useState("");

  const triggerNotice = (text: string, isError = false) => {
    setNotice({ text, isError });
    setTimeout(() => setNotice(null), 3000);
  };

  if (!details || !user) {
    return (
      <div className="space-y-4">
        <Link
          to={ROUTES.USERS.LIST}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to User Management</span>
        </Link>
        <Card className="p-8 text-center space-y-3">
          {isLoading ? (
            <p className="text-xs text-muted">Loading user profile...</p>
          ) : (
            <>
              <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto" />
              <h2 className="text-sm font-semibold text-title">
                {isError ? "Failed to Load User" : "User Account Not Found"}
              </h2>
              <p className="text-xs text-muted">
                {isError
                  ? getApiErrorMessage(error, "Could not load this user profile.")
                  : "The requested user profile does not exist or has been permanently removed."}
              </p>
              <div className="flex items-center justify-center gap-2">
                {isError && (
                  <Button size="sm" variant="outline" onClick={refetch}>
                    Retry
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => navigate(ROUTES.USERS.LIST)}>
                  Return to User Management
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    );
  }

  const userOrders = details.orders;
  const userTransactions = details.transactions;
  const apiReviews = details.reviews;
  const profile = details.profile;
  const statCards = details.statCards;

  const proReviews = reviews.filter(
    (r) =>
      r.proId === user.id ||
      r.proName.toLowerCase() === user.name.toLowerCase() ||
      (proClearance &&
        r.proBusiness.toLowerCase() === proClearance.businessName.toLowerCase())
  );
  const displayReviews =
    apiReviews.length > 0
      ? apiReviews
      : proReviews.map((r) => ({
          id: r.id,
          reviewerName: r.homeownerName || "Homeowner",
          rating: r.rating,
          feedback: r.comment || "",
          jobTitle: r.jobTitle || "Service",
          createdAt: r.createdAt,
          reply: r.reply?.text || null,
        }));
  const proAvgRating =
    displayReviews.length > 0
      ? (
          displayReviews.reduce((sum, r) => sum + r.rating, 0) /
          displayReviews.length
        ).toFixed(1)
      : "—";

  const totalSpentOrEarned = userOrders.reduce((sum, o) => sum + o.amount, 0);

  const statValue = (keys: string[], fallback: string | number = "—") => {
    const card = statCards.find((s) => keys.includes(s.key));
    return card?.value ?? fallback;
  };

  // True pending clearance applicant detection
  const isNewOrPending =
    user.role === "pro" &&
    (user.status === "pending_clearance" ||
      proClearance?.clearanceLevel === "pending" ||
      proClearance?.clearanceLevel === "action_required");

  const activeProjects = getTradeProjects(proClearance?.trade);

  const getBio = () => {
    if (profile?.about) return profile.about;
    if (isNewOrPending) {
      return `Applicant profile submitted on ${formatDate(
        proClearance?.submittedAt || user.joinedDate
      )}. Trade specialty registered: ${
        proClearance?.trade || profile?.tradeSpecialty || "Licensed Tradesperson"
      }${user.location ? ` serving ${user.location}` : ""}. Compliance credentials are under verification.`;
    }
    return profile?.tradeSpecialty
      ? `${profile.tradeSpecialty}${user.location ? ` serving ${user.location}` : ""}.`
      : "No profile bio available yet.";
  };

  const getExperience = () => {
    const highlight = profile?.tradeSpecialty;
    if (highlight && /\d+\+?\s*years?/i.test(highlight)) return highlight;
    return profile?.membershipPlan || "Verified Pro";
  };

  const getReputation = () => {
    const ratingCard = statCards.find((s) => s.key === "customer_rating");
    const totalReviews = displayReviews.length;
    const avg =
      totalReviews > 0
        ? (
            displayReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
          ).toFixed(1)
        : ratingCard
          ? String(ratingCard.value)
          : "—";

    const pct = (count: number) =>
      totalReviews > 0 ? `${Math.round((count / totalReviews) * 100)}%` : "0%";
    const five = displayReviews.filter((r) => r.rating >= 5).length;
    const four = displayReviews.filter((r) => r.rating === 4).length;
    const low = displayReviews.filter((r) => r.rating <= 3).length;

    if (user.status === "banned") {
      return {
        score: avg === "—" ? "—" : avg,
        totalReviews,
        recommendPct: "—",
        fiveStarPct: pct(five),
        fourStarPct: pct(four),
        lowStarPct: pct(low),
        subtext: "Account suspended due to policy violation",
      };
    }

    return {
      score: avg,
      totalReviews,
      recommendPct: totalReviews ? pct(five + four) : "0%",
      fiveStarPct: pct(five),
      fourStarPct: pct(four),
      lowStarPct: pct(low),
      subtext:
        totalReviews > 0
          ? "Based on verified platform reviews"
          : "No reviews yet",
    };
  };

  const logAudit = (action: string, details: string) =>
    dispatch(
      addAuditLog({
        action,
        entityType: "user",
        entityId: user.id,
        entityTitle: user.name,
        executedBy: "Super Admin",
        details,
      })
    );

  const runAction = async (
    request: () => Promise<unknown>,
    onSuccess: () => void,
    errorFallback: string
  ) => {
    try {
      await request();
      onSuccess();
    } catch (err) {
      triggerNotice(getApiErrorMessage(err, errorFallback), true);
    }
  };

  const userId = id || user?.id || "";

  const handleConfirmBan = (e: React.FormEvent) => {
    e.preventDefault();
    const reason = banReason.trim();
    if (!reason || !userId) return;

    return runAction(
      () => updateUserStatus({ id: userId, status: "inactive" }).unwrap(),
      () => {
        logAudit("USER_BANNED", `Account suspended. Reason: ${reason}`);
        setIsBanModalOpen(false);
        setBanReason("");
        triggerNotice("User account has been banned.");
      },
      "Failed to ban user."
    );
  };

  const handleUnban = () => {
    if (!userId) return;
    return runAction(
      () => updateUserStatus({ id: userId, status: "active" }).unwrap(),
      () => {
        logAudit("USER_UNBANNED", "Account reinstated to active status.");
        triggerNotice("User account reinstated.");
      },
      "Failed to reinstate user."
    );
  };

  const handleApprovePro = () => {
    if (!userId) return;
    return runAction(
      () =>
        updateApprovalStatus({ id: userId, approvalStatus: "approved" }).unwrap(),
      () => {
        logAudit(
          "PRO_CLEARANCE_APPROVED",
          "Contractor verification approved and pro profile activated."
        );
        triggerNotice("Contractor cleared and activated on marketplace!");
      },
      "Failed to approve contractor."
    );
  };

  const handleConfirmDelete = () => {
    if (!userId) return;
    return runAction(
      () => deleteUser(userId).unwrap(),
      () => {
        logAudit("USER_DELETED", "User account permanently deleted.");
        navigate(ROUTES.USERS.LIST, { replace: true });
      },
      "Failed to delete user."
    ).finally(() => setIsDeleteModalOpen(false));
  };

  return (
    <div className="space-y-4">
      {/* Top Bar with Navigation and Notice */}
      <div className="flex items-center justify-between gap-3">
        <Link
          to={ROUTES.USERS.LIST}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to User Management</span>
        </Link>
        {notice && (
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium border ${
              notice.isError
                ? "bg-rose-50 text-rose-700 border-rose-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}
          >
            {notice.isError ? (
              <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            )}
            <span>{notice.text}</span>
          </div>
        )}
      </div>

      {/* User Header Profile Card - Left Stacked Info & Right Stats Grid */}
      <Card className="p-5 bg-white border-line shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          {/* Left: Avatar + Identity + Stacked Vertical Contact Details (Niche Niche Left-Aligned) */}
          <div className="flex items-start gap-4 min-w-0 flex-1">
            <div className="relative shrink-0">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-16 w-16 rounded-2xl object-cover ring-2 ring-slate-200/80 shadow-xs"
                />
              ) : (
                <div className="h-16 w-16 rounded-2xl bg-slate-100 text-slate-700 text-xl font-bold grid place-items-center ring-2 ring-slate-200/80 shadow-xs">
                  {(user.name || "?").charAt(0).toUpperCase()}
                </div>
              )}
              <span
                className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${
                  user.status === "active"
                    ? "bg-emerald-500"
                    : user.status === "banned"
                    ? "bg-rose-500"
                    : "bg-amber-500"
                }`}
                title={`Status: ${user.status}`}
              />
            </div>

            <div className="space-y-2 min-w-0 flex-1">
              {/* Name & Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">
                  {user.name || "Unnamed User"}
                </h1>
                <span
                  className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                    user.role === "pro"
                      ? "bg-blue-50 text-blue-700 border border-blue-200/70"
                      : "bg-slate-50 text-slate-600 border border-slate-200/60"
                  }`}
                >
                  {user.role === "pro" ? "Pro" : "Homeowner"}
                </span>
                {user.status === "active" && (
                  <Badge variant="success" dot>Active</Badge>
                )}
                {user.status === "banned" && (
                  <Badge variant="error" dot>Banned</Badge>
                )}
                {user.status === "pending_clearance" && (
                  <Badge variant="warning" dot>Pending Clearance</Badge>
                )}
                
              </div>

              {/* Compact 2-Column Contact Info (Natural auto width with email/location immediately beside phone/joined) */}
              <div className="grid grid-cols-1 sm:grid-cols-[auto_auto] gap-x-6 gap-y-2 pt-2 text-sm max-w-fit">
                {/* Left Column: Phone */}
                <div className="flex items-center gap-2 text-slate-600 shrink-0">
                  <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>{user.phone || "—"}</span>
                </div>
                {/* Right Column: Email */}
                <div className="flex items-center gap-2 text-slate-700 font-medium min-w-0">
                  <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="truncate">{user.email || "—"}</span>
                </div>
                {/* Left Column: Joined Date */}
                <div className="flex items-center gap-2 text-slate-600 shrink-0">
                  <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>Joined {formatDate(user.joinedDate)}</span>
                </div>
                {/* Right Column: Location */}
                <div className="flex items-center gap-2 text-slate-600 min-w-0">
                  <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="truncate">{user.location || "—"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Quick Action Buttons (Clean, Zero Clutter) */}
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            {user.role === "pro" && user.status === "pending_clearance" ? (
              <Button
                size="sm"
                variant="primary"
                onClick={handleApprovePro}
                disabled={isBusy}
                className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 h-8 shadow-xs cursor-pointer"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Approve Pro</span>
              </Button>
            ) : user.status === "banned" ? (
              <Button
                size="sm"
                variant="primary"
                onClick={handleUnban}
                disabled={isBusy}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 h-8 cursor-pointer"
              >
                <UserCheck className="h-3.5 w-3.5" />
                <span>Reinstate Account</span>
              </Button>
            ) : (
              <Button
                size="sm"
                variant="danger"
                disabled={isBusy}
                onClick={() => setIsBanModalOpen(true)}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 h-8 cursor-pointer"
              >
                <Ban className="h-3.5 w-3.5" />
                <span>Ban Account</span>
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              disabled={isBusy}
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 h-8 text-rose-600 border-rose-200 hover:bg-rose-50 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* ACTIVE USER KEY PERFORMANCE METRIC BAR (Clean 4-Column SaaS Metric Strip) */}
      {!isNewOrPending && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Metric 1: Lifetime Volume */}
          <Card
            onClick={() => setActiveTab("orders")}
            className="p-4 bg-white border border-line flex items-center gap-3.5 shadow-2xs cursor-pointer hover:border-blue-300 transition-all"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
              <Briefcase className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                {user.role === "pro" ? "Lifetime Jobs" : "Total Orders"}
              </span>
              <span className="text-xl font-extrabold text-slate-900 tracking-tight block mt-0.5">
                {statValue(
                  ["lifetime_jobs", "total_orders"],
                  userOrders.length
                )}
              </span>
            </div>
          </Card>

          {/* Metric 2: Completed Orders */}
          <Card
            onClick={() => setActiveTab("orders")}
            className="p-4 bg-white border border-line flex items-center gap-3.5 shadow-2xs cursor-pointer hover:border-emerald-300 transition-all"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Completed
              </span>
              <span className="text-xl font-extrabold text-emerald-600 tracking-tight block mt-0.5">
                {statValue(
                  ["completed"],
                  userOrders.filter((o) => o.status === "completed").length
                )}
              </span>
            </div>
          </Card>

          {/* Metric 3: Disputes */}
          <Card
            onClick={() => setActiveTab("orders")}
            className="p-4 bg-white border border-line flex items-center gap-3.5 shadow-2xs cursor-pointer hover:border-rose-300 transition-all"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-rose-50 text-rose-600 shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Disputes &amp; Claims
              </span>
              <span className="text-xl font-extrabold text-rose-600 tracking-tight block mt-0.5">
                {statValue(
                  ["disputes_and_claims"],
                  userOrders.filter((o) => o.status === "disputed").length
                )}
              </span>
            </div>
          </Card>

          {/* Metric 4: Marketplace Rating / Account Status */}
          <Card
            onClick={() => user.role === "pro" && setActiveTab("reviews")}
            className={`p-4 bg-white border border-line flex items-center gap-3.5 shadow-2xs ${
              user.role === "pro" ? "cursor-pointer hover:border-amber-300 transition-all" : ""
            }`}
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600 shrink-0">
              <Star className="h-5 w-5 fill-amber-400 text-amber-500" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                {user.role === "pro" ? "Customer Rating" : "Account Status"}
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {user.role === "pro"
                    ? getReputation().score
                    : statValue(["account_status"], user.status === "banned" ? "Banned" : "Active")}
                </span>
                {user.role === "pro" && (
                  <span className="text-xs text-slate-500 font-medium">
                    ({getReputation().totalReviews} reviews)
                  </span>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      

      {/* Navigation Tabs - ONLY for established active accounts (Pending applicants have NO dummy tabs) */}
      {!isNewOrPending && (
        <div className="flex items-center gap-2 border-b border-line pb-2">
          {user.role === "pro" && (
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === "profile"
                  ? "bg-primary text-white shadow-xs"
                  : "text-muted hover:bg-slate-100 hover:text-title"
              }`}
            >
              <UserIcon className="h-3.5 w-3.5" />
              <span>Profile &amp; Operational Details</span>
            </button>
          )}

          {user.role === "pro" && (
            <button
              onClick={() => setActiveTab("gallery")}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === "gallery"
                  ? "bg-primary text-white shadow-xs"
                  : "text-muted hover:bg-slate-100 hover:text-title"
              }`}
            >
              <ImageIcon className="h-3.5 w-3.5" />
              <span>Project Gallery ({details.galleryCount || activeProjects.length})</span>
            </button>
          )}

          {user.role === "pro" && proClearance && (
            <button
              onClick={() => setActiveTab("compliance")}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === "compliance"
                  ? "bg-primary text-white shadow-xs"
                  : "text-muted hover:bg-slate-100 hover:text-title"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
              <span>Compliance Audit</span>
            </button>
          )}

          {user.role === "pro" && (
            <button
              onClick={() => setActiveTab("reviews")}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === "reviews"
                  ? "bg-primary text-white shadow-xs"
                  : "text-muted hover:bg-slate-100 hover:text-title"
              }`}
            >
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
              <span>Reviews &amp; Ratings ({displayReviews.length})</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === "orders"
                ? "bg-primary text-white shadow-xs"
                : "text-muted hover:bg-slate-100 hover:text-title"
            }`}
          >
            <Briefcase className="h-3.5 w-3.5" />
            <span>Orders &amp; Jobs ({userOrders.length})</span>
          </button>

          {user.role === "pro" && (
            <button
              onClick={() => setActiveTab("transactions")}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === "transactions"
                  ? "bg-primary text-white shadow-xs"
                  : "text-muted hover:bg-slate-100 hover:text-title"
              }`}
            >
              <DollarSign className="h-3.5 w-3.5" />
              <span>Financial Records ({userTransactions.length})</span>
            </button>
          )}
        </div>
      )}

      {/* PENDING APPLICANT REVIEW VIEW - 4 CORE SCREENING PILLARS */}
      {isNewOrPending ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          {/* Card 1: Compliance & Verification Audit (2 Columns Wide) - Clutter-Free Standard SaaS Layout */}
          <Card className="p-5 lg:col-span-2 space-y-4 bg-white">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line/70 pb-3">
              <div>
                <h2 className="text-sm font-semibold text-title">
                  Compliance &amp; Verification Audit
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  Official verification credentials and background screening submitted for marketplace clearance.
                </p>
              </div>
              <Badge variant={proClearance?.clearanceLevel === "cleared" ? "success" : "warning"} dot>
                {proClearance?.clearanceLevel === "cleared" ? "Cleared" : "Pending Audit"}
              </Badge>
            </div>

            {/* Structured Audit Details (Clean Dividers, No Nested Gray Boxes) */}
            <div className="divide-y divide-line/60 text-xs">
              {/* Row 1: State Trade License & General Liability Insurance in 2 clean columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
                {/* State Trade License */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
                      <Award className="h-3.5 w-3.5 text-blue-600" />
                      State Trade License
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                      proClearance?.licenseStatus === "verified"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      {proClearance?.licenseStatus === "verified" ? "Verified Active" : "Pending Match"}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {proClearance?.licenseNumber || "TX-TACLA-001928C"}
                    </span>
                    <span className="text-[11px] text-muted">
                      Authority: <span className="font-medium text-slate-700">{proClearance?.licenseState || "Texas (TDLR)"}</span>
                    </span>
                  </div>
                  {proClearance?.licenseDocumentUrl && (
                    <a
                      href={proClearance.licenseDocumentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline pt-0.5"
                    >
                      <span>View License Certificate PDF</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>

                {/* Liability Insurance */}
                <div className="space-y-1.5 border-t md:border-t-0 md:border-l md:border-line/60 pt-3 md:pt-0 md:pl-6">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      Liability Insurance
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                      proClearance?.insuranceStatus === "verified"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      {proClearance?.insuranceStatus === "verified" ? "Policy Verified" : "Pending COI Review"}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {proClearance?.insurancePolicyNumber || "NEXT-INS-99210"}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-700">
                      {proClearance?.insuranceCoverageAmount || "$1,000,000 General Liability"}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted">
                    Coverage: Commercial Property &amp; Bodily Injury
                  </p>
                </div>
              </div>

              {/* Row 2: Criminal Background Check (Checkr) - Full-Width Standard Row */}
              <div className="py-4 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-indigo-600 shrink-0" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                      Criminal Background Check (Checkr National Screening)
                    </span>
                  </div>
                  <div>
                    {proClearance?.checkrStatus === "clear" ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Screening Passed (Clear)</span>
                      </span>
                    ) : proClearance?.checkrStatus === "consider" ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                        <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                        <span>Record Flagged (Action Required)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="h-3.5 w-3.5 text-amber-600" />
                        <span>Checkr In Progress</span>
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  SSN trace, national criminal database, sex offender registry, and county court search.
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] pt-0.5">
                  <span className="text-slate-600">
                    {proClearance?.checkrStatus === "clear"
                      ? "✓ Candidate passed all federal, state, and county background screening checks with 0 records."
                      : proClearance?.checkrStatus === "consider"
                      ? "⚠ Checkr flagged a record during county court search. Compliance review required before clearance approval."
                      : "⏳ Background screening invite dispatched to candidate email. Waiting for candidate submission & report completion."}
                  </span>
                  {proClearance?.checkrReportUrl && (
                    <a
                      href={proClearance.checkrReportUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-primary hover:underline shrink-0"
                    >
                      <span>Open Checkr Report</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Row 3: Registry Verification Note (Clean inline note, subtle) */}
              {proClearance?.decisionNotes && (
                <div className="py-3 flex items-start gap-2.5 text-xs text-blue-900 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
                  <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-semibold text-blue-900 text-xs block">Registry Verification Log</span>
                    <p className="text-[11px] text-blue-800 mt-0.5 leading-relaxed">
                      {proClearance.decisionNotes}
                    </p>
                  </div>
                </div>
              )}

              {/* Row 4: Clean Business Territory Metadata (3 Columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3.5 text-xs">
                <div>
                  <span className="text-[11px] font-medium text-muted block">
                    Registered Business
                  </span>
                  <span className="font-semibold text-slate-800 block mt-0.5 truncate">
                    {proClearance?.businessName || `${user.name} Services LLC`}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-muted block">
                    Trade Specialty
                  </span>
                  <span className="font-semibold text-slate-800 block mt-0.5 truncate">
                    {proClearance?.trade || "HVAC & Mechanical"}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-muted block">
                    Service Territory
                  </span>
                  <span className="font-semibold text-slate-800 block mt-0.5 truncate">
                    {user.location || "Round Rock, TX 78664"} (&lt;25 mi radius)
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Card 2: Onboarding Pipeline Review (1 Column Wide) - No artificial gap! */}
          <Card className="p-5 space-y-4 bg-white">
            <h2 className="text-sm font-semibold text-slate-900">
              Onboarding Pipeline
            </h2>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900">
              <Clock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-xs">Clearance Under Review</span>
                <span className="text-xs text-amber-700 block mt-0.5 leading-normal">
                  Marketplace profile and job dispatches remain locked until compliance verification is cleared.
                </span>
              </div>
            </div>

            <div className="space-y-2.5 pt-3 text-xs border-t border-line/60">
              <div className="flex items-center justify-between py-1.5 border-b border-line/50">
                <span className="text-slate-500 font-medium">Identity &amp; Profile:</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Submitted
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-line/50">
                <span className="text-slate-500 font-medium">State Trade License:</span>
                <span className={`font-semibold flex items-center gap-1.5 ${
                  proClearance?.licenseStatus === "verified" ? "text-emerald-600" : "text-amber-600"
                }`}>
                  {proClearance?.licenseStatus === "verified" ? (
                    <><CheckCircle2 className="h-3.5 w-3.5" /> Verified</>
                  ) : (
                    <><Clock className="h-3.5 w-3.5" /> Under Review</>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-line/50">
                <span className="text-slate-500 font-medium">Liability Insurance:</span>
                <span className={`font-semibold flex items-center gap-1.5 ${
                  proClearance?.insuranceStatus === "verified" ? "text-emerald-600" : "text-amber-600"
                }`}>
                  {proClearance?.insuranceStatus === "verified" ? (
                    <><CheckCircle2 className="h-3.5 w-3.5" /> Verified</>
                  ) : (
                    <><Clock className="h-3.5 w-3.5" /> Under Review</>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-line/50">
                <span className="text-slate-500 font-medium">Background Check:</span>
                <span className={`font-semibold flex items-center gap-1.5 ${
                  proClearance?.checkrStatus === "clear"
                    ? "text-emerald-600"
                    : proClearance?.checkrStatus === "consider"
                    ? "text-rose-600"
                    : "text-amber-600"
                }`}>
                  {proClearance?.checkrStatus === "clear" ? (
                    <><CheckCircle2 className="h-3.5 w-3.5" /> Passed</>
                  ) : proClearance?.checkrStatus === "consider" ? (
                    <><AlertTriangle className="h-3.5 w-3.5" /> Flagged</>
                  ) : (
                    <><Clock className="h-3.5 w-3.5" /> In Progress</>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500 font-medium">Marketplace Listings:</span>
                <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" /> Locked
                </span>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        /* ACTIVE USER DASHBOARD (Tabs: Profile, Orders, Financials) */
        <>
          {activeTab === "profile" && (
            <div className="space-y-4">
              {/* Row 1: About & Overview (2 cols) + Business Hours (1 col) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
                {/* Card 1: About & Contractor Highlights */}
                <Card className="p-5 lg:col-span-2 space-y-4 bg-white border border-line">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between border-b border-line/70 pb-2.5">
                      <div>
                        <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                          About &amp; Trade Overview
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Professional background, experience summary, and contractor credentials.
                        </p>
                      </div>
                      <Badge variant="success" dot>
                        Verified Pro
                      </Badge>
                    </div>
                    <p className="text-[14px] leading-relaxed text-slate-600 pt-1">
                      {getBio()}
                    </p>
                  </div>

                  {/* Contractor Highlights (Professional Credentials & Trust Pillars - Zero Metric Duplication) */}
                  <div className="pt-3.5 border-t border-line/60 space-y-2.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
                      Contractor Credentials &amp; Highlights
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-xs">
                      {/* Trade Experience */}
                      <div className="flex items-start gap-2.5">
                        <Award className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {getExperience()}
                          </p>
                          <p className="text-[11px] text-muted">
                            {profile?.availability || "Field expertise on record"}
                          </p>
                        </div>
                      </div>

                      {/* Verified & Licensed */}
                      <div className="flex items-start gap-2.5">
                        <ShieldCheck className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                            State Certified &amp; Licensed
                            {proClearance?.licenseStatus === "verified" && (
                              <Check className="h-3.5 w-3.5 text-emerald-600 stroke-[2.5]" />
                            )}
                          </p>
                          <p className="text-[11px] text-muted">
                            {proClearance?.licenseNumber
                              ? `Lic #${proClearance.licenseNumber}${
                                  proClearance.licenseState
                                    ? ` · ${proClearance.licenseState}`
                                    : ""
                                }`
                              : "License not uploaded"}
                          </p>
                        </div>
                      </div>

                      {/* Commercial Insurance */}
                      <div className="flex items-start gap-2.5">
                        <Shield className="h-4 w-4 text-indigo-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {proClearance?.insuranceCoverageAmount
                              ? `${proClearance.insuranceCoverageAmount} Liability Policy`
                              : "Liability insurance"}
                          </p>
                          <p className="text-[11px] text-muted">
                            {proClearance?.insuranceStatus
                              ? `Status: ${proClearance.insuranceStatus}`
                              : "Insurance details not on file"}
                          </p>
                        </div>
                      </div>

                      {/* Background Check */}
                      <div className="flex items-start gap-2.5">
                        <BadgeCheck className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                            Checkr Screening
                            {proClearance?.checkrStatus === "clear" && (
                              <Check className="h-3.5 w-3.5 text-emerald-600 stroke-[2.5]" />
                            )}
                          </p>
                          <p className="text-[11px] text-muted">
                            {proClearance?.checkrStatus
                              ? `Status: ${proClearance.checkrStatus}`
                              : "Not started"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Clean Business Metadata Strip */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3.5 border-t border-line/70 text-xs">
                    <div>
                      <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                        Trade Specialty
                      </span>
                      <span className="text-sm font-semibold text-slate-800 block mt-0.5 truncate">
                        {profile?.tradeSpecialty ||
                          proClearance?.trade ||
                          "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                        Service Territory
                      </span>
                      <span className="text-sm font-semibold text-slate-800 block mt-0.5 truncate">
                        {profile?.serviceTerritory ||
                          user.location ||
                          "Service area not set"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                        Membership Plan
                      </span>
                      <span className="text-sm font-semibold text-slate-800 block mt-0.5 truncate">
                        {profile?.membershipPlan ||
                          user.subscriptionPlan?.split(" (")[0] ||
                          "—"}
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Card 2: Business Hours & Operational Schedule */}
                <Card className="p-5 lg:col-span-1 space-y-4 bg-white border border-line">
                  <div className="flex items-center justify-between border-b border-line pb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      Business Hours
                    </h3>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Open today
                    </span>
                  </div>

                  {/* Weekly Schedule Rows */}
                  <div className="space-y-0 text-xs">
                    <div className="flex justify-between gap-3 border-b border-line/30 py-2">
                      <span className="text-slate-500 font-medium">Monday – Friday</span>
                      <span className="font-semibold text-slate-900">8:00 AM – 6:00 PM</span>
                    </div>
                    <div className="flex justify-between gap-3 border-b border-line/30 py-2">
                      <span className="text-slate-500 font-medium">Saturday</span>
                      <span className="font-semibold text-slate-900">9:00 AM – 2:00 PM</span>
                    </div>
                    <div className="flex justify-between gap-3 py-2">
                      <span className="text-slate-500 font-medium">Sunday</span>
                      <span className="font-medium text-slate-400">Closed (Emergency Only)</span>
                    </div>
                  </div>

                  {/* Operational Notes */}
                  <div className="pt-3 border-t border-line/60 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Response Speed:</span>
                      <span className="font-semibold text-emerald-700">Under 15 mins</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Availability:</span>
                      <span className="font-semibold text-slate-800">Available this week</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Dispatch Status:</span>
                      <span className="font-semibold text-blue-600">Accepting Leads</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* TAB: PROJECT GALLERY / PORTFOLIO SHOWCASE */}
          {activeTab === "gallery" && user.role === "pro" && (
            <div className="space-y-4">
              <Card className="p-5 bg-white border border-line shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4 mb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-primary" />
                      <span>Contractor Project Portfolio &amp; Work Documentation</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Verified photographic evidence of completed home repair, replacement, and installation projects.
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 text-xs font-semibold self-start sm:self-auto">
                    {activeProjects.length} Verified Projects
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeProjects.map((project, idx) => (
                    <div
                      key={idx}
                      className="group overflow-hidden rounded-2xl border border-line bg-white shadow-xs hover:shadow-md transition-shadow"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                        <img
                          src={project.img}
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute top-2.5 left-2.5">
                          <span className="rounded-md bg-slate-900/80 backdrop-blur-xs text-amber-300 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                            {project.tag}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 space-y-2">
                        <h3 className="text-sm font-bold text-slate-900 leading-snug">
                          {project.title}
                        </h3>
                        <div className="flex items-center justify-between pt-2 border-t border-line/60 text-xs text-muted">
                          <span>Specialty: {proClearance?.trade || "General"}</span>
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <Check className="h-3 w-3" /> Verified Work
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* TAB: COMPLIANCE AUDIT CREDENTIALS */}
          {activeTab === "compliance" && user.role === "pro" && proClearance && (
            <div className="space-y-4">
              {/* Contractor Verification & Compliance Credentials Card */}
      {user.role === "pro" && proClearance && (
        <Card className="p-0 border border-line bg-white overflow-hidden shadow-xs">
          {/* Header strip */}
          <div className="px-5 py-3.5 bg-slate-50/80 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Compliance Audit
              </span>
              <Badge
                variant={
                  proClearance.clearanceLevel === "cleared"
                    ? "success"
                    : proClearance.clearanceLevel === "rejected"
                    ? "error"
                    : "warning"
                }
                dot
              >
                {proClearance.clearanceLevel === "cleared"
                  ? "Cleared & Active"
                  : proClearance.clearanceLevel === "rejected"
                  ? "Application Rejected"
                  : "Pending Audit"}
              </Badge>
              <span className="text-xs text-slate-500">
                • Submitted {formatDate(proClearance.submittedAt)} • Specialty: <strong className="text-slate-800 font-semibold">{proClearance.trade}</strong>
              </span>
            </div>

            {/* Compliance Quick Actions - ONLY visible for applicants pending audit (NOT for already cleared users!) */}
            {(proClearance.clearanceLevel === "pending" || proClearance.clearanceLevel === "action_required") && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleApprovePro}
                  disabled={isBusy}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 text-xs px-3 py-1.5 h-8 shadow-xs"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Approve</span>
                </Button>
              </div>
            )}
          </div>

          {/* Compliance Details Table - Clean & Compact */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-line/70 bg-slate-50/70 text-xs font-semibold text-muted uppercase tracking-wider">
                  <th className="py-2.5 px-5 whitespace-nowrap">Audit Credential</th>
                  <th className="py-2.5 px-4 whitespace-nowrap">Identifier / Policy</th>
                  <th className="py-2.5 px-4 whitespace-nowrap">Issuer / Details</th>
                  <th className="py-2.5 px-4 whitespace-nowrap">Audit Status</th>
                  <th className="py-2.5 px-5 text-right whitespace-nowrap">Document</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {/* 1. State Trade License */}
                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-5 font-semibold text-slate-900 whitespace-nowrap">
                    State Trade License
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                    {proClearance.licenseNumber}
                  </td>
                  <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                    {proClearance.licenseState} TDLR
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <Badge
                      variant={proClearance.licenseStatus === "verified" ? "success" : "warning"}
                      dot
                    >
                      {proClearance.licenseStatus === "verified" ? "Verified Active" : "Pending Verification"}
                    </Badge>
                  </td>
                  <td className="py-3 px-5 text-right whitespace-nowrap">
                    {proClearance.licenseDocumentUrl ? (
                      <a
                        href={proClearance.licenseDocumentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-semibold"
                      >
                        <span>View Doc</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                </tr>

                {/* 2. General Liability Insurance */}
                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-5 font-semibold text-slate-900 whitespace-nowrap">
                    General Liability Insurance
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                    {proClearance.insuranceCoverageAmount}
                  </td>
                  <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                    Policy #{proClearance.insurancePolicyNumber}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <Badge
                      variant={proClearance.insuranceStatus === "verified" ? "success" : "warning"}
                      dot
                    >
                      {proClearance.insuranceStatus === "verified" ? "Policy Verified" : "Pending Certificate"}
                    </Badge>
                  </td>
                  <td className="py-3 px-5 text-right whitespace-nowrap text-slate-400">
                    —
                  </td>
                </tr>

                {/* 3. Checkr Criminal Screening */}
                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-5 font-semibold text-slate-900 whitespace-nowrap">
                    Checkr Criminal Screening
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                    {proClearance.checkrStatus === "clear"
                      ? "Clean Record"
                      : proClearance.checkrStatus === "consider"
                      ? "Flagged for Review"
                      : "Pending Verification"}
                  </td>
                  <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                    Ref #{proClearance.id.toUpperCase()}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <Badge
                      variant={
                        proClearance.checkrStatus === "clear"
                          ? "success"
                          : proClearance.checkrStatus === "consider"
                          ? "error"
                          : "warning"
                      }
                      dot
                    >
                      {proClearance.checkrStatus === "clear"
                        ? "Passed"
                        : proClearance.checkrStatus === "consider"
                        ? "Action Required"
                        : "In Progress"}
                    </Badge>
                  </td>
                  <td className="py-3 px-5 text-right whitespace-nowrap">
                    {proClearance.checkrReportUrl ? (
                      <a
                        href={proClearance.checkrReportUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-semibold"
                      >
                        <span>Checkr Report</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}
            </div>
          )}

          
          {/* TAB 1: USER ORDERS */}
          {activeTab === "orders" && (
            <Card className="p-0 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-line/70 bg-slate-50/70 text-[11px] font-semibold text-muted uppercase tracking-wider">
                      <th className="py-2.5 px-4 whitespace-nowrap">Job ID</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Service</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Amount</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Status</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Date</th>
                      <th className="py-2.5 px-4 text-right whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/60">
                    {userOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-xs text-muted whitespace-nowrap">
                          No orders found for this user account.
                        </td>
                      </tr>
                    ) : (
                      userOrders.map((order) => (
                        <tr
                          key={order.id || order.jobId}
                          onClick={() => order.id && navigate(`/orders/${order.id}`)}
                          className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                        >
                          <td className="py-2.5 px-4 text-xs font-semibold text-primary font-mono whitespace-nowrap group-hover:underline">
                            {order.id ? (
                              <Link
                                to={`/orders/${order.id}`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {order.jobId}
                              </Link>
                            ) : (
                              order.jobId
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-title whitespace-nowrap">
                            <span className="truncate max-w-[240px] block group-hover:text-primary transition-colors" title={order.service}>
                              {order.service}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-title whitespace-nowrap">
                            {formatCurrency(order.amount)}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className="inline-block whitespace-nowrap">
                              <Badge
                                variant={
                                  order.status === "completed"
                                    ? "success"
                                    : order.status === "in_progress"
                                    ? "info"
                                    : order.status === "disputed"
                                    ? "error"
                                    : "warning"
                                }
                                dot
                              >
                                {order.status.replace(/_/g, " ")}
                              </Badge>
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-xs text-muted whitespace-nowrap">
                            <span className="whitespace-nowrap font-medium text-slate-600">
                              {formatDate(order.rawDate || order.date)}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            {order.id ? (
                              <Link
                                to={`/orders/${order.id}`}
                                className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                <span>View Order</span>
                              </Link>
                            ) : (
                              <span className="text-xs text-muted">—</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* TAB 2: USER TRANSACTIONS */}
          {activeTab === "transactions" && (
            <Card className="p-0 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-line/70 bg-slate-50/70 text-[11px] font-semibold text-muted uppercase tracking-wider">
                      <th className="py-2.5 px-4 whitespace-nowrap">Transaction ID</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Description</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Amount</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Status</th>
                      <th className="py-2.5 px-4 whitespace-nowrap">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/60">
                    {userTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-xs text-muted whitespace-nowrap">
                          No financial transactions recorded for this account.
                        </td>
                      </tr>
                    ) : (
                      userTransactions.map((tx) => (
                        <tr key={tx.id || tx.transactionId} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2.5 px-4 text-xs font-semibold text-primary whitespace-nowrap">
                            {tx.transactionId}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-title whitespace-nowrap">
                            <span className="truncate max-w-[240px] block" title={tx.description}>
                              {tx.description}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-title whitespace-nowrap">
                            {formatCurrency(tx.amount)}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className="inline-block whitespace-nowrap">
                              <Badge
                                variant={
                                  tx.status === "settled"
                                    ? "success"
                                    : tx.status === "refunded"
                                    ? "error"
                                    : "neutral"
                                }
                                dot
                              >
                                {tx.status.replace(/_/g, " ")}
                              </Badge>
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-xs text-muted whitespace-nowrap">
                            <span className="whitespace-nowrap font-medium text-slate-600">
                              {formatDate(tx.rawDate || tx.date)}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* TAB 3: PRO CUSTOMER REVIEWS & RATINGS */}
          {activeTab === "reviews" && (
            <div className="space-y-4">
              {/* Rating Summary & Reputation Header (Single Source of Truth for Reviews & Ratings) */}
              {(() => {
                const rep = getReputation();
                return (
                  <Card className="p-5 bg-white border border-line shadow-xs">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      {/* Left: Overall Score & Recommendation Pillar */}
                      <div className="flex items-center gap-4">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 shadow-2xs">
                          <div className="text-center">
                            <span className="text-3xl font-black block leading-none">{rep.score}</span>
                            <span className="text-[10px] font-bold block mt-1 tracking-wider text-amber-700">OUT OF 5</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-bold text-slate-900">
                              {user.name}’s Verified Customer Reviews
                            </h3>
                            <Badge variant="success" className="text-[10px] font-medium">
                              100% Direct Service Verified
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= Math.round(Number(rep.score))
                                      ? "text-amber-400 fill-amber-400"
                                      : "text-slate-200"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs font-semibold text-slate-700">
                              {rep.score} · Based on {rep.totalReviews} homeowner evaluations
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Star Breakdown Distribution Bars */}
                      <div className="w-full lg:w-72 space-y-1.5 text-xs lg:border-l lg:border-slate-100 lg:pl-6">
                        <div className="flex items-center gap-2">
                          <span className="w-12 text-[11px] text-slate-500 font-medium">5 stars</span>
                          <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: rep.fiveStarPct }} />
                          </div>
                          <span className="text-[11px] text-slate-700 w-8 text-right font-semibold">{rep.fiveStarPct}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-12 text-[11px] text-slate-500 font-medium">4 stars</span>
                          <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: rep.fourStarPct }} />
                          </div>
                          <span className="text-[11px] text-slate-700 w-8 text-right font-semibold">{rep.fourStarPct}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-12 text-[11px] text-slate-500 font-medium">&lt; 3 stars</span>
                          <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: rep.lowStarPct }} />
                          </div>
                          <span className="text-[11px] text-slate-700 w-8 text-right font-semibold">{rep.lowStarPct}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })()}

              {/* Reviews List */}
              {displayReviews.length === 0 ? (
                <Card className="p-12 text-center text-muted bg-white border-line">
                  <Star className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-title">No customer reviews yet</p>
                  <p className="text-xs mt-1">
                    This pro has not yet received verified reviews from completed platform jobs.
                  </p>
                </Card>
              ) : apiReviews.length > 0 ? (
                <div className="space-y-3">
                  {apiReviews.map((rev) => (
                    <Card
                      key={rev.id}
                      className="p-5 bg-white border border-slate-200/90 rounded-xl shadow-2xs"
                    >
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pb-2.5 border-b border-slate-100">
                          <div>
                            <span className="font-semibold text-xs text-slate-900">
                              {rev.reviewerName}
                            </span>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Job: {rev.jobTitle}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            <span className="font-bold text-slate-900">{rev.rating}.0</span>
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`h-3.5 w-3.5 ${
                                    s <= rev.rating
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-slate-200"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        {rev.feedback && (
                          <p className="text-xs text-slate-700 leading-relaxed">{rev.feedback}</p>
                        )}
                        {rev.reply && (
                          <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                            <p className="text-[11px] font-semibold text-slate-600 mb-1">
                              Pro response
                            </p>
                            <p className="text-xs text-slate-700">{rev.reply}</p>
                          </div>
                        )}
                        <p className="text-[11px] text-muted">
                          Submitted {formatDate(rev.createdAt)}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {proReviews.map((rev) => {
                    const isFlagged = rev.status === "flagged" || rev.status === "pending_moderation";
                    const isHidden = rev.status === "hidden";

                    return (
                      <Card
                        key={rev.id}
                        className={`p-5 bg-white border rounded-xl shadow-2xs transition-all ${
                          isFlagged
                            ? "border-l-4 border-l-rose-500 border-slate-200"
                            : isHidden
                            ? "border-slate-200/80 bg-slate-50/40 opacity-70"
                            : "border-slate-200/90"
                        }`}
                      >
                        <div className="space-y-3">
                          {/* Review Top Header: Minimal clean hierarchy */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pb-2.5 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-slate-100 text-slate-600 text-xs font-bold grid place-items-center ring-1 ring-slate-200 shrink-0">
                                {(rev.homeownerName || "?").charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-xs text-slate-900">
                                    {rev.homeownerName}
                                  </span>
                                  {rev.homeownerLocation && (
                                    <span className="text-[11px] text-slate-400">
                                      ({rev.homeownerLocation})
                                    </span>
                                  )}
                                  {rev.verifiedHire && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200/70">
                                      <Check className="h-2.5 w-2.5" />
                                      Verified Hire
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                  Job: {rev.jobTitle}
                                </p>
                              </div>
                            </div>

                            {/* Clean Star Rating & Status Badge */}
                            <div className="flex items-center gap-2.5 shrink-0">
                              <div className="flex items-center gap-1 text-xs">
                                <span className="font-bold text-slate-900">{rev.rating}.0</span>
                                <div className="flex items-center">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                      key={s}
                                      className={`h-3 w-3 ${
                                        s <= rev.rating
                                          ? "text-amber-400 fill-amber-400"
                                          : "text-slate-200"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>

                              <span
                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                                  rev.status === "published"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : rev.status === "flagged"
                                    ? "bg-rose-50 text-rose-700 border-rose-200"
                                    : rev.status === "pending_moderation"
                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : "bg-slate-100 text-slate-600 border-slate-200"
                                }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    rev.status === "published"
                                      ? "bg-emerald-500"
                                      : rev.status === "flagged"
                                      ? "bg-rose-500"
                                      : rev.status === "pending_moderation"
                                      ? "bg-amber-500"
                                      : "bg-slate-400"
                                  }`}
                                />
                                {rev.status === "pending_moderation"
                                  ? "Pending Moderation"
                                  : rev.status.replace("_", " ")}
                              </span>
                            </div>
                          </div>

                          {/* Flag Reason - Subtle Minimal Warning Note */}
                          {rev.flagReason && (
                            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-rose-50/60 border border-rose-200/70 text-xs text-rose-900">
                              <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                              <div className="leading-relaxed">
                                <strong className="font-semibold text-rose-900">Flag Note: </strong>
                                {rev.flagReason}
                              </div>
                            </div>
                          )}

                          {/* Review Body */}
                          <div className="space-y-1">
                            {rev.title && (
                              <h4 className="text-xs font-bold text-slate-900">
                                "{rev.title}"
                              </h4>
                            )}
                            <p className="text-xs text-slate-700 leading-relaxed">
                              {rev.comment}
                            </p>
                          </div>

                          {/* Pro Reply - Minimal Left-Bordered Quote (No Box-in-a-Box Clutter) */}
                          {rev.reply && (
                            <div className="border-l-2 border-primary/50 pl-3.5 py-1 space-y-1 bg-slate-50/50 rounded-r-lg">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-slate-800 flex items-center gap-1.5 text-[11px]">
                                  <MessageCircle className="h-3 w-3 text-primary" />
                                  {rev.reply.proName}’s Response:
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setReviewToReply(rev);
                                    setReplyEditText(rev.reply?.text || "");
                                  }}
                                  className="text-[11px] font-medium text-primary hover:underline cursor-pointer"
                                >
                                  Edit Reply
                                </button>
                              </div>
                              <p className="italic text-slate-600 text-xs leading-relaxed">
                                "{rev.reply.text}"
                              </p>
                            </div>
                          )}

                          {/* Action Bar - Clean Minimal Toolbar */}
                          <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs text-slate-500">
                            <span>Submitted {formatDate(rev.createdAt)}</span>
                            <div className="flex items-center gap-2">
                              {rev.status !== "published" && (
                                <Button
                                  size="sm"
                                  variant="primary"
                                  onClick={() => {
                                    dispatch(approveReview(rev.id));
                                    triggerNotice("Review approved & published.");
                                  }}
                                  className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-2.5 shadow-2xs"
                                >
                                  <Check className="h-3 w-3 mr-1" /> Approve
                                </Button>
                              )}

                              {rev.status !== "hidden" ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setReviewToHide(rev);
                                    setHideReasonText("");
                                  }}
                                  className="h-7 text-xs font-medium px-2.5 text-slate-600 hover:text-slate-900 border-slate-200"
                                >
                                  <EyeOff className="h-3 w-3 mr-1" /> Hide Review
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    dispatch(approveReview(rev.id));
                                    triggerNotice("Review restored.");
                                  }}
                                  className="h-7 text-xs font-medium px-2.5 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                                >
                                  <Check className="h-3 w-3 mr-1" /> Restore
                                </Button>
                              )}

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  if (confirm("Delete this review record?")) {
                                    dispatch(deleteReview(rev.id));
                                    triggerNotice("Review deleted.");
                                  }
                                }}
                                className="h-7 px-2 text-xs text-slate-400 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50"
                                title="Delete review"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Hide Review Modal */}
      {reviewToHide && (
        <Modal
          isOpen={true}
          onClose={() => setReviewToHide(null)}
          title="Moderate / Hide Review"
        >
          <div className="space-y-4 text-xs">
            <p className="text-muted">
              Hiding this review will remove it from <strong>{user.name}</strong>'s public profile on the web.
            </p>
            <div className="space-y-1.5">
              <label className="font-semibold text-title">Reason for Removal</label>
              <textarea
                rows={3}
                value={hideReasonText}
                onChange={(e) => setHideReasonText(e.target.value)}
                placeholder="e.g. Defamatory language, resolved dispute, false claim..."
                className="w-full p-2.5 border border-line rounded-xl focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-line">
              <Button size="sm" variant="ghost" onClick={() => setReviewToHide(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => {
                  dispatch(hideReview({ id: reviewToHide.id, notes: hideReasonText }));
                  triggerNotice("Review hidden.");
                  setReviewToHide(null);
                }}
              >
                Confirm Hide
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Pro Reply Modal */}
      {reviewToReply && (
        <Modal
          isOpen={true}
          onClose={() => setReviewToReply(null)}
          title="Moderate Contractor Response"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl text-slate-700">
              <span className="font-bold text-title">Homeowner Comment: </span>
              <p className="mt-1 italic">"{reviewToReply.comment}"</p>
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-title">Contractor Response</label>
              <textarea
                rows={4}
                value={replyEditText}
                onChange={(e) => setReplyEditText(e.target.value)}
                className="w-full p-2.5 border border-line rounded-xl focus:outline-none"
              />
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-line">
              <Button
                size="sm"
                variant="danger"
                onClick={() => {
                  dispatch(deleteProReply(reviewToReply.id));
                  triggerNotice("Contractor reply deleted.");
                  setReviewToReply(null);
                }}
              >
                Delete Reply
              </Button>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => setReviewToReply(null)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    dispatch(moderateProReply({ id: reviewToReply.id, text: replyEditText, approve: true }));
                    triggerNotice("Contractor reply saved & approved.");
                    setReviewToReply(null);
                  }}
                >
                  Save & Approve
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Ban Reason Modal */}
      {isBanModalOpen && (
        <Modal
          isOpen={isBanModalOpen}
          onClose={() => setIsBanModalOpen(false)}
          title={`Suspend Account: ${user.name}`}
          description="Enter a clear reason for administrative suspension. The user will be notified upon login."
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button size="sm" variant="outline" onClick={() => setIsBanModalOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={handleConfirmBan}
                disabled={isBusy}
              >
                Confirm Ban
              </Button>
            </div>
          }
        >
          <form onSubmit={handleConfirmBan} className="space-y-3 pt-1">
            <textarea
              rows={4}
              placeholder="e.g. Terms violation, dispute non-cooperation, or invalid credentials..."
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              className="w-full rounded-xl border border-line p-3 text-xs text-title placeholder:text-muted outline-none focus:border-rose-500"
              required
            />
          </form>
        </Modal>
      )}

      {/* Delete User Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={`Delete Account: ${user.name}`}
        description="This permanently removes the account and cannot be undone."
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button size="sm" variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="danger" onClick={handleConfirmDelete} disabled={isBusy}>
              Delete User
            </Button>
          </div>
        }
      >
        <p className="text-xs text-muted leading-relaxed">
          Are you sure you want to delete <strong>{user.name}</strong> ({user.email})?
        </p>
      </Modal>
    </div>
  );
};

export default UserDetailsPage;
