import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ProClearance } from "@/types/common.types";

interface ProsState {
  clearances: ProClearance[];
  filterLevel: "all" | "cleared" | "pending" | "action_required" | "rejected";
}

const initialState: ProsState = {
  clearances: [],
  filterLevel: "pending",
};

export const prosSlice = createSlice({
  name: "pros",
  initialState,
  reducers: {
    setFilterLevel: (state, action: PayloadAction<ProsState["filterLevel"]>) => {
      state.filterLevel = action.payload;
    },
  },
});

export const { setFilterLevel } = prosSlice.actions;

export default prosSlice.reducer;
