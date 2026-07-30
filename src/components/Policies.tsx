import React, { useEffect } from "react";
import { ArrowLeft, Shield, FileText, RefreshCcw, Truck } from "lucide-react";

interface PolicyPageProps {
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  onBack: () => void;
}

function PolicyContainer({ title, icon, content, onBack }: PolicyPageProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [title]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-slate-800 font-bold text-lg">
            {icon}
            {title}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-10 text-sm md:text-base leading-relaxed space-y-6 text-slate-700">
          {content}
        </div>
      </div>
    </div>
  );
}

export function TermsAndConditions({ onBack }: { onBack: () => void }) {
  return (
    <PolicyContainer
      title="Terms & Conditions"
      icon={<FileText className="w-5 h-5 text-indigo-500" />}
      onBack={onBack}
      content={
        <div className="space-y-4">
          <p>These Terms and Conditions govern your use of this website and the purchase of products or services offered herein. By accessing or using this website, you agree to be bound by these terms. Please read them carefully.</p>
          
          <h3 className="text-lg font-bold text-slate-800 pt-4">General Use</h3>
          <p>By using this website, you confirm that you are at least 18 years old or are using the website under the supervision of a parent or legal guardian.</p>
          <p>All content on this website is for informational purposes only and is subject to change without notice.</p>
          
          <h3 className="text-lg font-bold text-slate-800 pt-4">User Responsibilities</h3>
          <p>Users agree not to misuse the website by knowingly introducing viruses, trojans, or other malicious material.</p>
          <p>You must not attempt to gain unauthorized access to the server, database, or any part of the site.</p>
          
          <h3 className="text-lg font-bold text-slate-800 pt-4">Product & Service Descriptions</h3>
          <p>All efforts are made to ensure accuracy in product descriptions, images, pricing, and availability. However, we do not warrant that product descriptions or other content are complete, current, or error-free.</p>
          
          <h3 className="text-lg font-bold text-slate-800 pt-4">Order Acceptance & Cancellation</h3>
          <p>Placing an order on this website does not constitute a confirmed order.</p>
          <p>We reserve the right to refuse or cancel any order for reasons including but not limited to product availability, pricing errors, or suspected fraud.</p>
          <p>Once placed, orders may not be canceled or modified unless otherwise stated in the return policy.</p>
          
          <h3 className="text-lg font-bold text-slate-800 pt-4">Pricing and Payment</h3>
          <p>All prices are displayed in INR or the local currency and are inclusive or exclusive of taxes as indicated.</p>
          <p>Payments must be made through secure and approved payment gateways. The website is not liable for any payment gateway errors.</p>
          
          <h3 className="text-lg font-bold text-slate-800 pt-4">Intellectual Property</h3>
          <p>All text, graphics, logos, images, and other materials on this website are the intellectual property of their respective owners and protected by copyright and trademark laws.</p>
          <p>Unauthorized use or duplication of any materials is prohibited.</p>
          
          <h3 className="text-lg font-bold text-slate-800 pt-4">Limitation of Liability</h3>
          <p>We are not responsible for any indirect or consequential damages that may arise from the use or inability to use the website or the products purchased through it.</p>
          <p>Liability is limited to the value of the product purchased, if applicable.</p>
          
          <h3 className="text-lg font-bold text-slate-800 pt-4">Modifications to Terms</h3>
          <p>These terms may be revised at any time without prior notice. Continued use of the site after changes implies acceptance of those changes.</p>
          
          <h3 className="text-lg font-bold text-slate-800 pt-4">Governing Law</h3>
          <p>These terms shall be governed by and construed in accordance with the laws of India</p>
        </div>
      }
    />
  );
}

