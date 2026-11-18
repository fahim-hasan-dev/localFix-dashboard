import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, icon, id, disabled, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-title"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="pointer-events-none absolute left-3.5 text-muted">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              "w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm text-title placeholder:text-muted/60 transition-all outline-none",
              "focus:border-primary focus:ring-2 focus:ring-primary/10 shadow-2xs",
              icon ? "pl-10" : "",
              error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10",
              disabled && "cursor-not-allowed bg-slate-50 text-muted",
              className
            )}
            disabled={disabled}
            {...props}
          />
        </div>
        {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-muted">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
