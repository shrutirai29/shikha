import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CreditCard, Loader2, ShieldCheck, TriangleAlert } from "lucide-react";
import { api, getErrorMessage } from "@/lib/api";
import { useOrder } from "@/hooks/useApi";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageLoader } from "@/components/ui/Card";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { RazorpayOrder } from "@/types";

const loadRazorpayScript = (): Promise<boolean> =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export const PaymentPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const { data: order, isLoading: orderLoading } = useOrder(orderId);
  const [paymentOrder, setPaymentOrder] = useState<RazorpayOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const initiatePayment = useCallback(async () => {
    if (!orderId) return;

    setLoading(true);
    setError("");

    try {
      const { data } = await api.post<{ data: RazorpayOrder }>(
        "/payments/create-order",
        { orderId }
      );

      setPaymentOrder(data.data);
    } catch (paymentError) {
      setError(getErrorMessage(paymentError));
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (order && order.paymentMethod === "RAZORPAY" && order.paymentStatus === "Pending") {
      void initiatePayment();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);

  const handlePay = async () => {
    if (!paymentOrder || !order) return;

    const scriptLoaded = await loadRazorpayScript();

    if (!scriptLoaded) {
      toast.error("Unable to load the payment gateway. Please try again.");
      return;
    }

    const options: RazorpayOptions = {
      key: paymentOrder.key,
      amount: paymentOrder.amount,
      currency: paymentOrder.currency,
      name: "Knottiingale",
      description: `Knottiingale Order #${order._id.slice(-6).toUpperCase()}`,
      order_id: paymentOrder.razorpayOrderId,
      prefill: {
        name: user?.name,
        email: user?.email,
        contact: user?.phone,
      },
      theme: { color: "#B85C4A" },
      handler: async (response) => {
        try {
          await api.post("/payments/verify", {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });

          toast.success("Payment successful! Your order is confirmed.");
          navigate(`/orders/${order._id}`, { replace: true });
        } catch (verifyError) {
          toast.error(getErrorMessage(verifyError));
        }
      },
      modal: {
        ondismiss: () => {
          toast.info("Payment cancelled. You can retry from your orders page.");
        },
      },
    };

    const razorpay = new window.Razorpay!(options);

    razorpay.open();
  };

  if (orderLoading) {
    return <PageLoader />;
  }

  if (!order) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <TriangleAlert className="size-10 text-rose-500" />
          <h1 className="text-xl font-bold text-[#3B2924] dark:text-[#FFF4E8]">Order not found</h1>
          <Link to="/orders" className="text-sm font-semibold text-[#B85C4A] hover:text-[#914536] dark:text-[#D47763] dark:hover:text-[#E28A76]">
            Back to my orders
          </Link>
        </div>
      </PageLayout>
    );
  }

  if (order.paymentMethod !== "RAZORPAY") {
    return (
      <PageLayout>
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <ShieldCheck className="size-10 text-[#7A8B68]" />
          <h1 className="text-xl font-bold text-[#3B2924] dark:text-[#FFF4E8]">
            This order uses Cash on Delivery
          </h1>
          <Link
            to={`/orders/${order._id}`}
            className="rounded-xl bg-[#B85C4A] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#914536]"
          >
            View order
          </Link>
        </div>
      </PageLayout>
    );
  }

  if (order.paymentStatus === "Paid" || order.paymentStatus === "Refunded") {
    return (
      <PageLayout>
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <ShieldCheck className="size-10 text-[#7A8B68]" />
          <h1 className="text-xl font-bold text-[#3B2924] dark:text-[#FFF4E8]">
            {order.paymentStatus === "Paid" ? "Payment completed" : "Payment refunded"}
          </h1>
          <p className="text-sm text-[#806E66] dark:text-[#C7B8AE]">
            Amount: {formatCurrency(order.totalAmount)}
          </p>
          <Link
            to={`/orders/${order._id}`}
            className="rounded-xl bg-[#B85C4A] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#914536]"
          >
            View order
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Payment" subtitle="Complete your payment securely">
      <div className="mx-auto max-w-md">
        <Card className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="size-5 text-[#B85C4A] dark:text-[#D47763]" />
              <h2 className="text-base font-semibold text-[#3B2924] dark:text-[#FFF4E8]">
                Razorpay secure checkout
              </h2>
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-[#7A8B68] dark:text-[#9BAF83]">
              <ShieldCheck className="size-4" /> 256-bit encrypted
            </span>
          </div>

          <dl className="space-y-3 border-y border-[#E8DCD0] py-4 text-sm dark:border-[#493A34]">
            <div className="flex justify-between text-[#806E66] dark:text-[#C7B8AE]">
              <dt>Order</dt>
              <dd className="font-medium text-[#3B2924] dark:text-[#FFF4E8]">
                #{order._id.slice(-6).toUpperCase()}
              </dd>
            </div>
            <div className="flex justify-between text-[#806E66] dark:text-[#C7B8AE]">
              <dt>Placed on</dt>
              <dd>{formatDateTime(order.createdAt)}</dd>
            </div>
            <div className="flex justify-between text-base font-bold text-[#3B2924] dark:text-[#FFF4E8]">
              <dt>Amount due</dt>
              <dd>{formatCurrency(order.totalAmount)}</dd>
            </div>
          </dl>

          {error && (
            <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
              {error}
            </p>
          )}

          <div className="mt-5 space-y-3">
            {paymentOrder ? (
              <Button size="lg" className="w-full" onClick={handlePay}>
                <CreditCard className="size-5" />
                Pay {formatCurrency(order.totalAmount)} now
              </Button>
            ) : (
              <Button size="lg" className="w-full" onClick={initiatePayment} loading={loading}>
                {loading ? "Preparing payment…" : "Start payment"}
              </Button>
            )}

            <Link
              to={`/orders/${order._id}`}
              className="block text-center text-sm font-medium text-[#806E66] transition hover:text-[#3B2924] dark:text-[#C7B8AE] dark:hover:text-[#FFF4E8]"
            >
              Pay later — go to order details
            </Link>
          </div>
        </Card>

        {loading && (
          <p className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-400">
            <Loader2 className="size-4 animate-spin" /> Contacting payment gateway…
          </p>
        )}
      </div>
    </PageLayout>
  );
};

export default PaymentPage;
