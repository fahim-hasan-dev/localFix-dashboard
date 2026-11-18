import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Transaction } from "@/types/common.types";

interface TransactionsState {
  /** Legacy local cache (no longer seeded). Live data comes from RTK Query. */
  transactions: Transaction[];
  searchQuery: string;
  typeFilter: "all" | "pro_subscription" | "direct_job_payout";
  statusFilter: "all" | "settled" | "refunded";
  selectedTransactionId: string | null;
}

const initialState: TransactionsState = {
  transactions: [],
  searchQuery: "",
  typeFilter: "all",
  statusFilter: "all",
  selectedTransactionId: null,
};

export const transactionsSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setTypeFilter: (
      state,
      action: PayloadAction<TransactionsState["typeFilter"]>
    ) => {
      state.typeFilter = action.payload;
    },
    setStatusFilter: (
      state,
      action: PayloadAction<TransactionsState["statusFilter"]>
    ) => {
      state.statusFilter = action.payload;
    },
    setSelectedTransactionId: (state, action: PayloadAction<string | null>) => {
      state.selectedTransactionId = action.payload;
    },
  },
});

export const {
  setSearchQuery,
  setTypeFilter,
  setStatusFilter,
  setSelectedTransactionId,
} = transactionsSlice.actions;

export default transactionsSlice.reducer;
