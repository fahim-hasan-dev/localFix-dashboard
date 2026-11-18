import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { baseApi } from "@/api/baseApi";
import "@/api/auth.api";
import "@/api/overview.api";
import "@/api/users.api";
import "@/api/jobsOrders.api";
import "@/api/transactions.api";
import "@/api/subscriptions.api";
import "@/api/tickets.api";
import "@/api/notifications.api";
import "@/api/cms.api";
import "@/api/settings.api";
import { rootReducer } from "./rootReducer";

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(baseApi.middleware),
});

setupListeners(store.dispatch);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
