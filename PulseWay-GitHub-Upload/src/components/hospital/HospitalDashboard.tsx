import React, { useState, useEffect } from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { EmergencyIncident, PreArrivalAllocation } from '../../types';
import { 
  Building2, 
  Activity, 
  Ambulance, 
  Bed, 
  Clock, 
  ShieldAlert, 
  Settings, 
  Phone,
  PhoneCall, 
  CheckCircle2, 
  AlertOctagon, 
  AlertTriangle,
  User, 
  Search, 
  Filter, 
  X, 
  ChevronRight, 
  LogOut,
  MapPin,
  Heart,
  Stethoscope,
  Send,
  Radio,
  FileText,
  Plus,
  Minus,
  Sparkles,
  Save,
  Check,
  Globe
} from 'lucide-react';
import { RealisticEmergencyMap } from '../common/RealisticEmergencyMap';
import { translations } from '../../utils/translations';

export const HospitalDashboard: React.FC = () => {
  const {
    activeHospital,
    emergencyQueue,
    selectedPatientForConsole,
    setSelectedPatientForConsole,
    hospitalDispatchAmbulance,
    hospitalMarkUnresponsive,
    hospitalAllocateBedAndDoctor,
    hospitalCompleteTreatment,
    updateHospitalCapacity,
    setIsHospitalLoggedIn,
    setActiveStage,
    language,
    setLanguage
  } = useEmergency();
  const t = translations[language];

  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  // Settings Form State (Edit total number of beds, ambulances, and facilities)
  const [editTotalAmbulances, setEditTotalAmbulances] = useState(activeHospital.totalAmbulances);
  const [editOccupiedAmbulances, setEditOccupiedAmbulances] = useState(activeHospital.occupiedAmbulances);
  const [editIcuTotal, setEditIcuTotal] = useState(activeHospital.icuBedsTotal);
  const [editIcuAvailable, setEditIcuAvailable] = useState(activeHospital.icuBedsAvailable);
  const [editTraumaTotal, setEditTraumaTotal] = useState(activeHospital.traumaBedsTotal);
  const [editTraumaAvailable, setEditTraumaAvailable] = useState(activeHospital.traumaBedsAvailable);
  const [editGeneralTotal, setEditGeneralTotal] = useState(activeHospital.generalBedsTotal || 180);
  const [editGeneralAvailable, setEditGeneralAvailable] = useState(activeHospital.generalBedsAvailable || 34);
  const [editFacilities, setEditFacilities] = useState<string[]>(activeHospital.facilities);
  const [newFacilityName, setNewFacilityName] = useState('');
  const [editPhone, setEditPhone] = useState(activeHospital.phone);
  const [editEmail, setEditEmail] = useState(activeHospital.email);
  const [editAddress, setEditAddress] = useState(activeHospital.address);

  // Keep settings state in sync when activeHospital changes
  useEffect(() => {
    setEditTotalAmbulances(activeHospital.totalAmbulances);
    setEditOccupiedAmbulances(activeHospital.occupiedAmbulances);
    setEditIcuTotal(activeHospital.icuBedsTotal);
    setEditIcuAvailable(activeHospital.icuBedsAvailable);
    setEditTraumaTotal(activeHospital.traumaBedsTotal);
    setEditTraumaAvailable(activeHospital.traumaBedsAvailable);
    setEditGeneralTotal(activeHospital.generalBedsTotal || 180);
    setEditGeneralAvailable(activeHospital.generalBedsAvailable || 34);
    setEditFacilities(activeHospital.facilities);
    setEditPhone(activeHospital.phone);
    setEditEmail(activeHospital.email);
    setEditAddress(activeHospital.address);
  }, [activeHospital]);

  // Filter state for live feed
  const [feedFilter, setFeedFilter] = useState<'ALL' | 'CRITICAL' | 'AWAITING' | 'DISPATCHED' | 'COMPLETED'>('ALL');

  // Active patient call state & telephony timer
  const [activeCallingPatient, setActiveCallingPatient] = useState<{ name: string; phone: string } | null>(null);
  const [callDurationSeconds, setCallDurationSeconds] = useState(0);

  const handleInitiatePatientCall = (name: string, phone: string) => {
    setActiveCallingPatient({ name, phone });
    setCallDurationSeconds(0);
    if (typeof window !== 'undefined') {
      window.open(`tel:${phone}`, '_self');
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeCallingPatient) {
      timer = setInterval(() => {
        setCallDurationSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeCallingPatient]);

  const [treatmentToast, setTreatmentToast] = useState<string | null>(null);

  // Pre-Arrival Bed & Doctor Allocation State (in popup console)
  const [bedNo, setBedNo] = useState('ICU-B04');
  const [floorNo, setFloorNo] = useState('3');
  const [roomNo, setRoomNo] = useState('308-A');
  const [doctorAllotted, setDoctorAllotted] = useState('Dr. Vikram Adiga (Chief Trauma Surgeon)');
  const [department, setDepartment] = useState('Critical Trauma Bay');
  const [isAllocationLocked, setIsAllocationLocked] = useState(false);

  // Date format: dd/mm/yyyy, day
  const getFormattedDateAndDay = () => {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const day = now.toLocaleDateString('en-US', { weekday: 'long' });
    return `${dd}/${mm}/${yyyy}, ${day}`;
  };

  // Metrics Calculations
  const activeAlertsCount = emergencyQueue.length;
  const criticalCount = emergencyQueue.filter(c => c.severity === 'CRITICAL' && c.status !== 'TREATMENT_COMPLETED').length;
  const ambulancesReady = Math.max(0, activeHospital.totalAmbulances - activeHospital.occupiedAmbulances);

  // Filtering
  const filteredCases = emergencyQueue.filter(c => {
    if (feedFilter === 'CRITICAL') return c.severity === 'CRITICAL' && c.status !== 'TREATMENT_COMPLETED';
    if (feedFilter === 'AWAITING') return c.status === 'WAITING_HOSPITAL_ACCEPTANCE' || c.status === 'HOSPITAL_ACCEPTED';
    if (feedFilter === 'DISPATCHED') return c.status === 'AMBULANCE_DISPATCHED';
    if (feedFilter === 'COMPLETED') return c.status === 'TREATMENT_COMPLETED';
    return true;
  });

  // Sorting: Critical first, then by timestamp
  const sortedCases = [...filteredCases].sort((a, b) => {
    if (a.status === 'TREATMENT_COMPLETED' && b.status !== 'TREATMENT_COMPLETED') return 1;
    if (a.status !== 'TREATMENT_COMPLETED' && b.status === 'TREATMENT_COMPLETED') return -1;
    if (a.severity === 'CRITICAL' && b.severity !== 'CRITICAL') return -1;
    if (a.severity !== 'CRITICAL' && b.severity === 'CRITICAL') return 1;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  const handlePatientCardClick = (incident: EmergencyIncident) => {
    setSelectedPatientForConsole(incident);
    if (incident.preArrivalAllocation) {
      setBedNo(incident.preArrivalAllocation.bedNo || 'ICU-B04');
      setFloorNo(incident.preArrivalAllocation.floorNo || '3');
      setRoomNo(incident.preArrivalAllocation.roomNo || '308-A');
      setDoctorAllotted(incident.preArrivalAllocation.doctorAllotted || 'Dr. Vikram Adiga (Chief Trauma Surgeon)');
      setDepartment(incident.preArrivalAllocation.department || 'Critical Trauma Bay');
      setIsAllocationLocked(!!incident.preArrivalAllocation.confirmedByHospital);
    } else {
      setIsAllocationLocked(false);
    }
  };

  const handleLockBedAndDoctor = () => {
    if (!selectedPatientForConsole) return;
    const alloc: PreArrivalAllocation = {
      bedNo,
      floorNo,
      roomNo,
      doctorAllotted,
      department,
      confirmedByHospital: true,
      confirmedAt: new Date().toISOString()
    };
    hospitalAllocateBedAndDoctor(selectedPatientForConsole.id, alloc);
    setSelectedPatientForConsole(prev => prev && prev.id === selectedPatientForConsole.id ? { ...prev, preArrivalAllocation: alloc } : prev);
    setIsAllocationLocked(true);
  };

  const handleQuickCall = () => {
    if (selectedPatientForConsole) {
      handleInitiatePatientCall(
        selectedPatientForConsole.patient.fullName,
        selectedPatientForConsole.patient.phone || '+91 98450 12345'
      );
    }
  };

  const handleLogout = () => {
    setIsHospitalLoggedIn(false);
    setActiveStage('stage-hosp-setup');
  };

  const handleConsoleDispatch = (incidentId: string) => {
    hospitalDispatchAmbulance(incidentId);
    setSelectedPatientForConsole(prev => prev && prev.id === incidentId ? {
      ...prev,
      status: 'AMBULANCE_DISPATCHED',
      ambulance: prev.ambulance || {
        vehicleNo: 'KA-04-ALS-1082',
        driverName: 'Rameshwar Patil (Paramedic)',
        driverPhone: '+91 94480 55123',
        status: 'ON_THE_WAY',
        etaMinutes: 5,
        currentCoords: {
          lat: activeHospital.coordinates.lat + 0.004,
          lng: activeHospital.coordinates.lng + 0.004
        }
      }
    } : prev);
  };

  const handleExecuteTreatmentCompletion = (incident: EmergencyIncident) => {
    hospitalCompleteTreatment(incident.id);
    // Instant optimistic update on selected patient in console for zero-lag response
    setSelectedPatientForConsole(prev => prev && prev.id === incident.id ? { ...prev, status: 'TREATMENT_COMPLETED' } : prev);
    const bedName = incident.preArrivalAllocation?.bedNo || 'Assigned ICU/Trauma Bed';
    setTreatmentToast(`Treatment completed for ${incident.patient.fullName}. Bed ${bedName} is now marked vacant and available!`);
    setTimeout(() => {
      setTreatmentToast(null);
    }, 4000);
  };

  // Facilities Handlers inside Settings
  const handleAddFacilityInSettings = () => {
    const trimmed = newFacilityName.trim();
    if (!trimmed) return;
    if (!editFacilities.includes(trimmed)) {
      setEditFacilities(prev => [...prev, trimmed]);
    }
    setNewFacilityName('');
  };

  const handleRemoveFacilityInSettings = (name: string) => {
    setEditFacilities(prev => prev.filter(f => f !== name));
  };

  const handleSaveHospitalSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateHospitalCapacity(activeHospital.id, {
      totalAmbulances: Number(editTotalAmbulances),
      occupiedAmbulances: Number(editOccupiedAmbulances),
      icuBedsTotal: Number(editIcuTotal),
      icuBedsAvailable: Number(editIcuAvailable),
      traumaBedsTotal: Number(editTraumaTotal),
      traumaBedsAvailable: Number(editTraumaAvailable),
      generalBedsTotal: Number(editGeneralTotal),
      generalBedsAvailable: Number(editGeneralAvailable),
      facilities: editFacilities,
      phone: editPhone,
      email: editEmail,
      address: editAddress
    });

    setSettingsSavedToast(true);
    setTimeout(() => {
      setSettingsSavedToast(false);
    }, 3000);
  };

  return (
    <div className="w-full rounded-3xl bg-white shadow-2xl shadow-slate-900/10 border border-stone-200/90 p-5 sm:p-7 flex flex-col gap-6 text-[#1A1D20]">
      
      {/* Treatment Notification Toast */}
      {treatmentToast && (
        <div className="bg-[#0B192C] text-white p-3.5 rounded-2xl border border-emerald-500/60 shadow-xl flex items-center justify-between text-xs animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
            <span className="font-medium">{treatmentToast}</span>
          </div>
          <button onClick={() => setTreatmentToast(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. TOP HEADER BAR: Clinical Dashboard Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-200">
        
        <div>
          <div className="text-[11px] font-mono font-bold tracking-widest text-slate-500 uppercase">
            {getFormattedDateAndDay()}
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#0B192C] mt-1 flex items-center gap-2.5">
            <span>{t.hospitalCommandCenterTitle}</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping" />
          </h1>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
            <Building2 className="w-3.5 h-3.5 text-[#2563EB]" />
            <span className="font-bold text-slate-800">{activeHospital.name}</span>
            <span className="text-slate-300">·</span>
            <span className="font-mono text-[11px]">{activeHospital.type} Care Network</span>
            <span className="text-slate-300">·</span>
            <span className="font-mono text-[11px] text-emerald-700">ICU: {activeHospital.icuBedsAvailable} Vacant</span>
          </div>
        </div>

        {/* Right Status & Controls */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {/* Live system status indicator: Online */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span>{t.onlineDispatchReady}</span>
          </div>

          {/* Language Selector (Requirement 3 & 4) */}
          <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-full border border-stone-300">
            <Globe className="w-3.5 h-3.5 text-slate-500 ml-1.5 shrink-0" />
            <select
              value={language}
              onChange={e => setLanguage(e.target.value as any)}
              className="text-xs font-bold bg-transparent text-slate-800 pr-2 py-0.5 focus:outline-none cursor-pointer"
            >
              <option value="en">ENG</option>
              <option value="kn">ಕನ್ನಡ</option>
              <option value="hi">हिंदी</option>
            </select>
          </div>

          {/* Settings Trigger (Opens beds, ambulance, and facilities editor!) */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0B192C] hover:bg-[#1A2E44] text-white text-xs font-bold shadow-md shadow-slate-900/15 cursor-pointer transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-[#10B981]" />
            <span>{t.dashboardSettings}</span>
          </button>

          {/* Log out button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-bold text-red-700 cursor-pointer transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.logoutBtn}</span>
          </button>
        </div>

      </header>

      {/* 2. EMERGENCY METRICS SUMMARY (4 Floating Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Metric 1: Active Alerts */}
        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200 relative flex flex-col justify-between group hover:border-[#0B192C]/40 transition-colors">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1.5 font-bold">
              <Activity className="w-3.5 h-3.5 text-red-600" />
              <span>{t.activeAlerts}</span>
            </div>
            <div className="text-3xl font-extrabold font-mono text-[#0B192C] mt-1 tabular-nums">
              {activeAlertsCount}
            </div>
          </div>
          
          <div className="mt-3 pt-2 border-t border-stone-200/80 flex items-center justify-between text-xs">
            <span className="text-[10px] font-semibold text-slate-500">Triage Priority</span>
            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold font-mono text-[10px] tabular-nums">
              {criticalCount} Critical
            </span>
          </div>
        </div>

        {/* Metric 2: Ambulances Ready */}
        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200 flex flex-col justify-between hover:border-[#10B981]/50 transition-colors">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1.5 font-bold">
              <Ambulance className="w-3.5 h-3.5 text-[#10B981]" />
              <span>{t.ambulancesReady}</span>
            </div>
            <div className="text-3xl font-extrabold font-mono text-emerald-700 mt-1 tabular-nums">
              {ambulancesReady}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-stone-200/80 flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Fleet Stationed</span>
            <span className="font-mono text-slate-700">{activeHospital.occupiedAmbulances} Dispatched</span>
          </div>
        </div>

        {/* Metric 3: Beds Available */}
        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200 flex flex-col justify-between hover:border-blue-400/50 transition-colors">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1.5 font-bold">
              <Bed className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>{t.bedsAvailable}</span>
            </div>
            <div className="text-3xl font-extrabold font-mono text-[#0B192C] mt-1 tabular-nums">
              {activeHospital.icuBedsAvailable + activeHospital.traumaBedsAvailable}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-stone-200/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>ICU: <strong className="text-blue-700">{activeHospital.icuBedsAvailable}</strong></span>
            <span>Trauma: <strong className="text-amber-700">{activeHospital.traumaBedsAvailable}</strong></span>
          </div>
        </div>

        {/* Metric 4: Average Hospital Response Time */}
        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200 flex flex-col justify-between hover:border-amber-400/50 transition-colors">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1.5 font-bold">
              <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>{t.avgResponseTime}</span>
            </div>
            <div className="text-3xl font-extrabold font-mono text-amber-600 mt-1 tabular-nums flex items-baseline gap-1">
              <span>{activeHospital.avgResponseTimeMin}</span>
              <span className="text-xs font-sans font-medium text-slate-500">mins</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-stone-200/80 flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Golden Hour Target</span>
            <span className="text-emerald-700 font-mono font-bold">Optimal</span>
          </div>
        </div>

      </div>

      {/* 3. WORKSPACE: EMERGENCY FEED (LEFT) + CAPACITY WIDGET (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LIVE FEED (Spans 2 cols) */}
        <div className="lg:col-span-2 bg-[#FAF8F5] rounded-3xl border border-stone-200 p-4 sm:p-5 flex flex-col gap-4">
          
          {/* Header & Filter Tag Chips */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#0B192C] flex items-center gap-2">
                <span>{t.incomingFeed}</span>
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
              </h2>
              <p className="text-[11px] text-slate-500">
                {t.feedHint}
              </p>
            </div>

            {/* Selectable Filter Tag Chips */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'ALL', label: t.tabAll },
                { id: 'CRITICAL', label: t.tabCritical },
                { id: 'AWAITING', label: t.tabAwaiting },
                { id: 'DISPATCHED', label: t.tabDispatched },
                { id: 'COMPLETED', label: t.tabCompleted }
              ].map(tab => {
                const isSelected = feedFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFeedFilter(tab.id as any)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                      isSelected
                        ? 'bg-[#0B192C] text-white border border-[#0B192C] shadow-sm'
                        : 'bg-white text-slate-700 border border-stone-300 hover:border-stone-400'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3 h-3 text-[#10B981] shrink-0" />}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* List of Incoming Patient Cases */}
          <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1">
            {sortedCases.length === 0 ? (
              <div className="p-10 text-center bg-white rounded-2xl border border-dashed border-stone-300 text-xs text-slate-500 space-y-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <Activity className="w-5 h-5 animate-pulse" />
                </div>
                <div className="font-serif font-bold text-slate-800 text-base">{t.noDemoIncidents}</div>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto leading-relaxed">
                  {t.noDemoIncidentsDesc}
                </p>
              </div>
            ) : (
              sortedCases.map((incident) => {
                const isCritical = incident.severity === 'CRITICAL';
                const isWaiting = incident.status === 'WAITING_HOSPITAL_ACCEPTANCE' || incident.status === 'HOSPITAL_ACCEPTED';
                const isDispatched = incident.status === 'AMBULANCE_DISPATCHED';
                const isCompleted = incident.status === 'TREATMENT_COMPLETED';

                return (
                  <div
                    key={incident.id}
                    onClick={() => handlePatientCardClick(incident)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${
                      isCompleted
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : 'border-stone-200 bg-white hover:border-[#10B981] hover:shadow-md'
                    }`}
                  >
                    {/* Top line: Patient name, severity/problem, location, time allotted */}
                    <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-serif font-bold text-base text-[#0B192C] group-hover:text-emerald-700 transition-colors">
                            {incident.patient.fullName}
                          </span>
                          
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            isCritical
                              ? 'bg-red-100 text-red-700 border border-red-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}>
                            {incident.severity}
                          </span>

                          {isWaiting && (
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 animate-pulse flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              <span>Awaiting Dispatch</span>
                            </span>
                          )}

                          {isDispatched && (
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1">
                              <Ambulance className="w-2.5 h-2.5" />
                              <span>Ambulance Dispatched</span>
                            </span>
                          )}

                          {isCompleted && (
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                              <CheckCircle2 className="w-2.5 h-2.5 text-[#10B981]" />
                              <span>Treatment Completed · Bed Freed</span>
                            </span>
                          )}
                        </div>

                        <div className="text-xs font-medium text-slate-700 line-clamp-1 mt-1">
                          Cause: <span className="font-semibold text-[#1A1D20]">{incident.patient.cause}</span>
                        </div>

                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-1 flex-wrap">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-red-500" />
                            <span className="font-mono text-slate-800 font-bold">
                              {incident.coordinates.lat.toFixed(5)}° N, {incident.coordinates.lng.toFixed(5)}° E
                            </span>
                          </span>
                          <span>·</span>
                          <span className="font-mono text-slate-400">
                            Logged: {new Date(incident.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {incident.preArrivalAllocation?.bedNo && (
                            <>
                              <span>·</span>
                              <span className="font-mono text-blue-700 font-semibold">
                                Bed: {incident.preArrivalAllocation.bedNo}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Right Actions: Call Patient, Treatment Completed & Open Console */}
                      <div className="shrink-0 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInitiatePatientCall(
                              incident.patient.fullName, 
                              incident.patient.phone || '+91 98450 12345'
                            );
                          }}
                          className="px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-600 hover:text-white border border-emerald-300 text-emerald-800 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                          title="Call Patient Directly"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{t.callPatient}</span>
                        </button>

                        {!isCompleted ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExecuteTreatmentCompletion(incident);
                            }}
                            className="px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-[#10B981] hover:text-white border border-emerald-300 text-emerald-800 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                            title="Mark treatment completed and automatically free the allotted bed"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Treatment Completed</span>
                          </button>
                        ) : (
                          <span className="text-[11px] font-mono text-emerald-700 font-bold px-2 py-1 bg-emerald-100/60 rounded-full">
                            Discharged
                          </span>
                        )}

                        <span className="px-3 py-1.5 rounded-full bg-slate-100 group-hover:bg-[#0B192C] group-hover:text-white text-slate-700 text-xs font-bold transition-all flex items-center gap-1 shadow-xs">
                          <span>Console</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>

                    {/* Below: Age, Sex, Blood Group, Allergy */}
                    <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center gap-4 text-[11px] font-mono text-slate-600">
                      <span>Age: <strong className="text-slate-900">{incident.patient.age}y</strong></span>
                      <span>Sex: <strong className="text-slate-900">{incident.patient.sex}</strong></span>
                      <span>Blood: <strong className="text-red-600 font-bold">{incident.patient.bloodGroup}</strong></span>
                      {incident.patient.allergies && incident.patient.allergies.length > 0 && (
                        <span className="text-amber-700 truncate max-w-[180px]">
                          Allergy: {incident.patient.allergies[0]}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: CAPACITY WIDGET */}
        <div className="space-y-4">
          
          <div className="bg-[#FAF8F5] rounded-3xl border border-stone-200 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h2 className="font-serif text-base font-bold text-[#0B192C] flex items-center gap-2">
                <span>Current Hospital Capacity</span>
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              </h2>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="text-[10px] font-mono text-blue-600 hover:underline font-bold"
              >
                Edit in Settings
              </button>
            </div>

            {/* Metrics Breakdown */}
            <div className="space-y-3.5 text-xs">
              
              {/* Trauma Beds */}
              <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-700">Trauma Beds Vacant</span>
                  <span className="font-mono font-bold text-amber-700">
                    {activeHospital.traumaBedsAvailable} / {activeHospital.traumaBedsTotal}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#F59E0B] h-full rounded-full transition-all"
                    style={{ width: `${(activeHospital.traumaBedsAvailable / activeHospital.traumaBedsTotal) * 100}%` }}
                  />
                </div>
              </div>

              {/* ICU Beds */}
              <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-700">ICU Beds Vacant</span>
                  <span className="font-mono font-bold text-blue-700">
                    {activeHospital.icuBedsAvailable} / {activeHospital.icuBedsTotal}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#2563EB] h-full rounded-full transition-all"
                    style={{ width: `${(activeHospital.icuBedsAvailable / activeHospital.icuBedsTotal) * 100}%` }}
                  />
                </div>
              </div>

              {/* Ambulances */}
              <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-700">Ambulance Fleet Status</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {activeHospital.totalAmbulances - activeHospital.occupiedAmbulances} Ready · {activeHospital.occupiedAmbulances} Dispatched
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#10B981] h-full rounded-full transition-all"
                    style={{ width: `${((activeHospital.totalAmbulances - activeHospital.occupiedAmbulances) / activeHospital.totalAmbulances) * 100}%` }}
                  />
                </div>
              </div>

            </div>

            {/* Protocol Notice */}
            <div className="p-3 rounded-2xl bg-white border border-stone-200 flex items-start gap-2.5 text-[11px] text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
              <span>Whenever a patient's treatment is completed, the reserved bed and ambulance return automatically to this pool.</span>
            </div>
          </div>

        </div>

      </div>

      {/* 4. EMERGENCY DISPATCH & CLINICAL CONSOLE (MODAL POPUP) */}
      {selectedPatientForConsole && (
        <div 
          onClick={() => setSelectedPatientForConsole(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150 cursor-pointer"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="w-full max-w-2xl bg-white text-[#1A1D20] rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh] cursor-default animate-in zoom-in-95 duration-150"
          >
            
            {/* Modal Header: Deep Midnight Navy */}
            <div className="bg-[#0B192C] text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center text-white">
                  <Activity className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-[#10B981] block">
                    PulseWay Clinical Dispatch
                  </span>
                  <h3 className="font-serif text-lg font-bold text-white leading-tight">
                    Emergency Dispatch & Clinical Console
                  </h3>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedPatientForConsole(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
                aria-label="Close Console"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto max-h-[80vh]">
              
              {/* 1. PATIENT NAME, CRITICAL / NOT CRITICAL, JUST EMERGENCY NAME / GROUP, CALL PATIENT */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-base border border-red-200">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block">
                        Patient Name
                      </span>
                      <h4 className="font-serif text-lg font-bold text-[#0B192C]">
                        {selectedPatientForConsole.patient.fullName}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Critical / Not Critical Badge */}
                    {selectedPatientForConsole.severity === 'CRITICAL' ? (
                      <div className="px-3 py-1 rounded-xl bg-red-600 text-white font-mono font-black text-xs shadow-sm flex items-center gap-1.5 border border-red-700 animate-pulse">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
                        <span>CRITICAL</span>
                      </div>
                    ) : (
                      <div className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-mono font-bold text-xs border border-emerald-300">
                        NOT CRITICAL
                      </div>
                    )}

                    {/* Call Patient Button */}
                    <button
                      type="button"
                      onClick={() => handleInitiatePatientCall(
                        selectedPatientForConsole.patient.fullName,
                        selectedPatientForConsole.patient.phone || '+91 98450 12345'
                      )}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95 shrink-0"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{t.callPatient}</span>
                    </button>
                  </div>
                </div>

                {/* Just the Emergency Name / Group */}
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-stone-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0">Emergency Group:</span>
                  <span className="text-xs font-bold text-red-700 truncate">
                    {selectedPatientForConsole.patient.cause || 'Emergency Trauma Assistance'}
                  </span>
                </div>
              </div>

              {/* 2. LIVE AMBULANCE TRACKING & PATIENT'S GPS / LOCATION */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0B192C] text-white space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Ambulance className="w-3.5 h-3.5" />
                    <span>Live Ambulance Tracking & Location</span>
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                    Stationed Fleet: {ambulancesReady} Ready
                  </span>
                </div>

                {selectedPatientForConsole.status === 'AMBULANCE_DISPATCHED' ? (
                  <div className="space-y-2.5">
                    <div className="p-2.5 rounded-xl bg-emerald-950/90 border border-emerald-500/60 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                        <div>
                          <strong className="block text-emerald-300 font-bold text-xs">
                            Ambulance dispatched to the location of patient
                          </strong>
                          <span className="text-slate-300 text-[11px]">
                            Unit [{selectedPatientForConsole.ambulance?.vehicleNo || 'KA-04-ALS-1082'}] · Paramedic: {selectedPatientForConsole.ambulance?.driverName || 'Rameshwar Patil'}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono text-emerald-400 font-bold text-xs shrink-0">
                        ETA ~{selectedPatientForConsole.ambulance?.etaMinutes || 5}M
                      </span>
                    </div>

                    {/* Live Realistic Map tracking ambulance from hospital to patient in console */}
                    <div className="overflow-hidden rounded-xl border border-slate-700 shadow-sm">
                      <RealisticEmergencyMap
                        patientCoords={selectedPatientForConsole.coordinates}
                        hospitalCoords={activeHospital.coordinates}
                        ambulanceCoords={selectedPatientForConsole.ambulance?.currentCoords || {
                          lat: (selectedPatientForConsole.coordinates.lat + activeHospital.coordinates.lat) / 2,
                          lng: (selectedPatientForConsole.coordinates.lng + activeHospital.coordinates.lng) / 2
                        }}
                        patientName={selectedPatientForConsole.patient.fullName}
                        emergencyNature={selectedPatientForConsole.patient.cause}
                        etaMinutes={selectedPatientForConsole.ambulance?.etaMinutes || 5}
                        vehicleNo={selectedPatientForConsole.ambulance?.vehicleNo || 'KA-04-ALS-1082'}
                        driverName={selectedPatientForConsole.ambulance?.driverName || 'Rameshwar Patil (Paramedic)'}
                        driverPhone={selectedPatientForConsole.ambulance?.driverPhone || '+91 94480 55123'}
                        height="200px"
                      />
                    </div>
                  </div>
                ) : selectedPatientForConsole.status === 'TREATMENT_COMPLETED' ? (
                  <div className="p-3 rounded-xl bg-emerald-900/60 border border-emerald-500 text-xs text-emerald-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                    <span className="font-bold text-xs">Treatment Completed · Case Closed · Bed Released</span>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                        <div>
                          <strong className="block text-amber-200 font-bold text-xs">
                            Awaiting for ambulance
                          </strong>
                          <span className="text-[11px] text-amber-300/80">
                            Patient is waiting for ambulance dispatch at live device location.
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleConsoleDispatch(selectedPatientForConsole.id)}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#10B981] hover:bg-[#0F9D75] text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Ambulance className="w-4 h-4" />
                      <span>{t.dispatchAmbulanceBtn}</span>
                    </button>
                  </div>
                )}

                {/* Patient's GPS / Location */}
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400 block font-bold">
                        Patient's GPS / Location
                      </span>
                      <span className="text-xs text-slate-200 font-medium truncate block">
                        {selectedPatientForConsole.coordinates.address || selectedPatientForConsole.patient.address || 'Live GPS Telemetry Fix'}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-emerald-400 font-bold shrink-0 ml-2">
                    {selectedPatientForConsole.coordinates.lat.toFixed(5)}° N, {selectedPatientForConsole.coordinates.lng.toFixed(5)}° E
                  </span>
                </div>
              </div>

              {/* 3. PRE-ARRIVAL BED & DOCTOR ALLOCATION */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-stone-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bed className="w-4 h-4 text-blue-600" />
                    <span className="font-serif text-xs font-bold text-slate-900 uppercase tracking-wide">
                      Pre-Arrival Bed & Doctor Allocation
                    </span>
                  </div>
                  {isAllocationLocked ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Locked & Reserved
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                      Pending Confirmation
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Target Ward</label>
                    <select
                      value={department}
                      onChange={e => { setDepartment(e.target.value); setIsAllocationLocked(false); }}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Critical Trauma Bay">Critical Trauma Bay</option>
                      <option value="ICU Emergency">ICU Emergency</option>
                      <option value="Cardiac Care Unit (CCU)">Cardiac Care Unit (CCU)</option>
                      <option value="Burn & Resuscitation Unit">Burn & Resuscitation</option>
                      <option value="General Emergency Ward">General Emergency Ward</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Bed No</label>
                    <input
                      type="text"
                      value={bedNo}
                      onChange={e => { setBedNo(e.target.value); setIsAllocationLocked(false); }}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono font-bold focus:ring-1 focus:ring-blue-500"
                      placeholder="ICU-B04"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Floor / Room</label>
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={floorNo}
                        onChange={e => { setFloorNo(e.target.value); setIsAllocationLocked(false); }}
                        className="w-1/2 px-1.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono text-center"
                        placeholder="Fl 3"
                      />
                      <input
                        type="text"
                        value={roomNo}
                        onChange={e => { setRoomNo(e.target.value); setIsAllocationLocked(false); }}
                        className="w-1/2 px-1.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono text-center"
                        placeholder="308-A"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Assigned Doctor</label>
                    <input
                      type="text"
                      value={doctorAllotted}
                      onChange={e => { setDoctorAllotted(e.target.value); setIsAllocationLocked(false); }}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:ring-1 focus:ring-blue-500"
                      placeholder="Dr. Vikram Adiga"
                    />
                  </div>
                </div>

                {!isAllocationLocked && (
                  <button
                    type="button"
                    onClick={handleLockBedAndDoctor}
                    className="w-full py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm Bed & Doctor Allocation</span>
                  </button>
                )}
              </div>

              {/* 4. DETAILS OF THE USER: Name, Ph Number, Blood Group, Age, Gender, Target Ward */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-2">
                <span className="font-serif text-xs font-bold text-slate-800 uppercase tracking-wide block">
                  Patient Profile & Clinical Details
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-white border border-stone-200/80">
                    <span className="text-[10px] text-slate-400 block font-medium">Name</span>
                    <span className="font-bold text-slate-900 truncate block">
                      {selectedPatientForConsole.patient.fullName}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-white border border-stone-200/80">
                    <span className="text-[10px] text-slate-400 block font-medium">Phone Number</span>
                    <span className="font-mono font-bold text-slate-900 truncate block">
                      {selectedPatientForConsole.patient.phone || '+91 98450 12345'}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-white border border-stone-200/80">
                    <span className="text-[10px] text-slate-400 block font-medium">Blood Group</span>
                    <span className="font-mono font-black text-red-600 text-sm">
                      {selectedPatientForConsole.patient.bloodGroup || 'O+'}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-white border border-stone-200/80">
                    <span className="text-[10px] text-slate-400 block font-medium">Age</span>
                    <span className="font-mono font-bold text-slate-900">
                      {selectedPatientForConsole.patient.age || 32} yrs
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-white border border-stone-200/80">
                    <span className="text-[10px] text-slate-400 block font-medium">Gender</span>
                    <span className="font-bold text-slate-900">
                      {selectedPatientForConsole.patient.sex || 'Male'}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-white border border-stone-200/80">
                    <span className="text-[10px] text-slate-400 block font-medium">Target Ward</span>
                    <span className="font-bold text-blue-700 truncate block">
                      {department || 'Critical Trauma Bay'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 5. PATIENT DISCHARGE & BED RELEASE */}
              <div className="pt-1">
                {selectedPatientForConsole.status === 'TREATMENT_COMPLETED' ? (
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-center text-xs text-emerald-800 font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Patient Discharged · Bed Successfully Released to Hospital Inventory</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleExecuteTreatmentCompletion(selectedPatientForConsole)}
                    className="w-full py-3 px-4 rounded-xl bg-[#0B192C] hover:bg-[#1A2E44] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                    <span>Patient Discharge & Bed Release</span>
                  </button>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#FAF8F5] border-t border-stone-200 flex items-center justify-between shrink-0 text-xs">
              <span className="text-[11px] text-slate-500">
                PulseWay Dispatch Protocol · Case verified
              </span>
              <button
                type="button"
                onClick={() => setSelectedPatientForConsole(null)}
                className="py-2 px-5 rounded-full bg-white hover:bg-slate-100 border border-stone-300 font-semibold text-slate-700 cursor-pointer"
              >
                Close Console
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 5. SETTINGS MODAL: Full Hospital Beds, Fleet & Facilities Management (Available ONLY here as requested) */}
      {isSettingsOpen && (
        <div 
          onClick={() => setIsSettingsOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto cursor-pointer animate-in fade-in duration-150"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 max-w-2xl w-full space-y-5 shadow-2xl text-[#1A1D20] cursor-default max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-150"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-[#2563EB] block">
                  Hospital Dashboard Settings Only
                </span>
                <h3 className="font-serif text-xl font-bold text-[#0B192C]">
                  Configure Beds, Ambulance Fleet & Facilities
                </h3>
              </div>
              <button 
                onClick={() => setIsSettingsOpen(false)} 
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {settingsSavedToast && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>Hospital capacity, beds, ambulances, and facilities saved successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveHospitalSettings} className="space-y-5 text-xs">
              
              {/* SECTION A: BED CAPACITY COUNTERS */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-3">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-600 tracking-wider flex items-center gap-1.5">
                  <Bed className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Bed Capacity (Total & Available Vacant)</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  {/* ICU Beds */}
                  <div className="p-3 bg-white rounded-xl border border-stone-300 space-y-2">
                    <span className="font-bold text-slate-800 block">ICU Beds</span>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Total:</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditIcuTotal(Math.max(1, editIcuTotal - 1))}
                          className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold"
                        >
                          -
                        </button>
                        <span className="font-mono font-bold w-6 text-center">{editIcuTotal}</span>
                        <button
                          type="button"
                          onClick={() => setEditIcuTotal(editIcuTotal + 1)}
                          className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-stone-100">
                      <span className="text-emerald-700 font-semibold">Vacant:</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditIcuAvailable(Math.max(0, editIcuAvailable - 1))}
                          className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold"
                        >
                          -
                        </button>
                        <span className="font-mono font-bold text-blue-700 w-6 text-center">{editIcuAvailable}</span>
                        <button
                          type="button"
                          onClick={() => setEditIcuAvailable(Math.min(editIcuTotal, editIcuAvailable + 1))}
                          className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Trauma Bays */}
                  <div className="p-3 bg-white rounded-xl border border-stone-300 space-y-2">
                    <span className="font-bold text-slate-800 block">Trauma Bays</span>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Total:</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditTraumaTotal(Math.max(1, editTraumaTotal - 1))}
                          className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold"
                        >
                          -
                        </button>
                        <span className="font-mono font-bold w-6 text-center">{editTraumaTotal}</span>
                        <button
                          type="button"
                          onClick={() => setEditTraumaTotal(editTraumaTotal + 1)}
                          className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-stone-100">
                      <span className="text-amber-700 font-semibold">Vacant:</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditTraumaAvailable(Math.max(0, editTraumaAvailable - 1))}
                          className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold"
                        >
                          -
                        </button>
                        <span className="font-mono font-bold text-amber-700 w-6 text-center">{editTraumaAvailable}</span>
                        <button
                          type="button"
                          onClick={() => setEditTraumaAvailable(Math.min(editTraumaTotal, editTraumaAvailable + 1))}
                          className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* General Beds */}
                  <div className="p-3 bg-white rounded-xl border border-stone-300 space-y-2">
                    <span className="font-bold text-slate-800 block">General Ward Beds</span>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Total:</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditGeneralTotal(Math.max(1, editGeneralTotal - 1))}
                          className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold"
                        >
                          -
                        </button>
                        <span className="font-mono font-bold w-6 text-center">{editGeneralTotal}</span>
                        <button
                          type="button"
                          onClick={() => setEditGeneralTotal(editGeneralTotal + 1)}
                          className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-stone-100">
                      <span className="text-emerald-700 font-semibold">Vacant:</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditGeneralAvailable(Math.max(0, editGeneralAvailable - 1))}
                          className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold"
                        >
                          -
                        </button>
                        <span className="font-mono font-bold text-slate-800 w-6 text-center">{editGeneralAvailable}</span>
                        <button
                          type="button"
                          onClick={() => setEditGeneralAvailable(Math.min(editGeneralTotal, editGeneralAvailable + 1))}
                          className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* SECTION B: AMBULANCE FLEET EDIT */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-3">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-600 tracking-wider flex items-center gap-1.5">
                  <Ambulance className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Ambulance Fleet Configuration</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-xl border border-stone-300 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 block">Total Ambulances</span>
                      <span className="text-[10px] text-slate-500">Assigned fleet count</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditTotalAmbulances(Math.max(1, editTotalAmbulances - 1))}
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-mono font-bold text-sm w-7 text-center">{editTotalAmbulances}</span>
                      <button
                        type="button"
                        onClick={() => setEditTotalAmbulances(editTotalAmbulances + 1)}
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-stone-300 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 block">Occupied / Dispatched</span>
                      <span className="text-[10px] text-slate-500">Currently active on road</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditOccupiedAmbulances(Math.max(0, editOccupiedAmbulances - 1))}
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-mono font-bold text-sm text-amber-700 w-7 text-center">{editOccupiedAmbulances}</span>
                      <button
                        type="button"
                        onClick={() => setEditOccupiedAmbulances(Math.min(editTotalAmbulances, editOccupiedAmbulances + 1))}
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION C: FACILITIES MANAGEMENT (ADD/REMOVE CUSTOM FACILITIES) */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-600 tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Specialized Facilities & Departments</span>
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Click to toggle, or type below to add
                  </span>
                </div>

                {/* Active facility chips with toggle and remove */}
                <div className="flex flex-wrap gap-1.5">
                  {editFacilities.map(f => (
                    <div
                      key={f}
                      className="rounded-full bg-[#0B192C] text-white border border-[#0B192C] text-xs font-semibold flex items-center overflow-hidden shadow-xs"
                    >
                      <span className="px-3 py-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
                        <span>{f}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFacilityInSettings(f)}
                        className="pr-2 pl-0.5 py-1 text-slate-400 hover:text-red-400 cursor-pointer"
                        title="Remove facility"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new facility input */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newFacilityName}
                    onChange={e => setNewFacilityName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFacilityInSettings();
                      }
                    }}
                    placeholder="+ Add Specialized Facility (e.g. Burn Care ICU, MRI 3T, Dialysis Center)"
                    className="flex-1 px-3 py-2 rounded-xl bg-white border border-stone-300 text-[#1A1D20] text-xs focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                  />
                  <button
                    type="button"
                    onClick={handleAddFacilityInSettings}
                    className="px-4 py-2 rounded-xl bg-[#0B192C] hover:bg-[#1A2E44] text-white font-bold text-xs cursor-pointer transition-colors shadow-xs"
                  >
                    + Add Facility
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="py-2.5 px-4 rounded-full bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSettingsOpen(false)}
                    className="py-2.5 px-4 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="py-2.5 px-6 rounded-full bg-[#10B981] hover:bg-[#0F9D75] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/25 transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Hospital Configuration</span>
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 6. DIRECT PATIENT CALLING MODAL (Requirement 6) */}
      {activeCallingPatient && (
        <div 
          onClick={() => setActiveCallingPatient(null)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer animate-in fade-in"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="w-full max-w-sm bg-slate-900 text-white rounded-3xl p-6 border border-slate-700 shadow-2xl text-center space-y-4 cursor-default animate-in zoom-in-95"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg animate-pulse">
              <Phone className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                {t.simulateCallModalTitle}
              </div>
              <h3 className="font-serif text-lg font-bold text-white">
                {activeCallingPatient.name}
              </h3>
              <p className="font-mono text-sm text-slate-300">
                {activeCallingPatient.phone}
              </p>
              <div className="text-xs font-mono text-emerald-400 pt-1">
                Connected · 00:{callDurationSeconds < 10 ? `0${callDurationSeconds}` : callDurationSeconds}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <a
                href={`tel:${activeCallingPatient.phone}`}
                className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md"
              >
                <Phone className="w-4 h-4" />
                <span>Dial Tel</span>
              </a>

              <button
                type="button"
                onClick={() => setActiveCallingPatient(null)}
                className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 rotate-[135deg]" />
                <span>{t.endCall}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
