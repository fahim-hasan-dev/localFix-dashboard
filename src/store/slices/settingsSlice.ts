import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SiteBrandingConfig } from "@/types/common.types";

/**
 * Site branding is loaded from the API (`useGetSiteSettingsQuery`).
 * This slice only holds an optional in-memory copy with empty defaults.
 */
const emptyBranding: SiteBrandingConfig = {
  siteName: "",
  siteLogoUrl: "",
  siteFooterLogoUrl: "",
  siteFaviconUrl: "",
  supportEmail: "",
  contactPhone: "",
  physicalAddress: "",
  socialMedia: {
    facebook: "",
    instagram: "",
    linkedin: "",
    twitter: "",
    youtube: "",
  },
  sliderBanners: [],
};

interface SettingsState {
  branding: SiteBrandingConfig;
}

const initialState: SettingsState = {
  branding: emptyBranding,
};

export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setBranding: (
      state,
      action: PayloadAction<Partial<SiteBrandingConfig>>
    ) => {
      state.branding = {
        ...state.branding,
        ...action.payload,
        socialMedia: {
          ...state.branding.socialMedia,
          ...(action.payload.socialMedia ?? {}),
        },
      };
    },
  },
});

export const { setBranding } = settingsSlice.actions;

export default settingsSlice.reducer;
