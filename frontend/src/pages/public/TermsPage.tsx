import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card } from "@/components/ui/Card";

export const TermsPage = () => {
  usePageTitle("Terms & Conditions");

  return (
    <PageLayout
      title="Terms & Conditions"
      subtitle="Last updated: September 2026. Please read these terms carefully before using Knottiingale."
    >
      <div className="mx-auto max-w-4xl space-y-8">
        <Card className="p-6 sm:p-8 space-y-6 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              1. Introduction & Brand Ownership
            </h2>
            <p>
              Welcome to <strong>Knottiingale</strong>. This e-commerce platform and its products are founded, owned, and operated by <strong>Shikha Rai</strong> ("Owner", "we", "us", or "our"). By accessing or purchasing from Knottiingale, you agree to comply with and be bound by these Terms and Conditions.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              2. Handcrafted Products & Uniqueness
            </h2>
            <p>
              Every crochet creation at Knottiingale is crafted slowly and with care, stitch by stitch. Due to the handmade nature of our products, minor variations in stitches, texture, and color shades may naturally occur. These variations are the hallmark of genuine artisan craftsmanship and are not considered defects.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              3. Orders, Pricing & Taxes
            </h2>
            <p>
              All prices listed on our platform are displayed in Indian Rupees (₹ INR). We ensure complete pricing transparency: subtotal, applicable taxes (18% GST), and delivery fees are explicitly broken down at checkout prior to final payment confirmation. We reserve the right to cancel orders in case of pricing errors or inventory unavailability, with a full prompt refund.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              4. Payment Gateways & Security
            </h2>
            <p>
              We offer Cash on Delivery (COD) and secure prepaid online payment via <strong>Razorpay</strong>. All sensitive payment details (credit/debit cards, UPI, net banking) are encrypted and processed through Razorpay's PCI-DSS compliant infrastructure. Knottiingale does not store your raw banking or card information.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              5. Shipping & Cancellations
            </h2>
            <p>
              Orders are dispatched within 24 to 48 hours for in-stock pieces. You can cancel your order directly from your Orders page before the item is dispatched. For detailed information, please review our{" "}
              <Link to="/shipping-policy" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                Shipping Policy
              </Link>{" "}
              and{" "}
              <Link to="/refund-policy" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                Refund Policy
              </Link>.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              6. Intellectual Property
            </h2>
            <p>
              All designs, crochet patterns, product photography, logos, and website assets are the intellectual property of Knottiingale and Shikha Rai. Reproduction or unauthorized commercial exploitation without written permission is strictly prohibited.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              7. Merchant & Grievance Contact
            </h2>
            <p>
              For questions or disputes regarding our terms, please contact:
              <br />
              <strong>Owner:</strong> Shikha Rai
              <br />
              <strong>Phone:</strong> +91 7985835558
              <br />
              <strong>Technical Support:</strong> Shruti Rai (+91 7007787536, shruti.rai2901@gmail.com)
            </p>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
};

export default TermsPage;
