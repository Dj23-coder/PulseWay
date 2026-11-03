import React, { useState } from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { 
  User, 
  Heart, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Edit3, 
  ArrowLeft, 
  AlertCircle, 
  Activity, 
  FileText,
  Clock,
  Radio,
  Share2
} from 'lucide-react';
import { FirstTimeRegistration } from './FirstTimeRegistration';

interface MedicalReportViewProps {
  onBack: () => void;
}

export const MedicalReportView: React.FC<MedicalReportViewProps> = ({ onBack }) => {
  const { userProfile, currentLocation } = useEmergency();
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <div className="space-y-3">
        <button
          onClick={() => setIsEditing(false)}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Medical ID</span>
        </button>
        <FirstTimeRegistration 
          isEditing={true} 
          onComplete={() => setIsEditing(false)} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-3.5 text-slate-900 dark:text-slate-100 max-w-md mx-auto animate-in fade-in duration-200">
      
      {/* Top Header Card */}
      <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 cursor-pointer"
            title="Back to Home"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="font-serif font-bold text-base leading-tight">
              Emergency Medical ID
            </h2>
            <span className="text-[10px] text-slate-400">
              Official EMS Clinical Triage Record
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-1 text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 px-2.5 py-1 rounded-lg border border-red-200 dark:border-red-900 cursor-pointer transition-colors"
        >
          <Edit3 className="w-3 h-3" />
          <span>Edit</span>
        </button>
      </div>

      {/* Patient Primary Health ID Badge */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white shadow-lg space-y-3 border border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-red-600/90 text-white flex items-center justify-center font-bold">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[9px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
                PulseWay Verified ID
              </span>
              <h3 className="font-serif font-bold text-lg leading-tight">
                {userProfile.fullName || 'Registered Citizen'}
              </h3>
            </div>
          </div>

          {/* Blood Group Pill */}
          <div className="px-3 py-1.5 rounded-xl bg-red-600 text-white text-center shadow-md">
            <span className="text-[8px] uppercase tracking-wider block font-medium opacity-80">Blood</span>
            <span className="font-mono font-black text-lg leading-none">{userProfile.bloodGroup || 'O+'}</span>
          </div>
        </div>

        {/* 4-Tile Biometrics Strip */}
        <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-800 text-center">
          <div className="p-1.5 rounded-lg bg-slate-800/60">
            <span className="text-[9px] text-slate-400 block">Age</span>
            <span className="font-mono text-xs font-bold text-slate-100">{userProfile.age || 32} yrs</span>
          </div>
          <div className="p-1.5 rounded-lg bg-slate-800/60">
            <span className="text-[9px] text-slate-400 block">Sex</span>
            <span className="font-mono text-xs font-bold text-slate-100">{userProfile.sex || 'Male'}</span>
          </div>
          <div className="p-1.5 rounded-lg bg-slate-800/60">
            <span className="text-[9px] text-slate-400 block">Height</span>
            <span className="font-mono text-xs font-bold text-slate-100">{userProfile.height || '178 cm'}</span>
          </div>
          <div className="p-1.5 rounded-lg bg-slate-800/60">
            <span className="text-[9px] text-slate-400 block">Weight</span>
            <span className="font-mono text-xs font-bold text-slate-100">{userProfile.weight || '74 kg'}</span>
          </div>
        </div>
      </div>

      {/* Allergies & Medical Warnings */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-xs space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4" />
          <span>Known Medical Allergies & Contraindications</span>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {userProfile.allergies && userProfile.allergies.length > 0 ? (
            userProfile.allergies.map((allergy, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-900"
              >
                ⚠ {allergy}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-400">No known drug allergies reported.</span>
          )}

          {userProfile.customAllergies?.map((custom, idx) => (
            <span
              key={`c-${idx}`}
              className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900"
            >
              ⚠ {custom}
            </span>
          ))}
        </div>
      </div>

      {/* Emergency Contacts (Priority 1 & 2) */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-800 dark:text-slate-200">Registered Emergency Contacts (SOS)</span>
          <span className="text-[10px] text-emerald-600 font-mono font-semibold">Auto-Notified on Crash</span>
        </div>

        <div className="space-y-2">
          {userProfile.emergencyContacts?.map((contact, idx) => (
            <div
              key={contact.id || idx}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                    P{idx + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {contact.fullName}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    ({contact.relationship})
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                  {contact.mobile}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <a
                  href={`tel:${contact.mobile}`}
                  className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                  title={`Call ${contact.fullName}`}
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact & Residential Details */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-xs space-y-2 text-xs">
        <span className="font-bold text-slate-800 dark:text-slate-200 block">
          Primary Identity & Residential Address
        </span>

        <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
          <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-400">Primary Mobile</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{userProfile.mobile || '+91 98450 12345'}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-400">Email ID</span>
            <span className="font-mono text-slate-800 dark:text-slate-200">{userProfile.email || 'user@pulseway.org'}</span>
          </div>

          <div className="pt-1">
            <span className="text-slate-400 block mb-0.5">Permanent Residence:</span>
            <span className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium block">
              {userProfile.permanentAddress || 'Indiranagar 100ft Road, Bengaluru, Karnataka 560038'}
            </span>
          </div>

          <div className="pt-2 flex items-center justify-between text-[10px] text-emerald-600 font-semibold">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Continuous GPS Consent Granted</span>
            </span>
            <span className="font-mono text-slate-400">Verified</span>
          </div>
        </div>
      </div>

      {/* Bottom Action Button */}
      <div className="pt-1">
        <button
          onClick={onBack}
          className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer shadow-sm text-center"
        >
          Done & Return to Emergency Hub
        </button>
      </div>

    </div>
  );
};
