import { baseApi } from "@/api/baseApi";
import { API_ENDPOINTS } from "@/api/endpoints";
import { buildQuery } from "@/lib/buildQuery";
import {
  mapTransaction,
  mapTransactionStats,
  type TransactionStats,
} from "@/lib/mappers/mapTransaction";
import { unwrapList, type UnwrappedList } from "@/lib/unwrapList";
import type { Transaction } from "@/types/common.types";

export interface TransactionsListParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: string;
}

function mapList(response: unknown): UnwrappedList<Transaction> {
  const list = unwrapList(response);
  return { ...list, items: list.items.map(mapTransaction) };
}

function mapOne(response: unknown): Transaction {
  const data = (response as { data?: unknown })?.data ?? response;
  const nested = (data as { data?: unknown })?.data;
  return mapTransaction(nested && typeof nested === "object" ? nested : data);
}

export const transactionsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getTransactionStats: build.query<TransactionStats, void>({
      query: () => ({
        url: API_ENDPOINTS.admin.transactionStats,
        method: "GET",
      }),
      transformResponse: (response: unknown) => mapTransactionStats(response),
      providesTags: [{ type: "Transactions", id: "STATS" }],
    }),

    getTransactions: build.query<UnwrappedList<Transaction>, TransactionsListParams | void>({
      query: (params) => ({
        url: `${API_ENDPOINTS.admin.transactions}${buildQuery({
          page: params?.page,
          limit: params?.limit,
          searchTerm: params?.searchTerm,
          status: params?.status,
        })}`,
        method: "GET",
      }),
      transformResponse: mapList,
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: "Transactions" as const, id })),
              { type: "Transactions", id: "LIST" },
            ]
          : [{ type: "Transactions", id: "LIST" }],
    }),

    getTransactionById: build.query<Transaction, string>({
      query: (id) => ({
        url: API_ENDPOINTS.admin.transactionById(id),
        method: "GET",
      }),
      transformResponse: mapOne,
      providesTags: (_r, _e, id) => [{ type: "Transactions", id }],
    }),

    refundTransaction: build.mutation<unknown, { id: string; amount?: number; reason?: string }>({
      query: ({ id, amount, reason }) => ({
        url: API_ENDPOINTS.admin.transactionById(id),
        method: "POST",
        body: {
          ...(amount !== undefined ? { amount } : {}),
          ...(reason ? { reason } : {}),
        },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Transactions", id },
        { type: "Transactions", id: "LIST" },
        { type: "Transactions", id: "STATS" },
      ],
    }),
  }),
});

export const {
  useGetTransactionStatsQuery,
  useGetTransactionsQuery,
  useGetTransactionByIdQuery,
  useLazyGetTransactionByIdQuery,
  useRefundTransactionMutation,
} = transactionsApi;
