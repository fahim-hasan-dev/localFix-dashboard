import React, { useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Check,
  Percent,
  Briefcase,
  MessageSquare,
  Zap,
  Search,
  Award,
  PhoneCall,
  TrendingUp,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  useCreatePackageMutation,
  useDeletePackageMutation,
  useGetPackagesQuery,
  useUpdatePackageMutation,
  type PackageFormInput,
} from "@/api/subscriptions.api";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import { SubscriptionPackage } from "@/types/common.types";
import { formatCurrency } from "@/lib/utils";

// Select appropriate contextual icon for contractor benefits
const getBenefitIcon = (text: string) => {
  const lower = text.toLowerCase();
  if (lower.includes("100%") || lower.includes("earning") || lower.includes("job cut")) {
    return <Percent className="w-3.5 h-3.5 text-blue-600" />;
  }
  if (lower.includes("unlimited") || lower.includes("quote") || lower.includes("request")) {
    return <Briefcase className="w-3.5 h-3.5 text-blue-600" />;
  }
  if (lower.includes("badge") || lower.includes("verified")) {
    return <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />;
  }
  if (lower.includes("chat") || lower.includes("direct") || lower.includes("scheduling")) {
    return <MessageSquare className="w-3.5 h-3.5 text-blue-600" />;
  }
  if (lower.includes("bidding") || lower.includes("zero") || lower.includes("fee")) {
    return <Zap className="w-3.5 h-3.5 text-blue-600" />;
  }
  if (lower.includes("monthly features") || lower.includes("included")) {
    return <CheckCircle2 className="w-3.5 h-3.5 text-slate-700" />;
  }
  if (lower.includes("priority search") || lower.includes("search placement")) {
    return <Search className="w-3.5 h-3.5 text-slate-700" />;
  }
  if (lower.includes("featured") || lower.includes("profile")) {
    return <Award className="w-3.5 h-3.5 text-slate-700" />;
  }
  if (lower.includes("support") || lower.includes("phone") || lower.includes("line")) {
    return <PhoneCall className="w-3.5 h-3.5 text-slate-700" />;
  }
  if (lower.includes("analytics") || lower.includes("quarterly") || lower.includes("job request")) {
    return <TrendingUp className="w-3.5 h-3.5 text-slate-700" />;
  }
  return <Check className="w-3.5 h-3.5 text-blue-600" />;
};

