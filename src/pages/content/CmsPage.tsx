import React, { useEffect, useMemo, useState } from "react";
import { useUrlTab } from "@/hooks/useUrlTab";
import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  Edit2,
  FileText,
  Globe,
  Grid,
  HelpCircle,
  Loader2,
  Megaphone,
  Plus,
  Save,
  Sliders,
  Trash2,
  Upload,
  User,
  X,
} from "lucide-react";
import {
  useCreateBannerMutation,
  useCreateFaqMutation,
  useCreateMarqueeMutation,
  useDeleteFaqMutation,
  useDeleteMarqueeMutation,
  useGetBannersQuery,
  useGetFaqsQuery,
  useGetMarqueesQuery,
  useGetRuleQuery,
  useGetSiteSettingsQuery,
  useSaveRuleMutation,
  useSaveSiteSettingsMutation,
  useUpdateFaqMutation,
  useUpdateMarqueeMutation,
} from "@/api/cms.api";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import CategoriesPage from "@/pages/categories/CategoriesPage";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { FaqItem, MarqueeItem, SliderBanner } from "@/types/common.types";

type TabKey = "hero" | "marquee" | "branding" | "categories" | "faq" | "legal";
type Notify = (type: "success" | "error", message: string) => void;
type RuleType = "terms" | "privacy" | "dispute" | "about";

const VALID_TABS: TabKey[] = [
  "hero",
  "marquee",
  "branding",
  "categories",
  "faq",
  "legal",
];

const textareaClass =
  "w-full rounded-xl border border-line bg-white p-3 text-xs text-title placeholder:text-muted outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 leading-relaxed";

function isNotFound(error: unknown): boolean {
  return (error as { status?: number } | undefined)?.status === 404;
}

const LoadingBlock: React.FC<{ label: string }> = ({ label }) => (
  <Card className="p-10 text-center text-xs text-muted">
    <span className="inline-flex items-center gap-2">
      <Loader2 className="w-4 h-4 animate-spin" />
      {label}
    </span>
  </Card>
);

const ErrorBlock: React.FC<{
  error: unknown;
  fallback: string;
  onRetry?: () => void;
}> = ({ error, fallback, onRetry }) => (
  <Card className="p-6 text-center text-xs border-rose-200 bg-rose-50/40">
    <AlertCircle className="w-6 h-6 text-rose-500 mx-auto mb-2" />
    <p className="text-rose-700 font-semibold">
      {getApiErrorMessage(error, fallback)}
    </p>
    {onRetry && (
      <Button size="sm" variant="outline" className="mt-3" onClick={onRetry}>
        Retry
      </Button>
    )}
  </Card>
);

