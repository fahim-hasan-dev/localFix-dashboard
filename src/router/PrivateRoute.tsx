import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { isDashboardRole, roleFromAccessToken } from "@/lib/adminRole";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const token = useAppSelector((state) => state.auth.token);
  const role = useAppSelector((state) => state.auth.user?.role);
  const allowed =
    isAuthenticated && isDashboardRole(role) && isDashboardRole(roleFromAccessToken(token));

  useEffect(() => {
    if (isAuthenticated && !allowed) {
      dispatch(logout());
    }
  }, [allowed, dispatch, isAuthenticated]);

  if (!allowed) {
    return (
      <Navigate to={ROUTES.AUTH.LOGIN} replace state={{ from: location.pathname }} />
    );
  }

  return <>{children}</>;
};
