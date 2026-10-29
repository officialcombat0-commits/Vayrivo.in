import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { AdminAuditLog } from '../types';
import { Shield, Clock, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export const AdminAuditLogs: React.FC = () => {
  const { adminFetch } = useAdmin();
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await adminFetch('/api/admin/audit-logs');
        if (res.ok) {
          const data = await res.json();
          setLogs(data);
        }
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b border-[#1a3c2c] pb-4">
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#D8B56D] font-mono">
          Security & Accountability
        </span>
        <h1 className="font-serif-luxury text-2xl sm:text-3xl text-[#F5F0E5]">
          Administrative Audit Log ({logs.length})
        </h1>
        <p className="text-xs text-[#F5F0E5]/60 mt-1">
          Immutable event ledger recording every administrative mutation, status change, stock adjustment, and refund.
        </p>
      </div>

      <div className="glass-panel-dark border border-[#1a3c2c] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1a3c2c] text-[#D8B56D] font-mono text-[10px] uppercase tracking-wider bg-[#092117]/60">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Admin Officer</th>
                <th className="py-3 px-4 text-center">Action</th>
                <th className="py-3 px-4 text-center">Entity</th>
                <th className="py-3 px-4">Details / Parameters</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a3c2c]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-xs text-[#D8B56D] font-mono">
                    Reading immutable security log...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-xs text-[#F5F0E5]/50 font-light">
                    No administrative audit events recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#092117]/30 transition-colors text-[11px]">
                    <td className="py-3 px-4 font-mono text-[#F5F0E5]/60 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>

                    <td className="py-3 px-4 font-mono text-[#F1D99B]">
                      {log.admin_email}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 text-[9px] uppercase font-mono font-bold bg-[#1a3c2c] text-[#D8B56D] border border-[#D8B56D]/30">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center font-mono uppercase text-[#F5F0E5]/70 text-[10px]">
                      {log.entity_type} {log.entity_id && `(${log.entity_id})`}
                    </td>

                    <td className="py-3 px-4 font-mono text-[10px] text-[#F5F0E5]/60 max-w-sm truncate">
                      {log.details_json || 'None'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
