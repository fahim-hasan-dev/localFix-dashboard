import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Review, ReviewStatus } from "@/types/common.types";

/**
 * Reviews are not yet backed by an admin API in this dashboard.
 * Keep local UI/filter state only — no mock seed.
 */
interface ReviewsState {
  reviews: Review[];
  searchQuery: string;
  ratingFilter: number | "all";
  statusFilter: ReviewStatus | "all";
  categoryFilter: string | "all";
}

const initialState: ReviewsState = {
  reviews: [],
  searchQuery: "",
  ratingFilter: "all",
  statusFilter: "all",
  categoryFilter: "all",
};

export const reviewsSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setRatingFilter: (state, action: PayloadAction<number | "all">) => {
      state.ratingFilter = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<ReviewStatus | "all">) => {
      state.statusFilter = action.payload;
    },
    setCategoryFilter: (state, action: PayloadAction<string | "all">) => {
      state.categoryFilter = action.payload;
    },
    approveReview: (state, action: PayloadAction<string>) => {
      const review = state.reviews.find((r) => r.id === action.payload);
      if (review) {
        review.status = "published";
      }
    },
    hideReview: (
      state,
      action: PayloadAction<{ id: string; notes?: string }>
    ) => {
      const review = state.reviews.find((r) => r.id === action.payload.id);
      if (review) {
        review.status = "hidden";
        if (action.payload.notes) {
          review.moderationNotes = action.payload.notes;
        }
      }
    },
    flagReview: (
      state,
      action: PayloadAction<{ id: string; reason: string }>
    ) => {
      const review = state.reviews.find((r) => r.id === action.payload.id);
      if (review) {
        review.status = "flagged";
        review.flagReason = action.payload.reason;
      }
    },
    moderateProReply: (
      state,
      action: PayloadAction<{ id: string; text: string; approve?: boolean }>
    ) => {
      const review = state.reviews.find((r) => r.id === action.payload.id);
      if (!review) return;
      review.reply = {
        text: action.payload.text,
        createdAt: review.reply?.createdAt ?? new Date().toISOString(),
        proName: review.reply?.proName ?? review.proName,
        isModerated: action.payload.approve ?? true,
      };
    },
    deleteProReply: (state, action: PayloadAction<string>) => {
      const review = state.reviews.find((r) => r.id === action.payload);
      if (review) {
        delete review.reply;
      }
    },
    deleteReview: (state, action: PayloadAction<string>) => {
      state.reviews = state.reviews.filter((r) => r.id !== action.payload);
    },
  },
});

export const {
  setSearchQuery,
  setRatingFilter,
  setStatusFilter,
  setCategoryFilter,
  approveReview,
  hideReview,
  flagReview,
  moderateProReply,
  deleteProReply,
  deleteReview,
} = reviewsSlice.actions;

export default reviewsSlice.reducer;
