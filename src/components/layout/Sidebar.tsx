import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Receipt,
  Layers,
  ShieldCheck,
  FileText,
  Settings,
  LifeBuoy,
  X,
} from "lucide-react";
import { useGetSiteSettingsQuery } from "@/api/cms.api";
import { useGetSupportTicketsQuery } from "@/api/tickets.api";
import { useGetClearancesQuery } from "@/api/users.api";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";

const navItems = [
  { to: ROUTES.DASHBOARD, label: "Overview", icon: LayoutDashboard },
  { to: ROUTES.ORDERS.LIST, label: "Jobs & Orders", icon: Briefcase },
  { to: ROUTES.USERS.LIST, label: "User Management", icon: Users },
  { to: ROUTES.CLEARANCE, label: "Pending Clearance", icon: ShieldCheck },
  { to: ROUTES.TRANSACTIONS, label: "Transactions", icon: Receipt },
  { to: ROUTES.SUBSCRIPTIONS, label: "Subscriptions", icon: Layers },
  { to: ROUTES.TICKETS.LIST, label: "Support Tickets", icon: LifeBuoy },
  { to: ROUTES.CMS, label: "CMS", icon: FileText },
  { to: ROUTES.SETTINGS, label: "Settings", icon: Settings },
] as const;

export interface SidebarProps {
  isMobileOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isMobileOpen = false, onClose }: SidebarProps) {
  const storedBranding = useAppSelector((state) => state.settings.branding);
  const { data: siteSettings } = useGetSiteSettingsQuery();
  const branding = {
    siteLogoUrl: siteSettings?.siteLogoUrl || storedBranding.siteLogoUrl,
    siteName: siteSettings?.siteName || storedBranding.siteName || "HomeFix",
  };
  const { data: ticketsData } = useGetSupportTicketsQuery({ limit: 100 });
  const openTicketsCount = (ticketsData?.items ?? []).filter((t) => t.status === "open").length;
  const { data: clearancesData } = useGetClearancesQuery({ limit: 100 });
  const pendingClearancesCount = (clearancesData?.items ?? []).filter(
    (c) => c.clearanceLevel === "pending" || c.clearanceLevel === "action_required"
  ).length;

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-64 max-w-[85vw] flex-col border-r border-line bg-white select-none transition-transform duration-300 ease-in-out lg:translate-x-0 lg:z-30",
        isMobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-line px-5">
        <NavLink to={ROUTES.DASHBOARD} onClick={onClose} className="flex items-center gap-2.5 group">
          <img
            src={branding.siteLogoUrl || "/logo-trimmed.png"}
            alt={branding.siteName}
            className="h-8 w-auto max-w-[160px] object-contain transition-transform duration-200 group-hover:scale-[1.02]"
          />
        </NavLink>
        <button
          type="button"
          onClick={onClose}
          className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors lg:hidden cursor-pointer"
          aria-label="Close navigation"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3.5 py-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const badgeCount =
              item.to === ROUTES.TICKETS.LIST
                ? openTicketsCount
                : item.to === ROUTES.CLEARANCE
                  ? pendingClearancesCount
                  : 0;

            const badgeBg =
              item.to === ROUTES.CLEARANCE
                ? "bg-amber-500 text-white"
                : "bg-rose-500 text-white";

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === ROUTES.DASHBOARD}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-150",
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-copy hover:bg-slate-50 hover:text-title"
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0 opacity-90" />
                <span className="flex-1 truncate">{item.label}</span>
                {badgeCount > 0 && (
                  <span
                    className={cn(
                      "inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none",
                      badgeBg
                    )}
                  >
                    {badgeCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

export default Sidebar;
