import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/**
 * Category data now comes from the API (see `@/api/cms.api`).
 * This slice only keeps lightweight UI filter state.
 */
interface CategoriesState {
  searchQuery: string;
  statusFilter: "all" | "active" | "draft" | "popular";
}

const initialState: CategoriesState = {
  searchQuery: "",
  statusFilter: "all",
};

export const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setStatusFilter: (
      state,
      action: PayloadAction<CategoriesState["statusFilter"]>
    ) => {
      state.statusFilter = action.payload;
    },
  },
});

export const { setSearchQuery, setStatusFilter } = categoriesSlice.actions;

export default categoriesSlice.reducer;