export function PrivacyPolicy({ onBack }: { onBack: () => void }) {
  return (
    <PolicyContainer
      title="Privacy Policy"
      icon={<Shield className="w-5 h-5 text-teal-500" />}
      onBack={onBack}
      content={
        <div className="space-y-4">
          <p>This Privacy Policy outlines how personal information is collected, used, and safeguarded when you interact with this website. By accessing or using the website, you agree to the practices described below.</p>

          <h3 className="text-lg font-bold text-slate-800 pt-4">Information We Collect</h3>
          <p>We may collect the following types of information:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Personal Information:</strong> Name, phone number, email address, billing/shipping address.</li>
            <li><strong>Payment Information:</strong> Used to process orders securely through third-party payment gateways.</li>
            <li><strong>Technical Information:</strong> IP address, browser type, device information, and usage data via cookies or similar technologies.</li>
          </ul>

          <h3 className="text-lg font-bold text-slate-800 pt-4">How We Use Your Information</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>To process and deliver orders.</li>
            <li>To send transactional communications such as order updates or shipping alerts.</li>
            <li>To respond to customer inquiries or service requests.</li>
            <li>To improve website functionality, services, and user experience.</li>
            <li>For marketing purposes (only with your explicit consent).</li>
          </ul>

          <h3 className="text-lg font-bold text-slate-800 pt-4">Data Sharing</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>We do not sell, rent, or trade your personal data.</li>
            <li>We may share necessary information with third-party service providers such as payment gateways, delivery partners, or IT service providers — only to fulfill your order or maintain the website.</li>
            <li>Personal information may be disclosed if required by law or legal proceedings.</li>
          </ul>

          <h3 className="text-lg font-bold text-slate-800 pt-4">Data Security</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>We implement reasonable security measures to protect your data from unauthorized access, alteration, or disclosure.</li>
            <li>However, no online transmission is 100% secure. You acknowledge this risk when using the site.</li>
          </ul>

          <h3 className="text-lg font-bold text-slate-800 pt-4">Cookies and Tracking Technologies</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Cookies are used to personalize your experience, analyze site traffic, and provide relevant ads.</li>
            <li>You can manage or disable cookies via your browser settings, although this may affect site functionality.</li>
          </ul>

          <h3 className="text-lg font-bold text-slate-800 pt-4">Third-Party Links</h3>
          <p>This website may contain links to third-party websites. We are not responsible for the privacy practices or content of those websites.</p>

          <h3 className="text-lg font-bold text-slate-800 pt-4">Your Rights</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>You may request access to or correction of your personal data.</li>
            <li>You may opt out of marketing communications at any time.</li>
          </ul>

          <h3 className="text-lg font-bold text-slate-800 pt-4">Changes to This Policy</h3>
          <p>This privacy policy may be updated periodically. Continued use of the website after changes indicates acceptance of the revised policy.</p>
        </div>
      }
    />
  );
}

export function ShippingPolicy({ onBack }: { onBack: () => void }) {
  return (
    <PolicyContainer
      title="Shipping Policy"
      icon={<Truck className="w-5 h-5 text-blue-500" />}
      onBack={onBack}
      content={
        <div className="space-y-4">
          <ul className="list-disc pl-5 space-y-2">
            <li>Orders are typically processed within 1–3 business days.</li>
            <li><strong>Delivery time:</strong>
              <ul className="list-circle pl-5 mt-1 space-y-1">
                <li>Cakes & flower delivery within 0-1 day.</li>
                <li>Express delivery within 2 Hours delivery promise.</li>
                <li>Standard Delivery 5–10 business days for other items.</li>
              </ul>
            </li>
            <li>Tracking details are shared once the order is shipped.</li>
            <li>The business is not responsible for delays due to courier services or unforeseen circumstances.</li>
          </ul>
        </div>
      }
    />
  );
}

export function ReturnPolicy({ onBack }: { onBack: () => void }) {
  return (
    <PolicyContainer
      title="Return Policy"
      icon={<RefreshCcw className="w-5 h-5 text-rose-500" />}
      onBack={onBack}
      content={
        <div className="space-y-4">
          <ul className="list-disc pl-5 space-y-2">
            <li>Returns are accepted within 7 days of delivery for damaged or defective items.</li>
            <li>Items must be unused and returned in their original packaging.</li>
            <li>Proof of damage (photo/video) may be required for return approval.</li>
          </ul>

          <h3 className="text-lg font-bold text-slate-800 pt-4">Exchange / Replacement Policy</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Exchange / replacement requests must be made within 7 days of delivery.</li>
            <li>Once approved, the exchanged / replaced product will be dispatched within 2–3 business Days and delivered with in 3-7 business days after the returned item is received and inspected.</li>
            <li>Delivery timelines may vary depending on location, but typically replacements will reach you within 7–10 business days.</li>
          </ul>
        </div>
      }
    />
  );
}

export function RefundPolicy({ onBack }: { onBack: () => void }) {
  return (
    <PolicyContainer
      title="Refund Policy"
      icon={<RefreshCcw className="w-5 h-5 text-rose-500" />}
      onBack={onBack}
      content={
        <div className="space-y-4">
          <ul className="list-disc pl-5 space-y-2">
            <li>Once a return request is approved, we will process the refund within 3–5 business days.</li>
            <li>After processing, the refund will be credited to the original mode of payment within 7–10 business days, depending on the payment provider/bank.</li>
          </ul>
        </div>
      }
    />
  );
}
