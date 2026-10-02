import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  MapPin,
  Phone,
  MessageCircle,
  Code,
  User,
  Send,
  Sparkles,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { useToast } from "@/context/ToastContext";
import { useSubmitContact } from "@/hooks/useApi";
import { getErrorMessage } from "@/lib/api";
import contactBackdrop from "@/assets/contact-backdrop.jpg";

export const ContactPage = () => {
  usePageTitle("Contact Us & Custom Orders");
  const toast = useToast();
  const submitContact = useSubmitContact();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in your name, email, and message.");
      return;
    }
    try {
      const res = await submitContact.mutateAsync(form);
      setSubmitted(true);
      toast.success(res.message || "Thank you! Your message has been sent.");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-140px)] w-full overflow-hidden">
      {/* Handcrafted Crochet Backdrop for Contact Page */}
      <div className="pointer-events-none absolute inset-0 z-0 select-none">
        <img
          src={contactBackdrop}
          alt="Crochet supplies and flowers background"
          loading="lazy"
          decoding="async"
          className="size-full object-cover object-center opacity-85 dark:opacity-30 transition-opacity duration-500"
        />
        {/* Soft warm ambient scrim */}
        <div className="absolute inset-0 bg-[#FFF8F0]/40 dark:bg-gradient-to-br dark:from-[#150F0D]/90 dark:via-[#1B1311]/85 dark:to-[#120C0A]/90 backdrop-blur-[1px]" />
      </div>

      <div className="relative z-10">
        <PageLayout
          title="Get in Touch"
          subtitle="Have questions, need a custom crochet order, or looking for technical support? We'd love to hear from you."
        >
      <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
        {/* Contact Form */}
        <div className="space-y-6">
          <Card className="p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-[#B85C4A]/10 text-[#B85C4A] dark:bg-[#D47763]/20 dark:text-[#D47763]">
                <Sparkles className="size-5" />
              </span>
              <div>
                <h2 className="text-xl font-semibold text-[#3B2924] dark:text-[#FFF4E8]">
                  Send us a message
                </h2>
                <p className="text-sm text-[#806E66] dark:text-[#C7B8AE]">
                  Custom crochet requests, bulk gifting, order tracking, or feedback
                </p>
              </div>
            </div>

            {submitted ? (
              <div className="rounded-2xl bg-[#7A8B68]/10 p-6 text-center dark:bg-[#9BAF83]/20">
                <CheckCircle2 className="mx-auto size-12 text-[#7A8B68] dark:text-[#9BAF83]" />
                <h3 className="mt-3 text-lg font-semibold text-[#3B2924] dark:text-[#FFF4E8]">
                  Message Sent!
                </h3>
                <p className="mt-1 text-sm text-[#806E66] dark:text-[#C7B8AE]">
                  Thank you for reaching out. Shikha Rai and the Knottiingale team will respond within 24 hours.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSubmitted(false);
                    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
                  }}
                >
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Your Name *"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Enter your name"
                  />
                  <Input
                    label="Email Address *"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Phone Number"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                  />
                  <Input
                    label="Subject"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="Custom Order / Inquiry"
                  />
                </div>

                <Textarea
                  label="Your Message *"
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us what you're looking for, crochet details, custom sizes/colors..."
                />

                <Button
                  type="submit"
                  size="lg"
                  className="w-full sm:w-auto"
                  loading={submitContact.isPending}
                >
                  <Send className="size-4" /> Send Message
                </Button>
              </form>
            )}
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Owner & Brand Card */}
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-[#D8A85B]/15 text-[#D8A85B] dark:bg-[#E0B86A]/20 dark:text-[#E0B86A]">
                <User className="size-5" />
              </span>
              <div>
                <h3 className="font-semibold text-[#3B2924] dark:text-[#FFF4E8]">
                  Owner & Artisan
                </h3>
                <p className="text-sm font-medium text-[#B85C4A] dark:text-[#D47763]">
                  Shikha Rai
                </p>
              </div>
            </div>

            <p className="mb-4 text-xs text-[#806E66] dark:text-[#C7B8AE]">
              For all orders, product inquiries, custom handmade crochet designs, and customer care:
            </p>

            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="tel:+917985835558"
                  className="flex items-center gap-2.5 font-medium text-[#3B2924] transition hover:text-[#B85C4A] dark:text-[#FFF4E8] dark:hover:text-[#D47763]"
                >
                  <Phone className="size-4 text-[#806E66] dark:text-[#C7B8AE]" />
                  +91 7985835558
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/917985835558?text=Hello%20Knottiingale%2C%20I%20have%20an%20inquiry%20regarding%20your%20crochet%20creations."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#7A8B68]/15 px-3 py-2 text-xs font-semibold text-[#7A8B68] transition hover:bg-[#7A8B68]/25 dark:bg-[#9BAF83]/20 dark:text-[#9BAF83]"
                >
                  <MessageCircle className="size-4 text-[#7A8B68] dark:text-[#9BAF83]" />
                  Chat on WhatsApp (+91 7985835558)
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-[#806E66] dark:text-[#C7B8AE]">
                <MapPin className="mt-0.5 size-4 shrink-0 text-[#806E66] dark:text-[#C7B8AE]" />
                <span>Knottiingale Studio, India</span>
              </li>
              <li className="flex items-center gap-2.5 text-[#806E66] dark:text-[#C7B8AE]">
                <Clock className="size-4 text-[#806E66] dark:text-[#C7B8AE]" />
                <span>Mon – Sat: 9:00 AM – 7:00 PM IST</span>
              </li>
            </ul>
          </Card>

          {/* Technical Support & Developer Card */}
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-[#C98F8B]/15 text-[#C98F8B] dark:bg-[#D8A09B]/20 dark:text-[#D8A09B]">
                <Code className="size-5" />
              </span>
              <div>
                <h3 className="font-semibold text-[#3B2924] dark:text-[#FFF4E8]">
                  Technical Support
                </h3>
                <p className="text-sm font-medium text-[#806E66] dark:text-[#C7B8AE]">
                  Shruti Rai (Lead Developer)
                </p>
              </div>
            </div>

            <p className="mb-4 text-xs text-[#806E66] dark:text-[#C7B8AE]">
              For website technical issues, account access, or developer inquiries:
            </p>

            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="tel:+917007787536"
                  className="flex items-center gap-2.5 font-medium text-[#3B2924] transition hover:text-[#B85C4A] dark:text-[#FFF4E8] dark:hover:text-[#D47763]"
                >
                  <Phone className="size-4 text-[#806E66] dark:text-[#C7B8AE]" />
                  +91 7007787536
                </a>
              </li>
              <li>
                <a
                  href="mailto:shruti.rai2901@gmail.com"
                  className="flex items-center gap-2.5 font-medium text-[#3B2924] transition hover:text-[#B85C4A] dark:text-[#FFF4E8] dark:hover:text-[#D47763]"
                >
                  <Mail className="size-4 text-[#806E66] dark:text-[#C7B8AE]" />
                  shruti.rai2901@gmail.com
                </a>
              </li>
            </ul>
          </Card>

          {/* Quick links to policies */}
          <Card className="p-6">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#3B2924] dark:text-[#FFF4E8]">
              Customer Policies
            </h3>
            <ul className="space-y-2 text-sm text-[#B85C4A] dark:text-[#D47763]">
              <li>
                <Link to="/shipping-policy" className="hover:underline">
                  Shipping & Delivery Policy →
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="hover:underline">
                  Cancellation & Refund Policy →
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:underline">
                  Terms & Conditions →
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:underline">
                  Privacy Policy →
                </Link>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </PageLayout>
      </div>
    </div>
  );
};

export default ContactPage;
