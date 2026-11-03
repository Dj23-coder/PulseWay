import React, { useState } from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { 
  UserProfile, 
  BloodGroup, 
  Sex, 
  EmergencyContact 
} from '../../types';
import { 
  User, 
  Heart, 
  Users, 
  MapPin, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle,
  Lock,
  Globe,
  ArrowRight,
  ArrowLeft,
  Check,
  LogIn,
  UserPlus,
  Phone,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';
import { translations } from '../../utils/translations';
import { loginCitizenAccount, registerCitizenAccount } from '../../utils/supabase';

const POPULAR_ALLERGIES = [
  'Penicillin / Antibiotics',
  'Painkillers (Aspirin/Ibuprofen)',
  'Peanuts / Food Allergy',
  'Dust / Asthma',
  'None'
];

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const RELATIONSHIPS = ['Dad', 'Mom', 'Brother', 'Sister', 'Wife', 'Husband', 'Son', 'Daughter', 'Friend', 'Guardian'];

interface FirstTimeRegistrationProps {
  onComplete?: () => void;
  isEditing?: boolean;
}

export const FirstTimeRegistration: React.FC<FirstTimeRegistrationProps> = ({ onComplete, isEditing = false }) => {
  const { userProfile, updateUserProfile, setIsUserRegistered, setActiveStage, language, setLanguage } = useEmergency();
  const t = translations[language];

  // Auth Mode: 'LOGIN' for existing citizens, 'REGISTER' for new accounts
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>(isEditing ? 'REGISTER' : 'LOGIN');

  // Login Form State
  const [loginMobile, setLoginMobile] = useState('');
  const [loginPassword, setLoginPassword] = useState('User@123');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Register Form State
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<UserProfile>(userProfile);
  const [registerPassword, setRegisterPassword] = useState('User@123');
  const [customAllergyInput, setCustomAllergyInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto calculate age from DD/MM/YYYY
  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    let newAge = formData.age;
    const parts = val.split('/');
    if (parts.length === 3 && parts[2]?.length === 4) {
      const birthYear = parseInt(parts[2], 10);
      const currentYear = new Date().getFullYear();
      if (!isNaN(birthYear) && birthYear > 1920 && birthYear <= currentYear) {
        newAge = currentYear - birthYear;
      }
    }
    setFormData(prev => ({ ...prev, dob: val, age: newAge }));
  };

  const toggleAllergy = (allergy: string) => {
    if (allergy === 'None') {
      setFormData(prev => ({ ...prev, allergies: ['None'], customAllergies: [] }));
      return;
    }
    setFormData(prev => {
      const current = prev.allergies.filter(a => a !== 'None');
      if (current.includes(allergy)) {
        return { ...prev, allergies: current.filter(a => a !== allergy) };
      } else {
        return { ...prev, allergies: [...current, allergy] };
      }
    });
  };

  const addCustomAllergy = () => {
    if (!customAllergyInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      customAllergies: [...prev.customAllergies, customAllergyInput.trim()],
      allergies: prev.allergies.filter(a => a !== 'None')
    }));
    setCustomAllergyInput('');
  };

  const removeCustomAllergy = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      customAllergies: prev.customAllergies.filter((_, i) => i !== idx)
    }));
  };

  const updateContact = (id: string, field: keyof EmergencyContact, val: any) => {
    setFormData(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.map(c => 
        c.id === id ? { ...c, [field]: val } : c
      )
    }));
  };

  const addContact = () => {
    if (formData.emergencyContacts.length >= 3) return;
    const newId = (formData.emergencyContacts.length + 1).toString();
    const newContact: EmergencyContact = {
      id: newId,
      fullName: '',
      mobile: '',
      relationship: 'Friend',
      priority: formData.emergencyContacts.length + 1
    };
    setFormData(prev => ({
      ...prev,
      emergencyContacts: [...prev.emergencyContacts, newContact]
    }));
  };

  const removeContact = (id: string) => {
    if (formData.emergencyContacts.length <= 2) return;
    setFormData(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter(c => c.id !== id)
    }));
  };

  // Step Validations
  const validateStep = (step: number): boolean => {
    const stepErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.fullName.trim()) stepErrors.fullName = 'Full Name is required';
      if (!formData.dob.trim()) stepErrors.dob = 'DOB (DD/MM/YYYY) is required';
      if (!formData.mobile.trim() || formData.mobile.length < 10) stepErrors.mobile = 'Valid 10-digit primary mobile is required';
      if (!formData.email.trim() || !formData.email.includes('@')) stepErrors.email = 'Valid Email ID is required';
      if (registerPassword.length < 6) stepErrors.password = 'Password must be at least 6 characters';
    } else if (step === 2) {
      if (!formData.bloodGroup) stepErrors.bloodGroup = 'Please select a blood group';
    } else if (step === 3) {
      const p1 = formData.emergencyContacts[0];
      const p2 = formData.emergencyContacts[1];
      if (!p1 || !p1.fullName.trim()) stepErrors.contact1Name = 'Contact 1 name is required';
      if (!p1 || !p1.mobile.trim() || p1.mobile.length < 10) stepErrors.contact1Mobile = 'Valid 10-digit number required for Contact 1';
      if (!p2 || !p2.fullName.trim()) stepErrors.contact2Name = 'Contact 2 name is required';
      if (!p2 || !p2.mobile.trim() || p2.mobile.length < 10) stepErrors.contact2Mobile = 'Valid 10-digit number required for Contact 2';
    } else if (step === 4) {
      if (!formData.permanentAddress.trim()) stepErrors.permanentAddress = 'Permanent residential address is required';
      if (!formData.gpsConsentConfirmed) stepErrors.gpsConsent = 'Mandatory GPS tracking consent must be granted';
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setErrors({});
      if (currentStep < 4) {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const handlePrevStep = () => {
    setErrors({});
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Handle Citizen Login
  const handleCitizenLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const cleanMobile = loginMobile.trim().replace(/\D/g, '');
    if (!cleanMobile || cleanMobile.length < 10) {
      setAuthError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setAuthLoading(true);
    try {
      const res = await loginCitizenAccount(cleanMobile, loginPassword);
      if (res.success && res.profile) {
        updateUserProfile(res.profile);
        setIsUserRegistered(true);
        if (onComplete) onComplete();
        else setActiveStage('stage-hub');
      } else {
        setAuthError(res.error || 'Login failed. Please verify credentials or register.');
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Unable to connect to database.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Citizen Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    setErrors({});
    setAuthLoading(true);

    const completeProfile: UserProfile = {
      ...formData,
      gpsConsentTimestamp: new Date().toISOString()
    };

    try {
      await registerCitizenAccount(completeProfile, registerPassword);
      updateUserProfile(completeProfile);
      setIsUserRegistered(true);
      if (onComplete) {
        onComplete();
      } else {
        setActiveStage('stage-hub');
      }
    } catch (err: any) {
      // Local fallback in case of connection drop
      updateUserProfile(completeProfile);
      setIsUserRegistered(true);
      if (onComplete) onComplete();
      else setActiveStage('stage-hub');
    } finally {
      setAuthLoading(false);
    }
  };

  const fillDemoCitizen = () => {
    setLoginMobile('9845012345');
    setLoginPassword('User@123');
    setAuthError(null);
  };

  const stepTitles = [
    { num: 1, title: 'Personal Info', icon: User },
    { num: 2, title: 'Medical Details', icon: Heart },
    { num: 3, title: 'Emergency SOS', icon: Users },
    { num: 4, title: 'Address & GPS', icon: MapPin }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 text-slate-900 dark:text-slate-100 max-w-lg mx-auto w-full">
      
      {/* Top Header & Language Selector */}
      <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 font-bold">
              PulseWay
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              {isEditing ? 'Update Profile' : authMode === 'LOGIN' ? 'Citizen Sign In' : 'New Citizen Registration'}
            </span>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <Globe className="w-3 h-3 text-slate-500 shrink-0" />
            <select
              value={language}
              onChange={e => setLanguage(e.target.value as any)}
              className="text-[11px] font-bold bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="en" className="text-black">ENG</option>
              <option value="kn" className="text-black">ಕನ್ನಡ</option>
              <option value="hi" className="text-black">हिंदी</option>
            </select>
          </div>
        </div>

        {/* Tab Switcher: Sign In vs Quick Register (hidden when editing profile) */}
        {!isEditing && (
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl mt-2 mb-2">
            <button
              type="button"
              onClick={() => { setAuthMode('LOGIN'); setAuthError(null); }}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'LOGIN'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5 text-red-600" />
              <span>Citizen Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('REGISTER'); setAuthError(null); }}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'REGISTER'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 text-blue-600" />
              <span>New Registration</span>
            </button>
          </div>
        )}

        <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white font-serif">
          {isEditing 
            ? 'Edit Emergency Profile' 
            : authMode === 'LOGIN' 
              ? 'Access Your Emergency Profile' 
              : t.registrationTitle}
        </h1>
        <p className="text-[11px] text-slate-500 mt-0.5">
          {authMode === 'LOGIN' 
            ? 'Your medical data and active emergency tracking are private to your account.' 
            : `${stepTitles[currentStep - 1].title} (Step ${currentStep} of 4)`}
        </p>
      </div>

      {/* ========================================================================= */}
      {/* CITIZEN LOGIN VIEW */}
      {/* ========================================================================= */}
      {authMode === 'LOGIN' && !isEditing ? (
        <form onSubmit={handleCitizenLogin} className="space-y-3.5 py-3 animate-in fade-in duration-150">
          
          {authError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 rounded-xl text-red-700 dark:text-red-300 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{authError}</p>
                <button
                  type="button"
                  onClick={() => { setAuthMode('REGISTER'); setAuthError(null); }}
                  className="mt-1 text-[11px] underline font-bold text-red-600 hover:text-red-700 cursor-pointer"
                >
                  Click here to register a new account instead
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Registered Mobile Number *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-mono text-xs">
                  +91
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  value={loginMobile}
                  onChange={e => setLoginMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="9845012345"
                  className="w-full pl-12 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500 font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Security Password / PIN *
                </label>
                <span className="text-[10px] text-slate-400">Default: User@123</span>
              </div>
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-xs pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {authLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Connecting to Supabase...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to PulseWay</span>
                </>
              )}
            </button>

            {/* Quick Demo Autofill */}
            <button
              type="button"
              onClick={fillDemoCitizen}
              className="w-full py-2 px-3 rounded-xl font-semibold text-[11px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Autofill Demo Citizen Profile (9845012345)</span>
            </button>

            <p className="text-center text-[11px] text-slate-500 pt-2">
              Don't have an emergency medical profile yet?{' '}
              <button
                type="button"
                onClick={() => { setAuthMode('REGISTER'); setAuthError(null); }}
                className="text-red-600 font-bold hover:underline cursor-pointer"
              >
                Register Now
              </button>
            </p>
          </div>
        </form>
      ) : (

        /* ========================================================================= */
        /* CITIZEN STEP-BY-STEP REGISTRATION VIEW */
        /* ========================================================================= */
        <>
          {/* Mobile Step Indicator Progress Bar */}
          <div className="py-3">
            <div className="grid grid-cols-4 gap-1.5 mb-1.5">
              {stepTitles.map(s => {
                const isCompleted = currentStep > s.num;
                const isCurrent = currentStep === s.num;
                return (
                  <div 
                    key={s.num}
                    onClick={() => {
                      if (s.num < currentStep) setCurrentStep(s.num);
                    }}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      isCompleted 
                        ? 'bg-emerald-500' 
                        : isCurrent 
                          ? 'bg-red-600' 
                          : 'bg-slate-200 dark:bg-slate-800'
                    }`}
                    title={`Step ${s.num}: ${s.title}`}
                  />
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 px-0.5">
              <span className="font-bold text-red-600">
                Step {currentStep}/4: {stepTitles[currentStep - 1].title}
              </span>
              <span className="text-[10px] text-slate-400">
                {currentStep === 4 ? 'Final Step' : 'Next: ' + stepTitles[currentStep]?.title}
              </span>
            </div>
          </div>

          <form onSubmit={handleRegisterSubmit} className="space-y-4">

            {/* STEP 1: Personal Details */}
            {currentStep === 1 && (
              <div className="bg-slate-50/80 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60 space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-200/60 dark:border-slate-700/40">
                  <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    1. Personal Biometrics & Login Credentials
                  </h2>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t.fullName} *
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder={t.fullNamePlaceholder}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-xs"
                    />
                    {errors.fullName && <p className="text-red-600 text-[10px] mt-0.5 font-semibold">{errors.fullName}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        {t.dob} (DD/MM/YYYY) *
                      </label>
                      <input
                        type="text"
                        value={formData.dob}
                        onChange={handleDobChange}
                        placeholder="12/06/1994"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500 font-mono text-xs"
                      />
                      {errors.dob && <p className="text-red-600 text-[10px] mt-0.5 font-semibold">{errors.dob}</p>}
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Age (Years)
                      </label>
                      <input
                        type="number"
                        value={formData.age}
                        onChange={e => setFormData({ ...formData, age: parseInt(e.target.value, 10) || 0 })}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Primary Mobile Number (Used for Login & SOS) *
                    </label>
                    <input
                      type="tel"
                      maxLength={10}
                      value={formData.mobile}
                      onChange={e => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
                      placeholder="9845012345"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500 font-mono text-xs"
                    />
                    {errors.mobile && <p className="text-red-600 text-[10px] mt-0.5 font-semibold">{errors.mobile}</p>}
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Security Password (For Future Sign In) *
                    </label>
                    <input
                      type="password"
                      value={registerPassword}
                      onChange={e => setRegisterPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-xs"
                    />
                    {errors.password && <p className="text-red-600 text-[10px] mt-0.5 font-semibold">{errors.password}</p>}
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="citizen@example.com"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-xs"
                    />
                    {errors.email && <p className="text-red-600 text-[10px] mt-0.5 font-semibold">{errors.email}</p>}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Sex
                      </label>
                      <select
                        value={formData.sex}
                        onChange={e => setFormData({ ...formData, sex: e.target.value as Sex })}
                        className="w-full px-2 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Height
                      </label>
                      <input
                        type="text"
                        value={formData.height}
                        onChange={e => setFormData({ ...formData, height: e.target.value })}
                        placeholder="175 cm"
                        className="w-full px-2 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
                      >
                      </input>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Weight
                      </label>
                      <input
                        type="text"
                        value={formData.weight}
                        onChange={e => setFormData({ ...formData, weight: e.target.value })}
                        placeholder="70 kg"
                        className="w-full px-2 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
                      >
                      </input>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Medical Details */}
            {currentStep === 2 && (
              <div className="bg-slate-50/80 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60 space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-200/60 dark:border-slate-700/40">
                  <div className="w-6 h-6 rounded-md bg-red-100 text-red-600 flex items-center justify-center">
                    <Heart className="w-3.5 h-3.5" />
                  </div>
                  <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    2. Medical History & Blood Group
                  </h2>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Blood Group *
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {BLOOD_GROUPS.map(bg => (
                        <button
                          key={bg}
                          type="button"
                          onClick={() => setFormData({ ...formData, bloodGroup: bg })}
                          className={`py-2 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                            formData.bloodGroup === bg 
                              ? 'bg-red-600 text-white border-red-600 shadow-sm' 
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-red-400'
                          }`}
                        >
                          {bg}
                        </button>
                      ))}
                    </div>
                    {errors.bloodGroup && <p className="text-red-600 text-[10px] mt-1 font-semibold">{errors.bloodGroup}</p>}
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Known Allergies & Contraindications
                    </label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {POPULAR_ALLERGIES.map(allergy => {
                        const isSelected = formData.allergies.includes(allergy);
                        return (
                          <button
                            key={allergy}
                            type="button"
                            onClick={() => toggleAllergy(allergy)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-red-100 border-red-300 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200 font-bold'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                            {allergy}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={customAllergyInput}
                        onChange={e => setCustomAllergyInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomAllergy(); } }}
                        placeholder="Add custom allergy / medication..."
                        className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
                      />
                      <button
                        type="button"
                        onClick={addCustomAllergy}
                        className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 text-xs font-bold"
                      >
                        Add
                      </button>
                    </div>

                    {formData.customAllergies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {formData.customAllergies.map((ca, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 text-[10px] font-semibold">
                            {ca}
                            <button type="button" onClick={() => removeCustomAllergy(idx)} className="hover:text-red-600">×</button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Emergency Contacts */}
            {currentStep === 3 && (
              <div className="bg-slate-50/80 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60 space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200/60 dark:border-slate-700/40">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      3. SOS Emergency Contacts
                    </h2>
                  </div>
                  {formData.emergencyContacts.length < 3 && (
                    <button
                      type="button"
                      onClick={addContact}
                      className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Add Contact
                    </button>
                  )}
                </div>

                <div className="space-y-3 text-xs">
                  {formData.emergencyContacts.map((contact, idx) => (
                    <div key={contact.id} className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                          Emergency Contact #{idx + 1} {idx === 0 ? '(Primary SOS)' : ''}
                        </span>
                        {formData.emergencyContacts.length > 2 && idx >= 2 && (
                          <button
                            type="button"
                            onClick={() => removeContact(contact.id)}
                            className="text-red-500 hover:text-red-700 p-0.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-medium text-slate-500 mb-0.5">Full Name *</label>
                          <input
                            type="text"
                            value={contact.fullName}
                            onChange={e => updateContact(contact.id, 'fullName', e.target.value)}
                            placeholder="e.g. Ramesh V"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-slate-500 mb-0.5">Relationship</label>
                          <select
                            value={contact.relationship}
                            onChange={e => updateContact(contact.id, 'relationship', e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
                          >
                            {RELATIONSHIPS.map(r => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-0.5">Mobile Number (10 Digits) *</label>
                        <input
                          type="tel"
                          maxLength={10}
                          value={contact.mobile}
                          onChange={e => updateContact(contact.id, 'mobile', e.target.value.replace(/\D/g, ''))}
                          placeholder="9845012345"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-xs"
                        />
                      </div>
                    </div>
                  ))}

                  {errors.contact1Name && <p className="text-red-600 text-[10px] font-semibold">{errors.contact1Name}</p>}
                  {errors.contact1Mobile && <p className="text-red-600 text-[10px] font-semibold">{errors.contact1Mobile}</p>}
                </div>
              </div>
            )}

            {/* STEP 4: Address & Mandatory GPS Consent */}
            {currentStep === 4 && (
              <div className="bg-slate-50/80 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60 space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-200/60 dark:border-slate-700/40">
                  <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-600 flex items-center justify-center">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    4. Permanent Address & GPS Consent
                  </h2>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Permanent Residential Address *
                    </label>
                    <textarea
                      rows={2}
                      value={formData.permanentAddress}
                      onChange={e => setFormData({ ...formData, permanentAddress: e.target.value })}
                      placeholder="Flat 402, Lotus Residency, 12th Cross, Indiranagar, Bengaluru 560038"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-xs"
                    />
                    {errors.permanentAddress && <p className="text-red-600 text-[10px] mt-0.5 font-semibold">{errors.permanentAddress}</p>}
                  </div>

                  {/* Mandatory Checkbox */}
                  <div className="p-3 bg-red-50/80 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-900/50">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.gpsConsentConfirmed}
                        onChange={e => setFormData({ ...formData, gpsConsentConfirmed: e.target.checked })}
                        className="mt-0.5 w-4 h-4 text-red-600 rounded border-red-300 focus:ring-red-500 cursor-pointer shrink-0"
                      />
                      <div>
                        <span className="font-bold text-red-900 dark:text-red-200 text-xs block leading-snug">
                          I explicitly confirm and consent to enable continuous GPS location tracking during emergencies. *
                        </span>
                        <p className="text-[10px] text-red-700 dark:text-red-300/90 mt-1 leading-relaxed">
                          {t.securityNotice}
                        </p>
                      </div>
                    </label>
                    {errors.gpsConsent && <p className="text-red-600 text-[10px] mt-1.5 font-bold">{errors.gpsConsent}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step Navigation Buttons: Back, Next & Submit */}
            <div className="pt-2 flex items-center gap-2">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="py-3 px-4 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              )}

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-xs bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20 transition-all active:scale-[0.99] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Next: {stepTitles[currentStep]?.title}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={authLoading}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30 transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {authLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving to Supabase...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>{isEditing ? 'Save Changes' : t.completeRegistrationBtn}</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {!isEditing && (
              <p className="text-center text-[11px] text-slate-500 pt-1">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthMode('LOGIN'); setAuthError(null); }}
                  className="text-red-600 font-bold hover:underline cursor-pointer"
                >
                  Sign In with Mobile
                </button>
              </p>
            )}

          </form>
        </>
      )}

    </div>
  );
};
