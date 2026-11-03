import React from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { 
  Activity, 
  Smartphone, 
  Building2, 
  Columns, 
  Bike, 
  AlertTriangle
} from 'lucide-react';
import { translations } from '../utils/translations';

export const GlobalNavbar: React.FC<{ onOpenAccidentLab?: () => void }> = ({ onOpenAccidentLab }) => {
  const { 
    previewMode, 
    setPreviewMode, 
    activeIncident, 
    resetEmergency,
    triggerAccidentSimulation,
    isAccidentDetected,
    travelSpeed,
    language
  } = useEmergency();
  const t = translations[language];

  return (
    <header className="sticky top-0 z-40 min-h-[3.5rem] bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 text-white px-2 sm:px-4 lg:px-6 flex items-center transition-colors">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-3 flex-wrap sm:flex-nowrap py-1 sm:py-0">
        
        {/* Left: Minimalist Brand Logo & Live System Status */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center shadow-md shadow-red-600/30 shrink-0">
              <Activity className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="font-serif text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap">
                {t.appName}
              </span>
              <span className="text-[9px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold shrink-0">
                EMS
              </span>
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-1.5 pl-2.5 border-l border-slate-800/80 text-[11px] text-slate-400 whitespace-nowrap">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0"></span>
            <span className="text-slate-300 font-medium">{t.bnsMonitored}</span>
            <span className="text-slate-600">·</span>
            <span className="text-emerald-400 font-mono text-[10px]">{t.directHospitalSync}</span>
          </div>
        </div>

        {/* Center / Action: Solo Commute Accident Demo Controls & Language Selector */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          
          {/* Solo Commute Telemetry & Crash Demo Trigger */}
          <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-900/90 border border-slate-800/90 px-1.5 sm:px-2 py-1 rounded-lg shadow-inner">
            <div className="hidden lg:flex items-center gap-1 text-[11px] text-slate-300 pr-1.5 border-r border-slate-800 whitespace-nowrap">
              <Bike className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-medium text-slate-400">{t.speedLabel}:</span>
              <span className="font-mono text-emerald-400 font-bold">
                {isAccidentDetected ? '0 km/h (CRASH)' : `${travelSpeed} km/h`}
              </span>
            </div>

            {onOpenAccidentLab && (
              <button
                type="button"
                onClick={onOpenAccidentLab}
                className="h-7 text-[10px] sm:text-[11px] font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 px-2 rounded-md transition-all active:scale-95 flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
              >
                <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="hidden sm:inline">Accident Lab</span>
                <span className="sm:hidden">Lab</span>
              </button>
            )}

            <button
              type="button"
              onClick={triggerAccidentSimulation}
              disabled={isAccidentDetected}
              title="Simulate sudden speed drop to 0 and trigger 60s Code Red sequence"
              className="h-7 text-[10px] sm:text-[11px] font-semibold bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white px-2 sm:px-2.5 rounded-md transition-all active:scale-95 shadow-xs flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>{isAccidentDetected ? '💥 Collision Alert' : '💥 Demo Crash (0 km/h)'}</span>
            </button>
          </div>

        </div>

        {/* Right: Segmented Tab Controller (Modern SaaS Pill Navigation) */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          
          {activeIncident && (
            <button
              onClick={resetEmergency}
              className="h-7 text-[10px] sm:text-[11px] font-medium text-slate-400 hover:text-white px-2 rounded-md hover:bg-slate-850 transition-colors cursor-pointer border border-slate-800 whitespace-nowrap shrink-0"
            >
              {t.resetSos}
            </button>
          )}

          <div className="bg-slate-900/90 p-0.5 rounded-lg border border-slate-800/90 flex items-center gap-0.5 shadow-inner">
            <button
              onClick={() => setPreviewMode('DUAL')}
              title={t.dualSplitView}
              className={`h-7 flex items-center gap-1 px-2 sm:px-2.5 text-[10px] sm:text-[11px] font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                previewMode === 'DUAL'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Columns className="w-3 h-3 shrink-0" />
              <span className="hidden lg:inline">{t.dualSplitView}</span>
              <span className="lg:hidden">{t.splitView}</span>
            </button>

            <button
              onClick={() => setPreviewMode('CITIZEN')}
              title={t.citizenApp}
              className={`h-7 flex items-center gap-1 px-2 sm:px-2.5 text-[10px] sm:text-[11px] font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                previewMode === 'CITIZEN'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Smartphone className="w-3 h-3 shrink-0" />
              <span>{t.citizenApp}</span>
            </button>

            <button
              onClick={() => setPreviewMode('HOSPITAL')}
              title={t.hospitalCommand}
              className={`h-7 flex items-center gap-1 px-2 sm:px-2.5 text-[10px] sm:text-[11px] font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                previewMode === 'HOSPITAL'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Building2 className="w-3 h-3 shrink-0" />
              <span className="hidden lg:inline">{t.hospitalCommand}</span>
              <span className="lg:hidden">{t.hospitalCenter}</span>
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};
