import { useEffect, useRef } from "react";
import { baseApi } from "@/api/baseApi";
import {
  connectRealtimeSocket,
  disconnectRealtimeSocket,
  userIdFromAccessToken,
} from "@/lib/realtimeSocket";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const NOTIF_TAG = { type: "Audit" as const, id: "NOTIFS" };

const LIVE_TAGS = {
  ticketUpdated: ["Tickets", "Audit"],
  bookingUpdated: ["Orders", "Jobs", "Audit"],
  jobUpdated: ["Jobs", "Audit"],
  quoteUpdated: ["Jobs", "Orders", "Audit"],
} as const;

type LiveTag = { type: "Audit" | "Tickets" | "Orders" | "Jobs"; id?: string };

export function RealtimeSync() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const userId = useAppSelector((state) => state.auth.user?.id);
  const timer = useRef<number | null>(null);
  const pending = useRef<LiveTag[]>([]);

  useEffect(() => {
    if (!token) return;
    const id = userIdFromAccessToken(token) || userId || "";
    if (!id) return;

    const socket = connectRealtimeSocket(token);
    let connectedOnce = false;

    const refresh = (tags: LiveTag[]) => {
      pending.current.push(...tags);
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        const next = pending.current;
        pending.current = [];
        if (next.length) dispatch(baseApi.util.invalidateTags(next));
      }, 150);
    };

    const onConnect = () => {
      socket.emit("register", { userId: id });
      if (connectedOnce) {
        refresh([
          NOTIF_TAG,
          { type: "Tickets" },
          { type: "Orders" },
          { type: "Jobs" },
          { type: "Audit" },
        ]);
      }
      connectedOnce = true;
    };

    const onAny = (eventName: string, payload: unknown) => {
      const live = (Object.keys(LIVE_TAGS) as (keyof typeof LIVE_TAGS)[]).find((name) =>
        eventName.startsWith(`${name}::`),
      );
      if (live && eventName.endsWith(`::${id}`)) {
        refresh(LIVE_TAGS[live].map((type) => ({ type })));
        return;
      }
      if (!eventName.startsWith("send-notification::")) return;
      const type =
        payload && typeof payload === "object"
          ? String((payload as { type?: unknown }).type || "").toLowerCase()
          : "";
      if (eventName.endsWith(`::${id}`) || type === "admin" || type === "super_admin") {
        refresh([NOTIF_TAG]);
      }
    };

    const onReconnectAttempt = () => {
      socket.auth = { token };
      const opts = socket.io.opts as { query?: Record<string, string> };
      opts.query = { ...(opts.query || {}), token };
    };

    socket.on("connect", onConnect);
    if (socket.connected) onConnect();
    socket.onAny(onAny);
    socket.io.on("reconnect_attempt", onReconnectAttempt);

    return () => {
      if (timer.current) window.clearTimeout(timer.current);
      socket.off("connect", onConnect);
      socket.offAny(onAny);
      socket.io.off("reconnect_attempt", onReconnectAttempt);
      disconnectRealtimeSocket();
    };
  }, [dispatch, token, userId]);

  return null;
}
