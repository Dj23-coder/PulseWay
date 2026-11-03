import React, { useState } from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { 
  Building2, 
  Phone, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  MapPin, 
  Activity, 
  Bed, 
  ArrowRight, 
  CheckCircle2,
  Plus,
  Minus,
  ShieldCheck,
  Award,
  Radio,
  FileCheck2,
  Sparkles,
  Ambulance,
  Stethoscope,
  ChevronRight,
  Globe
} from 'lucide-react';
import { translations } from '../../utils/translations';
import { loginHospitalAccount, registerHospitalAccount } from '../../utils/supabase';

const STANDARD_FACILITIES = [
  'ICU (Intensive Care)',
  'Trauma Centre',
  'Cardiac Cath Lab',
  'Neuro Emergency',
  'Burn ICU',
  'Pediatric ER',
  'Orthopedics Bay',
  'Stroke Resuscitation'
];

export const HospitalLoginSetup: React.FC = () => {
  const { 
    activeHospital, 
    updateHospitalCapacity, 
    setIsHospitalLoggedIn, 
    setActiveStage,
    hospitals,
    setActiveHospitalId,
    language,
    setLanguage
  } = useEmergency();
  const t = translations[language];

  // Mode: Full Authentication & Details Form
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Form State: Detailed Credentials & In-Charge Details
  const [hospitalCode, setHospitalCode] = useState('HOSP-BLR-8841');
  const [name, setName] = useState(activeHospital.name);
  const [officerName, setOfficerName] = useState('Dr. Vikram Adiga, MS');
  const [officerDesignation, setOfficerDesignation] = useState('Chief Emergency Medical Officer');
  const [officerId, setOfficerId] = useState('REG-77490-KMC');
  const [phone, setPhone] = useState(activeHospital.phone);
  const [email, setEmail] = useState(activeHospital.email);
  const [password, setPassword] = useState('Hospital@123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [address, setAddress] = useState(activeHospital.address);

  // Step 2 State: Infrastructure & Capacity
  const [hospitalType, setHospitalType] = useState<'Private' | 'Government'>(activeHospital.type);
  const [availableFacilitiesList, setAvailableFacilitiesList] = useState<string[]>(() => {
    const combined = [...STANDARD_FACILITIES, ...activeHospital.facilities];
    return Array.from(new Set(combined));
  });
  const [facilities, setFacilities] = useState<string[]>(activeHospital.facilities);
  const [customFacility, setCustomFacility] = useState('');
  const [ambulances, setAmbulances] = useState<number>(activeHospital.totalAmbulances || 14);
  const [icuBeds, setIcuBeds] = useState<number>(activeHospital.icuBedsAvailable || 9);
  const [traumaBeds, setTraumaBeds] = useState<number>(activeHospital.traumaBedsAvailable || 6);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleFacility = (facility: string) => {
    setFacilities(prev => 
      prev.includes(facility) 
        ? prev.filter(f => f !== facility)
        : [...prev, facility]
    );
  };

  const handleAddCustomFacility = () => {
    const trimmed = customFacility.trim();
    if (!trimmed) return;
    if (!availableFacilitiesList.includes(trimmed)) {
      setAvailableFacilitiesList(prev => [...prev, trimmed]);
    }
    if (!facilities.includes(trimmed)) {
      setFacilities(prev => [...prev, trimmed]);
    }
    setCustomFacility('');
  };

  // Preset Selector
  const loadHospitalPreset = (hospId: string) => {
    const found = hospitals.find(h => h.id === hospId);
    if (!found) return;
    setActiveHospitalId(found.id);
    setName(found.name);
    setPhone(found.phone);
    setEmail(found.email);
    setAddress(found.address);
    setHospitalType(found.type);
    setFacilities(found.facilities);
    setAmbulances(found.totalAmbulances);
    setIcuBeds(found.icuBedsAvailable);
    setTraumaBeds(found.traumaBedsAvailable || 6);
  };

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Official Hospital Name is required';
    if (!officerName.trim()) newErrors.officerName = 'Duty Officer Name is required';
    if (!phone.trim()) newErrors.phone = 'Emergency Hotline is required';
    if (!email.trim() || !email.includes('@')) newErrors.email = 'Valid Institutional Email is required';
    if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!address.trim()) newErrors.address = 'Hospital Address is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setCurrentStep(2);
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (facilities.length === 0) {
      setErrors({ facilities: 'Select at least one emergency facility' });
      return;
    }

    try {
      await registerHospitalAccount({
        id: activeHospital.id,
        hospitalCode,
        name,
        email,
        password,
        phone,
        officerName,
        address,
        type: hospitalType,
        facilities,
        totalAmbulances: ambulances,
        icuBedsAvailable: icuBeds,
        traumaBedsAvailable: traumaBeds
      });
    } catch (e) {
      console.warn('Supabase hospital save fallback:', e);
    }

    updateHospitalCapacity(activeHospital.id, {
      name,
      phone,
      email,
      address,
      type: hospitalType,
      facilities,
      totalAmbulances: ambulances,
      icuBedsAvailable: icuBeds,
      traumaBedsAvailable: traumaBeds
    });

    setIsHospitalLoggedIn(true);
    setActiveStage('stage-hosp-dash');
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-2 rounded-3xl bg-white shadow-2xl shadow-slate-900/10 border border-stone-200/90 overflow-hidden flex flex-col lg:flex-row">
      
      {/* LEFT COLUMN: Deep Authoritative Midnight Navy Sidebar */}
      <aside className="lg:w-5/12 bg-[#0B192C] text-white p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
        
        {/* Subtle Ambient Background Gradient Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#2563EB]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#10B981]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          
          {/* Brand & Badge Header */}
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shadow-md shadow-blue-500/30">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-sans uppercase font-bold tracking-widest text-[#10B981] block">
                  PulseWay EMS Network
                </span>
                <span className="font-serif text-xl font-bold tracking-tight text-white block">
                  Hospital Command Portal
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Secure institutional gateway for accredited hospital emergency triage, ALS fleet coordination, and pre-arrival trauma bed allocation.
            </p>
          </div>

          {/* Stepper Navigation: Small uppercase letter-spaced geometric sans */}
          <div className="space-y-3 pt-2">
            <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-slate-400 block">
              Authentication Checklist
            </span>
            
            <div className="space-y-2 text-xs">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-left ${
                  currentStep === 1
                    ? 'bg-[#0D1B2A] border-[#10B981] text-white shadow-sm'
                    : 'bg-[#0B192C] border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[11px] font-bold ${
                    currentStep === 1 ? 'bg-[#10B981] text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    1
                  </span>
                  <div>
                    <span className="font-bold block text-xs">Duty Officer & Institution</span>
                    <span className="text-[10px] text-slate-400">Credentials, registry code & hotline</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-left ${
                  currentStep === 2
                    ? 'bg-[#0D1B2A] border-[#10B981] text-white shadow-sm'
                    : 'bg-[#0B192C] border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[11px] font-bold ${
                    currentStep === 2 ? 'bg-[#10B981] text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    2
                  </span>
                  <div>
                    <span className="font-bold block text-xs">Facilities & Fleet Capacity</span>
                    <span className="text-[10px] text-slate-400">ICU, Trauma, and ALS fleet counts</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>

          {/* Quick Preset Selector for Easy Testing */}
          <div className="p-3.5 rounded-2xl bg-[#0D1B2A] border border-slate-800 space-y-2">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-amber-400 block">
              ⚡ Demo Hospital Presets
            </span>
            <div className="space-y-1.5 text-xs">
              {hospitals.map(h => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => loadHospitalPreset(h.id)}
                  className={`w-full p-2 rounded-xl text-left font-semibold transition-all flex items-center justify-between text-xs cursor-pointer ${
                    activeHospital.id === h.id
                      ? 'bg-white/10 text-white border border-[#10B981]/50'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="truncate pr-2">{h.name}</span>
                  <span className="text-[10px] font-mono text-emerald-400 shrink-0">
                    {h.type}
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Protocol Compliance Pill */}
        <div className="relative z-10 pt-6 mt-6 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center gap-2 text-[11px] text-slate-300">
            <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />
            <span>Digital Audit Compliance under BNS & IT Act</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
            <span>Encrypted Telemetry Channel: Ready</span>
          </div>
        </div>

      </aside>

      {/* RIGHT COLUMN: Spacious Clean Light-Themed Form Panel */}
      <main className="lg:w-7/12 p-6 sm:p-9 bg-white text-[#1A1D20] flex flex-col justify-between">
        
        <div>
          
          {/* Header Title & Subtitle */}
          <div className="pb-4 mb-6 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#2563EB] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100 inline-block mb-1">
                Clinical Operator Verification
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1D20] tracking-tight">
                {currentStep === 1 ? t.hospitalLoginTitle : t.infrastructureStep}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentStep === 1
                  ? t.hospitalLoginSubtitle
                  : 'Confirm real-time ICU, trauma beds, and ambulance fleet availability for automated assignment.'}
              </p>
            </div>

            {/* Stepper Indicator & Language Selector (Requirement 4) */}
            <div className="shrink-0 flex items-center gap-2 self-start sm:self-auto">
              <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-xl border border-stone-300">
                <Globe className="w-3.5 h-3.5 text-slate-500 ml-1 shrink-0" />
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value as any)}
                  className="text-xs font-bold bg-transparent text-slate-800 pr-1 py-0.5 focus:outline-none cursor-pointer"
                >
                  <option value="en">English</option>
                  <option value="kn">ಕನ್ನಡ (Kannada)</option>
                  <option value="hi">हिंदी (Hindi)</option>
                </select>
              </div>

              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-[#0B192C] text-white">
                Step {currentStep} of 2
              </span>
            </div>
          </div>

          {/* STEP 1: CREDENTIALS & IN-CHARGE FORM */}
          {currentStep === 1 && (
            <form onSubmit={handleStep1Next} className="space-y-4 text-xs">
              
              {/* Row 1: Hospital Name & Code */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.hospitalNameLabel} *
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Manipal Super Specialty & Trauma Institute"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF8F5] border border-stone-300 text-[#1A1D20] focus:outline-none focus:ring-2 focus:ring-[#10B981] font-medium"
                    />
                  </div>
                  {errors.name && <p className="text-red-600 text-[11px] mt-0.5">{errors.name}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.hospitalCodeLabel} *
                  </label>
                  <input
                    type="text"
                    value={hospitalCode}
                    onChange={e => setHospitalCode(e.target.value)}
                    placeholder="HOSP-BLR-01"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-stone-300 text-[#1A1D20] font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                  />
                </div>
              </div>

              {/* Row 2: Duty Officer Name & Medical Staff ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.officerNameLabel} *
                  </label>
                  <div className="relative">
                    <Stethoscope className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={officerName}
                      onChange={e => setOfficerName(e.target.value)}
                      placeholder="Dr. Vikram Adiga, MS"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF8F5] border border-stone-300 text-[#1A1D20] focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                    />
                  </div>
                  {errors.officerName && <p className="text-red-600 text-[11px] mt-0.5">{errors.officerName}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.officerIdLabel} *
                  </label>
                  <input
                    type="text"
                    value={officerId}
                    onChange={e => setOfficerId(e.target.value)}
                    placeholder="REG-77490-KMC"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-stone-300 text-[#1A1D20] font-mono focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                  />
                </div>
              </div>

              {/* Row 3: Emergency Phone & Official Institutional Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.phoneLabel} *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+91 80 2502 4444"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF8F5] border border-stone-300 text-[#1A1D20] font-mono focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                    />
                  </div>
                  {errors.phone && <p className="text-red-600 text-[11px] mt-0.5">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.emailLabel} *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="emergency.desk@manipalhospitals.demo"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF8F5] border border-stone-300 text-[#1A1D20] focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                    />
                  </div>
                  {errors.email && <p className="text-red-600 text-[11px] mt-0.5">{errors.email}</p>}
                </div>
              </div>

              {/* Row 4: Password & Physical Facility Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.passwordLabel} *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-9 py-2 rounded-xl bg-[#FAF8F5] border border-stone-300 text-[#1A1D20] focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Physical Facility Address *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      placeholder="98 HAL Old Airport Rd, Kodihalli, Bengaluru"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF8F5] border border-stone-300 text-[#1A1D20] focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons: Smooth pill-shaped buttons with solid vibrant fills */}
              <div className="pt-4 flex items-center justify-between border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => {
                    // Quick Fill demo
                    setName('Manipal Super Specialty & Trauma Institute');
                    setOfficerName('Dr. Vikram Adiga, MS');
                    setPhone('+91 80 2502 4444');
                    setEmail('emergency.desk@manipalhospitals.demo');
                  }}
                  className="text-xs font-semibold text-[#F59E0B] hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Autofill Verified Hospital Details</span>
                </button>

                <button
                  type="submit"
                  className="py-3 px-6 rounded-full bg-[#10B981] hover:bg-[#0F9D75] text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all active:scale-[0.98] flex items-center gap-2 cursor-pointer"
                >
                  <span>{t.nextStepBtn}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </form>
          )}

          {/* STEP 2: INFRASTRUCTURE, FACILITIES & BED COUNTERS */}
          {currentStep === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-5 text-xs">
              
              {/* Type of Hospital (Refined Radio Buttons) */}
              <div>
                <label className="block font-semibold text-slate-700 mb-2">
                  Hospital Governance Classification *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['Private', 'Government'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setHospitalType(type)}
                      className={`py-2.5 px-4 rounded-2xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                        hospitalType === type
                          ? 'bg-[#0B192C] text-white border-[#0B192C] shadow-sm'
                          : 'bg-white text-slate-700 border-stone-300 hover:border-stone-400'
                      }`}
                    >
                      <span>{type} Hospital</span>
                      {hospitalType === type && <CheckCircle2 className="w-4 h-4 text-[#10B981]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selectable Filter/Tag Chips: Rounded pill-shaped buttons */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-semibold text-slate-700">
                    Active Specialized Facilities Available *
                  </label>
                  <span className="text-[10px] text-slate-500">
                    Select all that apply
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-2">
                  {availableFacilitiesList.map(fac => {
                    const isSelected = facilities.includes(fac);
                    const isStandard = STANDARD_FACILITIES.includes(fac);
                    return (
                      <div
                        key={fac}
                        className={`rounded-full text-xs font-semibold transition-all flex items-center overflow-hidden ${
                          isSelected
                            ? 'bg-[#0B192C] text-white border border-[#0B192C] shadow-sm'
                            : 'bg-white text-slate-700 border border-stone-300 hover:border-stone-400'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleFacility(fac)}
                          className="px-3.5 py-1.5 flex items-center gap-1.5 cursor-pointer"
                        >
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />}
                          <span>{fac}</span>
                        </button>
                        {!isStandard && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAvailableFacilitiesList(prev => prev.filter(f => f !== fac));
                              setFacilities(prev => prev.filter(f => f !== fac));
                            }}
                            className={`pr-2 pl-0.5 py-1.5 text-xs hover:text-red-400 cursor-pointer ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}
                            title="Remove facility"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Custom Facility input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customFacility}
                    onChange={e => setCustomFacility(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomFacility();
                      }
                    }}
                    placeholder="+ Add Custom Facility (e.g. Hyperbaric Chamber, Burn Ward)"
                    className="flex-1 px-3 py-2 rounded-xl bg-[#FAF8F5] border border-stone-300 text-[#1A1D20] text-xs focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomFacility}
                    className="px-4 py-2 rounded-xl bg-[#0B192C] hover:bg-[#1A2E44] text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
                  >
                    + Add
                  </button>
                </div>
                {errors.facilities && <p className="text-red-600 text-[11px] mt-0.5">{errors.facilities}</p>}
              </div>

              {/* Distinct Centered Numeric Stepper Blocks */}
              <div>
                <label className="block font-semibold text-slate-700 mb-2">
                  Live Dispatch Capacity & Fleet Counters *
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  {/* Stepper 1: Ambulances */}
                  <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                      <Ambulance className="w-3.5 h-3.5 text-[#10B981]" />
                      <span>Ambulance Fleet</span>
                    </span>
                    <div className="flex items-center justify-between bg-white rounded-xl border border-stone-300 p-1">
                      <button
                        type="button"
                        onClick={() => setAmbulances(Math.max(1, ambulances - 1))}
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700 cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-mono font-bold text-base text-[#1A1D20]">
                        {ambulances}
                      </span>
                      <button
                        type="button"
                        onClick={() => setAmbulances(ambulances + 1)}
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Stepper 2: ICU Beds */}
                  <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                      <Bed className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>ICU Beds Available</span>
                    </span>
                    <div className="flex items-center justify-between bg-white rounded-xl border border-stone-300 p-1">
                      <button
                        type="button"
                        onClick={() => setIcuBeds(Math.max(0, icuBeds - 1))}
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700 cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-mono font-bold text-base text-[#1A1D20]">
                        {icuBeds}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIcuBeds(icuBeds + 1)}
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Stepper 3: Trauma Beds */}
                  <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-[#F59E0B]" />
                      <span>Trauma Bays</span>
                    </span>
                    <div className="flex items-center justify-between bg-white rounded-xl border border-stone-300 p-1">
                      <button
                        type="button"
                        onClick={() => setTraumaBeds(Math.max(0, traumaBeds - 1))}
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700 cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-mono font-bold text-base text-[#1A1D20]">
                        {traumaBeds}
                      </span>
                      <button
                        type="button"
                        onClick={() => setTraumaBeds(traumaBeds + 1)}
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              {/* Action Row */}
              <div className="pt-4 flex items-center justify-between border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="py-2.5 px-5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
                >
                  ← {t.backBtn}
                </button>

                <button
                  type="submit"
                  className="py-3.5 px-7 rounded-full bg-[#10B981] hover:bg-[#0F9D75] text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all active:scale-[0.98] flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t.loginBtn}</span>
                </button>
              </div>

            </form>
          )}

        </div>

      </main>

    </div>
  );
};
