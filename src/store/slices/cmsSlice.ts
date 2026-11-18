import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/**
 * CMS content (FAQs, marquee, banners, rules, site settings) is now loaded
 * from the API via RTK Query (`@/api/cms.api`). This slice only keeps
 * lightweight UI state and no longer persists anything to localStorage.
 */
interface CmsState {
  faqAudienceFilter: "all" | "homeowner" | "pro";
}

const initialState: CmsState = {
  faqAudienceFilter: "all",
};

export const cmsSlice = createSlice({
  name: "cms",
  initialState,
  reducers: {
    setFaqAudienceFilter: (
      state,
      action: PayloadAction<CmsState["faqAudienceFilter"]>
    ) => {
      state.faqAudienceFilter = action.payload;
    },
  },
});

export const { setFaqAudienceFilter } = cmsSlice.actions;

export default cmsSlice.reducer;
