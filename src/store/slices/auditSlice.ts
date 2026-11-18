import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AdminAuditLog } from "@/types/common.types";

interface AuditState {
  logs: AdminAuditLog[];
}

const initialState: AuditState = {
  logs: [],
};

export const auditSlice = createSlice({
  name: "audit",
  initialState,
  reducers: {
    addAuditLog: (
      state,
      action: PayloadAction<Omit<AdminAuditLog, "id" | "timestamp">>
    ) => {
      const now = new Date();
      const timestamp = `${now.toISOString().split("T")[0]} ${now
        .toTimeString()
        .slice(0, 8)}`;
      state.logs.unshift({
        ...action.payload,
        id: `log-${Date.now()}`,
        timestamp,
      });
    },
  },
});

export const { addAuditLog } = auditSlice.actions;
export default auditSlice.reducer;
