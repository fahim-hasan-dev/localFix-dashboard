import { baseApi } from "@/api/baseApi";
import { API_ENDPOINTS } from "@/api/endpoints";
import { buildQuery } from "@/lib/buildQuery";
import {
  mapSupportTicket,
  type CreateTicketPayload,
} from "@/lib/mappers/mapTicket";
import { unwrapList, type UnwrappedList } from "@/lib/unwrapList";
import type { SupportTicket, TicketStatus } from "@/types/common.types";

export interface TicketsListParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: string;
  priority?: string;
}

function mapList(response: unknown): UnwrappedList<SupportTicket> {
  const list = unwrapList(response);
  return { ...list, items: list.items.map(mapSupportTicket) };
}

function mapOne(response: unknown): SupportTicket {
  const data = (response as { data?: unknown })?.data ?? response;
  const nested = (data as { data?: unknown })?.data;
  return mapSupportTicket(nested && typeof nested === "object" ? nested : data);
}

export const ticketsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getSupportTickets: build.query<UnwrappedList<SupportTicket>, TicketsListParams | void>({
      query: (params) => ({
        url: `${API_ENDPOINTS.supportTickets.root}${buildQuery({
          page: params?.page,
          limit: params?.limit,
          searchTerm: params?.searchTerm,
          status: params?.status,
          priority: params?.priority,
        })}`,
        method: "GET",
      }),
      transformResponse: mapList,
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: "Tickets" as const, id })),
              { type: "Tickets", id: "LIST" },
            ]
          : [{ type: "Tickets", id: "LIST" }],
    }),

    getSupportTicketById: build.query<SupportTicket, string>({
      query: (id) => ({
        url: API_ENDPOINTS.supportTickets.byId(id),
        method: "GET",
      }),
      transformResponse: mapOne,
      providesTags: (_r, _e, id) => [{ type: "Tickets", id }],
    }),

    createSupportTicket: build.mutation<SupportTicket, CreateTicketPayload>({
      query: (body) => ({
        url: API_ENDPOINTS.supportTickets.root,
        method: "POST",
        body,
      }),
      transformResponse: mapOne,
      invalidatesTags: [{ type: "Tickets", id: "LIST" }],
    }),

    replySupportTicket: build.mutation<unknown, { id: string; message: string }>({
      query: ({ id, message }) => ({
        url: API_ENDPOINTS.supportTickets.reply(id),
        method: "POST",
        body: { message },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Tickets", id },
        { type: "Tickets", id: "LIST" },
      ],
    }),

    updateSupportTicket: build.mutation<
      unknown,
      { id: string; status?: TicketStatus | string; priority?: string }
    >({
      query: ({ id, ...body }) => ({
        url: API_ENDPOINTS.supportTickets.byId(id),
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Tickets", id },
        { type: "Tickets", id: "LIST" },
      ],
    }),

    deleteSupportTicket: build.mutation<unknown, string>({
      query: (id) => ({
        url: API_ENDPOINTS.supportTickets.byId(id),
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Tickets", id: "LIST" }],
    }),
  }),
});

export const {
  useGetSupportTicketsQuery,
  useGetSupportTicketByIdQuery,
  useCreateSupportTicketMutation,
  useReplySupportTicketMutation,
  useUpdateSupportTicketMutation,
  useDeleteSupportTicketMutation,
} = ticketsApi;
