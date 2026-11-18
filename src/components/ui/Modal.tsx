import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = "md",
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Dialog content */}
      <div
        className={cn(
          "relative z-10 w-full overflow-hidden rounded-2xl bg-white p-4 sm:p-6 shadow-xl border border-line animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col",
          widthClasses[maxWidth]
        )}
      >
        <div className="flex items-start justify-between pb-4 border-b border-line/70">
          <div>
            {title && (
              <h3 className="font-display text-lg font-bold text-title">
                {title}
              </h3>
            )}
            {description && (
              <p className="mt-1 text-xs text-muted leading-relaxed">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-slate-100 hover:text-title transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="py-3 sm:py-4 overflow-y-auto flex-1">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-line/70">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
