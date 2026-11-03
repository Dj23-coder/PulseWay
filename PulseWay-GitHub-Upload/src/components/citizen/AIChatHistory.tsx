import React, { useState } from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { AIChatRecord } from '../../types';
import { translations } from '../../utils/translations';
import { 
  Download, 
  FileText, 
  Clock, 
  ArrowLeft, 
  Lock, 
  Activity, 
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  X
} from 'lucide-react';

export const AIChatHistory: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { aiChatRecords, downloadReport, language } = useEmergency();
  const t = translations[language];
  const [selectedRecord, setSelectedRecord] = useState<AIChatRecord | null>(null);

  return (
    <div className="w-full bg-white rounded-3xl border border-stone-200/90 shadow-sm p-4 sm:p-5 text-[#1A1D20] space-y-4 overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-200">
        <div className="flex items-center gap-2 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors shrink-0 cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="min-w-0">
            <h1 className="font-serif text-base sm:text-lg font-bold text-[#0B192C] truncate">
              AI Clinical Triage Logs
            </h1>
            <p className="text-[11px] text-slate-500 truncate">
              Immutable digital incident archive ({aiChatRecords.length} records)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[10px] font-mono font-semibold text-slate-600 bg-[#FAF8F5] border border-stone-200 px-2.5 py-1 rounded-full shrink-0">
          <Lock className="w-3 h-3 text-slate-500" />
          <span>Read-Only</span>
        </div>
      </div>

      {/* List of Triage Records (Mobile Container Optimized) */}
      <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
        {aiChatRecords.length === 0 ? (
          <div className="p-8 text-center bg-[#FAF8F5] rounded-2xl border border-dashed border-stone-300 text-xs text-slate-500 space-y-2 my-2">
            <FileText className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="font-bold text-slate-700 text-sm">{t.noChatReports}</div>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
              {t.noChatReportsDesc}
            </p>
          </div>
        ) : (
          aiChatRecords.map((record) => {
            const isCritical = record.severity === 'CRITICAL';
            return (
              <div
                key={record.id}
                onClick={() => setSelectedRecord(record)}
                className="w-full text-left p-3.5 rounded-2xl border border-stone-200/90 bg-[#FAF8F5] hover:border-[#10B981] hover:bg-white transition-all cursor-pointer shadow-xs space-y-2 group overflow-hidden"
              >
                {/* Top row: Severity, Ref, Date */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      isCritical
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      {record.severity}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 truncate">
                      #{record.id}
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-500 font-mono shrink-0">
                    {new Date(record.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Emergency Problem Title */}
                <div className="font-serif font-bold text-xs sm:text-sm text-[#0B192C] group-hover:text-emerald-700 transition-colors line-clamp-1 break-words">
                  {record.emergencyType}
                </div>

                {/* Summary Snippet with word break */}
                <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed break-words overflow-hidden">
                  {record.summaryReport}
                </p>

                {/* Patient Footer & Tap action */}
                <div className="pt-2 border-t border-stone-200/70 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="truncate max-w-[200px] font-medium">
                    Patient: <strong className="text-slate-800">{record.patientName}</strong>
                  </span>

                  <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-0.5 shrink-0 group-hover:underline">
                    <span>View Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DETAIL MODAL (Guarantees 100% containment, zero text overflow!) */}
      {selectedRecord && (
        <div 
          onClick={() => setSelectedRecord(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto cursor-pointer animate-in fade-in duration-150"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-3xl border border-stone-200 p-5 shadow-2xl text-[#1A1D20] space-y-4 max-h-[90vh] overflow-y-auto cursor-default animate-in zoom-in-95 duration-150"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-stone-200">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    selectedRecord.severity === 'CRITICAL'
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    {selectedRecord.severity}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    REPORT REF: #{selectedRecord.id}
                  </span>
                </div>
                <h3 className="font-serif text-base font-bold text-[#0B192C] mt-1 break-words leading-snug">
                  {selectedRecord.emergencyType}
                </h3>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Patient: <strong className="text-slate-800">{selectedRecord.patientName}</strong> · {new Date(selectedRecord.timestamp).toLocaleString()}
                </div>
              </div>

              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer transition-colors shrink-0"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* AI Summary Assessment (Clean card with break-words) */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                AI Clinical Summary
              </span>
              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-stone-200 text-xs text-slate-800 leading-relaxed break-words whitespace-pre-wrap overflow-hidden">
                {selectedRecord.summaryReport}
              </div>
            </div>

            {/* Clinical Telemetry & Triage Details */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                Clinical Metrics & Telemetry
              </span>
              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-2 text-xs">
                <div className="flex items-start gap-2 text-slate-700 break-words overflow-hidden">
                  <Activity className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="break-words leading-relaxed">{selectedRecord.triageDetails}</span>
                </div>
                {selectedRecord.vitalStatsSnapshot && (
                  <div className="pt-2 border-t border-stone-200/80 font-mono text-[11px] text-slate-600 break-words">
                    {selectedRecord.vitalStatsSnapshot}
                  </div>
                )}
              </div>
            </div>

            {/* BNS Statutory Notice */}
            <div className="p-3 rounded-2xl bg-amber-50/90 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2 break-words">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span className="leading-tight">
                <strong>Legal Audit Compliance:</strong> Under the provisions of the Bharatiya Nyaya Sanhita (BNS) & IT Act, this emergency report is digitally signed and permanent.
              </span>
            </div>

            {/* Action Row: Download Report & Close */}
            <div className="pt-2 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => downloadReport(selectedRecord.id)}
                className="flex-1 py-2.5 px-4 rounded-full bg-[#10B981] hover:bg-[#0F9D75] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all active:scale-[0.98] cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Report (.txt)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="py-2.5 px-4 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
