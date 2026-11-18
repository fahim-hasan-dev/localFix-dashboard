import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ROUTES } from "@/constants/routes";
import { PrivateRoute } from "@/router/PrivateRoute";

import DashboardPage from "@/pages/dashboard/DashboardPage";
import CategoryDetailPage from "@/pages/categories/CategoryDetailPage";
import UsersPage from "@/pages/users/UsersPage";
import UserDetailsPage from "@/pages/users/UserDetailsPage";
import OrdersPage from "@/pages/orders/OrdersPage";
import OrderDetailsPage from "@/pages/orders/OrderDetailsPage";
import TransactionsPage from "@/pages/transactions/TransactionsPage";
import SubscriptionsPage from "@/pages/subscriptions/SubscriptionsPage";
import ProsReviewPage from "@/pages/pros/ProsReviewPage";
import TicketsPage from "@/pages/tickets/TicketsPage";
import TicketDetailsPage from "@/pages/tickets/TicketDetailsPage";
import CmsPage from "@/pages/content/CmsPage";
import SettingsPage from "@/pages/settings/SettingsPage";
import JobLeadDetailsPage from "@/pages/jobs/JobLeadDetailsPage";
import { LoginPage } from "@/pages/auth/LoginPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: ROUTES.AUTH.LOGIN,
    element: <LoginPage initialMode="login" />,
  },
  {
    path: ROUTES.AUTH.FORGOT_PASSWORD,
    element: <LoginPage initialMode="forgot_email" />,
  },
  {
    path: ROUTES.DASHBOARD,
    element: (
      <PrivateRoute>
        <AppLayout />
      </PrivateRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "jobs",
        element: <Navigate to={`${ROUTES.ORDERS.LIST}?tab=quotes`} replace />,
      },
      {
        path: "jobs/:id",
        element: <JobLeadDetailsPage />,
      },
      {
        path: "reviews",
        element: <Navigate to={ROUTES.USERS.LIST} replace />,
      },
      {
        path: "categories",
        element: <Navigate to={`${ROUTES.CMS}?tab=categories`} replace />,
      },
      {
        path: "categories/:id",
        element: <CategoryDetailPage />,
      },
      {
        path: "users",
        element: <UsersPage />,
      },
      {
        path: "users/:id",
        element: <UserDetailsPage />,
      },
      {
        path: "orders",
        element: <OrdersPage />,
      },
      {
        path: "orders/:id",
        element: <OrderDetailsPage />,
      },
      {
        path: "transactions",
        element: <TransactionsPage />,
      },
      {
        path: "subscriptions",
        element: <SubscriptionsPage />,
      },
      {
        path: "clearance",
        element: <ProsReviewPage />,
      },
      {
        path: "pros-clearance",
        element: <Navigate to={ROUTES.CLEARANCE} replace />,
      },
      {
        path: "disputes",
        element: <Navigate to={ROUTES.DASHBOARD} replace />,
      },
      {
        path: "disputes/:id",
        element: <Navigate to={ROUTES.DASHBOARD} replace />,
      },
      {
        path: "tickets",
        element: <TicketsPage />,
      },
      {
        path: "tickets/:id",
        element: <TicketDetailsPage />,
      },
      {
        path: "support",
        element: <Navigate to={ROUTES.TICKETS.LIST} replace />,
      },
      {
        path: "cms",
        element: <CmsPage />,
      },
      {
        path: "content-cms",
        element: <Navigate to={ROUTES.CMS} replace />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
      {
        path: "settings/branding",
        element: <Navigate to={ROUTES.CMS} replace />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
