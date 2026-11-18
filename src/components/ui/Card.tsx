import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export function Card({ className, hoverEffect = false, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-line/80 bg-white p-5 sm:p-6 shadow-2xs transition-all",
        hoverEffect && "hover:border-slate-300 hover:shadow-xs",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
