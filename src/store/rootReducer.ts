import { combineReducers } from "@reduxjs/toolkit";
import { baseApi } from "@/api/baseApi";
import authReducer from "./slices/authSlice";
import usersReducer from "./slices/usersSlice";
import ordersReducer from "./slices/ordersSlice";
import subscriptionsReducer from "./slices/subscriptionsSlice";
import prosReducer from "./slices/prosSlice";
import disputesReducer from "./slices/disputesSlice";
import transactionsReducer from "./slices/transactionsSlice";
import cmsReducer from "./slices/cmsSlice";
import settingsReducer from "./slices/settingsSlice";
import auditReducer from "./slices/auditSlice";
import categoriesReducer from "./slices/categoriesSlice";
import ticketsReducer from "./slices/ticketsSlice";
import reviewsReducer from "./slices/reviewsSlice";
import jobsReducer from "./slices/jobsSlice";

export const rootReducer = combineReducers({
  auth: authReducer,
  users: usersReducer,
  orders: ordersReducer,
  subscriptions: subscriptionsReducer,
  pros: prosReducer,
  disputes: disputesReducer,
  transactions: transactionsReducer,
  cms: cmsReducer,
  settings: settingsReducer,
  audit: auditReducer,
  categories: categoriesReducer,
  tickets: ticketsReducer,
  reviews: reviewsReducer,
  jobs: jobsReducer,
  [baseApi.reducerPath]: baseApi.reducer,
});
