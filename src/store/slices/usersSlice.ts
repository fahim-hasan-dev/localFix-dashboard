import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/types/common.types";

interface UsersState {
  users: User[];
  searchQuery: string;
  roleFilter: "all" | "homeowner" | "pro";
  statusFilter: "all" | "active" | "banned" | "pending_clearance";
  selectedUserId: string | null;
}

const initialState: UsersState = {
  users: [],
  searchQuery: "",
  roleFilter: "all",
  statusFilter: "all",
  selectedUserId: null,
};

export const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setRoleFilter: (state, action: PayloadAction<UsersState["roleFilter"]>) => {
      state.roleFilter = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<UsersState["statusFilter"]>) => {
      state.statusFilter = action.payload;
    },
    setSelectedUserId: (state, action: PayloadAction<string | null>) => {
      state.selectedUserId = action.payload;
    },
  },
});

export const {
  setSearchQuery,
  setRoleFilter,
  setStatusFilter,
  setSelectedUserId,
} = usersSlice.actions;

export default usersSlice.reducer;
