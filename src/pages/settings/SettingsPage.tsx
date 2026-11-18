import React, { useEffect, useRef, useState } from "react";
import {
  User,
  Lock,
  CheckCircle2,
  Save,
  Eye,
  EyeOff,
  Upload,
  Users,
  Trash2,
  ShieldCheck,
  KeyRound,
  Plus,
  Loader2,
  AlertCircle,
  Power,
} from "lucide-react";
import {
  useChangePasswordMutation,
  useCreateAdminMutation,
  useDeleteAdminMutation,
  useGetAdminsQuery,
  useUpdateAdminStatusMutation,
  useUpdateProfileMutation,
} from "@/api/settings.api";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import { formatDate } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useUrlTab } from "@/hooks/useUrlTab";
import { setUser } from "@/store/slices/authSlice";

type TabKey = "profile" | "security" | "admins";

const ADMINS_PAGE_LIMIT = 10;

function formatRole(role: string): string {
  return role
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatMaybeDate(value: string): string {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : formatDate(value);
}

const Avatar: React.FC<{ src?: string; name: string; className: string }> = ({
  src,
  name,
  className,
}) =>
  src ? (
    <img src={src} alt={name} className={`${className} rounded-full object-cover ring-1 ring-line shrink-0`} />
  ) : (
    <div
      className={`${className} rounded-full bg-primary/10 text-primary ring-1 ring-line shrink-0 grid place-items-center font-semibold uppercase`}
    >
      {name.trim().charAt(0) || "A"}
    </div>
  );

const ErrorBanner: React.FC<{ message: string }> = ({ message }) => (
  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2">
    <AlertCircle className="w-4 h-4 shrink-0 mt-px" />
    <span>{message}</span>
  </div>
);

export const SettingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);

  const [activeTab, setActiveTab] = useUrlTab(
    ["profile", "security", "admins"] as const,
    "profile",
  );
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerNotice = (msg: string) => {
    setSavedNotice(msg);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setSavedNotice(null), 3500);
  };

  useEffect(
    () => () => {
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    },
    []
  );

  // ---------- Profile ----------
  const [updateProfile, { isLoading: isSavingProfile }] = useUpdateProfileMutation();
  const [name, setName] = useState(currentUser?.name ?? "");
  const [email, setEmail] = useState(currentUser?.email ?? "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [profileError, setProfileError] = useState("");

  // Keep the form in sync if the auth user changes (e.g. after profile fetch).
  useEffect(() => {
    setName(currentUser?.name ?? "");
    setEmail(currentUser?.email ?? "");
  }, [currentUser?.name, currentUser?.email]);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setProfileError("Please choose an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setProfileError("Profile photo must be 2MB or smaller.");
      return;
    }
    setProfileError("");
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    if (!name.trim()) {
      setProfileError("Name is required.");
      return;
    }

    try {
      const result = await updateProfile({
        name: name.trim(),
        profileImage: avatarFile,
      }).unwrap();
      dispatch(setUser(result));
      setAvatarFile(null);
      setAvatarPreview("");
      triggerNotice("Profile updated successfully");
    } catch (err) {
      setProfileError(getApiErrorMessage(err, "Failed to update profile."));
    }
  };

  // ---------- Security ----------
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (!currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    try {
      await changePassword({ currentPassword, newPassword, confirmPassword }).unwrap();
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      triggerNotice("Password changed successfully");
    } catch (err) {
      setPasswordError(getApiErrorMessage(err, "Failed to change password."));
    }
  };

  // ---------- Admins ----------
  const [adminsPage, setAdminsPage] = useState(1);
  const {
    data: adminsData,
    isLoading: isAdminsLoading,
    isFetching: isAdminsFetching,
    isError: isAdminsError,
    error: adminsError,
    refetch: refetchAdmins,
  } = useGetAdminsQuery({ page: adminsPage, limit: ADMINS_PAGE_LIMIT });
  const [createAdmin, { isLoading: isCreatingAdmin }] = useCreateAdminMutation();
  const [updateAdminStatus] = useUpdateAdminStatusMutation();
  const [deleteAdmin] = useDeleteAdminMutation();

  const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [createAdminError, setCreateAdminError] = useState("");
  const [adminActionError, setAdminActionError] = useState("");
  const [pendingAdminId, setPendingAdminId] = useState<string | null>(null);

  const admins = adminsData?.items ?? [];
  const adminsTotalPages = adminsData?.totalPages ?? 1;

  const closeAddAdminModal = () => {
    setIsAddAdminModalOpen(false);
    setCreateAdminError("");
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateAdminError("");
    if (!newAdminName.trim() || !newAdminEmail.trim()) return;
    if (newAdminPassword.length < 8) {
      setCreateAdminError("Password must be at least 8 characters.");
      return;
    }

    try {
      const created = await createAdmin({
        name: newAdminName.trim(),
        email: newAdminEmail.trim(),
        password: newAdminPassword,
      }).unwrap();
      setNewAdminName("");
      setNewAdminEmail("");
      setNewAdminPassword("");
      closeAddAdminModal();
      triggerNotice(`New admin "${created.name}" added successfully`);
    } catch (err) {
      setCreateAdminError(getApiErrorMessage(err, "Failed to create administrator."));
    }
  };

  const handleToggleStatus = async (id: string, status: "active" | "inactive") => {
    setAdminActionError("");
    setPendingAdminId(id);
    const next = status === "active" ? "inactive" : "active";
    try {
      await updateAdminStatus({ id, status: next }).unwrap();
      triggerNotice(`Administrator ${next === "active" ? "activated" : "deactivated"}`);
    } catch (err) {
      setAdminActionError(getApiErrorMessage(err, "Failed to update administrator status."));
    } finally {
      setPendingAdminId(null);
    }
  };

  const handleRevokeAdmin = async (id: string, adminName: string) => {
    if (!window.confirm(`Revoke administrator access for ${adminName}?`)) return;
    setAdminActionError("");
    setPendingAdminId(id);
    try {
      await deleteAdmin(id).unwrap();
      if (admins.length === 1 && adminsPage > 1) setAdminsPage((p) => p - 1);
      triggerNotice(`Admin access revoked for ${adminName}.`);
    } catch (err) {
      setAdminActionError(getApiErrorMessage(err, "Failed to remove administrator."));
    } finally {
      setPendingAdminId(null);
    }
  };

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: "profile", label: "Profile", icon: <User className="w-4 h-4" /> },
    { key: "admins", label: "Admins & Team", icon: <Users className="w-4 h-4" /> },
    { key: "security", label: "Security", icon: <Lock className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Admin profile, team access, and security."
        action={
          savedNotice ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{savedNotice}</span>
            </div>
          ) : undefined
        }
      />

      <div className="flex flex-wrap items-center gap-2 border-b border-line pb-3">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === tab.key
                ? "bg-primary text-white shadow-xs"
                : "text-muted hover:bg-slate-100 hover:text-title"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: PROFILE */}
      {activeTab === "profile" && (
        <form onSubmit={handleSaveProfile} className="space-y-6 max-w-2xl">
          <Card className="p-6 space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-title">Account Details</h3>
              <p className="text-xs text-muted mt-0.5">
                Update your administrator profile name and photo. Email cannot be changed.
              </p>
            </div>

            {profileError && <ErrorBanner message={profileError} />}

            <div className="flex items-center gap-4 py-2">
              <Avatar
                src={avatarPreview || currentUser?.avatar}
                name={name || currentUser?.name || "Admin"}
                className="h-16 w-16 text-xl"
              />
              <div className="space-y-1.5">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-line bg-white text-xs font-medium text-title hover:bg-slate-50 cursor-pointer transition-colors shadow-2xs">
                  <Upload className="w-3.5 h-3.5 text-muted" />
                  <span>{avatarFile ? "Change Photo" : "Upload Photo"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarSelect}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-muted">
                  {avatarFile ? `${avatarFile.name} — save to apply.` : "JPG, PNG or GIF up to 2MB."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <Input
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                required
              />
              <Input
                label="Email"
                type="email"
                value={email}
                disabled
                helperText="Email cannot be changed."
              />
            </div>

            <div className="flex justify-end pt-3 border-t border-line">
              <Button
                size="sm"
                variant="primary"
                type="submit"
                isLoading={isSavingProfile}
                className="flex items-center gap-1.5"
              >
                {!isSavingProfile && <Save className="w-4 h-4" />}
                <span>{isSavingProfile ? "Saving..." : "Save Profile"}</span>
              </Button>
            </div>
          </Card>
        </form>
      )}

      {/* TAB 2: ADMINS & TEAM */}
      {activeTab === "admins" && (
        <div className="space-y-6">
          <Card className="p-0 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-title">Administrators</h3>
                <p className="text-xs text-muted mt-0.5">
                  Authorized personnel with administrative credentials to HomeFix Control Center.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => setIsAddAdminModalOpen(true)}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Administrator</span>
              </Button>
            </div>

            {adminActionError && (
              <div className="p-4 pb-0">
                <ErrorBanner message={adminActionError} />
              </div>
            )}

            {isAdminsLoading ? (
              <div className="py-14 flex items-center justify-center gap-2 text-xs text-muted">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading administrators...</span>
              </div>
            ) : isAdminsError ? (
              <div className="py-12 flex flex-col items-center gap-3 text-center px-4">
                <p className="text-xs text-rose-600 font-medium">
                  {getApiErrorMessage(adminsError, "Failed to load administrators.")}
                </p>
                <Button size="sm" variant="outline" onClick={() => refetchAdmins()}>
                  Retry
                </Button>
              </div>
            ) : (
              <div className={`overflow-x-auto ${isAdminsFetching ? "opacity-70" : ""}`}>
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-line/70 bg-slate-50/60 text-xs font-medium text-muted uppercase tracking-wider">
                      <th className="py-2.5 px-5 whitespace-nowrap">Administrator</th>
                      <th className="py-2.5 px-4 whitespace-nowrap">Email</th>
                      <th className="py-2.5 px-4 whitespace-nowrap">Role</th>
                      <th className="py-2.5 px-4 whitespace-nowrap">Status</th>
                      <th className="py-2.5 px-4 whitespace-nowrap">Date Added</th>
                      <th className="py-2.5 px-4 whitespace-nowrap">Last Updated</th>
                      <th className="py-2.5 px-5 text-right whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/60">
                    {admins.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-xs text-muted">
                          No administrators found.
                        </td>
                      </tr>
                    )}
                    {admins.map((admin) => {
                      const isSelf = admin.id === currentUser?.id;
                      const isPending = pendingAdminId === admin.id;
                      return (
                        <tr key={admin.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-5 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <Avatar src={admin.avatar} name={admin.name} className="h-8 w-8 text-xs" />
                              <span className="font-semibold text-title">
                                {admin.name}
                                {isSelf && (
                                  <span className="ml-1.5 text-[11px] font-normal text-muted">(you)</span>
                                )}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-xs text-muted whitespace-nowrap">{admin.email}</td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <Badge variant={admin.role === "super_admin" ? "primary" : "neutral"}>
                              {formatRole(admin.role)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <Badge variant={admin.status === "active" ? "success" : "neutral"} dot>
                              {admin.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-xs text-muted whitespace-nowrap">
                            {formatMaybeDate(admin.addedDate)}
                          </td>
                          <td className="py-3 px-4 text-xs text-muted whitespace-nowrap">
                            {formatMaybeDate(admin.lastActive)}
                          </td>
                          <td className="py-3 px-5 text-right whitespace-nowrap">
                            {isSelf ? (
                              <span className="text-[11px] text-muted italic">Current User</span>
                            ) : (
                              <div className="inline-flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs h-7 px-2 whitespace-nowrap"
                                  disabled={isPending}
                                  onClick={() => handleToggleStatus(admin.id, admin.status)}
                                >
                                  <Power className="w-3.5 h-3.5 mr-1" />
                                  {admin.status === "active" ? "Deactivate" : "Activate"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs h-7 px-2 text-rose-600 hover:text-rose-700 hover:border-rose-300 whitespace-nowrap"
                                  disabled={isPending}
                                  onClick={() => handleRevokeAdmin(admin.id, admin.name)}
                                >
                                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                                  Revoke
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {adminsTotalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-line text-xs text-muted">
                <span>
                  Page {adminsPage} of {adminsTotalPages}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={adminsPage <= 1 || isAdminsFetching}
                    onClick={() => setAdminsPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={adminsPage >= adminsTotalPages || isAdminsFetching}
                    onClick={() => setAdminsPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {isAddAdminModalOpen && (
            <Modal
              isOpen={isAddAdminModalOpen}
              onClose={closeAddAdminModal}
              title="Add New Administrator"
              maxWidth="md"
            >
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <p className="text-xs text-muted -mt-2">
                  Grant administrative credentials to a new team member with full dashboard access.
                </p>

                {createAdminError && <ErrorBanner message={createAdminError} />}

                <div className="space-y-3 pt-1">
                  <Input
                    label="Full Name"
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    placeholder="e.g. Alex Henderson"
                    required
                  />
                  <Input
                    label="Work Email"
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="e.g. alex@localhomefix.com"
                    required
                  />
                  <Input
                    label="Password"
                    type="password"
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    required
                  />

                  <div className="p-3 rounded-xl bg-slate-50 border border-line text-xs text-muted flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-title block">Assigned Role: Administrator</span>
                      <p className="text-[11px] mt-0.5">
                        Will be granted administrative access to manage platform orders, contractors,
                        support tickets, and content.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-line">
                  <Button type="button" variant="outline" size="sm" onClick={closeAddAdminModal}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={isCreatingAdmin}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isCreatingAdmin ? "Adding..." : "Add Administrator"}
                  </Button>
                </div>
              </form>
            </Modal>
          )}
        </div>
      )}

      {/* TAB 3: SECURITY */}
      {activeTab === "security" && (
        <div className="space-y-6 max-w-2xl">
          <form onSubmit={handleChangePassword}>
            <Card className="p-6 space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-title">Password</h3>
                <p className="text-xs text-muted mt-0.5">
                  Update your password to keep your administrator account secure.
                </p>
              </div>

              {passwordError && <ErrorBanner message={passwordError} />}

              <div className="space-y-3.5 text-xs">
                <Input
                  label="Current Password"
                  type={showPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                />
                <Input
                  label="New Password"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                />
                <Input
                  label="Confirm New Password"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="inline-flex items-center gap-1.5 text-muted hover:text-title text-xs font-medium cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPassword ? "Hide passwords" : "Show passwords"}</span>
                </button>
              </div>

              <div className="flex justify-end pt-3 border-t border-line">
                <Button
                  size="sm"
                  variant="primary"
                  type="submit"
                  isLoading={isChangingPassword}
                  className="flex items-center gap-1.5"
                >
                  {!isChangingPassword && <KeyRound className="w-4 h-4" />}
                  <span>{isChangingPassword ? "Updating..." : "Update Password"}</span>
                </Button>
              </div>
            </Card>
          </form>
        </div>
      )}

    </div>
  );
};

export default SettingsPage;
