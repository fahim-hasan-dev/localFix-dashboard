import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  HelpCircle,
  Info,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useGetCategoryByIdQuery } from "@/api/cms.api";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getCategoryIcon } from "@/lib/categoryUtils";

export const CategoryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: category,
    isLoading,
    error,
    refetch,
  } = useGetCategoryByIdQuery(id ?? "", { skip: !id });

  const backButton = (
    <button
      onClick={() => navigate("/cms?tab=categories")}
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 cursor-pointer transition-colors"
    >
      <ArrowLeft className="w-4 h-4" />
      <span>Back to Categories</span>
    </button>
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {backButton}
        <Card className="p-12 text-center text-muted text-xs">
          <span className="inline-flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading category...
          </span>
        </Card>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="space-y-4">
        {backButton}
        <Card className="p-12 text-center text-muted">
          {error ? (
            <AlertCircle className="h-10 w-10 text-rose-300 mx-auto mb-2" />
          ) : (
            <HelpCircle className="h-10 w-10 text-slate-300 mx-auto mb-2" />
          )}
          <p className="text-sm font-semibold text-title">
            {error ? "Failed to load category" : "Category Not Found"}
          </p>
          {error ? (
            <>
              <p className="text-xs text-rose-600 mt-1">
                {getApiErrorMessage(error, "Could not load this category.")}
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={() => refetch()}
              >
                Retry
              </Button>
            </>
          ) : null}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>{backButton}</div>

      <Card className="p-4 bg-white border border-line shadow-xs">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            {category.coverImage ? (
              <img
                src={category.coverImage}
                alt={category.name}
                className="h-12 w-12 rounded-xl object-cover border border-line shadow-2xs"
              />
            ) : (
              <div className="h-12 w-12 rounded-xl border border-line bg-slate-100" />
            )}
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded bg-white border border-line shadow-2xs flex items-center justify-center p-0.5">
              {getCategoryIcon(category.iconName, "h-3.5 w-3.5 text-blue-600")}
            </div>
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              {category.name}
            </h1>
            {category.createdAt && (
              <p className="text-xs text-muted mt-0.5">
                Created {new Date(category.createdAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {category.coverImage && (
          <div className="mt-4 h-48 w-full rounded-xl border border-line overflow-hidden">
            <img
              src={category.coverImage}
              alt={`${category.name} cover`}
              className="h-full w-full object-cover"
            />
          </div>
        )}
      </Card>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between pb-1 border-b border-line">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Intake Questions
          </h2>
        </div>
        <Card className="p-8 text-center bg-white border-dashed border-2 border-slate-200 space-y-2">
          <Info className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-xs font-bold text-slate-900">
            Intake questions aren&apos;t available yet
          </h3>
          <p className="text-xs text-muted max-w-sm mx-auto">
            Managing intake questions is not supported by the API yet. This page
            is read-only; edit the name, icon or cover image from the Service
            Categories list.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default CategoryDetailPage;
