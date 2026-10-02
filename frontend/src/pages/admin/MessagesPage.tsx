import { useState } from "react";
import {
  Mail,
  MessageCircle,
  Phone,
  Search,
  Trash2,
  User,
} from "lucide-react";
import {
  useContactMessages,
  useUpdateContactStatus,
  useDeleteContactMessage,
} from "@/hooks/useApi";
import { Badge, Card, Skeleton } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/States";
import { PaginationBar } from "@/components/ui/Pagination";
import { ConfirmDialog } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import { getErrorMessage } from "@/lib/api";
import { cn, formatDateTime } from "@/lib/utils";
import type { ContactMessage } from "@/types";

const statusVariant = (status: string) => {
  switch (status) {
    case "Resolved":
      return "success" as const;
    case "In Progress":
      return "info" as const;
    default:
      return "warning" as const;
  }
};

export const MessagesPage = () => {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<"New" | "In Progress" | "Resolved" | undefined>(
    undefined
  );
  const [search, setSearch] = useState("");
  const [toDelete, setToDelete] = useState<string | null>(null);

  const { data, isLoading } = useContactMessages({
    page,
    limit: 10,
    status,
    search: search || undefined,
  });

  const updateStatus = useUpdateContactStatus();
  const deleteMessage = useDeleteContactMessage();
  const toast = useToast();

  const handleStatusChange = async (
    id: string,
    newStatus: "New" | "In Progress" | "Resolved"
  ) => {
    try {
      await updateStatus.mutateAsync({ id, status: newStatus });
      toast.success(`Inquiry marked as ${newStatus}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;

    try {
      await deleteMessage.mutateAsync(toDelete);
      toast.success("Inquiry deleted");
      setToDelete(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const statuses: Array<"New" | "In Progress" | "Resolved"> = [
    "New",
    "In Progress",
    "Resolved",
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-[#3B2924] dark:text-[#FFF4E8]">
            Customer Inquiries & Custom Orders
          </h2>
          <p className="mt-1 text-sm text-[#806E66] dark:text-[#B3A198]">
            Manage bespoke crochet commission requests, product questions, and customer support
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter tabs */}
          <div className="flex items-center gap-1 rounded-full border border-[#E8DCD0] bg-[#FFFCF7] p-1 dark:border-[#382823] dark:bg-[#1A1210]/80">
            <button
              type="button"
              onClick={() => {
                setStatus(undefined);
                setPage(1);
              }}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold transition",
                status === undefined
                  ? "bg-[#B85C4A] text-white dark:bg-gradient-to-r dark:from-[#D47763] dark:to-[#B85C4A] dark:text-white dark:shadow-[0_2px_10px_rgba(212,119,99,0.35)]"
                  : "text-[#806E66] hover:text-[#3B2924] dark:text-[#B3A198] dark:hover:text-[#FFF4E8]"
              )}
            >
              All
            </button>
            {statuses.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setStatus(status === s ? undefined : s);
                  setPage(1);
                }}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold transition",
                  status === s
                    ? "bg-[#B85C4A] text-white dark:bg-gradient-to-r dark:from-[#D47763] dark:to-[#B85C4A] dark:text-white dark:shadow-[0_2px_10px_rgba(212,119,99,0.35)]"
                    : "text-[#806E66] hover:text-[#3B2924] dark:text-[#B3A198] dark:hover:text-[#FFF4E8]"
                )}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#806E66] dark:text-[#B3A198]" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search inquiries…"
              className="h-10 w-52 rounded-full border border-[#E8DCD0] bg-[#FFFCF7] pl-9 pr-4 text-sm text-[#3B2924] shadow-sm placeholder:text-[#806E66]/60 focus:border-[#B85C4A] focus:outline-none focus:ring-2 focus:ring-[#B85C4A]/20 dark:border-[#382823] dark:bg-[#1A1210]/90 dark:text-[#FFF4E8] dark:placeholder:text-[#B3A198]/50 dark:focus:border-[#D47763] dark:focus:ring-[#D47763]/25"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-6">
              <div className="space-y-3">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-72" />
                <Skeleton className="h-16 w-full" />
              </div>
            </Card>
          ))}
        </div>
      ) : !data?.messages || data.messages.length === 0 ? (
        <Card className="p-12 text-center">
          <EmptyState
            title="No inquiries found"
            description={
              search || status
                ? "Try clearing your filters or search terms."
                : "Customer messages and custom order inquiries submitted via the website will appear here."
            }
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {data.messages.map((item: ContactMessage) => {
            const cleanPhone = item.phone?.replace(/[^0-9]/g, "");
            const whatsappUrl = cleanPhone
              ? `https://wa.me/${cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone}?text=Hi%20${encodeURIComponent(
                  item.name
                )}%2C%20thank%20you%20for%20reaching%20out%20to%20Knottiingale!`
              : null;

            return (
              <Card
                key={item._id}
                className="overflow-hidden p-6 transition-all duration-200 hover:shadow-soft"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  {/* Left: Contact Info & Subject */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <Badge variant={statusVariant(item.status)}>
                        {item.status}
                      </Badge>
                      <h3 className="font-display text-lg font-semibold text-[#3B2924] dark:text-[#FFF4E8]">
                        {item.subject || "Custom Order Inquiry"}
                      </h3>
                      <span className="text-xs text-[#806E66] dark:text-[#B3A198]">
                        {formatDateTime(item.createdAt)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#806E66] dark:text-[#C7B8AE]">
                      <span className="flex items-center gap-1 font-medium text-[#3B2924] dark:text-[#FFF4E8]">
                        <User className="size-3.5 text-[#B85C4A] dark:text-[#D47763]" />
                        {item.name}
                      </span>
                      <a
                        href={`mailto:${item.email}`}
                        className="flex items-center gap-1 transition hover:text-[#B85C4A] dark:hover:text-[#D47763]"
                      >
                        <Mail className="size-3.5" />
                        {item.email}
                      </a>
                      {item.phone && (
                        <a
                          href={`tel:${item.phone}`}
                          className="flex items-center gap-1 transition hover:text-[#B85C4A] dark:hover:text-[#D47763]"
                        >
                          <Phone className="size-3.5" />
                          {item.phone}
                        </a>
                      )}
                      {whatsappUrl && (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-md bg-[#7A8B68]/10 px-2 py-0.5 font-medium text-[#7A8B68] transition hover:bg-[#7A8B68]/20 dark:bg-[#9BAF83]/20 dark:text-[#9BAF83]"
                        >
                          <MessageCircle className="size-3.5" />
                          Chat on WhatsApp
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2">
                    <select
                      value={item.status}
                      onChange={(e) =>
                        handleStatusChange(
                          item._id,
                          e.target.value as "New" | "In Progress" | "Resolved"
                        )
                      }
                      disabled={updateStatus.isPending}
                      className="rounded-xl border border-[#E8DCD0] bg-[#FFFCF7] px-3 py-1.5 text-xs font-semibold text-[#3B2924] shadow-sm outline-none transition focus:border-[#B85C4A] dark:border-[#382823] dark:bg-[#1A1210] dark:text-[#FFF4E8]"
                    >
                      <option value="New">Mark as New</option>
                      <option value="In Progress">Mark as In Progress</option>
                      <option value="Resolved">Mark as Resolved</option>
                    </select>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setToDelete(item._id)}
                      className="text-[#914536] hover:bg-[#B85C4A]/10 hover:text-[#B85C4A] dark:text-[#E28A76] dark:hover:bg-[#D47763]/20"
                      aria-label="Delete inquiry"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>

                {/* Message Body */}
                <div className="mt-4 rounded-xl border border-[#F0E6DC] bg-[#FAF5EF] p-4 text-sm leading-relaxed text-[#3B2924] dark:border-[#33221C] dark:bg-[#1E1513] dark:text-[#F0E6DC]">
                  <p className="whitespace-pre-wrap">{item.message}</p>
                </div>
              </Card>
            );
          })}

          {data.pagination && data.pagination.totalPages > 1 && (
            <div className="pt-2">
              <PaginationBar
                pagination={data.pagination}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        title="Delete customer inquiry?"
        description="Are you sure you want to delete this message? This action cannot be undone."
        confirmLabel="Delete inquiry"
        danger
        loading={deleteMessage.isPending}
      />
    </div>
  );
};

export default MessagesPage;
