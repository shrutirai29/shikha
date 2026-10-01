import { usePageTitle } from "@/hooks/usePageTitle";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card } from "@/components/ui/Card";
import { RefreshCcw, CheckCircle } from "lucide-react";

export const RefundPolicyPage = () => {
  usePageTitle("Cancellation & Refund Policy");

  return (
    <PageLayout
      title="Cancellation & Refund Policy"
      subtitle="Transparent guidelines on order cancellations, returns, and refunds."
    >
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="flex items-center gap-3 p-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#B85C4A]/10 text-[#B85C4A] dark:bg-[#D47763]/15 dark:text-[#D47763]">
              <RefreshCcw className="size-5" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wider text-[#806E66] dark:text-[#B3A198]">Return Window</p>
              <p className="text-sm font-semibold text-[#3B2924] dark:text-[#FFF4E8]">7 Days from Delivery</p>
            </div>
          </Card>
          <Card className="flex items-center gap-3 p-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#7A8B68]/15 text-[#7A8B68] dark:bg-[#9BAF83]/20 dark:text-[#9BAF83]">
              <CheckCircle className="size-5" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wider text-[#806E66] dark:text-[#B3A198]">Refund Processing</p>
              <p className="text-sm font-semibold text-[#3B2924] dark:text-[#FFF4E8]">5 – 7 Business Days</p>
            </div>
          </Card>
        </div>

        <Card className="p-6 sm:p-8 space-y-6 text-sm leading-relaxed text-[#5E463E] dark:text-[#C7B8AE]">
          <div>
            <h2 className="font-display text-lg font-bold text-[#3B2924] dark:text-[#FFF4E8] mb-2">
              1. Order Cancellation
            </h2>
            <p>
              You can cancel your order before it enters the "Shipped" status directly from your <a href="/orders" className="text-[#B85C4A] hover:underline dark:text-[#D47763]">My Orders</a> dashboard.
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Prepaid Orders (Razorpay):</strong> Upon cancellation, a 100% refund is initiated automatically to your original payment method within 24 hours and takes 5–7 business days to reflect in your account.</li>
              <li><strong>Cash on Delivery (COD):</strong> No charges apply if cancelled before shipment.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-lg font-bold text-[#3B2924] dark:text-[#FFF4E8] mb-2">
              2. 7-Day Hassle-Free Returns
            </h2>
            <p>
              We want you to love your handmade crochet treasures! If an item arrives damaged, defective, or incorrect, you can request a return within <strong>7 days</strong> of delivery.
            </p>
            <p className="mt-2">
              <strong>Return Eligibility Criteria:</strong>
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>The item must be unused, unwashed, and in the same pristine handmade condition you received it.</li>
              <li>Original tags, packaging, and accessories must remain intact.</li>
              <li>Custom bespoke pieces made to specific personal dimensions/customized names are non-returnable unless received damaged.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-lg font-bold text-[#3B2924] dark:text-[#FFF4E8] mb-2">
              3. Refund Timeline & Mode
            </h2>
            <p>
              Once your returned item is received and inspected at our Knottiingale workshop:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>You will receive an update confirming approval or rejection of the refund.</li>
              <li>Approved refunds are credited to the original payment source (Razorpay / UPI / Card / Net banking) within <strong>5 to 7 business days</strong>.</li>
              <li>For COD orders, refunds are credited directly to your bank account or UPI ID provided during the return request.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-lg font-bold text-[#3B2924] dark:text-[#FFF4E8] mb-2">
              4. Damaged or Defective Items
            </h2>
            <p>
              In the unlikely event that your package arrived damaged during transit, please photograph or record an unboxing video and contact us immediately (within 48 hours of delivery) so we can arrange a free replacement or swift refund.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-bold text-[#3B2924] dark:text-[#FFF4E8] mb-2">
              5. How to Initiate a Return or Refund
            </h2>
            <p>
              Contact our team directly with your order number:
              <br />
              <strong className="text-[#3B2924] dark:text-[#FFF4E8]">Owner:</strong> Shikha Rai (+91 7985835558)
              <br />
              <strong className="text-[#3B2924] dark:text-[#FFF4E8]">WhatsApp Support:</strong>{" "}
              <a
                href="https://wa.me/917985835558"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#7A8B68] font-semibold hover:underline dark:text-[#9BAF83]"
              >
                +91 7985835558
              </a>
              <br />
              <strong className="text-[#3B2924] dark:text-[#FFF4E8]">Developer & Tech Support:</strong> Shruti Rai (+91 7007787536, shruti.rai2901@gmail.com)
            </p>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
};

export default RefundPolicyPage;
