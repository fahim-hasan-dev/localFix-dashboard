import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  LogOut,
  User,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Receipt,
  LifeBuoy,
  Settings,
  Menu,
  Loader2,
} from "lucide-react";
import {
  useGetAdminNotificationsQuery,
  useMarkAdminNotificationReadMutation,
  useMarkAllAdminNotificationsReadMutation,
} from "@/api/notifications.api";
import { useGetClearancesQuery } from "@/api/users.api";
import { ROUTES } from "@/constants/routes";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import { signOut } from "@/lib/signOut";
import { formatDate } from "@/lib/utils";
import type { AdminNotification } from "@/lib/mappers/mapNotification";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export interface TopbarProps {
  onToggleMenu?: () => void;
}

function getNotificationIcon(type: string) {
  if (type.includes("ticket") || type.includes("support")) {
    return { Icon: LifeBuoy, tone: "bg-blue-50 text-primary" };
  }
  if (type.includes("clearance") || type.includes("approval") || type.includes("professional")) {
    return { Icon: AlertTriangle, tone: "bg-amber-50 text-amber-600" };
  }
  if (type.includes("dispute")) {
    return { Icon: Scale, tone: "bg-rose-50 text-rose-600" };
  }
  if (type.includes("order") || type.includes("booking")) {
    return { Icon: Receipt, tone: "bg-blue-50 text-primary" };
  }
  return { Icon: Bell, tone: "bg-slate-100 text-slate-600" };
}

