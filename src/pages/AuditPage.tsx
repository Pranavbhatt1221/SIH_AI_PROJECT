import React, { useState, useEffect } from 'react';
import {
  Lock,
  Link as ChainIcon,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  Hash
} from 'lucide-react';
import { AuditBlock } from '../types';
import { Badge } from '../components/Badge';

export const AuditPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditBlock[]>([]);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/audit-logs');
      const data = await res.json();
      if (data.success) {
        setLogs(data.audit_logs || []);
      }
    } catch (err) {
      console.error('Failed to load audit logs', err);
    }
  };

  const handleVerifyChain = async () => {
    setIsVerifying(true);
    try {
      const res = await fetch('/api/audit-logs/verify');
      const data = await res.json();
      if (data.success) {
        setVerificationResult(data.verification);
      }
    } catch (err) {
      console.error('Audit verification error', err);
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
    handleVerifyChain();
  }, []);

  const copyToClipboard = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-700 font-mono text-xs font-bold uppercase tracking-wider">
            <Lock className="w-4 h-4" />
            <span>Cryptographic Ledger</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Cryptographic Audit Trail</h1>
          <p className="text-xs text-slate-500">
            Tamper-Evident Screening Ledger &bull; Chained with cryptographic SHA-256 block hashing.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchAuditLogs}
            className="p-2.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 transition-all cursor-pointer shadow-sm"
            title="Refresh Ledger"
          >
            <RefreshCw className="w-4 h-4 text-blue-700" />
          </button>

          <button
            onClick={handleVerifyChain}
            disabled={isVerifying}
            className="px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs tracking-wide shadow-sm transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            <ShieldCheck className={`w-4 h-4 ${isVerifying ? 'animate-spin' : ''}`} />
            <span>VERIFY LEDGER INTEGRITY</span>
          </button>
        </div>
      </div>

      {/* Verification Status Banner */}
      {verificationResult && (
        <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          verificationResult.chain_valid
            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
            : 'bg-red-50 border-red-300 text-red-800'
        }`}>
          <div className="flex items-center space-x-3">
            {verificationResult.chain_valid ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
            )}
            <div>
              <div className="font-bold text-xs uppercase tracking-wider">
                {verificationResult.chain_valid ? 'LEDGER INTEGRITY VERIFIED (NO TAMPERING DETECTED)' : 'CRYPTOGRAPHIC TAMPER DETECTED!'}
              </div>
              <div className="text-[11px] text-slate-600 mt-0.5">{verificationResult.status_message}</div>
            </div>
          </div>

          <div className="font-mono text-xs font-bold sm:text-right shrink-0">
            <span className="text-slate-500">Total Validated Blocks: </span>
            <span className="text-slate-900">{verificationResult.total_blocks}</span>
          </div>
        </div>
      )}

      {/* Cryptographic Math Explanation Card */}
      <div className="rounded-xl bg-white border border-slate-200 p-5 space-y-2 text-xs shadow-sm">
        <div className="flex items-center space-x-2 text-blue-700 font-mono font-bold text-[11px]">
          <Hash className="w-3.5 h-3.5" />
          <span>CRYPTOGRAPHIC HASH-CHAINING LOGIC</span>
        </div>
        <div className="font-mono text-[11px] text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200 break-all leading-relaxed">
          current_record_hash = SHA256(audit_id + case_id + timestamp + officer_id + doc_number + risk_score + decision + remarks + previous_record_hash)
        </div>
        <p className="text-[11px] text-slate-500">
          Any alteration of a historical screening decision or document number irrevocably invalidates all subsequent block hashes across the ledger.
        </p>
      </div>

      {/* Sequential Blocks Chain View */}
      <div className="space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-600">Sequential Chain of Blocks</div>

        <div className="space-y-3 font-mono text-xs">
          {logs.map((block, idx) => (
            <div
              key={block.audit_id}
              className="rounded-xl bg-white border border-slate-200 p-5 space-y-3 hover:border-blue-300 transition-all shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded bg-blue-50 border border-blue-200 text-blue-800 font-bold flex items-center justify-center text-[11px]">
                    #{idx + 1}
                  </span>
                  <span className="font-bold text-slate-900 text-sm">{block.audit_id}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-blue-700 font-bold">{block.case_id}</span>
                </div>

                <div className="flex items-center space-x-3">
                  <Badge status={block.decision} />
                  <span className="text-slate-500 text-[11px] font-sans">
                    {new Date(block.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Block Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                <div>
                  <span className="text-slate-500 text-[10px] block font-sans">DOCUMENT NUMBER</span>
                  <span className="font-bold text-slate-900">{block.document_number}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block font-sans">INSPECTION OFFICER</span>
                  <span className="font-bold text-slate-900">{block.officer_id}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block font-sans">RISK SCORE / LEVEL</span>
                  <span className="font-bold text-slate-900">{block.risk_score}/100 ({block.risk_level})</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block font-sans">OFFICER REMARKS</span>
                  <span className="text-slate-700 truncate block font-sans">{block.remarks}</span>
                </div>
              </div>

              {/* Cryptographic Linkage Hashes */}
              <div className="pt-2 border-t border-slate-200 space-y-1.5 text-[10px]">
                <div className="flex items-center justify-between bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="text-slate-500 shrink-0 font-bold">PREVIOUS HASH:</span>
                  <span className="text-slate-600 truncate mx-2">{block.previous_record_hash}</span>
                  <button
                    onClick={() => copyToClipboard(block.previous_record_hash)}
                    className="text-slate-400 hover:text-slate-700 cursor-pointer"
                    title="Copy Hash"
                  >
                    {copiedHash === block.previous_record_hash ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>

                <div className="flex items-center justify-between bg-blue-50/50 p-2 rounded border border-blue-200">
                  <span className="text-blue-800 font-bold shrink-0">CURRENT SHA-256 HASH:</span>
                  <span className="text-blue-900 truncate mx-2 font-bold">{block.current_record_hash}</span>
                  <button
                    onClick={() => copyToClipboard(block.current_record_hash)}
                    className="text-blue-600 hover:text-blue-800 cursor-pointer"
                    title="Copy Hash"
                  >
                    {copiedHash === block.current_record_hash ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
