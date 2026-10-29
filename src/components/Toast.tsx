import React from 'react';
import { useStore } from '../context/StoreContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast } = useStore();
  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-fade-in">
      <div className="glass-panel-dark border border-[#D8B56D]/40 shadow-2xl p-4 rounded-none flex items-center space-x-3 text-sm">
        {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#D8B56D] shrink-0" />}
        {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />}
        {toast.type === 'info' && <Info className="w-5 h-5 text-[#F1D99B] shrink-0" />}
        <p className="text-[#F5F0E5] font-light leading-relaxed">{toast.message}</p>
      </div>
    </div>
  );
};
