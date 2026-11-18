import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SubscriptionPackage } from "@/types/common.types";

interface SubscriptionsState {
  /** Legacy local cache (no longer seeded). Live data comes from RTK Query. */
  packages: SubscriptionPackage[];
  filterInterval: "all" | "monthly" | "annually";
  selectedPackageId: string | null;
}

const initialState: SubscriptionsState = {
  packages: [],
  filterInterval: "all",
  selectedPackageId: null,
};

export const subscriptionsSlice = createSlice({
  name: "subscriptions",
  initialState,
  reducers: {
    setFilterInterval: (
      state,
      action: PayloadAction<SubscriptionsState["filterInterval"]>
    ) => {
      state.filterInterval = action.payload;
    },
    setSelectedPackageId: (state, action: PayloadAction<string | null>) => {
      state.selectedPackageId = action.payload;
    },
  },
});

export const { setFilterInterval, setSelectedPackageId } =
  subscriptionsSlice.actions;

export default subscriptionsSlice.reducer;
