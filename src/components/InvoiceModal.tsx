import React, { useEffect, useState } from 'react';
import { X, Printer, Download, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface InvoiceModalProps {
  orderNumber: string;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ orderNumber, onClose }) => {
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { formatPrice, settings } = useStore();

  useEffect(() => {
    const fetchOrderInvoice = async () => {
      try {
        const res = await fetch(`/api/orders/${orderNumber}`);
        if (res.ok) {
          const data = await res.json();
          setInvoice(data);
        }
      } catch (err) {
        console.error('Failed to load invoice:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderInvoice();
  }, [orderNumber]);

  if (!orderNumber) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-[#092117] border border-[#D8B56D]/40 text-[#F5F0E5] shadow-2xl relative my-8 print:m-0 print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Controls - Hidden during print */}
        <div className="p-4 border-b border-[#1a3c2c] flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase tracking-widest text-[#D8B56D] font-mono">
              Official Tax Invoice
            </span>
            <span className="text-xs text-[#F5F0E5]/60">• GSTIN 27AABCU9603R1ZM</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="gold-button px-4 py-1.5 text-xs font-semibold flex items-center gap-1.5 uppercase tracking-wider"
            >
              <Printer className="w-3.5 h-3.5" /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#F5F0E5]/60 hover:text-[#D8B56D] hover:bg-[#050d09]/50 transition-colors"
              aria-label="Close invoice"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Body */}
        {loading ? (
          <div className="p-16 text-center text-[#D8B56D] font-light">Loading official tax invoice...</div>
        ) : !invoice ? (
          <div className="p-16 text-center text-red-400">Order invoice record not found.</div>
        ) : (
          <div className="p-8 space-y-8 font-sans">
            {/* Brand Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-[#1a3c2c] print:border-gray-300">
              <div>
                <h1 className="font-brand text-3xl tracking-[0.25em] text-[#F1D99B] print:text-black font-serif">
                  VAYRIVO
                </h1>
                <p className="text-xs tracking-widest uppercase text-[#D8B56D] print:text-gray-600 mt-1">
                  Haute Parfumerie & Botanical Alchemy
                </p>
                <p className="text-[11px] text-[#F5F0E5]/60 print:text-gray-500 mt-1 font-light leading-relaxed">
                  The Heritage Galleria, Colaba, Mumbai 400001, Maharashtra<br />
                  GSTIN: 27AABCU9603R1ZM • IEC: 0308012345<br />
                  Email: concierge@vayrivo.com • Tel: +91 98200 12345
                </p>
              </div>
              <div className="mt-4 sm:mt-0 text-left sm:text-right">
                <div className="text-xs uppercase tracking-widest text-[#D8B56D] print:text-gray-700 font-mono">
                  TAX INVOICE
                </div>
                <div className="text-lg font-mono font-bold text-[#F5F0E5] print:text-black mt-0.5">
                  INV-{invoice.order_number.replace('VAY-', '')}
                </div>
                <div className="text-xs text-[#F5F0E5]/60 print:text-gray-500 mt-1 font-mono">
                  Order Ref: {invoice.order_number}<br />
                  Date: {new Date(invoice.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
            </div>

            {/* Billing & Shipping Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs leading-relaxed">
              <div className="p-4 bg-[#050d09]/50 border border-[#1a3c2c] print:border-gray-200 print:bg-gray-50">
                <div className="text-[10px] uppercase tracking-widest text-[#D8B56D] print:text-gray-700 font-bold mb-2">
                  Billed & Consigned To:
                </div>
                <div className="font-semibold text-sm text-[#F5F0E5] print:text-black">
                  {invoice.customer_name}
                </div>
                <div className="text-[#F5F0E5]/80 print:text-gray-700 mt-1">
                  {invoice.shippingAddress?.addressLine1}
                  {invoice.shippingAddress?.addressLine2 && `, ${invoice.shippingAddress.addressLine2}`}<br />
                  {invoice.shippingAddress?.city}, {invoice.shippingAddress?.state} — {invoice.shippingAddress?.pincode}<br />
                  India
                </div>
                <div className="text-[#F5F0E5]/60 print:text-gray-500 mt-2 font-mono">
                  Mobile: {invoice.customer_phone}<br />
                  Email: {invoice.customer_email}
                </div>
              </div>

              <div className="p-4 bg-[#050d09]/50 border border-[#1a3c2c] print:border-gray-200 print:bg-gray-50">
                <div className="text-[10px] uppercase tracking-widest text-[#D8B56D] print:text-gray-700 font-bold mb-2">
                  Fulfillment & Dispatch Info:
                </div>
                <div className="text-[#F5F0E5]/80 print:text-gray-700 space-y-1">
                  <div>
                    <span className="text-[#F5F0E5]/50 print:text-gray-500">Order Status:</span>{' '}
                    <span className="font-semibold text-[#D8B56D] print:text-black">{invoice.order_status}</span>
                  </div>
                  <div>
                    <span className="text-[#F5F0E5]/50 print:text-gray-500">Payment Mode:</span>{' '}
                    <span className="uppercase font-mono">{invoice.payment_method === 'online_razorpay' ? 'Online Payment (Razorpay)' : 'Cash on Delivery'}</span>
                  </div>
                  <div>
                    <span className="text-[#F5F0E5]/50 print:text-gray-500">Payment Status:</span>{' '}
                    <span className="uppercase font-mono text-emerald-400 print:text-black">{invoice.payment_status}</span>
                  </div>
                  {invoice.tracking_number && (
                    <div className="pt-1 font-mono">
                      <span className="text-[#F5F0E5]/50 print:text-gray-500">Airway Bill (AWB):</span>{' '}
                      <span className="text-[#F1D99B] print:text-black">{invoice.tracking_number} ({invoice.courier_name || 'Express Courier'})</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#D8B56D]/40 text-[#D8B56D] print:text-black print:border-gray-400 font-mono uppercase tracking-wider text-[11px]">
                    <th className="py-2.5 pr-2">#</th>
                    <th className="py-2.5 px-2">Fragrance & Flacon Specification</th>
                    <th className="py-2.5 px-2">HSN Code</th>
                    <th className="py-2.5 px-2 text-right">Unit Price</th>
                    <th className="py-2.5 px-2 text-center">Qty</th>
                    <th className="py-2.5 pl-2 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a3c2c] print:divide-gray-200">
                  {invoice.items?.map((item: any, idx: number) => (
                    <tr key={item.id} className="text-[#F5F0E5] print:text-black">
                      <td className="py-3 pr-2 text-[#F5F0E5]/40 print:text-gray-500 font-mono">{idx + 1}</td>
                      <td className="py-3 px-2">
                        <div className="font-medium text-sm text-[#F5F0E5] print:text-black">
                          {item.historical_product_name}
                        </div>
                        <div className="text-[10px] text-[#F5F0E5]/50 print:text-gray-500 font-mono">
                          SKU: {item.historical_sku} • {item.historical_size_ml}ml Pure Extrait
                        </div>
                      </td>
                      <td className="py-3 px-2 font-mono text-[#F5F0E5]/60 print:text-gray-600">33030010</td>
                      <td className="py-3 px-2 text-right font-mono">{formatPrice(item.historical_price)}</td>
                      <td className="py-3 px-2 text-center font-mono">{item.quantity}</td>
                      <td className="py-3 pl-2 text-right font-mono font-semibold">{formatPrice(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations Breakdown */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-4 border-t border-[#1a3c2c] print:border-gray-300">
              <div className="max-w-xs space-y-2 text-[11px] text-[#F5F0E5]/60 print:text-gray-500 font-light">
                <div className="flex items-center gap-1.5 text-[#D8B56D] print:text-gray-800 font-medium">
                  <ShieldCheck className="w-4 h-4" /> Certificate of Haute Parfumerie
                </div>
                <p>
                  Handcrafted according to Indian Cosmetic Rules 2020. Guaranteed 100% authentic, cruelty-free, and IFRA compliant natural absolutes.
                </p>
              </div>

              <div className="w-full sm:w-72 space-y-1.5 text-xs">
                <div className="flex justify-between text-[#F5F0E5]/80 print:text-gray-700">
                  <span>Subtotal:</span>
                  <span className="font-mono">{formatPrice(invoice.subtotal)}</span>
                </div>
                {invoice.discount_amount > 0 && (
                  <div className="flex justify-between text-[#D8B56D] print:text-gray-800">
                    <span>Privilege Code Discount:</span>
                    <span className="font-mono">-{formatPrice(invoice.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#F5F0E5]/80 print:text-gray-700">
                  <span>Shipping & Secure Transit:</span>
                  <span className="font-mono">{invoice.shipping_fee === 0 ? 'Complimentary' : formatPrice(invoice.shipping_fee)}</span>
                </div>
                <div className="flex justify-between text-[#F5F0E5]/60 print:text-gray-500 text-[11px] pt-1">
                  <span>GST ({settings.tax_rate_percent || '1'}% inclusive):</span>
                  <span className="font-mono">
                    {formatPrice(Math.round((invoice.total_amount * Number(settings.tax_rate_percent || 1)) / (100 + Number(settings.tax_rate_percent || 1))))}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-[#F1D99B] print:text-black pt-2 border-t border-[#D8B56D]/40 print:border-gray-400">
                  <span>Total Amount Paid:</span>
                  <span className="font-mono">{formatPrice(invoice.total_amount)}</span>
                </div>
              </div>
            </div>

            {/* Bottom Footer */}
            <div className="text-center pt-6 border-t border-[#1a3c2c] print:border-gray-300 text-[10px] text-[#F5F0E5]/50 print:text-gray-500 font-light">
              This is a computer-generated tax invoice and requires no physical signature under the Indian Information Technology Act, 2000.<br />
              VAYRIVO — Your Scent. Your Signature.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
