import { baseApi } from "@/api/baseApi";
import { buildDataFormData } from "@/api/client";
import { API_ENDPOINTS } from "@/api/endpoints";
import { buildQuery } from "@/lib/buildQuery";
import { mapAdminUser } from "@/lib/mapAdminUser";
import { mapTeamAdmin, type TeamAdmin } from "@/lib/mappers/mapCms";
import { unwrapList, type UnwrappedList } from "@/lib/unwrapList";
import type { AuthUserDto } from "@/types/auth.types";
import type { AdminUser } from "@/types/auth.types";

function mapAdmins(response: unknown): UnwrappedList<TeamAdmin> {
  const list = unwrapList(response);
  return { ...list, items: list.items.map(mapTeamAdmin) };
}

function mapProfile(response: unknown): AdminUser {
  const data = (response as { data?: unknown })?.data ?? response;
  const nested = (data as { data?: unknown })?.data;
  const dto = (nested && typeof nested === "object" ? nested : data) as AuthUserDto;
  return mapAdminUser(dto);
}

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    updateProfile: build.mutation<
      AdminUser,
      { name: string; email?: string; profileImage?: File | null }
    >({
      query: ({ name, email, profileImage }) => ({
        url: API_ENDPOINTS.users.root,
        method: "PATCH",
        body: buildDataFormData(
          {
            name,
            ...(email ? { email } : {}),
          },
          { profileImage }
        ),
      }),
      transformResponse: (r) => mapProfile(r),
      invalidatesTags: ["Auth"],
    }),

    changePassword: build.mutation<
      unknown,
      { currentPassword: string; newPassword: string; confirmPassword: string }
    >({
      query: (body) => ({
        url: API_ENDPOINTS.auth.changePassword,
        method: "POST",
        body,
      }),
    }),

    getAdmins: build.query<
      UnwrappedList<TeamAdmin>,
      { page?: number; limit?: number; searchTerm?: string; status?: string } | void
    >({
      query: (params) => ({
        url: `${API_ENDPOINTS.users.admins}${buildQuery({
          page: params?.page,
          limit: params?.limit,
          searchTerm: params?.searchTerm,
          status: params?.status,
        })}`,
        method: "GET",
      }),
      transformResponse: mapAdmins,
      providesTags: [{ type: "Settings", id: "ADMINS" }],
    }),

    createAdmin: build.mutation<
      TeamAdmin,
      { name: string; email: string; password: string; role?: string }
    >({
      query: (body) => ({
        url: API_ENDPOINTS.users.createAdmin,
        method: "POST",
        body: {
          name: body.name,
          email: body.email,
          password: body.password,
          role: body.role || "admin",
        },
      }),
      transformResponse: (r) => {
        const data = (r as { data?: unknown })?.data ?? r;
        return mapTeamAdmin(data);
      },
      invalidatesTags: [{ type: "Settings", id: "ADMINS" }],
    }),

    updateAdminStatus: build.mutation<
      unknown,
      { id: string; status: "active" | "inactive" }
    >({
      query: ({ id, status }) => ({
        url: API_ENDPOINTS.users.adminStatus(id),
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: [{ type: "Settings", id: "ADMINS" }],
    }),

    deleteAdmin: build.mutation<unknown, string>({
      query: (id) => ({
        url: API_ENDPOINTS.users.adminById(id),
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Settings", id: "ADMINS" }],
    }),
  }),
});

export const {
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useGetAdminsQuery,
  useCreateAdminMutation,
  useUpdateAdminStatusMutation,
  useDeleteAdminMutation,
} = settingsApi;
