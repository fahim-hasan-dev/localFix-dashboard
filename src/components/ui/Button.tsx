import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "white";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed outline-none select-none tracking-tight";

    const variants = {
      primary:
        "bg-blue-600 text-white hover:bg-blue-700 shadow-xs active:scale-[0.98]",
      secondary:
        "bg-slate-100 text-title hover:bg-slate-200 active:scale-[0.98]",
      outline:
        "border border-line bg-white text-title hover:bg-slate-50 hover:border-slate-300 shadow-2xs active:scale-[0.98]",
      ghost:
        "text-muted hover:text-title hover:bg-slate-100 active:scale-[0.98]",
      danger:
        "bg-rose-600 text-white hover:bg-rose-700 shadow-xs active:scale-[0.98]",
      white:
        "bg-white text-title hover:bg-slate-50 shadow-xs active:scale-[0.98]",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-9 px-3.5 text-xs font-medium gap-2",
      lg: "h-10 px-4.5 text-sm gap-2",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-1" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
