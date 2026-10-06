import { usePageTitle } from "@/hooks/usePageTitle";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card } from "@/components/ui/Card";

export const PrivacyPage = () => {
  usePageTitle("Privacy Policy");

  return (
    <PageLayout
      title="Privacy Policy"
      subtitle="How Knottiingale collects, protects, and respects your personal information."
    >
      <div className="mx-auto max-w-4xl space-y-8">
        <Card className="p-6 sm:p-8 space-y-6 text-sm leading-relaxed text-[#5E463E] dark:text-[#C7B8AE]">
          <div>
            <h2 className="font-display text-lg font-bold text-[#3B2924] dark:text-[#FFF4E8] mb-2">
              1. Information We Collect
            </h2>
            <p>
              When you visit or place an order on Knottiingale (owned by Shikkha Rai), we collect essential personal information required to fulfill your purchases and provide support:
            </p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Contact details: Name, email address, and phone number.</li>
              <li>Delivery details: Shipping addresses and postal codes.</li>
              <li>Account credentials: Securely hashed passwords.</li>
              <li>Order history and communication records for customer service.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-lg font-bold text-[#3B2924] dark:text-[#FFF4E8] mb-2">
              2. How We Use Your Information
            </h2>
            <p>
              Your data is utilized strictly for lawful business purposes:
            </p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Processing, packaging, and dispatching your handmade crochet orders.</li>
              <li>Sending transactional updates (OTP verification, order confirmations, tracking codes).</li>
              <li>Facilitating customer support and custom order requests.</li>
              <li>Improving website performance and defending against fraudulent transactions.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-lg font-bold text-[#3B2924] dark:text-[#FFF4E8] mb-2">
              3. Payment Security & Third Parties
            </h2>
            <p>
              Knottiingale partners with <strong>Razorpay</strong> for online payment processing. We never store, capture, or access your credit/debit card numbers, CVVs, or net banking passwords. Payment transactions are encrypted via SSL/TLS and governed by Razorpay's PCI-DSS compliant protocols.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-bold text-[#3B2924] dark:text-[#FFF4E8] mb-2">
              4. Data Sharing & Non-Disclosure
            </h2>
            <p>
              We respect your privacy and never sell, rent, or trade your personal information to third parties. We share data only with verified courier partners (to deliver your package) and payment processors (to complete your transaction).
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-bold text-[#3B2924] dark:text-[#FFF4E8] mb-2">
              5. Your Rights & Data Contact
            </h2>
            <p>
              You have the right to review, update, or request deletion of your account and saved addresses at any time via your Profile settings or by contacting our team:
              <br />
              <strong className="text-[#3B2924] dark:text-[#FFF4E8]">Owner:</strong> Shikkha Rai (+91 7985835558)
              <br />
              <strong className="text-[#3B2924] dark:text-[#FFF4E8]">Developer & Data Support:</strong> Shruti Rai (+91 7007787536, shruti.rai2901@gmail.com)
            </p>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
};

export default PrivacyPage;
