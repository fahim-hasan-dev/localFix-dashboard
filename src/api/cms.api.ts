import { baseApi } from "@/api/baseApi";
import { buildDataFormData } from "@/api/client";
import { API_ENDPOINTS } from "@/api/endpoints";
import { buildQuery } from "@/lib/buildQuery";
import {
  mapBanner,
  mapCategory,
  mapFaq,
  mapMarqueeItem,
  mapRuleContent,
  mapSiteSettings,
  toFaqRole,
} from "@/lib/mappers/mapCms";
import { unwrapList, type UnwrappedList } from "@/lib/unwrapList";
import type {
  FaqItem,
  MarqueeItem,
  ServiceCategory,
  SiteBrandingConfig,
  SliderBanner,
} from "@/types/common.types";

function mapFaqList(response: unknown): UnwrappedList<FaqItem> {
  const list = unwrapList(response);
  return { ...list, items: list.items.map(mapFaq) };
}

function mapCategoryList(response: unknown): UnwrappedList<ServiceCategory> {
  const list = unwrapList(response);
  return { ...list, items: list.items.map(mapCategory) };
}

function mapMarqueeList(response: unknown): UnwrappedList<MarqueeItem> {
  const list = unwrapList(response);
  return { ...list, items: list.items.map(mapMarqueeItem) };
}

function mapBannerList(response: unknown): SliderBanner[] {
  const list = unwrapList(response);
  if (list.items.length) return list.items.map(mapBanner);
  const data = (response as { data?: unknown })?.data;
  if (Array.isArray(data)) return data.map(mapBanner);
  if (data && typeof data === "object") return [mapBanner(data)];
  return [];
}

function one<T>(response: unknown, map: (raw: unknown) => T): T {
  const data = (response as { data?: unknown })?.data ?? response;
  const nested = (data as { data?: unknown })?.data;
  return map(nested && typeof nested === "object" ? nested : data);
}