export const SubscriptionsPage: React.FC = () => {
  const {
    data: packagesData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetPackagesQuery();
  const [createPackage, { isLoading: isCreating }] = useCreatePackageMutation();
  const [updatePackage, { isLoading: isUpdating }] = useUpdatePackageMutation();
  const [deletePackage, { isLoading: isDeleting }] = useDeletePackageMutation();

  const packages = packagesData?.items ?? [];
  const isSaving = isCreating || isUpdating;

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<SubscriptionPackage | null>(null);

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formInterval, setFormInterval] = useState<"monthly" | "annually">("monthly");
  const [formFeatures, setFormFeatures] = useState("");
  const [formTrial, setFormTrial] = useState("90");
  const [formLeadLimit, setFormLeadLimit] = useState("");
  const [formActive, setFormActive] = useState(true);
  const [formPopular, setFormPopular] = useState(false);
  const [formError, setFormError] = useState("");

  // Delete Confirmation Modal state
  const [deletingPackage, setDeletingPackage] = useState<SubscriptionPackage | null>(null);

  // Page-level mutation notices
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");

  const handleOpenAdd = () => {
    setEditingPackage(null);
    setFormName("");
    setFormDesc("First 3 months completely free. Cancel anytime.");
    setFormPrice("19.99");
    setFormInterval("monthly");
    setFormFeatures(
      "Keep 100% of your earnings ($0 job cut)\nQuote unlimited local homeowner requests\nVerified Pro badge on pro listings\nDirect homeowner chat & scheduling\nZero bidding fees or pay-per-lead costs"
    );
    setFormTrial("90");
    setFormLeadLimit("");
    setFormActive(true);
    setFormPopular(false);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pkg: SubscriptionPackage) => {
    setEditingPackage(pkg);
    setFormName(pkg.name);
    setFormDesc(pkg.description);
    setFormPrice(pkg.price.toString());
    setFormInterval(pkg.billingInterval === "annually" ? "annually" : "monthly");
    setFormFeatures(pkg.features.join("\n"));
    setFormTrial(pkg.trialDays.toString());
    setFormLeadLimit(pkg.leadLimit !== undefined ? pkg.leadLimit.toString() : "");
    setFormActive(pkg.isActive);
    setFormPopular(Boolean(pkg.isPopular));
    setFormError("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSaving) return;
    setIsModalOpen(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formName.trim()) {
      setFormError("Package name is required.");
      return;
    }

    const priceNum = parseFloat(formPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      setFormError("Price must be a valid amount of $0 or more.");
      return;
    }

    const featureList = formFeatures
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);

    if (featureList.length === 0) {
      setFormError("Please provide at least one included benefit.");
      return;
    }

    const trialParsed = parseInt(formTrial, 10);
    const leadLimitParsed = parseInt(formLeadLimit, 10);

    const form: PackageFormInput = {
      name: formName.trim(),
      description: formDesc.trim(),
      price: priceNum,
      billingInterval: formInterval,
      trialDays: isNaN(trialParsed) || trialParsed < 0 ? 0 : trialParsed,
      isPopular: formPopular,
      isActive: formActive,
      features: featureList,
      leadLimit: isNaN(leadLimitParsed) || leadLimitParsed < 0 ? undefined : leadLimitParsed,
    };

    try {
      if (editingPackage) {
        await updatePackage({ id: editingPackage.id, data: form }).unwrap();
        setNotice(`Plan "${form.name}" updated.`);
      } else {
        await createPackage(form).unwrap();
        setNotice(`Plan "${form.name}" created.`);
      }
      setActionError("");
      setIsModalOpen(false);
    } catch (err) {
      setFormError(getApiErrorMessage(err, "Failed to save plan."));
    }
  };

  const handleToggleActive = async (pkg: SubscriptionPackage) => {
    setTogglingId(pkg.id);
    setActionError("");
    try {
      await updatePackage({ id: pkg.id, data: { isActive: !pkg.isActive } }).unwrap();
      setNotice(`Plan "${pkg.name}" ${pkg.isActive ? "disabled" : "activated"}.`);
    } catch (err) {
      setActionError(getApiErrorMessage(err, `Failed to update plan "${pkg.name}".`));
    } finally {
      setTogglingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingPackage) return;
    setActionError("");
    try {
      await deletePackage(deletingPackage.id).unwrap();
      setNotice(`Plan "${deletingPackage.name}" deleted.`);
      setDeletingPackage(null);
    } catch (err) {
      setActionError(getApiErrorMessage(err, `Failed to delete plan "${deletingPackage.name}".`));
      setDeletingPackage(null);
    }
  };

  const handleDeactivateInstead = async () => {
    if (!deletingPackage) return;
    const pkg = deletingPackage;
    setDeletingPackage(null);
    await handleToggleActive(pkg);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pro Subscriptions"
        description="Manage pro membership tiers, 90-day free trial terms, and directory benefits."
        action={
          <Button
            size="sm"
            variant="primary"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 shadow-xs font-semibold cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Package</span>
          </Button>
        }
      />

      {notice && (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800 max-w-4xl">
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

      {actionError && (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700 max-w-4xl">
          <span className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {actionError}
          </span>
          <button
            type="button"
            onClick={() => setActionError("")}
            className="font-semibold hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading / Error / Empty states */}
      {isLoading ? (
        <Card className="max-w-4xl py-12 text-center text-xs text-muted">
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading subscription plans...
          </span>
        </Card>
      ) : isError ? (
        <Card className="max-w-4xl py-12 text-center">
          <div className="inline-flex flex-col items-center gap-3 text-xs text-rose-700">
            <span className="inline-flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {getApiErrorMessage(error, "Failed to load subscription plans.")}
            </span>
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        </Card>
      ) : packages.length === 0 ? (
        <Card className="max-w-4xl py-12 text-center text-xs text-muted">
          <p>No subscription plans yet.</p>
          <Button size="sm" variant="primary" className="mt-3" onClick={handleOpenAdd}>
            <Plus className="h-4 w-4 mr-1" />
            Create your first plan
          </Button>
        </Card>
      ) : (
        /* Subscription Cards Grid */
        <div
          className={`grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${
            isFetching ? "opacity-80" : ""
          }`}
        >
          {packages.map((pkg) => {
            const isPopular = Boolean(pkg.isPopular) || pkg.badge?.toLowerCase().includes("popular");
            const isAnnual = pkg.billingInterval === "annually";
            const monthlyEquivalent = isAnnual
              ? (pkg.price / 12).toFixed(2)
              : pkg.price.toFixed(2);
            const isToggling = togglingId === pkg.id;

            return (
              <div
                key={pkg.id}
                className={`rounded-3xl transition-all duration-200 flex flex-col justify-between p-7 relative bg-white ${
                  isPopular
                    ? "border-2 border-blue-500 shadow-xl shadow-blue-500/10 ring-1 ring-blue-500/20"
                    : "border-2 border-slate-200 hover:border-slate-300 shadow-sm"
                } ${!pkg.isActive ? "opacity-75 bg-slate-50/50" : ""}`}
              >
                <div className="space-y-6">
                  {/* Header: Title, Badge, Subtitle & Admin Status */}
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                            {pkg.name}
                          </h3>
                          {(pkg.badge || isPopular) && (
                            <span
                              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                                isPopular
                                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                                  : "bg-slate-100 text-slate-700 border border-slate-200"
                              }`}
                            >
                              {pkg.badge || "🔥 Popular"}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed font-normal pt-0.5">
                          {pkg.description}
                        </p>
                      </div>

                      {/* Admin Status Pill */}
                      <button
                        type="button"
                        disabled={isToggling}
                        onClick={() => handleToggleActive(pkg)}
                        title={pkg.isActive ? "Click to disable plan" : "Click to activate plan"}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer shrink-0 transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                          pkg.isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100/70"
                            : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200/70"
                        }`}
                      >
                        {isToggling ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              pkg.isActive ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                          />
                        )}
                        {pkg.isActive ? "Active" : "Disabled"}
                      </button>
                    </div>

                    {/* Price Display Matching Public Card */}
                    <div className="pt-4 pb-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold text-slate-950 tracking-tight">
                          {isAnnual ? `$${monthlyEquivalent}` : formatCurrency(pkg.price)}
                        </span>
                        <span className="text-sm font-medium text-slate-500">/per month</span>
                      </div>
                      {isAnnual && (
                        <p className="text-xs font-medium text-slate-500 mt-1">
                          Billed annually ({formatCurrency(pkg.price)}/yr)
                          {pkg.trialDays > 0 ? ` after ${pkg.trialDays}-day trial.` : "."}
                        </p>
                      )}
                    </div>

                    {/* Primary Admin Action */}
                    <div className="pt-3">
                      <Button
                        onClick={() => handleOpenEdit(pkg)}
                        className="w-full py-2.5 px-4 rounded-xl text-center text-xs font-bold transition-all flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit Plan Configuration</span>
                      </Button>
                    </div>
                  </div>

                  <div className="h-px bg-slate-100" />

                  {/* Features List */}
                  <div className="space-y-3">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      Contractor Benefits ({pkg.features.length})
                    </span>
                    <ul className="space-y-2.5">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0 mt-1.5" />
                          <span className="leading-snug font-medium">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Admin Footer: Status & Delete */}
                <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="text-[11px] text-muted">Status:</span>
                    <span
                      className={`font-semibold ${pkg.isActive ? "text-emerald-600" : "text-slate-500"}`}
                    >
                      {pkg.isActive ? "Active in Directory" : "Paused / Inactive"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setDeletingPackage(pkg)}
                    title="Delete Package"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-500 hover:text-rose-600 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Package Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingPackage ? `Edit Plan: ${editingPackage.name}` : "Create Contractor Plan"}
        description="Configure pricing, billing cycle, free trial days, and public directory benefits."
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <Input
            label="Package Name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="e.g. Pro Monthly or Pro Annual"
            required
          />

          <div className="space-y-1">
            <label className="font-semibold text-title block">Short Description</label>
            <textarea
              rows={2}
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              placeholder="e.g. First 3 months completely free. Cancel anytime."
              className="w-full rounded-xl border border-line bg-white p-2.5 text-xs text-title outline-none focus:border-primary focus:ring-1 focus:ring-primary leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Price ($ USD)"
              type="number"
              step="0.01"
              value={formPrice}
              onChange={(e) => setFormPrice(e.target.value)}
              placeholder="19.99"
              required
            />

            <div className="space-y-1">
              <label className="font-semibold text-title block">Billing Cycle</label>
              <select
                value={formInterval}
                onChange={(e) => setFormInterval(e.target.value as "monthly" | "annually")}
                className="w-full rounded-xl border border-line bg-white p-2.5 text-xs text-title outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer font-semibold"
              >
                <option value="monthly">Monthly Recurring</option>
                <option value="annually">Billed Annually</option>
              </select>
            </div>

            <Input
              label="Free Trial Period (Days)"
              type="number"
              value={formTrial}
              onChange={(e) => setFormTrial(e.target.value)}
              placeholder="90"
              required
            />

            <Input
              label="Lead Limit (Optional)"
              type="number"
              value={formLeadLimit}
              onChange={(e) => setFormLeadLimit(e.target.value)}
              placeholder="35"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-title block">
              Entitlements &amp; Benefits (One per line)
            </label>
            <textarea
              rows={5}
              value={formFeatures}
              onChange={(e) => setFormFeatures(e.target.value)}
              placeholder="Keep 100% of your earnings ($0 job cut)&#10;Quote unlimited local homeowner requests&#10;Verified Pro badge on pro listings"
              className="w-full rounded-xl border border-line bg-white p-2.5 text-xs text-title outline-none focus:border-primary focus:ring-1 focus:ring-primary leading-relaxed"
              required
            />
          </div>

          <div className="pt-2 border-t border-line flex flex-wrap items-center gap-x-6 gap-y-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formActive}
                onChange={(e) => setFormActive(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-line cursor-pointer"
              />
              <span className="font-semibold text-title">Active &amp; Visible to Pros</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formPopular}
                onChange={(e) => setFormPopular(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-line cursor-pointer"
              />
              <span className="font-semibold text-title">Mark as Popular</span>
            </label>
          </div>

          <div className="pt-4 border-t border-line flex items-center justify-between">
            {editingPackage ? (
              <Button
                size="sm"
                variant="ghost"
                type="button"
                disabled={isSaving}
                className="text-rose-600 hover:bg-rose-50 text-xs font-semibold cursor-pointer"
                onClick={() => {
                  const pkg = editingPackage;
                  setIsModalOpen(false);
                  setDeletingPackage(pkg);
                }}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                <span>Delete Plan</span>
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                type="button"
                disabled={isSaving}
                onClick={handleCloseModal}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="primary"
                type="submit"
                isLoading={isSaving}
                disabled={isSaving}
                className="font-semibold cursor-pointer"
              >
                {editingPackage ? "Save Plan Changes" : "Create Plan"}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* In-App Delete Confirmation Modal */}
      {deletingPackage && (
        <Modal
          isOpen={!!deletingPackage}
          onClose={() => !isDeleting && setDeletingPackage(null)}
          title={`Delete Plan: ${deletingPackage.name}?`}
          description="Confirm action to remove or deactivate this contractor membership tier."
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-950">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Impact Assessment</span>
              </div>
              <p className="leading-relaxed">
                Plan <strong>"{deletingPackage.name}"</strong> currently has{" "}
                <strong>{deletingPackage.subscriberCount} active pro subscribers</strong>.
              </p>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                • <strong>Deactivate:</strong> Hides the plan from new contractors while preserving
                existing accounts and billing.
                <br />
                • <strong>Delete:</strong> Permanently removes this tier from the system.
              </p>
            </div>

            <div className="pt-4 border-t border-line flex items-center justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingPackage(null)}
              >
                Cancel
              </Button>

              {deletingPackage.isActive && (
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDeactivateInstead}
                  className="border-slate-300 text-slate-700 font-semibold"
                >
                  Deactivate Instead
                </Button>
              )}

              <Button
                size="sm"
                variant="primary"
                type="button"
                isLoading={isDeleting}
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="bg-rose-600 hover:bg-rose-700 text-white font-semibold cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Permanently Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default SubscriptionsPage;
