import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RotateCcw } from "lucide-react";
import { api, getErrorMessage } from "@/lib/api";
import { useAllPayments } from "@/hooks/useApi";
import { useToast } from "@/context/ToastContext";
import { Badge, Card } from "@/components/ui/Card";
import { ErrorState, EmptyState } from "@/components/ui/States";
import { PageLoader } from "@/components/ui/Card";
import { PaginationBar } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { Payment } from "@/types";

const statusVariant = (status: string) => {
  switch (status) {
    case "Paid":
      return "success" as const;
    case "Refunded":
      return "info" as const;
    case "Failed":
      return "danger" as const;
    default:
      return "warning" as const;
  }
};

export const PaymentsPage = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useAllPayments(page);

  const [refundTarget, setRefundTarget] = useState<Payment | null>(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");

  const invalidate = () =>
    void queryClient.invalidateQueries({ queryKey: ["admin-payments"] });

  const refundMutation = useMutation({
    mutationFn: async () => {
      if (!refundTarget) return;

      const { data: response } = await api.post<{ data: Payment }>(
        `/payments/${refundTarget._id}/refund`,
        {
          amount: refundAmount ? Number(refundAmount) : undefined,
          reason: refundReason || undefined,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Refund processed");
      setRefundTarget(null);
      setRefundAmount("");
      setRefundReason("");
      invalidate();
    },
    onError: (refundError) => {
      toast.error(getErrorMessage(refundError));
    },
  });

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#3B2924] dark:text-[#FFF4E8]">
          Payments
        </h1>
        <p className="mt-1 text-sm text-[#806E66] dark:text-[#B3A198]">
          Track transactions and issue customer refunds
        </p>
      </div>

      {isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
      ) : !data?.payments || data.payments.length === 0 ? (
        <EmptyState title="No payments yet" description="Payments made by customers will appear here." />
      ) : (
        <>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E8DCD0] text-xs uppercase tracking-wide text-[#806E66] dark:border-[#382823] dark:text-[#B3A198]">
                    <th className="px-5 py-3 font-semibold">Payment</th>
                    <th className="px-5 py-3 font-semibold">Customer</th>
                    <th className="px-5 py-3 font-semibold">Order</th>
                    <th className="px-5 py-3 font-semibold">Amount</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Date</th>
                    <th className="px-5 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.payments.map((payment) => {
                    const customer =
                      typeof payment.user === "string" ? null : payment.user;
                    const order =
                      typeof payment.order === "string" ? null : payment.order;

                    return (
                      <tr
                        key={payment._id}
                        className="border-b border-[#E8DCD0]/60 last:border-0 hover:bg-[#F5EDE4]/30 dark:border-[#382823]/60 dark:hover:bg-[#251B18]/40 transition-colors"
                      >
                        <td className="px-5 py-3">
                          <p className="font-mono text-xs font-semibold text-[#806E66] dark:text-[#B3A198]">
                            {payment.razorpayOrderId.slice(-10)}
                          </p>
                          <p className="text-xs text-[#806E66]/80 dark:text-[#B3A198]/70">{payment.currency}</p>
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-semibold text-[#3B2924] dark:text-[#FFF4E8]">
                            {customer?.name ?? "—"}
                          </p>
                          <p className="text-xs text-[#806E66] dark:text-[#B3A198]">{customer?.email ?? "—"}</p>
                        </td>
                        <td className="px-5 py-3 text-[#806E66] dark:text-[#B3A198]">
                          {order ? `#${order._id.slice(-6).toUpperCase()}` : "—"}
                        </td>
                        <td className="px-5 py-3 font-semibold text-[#3B2924] dark:text-[#FFF4E8]">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="px-5 py-3">
                          <Badge variant={statusVariant(payment.status)}>
                            {payment.status}
                          </Badge>
                          {payment.refundId && (
                            <p className="mt-0.5 text-xs text-[#806E66] dark:text-[#B3A198]">
                              Refund: {formatCurrency(payment.refundAmount ?? 0)}
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-3 text-[#806E66] dark:text-[#B3A198]">
                          {formatDateTime(payment.createdAt)}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex justify-end">
                            {payment.status === "Paid" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setRefundTarget(payment);
                                  setRefundAmount("");
                                  setRefundReason("");
                                }}
                              >
                                <RotateCcw className="size-3.5" /> Refund
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          <PaginationBar pagination={data.pagination} onPageChange={setPage} />
        </>
      )}

      <Modal
        open={Boolean(refundTarget)}
        onClose={() => setRefundTarget(null)}
        title="Refund payment"
        footer={
          <>
            <Button variant="outline" onClick={() => setRefundTarget(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => refundMutation.mutate()}
              loading={refundMutation.isPending}
            >
              Process refund
            </Button>
          </>
        }
      >
        {refundTarget && (
          <div className="space-y-4">
            <p className="text-sm text-[#806E66] dark:text-[#B3A198]">
              Refunding <span className="font-bold text-[#3B2924] dark:text-[#FFF4E8]">{formatCurrency(refundTarget.amount)}</span>{" "}
              for payment{" "}
              <span className="font-mono text-[#B85C4A] dark:text-[#E0B86A]">{refundTarget.razorpayOrderId.slice(-10)}</span>.
            </p>
            <Input
              label="Refund amount (₹) — leave empty for full refund"
              type="number"
              min={0}
              step="0.01"
              max={refundTarget.amount}
              value={refundAmount}
              onChange={(event) => setRefundAmount(event.target.value)}
            />
            <Input
              label="Reason (optional)"
              value={refundReason}
              onChange={(event) => setRefundReason(event.target.value)}
              placeholder="Customer requested refund"
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PaymentsPage;