export const cmsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // —— FAQs ——
    getFaqs: build.query<UnwrappedList<FaqItem>, { role?: "homeowner" | "pro" } | void>({
      query: (params) => ({
        url: `${API_ENDPOINTS.faqs.root}${buildQuery({
          role: params?.role ? toFaqRole(params.role) : undefined,
        })}`,
        method: "GET",
      }),
      transformResponse: mapFaqList,
      providesTags: [{ type: "Cms", id: "FAQS" }],
    }),

    createFaq: build.mutation<
      FaqItem,
      { question: string; answer: string; role: "homeowner" | "pro" }
    >({
      query: ({ question, answer, role }) => ({
        url: API_ENDPOINTS.faqs.root,
        method: "POST",
        body: { question, answer, role: toFaqRole(role) },
      }),
      transformResponse: (r) => one(r, mapFaq),
      invalidatesTags: [{ type: "Cms", id: "FAQS" }],
    }),

    updateFaq: build.mutation<
      FaqItem,
      { id: string; question?: string; answer?: string; role?: "homeowner" | "pro" }
    >({
      query: ({ id, question, answer, role }) => ({
        url: API_ENDPOINTS.faqs.byId(id),
        method: "PATCH",
        body: {
          ...(question !== undefined ? { question } : {}),
          ...(answer !== undefined ? { answer } : {}),
          ...(role ? { role: toFaqRole(role) } : {}),
        },
      }),
      transformResponse: (r) => one(r, mapFaq),
      invalidatesTags: [{ type: "Cms", id: "FAQS" }],
    }),

    deleteFaq: build.mutation<unknown, string>({
      query: (id) => ({ url: API_ENDPOINTS.faqs.byId(id), method: "DELETE" }),
      invalidatesTags: [{ type: "Cms", id: "FAQS" }],
    }),

    // —— Categories ——
    getCategories: build.query<
      UnwrappedList<ServiceCategory>,
      { searchTerm?: string } | void
    >({
      query: (params) => ({
        url: `${API_ENDPOINTS.categories.root}${buildQuery({
          searchTerm: params?.searchTerm,
        })}`,
        method: "GET",
      }),
      transformResponse: mapCategoryList,
      providesTags: [{ type: "Categories", id: "LIST" }],
    }),

    getCategoryById: build.query<ServiceCategory, string>({
      query: (id) => ({ url: API_ENDPOINTS.categories.byId(id), method: "GET" }),
      transformResponse: (r) => one(r, mapCategory),
      providesTags: (_r, _e, id) => [{ type: "Categories", id }],
    }),

    createCategory: build.mutation<
      ServiceCategory,
      { name: string; coverImage?: File | null; icon?: File | null }
    >({
      query: ({ name, coverImage, icon }) => ({
        url: API_ENDPOINTS.categories.root,
        method: "POST",
        body: buildDataFormData({ name }, { coverImage, icon }),
      }),
      transformResponse: (r) => one(r, mapCategory),
      invalidatesTags: [{ type: "Categories", id: "LIST" }],
    }),

    updateCategory: build.mutation<
      ServiceCategory,
      { id: string; name: string; coverImage?: File | null; icon?: File | null }
    >({
      query: ({ id, name, coverImage, icon }) => ({
        url: API_ENDPOINTS.categories.byId(id),
        method: "PATCH",
        body: buildDataFormData({ name }, { coverImage, icon }),
      }),
      transformResponse: (r) => one(r, mapCategory),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Categories", id },
        { type: "Categories", id: "LIST" },
      ],
    }),

    deleteCategory: build.mutation<unknown, string>({
      query: (id) => ({ url: API_ENDPOINTS.categories.byId(id), method: "DELETE" }),
      invalidatesTags: [{ type: "Categories", id: "LIST" }],
    }),

    // —— Marquees ——
    getMarquees: build.query<UnwrappedList<MarqueeItem>, void>({
      query: () => ({ url: API_ENDPOINTS.marquees.root, method: "GET" }),
      transformResponse: mapMarqueeList,
      providesTags: [{ type: "Cms", id: "MARQUEES" }],
    }),

    createMarquee: build.mutation<MarqueeItem, { keyword: string }>({
      query: (body) => ({
        url: API_ENDPOINTS.marquees.root,
        method: "POST",
        body,
      }),
      transformResponse: (r) => one(r, mapMarqueeItem),
      invalidatesTags: [{ type: "Cms", id: "MARQUEES" }],
    }),

    updateMarquee: build.mutation<MarqueeItem, { id: string; keyword: string }>({
      query: ({ id, keyword }) => ({
        url: API_ENDPOINTS.marquees.byId(id),
        method: "PATCH",
        body: { keyword },
      }),
      transformResponse: (r) => one(r, mapMarqueeItem),
      invalidatesTags: [{ type: "Cms", id: "MARQUEES" }],
    }),

    deleteMarquee: build.mutation<unknown, string>({
      query: (id) => ({ url: API_ENDPOINTS.marquees.byId(id), method: "DELETE" }),
      invalidatesTags: [{ type: "Cms", id: "MARQUEES" }],
    }),

    // —— Banners ——
    getBanners: build.query<SliderBanner[], void>({
      query: () => ({ url: API_ENDPOINTS.banners.root, method: "GET" }),
      transformResponse: mapBannerList,
      providesTags: [{ type: "Cms", id: "BANNERS" }],
    }),

    createBanner: build.mutation<
      SliderBanner,
      { headline: string; description: string; image?: File | null }
    >({
      query: ({ headline, description, image }) => ({
        url: API_ENDPOINTS.banners.root,
        method: "POST",
        body: buildDataFormData({ headline, description }, { image }),
      }),
      transformResponse: (r) => one(r, mapBanner),
      invalidatesTags: [{ type: "Cms", id: "BANNERS" }],
    }),

    // —— Site settings ——
    getSiteSettings: build.query<Partial<SiteBrandingConfig>, void>({
      query: () => ({ url: API_ENDPOINTS.siteSettings.root, method: "GET" }),
      transformResponse: (r) => mapSiteSettings(r),
      providesTags: [{ type: "Settings", id: "SITE" }],
    }),

    saveSiteSettings: build.mutation<
      Partial<SiteBrandingConfig>,
      {
        data: {
          platformBrandName: string;
          supportEmail: string;
          supportPhone: string;
          address: string;
          facebookUrl?: string;
          instagramUrl?: string;
          linkedinUrl?: string;
        };
        favicon?: File | null;
        footerLogo?: File | null;
        headerLogo?: File | null;
      }
    >({
      query: ({ data, favicon, footerLogo, headerLogo }) => ({
        url: API_ENDPOINTS.siteSettings.root,
        method: "POST",
        body: buildDataFormData(data, { favicon, footerLogo, headerLogo }),
      }),
      transformResponse: (r) => mapSiteSettings(r),
      invalidatesTags: [{ type: "Settings", id: "SITE" }],
    }),

    // —— Rules / Legal ——
    getRule: build.query<string, "terms" | "privacy" | "dispute" | "about">({
      query: (type) => ({
        url: API_ENDPOINTS.rules.byType(type),
        method: "GET",
      }),
      transformResponse: (r) => mapRuleContent(r),
      providesTags: (_r, _e, type) => [{ type: "Cms", id: `RULE_${type}` }],
    }),

    saveRule: build.mutation<
      unknown,
      { type: "terms" | "privacy" | "dispute" | "about"; content: string }
    >({
      query: (body) => ({
        url: API_ENDPOINTS.rules.root,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { type }) => [{ type: "Cms", id: `RULE_${type}` }],
    }),
  }),
});

export const {
  useGetFaqsQuery,
  useCreateFaqMutation,
  useUpdateFaqMutation,
  useDeleteFaqMutation,
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetMarqueesQuery,
  useCreateMarqueeMutation,
  useUpdateMarqueeMutation,
  useDeleteMarqueeMutation,
  useGetBannersQuery,
  useCreateBannerMutation,
  useGetSiteSettingsQuery,
  useSaveSiteSettingsMutation,
  useGetRuleQuery,
  useLazyGetRuleQuery,
  useSaveRuleMutation,
} = cmsApi;
