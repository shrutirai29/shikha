import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { api, getErrorMessage } from "@/lib/api";
import { useAllUsers } from "@/hooks/useApi";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Badge, Card } from "@/components/ui/Card";
import { ErrorState, EmptyState } from "@/components/ui/States";
import { PageLoader } from "@/components/ui/Card";
import { PaginationBar } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatDate, initials } from "@/lib/utils";
import type { User } from "@/types";

export const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [roleModal, setRoleModal] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<"admin" | "customer" | "delivery_agent">("customer");

  const { data, isLoading, isError, error, refetch } = useAllUsers({
    page,
    limit: 10,
    search: search || undefined,
    role: (roleFilter || undefined) as "admin" | "customer" | undefined,
  });

  const invalidate = () =>
    void queryClient.invalidateQueries({ queryKey: ["admin-users"] });

  const toggleStatus = useMutation({
    mutationFn: async (target: User) => {
      const { data: response } = await api.patch<{ data: User }>(
        `/users/admin/${target._id}/status`,
        { isActive: !target.isActive }
      );
      return response.data;
    },
    onSuccess: (updated) => {
      toast.success(`${updated.name} ${updated.isActive ? "activated" : "deactivated"}`);
      invalidate();
    },
    onError: (statusError) => {
      toast.error(getErrorMessage(statusError));
    },
  });

  const changeRole = useMutation({
    mutationFn: async () => {
      if (!roleModal) return;
      const { data: response } = await api.patch<{ data: User }>(
        `/users/admin/${roleModal._id}/role`,
        { role: newRole }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("User role updated");
      setRoleModal(null);
      invalidate();
    },
    onError: (roleError) => {
      toast.error(getErrorMessage(roleError));
    },
  });

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Users</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage customer accounts and roles
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search by name or email…"
            className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(event) => {
            setRoleFilter(event.target.value);
            setPage(1);
          }}
          aria-label="Filter by role"
          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
        >
          <option value="">All roles</option>
          <option value="customer">Customers</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
      ) : !data?.users || data.users.length === 0 ? (
        <EmptyState title="No users found" description="Try adjusting your search." />
      ) : (
        <>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-700">
                    <th className="px-5 py-3 font-semibold">User</th>
                    <th className="px-5 py-3 font-semibold">Role</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Verified</th>
                    <th className="px-5 py-3 font-semibold">Joined</th>
                    <th className="px-5 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.users.map((target) => (
                    <tr
                      key={target._id}
                      className="border-b border-slate-100 last:border-0 dark:border-slate-700/60"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-indigo-300 text-xs font-bold text-white">
                            {initials(target.name)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900 dark:text-white">
                              {target.name}
                              {target._id === currentUser?._id && (
                                <span className="ml-1.5 text-xs font-normal text-slate-400">(you)</span>
                              )}
                            </p>
                            <p className="truncate text-xs text-slate-400">{target.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={target.role === "admin" ? "info" : "default"}>
                          {target.role}
                        </Badge>
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={target.isActive ? "success" : "danger"}>
                          {target.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                        {target.isVerified ? "Yes" : "No"}
                      </td>
                      <td className="px-5 py-3 text-slate-500 dark:text-slate-400">
                        {formatDate(target.createdAt)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={target._id === currentUser?._id}
                            onClick={() => {
                              setRoleModal(target);
                              setNewRole(target.role);
                            }}
                          >
                            Change role
                          </Button>
                          <Button
                            size="sm"
                            variant={target.isActive ? "danger" : "primary"}
                            disabled={target._id === currentUser?._id}
                            loading={toggleStatus.isPending}
                            onClick={() => toggleStatus.mutate(target)}
                          >
                            {target.isActive ? "Deactivate" : "Activate"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <PaginationBar pagination={data.pagination} onPageChange={setPage} />
        </>
      )}

      <Modal
        open={Boolean(roleModal)}
        onClose={() => setRoleModal(null)}
        title={`Change role — ${roleModal?.name ?? ""}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setRoleModal(null)}>
              Cancel
            </Button>
            <Button onClick={() => changeRole.mutate()} loading={changeRole.isPending}>
              Save role
            </Button>
          </>
        }
      >
        <div className="space-y-2">
          {(["customer", "admin", "delivery_agent"] as const).map((role) => (
            <label
              key={role}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 transition hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700"
            >
              <input
                type="radio"
                name="role"
                checked={newRole === role}
                onChange={() => setNewRole(role)}
                className="size-4 text-indigo-600"
              />
              <span className="text-sm font-medium capitalize text-slate-700 dark:text-slate-200">
                {role}
              </span>
            </label>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default UsersPage;
