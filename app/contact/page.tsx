import Layout from "@/components/Layout";
import { buildPageMetadata } from "@/lib/seo";
import { getUrlWithScheme } from "@/lib/getUrlWithScheme";
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Mail, Phone, MapPin, Clock, Send, MessageSquare } from "lucide-react";
import Link from "next/link";

export const metadata = buildPageMetadata({
  title: "Contact Krallaser | Laser Machine Sales & Parts",
  description:
    "Contact Krallaser for laser cutting machines and parts in Pakistan. Phone, WhatsApp, email, and Lahore showroom — expert help with machines and spare parts.",
  path: "/contact",
});

const ContactPage = async () => {
  const Headers = await headers();
  const host = Headers.get("host");

  if (!host) {
    throw new Error("Host header is missing or invalid");
  }

  const fullStoreUrl = getUrlWithScheme(host);
  const response = await fetch(`${fullStoreUrl}/api/fetchStore`, { next: { revalidate: 300 } });
  const data = await response.json();
  const storeData = data?.store?.stores[0];

  const contact = storeData?.store_contact_detail;

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50/50">
        <div className="page-container py-12 lg:py-16">
          {/* Breadcrumb */}
          <nav className="breadcrumb">
            <Link href="/" className="breadcrumb-link">Home</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="text-slate-900 font-medium">Contact</span>
          </nav>

          {/* Page Header */}
          <div className="page-header text-center">
            <h1 className="page-title">Contact Us</h1>
            <p className="page-description mx-auto">
              Get in touch with our team. We typically respond within 24 hours.
            </p>
          </div>

          {/* Contact Cards & Form */}
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Contact Info Cards */}
            <div className="lg:col-span-1 space-y-4">
              <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Email</h3>
                      <a
                        href={`mailto:${contact?.email || "krallaser@gmail.com"}`}
                        className="text-slate-600 hover:text-slate-900 transition-colors mt-1 block"
                      >
                        {contact?.email || "krallaser@gmail.com"}
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Phone</h3>
                      <a
                        href={`tel:${contact?.phone || "0322 4414443"}`}
                        className="text-slate-600 hover:text-slate-900 transition-colors mt-1 block"
                      >
                        {contact?.phone || "0322 4414443"}
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Address</h3>
                      <p className="text-slate-600 mt-1 leading-relaxed">
                        {contact?.address || "76 C Gulshan e Rehman, Sultan Ahmad Road, Ichra, Lahore, Pakistan"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Business Hours</h3>
                      <p className="text-slate-600 mt-1 text-sm">
                        Mon – Fri: 9:00 AM – 6:00 PM<br />
                        Sat: 10:00 AM – 4:00 PM<br />
                        Sun: Closed
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                  <h2 className="text-xl font-semibold text-slate-900">Send a Message</h2>
                  <p className="text-slate-600 text-sm mt-1">
                    Fill out the form and we&apos;ll get back to you within 24 hours.
                  </p>
                </CardHeader>
                <CardContent>
                  <form className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label htmlFor="firstName" className="block text-sm font-medium text-slate-700">
                          First Name
                        </label>
                        <Input id="firstName" placeholder="John" className="border-slate-200" required />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="lastName" className="block text-sm font-medium text-slate-700">
                          Last Name
                        </label>
                        <Input id="lastName" placeholder="Doe" className="border-slate-200" required />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                        Email
                      </label>
                      <Input id="email" type="email" placeholder="john@example.com" className="border-slate-200" required />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
                        Phone
                      </label>
                      <Input id="phone" type="tel" placeholder="+92 300 1234567" className="border-slate-200" />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="subject" className="block text-sm font-medium text-slate-700">
                        Subject
                      </label>
                      <Input id="subject" placeholder="How can we help?" className="border-slate-200" required />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="message" className="block text-sm font-medium text-slate-700">
                        Message
                      </label>
                      <Textarea
                        id="message"
                        placeholder="Describe your inquiry in detail..."
                        rows={5}
                        className="border-slate-200 resize-none"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full sm:w-auto px-8 py-6 text-base font-medium text-white hover:opacity-95 transition-opacity"
                      style={{ backgroundColor: "var(--primary-color)" }}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Trust Section */}
          <div className="mt-16 pt-12 border-t border-slate-200">
            <div className="text-center mb-10">
              <h2 className="text-xl font-semibold text-slate-900">Why Contact Us</h2>
              <p className="text-slate-600 mt-1 max-w-xl mx-auto">
                Expert support, quick response, and a commitment to helping you find the right solution.
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-7 h-7 text-slate-600" />
                </div>
                <h3 className="font-semibold text-slate-900">Quick Response</h3>
                <p className="text-slate-600 text-sm mt-1">We respond within 24 hours</p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-7 h-7 text-slate-600" />
                </div>
                <h3 className="font-semibold text-slate-900">Expert Support</h3>
                <p className="text-slate-600 text-sm mt-1">Technical team ready to help</p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-7 h-7 text-slate-600" />
                </div>
                <h3 className="font-semibold text-slate-900">Visit Us</h3>
                <p className="text-slate-600 text-sm mt-1">Lahore, Pakistan</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ContactPage;
