import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Upload,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Loader2,
} from "lucide-react";
import {
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoriesQuery,
  useUpdateCategoryMutation,
} from "@/api/cms.api";
import { ROUTES } from "@/constants/routes";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ServiceCategory } from "@/types/common.types";
import { getCategoryIcon } from "@/lib/categoryUtils";

type Notice = { type: "success" | "error"; message: string };

export const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();

  const [localSearch, setLocalSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(localSearch.trim()), 300);
    return () => clearTimeout(timer);
  }, [localSearch]);

  const {
    data,
    isLoading,
    isFetching,
    error: loadError,
    refetch,
  } = useGetCategoriesQuery(
    debouncedSearch ? { searchTerm: debouncedSearch } : undefined,
  );
  const [createCategory, { isLoading: isCreating }] =
    useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const categories = useMemo(() => data?.items ?? [], [data]);

  // Category Add/Edit Modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(
    null
  );
  const [catName, setCatName] = useState("");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState("");
  const [coverPreview, setCoverPreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const iconFileInputRef = useRef<HTMLInputElement | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [notice, setNotice] = useState<Notice | null>(null);
  const showNotice = (type: Notice["type"], message: string) => {
    setNotice({ type, message });
  };
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  // Revoke blob previews on change/unmount
  useEffect(() => {
    return () => {
      if (iconPreview.startsWith("blob:")) URL.revokeObjectURL(iconPreview);
    };
  }, [iconPreview]);
  useEffect(() => {
    return () => {
      if (coverPreview.startsWith("blob:")) URL.revokeObjectURL(coverPreview);
    };
  }, [coverPreview]);

  const handleCategoryIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showNotice("error", "Icon file size should be under 2MB.");
      return;
    }
    setIconFile(file);
    setIconPreview(URL.createObjectURL(file));
  };

  const handleCategoryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      showNotice("error", "Image size should be under 8MB.");
      return;
    }
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const filteredCategories = categories;

  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCatName("");
    setIconFile(null);
    setCoverFile(null);
    setIconPreview("");
    setCoverPreview("");
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: ServiceCategory) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setIconFile(null);
    setCoverFile(null);
    setIconPreview(cat.iconName);
    setCoverPreview(cat.coverImage);
    setIsCategoryModalOpen(true);
  };

  const handleDeleteCategory = async (cat: ServiceCategory) => {
    if (!confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
      return;
    }
    setDeletingId(cat.id);
    try {
      await deleteCategory(cat.id).unwrap();
      showNotice("success", `Category "${cat.name}" deleted.`);
    } catch (err) {
      showNotice("error", getApiErrorMessage(err, "Failed to delete category."));
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = catName.trim();
    if (!name) return;

    try {
      if (editingCategory) {
        await updateCategory({
          id: editingCategory.id,
          name,
          icon: iconFile,
          coverImage: coverFile,
        }).unwrap();
        showNotice("success", `Category "${name}" updated.`);
      } else {
        await createCategory({
          name,
          icon: iconFile,
          coverImage: coverFile,
        }).unwrap();
        showNotice("success", `New category "${name}" created.`);
      }
      setIsCategoryModalOpen(false);
    } catch (err) {
      showNotice("error", getApiErrorMessage(err, "Failed to save category."));
    }
  };

  const isSaving = isCreating || isUpdating;

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      {notice && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between shadow-2xs animate-in fade-in ${
            notice.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{notice.message}</span>
          </div>
          <button
            onClick={() => setNotice(null)}
            className="text-muted hover:text-title cursor-pointer ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Service Categories
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Manage trade categories, icons and cover images.
          </p>
        </div>
        <Button
          size="sm"
          variant="primary"
          onClick={handleOpenAddCategory}
          className="flex items-center gap-1.5 shadow-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer rounded-xl px-3.5 py-2 text-xs self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </Button>
      </div>

      {/* Search */}
      <Card className="p-3.5 sm:p-4 bg-white border-line shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search categories by trade name..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full rounded-xl border border-line bg-slate-50/70 py-2 pl-10 pr-4 text-xs sm:text-sm text-title placeholder:text-muted outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
            />
          </div>
          <span className="text-xs text-muted font-medium inline-flex items-center gap-1.5">
            {isFetching && !isLoading && (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            )}
            {categories.length} {categories.length === 1 ? "category" : "categories"}
          </span>
        </div>
      </Card>

      {/* Categories Table View */}
      <Card className="p-0 overflow-hidden shadow-xs bg-white border-line">
        <div className="overflow-x-auto min-w-0">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-line/70 bg-slate-50/60 text-xs font-semibold text-muted uppercase tracking-wider">
                <th className="py-3 px-5 whitespace-nowrap">Category Trade</th>
                <th className="py-3 px-5 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {isLoading ? (
                <tr>
                  <td colSpan={2} className="py-12 text-center text-xs text-muted">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading categories...
                    </span>
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan={2} className="py-12 text-center text-xs">
                    <p className="text-rose-600 font-semibold">
                      {getApiErrorMessage(loadError, "Failed to load categories.")}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3"
                      onClick={() => refetch()}
                    >
                      Retry
                    </Button>
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={2} className="py-12 text-center text-xs text-muted">
                    {localSearch
                      ? `No categories found matching "${localSearch}".`
                      : "No categories yet. Click \"Add Category\" to create one."}
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr
                    key={cat.id}
                    onClick={() => navigate(ROUTES.CATEGORIES.DETAIL(cat.id))}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3.5">
                        <div className="relative shrink-0">
                          {cat.coverImage ? (
                            <img
                              src={cat.coverImage}
                              alt={cat.name}
                              className="h-11 w-11 rounded-xl object-cover border border-line shadow-2xs"
                            />
                          ) : (
                            <div className="h-11 w-11 rounded-xl border border-line bg-slate-100" />
                          )}
                          <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-md bg-white border border-line shadow-2xs flex items-center justify-center p-0.5">
                            {getCategoryIcon(
                              cat.iconName,
                              "h-3.5 w-3.5 text-slate-700"
                            )}
                          </div>
                        </div>
                        <span className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors block">
                          {cat.name}
                        </span>
                      </div>
                    </td>

                    <td
                      className="py-3.5 px-5 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditCategory(cat)}
                          className="p-1.5 rounded-lg border border-line bg-white hover:bg-slate-50 text-slate-600 hover:text-primary cursor-pointer shadow-2xs transition-colors"
                          title="Edit Category Details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === cat.id}
                          onClick={() => handleDeleteCategory(cat)}
                          className="p-1.5 rounded-lg border border-line bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer shadow-2xs transition-colors disabled:opacity-50"
                          title="Delete Category"
                        >
                          {deletingId === cat.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(ROUTES.CATEGORIES.DETAIL(cat.id))}
                          className="p-1.5 rounded-lg border border-line bg-white hover:bg-blue-50 text-slate-400 hover:text-blue-600 cursor-pointer shadow-2xs transition-colors"
                          title="View Details"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ADD / EDIT CATEGORY MODAL */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => !isSaving && setIsCategoryModalOpen(false)}
        title={
          editingCategory
            ? `Edit Category: ${editingCategory.name}`
            : "Add Service Category"
        }
        description="Configure category cover photo, trade icon, and name."
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              variant="ghost"
              size="sm"
              disabled={isSaving}
              onClick={() => setIsCategoryModalOpen(false)}
              className="cursor-pointer text-xs text-slate-600 hover:text-slate-900"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isSaving}
              onClick={handleSaveCategory}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer text-xs rounded-xl px-5 py-2 shadow-xs"
            >
              {editingCategory ? "Update Category" : "Create Category"}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
          {/* Category Cover Image */}
          <div className="space-y-2">
            <label className="block font-semibold text-title">
              Category Cover Image
            </label>
            {coverPreview ? (
              <div className="relative h-40 w-full rounded-2xl border border-line overflow-hidden shadow-2xs">
                <img
                  src={coverPreview}
                  alt="Category Cover"
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="h-28 w-full rounded-2xl border border-dashed border-line bg-slate-50 flex items-center justify-center text-muted text-xs">
                No cover image selected
              </div>
            )}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCategoryImageUpload}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 text-xs font-semibold cursor-pointer border-slate-300 hover:bg-slate-50 shadow-2xs"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>Upload Cover Photo</span>
              </Button>
            </div>
          </div>

          {/* Category Name */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-title">
              Category Name *
            </label>
            <Input
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              placeholder="e.g. House Cleaning, Plumbing Services..."
              className="text-xs font-medium"
              required
            />
          </div>

          {/* Category Icon Upload */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-title">Category Icon</label>
            <div className="flex items-center justify-between p-3 rounded-xl border border-line bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg border border-slate-200 bg-white grid place-items-center shrink-0 overflow-hidden shadow-2xs">
                  {iconPreview ? (
                    <img
                      src={iconPreview}
                      alt="Category Icon"
                      className="h-6 w-6 object-contain"
                    />
                  ) : (
                    getCategoryIcon("", "h-5 w-5 text-blue-600")
                  )}
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">
                    {iconFile
                      ? iconFile.name
                      : iconPreview
                        ? "Current icon"
                        : "No icon selected"}
                  </span>
                  <span className="text-[11px] text-muted block">
                    Upload SVG or PNG icon
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <input
                  ref={iconFileInputRef}
                  type="file"
                  accept="image/*,.svg"
                  className="hidden"
                  onChange={handleCategoryIconUpload}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => iconFileInputRef.current?.click()}
                  className="h-8 px-3 text-xs flex items-center gap-1.5 font-semibold bg-white border-slate-300 hover:text-blue-600 cursor-pointer shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span>Upload Icon</span>
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CategoriesPage;
