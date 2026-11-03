import React, { useState } from 'react';
import { EmergencyProvider, useEmergency } from './context/EmergencyContext';
import { GlobalNavbar } from './components/GlobalNavbar';
import { CitizenMobileApp } from './components/citizen/CitizenMobileApp';
import { HospitalDashboard } from './components/hospital/HospitalDashboard';
import { HospitalLoginSetup } from './components/hospital/HospitalLoginSetup';
import { AccidentDemoLab } from './components/citizen/AccidentDemoLab';
import { translations } from './utils/translations';

const DashboardContent: React.FC = () => {
  const { 
    previewMode, 
    isHospitalLoggedIn,
    language
  } = useEmergency();
  const t = translations[language];

  const [isGlobalAccidentLabOpen, setIsGlobalAccidentLabOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1D20] flex flex-col font-sans">
      
      {/* Top Global Navigation Bar */}
      <GlobalNavbar onOpenAccidentLab={() => setIsGlobalAccidentLabOpen(true)} />

      {/* Main Screen Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 flex flex-col items-center">
        
        {previewMode === 'DUAL' ? (
          /* Side-by-Side Dual Interactive Prototype Display Layout */
          <div className="w-full grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Citizen Mobile App Viewport (5 cols) */}
            <div className="xl:col-span-5 flex flex-col items-center">
              <div className="w-full max-w-[420px]">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2.5 px-2">
                  <span className="font-serif font-bold text-sm text-[#0B192C]">{t.citizenApp}</span>
                  <span className="text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    ● {t.realTimeSync}
                  </span>
                </div>
                <CitizenMobileApp />
              </div>
            </div>

            {/* Right Column: Hospital Command Center (7 cols) */}
            <div className="xl:col-span-7 w-full">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2.5 px-2">
                <span className="font-serif font-bold text-sm text-[#0B192C]">{t.hospitalCommandCenterTitle}</span>
                <span className="text-[11px] font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  {isHospitalLoggedIn ? `● ${t.consoleActive}` : `● ${t.authRequired}`}
                </span>
              </div>
              {isHospitalLoggedIn ? <HospitalDashboard /> : <HospitalLoginSetup />}
            </div>

          </div>
        ) : previewMode === 'CITIZEN' ? (
          /* Solo Citizen App View */
          <div className="w-full flex justify-center py-4">
            <CitizenMobileApp />
          </div>
        ) : (
          /* Solo Hospital Command Center View */
          <div className="w-full max-w-5xl py-2">
            {isHospitalLoggedIn ? <HospitalDashboard /> : <HospitalLoginSetup />}
          </div>
        )}

      </main>

      {/* Global Accident Demo Lab Modal */}
      {isGlobalAccidentLabOpen && (
        <div 
          onClick={() => setIsGlobalAccidentLabOpen(false)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 cursor-pointer animate-in fade-in"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="w-full max-w-xl cursor-default"
          >
            <AccidentDemoLab onClose={() => setIsGlobalAccidentLabOpen(false)} />
          </div>
        </div>
      )}

    </div>
  );
};

export default function App() {
  return (
    <EmergencyProvider>
      <DashboardContent />
    </EmergencyProvider>
  );
}
