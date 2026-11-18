import { baseApi } from "@/api/baseApi";
import { API_ENDPOINTS } from "@/api/endpoints";
import { mapAdminNotification, type AdminNotification } from "@/lib/mappers/mapNotification";
import { unwrapList, type UnwrappedList } from "@/lib/unwrapList";

export type AdminNotificationList = UnwrappedList<AdminNotification> & {
  unreadCount: number;
};

function mapList(response: unknown): AdminNotificationList {
  const root = response as { meta?: { unreadCount?: number }; data?: unknown };
  const unreadCount = Number(root.meta?.unreadCount || 0);
  const list = unwrapList(response);
  if (list.items.length === 0) {
    const data = root.data;
    if (Array.isArray(data)) {
      return {
        items: data.map(mapAdminNotification),
        total: data.length,
        page: 1,
        limit: data.length,
        totalPages: 1,
        unreadCount,
      };
    }
  }
  return { ...list, items: list.items.map(mapAdminNotification), unreadCount };
}

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAdminNotifications: build.query<
      AdminNotificationList,
      { page: number; limit: number }
    >({
      query: ({ page, limit }) => ({
        url: API_ENDPOINTS.notifications.admin,
        method: "GET",
        params: { page, limit },
      }),
      serializeQueryArgs: ({ endpointName }) => endpointName,
      merge: (current, incoming) => {
        if (incoming.page <= 1) return incoming;
        const seen = new Set(current.items.map((item) => item.id));
        return {
          ...incoming,
          items: [...current.items, ...incoming.items.filter((item) => !seen.has(item.id))],
        };
      },
      forceRefetch: ({ currentArg, previousArg }) => currentArg?.page !== previousArg?.page,
      transformResponse: mapList,
      providesTags: [{ type: "Audit", id: "NOTIFS" }],
    }),

    markAllAdminNotificationsRead: build.mutation<unknown, void>({
      query: () => ({
        url: API_ENDPOINTS.notifications.admin,
        method: "PATCH",
      }),
      invalidatesTags: [{ type: "Audit", id: "NOTIFS" }],
    }),

    markAdminNotificationRead: build.mutation<unknown, string>({
      query: (id) => ({
        url: API_ENDPOINTS.notifications.adminReadById(id),
        method: "PATCH",
      }),
      invalidatesTags: [{ type: "Audit", id: "NOTIFS" }],
    }),
  }),
});

export const {
  useGetAdminNotificationsQuery,
  useMarkAllAdminNotificationsReadMutation,
  useMarkAdminNotificationReadMutation,
} = notificationsApi;
