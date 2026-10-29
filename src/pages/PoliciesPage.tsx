import React, { useState } from 'react';
import { ShieldCheck, FileText, Truck, RefreshCw, AlertCircle } from 'lucide-react';

interface PoliciesPageProps {
  initialTab?: string;
}

export const PoliciesPage: React.FC<PoliciesPageProps> = ({ initialTab = 'privacy' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#D8B56D] font-mono flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" /> Legal Framework & Client Protection
        </span>
        <h1 className="font-brand text-3xl sm:text-4xl lg:text-5xl text-[#F5F0E5]">
          Policies & Compliance
        </h1>
        <p className="text-xs sm:text-sm text-[#F5F0E5]/60 font-light max-w-xl mx-auto leading-relaxed">
          In strict compliance with the Indian Consumer Protection (E-Commerce) Rules 2020 and the Drugs and Cosmetics Act.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#1a3c2c] overflow-x-auto text-xs uppercase tracking-widest font-mono">
        {[
          { id: 'privacy', label: 'Privacy Policy', icon: ShieldCheck },
          { id: 'terms', label: 'Terms of Service', icon: FileText },
          { id: 'shipping', label: 'Shipping & Delivery', icon: Truck },
          { id: 'returns', label: 'Cancellations & Refunds', icon: RefreshCw },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3.5 flex items-center gap-2 shrink-0 transition-all ${
                activeTab === tab.id
                  ? 'border-b-2 border-[#D8B56D] text-[#F1D99B] bg-[#092117]/30 font-bold'
                  : 'text-[#F5F0E5]/60 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5 text-[#D8B56D]" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="glass-panel-dark border border-[#1a3c2c] p-8 sm:p-10 space-y-8 text-xs sm:text-sm text-[#F5F0E5]/80 font-light leading-relaxed">
        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <h2 className="font-serif-luxury text-2xl text-[#F1D99B]">Privacy Policy</h2>
            <p>
              VAYRIVO Luxury Parfumerie Pvt Ltd (&quot;VAYRIVO&quot;, &quot;we&quot;, &quot;us&quot;) respects the personal privacy of all patrons. This Privacy Policy outlines how your personal information is collected, used, and protected under the Information Technology Act, 2000 and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011.
            </p>
            <div className="space-y-2">
              <h3 className="font-serif-luxury text-lg text-[#F5F0E5]">1. Information We Collect</h3>
              <p>
                When you commission a fragrance through our portal, we collect personal information including your full name, email address, delivery shipping address, Indian PIN code, and contact telephone number.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-serif-luxury text-lg text-[#F5F0E5]">2. Payment Data Security</h3>
              <p>
                We never store raw credit card credentials, debit card CVVs, or NetBanking passwords on our servers. All digital transactions are processed through RBI-approved payment gateways (such as Razorpay) utilizing 256-bit SSL encryption.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-serif-luxury text-lg text-[#F5F0E5]">3. Grievance Officer Contact</h3>
              <p className="font-mono text-xs text-[#D8B56D]">
                Grievance Officer: Sandeep Kumar (Owner & Founder)<br />
                Address: Boutique VAYRIVO, The Heritage Galleria, Colaba, Mumbai 400001, Maharashtra<br />
                Email: grievance@vayrivo.com • Tel: +91 98200 12345
              </p>
            </div>
          </div>
        )}

        {activeTab === 'terms' && (
          <div className="space-y-6">
            <h2 className="font-serif-luxury text-2xl text-[#F1D99B]">Terms & Conditions of Sale</h2>
            <p>
              Welcome to the digital boutique of VAYRIVO. By navigating or placing a purchase order on this portal, you agree to be bound by these Terms of Sale in accordance with the Indian Contract Act, 1872.
            </p>
            <div className="space-y-2">
              <h3 className="font-serif-luxury text-lg text-[#F5F0E5]">1. Product Descriptions & Presentation</h3>
              <p>
                We endeavor to accurately display the colors, bottle volumes, and olfactory notes of our perfumes. Due to the high percentage of natural absolutes (Mysore sandalwood, rose damascena, Kashmiri saffron), subtle batch-to-batch variations in hue may naturally occur without altering olfactory integrity.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-serif-luxury text-lg text-[#F5F0E5]">2. Pricing & Currency</h3>
              <p>
                All prices are denominated in Indian National Rupees (INR ₹) and are inclusive of Goods & Services Tax (GST 18%) as legally mandated under Indian retail statutes.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'shipping' && (
          <div className="space-y-6">
            <h2 className="font-serif-luxury text-2xl text-[#F1D99B]">Shipping & Delivery Policy</h2>
            <p>
              Because our formulations contain high concentrations of organic aromatics, each flacon is shipped in thermally insulated packaging to guard against temperature fluctuations during transit.
            </p>
            <div className="space-y-2">
              <h3 className="font-serif-luxury text-lg text-[#F5F0E5]">1. Delivery Timelines</h3>
              <p>
                Metro Cities (Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata, Pune): 2 to 3 Business Days.<br />
                Tier 2 & 3 Cities and Rest of India: 3 to 5 Business Days.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-serif-luxury text-lg text-[#F5F0E5]">2. Shipping Rates</h3>
              <p>
                Orders exceeding ₹2,500 receive Complimentary Insured Delivery. For orders below ₹2,500, a nominal shipping charge of ₹150 applies. Cash on Delivery orders incur an additional ₹50 handling charge.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'returns' && (
          <div className="space-y-6">
            <h2 className="font-serif-luxury text-2xl text-[#F1D99B]">Cancellation & Refund Policy</h2>
            <p>
              Under Indian Cosmetic Rules 2020 and personal hygiene regulations, perfume bottles once unsealed cannot be returned or restocked.
            </p>
            <div className="space-y-2">
              <h3 className="font-serif-luxury text-lg text-[#F5F0E5]">1. Damaged or Defective Flacons</h3>
              <p>
                In the rare event that your flacon arrives with damaged glass, leaking atomizer, or defective sprayer, please contact concierge@vayrivo.com within 48 hours of delivery with photographs. Upon verification, we will dispatch an immediate replacement or issue a 100% refund to your original payment method.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-serif-luxury text-lg text-[#F5F0E5]">2. Order Cancellation</h3>
              <p>
                You may cancel your order at any time before dispatch from our atelier (usually within 12 hours of placement). Once an Airway Bill (AWB) has been generated with our courier partner, the order cannot be recalled.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
