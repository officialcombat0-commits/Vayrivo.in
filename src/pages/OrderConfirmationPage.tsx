import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { InvoiceModal } from '../components/InvoiceModal';
import {
  CheckCircle2,
  Package,
  Printer,
  Truck,
  ArrowRight,
  ShieldCheck,
  Mail,
  Phone,
  Sparkles
} from 'lucide-react';

interface OrderConfirmationPageProps {
  orderNumber: string;
  onNavigate: (page: string, param?: string) => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({
  orderNumber,
  onNavigate,
}) => {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showInvoice, setShowInvoice] = useState(false);
  const { formatPrice, settings } = useStore();

  useEffect(() => {
    if (!orderNumber) return;
    fetch(`/api/orders/${orderNumber}`)
      .then((res) => res.json())
      .then((data) => {
        setOrder(data);
      })
      .catch((err) => console.error('Failed to load confirmed order:', err))
      .finally(() => setLoading(false));
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="font-serif-luxury text-3xl text-[#F5F0E5]">Loading Sovereign Receipt...</h2>
      </div>
    );
  }

  if (!order || order.error) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="font-serif-luxury text-3xl text-red-400">Order Record Not Found</h2>
        <p className="text-xs text-[#F5F0E5]/60">We could not retrieve order reference {orderNumber}.</p>
        <button onClick={() => onNavigate('home')} className="gold-button px-6 py-2.5 text-xs uppercase font-semibold">
          Return to Atelier
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Celebration Header */}
      <div className="text-center space-y-4 border border-[#D8B56D]/40 bg-[#092117]/50 p-8 sm:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D8B56D]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 mx-auto rounded-full bg-[#050d09] border border-[#D8B56D] flex items-center justify-center text-[#D8B56D]">
          <CheckCircle2 className="w-8 h-8 text-[#D8B56D]" />
        </div>

        <span className="text-[10px] uppercase tracking-[0.25em] text-[#D8B56D] font-mono flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Order Commissioned & Authenticated
        </span>

        <h1 className="font-brand text-3xl sm:text-5xl text-[#F5F0E5]">
          Thank You, {order.customer_name}
        </h1>

        <p className="text-xs sm:text-sm text-[#F5F0E5]/75 font-light max-w-xl mx-auto leading-relaxed">
          Your order has been formally placed in our atelier vault. A digital confirmation with dispatch tracking and tax invoice details has been generated.
        </p>

        {/* Order Reference Badge */}
        <div className="inline-block p-4 border border-[#1a3c2c] bg-[#050d09]/80 text-left font-mono text-xs space-y-1">
          <div className="text-[#F5F0E5]/60">Order Reference Number:</div>
          <div className="text-xl font-bold text-[#F1D99B] tracking-wider">{order.order_number}</div>
          <div className="text-[11px] text-emerald-400 font-semibold pt-1">
            Status: {order.order_status} • Payment: {order.payment_status.toUpperCase()} ({order.payment_method === 'online_razorpay' ? 'Razorpay' : 'COD'})
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 flex flex-wrap justify-center gap-4">
          <button
            onClick={() => setShowInvoice(true)}
            className="gold-button px-6 py-2.5 text-xs font-semibold uppercase tracking-wider flex items-center gap-2"
          >
            <Printer className="w-4 h-4" /> View & Print Official GST Invoice
          </button>

          <button
            onClick={() => onNavigate('shop')}
            className="gold-button-outline px-6 py-2.5 text-xs font-semibold uppercase tracking-wider"
          >
            Continue Exploring
          </button>
        </div>
      </div>

      {/* Order Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs leading-relaxed">
        {/* Shipping Destination */}
        <div className="glass-panel-dark p-6 border border-[#1a3c2c] space-y-3">
          <h3 className="font-serif-luxury text-lg text-[#F1D99B] border-b border-[#1a3c2c] pb-2 flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#D8B56D]" /> Delivery Destination
          </h3>
          <div className="text-[#F5F0E5]/90">
            <div className="font-semibold text-sm">{order.shippingAddress?.fullName}</div>
            <div className="mt-1">
              {order.shippingAddress?.addressLine1}
              {order.shippingAddress?.addressLine2 && `, ${order.shippingAddress.addressLine2}`}<br />
              {order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode}<br />
              India
            </div>
            <div className="mt-2 text-[#F5F0E5]/60 font-mono">
              Phone: {order.customer_phone}<br />
              Email: {order.customer_email}
            </div>
          </div>
        </div>

        {/* Dispatch & Delivery Timeline */}
        <div className="glass-panel-dark p-6 border border-[#1a3c2c] space-y-3">
          <h3 className="font-serif-luxury text-lg text-[#F1D99B] border-b border-[#1a3c2c] pb-2 flex items-center gap-2">
            <Package className="w-4 h-4 text-[#D8B56D]" /> Dispatch Commitment
          </h3>
          <div className="space-y-2 text-[#F5F0E5]/80 font-light">
            <p>
              Your flacon is carefully nestled in our emerald presentation box and prepared under climate-controlled conditions.
            </p>
            <div className="p-3 bg-[#092117] border border-[#1a3c2c] text-[11px] font-mono">
              <div>Courier: <strong>{order.courier_name || 'Blue Dart Express / Delhivery Surface'}</strong></div>
              <div>Estimated Transit: <strong>2 - 4 Business Days</strong></div>
              {order.tracking_number && (
                <div className="text-[#D8B56D] pt-1">AWB Tracking: {order.tracking_number}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ordered Items Table */}
      <div className="glass-panel-dark p-6 border border-[#1a3c2c] space-y-4">
        <h3 className="font-serif-luxury text-xl text-[#F5F0E5] border-b border-[#1a3c2c] pb-3">
          Commissioned Flacons
        </h3>

        <div className="divide-y divide-[#1a3c2c] text-xs">
          {order.items?.map((item: any) => (
            <div key={item.id} className="py-3 flex justify-between items-center">
              <div>
                <div className="font-semibold text-sm text-[#F5F0E5]">{item.historical_product_name}</div>
                <div className="text-[11px] text-[#D8B56D] font-mono">
                  {item.historical_size_ml}ml Extrait • SKU: {item.historical_sku} • Qty: {item.quantity}
                </div>
              </div>
              <div className="font-mono text-sm font-semibold text-[#F1D99B]">
                {formatPrice(item.subtotal)}
              </div>
            </div>
          ))}
        </div>

        {/* Total Breakdown */}
        <div className="border-t border-[#1a3c2c] pt-4 space-y-1.5 text-xs">
          <div className="flex justify-between text-[#F5F0E5]/70">
            <span>Subtotal:</span>
            <span className="font-mono">{formatPrice(order.subtotal)}</span>
          </div>
          {order.discount_amount > 0 && (
            <div className="flex justify-between text-[#D8B56D]">
              <span>Privilege Discount:</span>
              <span className="font-mono">-{formatPrice(order.discount_amount)}</span>
            </div>
          )}
          <div className="flex justify-between text-[#F5F0E5]/70">
            <span>Insured Courier:</span>
            <span>{order.shipping_fee === 0 ? 'Complimentary' : formatPrice(order.shipping_fee)}</span>
          </div>
          <div className="flex justify-between text-[11px] text-[#F5F0E5]/50">
            <span>GST ({settings.tax_rate_percent || '1'}% inclusive):</span>
            <span className="font-mono">
              {formatPrice(Math.round((order.total_amount * Number(settings.tax_rate_percent || 1)) / (100 + Number(settings.tax_rate_percent || 1))))}
            </span>
          </div>
          <div className="flex justify-between text-base font-bold text-[#F1D99B] pt-2 border-t border-[#1a3c2c]">
            <span>Total Paid:</span>
            <span className="font-mono text-lg">{formatPrice(order.total_amount)}</span>
          </div>
        </div>
      </div>

      {/* Invoice Modal Popup */}
      {showInvoice && (
        <InvoiceModal
          orderNumber={order.order_number}
          onClose={() => setShowInvoice(false)}
        />
      )}
    </div>
  );
};
