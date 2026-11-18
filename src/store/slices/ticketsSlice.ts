import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  SupportTicket,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from "@/types/common.types";

interface TicketsState {
  /** Live tickets are served by RTK Query (`tickets.api`); this stays empty. */
  tickets: SupportTicket[];
  searchQuery: string;
  statusFilter: "all" | TicketStatus;
  priorityFilter: "all" | TicketPriority;
  categoryFilter: "all" | TicketCategory;
  userTypeFilter: "all" | "homeowner" | "pro";
  selectedTicketId: string | null;
}

const initialState: TicketsState = {
  tickets: [],
  searchQuery: "",
  statusFilter: "all",
  priorityFilter: "all",
  categoryFilter: "all",
  userTypeFilter: "all",
  selectedTicketId: null,
};

export const ticketsSlice = createSlice({
  name: "tickets",
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<TicketsState["statusFilter"]>) => {
      state.statusFilter = action.payload;
    },
    setPriorityFilter: (state, action: PayloadAction<TicketsState["priorityFilter"]>) => {
      state.priorityFilter = action.payload;
    },
    setCategoryFilter: (state, action: PayloadAction<TicketsState["categoryFilter"]>) => {
      state.categoryFilter = action.payload;
    },
    setUserTypeFilter: (state, action: PayloadAction<TicketsState["userTypeFilter"]>) => {
      state.userTypeFilter = action.payload;
    },
    selectTicket: (state, action: PayloadAction<string | null>) => {
      state.selectedTicketId = action.payload;
    },
  },
});

export const {
  setSearchQuery,
  setStatusFilter,
  setPriorityFilter,
  setCategoryFilter,
  setUserTypeFilter,
  selectTicket,
} = ticketsSlice.actions;

export default ticketsSlice.reducer;
