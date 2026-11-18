import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Dispute } from "@/types/common.types";

interface DisputesState {
  disputes: Dispute[];
  filterStatus: "all" | "open" | "under_review" | "resolved" | "closed";
  selectedDisputeId: string | null;
}

const initialState: DisputesState = {
  disputes: [],
  filterStatus: "all",
  selectedDisputeId: null,
};

export const disputesSlice = createSlice({
  name: "disputes",
  initialState,
  reducers: {
    setFilterStatus: (state, action: PayloadAction<DisputesState["filterStatus"]>) => {
      state.filterStatus = action.payload;
    },
    setSelectedDisputeId: (state, action: PayloadAction<string | null>) => {
      state.selectedDisputeId = action.payload;
    },
    resolveDispute: (
      state,
      action: PayloadAction<{
        id: string;
        resolutionType: Dispute["resolutionType"];
        notes: string;
      }>
    ) => {
      const item = state.disputes.find((d) => d.id === action.payload.id);
      if (item) {
        item.status =
          action.payload.resolutionType === "full_refund"
            ? "resolved_refund"
            : action.payload.resolutionType === "full_release"
            ? "resolved_payout"
            : action.payload.resolutionType === "partial_split" || action.payload.resolutionType === "custom"
            ? "resolved_split"
            : "closed";
        item.resolutionType = action.payload.resolutionType;
        item.resolutionNotes = action.payload.notes;
        item.resolvedAt = new Date().toISOString().split("T")[0];
      }
    },
  },
});

export const { setFilterStatus, setSelectedDisputeId, resolveDispute } =
  disputesSlice.actions;

export default disputesSlice.reducer;
