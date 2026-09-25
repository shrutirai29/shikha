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

export const ContactPage = () => {
  usePageTitle("Contact Us & Custom Orders");
  const toast = useToast();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in your name, email, and message.");
      return;
    }
    setSubmitted(true);
    toast.success("Thank you! Your message has been sent. We'll get back to you shortly.");
  };

  return (
    <PageLayout
      title="Get in Touch"
      subtitle="Have questions, need a custom crochet order, or looking for technical support? We'd love to hear from you."
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
        {/* Contact Form */}
        <div className="space-y-6">
          <Card className="p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                <Sparkles className="size-5" />
              </span>
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Send us a message
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Custom crochet requests, bulk gifting, order tracking, or feedback
                </p>
              </div>
            </div>

            {submitted ? (
              <div className="rounded-2xl bg-emerald-50 p-6 text-center dark:bg-emerald-500/10">
                <CheckCircle2 className="mx-auto size-12 text-emerald-600 dark:text-emerald-400" />
                <h3 className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">
                  Message Sent!
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
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

                <Button type="submit" size="lg" className="w-full sm:w-auto">
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
              <span className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                <User className="size-5" />
              </span>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Owner & Artisan
                </h3>
                <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                  Shikha Rai
                </p>
              </div>
            </div>

            <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
              For all orders, product inquiries, custom handmade crochet designs, and customer care:
            </p>

            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="tel:+917985835558"
                  className="flex items-center gap-2.5 font-medium text-slate-700 transition hover:text-indigo-600 dark:text-slate-200 dark:hover:text-indigo-400"
                >
                  <Phone className="size-4 text-slate-400" />
                  +91 7985835558
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/917985835558?text=Hello%20Knottiingale%2C%20I%20have%20an%20inquiry%20regarding%20your%20crochet%20creations."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300"
                >
                  <MessageCircle className="size-4 text-emerald-600" />
                  Chat on WhatsApp (+91 7985835558)
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-slate-600 dark:text-slate-300">
                <MapPin className="mt-0.5 size-4 shrink-0 text-slate-400" />
                <span>Knottiingale Studio, India</span>
              </li>
              <li className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                <Clock className="size-4 text-slate-400" />
                <span>Mon – Sat: 9:00 AM – 7:00 PM IST</span>
              </li>
            </ul>
          </Card>

          {/* Technical Support & Developer Card */}
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
                <Code className="size-5" />
              </span>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Technical Support
                </h3>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Shruti Rai (Lead Developer)
                </p>
              </div>
            </div>

            <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
              For website technical issues, account access, or developer inquiries:
            </p>

            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="tel:+917007787536"
                  className="flex items-center gap-2.5 font-medium text-slate-700 transition hover:text-indigo-600 dark:text-slate-200 dark:hover:text-indigo-400"
                >
                  <Phone className="size-4 text-slate-400" />
                  +91 7007787536
                </a>
              </li>
              <li>
                <a
                  href="mailto:shruti.rai2901@gmail.com"
                  className="flex items-center gap-2.5 font-medium text-slate-700 transition hover:text-indigo-600 dark:text-slate-200 dark:hover:text-indigo-400"
                >
                  <Mail className="size-4 text-slate-400" />
                  shruti.rai2901@gmail.com
                </a>
              </li>
            </ul>
          </Card>

          {/* Quick links to policies */}
          <Card className="p-6">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              Customer Policies
            </h3>
            <ul className="space-y-2 text-sm text-indigo-600 dark:text-indigo-400">
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
  );
};

export default ContactPage;
