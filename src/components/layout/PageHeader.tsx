import React from "react";

export interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-line/70">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-title tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-xs sm:text-sm text-muted max-w-2xl text-pretty leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex items-center gap-3 shrink-0">{action}</div>}
    </div>
  );
}
