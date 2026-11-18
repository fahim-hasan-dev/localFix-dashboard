import type { Dispatch, UnknownAction } from "@reduxjs/toolkit";
import { baseApi } from "@/api/baseApi";
import { logout } from "@/store/slices/authSlice";

/** Clear auth session + RTK Query cache in one place. */
export function signOut(dispatch: Dispatch<UnknownAction>) {
  dispatch(logout());
  dispatch(baseApi.util.resetApiState());
}
