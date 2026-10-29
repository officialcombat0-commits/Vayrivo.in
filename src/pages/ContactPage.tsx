import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Mail, Phone, MapPin, Clock, MessageSquare, Send, Check, Sparkles } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { settings, showToast } = useStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Bespoke Olfactory Inquiry',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
      showToast('Your message has been transmitted to our VIP Concierge', 'success');
    }, 600);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#D8B56D] font-mono flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Client Services & Consultations
        </span>
        <h1 className="font-brand text-4xl sm:text-5xl text-[#F5F0E5]">
          Connect With The Concierge
        </h1>
        <p className="text-xs sm:text-sm text-[#F5F0E5]/70 font-light leading-relaxed">
          Whether inquiring about a bespoke flacon commission, order status, or wedding gifting allocations, our dedicated concierges are at your service.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Contact Info & Boutiques */}
        <div className="lg:col-span-5 space-y-8 text-xs">
          <div className="glass-panel-dark border border-[#1a3c2c] p-6 space-y-6">
            <h2 className="font-serif-luxury text-2xl text-[#F1D99B] border-b border-[#1a3c2c] pb-3">
              Official Headquarters & Atelier
            </h2>

            <div className="space-y-4 text-[#F5F0E5]/80 leading-relaxed font-light">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#D8B56D] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#F5F0E5] block font-sans">Flagship Boutique & Salon</strong>
                  <span>{settings.boutique_address || 'The Heritage Galleria, Colaba, Mumbai 400001, Maharashtra, India'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#D8B56D] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#F5F0E5] block font-sans">Digital Concierge</strong>
                  <span className="font-mono">{settings.support_email || 'concierge@vayrivo.com'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#D8B56D] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#F5F0E5] block font-sans">Telephone Consultation</strong>
                  <span className="font-mono">{settings.support_phone || '+91 98200 12345'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#D8B56D] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#F5F0E5] block font-sans">Concierge Operating Hours</strong>
                  <span>Monday through Sunday: 10:00 AM – 8:00 PM IST</span>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp Direct Link Box */}
          <div className="p-6 border border-[#1a3c2c] bg-[#092117]/60 space-y-3">
            <h3 className="font-serif-luxury text-lg text-[#F5F0E5]">Instant WhatsApp Concierge</h3>
            <p className="text-[#F5F0E5]/70 font-light leading-relaxed">
              Connect directly with our senior fragrance sommelier for immediate scent advice or order updates.
            </p>
            <a
              href="https://wa.me/919820012345?text=Hello%20VAYRIVO%20Concierge,%20I%20would%20like%20to%20inquire%20about%20your%20fragrance%20creations."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 gold-button px-5 py-2.5 text-xs font-semibold uppercase tracking-wider mt-1"
            >
              <MessageSquare className="w-3.5 h-3.5" /> Start WhatsApp Chat
            </a>
          </div>
        </div>

        {/* Right: Message Form */}
        <div className="lg:col-span-7">
          <div className="glass-panel-dark border border-[#D8B56D]/30 p-8 space-y-6">
            <h2 className="font-serif-luxury text-2xl text-[#F5F0E5] border-b border-[#1a3c2c] pb-4">
              Send A Message
            </h2>

            {submitted ? (
              <div className="p-8 text-center space-y-4 border border-[#D8B56D]/40 bg-[#092117]/40">
                <div className="w-12 h-12 rounded-full bg-[#050d09] border border-[#D8B56D] flex items-center justify-center text-[#D8B56D] mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="font-serif-luxury text-2xl text-[#F5F0E5]">Message Received</h3>
                <p className="text-xs text-[#F5F0E5]/70 font-light max-w-sm mx-auto leading-relaxed">
                  Thank you for reaching out to VAYRIVO. Our VIP concierge will review your inquiry and respond within four business hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="gold-button-outline px-6 py-2 text-xs uppercase tracking-wider font-semibold"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[#F5F0E5]/70 block">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your full name"
                      className="w-full p-2.5 bg-[#050d09] border border-[#1a3c2c] text-[#F5F0E5] outline-none focus:border-[#D8B56D]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#F5F0E5]/70 block">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@domain.com"
                      className="w-full p-2.5 bg-[#050d09] border border-[#1a3c2c] text-[#F5F0E5] outline-none focus:border-[#D8B56D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[#F5F0E5]/70 block">Indian Mobile Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98200 12345"
                      className="w-full p-2.5 bg-[#050d09] border border-[#1a3c2c] text-[#F5F0E5] outline-none focus:border-[#D8B56D]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#F5F0E5]/70 block">Subject / Area of Interest *</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full p-2.5 bg-[#050d09] border border-[#1a3c2c] text-[#F5F0E5] outline-none focus:border-[#D8B56D]"
                    >
                      <option value="Bespoke Olfactory Inquiry">Bespoke Olfactory Inquiry</option>
                      <option value="Order Status & Dispatch">Order Status & Dispatch</option>
                      <option value="Corporate & Wedding Gifting">Corporate & Wedding Gifting</option>
                      <option value="Press & Media Relations">Press & Media Relations</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[#F5F0E5]/70 block">Message *</label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us how our fragrance sommeliers can assist you..."
                    className="w-full p-3 bg-[#050d09] border border-[#1a3c2c] text-[#F5F0E5] outline-none focus:border-[#D8B56D]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full gold-button py-3 text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{loading ? 'Transmitting...' : 'Dispatch Message to Concierge'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
