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
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#B85C4A]/10 text-[#B85C4A] dark:bg-[#D47763]/15 dark:text-[#D47763]">
              <Truck className="size-5" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wider text-[#806E66] dark:text-[#B3A198]">Shipping Cost</p>
              <p className="text-sm font-semibold text-[#3B2924] dark:text-[#FFF4E8]">Free over ₹500 (else ₹50)</p>
            </div>
          </Card>
          <Card className="flex items-center gap-3 p-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#7A8B68]/15 text-[#7A8B68] dark:bg-[#9BAF83]/20 dark:text-[#9BAF83]">
              <Clock className="size-5" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wider text-[#806E66] dark:text-[#B3A198]">Dispatch Time</p>
              <p className="text-sm font-semibold text-[#3B2924] dark:text-[#FFF4E8]">24 – 48 Hours</p>
            </div>
          </Card>
          <Card className="flex items-center gap-3 p-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#D8A85B]/15 text-[#D8A85B] dark:bg-[#E0B86A]/20 dark:text-[#E0B86A]">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wider text-[#806E66] dark:text-[#B3A198]">Safe Delivery</p>
              <p className="text-sm font-semibold text-[#3B2924] dark:text-[#FFF4E8]">India-Wide Tracking</p>
            </div>
          </Card>
        </div>

        <Card className="p-6 sm:p-8 space-y-6 text-sm leading-relaxed text-[#5E463E] dark:text-[#C7B8AE]">
          <div>
            <h2 className="font-display text-lg font-bold text-[#3B2924] dark:text-[#FFF4E8] mb-2">
              1. Order Processing & Crafting Time
            </h2>
            <p>
              Because Knottiingale specializes in handmade crochet products, each creation requires careful handling. Ready-to-ship catalog items are inspected, safely packed, and dispatched within <strong>24 to 48 hours</strong> of order placement. Custom or personalized crochet orders may take additional craftsmanship time as mutually agreed upon with Shikkha Rai.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-bold text-[#3B2924] dark:text-[#FFF4E8] mb-2">
              2. Shipping Charges
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Orders ₹500 and above:</strong> FREE Shipping across India.</li>
              <li><strong>Orders under ₹500:</strong> Standard flat shipping rate of ₹50.</li>
            </ul>
            <p className="mt-2 text-xs text-[#806E66] dark:text-[#C7B8AE]">
              Shipping charges, if applicable, are clearly calculated and displayed before you make your payment.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-bold text-[#3B2924] dark:text-[#FFF4E8] mb-2">
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
            <h2 className="font-display text-lg font-bold text-[#3B2924] dark:text-[#FFF4E8] mb-2">
              4. Order Tracking
            </h2>
            <p>
              As soon as your order is shipped, tracking information including courier partner and tracking ID will be updated on your <a href="/orders" className="text-[#B85C4A] hover:underline dark:text-[#D47763]">Orders</a> page. You can follow your parcel's journey right to your doorstep.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-bold text-[#3B2924] dark:text-[#FFF4E8] mb-2">
              5. Delivery Queries & Assistance
            </h2>
            <p>
              If your package is delayed, damaged in transit, or you have delivery instructions:
              <br />
              <strong className="text-[#3B2924] dark:text-[#FFF4E8]">Contact:</strong> Shikkha Rai (+91 7985835558)
              <br />
              <strong className="text-[#3B2924] dark:text-[#FFF4E8]">Technical inquiries:</strong> Shruti Rai (shruti.rai2901@gmail.com)
            </p>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
};

export default ShippingPolicyPage;