/** Local image-file picker with preview. */
const ImagePicker: React.FC<{
  label: string;
  currentUrl?: string;
  file: File | null;
  onChange: (file: File | null) => void;
  maxMb?: number;
  onError: (message: string) => void;
}> = ({ label, currentUrl, file, onChange, maxMb = 8, onError }) => {
  const preview = useMemo(
    () => (file ? URL.createObjectURL(file) : currentUrl || ""),
    [file, currentUrl]
  );

  useEffect(() => {
    return () => {
      if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-title">{label}</label>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <label className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-line bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-title cursor-pointer transition-colors shadow-2xs shrink-0">
          <Upload className="w-3.5 h-3.5 text-muted" />
          <span>{file ? "Change file" : "Upload image"}</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const picked = e.target.files?.[0];
              e.target.value = "";
              if (!picked) return;
              if (picked.size > maxMb * 1024 * 1024) {
                onError(`${label} must be under ${maxMb}MB.`);
                return;
              }
              onChange(picked);
            }}
          />
        </label>
        {file && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xs text-rose-600 hover:underline cursor-pointer"
          >
            Discard {file.name}
          </button>
        )}
      </div>
      {preview && (
        <div className="rounded-xl border border-line overflow-hidden bg-slate-100 w-fit max-w-full">
          <img
            src={preview}
            alt={label}
            className="max-h-40 w-auto object-contain"
          />
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* HERO                                                                */
/* ------------------------------------------------------------------ */

const HeroForm: React.FC<{ banner?: SliderBanner; notify: Notify }> = ({
  banner,
  notify,
}) => {
  const [createBanner, { isLoading }] = useCreateBannerMutation();
  const [headline, setHeadline] = useState(banner?.title ?? "");
  const [description, setDescription] = useState(banner?.subtitle ?? "");
  const [image, setImage] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createBanner({
        headline: headline.trim(),
        description: description.trim(),
        image,
      }).unwrap();
      setImage(null);
      notify("success", "Hero banner saved");
    } catch (err) {
      notify("error", getApiErrorMessage(err, "Failed to save hero banner."));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div>
            <h3 className="text-base font-semibold text-title">
              Landing Page Hero Banner
            </h3>
            <p className="text-xs text-muted mt-0.5">
              Headline, description and image shown on the public landing page.
            </p>
          </div>
          <Button
            size="sm"
            variant="primary"
            type="submit"
            isLoading={isLoading}
            className="flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Banner</span>
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-title mb-1.5">
              Headline
            </label>
            <Input
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Find Trusted Local Pros Near You"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-title mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief explanatory text underneath the main title..."
              className={textareaClass}
              required
            />
          </div>
          <div className="pt-2 border-t border-line">
            <ImagePicker
              label="Hero Banner Image"
              currentUrl={banner?.imageUrl}
              file={image}
              onChange={setImage}
              onError={(m) => notify("error", m)}
            />
          </div>
        </div>
      </Card>
    </form>
  );
};

const HeroTab: React.FC<{ notify: Notify }> = ({ notify }) => {
  const { data, isLoading, error, refetch } = useGetBannersQuery();

  if (isLoading) return <LoadingBlock label="Loading hero banner..." />;
  if (error && !isNotFound(error)) {
    return (
      <ErrorBlock
        error={error}
        fallback="Failed to load hero banner."
        onRetry={refetch}
      />
    );
  }

  const banner = data?.[0];
  return (
    <HeroForm
      key={banner ? `${banner.id}-${banner.title}-${banner.subtitle}-${banner.imageUrl}` : "new"}
      banner={banner}
      notify={notify}
    />
  );
};

/* ------------------------------------------------------------------ */
/* MARQUEE                                                             */
/* ------------------------------------------------------------------ */

const MarqueeTab: React.FC<{ notify: Notify }> = ({ notify }) => {
  const { data, isLoading, isFetching, error, refetch } = useGetMarqueesQuery();
  const [createMarquee, { isLoading: isCreating }] = useCreateMarqueeMutation();
  const [updateMarquee, { isLoading: isUpdating }] = useUpdateMarqueeMutation();
  const [deleteMarquee] = useDeleteMarqueeMutation();

  const items: MarqueeItem[] = data?.items ?? [];
  const [newKeyword, setNewKeyword] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editKeyword, setEditKeyword] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const keyword = newKeyword.trim();
    if (!keyword) return;
    try {
      await createMarquee({ keyword }).unwrap();
      setNewKeyword("");
      notify("success", `Added "${keyword}" to the marquee`);
    } catch (err) {
      notify("error", getApiErrorMessage(err, "Failed to add marquee keyword."));
    }
  };

  const handleUpdate = async (id: string) => {
    const keyword = editKeyword.trim();
    if (!keyword) return;
    try {
      await updateMarquee({ id, keyword }).unwrap();
      setEditingId(null);
      notify("success", "Marquee keyword updated");
    } catch (err) {
      notify("error", getApiErrorMessage(err, "Failed to update keyword."));
    }
  };

  const handleDelete = async (item: MarqueeItem) => {
    if (!confirm(`Remove "${item.label}" from the marquee?`)) return;
    setDeletingId(item.id);
    try {
      await deleteMarquee(item.id).unwrap();
      notify("success", `Removed "${item.label}"`);
    } catch (err) {
      notify("error", getApiErrorMessage(err, "Failed to delete keyword."));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card className="p-6 space-y-5">
      <div className="flex items-center gap-2 border-b border-line pb-4">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-blue-50 text-blue-600">
          <Megaphone className="w-4 h-4" />
        </span>
        <div>
          <h3 className="text-base font-semibold text-title">
            Services Marquee Ticker
          </h3>
          <p className="text-xs text-muted mt-0.5">
            Keywords scrolling across the public website.
          </p>
        </div>
        {isFetching && !isLoading && (
          <Loader2 className="w-4 h-4 animate-spin text-muted ml-auto" />
        )}
      </div>

      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          value={newKeyword}
          onChange={(e) => setNewKeyword(e.target.value)}
          placeholder="Add a keyword, e.g. Plumbing"
          className="flex-1"
        />
        <Button
          type="submit"
          size="md"
          variant="primary"
          isLoading={isCreating}
          disabled={!newKeyword.trim()}
          className="shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </Button>
      </form>

      {isLoading ? (
        <LoadingBlock label="Loading marquee keywords..." />
      ) : error ? (
        <ErrorBlock
          error={error}
          fallback="Failed to load marquee keywords."
          onRetry={refetch}
        />
      ) : items.length === 0 ? (
        <div className="py-8 text-center text-xs text-muted border border-dashed border-line rounded-xl">
          No marquee keywords yet. Add the first one above.
        </div>
      ) : (
        <ul className="divide-y divide-line/60 border border-line rounded-xl overflow-hidden">
          {items.map((item, idx) => (
            <li
              key={item.id}
              className="flex items-center gap-3 px-4 py-2.5 bg-white"
            >
              <span className="grid h-6 w-6 place-items-center rounded bg-slate-100 text-[11px] font-bold text-slate-600 shrink-0">
                {idx + 1}
              </span>
              {editingId === item.id ? (
                <>
                  <Input
                    value={editKeyword}
                    onChange={(e) => setEditKeyword(e.target.value)}
                    className="flex-1"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleUpdate(item.id);
                      }
                      if (e.key === "Escape") setEditingId(null);
                    }}
                  />
                  <Button
                    size="sm"
                    variant="primary"
                    isLoading={isUpdating}
                    onClick={() => handleUpdate(item.id)}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingId(null)}
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm font-medium text-title truncate">
                    {item.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(item.id);
                      setEditKeyword(item.label);
                    }}
                    className="p-1.5 rounded-lg border border-line text-muted hover:text-title hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Edit keyword"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={deletingId === item.id}
                    onClick={() => handleDelete(item)}
                    className="p-1.5 rounded-lg border border-line text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50"
                    title="Delete keyword"
                  >
                    {deletingId === item.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

/* ------------------------------------------------------------------ */
/* SITE SETUP / BRANDING                                               */
/* ------------------------------------------------------------------ */

interface SiteSettingsValue {
  siteName?: string;
  siteLogoUrl?: string;
  siteFooterLogoUrl?: string;
  siteFaviconUrl?: string;
  supportEmail?: string;
  contactPhone?: string;
  physicalAddress?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
}

const BrandingForm: React.FC<{ settings: SiteSettingsValue; notify: Notify }> = ({
  settings,
  notify,
}) => {
  const [saveSiteSettings, { isLoading }] = useSaveSiteSettingsMutation();

  const [siteName, setSiteName] = useState(settings.siteName ?? "");
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail ?? "");
  const [supportPhone, setSupportPhone] = useState(settings.contactPhone ?? "");
  const [address, setAddress] = useState(settings.physicalAddress ?? "");
  const [facebookUrl, setFacebookUrl] = useState(
    settings.socialMedia?.facebook ?? ""
  );
  const [instagramUrl, setInstagramUrl] = useState(
    settings.socialMedia?.instagram ?? ""
  );
  const [linkedinUrl, setLinkedinUrl] = useState(
    settings.socialMedia?.linkedin ?? ""
  );
  const [headerLogo, setHeaderLogo] = useState<File | null>(null);
  const [footerLogo, setFooterLogo] = useState<File | null>(null);
  const [favicon, setFavicon] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveSiteSettings({
        data: {
          platformBrandName: siteName.trim(),
          supportEmail: supportEmail.trim(),
          supportPhone: supportPhone.trim(),
          address: address.trim(),
          ...(facebookUrl.trim() ? { facebookUrl: facebookUrl.trim() } : {}),
          ...(instagramUrl.trim() ? { instagramUrl: instagramUrl.trim() } : {}),
          ...(linkedinUrl.trim() ? { linkedinUrl: linkedinUrl.trim() } : {}),
        },
        headerLogo,
        footerLogo,
        favicon,
      }).unwrap();
      setHeaderLogo(null);
      setFooterLogo(null);
      setFavicon(null);
      notify("success", "Site settings saved");
    } catch (err) {
      notify("error", getApiErrorMessage(err, "Failed to save site settings."));
    }
  };

  const labelClass = "block text-xs font-semibold text-title mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div>
            <h3 className="text-base font-semibold text-title">
              Site Setup &amp; Contacts
            </h3>
            <p className="text-xs text-muted mt-0.5">
              Brand name, logos, support contacts and social links.
            </p>
          </div>
          <Button
            size="sm"
            variant="primary"
            type="submit"
            isLoading={isLoading}
            className="flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelClass}>Platform Brand Name</label>
            <Input
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="HomeFix"
              required
            />
          </div>
          <div>
            <label className={labelClass}>Support Email</label>
            <Input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              placeholder="support@example.com"
              required
            />
          </div>
          <div>
            <label className={labelClass}>Support Phone</label>
            <Input
              value={supportPhone}
              onChange={(e) => setSupportPhone(e.target.value)}
              placeholder="+1 555 000 0000"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Address</label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street, City, State"
              required
            />
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h4 className="text-sm font-semibold text-title border-b border-line pb-2">
          Social Links
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Facebook URL</label>
            <Input
              value={facebookUrl}
              onChange={(e) => setFacebookUrl(e.target.value)}
              placeholder="https://facebook.com/..."
            />
          </div>
          <div>
            <label className={labelClass}>Instagram URL</label>
            <Input
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              placeholder="https://instagram.com/..."
            />
          </div>
          <div>
            <label className={labelClass}>LinkedIn URL</label>
            <Input
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/..."
            />
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-5">
        <h4 className="text-sm font-semibold text-title border-b border-line pb-2">
          Logos &amp; Favicon
        </h4>
        <ImagePicker
          label="Header Logo"
          currentUrl={settings.siteLogoUrl}
          file={headerLogo}
          onChange={setHeaderLogo}
          maxMb={4}
          onError={(m) => notify("error", m)}
        />
        <ImagePicker
          label="Footer Logo"
          currentUrl={settings.siteFooterLogoUrl}
          file={footerLogo}
          onChange={setFooterLogo}
          maxMb={4}
          onError={(m) => notify("error", m)}
        />
        <ImagePicker
          label="Favicon"
          currentUrl={settings.siteFaviconUrl}
          file={favicon}
          onChange={setFavicon}
          maxMb={1}
          onError={(m) => notify("error", m)}
        />
      </Card>
    </form>
  );
};

const BrandingTab: React.FC<{ notify: Notify }> = ({ notify }) => {
  const { data, isLoading, error, refetch } = useGetSiteSettingsQuery();

  if (isLoading) return <LoadingBlock label="Loading site settings..." />;
  if (error && !isNotFound(error)) {
    return (
      <ErrorBlock
        error={error}
        fallback="Failed to load site settings."
        onRetry={refetch}
      />
    );
  }

  return (
    <BrandingForm
      key={JSON.stringify(data ?? {})}
      settings={data ?? {}}
      notify={notify}
    />
  );
};

/* ------------------------------------------------------------------ */
/* FAQ                                                                 */
/* ------------------------------------------------------------------ */

const FaqTab: React.FC<{ notify: Notify }> = ({ notify }) => {
  const [role, setRole] = useUrlTab(["homeowner", "pro"] as const, "homeowner", "audience");
  const { data, isLoading, isFetching, error, refetch } = useGetFaqsQuery({
    role,
  });
  const [createFaq, { isLoading: isCreating }] = useCreateFaqMutation();
  const [updateFaq, { isLoading: isUpdating }] = useUpdateFaqMutation();
  const [deleteFaq] = useDeleteFaqMutation();

  const faqs: FaqItem[] = data?.items ?? [];

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingFaq(null);
    setQuestion("");
    setAnswer("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = question.trim();
    const a = answer.trim();
    if (!q || !a) return;
    try {
      if (editingFaq) {
        await updateFaq({ id: editingFaq.id, question: q, answer: a, role }).unwrap();
        notify("success", "FAQ updated");
      } else {
        await createFaq({ question: q, answer: a, role }).unwrap();
        notify("success", "FAQ added");
      }
      closeForm();
    } catch (err) {
      notify("error", getApiErrorMessage(err, "Failed to save FAQ."));
    }
  };

  const handleDelete = async (faq: FaqItem) => {
    if (!confirm("Delete this FAQ?")) return;
    setDeletingId(faq.id);
    try {
      await deleteFaq(faq.id).unwrap();
      notify("success", "FAQ deleted");
    } catch (err) {
      notify("error", getApiErrorMessage(err, "Failed to delete FAQ."));
    } finally {
      setDeletingId(null);
    }
  };

  const roleButton = (key: "homeowner" | "pro", label: string, Icon: typeof User) => (
    <button
      type="button"
      onClick={() => {
        setRole(key);
        closeForm();
      }}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
        role === key
          ? "bg-primary text-white shadow-xs"
          : "text-muted hover:bg-slate-100 hover:text-title"
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-3">
        <div className="flex items-center gap-2 text-xs">
          {roleButton("homeowner", "Homeowner FAQs", User)}
          {roleButton("pro", "Pro Contractor FAQs", Briefcase)}
          {isFetching && !isLoading && (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-muted" />
          )}
        </div>
        <Button
          size="sm"
          variant="primary"
          onClick={() => {
            if (isFormOpen && !editingFaq) {
              closeForm();
              return;
            }
            setEditingFaq(null);
            setQuestion("");
            setAnswer("");
            setIsFormOpen(true);
          }}
          className="flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Question</span>
        </Button>
      </div>

      {isFormOpen && (
        <Card className="p-5 border-primary/40 bg-blue-50/20 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-line/60 pb-2">
            <h4 className="text-xs font-semibold text-title">
              {editingFaq
                ? "Edit FAQ Item"
                : `New ${role === "homeowner" ? "Homeowner" : "Contractor"} Question`}
            </h4>
            <button
              type="button"
              onClick={closeForm}
              className="text-xs text-muted hover:text-title cursor-pointer"
            >
              Cancel
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-title mb-1">
                Question
              </label>
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Enter the frequently asked question..."
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-title mb-1">
                Answer
              </label>
              <textarea
                rows={3}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Provide the clear, helpful answer..."
                className={textareaClass}
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button size="sm" variant="ghost" type="button" onClick={closeForm}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="primary"
                type="submit"
                isLoading={isCreating || isUpdating}
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                <span>{editingFaq ? "Update FAQ" : "Save Question"}</span>
              </Button>
            </div>
          </form>
        </Card>
      )}

      {isLoading ? (
        <LoadingBlock label="Loading FAQs..." />
      ) : error ? (
        <ErrorBlock error={error} fallback="Failed to load FAQs." onRetry={refetch} />
      ) : faqs.length === 0 ? (
        <Card className="p-8 text-center text-muted text-xs">
          No FAQs added yet for {role === "homeowner" ? "Homeowners" : "Pros"}.
          Click &quot;Add Question&quot; above to add the first one.
        </Card>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <Card
              key={faq.id}
              className="p-4 space-y-2 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="h-5 w-5 rounded-md bg-primary/10 text-primary text-[10px] font-bold grid place-items-center shrink-0">
                      Q{index + 1}
                    </span>
                    <h4 className="text-xs font-semibold text-title">
                      {faq.question}
                    </h4>
                  </div>
                  <p className="text-xs text-copy leading-relaxed pl-7 whitespace-pre-wrap">
                    {faq.answer}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingFaq(faq);
                      setQuestion(faq.question);
                      setAnswer(faq.answer);
                      setIsFormOpen(true);
                    }}
                    className="p-1.5 rounded-lg border border-line text-muted hover:text-title hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Edit Question"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={deletingId === faq.id}
                    onClick={() => handleDelete(faq)}
                    className="p-1.5 rounded-lg border border-line text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50"
                    title="Delete Question"
                  >
                    {deletingId === faq.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* LEGAL / RULES                                                       */
/* ------------------------------------------------------------------ */

const RULE_TABS: { key: RuleType; label: string }[] = [
  { key: "terms", label: "Terms & Conditions" },
  { key: "privacy", label: "Privacy Policy" },
  { key: "dispute", label: "Dispute Protocol" },
  { key: "about", label: "About Us" },
];

const LegalTab: React.FC<{ notify: Notify }> = ({ notify }) => {
  const [ruleType, setRuleType] = useUrlTab(
    ["terms", "privacy", "dispute", "about"] as const,
    "terms",
    "policy",
  );
  const { data, isLoading, isFetching, error, refetch } =
    useGetRuleQuery(ruleType);
  const [saveRule, { isLoading: isSaving }] = useSaveRuleMutation();

  // Unsaved edits keyed by rule type so switching tabs keeps drafts.
  const [drafts, setDrafts] = useState<Partial<Record<RuleType, string>>>({});

  const serverContent = data ?? "";
  const draft = drafts[ruleType];
  const value = draft ?? serverContent;
  const isDirty = draft !== undefined && draft !== serverContent;
  const label = RULE_TABS.find((t) => t.key === ruleType)?.label ?? ruleType;

  const handleSave = async () => {
    try {
      await saveRule({ type: ruleType, content: value }).unwrap();
      notify("success", `${label} saved`);
    } catch (err) {
      notify("error", getApiErrorMessage(err, `Failed to save ${label}.`));
    }
  };

  const showError = error && !isNotFound(error);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 border-b border-line pb-2.5 text-xs">
        {RULE_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setRuleType(tab.key)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              ruleType === tab.key
                ? "bg-primary text-white shadow-xs"
                : "text-muted hover:bg-slate-100 hover:text-title"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingBlock label={`Loading ${label}...`} />
      ) : showError ? (
        <ErrorBlock
          error={error}
          fallback={`Failed to load ${label}.`}
          onRetry={refetch}
        />
      ) : (
        <Card className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-3">
            <div>
              <h3 className="text-sm font-semibold text-title">{label}</h3>
              <p className="text-[11px] text-muted mt-0.5 inline-flex items-center gap-1.5">
                {isFetching && <Loader2 className="w-3 h-3 animate-spin" />}
                {isDirty ? "Unsaved changes" : "Up to date"}
              </p>
            </div>
            <Button
              size="sm"
              variant="primary"
              isLoading={isSaving}
              disabled={!isDirty}
              onClick={handleSave}
              className="flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save {label}</span>
            </Button>
          </div>
          <textarea
            rows={18}
            value={value}
            onChange={(e) =>
              setDrafts((prev) => ({ ...prev, [ruleType]: e.target.value }))
            }
            placeholder={`Write the ${label.toLowerCase()} content here...`}
            className={`${textareaClass} font-mono`}
          />
        </Card>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* PAGE                                                                */
/* ------------------------------------------------------------------ */

const TABS: { key: TabKey; label: string; icon: typeof Sliders }[] = [
  { key: "hero", label: "Homepage Hero", icon: Sliders },
  { key: "marquee", label: "Services Marquee Ticker", icon: Megaphone },
  { key: "branding", label: "Site Setup & Contacts", icon: Globe },
  { key: "categories", label: "Service Categories", icon: Grid },
  { key: "faq", label: "FAQ Management", icon: HelpCircle },
  { key: "legal", label: "Legal Policies", icon: FileText },
];

export const CmsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useUrlTab(VALID_TABS, "hero");

  const [notice, setNotice] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const notify: Notify = (type, message) => setNotice({ type, message });

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Content Management"
        description="Manage landing hero banner, site contacts, FAQs, and legal policies."
        action={
          notice ? (
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border animate-in fade-in ${
                notice.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-rose-50 text-rose-700 border-rose-200"
              }`}
            >
              {notice.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600" />
              )}
              <span>{notice.message}</span>
            </div>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        <div className="md:col-span-3 space-y-2">
          <Card className="p-2 space-y-1">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-left ${
                  activeTab === key
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-muted hover:bg-slate-100 hover:text-title"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{label}</span>
              </button>
            ))}
          </Card>
        </div>

        <div className="md:col-span-9 space-y-6">
          {activeTab === "hero" && <HeroTab notify={notify} />}
          {activeTab === "marquee" && <MarqueeTab notify={notify} />}
          {activeTab === "branding" && <BrandingTab notify={notify} />}
          {activeTab === "categories" && <CategoriesPage />}
          {activeTab === "faq" && <FaqTab notify={notify} />}
          {activeTab === "legal" && <LegalTab notify={notify} />}
        </div>
      </div>
    </div>
  );
};

export default CmsPage;
