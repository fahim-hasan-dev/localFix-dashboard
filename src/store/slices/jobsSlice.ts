import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { JobLead, JobStatus, JobUrgency, JobQuote } from "@/types/common.types";
interface JobsState {
  jobs: JobLead[];
  searchQuery: string;
  categoryFilter: string | "all";
  statusFilter: JobStatus | "all";
  urgencyFilter: JobUrgency | "all";
}

const initialState: JobsState = {
  jobs: [],
  searchQuery: "",
  categoryFilter: "all",
  statusFilter: "all",
  urgencyFilter: "all",
};

export const jobsSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setCategoryFilter: (state, action: PayloadAction<string | "all">) => {
      state.categoryFilter = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<JobStatus | "all">) => {
      state.statusFilter = action.payload;
    },
    setUrgencyFilter: (state, action: PayloadAction<JobUrgency | "all">) => {
      state.urgencyFilter = action.payload;
    },
    updateJobStatus: (
      state,
      action: PayloadAction<{ id: string; status: JobStatus }>
    ) => {
      const job = state.jobs.find((j) => j.id === action.payload.id);
      if (job) {
        job.status = action.payload.status;
      }
    },
    acceptQuote: (
      state,
      action: PayloadAction<{ jobId: string; quoteId: string; proId: string }>
    ) => {
      const job = state.jobs.find((j) => j.id === action.payload.jobId);
      if (job) {
        job.selectedQuoteId = action.payload.quoteId;
        job.hiredProId = action.payload.proId;
        job.status = "hired";
        job.quotes.forEach((q) => {
          if (q.id === action.payload.quoteId) {
            q.status = "accepted";
          } else if (q.status === "pending") {
            q.status = "declined";
          }
        });
      }
    },
    addQuote: (
      state,
      action: PayloadAction<{ jobId: string; quote: JobQuote }>
    ) => {
      const job = state.jobs.find((j) => j.id === action.payload.jobId);
      if (job) {
        job.quotes.push(action.payload.quote);
        job.quotesCount = job.quotes.length;
        if (job.status === "getting_quotes") {
          job.status = "quotes_in";
        }
      }
    },
    deleteJob: (state, action: PayloadAction<string>) => {
      state.jobs = state.jobs.filter((j) => j.id !== action.payload);
    },
  },
});

export const {
  setSearchQuery,
  setCategoryFilter,
  setStatusFilter,
  setUrgencyFilter,
  updateJobStatus,
  acceptQuote,
  addQuote,
  deleteJob,
} = jobsSlice.actions;

export default jobsSlice.reducer;

