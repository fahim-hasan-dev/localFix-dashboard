import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Order } from "@/types/common.types";
interface OrdersState {
  orders: Order[];
  searchQuery: string;
  fulfillmentFilter: "all" | Order["fulfillmentStatus"];
  paymentFilter: "all" | Order["paymentStatus"];
  selectedOrderId: string | null;
}

const initialState: OrdersState = {
  orders: [],
  searchQuery: "",
  fulfillmentFilter: "all",
  paymentFilter: "all",
  selectedOrderId: null,
};

export const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setFulfillmentFilter: (
      state,
      action: PayloadAction<OrdersState["fulfillmentFilter"]>
    ) => {
      state.fulfillmentFilter = action.payload;
    },
    setPaymentFilter: (
      state,
      action: PayloadAction<OrdersState["paymentFilter"]>
    ) => {
      state.paymentFilter = action.payload;
    },
    setSelectedOrderId: (state, action: PayloadAction<string | null>) => {
      state.selectedOrderId = action.payload;
    },
    updateOrderStatus: (
      state,
      action: PayloadAction<{ id: string; status: Order["fulfillmentStatus"] }>
    ) => {
      const order = state.orders.find((o) => o.id === action.payload.id);
      if (order) {
        order.fulfillmentStatus = action.payload.status;
        if (action.payload.status === "completed") {
          order.completedDate = new Date().toISOString().split("T")[0];
        }
      }
    },
    updateOrderPayment: (
      state,
      action: PayloadAction<{ id: string; paymentStatus: Order["paymentStatus"] }>
    ) => {
      const order = state.orders.find((o) => o.id === action.payload.id);
      if (order) {
        order.paymentStatus = action.payload.paymentStatus;
      }
    },
  },
});

export const {
  setSearchQuery,
  setFulfillmentFilter,
  setPaymentFilter,
  setSelectedOrderId,
  updateOrderStatus,
  updateOrderPayment,
} = ordersSlice.actions;

export default ordersSlice.reducer;
