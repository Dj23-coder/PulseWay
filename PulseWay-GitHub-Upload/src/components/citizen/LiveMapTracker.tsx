import React, { useState, useEffect } from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { EmergencyIncident } from '../../types';
import { 
  Phone, 
  MapPin, 
  Hospital, 
  Clock, 
  CheckCircle2, 
  Share2, 
  Navigation,
  Activity,
  Bed,
  Volume2,
  VolumeX,
  RotateCcw,
  Radio
} from 'lucide-react';
import { RealisticEmergencyMap } from '../common/RealisticEmergencyMap';
import { translations } from '../../utils/translations';

export const LiveMapTracker: React.FC<{ incident: EmergencyIncident }> = ({ incident }) => {
  const { 
    hospitals, 
    resolveEmergencyWithAmbulanceArrival, 
    language,
    playReassuranceVoice,
    isReassuranceVoicePlaying,
    userProfile
  } = useEmergency();
  const t = translations[language];

  const [copiedLink, setCopiedLink] = useState(false);

  // Trigger automated reassurance audio when tracking mounts
  useEffect(() => {
    playReassuranceVoice(language);
  }, []);

  const assignedHosp = hospitals.find(h => h.id === incident.assignedHospitalId) || hospitals[0];

  const handleShareTracking = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-stone-200 dark:border-slate-800 shadow-xl overflow-hidden text-slate-900 dark:text-slate-100 space-y-3">
      
      {/* 1. Live Status Strip */}
      <div className="bg-[#0B192C] text-white px-4 py-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping shrink-0"></span>
          <span className="font-bold uppercase tracking-wider text-slate-100">
            {t.ambulanceDispatchedTitle} [{incident.ambulance?.vehicleNo || 'KA-04-ALS-1082'}]
          </span>
        </div>
        <div className="font-mono font-bold bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 px-2 py-0.5 rounded-md text-[11px]">
          ETA: ~{incident.ambulance?.etaMinutes || 5} MINS
        </div>
      </div>

      {/* 2. AUTOMATED REASSURANCE VOICE BROADCAST STRIP (Requirement 8) */}
      <div className="mx-3.5 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 shadow-xs">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Radio className={`w-3.5 h-3.5 ${isReassuranceVoicePlaying ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-emerald-800 dark:text-emerald-300 block">
                {t.reassuranceVoicePlaying}
              </span>
              <span className="text-[11px] font-semibold text-emerald-900 dark:text-emerald-200">
                {isReassuranceVoicePlaying ? 'Broadcasting live voice...' : 'Voice broadcast standby'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => playReassuranceVoice(language)}
              className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t.replayVoiceBtn}</span>
            </button>
          </div>
        </div>

        {/* Reassurance Voice Transcript */}
        <p className="text-[11px] text-emerald-900/90 dark:text-emerald-300/90 leading-relaxed italic border-t border-emerald-200/60 dark:border-emerald-800/40 pt-1.5">
          "{t.reassuranceTranscript}"
        </p>
      </div>

      {/* 3. REALISTIC MAP VISUALIZER (Leaflet with Standard Free OpenStreetMap Tiles) */}
      <div className="px-3.5">
        <RealisticEmergencyMap
          patientCoords={incident.coordinates}
          hospitalCoords={assignedHosp.coordinates}
          hospitalName={incident.assignedHospitalName || assignedHosp.name}
          patientName={incident.patient.fullName}
          ambulanceCoords={incident.ambulance?.currentCoords}
          vehicleNo={incident.ambulance?.vehicleNo || 'KA-04-ALS-1082'}
          driverName={incident.ambulance?.driverName || 'Rameshwar Patil (Paramedic)'}
          etaMinutes={incident.ambulance?.etaMinutes || 5}
          isDispatched={true}
          heightClass="h-64 sm:h-72"
        />
      </div>

      {/* 4. Information Panels */}
      <div className="p-4 pt-1 space-y-3.5 text-xs">
        
        {/* Status Milestones Bar */}
        <div className="flex items-center justify-between relative pb-3 border-b border-stone-100 dark:border-slate-800">
          {[
            { label: 'Dispatched', active: true, done: true },
            { label: 'On The Way', active: true, done: (incident.ambulance?.etaMinutes || 5) < 3 },
            { label: 'Arrived', active: (incident.ambulance?.etaMinutes || 5) <= 1, done: false },
            { label: 'To Hospital', active: false, done: false }
          ].map((step, idx) => (
            <div key={idx} className="flex flex-col items-center z-10">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step.done || step.active
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
              }`}>
                {step.done ? '✓' : idx + 1}
              </div>
              <span className={`text-[10px] font-semibold mt-1 ${
                step.active ? 'text-red-600 dark:text-red-400 font-bold' : 'text-slate-400'
              }`}>
                {step.label}
              </span>
            </div>
          ))}
          <div className="absolute top-2.5 left-4 right-4 h-0.5 bg-slate-200 dark:bg-slate-800 -z-0"></div>
        </div>

        {/* Assigned Hospital & Driver Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="p-3 rounded-2xl bg-[#FAF8F5] dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-semibold mb-1">
              <Hospital className="w-3.5 h-3.5 text-blue-500" />
              <span>{t.assignedHospital}</span>
            </div>
            <div className="font-bold text-slate-900 dark:text-white text-xs">
              {incident.assignedHospitalName || assignedHosp.name}
            </div>
            <div className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              GPS: {assignedHosp.coordinates.lat.toFixed(5)}° N, {assignedHosp.coordinates.lng.toFixed(5)}° E
            </div>
            <a
              href={`tel:${incident.assignedHospitalPhone || assignedHosp.phone}`}
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-red-600 dark:text-red-400 hover:underline"
            >
              <Phone className="w-3 h-3" />
              {t.callHospital} ({incident.assignedHospitalPhone || assignedHosp.phone})
            </a>
          </div>

          <div className="p-3 rounded-2xl bg-[#FAF8F5] dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-semibold mb-1">
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              <span>{incident.ambulance?.vehicleNo || 'KA-04-ALS-1082'}</span>
            </div>
            <div className="font-bold text-slate-900 dark:text-white text-xs">
              {incident.ambulance?.driverName || 'Rameshwar Patil (Paramedic)'}
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
              Live Speed: <strong>48 km/h</strong> · Telemetry Active
            </div>
            <a
              href={`tel:${incident.ambulance?.driverPhone || '+91 94480 55123'}`}
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              <Phone className="w-3 h-3" />
              {t.callDriver} ({incident.ambulance?.driverPhone || '+91 94480 55123'})
            </a>
          </div>
        </div>

        {/* Pre-Arrival Bed & Doctor Allocation Sync */}
        {incident.preArrivalAllocation ? (
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono uppercase font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {t.bedReservedSync}
              </span>
              <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full">
                Locked
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-800 dark:text-slate-200 pt-1">
              <div>
                <span className="text-[10px] text-slate-400 block">{t.bedNo}:</span>
                <strong className="font-mono font-bold text-emerald-800 dark:text-emerald-300">{incident.preArrivalAllocation.bedNo}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Floor / Room:</span>
                <strong className="font-mono">Fl {incident.preArrivalAllocation.floorNo}, Rm {incident.preArrivalAllocation.roomNo}</strong>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] text-slate-400 block">{t.doctorAllotted}:</span>
                <strong className="text-emerald-700 dark:text-emerald-400">{incident.preArrivalAllocation.doctorAllotted}</strong>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between text-[11px] text-amber-900 dark:text-amber-300">
            <div className="flex items-center gap-2">
              <Bed className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Receiving bay preparing bed & trauma doctor allocation...</span>
            </div>
            <span className="text-[10px] font-mono bg-amber-200/60 dark:bg-amber-900/60 px-1.5 py-0.5 rounded font-bold">Syncing</span>
          </div>
        )}

        {/* AUTOMATED WHATSAPP & MESSENGER CONTACTS DISPATCH (Requirement 5) */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950/40 dark:to-blue-950/40 border border-emerald-300 dark:border-emerald-800 shadow-sm space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                💬
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                  <span>{t.contactsNotifiedTitle}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                    ● WhatsApp & Messenger
                  </span>
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
                  {t.contactsNotifiedDesc}
                </p>
              </div>
            </div>
          </div>

          {/* List of Contacts */}
          <div className="space-y-1.5 pt-1">
            {userProfile.emergencyContacts && userProfile.emergencyContacts.length > 0 ? (
              userProfile.emergencyContacts.map((contact) => (
                <div 
                  key={contact.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                    <span className="font-bold text-slate-900 dark:text-white truncate">
                      {contact.fullName} ({contact.relationship})
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 truncate">
                      {contact.mobile}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 shrink-0">
                    ✓ {t.whatsappMessengerSent}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 text-xs">
                <span className="font-bold text-slate-800">Primary Contact (Family)</span>
                <span className="text-[10px] font-mono font-bold text-emerald-700">✓ {t.whatsappMessengerSent}</span>
              </div>
            )}
          </div>

          {/* Message Content Preview */}
          <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-emerald-200 dark:border-emerald-800/60 text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
              {t.messageContentLabel}:
            </span>
            <p className="font-mono text-[10px] text-slate-800 dark:text-slate-200 leading-snug break-words">
              "🚨 ALERT: {userProfile.fullName} has triggered emergency medical response. Condition: {incident.patient.cause || 'Critical Condition'}. Assigned: {incident.assignedHospitalName || assignedHosp.name}. Paramedic ETA: {incident.ambulance?.etaMinutes || 5}m. Location: {incident.coordinates.address}."
            </p>
          </div>

          {/* Quick Direct Reshare Links */}
          <div className="flex items-center gap-2 pt-1">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`🚨 EMERGENCY ALERT: ${userProfile.fullName} requires medical response. Condition: ${incident.patient.cause || 'Emergency'}. Hospital: ${incident.assignedHospitalName || assignedHosp.name}. Location: ${incident.coordinates.address || 'GPS Coordinates'}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-1.5 px-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            >
              <span>{t.openWhatsApp}</span>
            </a>

            <button
              type="button"
              onClick={handleShareTracking}
              className="flex-1 py-1.5 px-2.5 rounded-xl bg-[#0084FF] hover:bg-[#0074E4] text-white font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Share2 className="w-3 h-3" />
              <span>{copiedLink ? t.linkCopied : t.openMessenger}</span>
            </button>
          </div>
        </div>

        {/* Ambulance Has Reached Button */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => resolveEmergencyWithAmbulanceArrival()}
            className="w-full py-3.5 px-4 rounded-full bg-[#10B981] hover:bg-[#0F9D75] text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-transform active:scale-[0.98] cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{t.ambulanceReachedBtn}</span>
          </button>
        </div>

      </div>

    </div>
  );
};
