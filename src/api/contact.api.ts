import { baseApi } from "@/api/baseApi";
import { API_ENDPOINTS } from "@/api/endpoints";
import { buildQuery } from "@/lib/buildQuery";
import {
  mapContactMessage,
  type ContactMessage,
  type ContactPriority,
  type ContactStatus,
} from "@/lib/mappers/mapContact";
import { unwrapList, type UnwrappedList } from "@/lib/unwrapList";

export interface ContactsListParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: string;
  priority?: string;
}

function mapList(response: unknown): UnwrappedList<ContactMessage> {
  const list = unwrapList(response);
  return { ...list, items: list.items.map(mapContactMessage) };
}

function mapOne(response: unknown): ContactMessage {
  const data = (response as { data?: unknown })?.data ?? response;
  const nested = (data as { data?: unknown })?.data;
  return mapContactMessage(nested && typeof nested === "object" ? nested : data);
}

export const contactApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getContactMessages: build.query<UnwrappedList<ContactMessage>, ContactsListParams | void>({
      query: (params) => ({
        url: `${API_ENDPOINTS.contact.root}${buildQuery({
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
              ...result.items.map(({ id }) => ({ type: "Contacts" as const, id })),
              { type: "Contacts", id: "LIST" },
            ]
          : [{ type: "Contacts", id: "LIST" }],
    }),

    getContactMessageById: build.query<ContactMessage, string>({
      query: (id) => ({
        url: API_ENDPOINTS.contact.byId(id),
        method: "GET",
      }),
      transformResponse: mapOne,
      providesTags: (_r, _e, id) => [{ type: "Contacts", id }],
    }),

    updateContactMessage: build.mutation<
      ContactMessage,
      { id: string; status?: ContactStatus; priority?: ContactPriority }
    >({
      query: ({ id, ...body }) => ({
        url: API_ENDPOINTS.contact.byId(id),
        method: "PATCH",
        body,
      }),
      transformResponse: mapOne,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Contacts", id },
        { type: "Contacts", id: "LIST" },
      ],
    }),

    deleteContactMessage: build.mutation<unknown, string>({
      query: (id) => ({
        url: API_ENDPOINTS.contact.byId(id),
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Contacts", id: "LIST" }],
    }),
  }),
});

export const {
  useGetContactMessagesQuery,
  useGetContactMessageByIdQuery,
  useUpdateContactMessageMutation,
  useDeleteContactMessageMutation,
} = contactApi;
