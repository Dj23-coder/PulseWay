import React, { useState } from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { 
  ShieldAlert, 
  MapPin, 
  Menu, 
  X, 
  Send, 
  Flame, 
  Heart, 
  Car, 
  Skull, 
  PhoneCall, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Radio, 
  Navigation, 
  FileText, 
  User, 
  Users, 
  LogOut, 
  BookOpen, 
  History, 
  Activity, 
  Layers, 
  Sparkles, 
  ArrowRight, 
  Bike, 
  Volume2, 
  VolumeX, 
  MessageSquare,
  Bot,
  RotateCcw,
  Ambulance
} from 'lucide-react';
import { LiveMapTracker } from './LiveMapTracker';
import { SurvivalGuide } from './SurvivalGuide';
import { AIChatHistory } from './AIChatHistory';
import { FirstTimeRegistration } from './FirstTimeRegistration';
import { MedicalReportView } from './MedicalReportView';
import { RealisticEmergencyMap } from '../common/RealisticEmergencyMap';
import { AccidentDemoLab } from './AccidentDemoLab';
import { translations } from '../../utils/translations';
import { sendEmergencyChatMessage, ChatMessage } from '../../utils/gemini';

export const CitizenMobileApp: React.FC = () => {
  const {
    language,
    setLanguage,
    currentLocation,
    updateLocation,
    recalibrateHighAccuracyGPS,
    userProfile,
    activeIncident,
    startEmergencyTrigger,
    setTargetSelfOrOthers,
    submitOtherPatientInfo,
    confirmCriticalBooking,
    cancelCriticalBooking,
    confirmMisuseWarning,
    cancelMisuseWarning,
    resetEmergency,
    escalateToCriticalAmbulance,
    travelSpeed,
    isAccidentDetected,
    accidentCountdown,
    triggerAccidentSimulation,
    cancelAccidentTimer,
    isAlarmMuted,
    setIsAlarmMuted,
    resolveEmergencyWithAmbulanceArrival,
    isUserRegistered,
    setIsUserRegistered
  } = useEmergency();
  const t = translations[language];

  // Navigation Drawer state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'HOME' | 'SURVIVAL' | 'HISTORY' | 'SETTINGS'>('HOME');

  // Solo Commute Accident Lab Modal State
  const [isAccidentLabOpen, setIsAccidentLabOpen] = useState(false);

  // GPS & Location Calibration Modal State
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isCalibratingGps, setIsCalibratingGps] = useState(false);
  const [manualStreetInput, setManualStreetInput] = useState(currentLocation.address || '');
  const [manualLandmarkInput, setManualLandmarkInput] = useState(currentLocation.landmark || '');

  // Multilingual Gemini AI Chat & Triage State
  const [inputText, setInputText] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [showEmergencySuggestions, setShowEmergencySuggestions] = useState(false);

  const handleSendChatMessage = async (msgText: string) => {
    const text = msgText.trim();
    if (!text) return;
    setInputText('');

    const userMsg: ChatMessage = {
      id: `USR-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language
    };

    const nextHistory = [...chatMessages, userMsg];
    setChatMessages(nextHistory);
    setIsAiThinking(true);

    try {
      const aiResult = await sendEmergencyChatMessage(nextHistory, text, language, userProfile);
      const isAmbReq = !!(aiResult.isAmbulanceRequest || text.toLowerCase().includes('ambulance') || text.toLowerCase().includes('108') || text.toLowerCase().includes('112') || text.toLowerCase().includes('hospital'));
      const aiMsg: ChatMessage = {
        id: `AI-${Date.now()}`,
        sender: 'assistant',
        text: aiResult.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language,
        severity: (aiResult.severity === 'CRITICAL' || isAmbReq) ? 'CRITICAL' : 'MINOR',
        isCritical: aiResult.isCritical || isAmbReq,
        isAmbulanceRequest: isAmbReq
      };
      setChatMessages(prev => [...prev, aiMsg]);
      // Per requirement 2: Automated voice is heard only once ambulance is allotted to user, not in chat.
    } catch (e) {
      console.error('Chat error:', e);
    } finally {
      setIsAiThinking(false);
    }
  };

  // Others Form State
  const [otherCause, setOtherCause] = useState('');
  const [otherGender, setOtherGender] = useState('Male');
  const [otherBloodGroup, setOtherBloodGroup] = useState('O+');
  const [otherHeight, setOtherHeight] = useState('');

  // Proactive emergency shortcut definitions (displayed when chat is focused/clicked)
  const emergencyShortcuts = [
    { id: 'cardiac', title: t.shortcutCardiac, icon: <Heart className="w-4 h-4 text-red-500" />, desc: t.shortcutCardiacDesc, query: 'Severe chest pain and difficulty breathing' },
    { id: 'trauma', title: t.shortcutTrauma, icon: <Car className="w-4 h-4 text-amber-500" />, desc: t.shortcutTraumaDesc, query: 'Motor vehicle accident with severe bleeding and injury' },
    { id: 'fire', title: t.shortcutFire, icon: <Flame className="w-4 h-4 text-orange-500" />, desc: t.shortcutFireDesc, query: 'Severe fire accident and second-degree burns' },
    { id: 'poisoning', title: t.shortcutPoison, icon: <Skull className="w-4 h-4 text-purple-500" />, desc: t.shortcutPoisonDesc, query: 'Accidental poison consumption or snake bite toxic reaction' }
  ];

  const handleTriggerWithText = (text: string) => {
    if (!text.trim()) return;
    startEmergencyTrigger(text);
    setInputText('');
  };

  const handleOtherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitOtherPatientInfo({
      cause: otherCause || 'Third-Party Emergency Case',
      gender: otherGender,
      bloodGroup: otherBloodGroup,
      height: otherHeight
    });
  };

  // If user is not registered, show the 4-section registration page directly
  if (!isUserRegistered) {
    return <FirstTimeRegistration />;
  }

  return (
    <div className="relative w-full max-w-[420px] mx-auto bg-white rounded-3xl border border-stone-200/90 shadow-2xl shadow-slate-900/10 overflow-hidden flex flex-col min-h-[680px] max-h-[860px]">
      
      {/* 1. ANTI-ABUSE BANNER (Permanent & Always-Visible at Top) */}
      <div className="bg-[#0B192C] text-white px-3 py-1.5 text-[11px] font-bold tracking-tight text-center flex items-center justify-center gap-1.5 shadow-xs z-30 shrink-0 border-b border-slate-800">
        <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-[#F59E0B]" />
        <span className="leading-tight text-slate-200">
          {t.antiAbuseWarning}
        </span>
      </div>

      {/* 2. APP-LEVEL HEADER BAR */}
      <div className="bg-white px-3.5 py-3 border-b border-stone-200 flex items-center justify-between shrink-0 z-20">
        
        {/* Left: Interactive Live Location Display */}
        <button
          onClick={() => {
            setManualStreetInput(currentLocation.address || '');
            setManualLandmarkInput(currentLocation.landmark || '');
            setIsLocationModalOpen(true);
          }}
          className="flex items-center gap-1.5 max-w-[185px] text-left p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group"
          title="Click to recalibrate GPS or refine location"
        >
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-[9px] uppercase font-bold text-slate-400 group-hover:text-emerald-600 block tracking-wider leading-none">
                Live GPS
              </span>
              <span className="text-[8px] font-mono px-1 rounded bg-emerald-50 text-emerald-700 font-bold leading-tight">
                ±{currentLocation.accuracyMeters || 3}m
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-slate-900 truncate block">
              {currentLocation.lat.toFixed(5)}° N, {currentLocation.lng.toFixed(5)}° E
            </span>
          </div>
        </button>

        {/* Center: Application Name */}
        <div className="font-serif font-bold text-base tracking-tight text-[#0B192C] flex items-center gap-1">
          <span className="text-red-600">Pulse</span>Way
        </div>

        {/* Right: Language Dropdown & Hamburger Menu Trigger */}
        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={e => setLanguage(e.target.value as any)}
            className="text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="en">ENG</option>
            <option value="kn">ಕನ್ನಡ</option>
            <option value="hi">हिंदी</option>
          </select>

          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 transition-colors cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5 text-slate-800 dark:text-slate-100" />
          </button>
        </div>

      </div>

      {/* 3. SLIDE-OUT HAMBURGER MENU DRAWER (Closes when clicking screen beside it) */}
      {isMenuOpen && (
        <div 
          onClick={() => setIsMenuOpen(false)}
          className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end cursor-pointer"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="w-4/5 max-w-xs bg-white dark:bg-slate-900 h-full p-4 flex flex-col justify-between shadow-2xl border-l border-slate-200 dark:border-slate-800 cursor-default animate-in slide-in-from-right duration-200"
          >
            <div>
              {/* Header with prominent, highly visible close button */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">PulseWay Menu</span>
                <button 
                  onClick={() => setIsMenuOpen(false)} 
                  className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 cursor-pointer transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4 text-slate-900 dark:text-white" />
                </button>
              </div>

              <div className="mt-4 space-y-1.5 text-xs">
                <button
                  onClick={() => { setCurrentView('SURVIVAL'); setIsMenuOpen(false); }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200 text-left transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <span>1. Survival Guide (Alone & Assisted)</span>
                </button>

                <button
                  onClick={() => { setCurrentView('HISTORY'); setIsMenuOpen(false); }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200 text-left transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center shrink-0">
                    <History className="w-4 h-4" />
                  </div>
                  <span>2. AI Chat History (Saved Reports)</span>
                </button>

                <button
                  onClick={() => { setCurrentView('SETTINGS'); setIsMenuOpen(false); }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200 text-left transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <span>3. Account Settings (Medical Info)</span>
                </button>
              </div>
            </div>

            {/* Logout Button */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('pulseway_citizen_session');
                    localStorage.removeItem('pulseway_registered');
                  }
                  setIsUserRegistered(false);
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out / Switch Account</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. SUB-PAGES (SURVIVAL GUIDE, HISTORY, SETTINGS) */}
      {currentView === 'SURVIVAL' && (
        <div className="flex-1 overflow-y-auto p-3">
          <SurvivalGuide onBack={() => setCurrentView('HOME')} />
        </div>
      )}

      {currentView === 'HISTORY' && (
        <div className="flex-1 overflow-y-auto p-3">
          <AIChatHistory onBack={() => setCurrentView('HOME')} />
        </div>
      )}

      {currentView === 'SETTINGS' && (
        <div className="flex-1 overflow-y-auto p-3">
          <MedicalReportView onBack={() => setCurrentView('HOME')} />
        </div>
      )}

      {/* 5. MAIN CONTENT AREA (EMERGENCY HUB) */}
      {currentView === 'HOME' && (
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
          
          {/* A. AUTOMATED ACCIDENT DETECTION MODAL (STAYS AT ONE PLACE, ZERO BOUNCE, CONTINUOUS AUDIO SIREN) */}
          {isAccidentDetected && (
            <div className="bg-red-600 text-white p-4 rounded-2xl shadow-2xl border-2 border-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider bg-black/30 px-2.5 py-1 rounded-lg">
                  🚨 Kinetic Impact: Speed 0 km/h
                </span>
                <span className="text-2xl font-mono font-black bg-black/40 px-3 py-0.5 rounded-lg">
                  {accidentCountdown}s
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold leading-tight">
                  Potential Accident Detected!
                </h3>
                <p className="text-xs text-red-100 leading-snug">
                  Continuous alarm siren is active. If you are uninjured, press Cancel below to silence the alarm. Otherwise, Code Red ambulance dispatch will initiate in {accidentCountdown} seconds.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={cancelAccidentTimer}
                  className="flex-1 py-3 px-3 rounded-xl bg-white text-red-700 font-extrabold text-xs hover:bg-slate-100 transition-colors shadow-md cursor-pointer text-center"
                >
                  I Am Safe (Turn Off Alarm)
                </button>

                <button
                  onClick={() => setIsAlarmMuted(!isAlarmMuted)}
                  title={isAlarmMuted ? 'Unmute Siren' : 'Mute Siren'}
                  className="p-3 rounded-xl bg-black/30 hover:bg-black/50 text-white transition-colors cursor-pointer"
                >
                  {isAlarmMuted ? <VolumeX className="w-4 h-4 text-amber-300" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => {
                    cancelAccidentTimer();
                    startEmergencyTrigger('AUTOMATED ACCIDENT CODE RED');
                  }}
                  className="py-3 px-3 rounded-xl bg-slate-950 text-white font-bold text-xs hover:bg-black transition-colors cursor-pointer"
                >
                  SOS Now
                </button>
              </div>
            </div>
          )}

          {/* B. ACTIVE EMERGENCY LIFECYCLE CONTROLLERS */}

          {/* STEP 1: POPUP UI: IS THIS FOR SELF OR OTHERS? + LEGAL WARNING */}
          {activeIncident?.status === 'TRIGGER_TARGET_PROMPT' && (
            <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping" />
                <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-slate-500">
                  Step 1: Emergency Identification
                </span>
              </div>
              <h2 className="font-serif text-xl font-bold text-[#0B192C]">
                Who requires emergency assistance?
              </h2>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setTargetSelfOrOthers('SELF')}
                  className="p-4 rounded-2xl border-2 border-[#0B192C] bg-[#0B192C] text-white font-bold text-xs text-center shadow-md hover:bg-[#1A2E44] transition-all active:scale-95 flex flex-col items-center gap-2 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-[#10B981]" />
                  </div>
                  <span className="text-sm">For Myself</span>
                  <span className="text-[10px] font-normal text-slate-300">(Auto-fetch profile)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetSelfOrOthers('OTHERS')}
                  className="p-4 rounded-2xl border border-stone-300 bg-white text-slate-800 font-bold text-xs text-center hover:border-slate-400 transition-all active:scale-95 flex flex-col items-center gap-2 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm">For Someone Else</span>
                  <span className="text-[10px] font-normal text-slate-500">(Bystander intake)</span>
                </button>
              </div>

              {/* Mandatory Legal Warning Overlay */}
              <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-amber-300/60 text-[11px] text-amber-900 leading-relaxed">
                <strong>LEGAL MANDATE:</strong> False alarms, pranks, or misuse of emergency services are serious punishable offenses under law.
              </div>

              <button
                type="button"
                onClick={resetEmergency}
                className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800 pt-1 cursor-pointer"
              >
                Cancel Emergency Request
              </button>
            </div>
          )}

          {/* STEP 2: DATA GATHERING FOR OTHERS */}
          {activeIncident?.status === 'DATA_GATHERING_OTHERS' && (
            <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#2563EB]">
                  Step 2: Bystander Victim Data
                </span>
                <span className="text-[10px] text-slate-400">Quick Triage Intake</span>
              </div>

              <form onSubmit={handleOtherSubmit} className="space-y-2.5 text-xs">
                <div>
                  <label className="block font-medium text-slate-800 dark:text-slate-200 mb-0.5">
                    Cause / Nature of Emergency *
                  </label>
                  <input
                    type="text"
                    required
                    value={otherCause}
                    onChange={e => setOtherCause(e.target.value)}
                    placeholder="e.g. Unconscious after fall, bleeding heavily"
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-medium text-slate-800 dark:text-slate-200 mb-0.5">Gender</label>
                    <select
                      value={otherGender}
                      onChange={e => setOtherGender(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 cursor-pointer"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-800 dark:text-slate-200 mb-0.5">Blood Group</label>
                    <select
                      value={otherBloodGroup}
                      onChange={e => setOtherBloodGroup(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 font-mono cursor-pointer"
                    >
                      {['Unknown', 'O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-800 dark:text-slate-200 mb-0.5">Height (Est)</label>
                    <input
                      type="text"
                      value={otherHeight}
                      onChange={e => setOtherHeight(e.target.value)}
                      placeholder="e.g. 175cm"
                      className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/30 transition-all active:scale-95 cursor-pointer"
                >
                  Run Instant AI Clinical Triage
                </button>
              </form>
            </div>
          )}

          {/* STEP 3 PATH A: MINOR EMERGENCY FIRST AID MODE (NO AMBULANCE) */}
          {activeIncident?.status === 'MINOR_FIRST_AID' && (
            <div className="bg-white rounded-3xl border border-emerald-500/80 p-5 shadow-2xl space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {t.minorEmergencyTitle}
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  No Ambulance Needed
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 leading-relaxed font-medium">
                {t.minorNoAmbulanceNotice}
              </div>

              <h3 className="font-serif text-base font-bold text-[#1A1D20]">
                {t.firstAidStepsTitle}
              </h3>

              <div className="space-y-2">
                {activeIncident.firstAidInstructions.map((step, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#FAF8F5] border border-stone-200 text-xs text-slate-800">
                    <span className="font-bold text-emerald-700 font-mono w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-[11px]">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>

              {/* Navigation & Escalation */}
              <div className="pt-2 border-t border-stone-100 space-y-2">
                <button
                  type="button"
                  onClick={escalateToCriticalAmbulance}
                  className="w-full py-2.5 px-3 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>{t.escalateToAmbulanceBtn}</span>
                </button>

                <button
                  type="button"
                  onClick={resetEmergency}
                  className="w-full py-2.5 px-4 rounded-full bg-[#0B192C] text-white hover:bg-[#1A2E44] font-semibold text-xs shadow-sm cursor-pointer transition-colors"
                >
                  {t.closeGuidanceBtn}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 PATH B: POPUP 1 BOOKING CONFIRMATION */}
          {activeIncident?.status === 'CRITICAL_POPUP_BOOKING' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping"></span>
                  <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-slate-500">
                    Step 2: Emergency Response Confirmation
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 font-mono text-[10px] font-bold">
                  CRITICAL SEVERITY
                </span>
              </div>

              <div>
                <h3 className="font-serif text-lg font-bold text-[#1A1D20] leading-snug">
                  Confirm Ambulance & Hospital Bed Reservation?
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  This appears to be a critical emergency. Do you want to confirm an ambulance and a bed at the nearest hospital?
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-stone-200 text-xs text-slate-700">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Clinical Assessment
                </span>
                <span className="font-medium text-[#1A1D20]">
                  {activeIncident.clinicalReasoning || 'Immediate ALS ambulance dispatch and pre-arrival bed reservation indicated.'}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  onClick={confirmCriticalBooking}
                  className="flex-1 py-3 px-5 rounded-full bg-[#10B981] hover:bg-[#0F9D75] text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all active:scale-[0.98] cursor-pointer text-center flex items-center justify-center gap-1.5"
                >
                  <span>Confirm (Next)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={cancelCriticalBooking}
                  className="py-3 px-4 rounded-full bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-300 transition-colors cursor-pointer text-center"
                >
                  Cancel (First Aid Only)
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 PATH B: POPUP 2 MISUSE WARNING */}
          {activeIncident?.status === 'CRITICAL_POPUP_MISUSE' && (
            <div className="bg-[#0B192C] text-white rounded-3xl p-5 shadow-2xl border border-slate-800 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#F59E0B]" />
                <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-amber-400">
                  Statutory Warning: Legal Accountability
                </span>
              </div>

              <div>
                <h3 className="font-serif text-lg font-bold text-white leading-snug">
                  Legal Verification Notice
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Warning: Making a false or prank emergency request is a punishable offence under law. Misuse of emergency services may lead to legal action. Proceed only if this is a genuine emergency.
                </p>
              </div>

              <div className="text-[11px] text-slate-400 font-mono bg-[#0D1B2A] p-3 rounded-2xl border border-slate-800">
                🔒 Digital fingerprint, device ID, and live GPS coordinates ({currentLocation.lat.toFixed(5)}° N, {currentLocation.lng.toFixed(5)}° E) are logged for official audit compliance.
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  onClick={confirmMisuseWarning}
                  className="flex-1 py-3 px-5 rounded-full bg-[#10B981] hover:bg-[#0F9D75] text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all active:scale-[0.98] cursor-pointer text-center flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Ambulance</span>
                </button>
                <button
                  onClick={cancelMisuseWarning}
                  className="py-3 px-4 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer text-center"
                >
                  Quit (Abort Request)
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 STRICT GATEKEEPER: LOOKING / WAITING FOR HOSPITAL RESPONSE */}
          {(activeIncident?.status === 'WAITING_HOSPITAL_ACCEPTANCE' || activeIncident?.status === 'HOSPITAL_ACCEPTED') && (
            <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xl space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5">
                  <Radio className="w-3 h-3 animate-spin text-amber-600" />
                  <span>{activeIncident.status === 'HOSPITAL_ACCEPTED' ? 'Hospital Accepted Alert' : 'Alert Broadcasted to Nearby Hospitals'}</span>
                </span>
                <span className="text-xs font-mono font-bold text-amber-700">
                  {activeIncident.waitTimerSeconds}s
                </span>
              </div>

              {/* Prominent High-Visibility Status Box */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#F59E0B] text-white flex items-center justify-center mx-auto shadow-md shadow-amber-500/20 animate-pulse">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-base font-bold text-[#1A1D20]">
                  {activeIncident.status === 'HOSPITAL_ACCEPTED'
                    ? `Hospital Connected: ${activeIncident.assignedHospitalName || 'Manipal Hospital'}`
                    : 'Looking & Waiting for Response from Nearest Hospital...'}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                  {activeIncident.status === 'HOSPITAL_ACCEPTED'
                    ? 'The hospital emergency center has acknowledged your case. Paramedic crew and ALS vehicle are being prepared. Waiting for hospital dashboard dispatch command...'
                    : 'Per emergency protocol, the ambulance is dispatched only after the hospital dashboard confirms acceptance and assigns an ALS unit.'}
                </p>
              </div>

              {/* Broadcast details */}
              <div className="text-[11px] text-slate-500 flex items-center justify-between px-1">
                <span>Broadcast Radius: <strong className="text-slate-800">{activeIncident.alertBroadcastRadiusKm} km</strong></span>
                <span className="text-emerald-700 font-semibold">● Live Connection Active</span>
              </div>

              {/* Simulation Helper Note for User testing */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 text-center">
                👉 <em>Open the <strong>Hospital Emergency Center</strong> view, click on this patient profile in the feed, and click <strong>"Ambulance Dispatch"</strong> to dispatch the unit!</em>
              </div>
            </div>
          )}

          {/* STEP 4: LIVE MAP TRACKER & POST-DISPATCH COORDINATION (ONLY WHEN AMBULANCE IS DISPATCHED!) */}
          {activeIncident?.status === 'AMBULANCE_DISPATCHED' && (
            <LiveMapTracker incident={activeIncident} />
          )}

          {/* STEP 5: TREATMENT COMPLETED NOTIFICATION */}
          {activeIncident?.status === 'TREATMENT_COMPLETED' && (
            <div className="bg-white rounded-3xl border border-emerald-500/80 p-5 shadow-2xl space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  TREATMENT COMPLETED
                </span>
                <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Bed & Unit Freed
                </span>
              </div>

              <div>
                <h3 className="font-serif text-lg font-bold text-[#1A1D20]">
                  Emergency Care Delivered & Closed
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  The clinical team at <strong>{activeIncident.assignedHospitalName || 'Manipal Hospital'}</strong> has finalized patient emergency stabilization and recorded complete discharge/ward transfer.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">Attending Doctor:</span>
                  <span className="font-semibold text-slate-800">{activeIncident.preArrivalAllocation?.doctorAllotted || 'Dr. Arvind Sharma (Trauma Lead)'}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">Allotted Bed:</span>
                  <span className="font-mono font-bold text-emerald-700">{activeIncident.preArrivalAllocation?.bedNo || 'Bed ICU-02'} (Released)</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">Resolution Status:</span>
                  <span className="font-semibold text-emerald-700">Stable / Resolved</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={resetEmergency}
                  className="w-full py-3 px-4 rounded-full bg-[#0F9D75] hover:bg-[#10B981] text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Return to Home & View Summary</span>
                </button>
              </div>
            </div>
          )}

          {/* C. HERO / CLEAN HOME INTERFACE (When Idle or no active emergency) */}
          {(!activeIncident || activeIncident.status === 'IDLE') && (
            <div className="space-y-4 pt-1">
              
              {/* SOLO COMMUTER & ACCIDENT DETECTION STATUS CARD */}
              <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                      <Bike className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        {t.soloCommuteTitle || 'Solo Commute Accident Monitor'}
                      </span>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                        {t.speedLabel || 'Speed'}: {travelSpeed} km/h · {t.motionArmed || 'Motion Armed'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsAccidentLabOpen(true)}
                    className="text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors"
                  >
                    Lab
                  </button>
                </div>

                <button
                  onClick={triggerAccidentSimulation}
                  className="w-full py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md shadow-red-600/30 transition-transform active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-200" />
                  <span>💥 Demo Accident (Drop Speed to 0 km/h)</span>
                </button>

                <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center">
                  Simulates sudden kinetic impact with 60s loud siren alarm and hospital dispatch.
                </p>
              </div>

              {/* EMERGENCY ASSISTANCE CHAT WITH MULTILINGUAL GEMINI AI */}
              <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                    <MessageSquare className="w-4 h-4 text-red-600" />
                    <span>{t.emergencyChatTitle}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-semibold flex items-center gap-1">
                      <Bot className="w-3 h-3 text-emerald-600" />
                      Gemini Live AI
                    </span>
                    {chatMessages.length > 0 && (
                      <button
                        onClick={() => {
                          setChatMessages([]);
                        }}
                        title="Clear Chat History"
                        className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Chat Message Scroll Window */}
                {chatMessages.length > 0 && (
                  <div className="max-h-64 overflow-y-auto space-y-2.5 pr-1 py-1">
                    {chatMessages.map(msg => (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[90%] p-3 rounded-2xl text-xs ${
                            msg.sender === 'user'
                              ? 'bg-slate-900 text-white rounded-br-xs'
                              : 'bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-slate-900 dark:text-slate-100 rounded-bl-xs'
                          }`}
                        >
                          {msg.sender === 'assistant' && (
                            <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-emerald-200/60 dark:border-emerald-800/40">
                              <span className="font-bold text-[10px] text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                                <Bot className="w-3 h-3" />
                                <span>PulseWay Medical AI</span>
                              </span>
                              {msg.severity && (
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                                  msg.severity === 'CRITICAL' ? 'bg-red-100 text-red-700 font-bold' : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                  {msg.severity}
                                </span>
                              )}
                            </div>
                          )}

                          <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                          <div className="flex items-center justify-between gap-2 mt-2 pt-1 border-t border-slate-200/40 text-[10px] text-slate-400">
                            <span>{msg.timestamp}</span>
                            <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400">
                              {msg.sender === 'assistant' ? 'Verified EMS Triage' : 'User'}
                            </span>
                          </div>

                          {/* Ambulance Dispatch Button for Critical or Ambulance Inquiries */}
                          {msg.sender === 'assistant' && (msg.severity === 'CRITICAL' || msg.isAmbulanceRequest) && (
                            <button
                              onClick={() => startEmergencyTrigger(msg.text)}
                              className="mt-2.5 w-full py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md shadow-red-600/30 flex items-center justify-center gap-1.5 cursor-pointer transition-transform active:scale-98"
                            >
                              <AlertTriangle className="w-4 h-4 text-amber-200" />
                              <span>🚨 Dispatch ALS Ambulance Now</span>
                            </button>
                          )}


                        </div>
                      </div>
                    ))}

                    {isAiThinking && (
                      <div className="flex items-center gap-2 text-xs text-slate-500 italic p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                        <Bot className="w-4 h-4 text-emerald-600 animate-bounce" />
                        <span>Gemini AI is analyzing symptoms in {language === 'kn' ? 'ಕನ್ನಡ' : language === 'hi' ? 'हिंदी' : 'English'}...</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Text Input Controls - No Mic */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onClick={() => setShowEmergencySuggestions(true)}
                    onFocus={() => setShowEmergencySuggestions(true)}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSendChatMessage(inputText); }}
                    placeholder={t.chatPlaceholder}
                    className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500 font-normal placeholder:text-slate-400 cursor-text"
                  />

                  {/* Send Button */}
                  <button
                    type="button"
                    onClick={() => handleSendChatMessage(inputText)}
                    disabled={!inputText.trim() || isAiThinking}
                    className="p-2.5 rounded-xl bg-red-600 disabled:opacity-40 text-white hover:bg-red-700 transition-colors shadow-sm cursor-pointer shrink-0"
                    title="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>

                {/* SUGGESTED EMERGENCY CATEGORIES - APPEARS ONLY WHEN USER CLICKS ON AI CHAT BAR */}
                {showEmergencySuggestions && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 px-0.5">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        💡 {t.suggestedCategories}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowEmergencySuggestions(false)}
                        className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer font-medium"
                      >
                        {t.hideSuggestions}
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {emergencyShortcuts.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleSendChatMessage(item.query)}
                          className="p-2.5 bg-slate-50 dark:bg-slate-800/80 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                              {item.icon}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {item.title}
                              </h4>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                {item.desc}
                              </p>
                            </div>
                          </div>

                          <span className="w-6 h-6 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-sm shrink-0">
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      )}

      {/* ACCIDENT DEMO LAB MODAL */}
      {isAccidentLabOpen && (
        <div 
          onClick={() => setIsAccidentLabOpen(false)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 cursor-pointer"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="w-full max-w-lg cursor-default"
          >
            <AccidentDemoLab onClose={() => setIsAccidentLabOpen(false)} />
          </div>
        </div>
      )}

      {/* GPS & LOCATION CALIBRATION MODAL */}
      {isLocationModalOpen && (
        <div 
          onClick={() => setIsLocationModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 cursor-pointer"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl border border-stone-200 cursor-default space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Navigation className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#1A1D20]">
                    GPS Precision & Location Fix
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    High accuracy satellite telemetry & reverse geocoding
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsLocationModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Real-Time Sensor Telemetry */}
            <div className="p-3.5 rounded-2xl bg-[#0B192C] text-white space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Telemetry Coordinates
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Accuracy: ±{currentLocation.accuracyMeters || 3}m
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-[#0D1B2A] p-2 rounded-xl border border-slate-800">
                  <span className="text-[9px] text-slate-500 block">LATITUDE</span>
                  <span className="text-white font-bold">{currentLocation.lat.toFixed(6)}° N</span>
                </div>
                <div className="bg-[#0D1B2A] p-2 rounded-xl border border-slate-800">
                  <span className="text-[9px] text-slate-500 block">LONGITUDE</span>
                  <span className="text-white font-bold">{currentLocation.lng.toFixed(6)}° E</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-300">
                <span className="text-slate-500 block text-[9px] font-bold uppercase">Locked Coordinate Fix:</span>
                <span className="font-mono font-semibold text-emerald-400">{currentLocation.lat.toFixed(6)}° N, {currentLocation.lng.toFixed(6)}° E</span>
              </div>
            </div>

            {/* Recalibrate Real GPS Button */}
            <button
              onClick={async () => {
                setIsCalibratingGps(true);
                try {
                  await recalibrateHighAccuracyGPS();
                } finally {
                  setIsCalibratingGps(false);
                }
              }}
              disabled={isCalibratingGps}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 border border-slate-200 transition-colors cursor-pointer"
            >
              <Radio className={`w-3.5 h-3.5 text-blue-600 ${isCalibratingGps ? 'animate-spin' : ''}`} />
              <span>{isCalibratingGps ? 'Querying Browser GPS Telemetry & Satellite Lock...' : 'Re-sync Browser GPS (Real Device Fix)'}</span>
            </button>

            {/* Interactive Pin-Drop Map (Requirement 1 & 6) */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Interactive Pin-Drop Map (Click to set exact location)
              </span>
              <RealisticEmergencyMap
                patientCoords={currentLocation}
                hospitalCoords={{ lat: 12.9690, lng: 77.6450 }}
                isDispatched={false}
                heightClass="h-44 sm:h-48"
                allowLocationPick={true}
                onLocationPick={coords => {
                  updateLocation(coords);
                  setManualStreetInput(coords.address || `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`);
                }}
              />
            </div>

            {/* Quick Landmark Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Quick Landmark Pinpoint (Bengaluru Dispatch Hubs)
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  {
                    title: 'Indiranagar 100ft Rd (12th Main)',
                    address: 'Indiranagar 100ft Rd, 12th Main Junction, Bengaluru, Karnataka 560038',
                    landmark: 'Metro Station Pillar 128 (Calibrated)',
                    lat: 12.9716,
                    lng: 77.5946,
                    accuracy: 2
                  },
                  {
                    title: 'MG Road Metro & Brigade Rd',
                    address: 'MG Road Metro Station Area, Brigade Rd Cross, Bengaluru 560001',
                    landmark: 'Metro Concourse Gate 2',
                    lat: 12.9756,
                    lng: 77.6097,
                    accuracy: 3
                  },
                  {
                    title: 'Koramangala 5th Block (80ft Rd)',
                    address: '80 Feet Rd, 5th Block, Koramangala, Bengaluru 560095',
                    landmark: 'Sony World Junction Signal',
                    lat: 12.9352,
                    lng: 77.6245,
                    accuracy: 2
                  },
                  {
                    title: 'Whitefield ITPL Main Rd',
                    address: 'ITPL Main Rd, EPIP Zone, Whitefield, Bengaluru 560066',
                    landmark: 'ITPL Main Entrance Gate',
                    lat: 12.9863,
                    lng: 77.7314,
                    accuracy: 3
                  }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      updateLocation({
                        lat: item.lat,
                        lng: item.lng,
                        address: item.address,
                        landmark: item.landmark,
                        accuracyMeters: item.accuracy
                      });
                      setManualStreetInput(item.address);
                      setManualLandmarkInput(item.landmark);
                      setIsLocationModalOpen(false);
                    }}
                    className="p-2.5 rounded-xl border border-stone-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-semibold text-xs text-slate-800 group-hover:text-emerald-800">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[280px]">
                        {item.landmark} · {item.address}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-600 font-bold shrink-0">
                      Select →
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Street & Landmark Refinement Form */}
            <div className="pt-2 border-t border-stone-100 space-y-2 text-xs">
              <span className="text-[11px] font-bold text-slate-700 block">
                Manual Address Refinement
              </span>
              <div>
                <label className="text-[10px] text-slate-500 font-medium block mb-0.5">Street Address</label>
                <input
                  type="text"
                  value={manualStreetInput}
                  onChange={e => setManualStreetInput(e.target.value)}
                  placeholder="Street name, house/building number, cross"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-medium block mb-0.5">Nearby Landmark / Metro Pillar</label>
                <input
                  type="text"
                  value={manualLandmarkInput}
                  onChange={e => setManualLandmarkInput(e.target.value)}
                  placeholder="e.g. Opposite Metro Pillar 140, Near Coffee Day"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                onClick={() => {
                  if (manualStreetInput.trim()) {
                    updateLocation({
                      address: manualStreetInput.trim(),
                      landmark: manualLandmarkInput.trim() || 'Custom Landmark Refinement',
                      accuracyMeters: 2
                    });
                  }
                  setIsLocationModalOpen(false);
                }}
                className="w-full py-2.5 rounded-full bg-[#0F9D75] hover:bg-[#10B981] text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
              >
                Save Accurate Location Pin
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
