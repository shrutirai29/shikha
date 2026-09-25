import { usePageTitle } from "@/hooks/usePageTitle";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card } from "@/components/ui/Card";
import { Truck, Clock, ShieldCheck } from "lucide-react";

export const ShippingPolicyPage = () => {
  usePageTitle("Shipping & Delivery Policy");

  return (
    <PageLayout
      title="Shipping & Delivery Policy"
      subtitle="How we pack and deliver your handmade crochet treasures across India."
    >
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Highlight Perks */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="flex items-center gap-3 p-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              <Truck className="size-5" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400">Shipping Cost</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Free over ₹500 (else ₹50)</p>
            </div>
          </Card>
          <Card className="flex items-center gap-3 p-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <Clock className="size-5" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400">Dispatch Time</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">24 – 48 Hours</p>
            </div>
          </Card>
          <Card className="flex items-center gap-3 p-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400">Safe Delivery</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">India-Wide Tracking</p>
            </div>
          </Card>
        </div>

        <Card className="p-6 sm:p-8 space-y-6 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              1. Order Processing & Crafting Time
            </h2>
            <p>
              Because Knottiingale specializes in handmade crochet products, each creation requires careful handling. Ready-to-ship catalog items are inspected, safely packed, and dispatched within <strong>24 to 48 hours</strong> of order placement. Custom or personalized crochet orders may take additional craftsmanship time as mutually agreed upon with Shikha Rai.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              2. Shipping Charges
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Orders ₹500 and above:</strong> FREE Shipping across India.</li>
              <li><strong>Orders under ₹500:</strong> Standard flat shipping rate of ₹50.</li>
            </ul>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Shipping charges, if applicable, are clearly calculated and displayed before you make your payment.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              3. Estimated Delivery Timelines
            </h2>
            <p>
              Once dispatched, deliveries typically arrive within:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li><strong>Metro cities:</strong> 2 – 4 business days.</li>
              <li><strong>Rest of India:</strong> 4 – 7 business days.</li>
              <li><strong>Remote / Northeast / Island regions:</strong> 7 – 10 business days.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              4. Order Tracking
            </h2>
            <p>
              As soon as your order is shipped, tracking information including courier partner and tracking ID will be updated on your <a href="/orders" className="text-indigo-600 hover:underline dark:text-indigo-400">Orders</a> page. You can follow your parcel's journey right to your doorstep.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              5. Delivery Queries & Assistance
            </h2>
            <p>
              If your package is delayed, damaged in transit, or you have delivery instructions:
              <br />
              <strong>Contact:</strong> Shikha Rai (+91 7985835558)
              <br />
              <strong>Technical inquiries:</strong> Shruti Rai (shruti.rai2901@gmail.com)
            </p>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
};

export default ShippingPolicyPage;
