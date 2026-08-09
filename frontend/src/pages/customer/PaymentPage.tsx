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
      name: "Shikha",
      description: `Order #${order._id.slice(-6).toUpperCase()}`,
      order_id: paymentOrder.razorpayOrderId,
      prefill: {
        name: user?.name,
        email: user?.email,
        contact: user?.phone,
      },
      theme: { color: "#4f46e5" },
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
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Order not found</h1>
          <Link to="/orders" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
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
          <ShieldCheck className="size-10 text-emerald-500" />
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            This order uses Cash on Delivery
          </h1>
          <Link
            to={`/orders/${order._id}`}
            className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
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
          <ShieldCheck className="size-10 text-emerald-500" />
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {order.paymentStatus === "Paid" ? "Payment completed" : "Payment refunded"}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Amount: {formatCurrency(order.totalAmount)}
          </p>
          <Link
            to={`/orders/${order._id}`}
            className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
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
              <CreditCard className="size-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Razorpay secure checkout
              </h2>
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="size-4" /> 256-bit encrypted
            </span>
          </div>

          <dl className="space-y-3 border-y border-slate-200 py-4 text-sm dark:border-slate-700">
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <dt>Order</dt>
              <dd className="font-medium text-slate-900 dark:text-white">
                #{order._id.slice(-6).toUpperCase()}
              </dd>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <dt>Placed on</dt>
              <dd>{formatDateTime(order.createdAt)}</dd>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900 dark:text-white">
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
              className="block text-center text-sm font-medium text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
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