export function Topbar({ onToggleMenu }: TopbarProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifPage, setNotifPage] = useState(1);
  const loadingMoreRef = useRef(false);
  const { data: clearancesData } = useGetClearancesQuery({ limit: 100 });
  const {
    data: notificationsData,
    isLoading: isNotifLoading,
    isFetching: isNotifFetching,
    isError: isNotifError,
    error: notifError,
    refetch: refetchNotifications,
  } = useGetAdminNotificationsQuery({ page: notifPage, limit: 5 });
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllAdminNotificationsReadMutation();
  const [markRead] = useMarkAdminNotificationReadMutation();

  const notifRef = useRef<HTMLDivElement>(null);
  const notifListRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const notifications = notificationsData?.items ?? [];
  const unreadCount = notificationsData?.unreadCount ?? notifications.filter((n) => !n.isRead).length;
  const hasMoreNotifications =
    (notificationsData?.page ?? 1) < (notificationsData?.totalPages ?? 1);
  const pendingClearances = (clearancesData?.items ?? []).filter(
    (c) => c.clearanceLevel === "pending" || c.clearanceLevel === "action_required"
  );

  function loadMoreNotifications() {
    const node = notifListRef.current;
    if (!node || loadingMoreRef.current || isNotifFetching) return;
    const nearBottom = node.scrollHeight - node.scrollTop - node.clientHeight < 48;
    if (!nearBottom || !hasMoreNotifications) return;
    loadingMoreRef.current = true;
    setNotifPage((page) => page + 1);
  }

  useEffect(() => {
    loadingMoreRef.current = false;
  }, [notifications.length]);

  const handleNotificationClick = async (notification: AdminNotification) => {
    setIsNotifOpen(false);
    if (!notification.isRead && notification.id) {
      try {
        await markRead(notification.id).unwrap();
      } catch {
        // Non-blocking: still navigate even if marking read fails.
      }
    }
    if (notification.link) navigate(notification.link);
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead().unwrap();
    } catch {
      // List refetch reflects server state; unread badge stays if the call failed.
    }
  };

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-20 w-full border-b border-line bg-white/95 backdrop-blur-md select-none">
      <div className="mx-auto flex h-16 w-full max-w-[1800px] items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-[50px]">
        {/* Mobile Hamburger & Logo */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onToggleMenu}
            className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-600 hover:bg-slate-100 hover:text-title transition-colors lg:hidden cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link to={ROUTES.DASHBOARD} className="flex items-center gap-2 lg:hidden">
            <img
              src="/logo-trimmed.png"
              alt="Homefix Admin"
              className="h-7 w-auto max-w-[120px] object-contain"
            />
          </Link>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsProfileOpen(false);
              setNotifPage(1);
            }}
            className="relative grid h-9 w-9 place-items-center rounded-xl border border-line text-muted hover:bg-slate-50 hover:text-title transition-colors"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-bold text-white shadow-2xs">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-sm rounded-2xl border border-line bg-white p-0 shadow-lg z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between p-3.5 border-b border-line/70">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-semibold text-title">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                      {unreadCount} New
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    disabled={isMarkingAll}
                    className="text-[11px] font-medium text-primary hover:underline cursor-pointer disabled:opacity-50"
                  >
                    {isMarkingAll ? "Marking…" : "Mark all read"}
                  </button>
                )}
              </div>

              <div
                ref={notifListRef}
                onScroll={loadMoreNotifications}
                className="max-h-80 overflow-y-auto divide-y divide-line/60"
              >
                {pendingClearances.length > 0 && (
                  <Link
                    to={ROUTES.CLEARANCE}
                    onClick={() => setIsNotifOpen(false)}
                    className="flex items-start gap-3 p-3.5 bg-amber-50/40 hover:bg-amber-50 transition-colors"
                  >
                    <div className="h-7 w-7 rounded-lg bg-amber-50 text-amber-600 grid place-items-center shrink-0 mt-0.5">
                      <AlertTriangle className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 text-xs">
                      <p className="font-semibold text-title">Pro Clearance Audit Required</p>
                      <p className="text-muted text-[11px] mt-0.5">
                        {pendingClearances.length} pending clearance
                        {pendingClearances.length === 1 ? "" : "s"} awaiting review.
                      </p>
                    </div>
                  </Link>
                )}

                {isNotifLoading ? (
                  <div className="p-8 text-center text-xs text-muted">
                    <Loader2 className="h-5 w-5 animate-spin text-slate-400 mx-auto mb-1.5" />
                    <p>Loading notifications…</p>
                  </div>
                ) : isNotifError ? (
                  <div className="p-6 text-center text-xs">
                    <p className="font-medium text-rose-600">
                      {getApiErrorMessage(notifError, "Could not load notifications.")}
                    </p>
                    <button
                      type="button"
                      onClick={() => refetchNotifications()}
                      className="mt-2 text-[11px] font-medium text-primary hover:underline cursor-pointer"
                    >
                      Retry
                    </button>
                  </div>
                ) : notifications.length === 0 ? (
                  pendingClearances.length === 0 && (
                    <div className="p-8 text-center text-xs text-muted">
                      <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-1.5" />
                      <p className="font-medium text-title">All caught up!</p>
                      <p className="text-[11px] text-muted mt-0.5">No notifications yet.</p>
                    </div>
                  )
                ) : (
                  notifications.map((n) => {
                    const { Icon, tone } = getNotificationIcon(n.type);
                    return (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => handleNotificationClick(n)}
                        className={`flex w-full items-start gap-3 p-3.5 text-left hover:bg-slate-50 transition-colors cursor-pointer ${
                          n.isRead ? "" : "bg-blue-50/30"
                        }`}
                      >
                        <div
                          className={`h-7 w-7 rounded-lg grid place-items-center shrink-0 mt-0.5 ${tone}`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0 text-xs">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={`text-title ${n.isRead ? "font-medium" : "font-semibold"}`}
                            >
                              {n.title}
                            </p>
                            {!n.isRead && (
                              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                            )}
                          </div>
                          {n.message && (
                            <p className="text-muted text-[11px] mt-0.5 line-clamp-2">
                              {n.message}
                            </p>
                          )}
                          {n.createdAt && (
                            <p className="text-slate-400 text-[10px] mt-1">
                              {formatDate(n.createdAt)}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
                {isNotifFetching && notifPage > 1 ? (
                  <div className="p-3 text-center text-[11px] text-muted">
                    <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Dropdown */}
        <div className="relative border-l border-line pl-4" ref={profileRef}>
          <button
            type="button"
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotifOpen(false);
            }}
            className="flex items-center gap-3 text-left cursor-pointer group"
          >
            <img
              src={user?.avatar}
              alt={user?.name || "Admin"}
              className="h-9 w-9 rounded-full object-cover ring-1 ring-line group-hover:ring-primary transition-all"
            />
            <div className="hidden md:block">
              <p className="text-xs font-semibold text-title leading-tight group-hover:text-primary transition-colors">
                {user?.name}
              </p>
              <p className="text-[10px] font-medium text-muted uppercase">Super Admin</p>
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-line bg-white p-2 shadow-lg z-50 animate-in fade-in slide-in-from-top-2 text-xs">
              <div className="p-2.5 border-b border-line/70">
                <p className="font-semibold text-title">{user?.name}</p>
                <p className="text-[11px] text-muted truncate">{user?.email}</p>
              </div>

              <div className="py-1">
                <Link
                  to={ROUTES.SETTINGS}
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-copy hover:bg-slate-50 hover:text-title transition-colors"
                >
                  <User className="h-4 w-4 text-muted" />
                  <span>Edit Profile</span>
                </Link>
                <Link
                  to={ROUTES.SETTINGS}
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-copy hover:bg-slate-50 hover:text-title transition-colors"
                >
                  <Settings className="h-4 w-4 text-muted" />
                  <span>Settings</span>
                </Link>
              </div>

              <div className="pt-1 border-t border-line/70">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    signOut(dispatch);
                    navigate(ROUTES.AUTH.LOGIN, { replace: true });
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </header>
  );
}

export default Topbar;
