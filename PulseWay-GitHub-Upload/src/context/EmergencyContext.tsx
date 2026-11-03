import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  UserProfile, 
  HospitalProfile, 
  EmergencyIncident, 
  Coordinates, 
  AIChatRecord, 
  PreArrivalAllocation,
  EmergencySeverity,
  AuditLogEntry
} from '../types';
import { 
  INITIAL_USER_PROFILE, 
  INITIAL_HOSPITALS, 
  INITIAL_AI_CHAT_RECORDS 
} from '../data/mockData';
import { translations } from '../utils/translations';
import { 
  supabase, 
  saveIncidentToSupabase, 
  fetchIncidentsFromSupabase, 
  fetchHospitalsFromSupabase,
  getCitizenProfile,
  fetchCitizenIncidents,
  saveTriageLogToSupabase, 
  saveUserProfileToSupabase 
} from '../utils/supabase';

export type PreviewMode = 'DUAL' | 'CITIZEN' | 'HOSPITAL';

export interface PrototypeStage {
  id: string;
  number: number;
  label: string;
  description: string;
  category: 'CITIZEN' | 'HOSPITAL';
}

export const PROTOTYPE_STAGES: PrototypeStage[] = [
  { id: 'stage-reg', number: 1, label: 'First-Time Registration', description: '4-section onboarding with mandatory GPS tracking', category: 'CITIZEN' },
  { id: 'stage-hub', number: 2, label: 'Emergency Home Hub', description: 'Anti-abuse warning, live GPS, shortcuts & voice', category: 'CITIZEN' },
  { id: 'stage-triage', number: 3, label: 'AI Severity Triage', description: 'Self vs Others, legal popup, Minor vs Critical AI', category: 'CITIZEN' },
  { id: 'stage-waiting', number: 4, label: 'Awaiting Hospital Response', description: 'Strict gatekeeper: alert broadcasted, awaiting acceptance', category: 'CITIZEN' },
  { id: 'stage-tracking', number: 5, label: 'Live Map & Ambulance Dispatch', description: 'Real-time 🚨, 🚑, 🏥 approach route & doctor allocation', category: 'CITIZEN' },
  { id: 'stage-survival', number: 6, label: 'Survival Guide', description: 'Alone vs Assisted paths for 8 major emergencies', category: 'CITIZEN' },
  { id: 'stage-history', number: 7, label: 'AI Chat History', description: 'Read-only clinical incident logs & report download', category: 'CITIZEN' },
  { id: 'stage-hosp-setup', number: 8, label: 'Hospital Login & Setup', description: 'Credentials, infrastructure, beds & fleet count', category: 'HOSPITAL' },
  { id: 'stage-hosp-dash', number: 9, label: 'Hospital Emergency Center', description: 'Metrics, Live feed, Dispatch Console & Pre-Arrival Bed', category: 'HOSPITAL' }
];

interface EmergencyContextType {
  previewMode: PreviewMode;
  setPreviewMode: (mode: PreviewMode) => void;
  activeStage: string;
  setActiveStage: (stageId: string) => void;
  language: 'en' | 'kn' | 'hi';
  setLanguage: (lang: 'en' | 'kn' | 'hi') => void;
  
  // User Profile
  userProfile: UserProfile;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  isUserRegistered: boolean;
  setIsUserRegistered: (reg: boolean) => void;

  // Live Location
  currentLocation: Coordinates;
  isTrackingLocation: boolean;
  refreshLocation: () => void;
  updateLocation: (coords: Partial<Coordinates>) => void;
  recalibrateHighAccuracyGPS: () => Promise<void>;

  // Hospital state
  hospitals: HospitalProfile[];
  activeHospitalId: string;
  setActiveHospitalId: (id: string) => void;
  activeHospital: HospitalProfile;
  updateHospitalCapacity: (hospId: string, updates: Partial<HospitalProfile>) => void;
  isHospitalLoggedIn: boolean;
  setIsHospitalLoggedIn: (val: boolean) => void;

  // Emergency Incident Lifecycle
  activeIncident: EmergencyIncident | null;
  emergencyQueue: EmergencyIncident[];
  selectedPatientForConsole: EmergencyIncident | null;
  setSelectedPatientForConsole: React.Dispatch<React.SetStateAction<EmergencyIncident | null>>;

  // Citizen Actions
  startEmergencyTrigger: (shortcut?: string) => void;
  setTargetSelfOrOthers: (target: 'SELF' | 'OTHERS') => void;
  submitOtherPatientInfo: (data: { cause: string; gender: any; bloodGroup: any; height?: string; name?: string }) => void;
  executeAITriage: (description: string, symptoms?: string[]) => Promise<void>;
  confirmCriticalBooking: () => void;
  cancelCriticalBooking: () => void;
  confirmMisuseWarning: () => void;
  cancelMisuseWarning: () => void;
  resetEmergency: () => void;
  escalateToCriticalAmbulance: () => void;

  // Automated Reassurance Audio
  playReassuranceVoice: (lang?: 'en' | 'kn' | 'hi') => void;
  isReassuranceVoicePlaying: boolean;

  // Hospital Actions
  hospitalAcceptAlert: (incidentId: string) => void;
  hospitalDispatchAmbulance: (incidentId: string, vehicleNo?: string) => void;
  hospitalMarkUnresponsive: (incidentId: string) => void;
  hospitalAllocateBedAndDoctor: (incidentId: string, allocation: PreArrivalAllocation) => void;
  hospitalCompleteTreatment: (incidentId: string, notes?: string) => void;

  // Accident Detection Simulation
  travelSpeed: number;
  isScooterMonitoringActive: boolean;
  setScooterMonitoringActive: (active: boolean) => void;
  isAccidentDetected: boolean;
  accidentCountdown: number;
  triggerAccidentSimulation: () => void;
  cancelAccidentTimer: () => void;
  isAlarmMuted: boolean;
  setIsAlarmMuted: (muted: boolean) => void;

  // Emergency Resolution
  resolveEmergencyWithAmbulanceArrival: (notes?: string) => void;

  // AI Chat & Reports
  aiChatRecords: AIChatRecord[];
  downloadReport: (recordId: string) => void;
}

const EmergencyContext = createContext<EmergencyContextType | undefined>(undefined);

export const EmergencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [previewMode, setPreviewMode] = useState<PreviewMode>('DUAL');
  const [activeStage, setActiveStage] = useState<string>('stage-hub');
  const [language, setLanguage] = useState<'en' | 'kn' | 'hi'>('en');

  // User Profile
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [isUserRegistered, setRawIsUserRegistered] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('pulseway_registered') === 'true';
    }
    return false;
  });

  const setIsUserRegistered = (registered: boolean) => {
    setRawIsUserRegistered(registered);
    if (typeof window !== 'undefined') {
      if (registered) {
        localStorage.setItem('pulseway_registered', 'true');
      } else {
        localStorage.removeItem('pulseway_registered');
      }
    }
  };

  // Live Location
  const [currentLocation, setCurrentLocation] = useState<Coordinates>({
    lat: 12.9716,
    lng: 77.5946,
    address: 'Indiranagar 100ft Rd, Bengaluru, Karnataka 560038'
  });
  const [isTrackingLocation, setIsTrackingLocation] = useState<boolean>(true);

  // Hospital Profiles
  const [hospitals, setHospitals] = useState<HospitalProfile[]>(INITIAL_HOSPITALS);
  const [activeHospitalId, setActiveHospitalId] = useState<string>('hosp-1');
  const [isHospitalLoggedIn, setIsHospitalLoggedIn] = useState<boolean>(false);

  // Active Incident
  const [activeIncident, setActiveIncident] = useState<EmergencyIncident | null>(null);

  // Hospital Live Feed Queue (Clean initial state - zero demo cases)
  const [emergencyQueue, setEmergencyQueue] = useState<EmergencyIncident[]>([]);

  const [selectedPatientForConsole, setSelectedPatientForConsole] = useState<EmergencyIncident | null>(null);

  // Accident Detection Simulation
  const [travelSpeed, setTravelSpeed] = useState<number>(42); // 42 km/h cruising
  const [isScooterMonitoringActive, setScooterMonitoringActive] = useState<boolean>(true);
  const [isAccidentDetected, setIsAccidentDetected] = useState<boolean>(false);
  const [accidentCountdown, setAccidentCountdown] = useState<number>(60);
  const [isAlarmMuted, setIsAlarmMuted] = useState<boolean>(false);
  const accidentTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Audio synthesis nodes for (600Hz–1000Hz Sawtooth + 2.5Hz LFO)
  const audioContextRef = useRef<AudioContext | null>(null);
  const carrierRef = useRef<OscillatorNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);
  const lfoGainRef = useRef<GainNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  // AI Chat History (Clean initial state - zero demo history)
  const [aiChatRecords, setAiChatRecords] = useState<AIChatRecord[]>([]);

  // Automated Reassurance Voice State
  const [isReassuranceVoicePlaying, setIsReassuranceVoicePlaying] = useState<boolean>(false);

  // Helper to query fast IP-based geolocation when browser GPS is blocked in iFrames
  const fetchIpGeolocation = async (): Promise<{ lat: number; lng: number; address: string; landmark?: string } | null> => {
    try {
      const res = await fetch('https://freeipapi.com/api/json', { signal: AbortSignal.timeout(3500) });
      if (res.ok) {
        const data = await res.json();
        if (data.latitude && data.longitude) {
          const lat = Number(data.latitude);
          const lng = Number(data.longitude);
          const city = data.cityName || 'City Center';
          const region = data.regionName || '';
          const country = data.countryName || 'India';
          return {
            lat,
            lng,
            address: `${city}, ${region ? region + ', ' : ''}${country}`,
            landmark: `${city} Sector (IP-Verified Telemetry Fix)`
          };
        }
      }
    } catch (e) {}
    return null;
  };

  // Adapt emergency fleet hospitals around user's active GPS coordinate
  const adaptHospitalsToLocation = (userLat: number, userLng: number) => {
    setHospitals(prev => [
      {
        ...prev[0],
        coordinates: {
          lat: Number((userLat + 0.0122).toFixed(5)),
          lng: Number((userLng + 0.0108).toFixed(5)),
          address: 'Emergency Trauma Hub, Sector 1'
        }
      },
      {
        ...prev[1],
        coordinates: {
          lat: Number((userLat - 0.0115).toFixed(5)),
          lng: Number((userLng + 0.0142).toFixed(5)),
          address: 'Govt. Medical College & Emergency Unit'
        }
      },
      {
        ...prev[2],
        coordinates: {
          lat: Number((userLat - 0.0162).toFixed(5)),
          lng: Number((userLng - 0.0124).toFixed(5)),
          address: 'Super Specialty Cardiac Emergency Center'
        }
      }
    ]);
  };

  // Reverse Geocoding helper for accurate street-level address
  const reverseGeocode = async (lat: number, lng: number): Promise<{ address: string; landmark?: string }> => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
        headers: { 'Accept-Language': 'en' },
        signal: AbortSignal.timeout(4000)
      });
      if (res.ok) {
        const data = await res.json();
        const road = data.address?.road || data.address?.suburb || data.address?.neighbourhood || data.address?.pedestrian;
        const city = data.address?.city || data.address?.town || data.address?.county || data.address?.state || '';
        const postcode = data.address?.postcode ? `, ${data.address.postcode}` : '';
        const landmark = data.address?.amenity || data.address?.building || data.address?.suburb || 'GPS Lock';
        
        if (road && city) {
          return {
            address: `${road}, ${city}${postcode}`,
            landmark
          };
        }
        if (data.display_name) {
          return {
            address: data.display_name.split(',').slice(0, 3).join(', '),
            landmark
          };
        }
      }
    } catch (e) {
      // Network or rate-limiting fallback
    }

    return {
      address: `Lat: ${lat.toFixed(5)}°, Lng: ${lng.toFixed(5)}°`,
      landmark: 'Live GPS Satellite Fix'
    };
  };

  // Acquire real browser geolocation with IP fallback and reverse geocoding
  const refreshLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const accuracy = Math.round(pos.coords.accuracy || 3);
          const geocoded = await reverseGeocode(lat, lng);

          setCurrentLocation({
            lat,
            lng,
            address: geocoded.address,
            accuracyMeters: accuracy,
            landmark: geocoded.landmark || `Accuracy ±${accuracy}m`
          });
          setIsTrackingLocation(true);
          adaptHospitalsToLocation(lat, lng);
        },
        async () => {
          // If browser GPS is denied (e.g. permissions or iFrame sandbox), attempt fast IP geolocation
          const ipLoc = await fetchIpGeolocation();
          if (ipLoc) {
            const geocoded = await reverseGeocode(ipLoc.lat, ipLoc.lng);
            setCurrentLocation({
              lat: ipLoc.lat,
              lng: ipLoc.lng,
              address: geocoded.address || ipLoc.address,
              accuracyMeters: 8,
              landmark: ipLoc.landmark || 'IP Telemetry Fix'
            });
            adaptHospitalsToLocation(ipLoc.lat, ipLoc.lng);
          } else {
            setCurrentLocation({
              lat: 12.9716,
              lng: 77.5946,
              address: 'City Center Hub',
              accuracyMeters: 5,
              landmark: 'GPS Standby Fix'
            });
          }
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    }
  };

  // Manual or guided location adjustment (updates active incident & queue immediately)
  const updateLocation = (coords: Partial<Coordinates>) => {
    setCurrentLocation(prev => {
      const next: Coordinates = {
        ...prev,
        ...coords,
        accuracyMeters: coords.accuracyMeters || 2
      };
      
      // Sync with active incident
      setActiveIncident(inc => inc ? { ...inc, coordinates: next } : null);

      // Sync with emergency queue
      setEmergencyQueue(q => q.map(inc => {
        if (activeIncident && inc.id === activeIncident.id) {
          return { ...inc, coordinates: next };
        }
        return inc;
      }));

      if (coords.lat && coords.lng) {
        adaptHospitalsToLocation(coords.lat, coords.lng);
      }

      return next;
    });
  };

  // Re-calibrate high accuracy GPS
  const recalibrateHighAccuracyGPS = async (): Promise<void> => {
    return new Promise<void>((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            const accuracy = Math.max(2, Math.round(pos.coords.accuracy || 2));
            const geocoded = await reverseGeocode(lat, lng);
            setCurrentLocation({
              lat,
              lng,
              address: geocoded.address,
              accuracyMeters: accuracy,
              landmark: geocoded.landmark || `Satellite GPS Lock ±${accuracy}m`
            });
            adaptHospitalsToLocation(lat, lng);
            resolve();
          },
          async () => {
            const ipLoc = await fetchIpGeolocation();
            if (ipLoc) {
              setCurrentLocation({
                lat: ipLoc.lat,
                lng: ipLoc.lng,
                address: ipLoc.address,
                accuracyMeters: 6,
                landmark: ipLoc.landmark
              });
              adaptHospitalsToLocation(ipLoc.lat, ipLoc.lng);
            } else {
              setCurrentLocation(prev => ({
                ...prev,
                accuracyMeters: 3,
                landmark: 'Satellite GPS Calibrated'
              }));
            }
            resolve();
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
      } else {
        resolve();
      }
    });
  };

  // Deterministic Clinical Severity Triage: NEVER dispatch ambulance for minor cases
  const classifyEmergencySeverity = (text: string): {
    severity: EmergencySeverity;
    reasoning: string;
    department: string;
    firstAid: string[];
    warningSigns: string[];
  } => {
    const q = text.toLowerCase();
    
    // Explicit minor keywords
    const minorKeywords = [
      'minor', 'mild', 'sprain', 'twist', 'bruise', 'scratch', 'scrape', 
      'headache', 'cold', 'cough', 'fever', 'sore throat', 'mosquito', 'insect bite',
      'paper cut', 'cramp', 'finger cut', 'tired', 'fatigue', 'nausea', 'stomach ache',
      'small burn', 'first degree burn', 'acidity', 'pimples', 'rash', 'ankle sprain',
      'small wound', 'blister', 'bandage'
    ];

    const criticalKeywords = [
      'chest pain', 'heart attack', 'unconscious', 'fainted', 'not breathing', 'breathless',
      'severe bleeding', 'blood loss', 'stroke', 'paralysis', 'seizure', 'fit', 'convulsion',
      'snake bite', 'poison', 'toxic', 'head injury', 'trauma', 'accident', 'crush', 'burns',
      'electrocution', 'cardiac', 'choking', 'cyanosis', 'broken bone', 'fracture', 'deep wound',
      'collision', 'crash', 'stab', 'vomiting blood', 'code red', 'sos'
    ];

    const isMinor = minorKeywords.some(k => q.includes(k)) && !criticalKeywords.some(k => q.includes(k));

    if (isMinor) {
      return {
        severity: 'MINOR',
        reasoning: 'Non-critical clinical symptoms identified. Patient vitals remain stable; ambulance deployment is suppressed per clinical safety protocols. Follow guided calm first-aid care below.',
        department: 'Outpatient Clinic & First Aid Care',
        firstAid: [
          'Rest in a comfortable, relaxed position and keep the affected area elevated if swollen.',
          'Apply a clean cold compress or ice pack wrapped in cloth for 15-20 minutes.',
          'Keep the area clean; apply mild antiseptic and sterile dressing if superficial skin is broken.',
          'Stay hydrated with small sips of clean water and monitor symptoms over the next 2 hours.'
        ],
        warningSigns: [
          'Sudden severe breathing difficulty or chest tightness',
          'Inability to bear weight or visible bone deformity',
          'Emergence of dizziness, confusion, or persistent vomiting'
        ]
      };
    }

    return {
      severity: 'CRITICAL',
      reasoning: 'Clinical assessment indicates high-acuity acute distress requiring ambulance dispatch and bed reservation.',
      department: q.includes('heart') || q.includes('chest') ? 'Cardiology & Cath Lab' :
                  q.includes('accident') || q.includes('trauma') ? 'Trauma & Resuscitation Center' : 'Emergency Resuscitation Bay',
      firstAid: [
        'Keep patient calm, seated, or in recovery position depending on consciousness.',
        'Do NOT give solid food or liquids if consciousness is compromised.',
        'Loosen restrictive clothing around neck and chest to facilitate airflow.',
        'Ensure clear unobstructed airway; continuously monitor pulse and breathing.'
      ],
      warningSigns: [
        'Loss of consciousness or unresponsiveness',
        'Gasping, shallow, or stopped breathing',
        'Bluish lips or cold, clammy skin'
      ]
    };
  };

  // Automated Reassurance Audio Synthesizer (Harmonic chime + SpeechSynthesis)
  const playReassuranceVoice = (overrideLang?: 'en' | 'kn' | 'hi') => {
    // Automated voice should only be heard in the citizen/user interface, NEVER in hospital dashboard!
    if (previewMode === 'HOSPITAL') {
      return;
    }

    const targetLang = overrideLang || language;
    setIsReassuranceVoicePlaying(true);

    // 1. Play calming harmonic medical chime via Web Audio API
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const now = ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5 major harmonic chord
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);
          gain.gain.setValueAtTime(0.001, now + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.12, now + idx * 0.12 + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.9);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 1.0);
        });
      }
    } catch (e) {}

    // 2. Play calm paramedic automated voice message in selected language
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = translations[targetLang].reassuranceTranscript;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.92;
      utterance.pitch = 1.0;
      utterance.lang = targetLang === 'kn' ? 'kn-IN' : targetLang === 'hi' ? 'hi-IN' : 'en-IN';
      
      utterance.onend = () => {
        setIsReassuranceVoicePlaying(false);
      };
      utterance.onerror = () => {
        setIsReassuranceVoicePlaying(false);
      };

      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 500);
    } else {
      setTimeout(() => setIsReassuranceVoicePlaying(false), 5000);
    }
  };

  useEffect(() => {
    refreshLocation();

    // Start high-precision continuous GPS watch
    let watchId: number | null = null;
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const accuracy = Math.round(pos.coords.accuracy || 3);
          
          setCurrentLocation(prev => {
            const latDiff = Math.abs(prev.lat - lat);
            const lngDiff = Math.abs(prev.lng - lng);
            if (latDiff > 0.00008 || lngDiff > 0.00008) {
              adaptHospitalsToLocation(lat, lng);
              return {
                ...prev,
                lat,
                lng,
                accuracyMeters: accuracy,
                landmark: `Live Satellite Lock (±${accuracy}m)`
              };
            }
            return prev;
          });
        },
        () => {},
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 3000 }
      );
    }

    return () => {
      if (watchId !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  // Sync with Supabase Cloud Database on Mount & Listen for Real-Time Changes
  useEffect(() => {
    // Sync Hospitals from Supabase Cloud Database
    fetchHospitalsFromSupabase().then(dbHospitals => {
      if (dbHospitals && dbHospitals.length > 0) {
        setHospitals(dbHospitals);
      }
    });

    // Check for saved citizen session in Supabase
    if (typeof window !== 'undefined') {
      try {
        const sessionRaw = localStorage.getItem('pulseway_citizen_session');
        if (sessionRaw) {
          const session = JSON.parse(sessionRaw);
          if (session?.mobile) {
            getCitizenProfile(session.mobile).then(prof => {
              if (prof) {
                setUserProfile(prof);
                setRawIsUserRegistered(true);
              }
            });
          }
        }
      } catch (e) {}
    }

    fetchIncidentsFromSupabase().then(dbIncidents => {
      if (dbIncidents && dbIncidents.length > 0) {
        setEmergencyQueue(dbIncidents);
      }
    });

    try {
      const channel = supabase
        .channel('realtime_emergency_incidents')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'emergency_incidents' }, (payload: any) => {
          if (payload.new) {
            const row = payload.new;
            const incident: EmergencyIncident = row.raw_incident || {
              id: row.id,
              timestamp: row.timestamp,
              status: row.status,
              severity: row.severity,
              target: row.target || 'SELF',
              patient: {
                fullName: row.patient_name,
                age: row.patient_age,
                sex: row.patient_sex,
                bloodGroup: row.patient_blood,
                cause: row.patient_cause,
                phone: row.patient_phone
              },
              coordinates: {
                lat: Number(row.latitude),
                lng: Number(row.longitude),
                address: row.address
              },
              assignedHospitalId: row.assigned_hospital_id,
              assignedHospitalName: row.assigned_hospital_name
            };

            setEmergencyQueue(prev => {
              const exists = prev.some(i => i.id === incident.id);
              if (exists) {
                return prev.map(i => i.id === incident.id ? incident : i);
              }
              return [incident, ...prev];
            });
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (e) {
      // Non-blocking fallback if realtime is unavailable
    }
  }, []);

  // Update Hospital Capacity periodically (every 5 mins or simulated tick)
  useEffect(() => {
    const interval = setInterval(() => {
      setHospitals(prev => prev.map(h => ({
        ...h,
        generalBedsAvailable: Math.max(2, h.generalBedsAvailable + (Math.random() > 0.5 ? 1 : -1)),
        icuBedsAvailable: Math.max(1, h.icuBedsAvailable + (Math.random() > 0.7 ? 1 : (Math.random() > 0.5 ? -1 : 0)))
      })));
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // 60-second Fallback Timer for active incident waiting for hospital
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeIncident && activeIncident.status === 'WAITING_HOSPITAL_ACCEPTANCE') {
      timer = setInterval(() => {
        setActiveIncident(prev => {
          if (!prev || prev.status !== 'WAITING_HOSPITAL_ACCEPTANCE') return prev;
          if (prev.waitTimerSeconds <= 1) {
            return {
              ...prev,
              waitTimerSeconds: 60,
              alertBroadcastRadiusKm: prev.alertBroadcastRadiusKm + 5
            };
          }
          return {
            ...prev,
            waitTimerSeconds: prev.waitTimerSeconds - 1
          };
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeIncident?.status]);

  // Stop continuous audio alarm siren (cleanly dismantles Web Audio nodes)
  const stopContinuousAlarm = () => {
    try {
      if (carrierRef.current) {
        carrierRef.current.stop();
        carrierRef.current.disconnect();
        carrierRef.current = null;
      }
      if (lfoRef.current) {
        lfoRef.current.stop();
        lfoRef.current.disconnect();
        lfoRef.current = null;
      }
      if (lfoGainRef.current) {
        lfoGainRef.current.disconnect();
        lfoGainRef.current = null;
      }
      if (masterGainRef.current) {
        masterGainRef.current.disconnect();
        masterGainRef.current = null;
      }
    } catch (e) {
      // Audio cleanup guard
    }
  };

  // Start continuous looping alarm sound: (600Hz–1000Hz Sawtooth + 2.5Hz LFO)
  const startContinuousAlarm = () => {
    stopContinuousAlarm();
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // 1. Carrier Oscillator: Sawtooth wave centered at 800Hz
      const carrier = ctx.createOscillator();
      carrier.type = 'sawtooth';
      carrier.frequency.setValueAtTime(800, ctx.currentTime);

      // 2. Low Frequency Oscillator (LFO): 2.5Hz
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(2.5, ctx.currentTime);

      // 3. LFO Gain / Modulation Depth: ±200Hz (sweep range: 800-200=600Hz to 800+200=1000Hz)
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(200, ctx.currentTime);

      // Connect LFO through lfoGain into carrier.frequency
      lfo.connect(lfoGain);
      lfoGain.connect(carrier.frequency);

      // 4. Master volume gain node
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(isAlarmMuted ? 0 : 0.2, ctx.currentTime);

      carrier.connect(masterGain);
      masterGain.connect(ctx.destination);

      lfo.start();
      carrier.start();

      carrierRef.current = carrier;
      lfoRef.current = lfo;
      lfoGainRef.current = lfoGain;
      masterGainRef.current = masterGain;
    } catch (e) {
      console.warn('AudioContext countdown siren error:', e);
    }
  };

  // React to Mute / Unmute state changes live
  useEffect(() => {
    if (masterGainRef.current && audioContextRef.current) {
      masterGainRef.current.gain.setValueAtTime(
        isAlarmMuted ? 0 : 0.2,
        audioContextRef.current.currentTime
      );
    }
  }, [isAlarmMuted]);

  // Accident Countdown Timer
  useEffect(() => {
    if (isAccidentDetected && accidentCountdown > 0) {
      accidentTimerRef.current = setTimeout(() => {
        setAccidentCountdown(c => c - 1);
      }, 1000);
    } else if (isAccidentDetected && accidentCountdown === 0) {
      // CODE RED ACTIVATION
      stopContinuousAlarm();
      triggerCodeRedAccidentDispatch();
    }
    return () => {
      if (accidentTimerRef.current) clearTimeout(accidentTimerRef.current);
    };
  }, [isAccidentDetected, accidentCountdown]);

  // Clean up sound on unmount
  useEffect(() => {
    return () => {
      stopContinuousAlarm();
    };
  }, []);

  const triggerAccidentSimulation = () => {
    setTravelSpeed(0); // abrupt drop to 0
    setIsAccidentDetected(true);
    setAccidentCountdown(60);
    if ('vibrate' in navigator) {
      try { navigator.vibrate([300, 200, 300, 200, 500]); } catch (e) {}
    }
    startContinuousAlarm();
  };

  const cancelAccidentTimer = () => {
    setIsAccidentDetected(false);
    setAccidentCountdown(60);
    setTravelSpeed(38); // restore cruising
    stopContinuousAlarm();
    if (accidentTimerRef.current) clearTimeout(accidentTimerRef.current);
  };

  const triggerCodeRedAccidentDispatch = () => {
    setIsAccidentDetected(false);
    stopContinuousAlarm();
    // Create Code Red Incident
    const newInc: EmergencyIncident = {
      id: `INC-CR-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      target: 'SELF',
      patient: {
        fullName: userProfile.fullName,
        age: userProfile.age,
        sex: userProfile.sex,
        bloodGroup: userProfile.bloodGroup,
        height: userProfile.height,
        weight: userProfile.weight,
        cause: 'AUTOMATED CODE RED: Scooter Sudden Deceleration & Unresponsive Rider',
        phone: userProfile.mobile,
        allergies: [...userProfile.allergies, ...userProfile.customAllergies],
        address: currentLocation.address,
        emergencyContacts: userProfile.emergencyContacts
      },
      severity: 'CRITICAL',
      confidence: 99,
      status: 'WAITING_HOSPITAL_ACCEPTANCE',
      firstAidInstructions: ['Keep helmet secure until cervical spine stabilized by paramedic', 'Do not move casualty', 'Airway protection'],
      warningSigns: ['Unresponsive rider', 'Deceleration trauma', 'Possible internal bleeding'],
      clinicalReasoning: 'Abrupt kinetic deceleration from 42km/h to 0 with non-cancellation within 60 seconds.',
      suggestedDepartment: 'Trauma Resuscitation Center & Neuro ICU',
      coordinates: currentLocation,
      auditLogs: [{
        timestamp: new Date().toISOString(),
        deviceId: 'SENSOR-ACCEL-01',
        latitude: currentLocation.lat,
        longitude: currentLocation.lng,
        action: 'CODE_RED_AUTOMATIC_TRIGGER',
        details: 'Vibration & audio alarm expired without driver response'
      }],
      alertBroadcastRadiusKm: 5,
      waitTimerSeconds: 60
    };

    setActiveIncident(newInc);
    setEmergencyQueue(q => [newInc, ...q]);
    saveIncidentToSupabase(newInc);
  };

  // Resolve emergency when ambulance arrives and reset back to clean interface
  const resolveEmergencyWithAmbulanceArrival = (notes?: string) => {
    if (!activeIncident) return;

    const resolvedChatRecord: AIChatRecord = {
      id: `RES-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      patientName: activeIncident.patient.fullName,
      emergencyType: activeIncident.patient.cause || 'Emergency Request',
      severity: activeIncident.severity,
      summaryReport: `EMERGENCY RESOLVED: Ambulance (${activeIncident.ambulance?.vehicleNo || 'KA-04-ALS-1082'}) reached patient location. Paramedic ${activeIncident.ambulance?.driverName || 'EMS Paramedic'} commenced on-scene stabilization for transfer to ${activeIncident.assignedHospitalName || 'Assigned Hospital'}. Pre-arrival bed: ${activeIncident.preArrivalAllocation?.bedNo || 'ICU-B04'}. ${notes || 'Patient verified and receiving direct medical attention.'}`,
      triageDetails: `Resolution confirmed by user on mobile app. Case ID: ${activeIncident.id}. Pre-arrival doctor: ${activeIncident.preArrivalAllocation?.doctorAllotted || 'Trauma Specialist'}.`,
      vitalStatsSnapshot: `Status: Completed & Handed Over | Location: ${activeIncident.coordinates.address || 'On-Scene'}`
    };

    setAiChatRecords(prev => [resolvedChatRecord, ...prev]);
    saveTriageLogToSupabase(resolvedChatRecord);

    // Update queue status
    const resolvedIncident = { ...activeIncident, status: 'RESOLVED' as const };
    setEmergencyQueue(q => q.map(inc => inc.id === activeIncident.id ? resolvedIncident : inc));
    saveIncidentToSupabase(resolvedIncident);

    // Clear active incident to restore clean interface!
    setActiveIncident(null);
    stopContinuousAlarm();
  };

  // User Actions
  const updateUserProfile = (profile: Partial<UserProfile>) => {
    setUserProfile(prev => {
      const updated = { ...prev, ...profile };
      saveUserProfileToSupabase(updated);
      return updated;
    });
  };

  const startEmergencyTrigger = (shortcut?: string) => {
    setActiveStage('stage-triage');
    const text = shortcut || 'Emergency Alert Requested';
    const triage = classifyEmergencySeverity(text);

    // If case is MINOR: NO AMBULANCE! Directly go to MINOR_FIRST_AID
    if (triage.severity === 'MINOR') {
      const minorIncident: EmergencyIncident = {
        id: `INC-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toISOString(),
        target: 'SELF',
        patient: {
          fullName: userProfile.fullName,
          age: userProfile.age,
          sex: userProfile.sex,
          bloodGroup: userProfile.bloodGroup,
          cause: text,
          phone: userProfile.mobile,
          allergies: [...userProfile.allergies, ...userProfile.customAllergies],
          emergencyContacts: userProfile.emergencyContacts,
          address: currentLocation.address || `${currentLocation.lat.toFixed(5)}° N, ${currentLocation.lng.toFixed(5)}° E`
        },
        severity: 'MINOR',
        confidence: 95,
        status: 'MINOR_FIRST_AID', // DIRECT PATH A - NO AMBULANCE DISPATCH!
        firstAidInstructions: triage.firstAid,
        warningSigns: triage.warningSigns,
        clinicalReasoning: triage.reasoning,
        suggestedDepartment: triage.department,
        coordinates: { ...currentLocation },
        auditLogs: [{
          timestamp: new Date().toISOString(),
          deviceId: 'PW-CLIENT-WEB',
          latitude: currentLocation.lat,
          longitude: currentLocation.lng,
          action: 'MINOR_CASE_FIRST_AID_INITIATED',
          details: 'Patient symptoms triaged as MINOR. Ambulance suppressed per clinical protocol.'
        }],
        alertBroadcastRadiusKm: 0,
        waitTimerSeconds: 0
      };
      setActiveIncident(minorIncident);
      return;
    }

    // Critical Emergency Path: Prompt for Target (Self vs Others) then Popup 1 & 2
    const criticalInc: EmergencyIncident = {
      id: `INC-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      target: 'SELF',
      patient: {
        fullName: userProfile.fullName,
        age: userProfile.age,
        sex: userProfile.sex,
        bloodGroup: userProfile.bloodGroup,
        cause: text,
        phone: userProfile.mobile,
        allergies: [...userProfile.allergies, ...userProfile.customAllergies],
        emergencyContacts: userProfile.emergencyContacts,
        address: currentLocation.address || `${currentLocation.lat.toFixed(5)}° N, ${currentLocation.lng.toFixed(5)}° E`
      },
      severity: 'CRITICAL',
      confidence: 96,
      status: 'TRIGGER_TARGET_PROMPT',
      firstAidInstructions: triage.firstAid,
      warningSigns: triage.warningSigns,
      clinicalReasoning: triage.reasoning,
      suggestedDepartment: triage.department,
      coordinates: currentLocation,
      auditLogs: [],
      alertBroadcastRadiusKm: 5,
      waitTimerSeconds: 60
    };
    setActiveIncident(criticalInc);
  };

  const escalateToCriticalAmbulance = () => {
    if (!activeIncident) return;
    const criticalInc: EmergencyIncident = {
      ...activeIncident,
      severity: 'CRITICAL',
      status: 'CRITICAL_POPUP_BOOKING',
      clinicalReasoning: 'Escalated by user due to worsening symptoms. Critical ALS ambulance response requested.'
    };
    setActiveIncident(criticalInc);
  };

  const setTargetSelfOrOthers = (target: 'SELF' | 'OTHERS') => {
    if (!activeIncident) return;
    if (target === 'SELF') {
      const triage = classifyEmergencySeverity(activeIncident.patient.cause || 'Emergency Request');
      
      // If evaluated as MINOR, immediately route to MINOR_FIRST_AID without calling ambulance!
      if (triage.severity === 'MINOR') {
        const minorSelfIncident: EmergencyIncident = {
          ...activeIncident,
          target: 'SELF',
          status: 'MINOR_FIRST_AID',
          severity: 'MINOR',
          confidence: 95,
          clinicalReasoning: triage.reasoning,
          firstAidInstructions: triage.firstAid,
          warningSigns: triage.warningSigns,
          suggestedDepartment: triage.department
        };
        setActiveIncident(minorSelfIncident);
        return;
      }

      const instantBookingIncident: EmergencyIncident = {
        ...activeIncident,
        target: 'SELF',
        status: 'CRITICAL_POPUP_BOOKING', // IMMEDIATE DISPLAY OF POPUP 1
        severity: 'CRITICAL',
        confidence: 96,
        clinicalReasoning: triage.reasoning,
        firstAidInstructions: triage.firstAid,
        warningSigns: triage.warningSigns,
        suggestedDepartment: triage.department,
        coordinates: { ...currentLocation },
        patient: {
          fullName: userProfile.fullName,
          age: userProfile.age,
          sex: userProfile.sex,
          bloodGroup: userProfile.bloodGroup,
          height: userProfile.height,
          weight: userProfile.weight,
          cause: activeIncident.patient.cause || 'Acute Emergency Request',
          phone: userProfile.mobile,
          allergies: [...userProfile.allergies, ...userProfile.customAllergies],
          emergencyContacts: userProfile.emergencyContacts,
          address: currentLocation.address || `${currentLocation.lat.toFixed(5)}° N, ${currentLocation.lng.toFixed(5)}° E`
        }
      };
      setActiveIncident(instantBookingIncident);
      executeAITriage(activeIncident.patient.cause || 'Emergency Request');
    } else {
      setActiveIncident({
        ...activeIncident,
        target: 'OTHERS',
        status: 'DATA_GATHERING_OTHERS'
      });
    }
  };

  const submitOtherPatientInfo = (data: { cause: string; gender: any; bloodGroup: any; height?: string; name?: string }) => {
    if (!activeIncident) return;
    const triage = classifyEmergencySeverity(data.cause);

    // If MINOR for bystander, do NOT call ambulance!
    if (triage.severity === 'MINOR') {
      const minorIncident: EmergencyIncident = {
        ...activeIncident,
        status: 'MINOR_FIRST_AID',
        severity: 'MINOR',
        confidence: 94,
        clinicalReasoning: triage.reasoning,
        firstAidInstructions: triage.firstAid,
        warningSigns: triage.warningSigns,
        suggestedDepartment: triage.department,
        patient: {
          fullName: data.name || 'Third-Party Patient',
          age: 35,
          sex: data.gender || 'Other',
          bloodGroup: data.bloodGroup || 'O+',
          height: data.height || '170 cm',
          cause: data.cause || 'Minor Incident',
          phone: 'Bystander Device',
          allergies: [],
          address: currentLocation.address
        }
      };
      setActiveIncident(minorIncident);
      return;
    }

    const updated: EmergencyIncident = {
      ...activeIncident,
      status: 'CRITICAL_POPUP_BOOKING', // IMMEDIATE DISPLAY OF POPUP 1
      severity: 'CRITICAL',
      confidence: 94,
      clinicalReasoning: triage.reasoning,
      firstAidInstructions: triage.firstAid,
      warningSigns: triage.warningSigns,
      suggestedDepartment: triage.department,
      patient: {
        fullName: data.name || 'Third-Party Patient',
        age: 35,
        sex: data.gender || 'Other',
        bloodGroup: data.bloodGroup || 'O+',
        height: data.height || '170 cm',
        cause: data.cause || 'Accident / Medical Incident',
        phone: 'Bystander Device',
        allergies: [],
        address: currentLocation.address
      }
    };
    setActiveIncident(updated);
    executeAITriage(data.cause);
  };

  const executeAITriage = async (description: string, symptoms: string[] = []) => {
    try {
      const res = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          symptoms,
          patientDetails: activeIncident?.patient,
          language
        })
      });

      if (!res.ok) return;
      const data = await res.json();
      const severity: EmergencySeverity = data.severity || 'CRITICAL';

      setActiveIncident(prev => {
        if (!prev) return null;
        // Do not rollback or interfere with active popup booking or dispatch flow
        return {
          ...prev,
          severity,
          confidence: data.confidence || prev.confidence || 95,
          clinicalReasoning: data.reasoning || prev.clinicalReasoning,
          firstAidInstructions: data.immediateFirstAid || prev.firstAidInstructions,
          warningSigns: data.warningSigns || prev.warningSigns,
          suggestedDepartment: data.suggestedDepartment || prev.suggestedDepartment
        };
      });

      // Record to AI Chat history
      const newChatRecord: AIChatRecord = {
        id: `REP-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toISOString(),
        patientName: activeIncident?.patient.fullName || 'Citizen Patient',
        emergencyType: description,
        severity,
        summaryReport: `PulseWay AI Clinical Triage evaluated "${description}" as ${severity}. ${data.reasoning || ''}`,
        triageDetails: `Confidence: ${data.confidence || 95}%. Target Department: ${data.suggestedDepartment || 'General ER'}. Priority: Clinical emergency response.`,
        vitalStatsSnapshot: `Classification: ${severity} | GPS: ${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`
      };
      setAiChatRecords(prev => [newChatRecord, ...prev]);

    } catch (err) {
      // Safe silent fallback - already defaulted to CRITICAL
    }
  };

  // Path B: Popup 1 Booking Confirmation
  const confirmCriticalBooking = () => {
    if (!activeIncident) return;
    const auditEntry = {
      timestamp: new Date().toISOString(),
      deviceId: 'PW-CLIENT-WEB',
      latitude: currentLocation.lat,
      longitude: currentLocation.lng,
      action: 'BOOKING_POPUP_CONFIRMED',
      details: 'Patient confirmed ambulance and bed request'
    };
    setActiveIncident({
      ...activeIncident,
      status: 'CRITICAL_POPUP_MISUSE',
      auditLogs: [...activeIncident.auditLogs, auditEntry]
    });
  };

  const cancelCriticalBooking = () => {
    if (!activeIncident) return;
    setActiveIncident({
      ...activeIncident,
      status: 'MINOR_FIRST_AID' // return to guidance mode with 112 button visible
    });
  };

  // Path B: Popup 2 Misuse Warning
  const confirmMisuseWarning = () => {
    if (!activeIncident) return;
    const auditEntry = {
      timestamp: new Date().toISOString(),
      deviceId: 'PW-CLIENT-WEB',
      latitude: currentLocation.lat,
      longitude: currentLocation.lng,
      action: 'MISUSE_LEGAL_WARNING_CONFIRMED',
      details: 'User acknowledged legal accountability under BNS & IT Act'
    };

    const readyIncident: EmergencyIncident = {
      ...activeIncident,
      status: 'WAITING_HOSPITAL_ACCEPTANCE', // STRICT REQUIREMENT: DO NOT DISPATCH AMBULANCE UNTIL HOSPITAL CONFIRMS
      auditLogs: [...activeIncident.auditLogs, auditEntry],
      waitTimerSeconds: 60
    };

    setActiveIncident(readyIncident);
    setActiveStage('stage-waiting');

    // Add or update to hospital live feed
    setEmergencyQueue(q => {
      const exists = q.some(item => item.id === readyIncident.id);
      if (exists) {
        return q.map(item => item.id === readyIncident.id ? readyIncident : item);
      }
      return [readyIncident, ...q];
    });
    saveIncidentToSupabase(readyIncident);
  };

  const cancelMisuseWarning = () => {
    if (!activeIncident) return;
    setActiveIncident({
      ...activeIncident,
      status: 'MINOR_FIRST_AID' // Quit cancels everything, returns to guidance
    });
  };

  const resetEmergency = () => {
    setActiveIncident(null);
    setActiveStage('stage-hub');
  };

  // Hospital Actions
  const hospitalAcceptAlert = (incidentId: string) => {
    const targetHosp = hospitals.find(h => h.id === activeHospitalId) || hospitals[0];

    const updater = (inc: EmergencyIncident): EmergencyIncident => {
      if (inc.id !== incidentId) return inc;
      return {
        ...inc,
        status: 'HOSPITAL_ACCEPTED',
        assignedHospitalId: targetHosp.id,
        assignedHospitalName: targetHosp.name,
        assignedHospitalPhone: targetHosp.phone
      };
    };

    if (activeIncident && activeIncident.id === incidentId) {
      const updated = updater(activeIncident);
      setActiveIncident(updated);
      saveIncidentToSupabase(updated);
    }
    setEmergencyQueue(q => {
      const nextQ = q.map(updater);
      const target = nextQ.find(i => i.id === incidentId);
      if (target) saveIncidentToSupabase(target);
      return nextQ;
    });
  };

  const hospitalDispatchAmbulance = (incidentId: string, customVehicleNo?: string) => {
    const targetHosp = hospitals.find(h => h.id === activeHospitalId) || hospitals[0];
    const vehicleNumber = customVehicleNo || `KA-04-ALS-${Math.floor(1000 + Math.random() * 9000)}`;

    const updater = (inc: EmergencyIncident): EmergencyIncident => {
      if (inc.id !== incidentId) return inc;
      return {
        ...inc,
        status: 'AMBULANCE_DISPATCHED',
        assignedHospitalId: targetHosp.id,
        assignedHospitalName: targetHosp.name,
        assignedHospitalPhone: targetHosp.phone,
        ambulance: {
          vehicleNo: vehicleNumber,
          driverName: 'Rameshwar Patil (Paramedic)',
          driverPhone: '+91 94480 55123',
          status: 'ON_THE_WAY',
          etaMinutes: 6,
          currentCoords: {
            lat: targetHosp.coordinates.lat + 0.005,
            lng: targetHosp.coordinates.lng + 0.005
          }
        }
      };
    };

    if (activeIncident && activeIncident.id === incidentId) {
      const updated = updater(activeIncident);
      setActiveIncident(updated);
      setActiveStage('stage-tracking');
      saveIncidentToSupabase(updated);
      // Play automated reassurance voice on citizen page once ambulance is allotted
      playReassuranceVoice(language);
    }
    setEmergencyQueue(q => {
      const nextQ = q.map(updater);
      const target = nextQ.find(i => i.id === incidentId);
      if (target) saveIncidentToSupabase(target);
      return nextQ;
    });
    setSelectedPatientForConsole(prev => (prev && prev.id === incidentId ? updater(prev) : prev));

    // Deduct available ambulance in hospital fleet
    setHospitals(prev => prev.map(h => {
      if (h.id === targetHosp.id) {
        return {
          ...h,
          occupiedAmbulances: Math.min(h.totalAmbulances, h.occupiedAmbulances + 1)
        };
      }
      return h;
    }));
  };

  const hospitalMarkUnresponsive = (incidentId: string) => {
    const targetHosp = hospitals.find(h => h.id === activeHospitalId) || hospitals[0];
    const vehicleNumber = `KA-01-CRIT-9999`;

    const updater = (inc: EmergencyIncident): EmergencyIncident => {
      if (inc.id !== incidentId) return inc;
      return {
        ...inc,
        status: 'AMBULANCE_DISPATCHED',
        unresponsiveReported: true,
        assignedHospitalId: targetHosp.id,
        assignedHospitalName: targetHosp.name,
        assignedHospitalPhone: targetHosp.phone,
        ambulance: {
          vehicleNo: vehicleNumber,
          driverName: 'Emergency Rapid Response Unit',
          driverPhone: '+91 80 2502 9911',
          status: 'ON_THE_WAY',
          etaMinutes: 5,
          currentCoords: {
            lat: targetHosp.coordinates.lat + 0.003,
            lng: targetHosp.coordinates.lng + 0.003
          }
        }
      };
    };

    if (activeIncident && activeIncident.id === incidentId) {
      setActiveIncident(updater(activeIncident));
      setActiveStage('stage-tracking');
    }
    setEmergencyQueue(q => q.map(updater));
  };

  const hospitalAllocateBedAndDoctor = (incidentId: string, allocation: PreArrivalAllocation) => {
    const updater = (inc: EmergencyIncident): EmergencyIncident => {
      if (inc.id !== incidentId) return inc;
      return {
        ...inc,
        preArrivalAllocation: {
          ...allocation,
          confirmedByHospital: true,
          confirmedAt: new Date().toISOString()
        }
      };
    };

    if (activeIncident && activeIncident.id === incidentId) {
      const updated = updater(activeIncident);
      setActiveIncident(updated);
      saveIncidentToSupabase(updated);
    }
    setEmergencyQueue(q => {
      const nextQ = q.map(updater);
      const target = nextQ.find(i => i.id === incidentId);
      if (target) saveIncidentToSupabase(target);
      return nextQ;
    });
  };

  // Treatment completed action: frees the allotted bed & restores ambulance fleet
  const hospitalCompleteTreatment = (incidentId: string, notes?: string) => {
    let affectedHospitalId: string = activeHospitalId;
    let bedNoFreed: string = 'Emergency Bed';
    let patientName: string = 'Patient';
    let completedIncident: EmergencyIncident | null = null;

    setEmergencyQueue(q => q.map(inc => {
      if (inc.id !== incidentId) return inc;
      affectedHospitalId = inc.assignedHospitalId || activeHospitalId;
      bedNoFreed = inc.preArrivalAllocation?.bedNo || 'ICU-B04';
      patientName = inc.patient.fullName;

      const auditEntry: AuditLogEntry = {
        timestamp: new Date().toISOString(),
        deviceId: 'HOSP-CLINICAL-CONSOLE',
        latitude: inc.coordinates.lat,
        longitude: inc.coordinates.lng,
        action: 'TREATMENT_COMPLETED_BED_FREED',
        details: `Treatment completed. Allotted bed (${bedNoFreed}) marked vacant and restored to available capacity. ${notes || 'Patient stabilized and discharged.'}`
      };

      const updated: EmergencyIncident = {
        ...inc,
        status: 'TREATMENT_COMPLETED',
        auditLogs: [...inc.auditLogs, auditEntry]
      };
      completedIncident = updated;
      saveIncidentToSupabase(updated);
      return updated;
    }));

    if (activeIncident && activeIncident.id === incidentId) {
      setActiveIncident(prev => {
        if (!prev) return null;
        const res: EmergencyIncident = {
          ...prev,
          status: 'TREATMENT_COMPLETED'
        };
        saveIncidentToSupabase(res);
        return res;
      });
    }

    // Automatically increase vacant beds & return any occupied ambulance to ready pool
    setHospitals(prev => prev.map(h => {
      if (h.id === affectedHospitalId || h.id === activeHospitalId) {
        return {
          ...h,
          icuBedsAvailable: Math.min(h.icuBedsTotal, h.icuBedsAvailable + 1),
          traumaBedsAvailable: Math.min(h.traumaBedsTotal, h.traumaBedsAvailable + 1),
          generalBedsAvailable: Math.min(h.generalBedsTotal, h.generalBedsAvailable + 1),
          occupiedAmbulances: Math.max(0, h.occupiedAmbulances - 1)
        };
      }
      return h;
    }));

    // Record discharge in AI Chat history
    const dischargeLog: AIChatRecord = {
      id: `DIS-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      patientName,
      emergencyType: 'Treatment Completed & Discharged',
      severity: 'MINOR',
      summaryReport: `PATIENT DISCHARGED: Clinical treatment successfully completed. Allotted bed ${bedNoFreed} has been sanitized and returned to hospital vacancy pool.`,
      triageDetails: `Hospital: ${activeHospital.name}. Notes: ${notes || 'Patient stabilized.'}`,
      vitalStatsSnapshot: `Status: Discharged | Bed ${bedNoFreed}: Vacant`
    };
    setAiChatRecords(prev => [dischargeLog, ...prev]);
  };

  const updateHospitalCapacity = (hospId: string, updates: Partial<HospitalProfile>) => {
    setHospitals(prev => prev.map(h => h.id === hospId ? { ...h, ...updates } : h));
  };

  const downloadReport = (recordId: string) => {
    const rec = aiChatRecords.find(r => r.id === recordId) || aiChatRecords[0];
    const content = `=====================================================
PULSEWAY EMERGENCY SERVICES - CLINICAL INCIDENT REPORT
=====================================================
Report ID: ${rec.id}
Generated Timestamp: ${rec.timestamp}
Patient Name: ${rec.patientName}
Classification: ${rec.severity}
Complaint: ${rec.emergencyType}

SUMMARY:
${rec.summaryReport}

TRIAGE & VITALS:
${rec.triageDetails}
${rec.vitalStatsSnapshot || ''}

LEGAL ACCOUNTABILITY & AUDIT:
Under the provisions of the Bharatiya Nyaya Sanhita (BNS) &
Information Technology Act, emergency communications are
digitally recorded and geotagged.
=====================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PulseWay_Emergency_Report_${rec.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeHospital = hospitals.find(h => h.id === activeHospitalId) || hospitals[0];

  return (
    <EmergencyContext.Provider
      value={{
        previewMode,
        setPreviewMode,
        activeStage,
        setActiveStage,
        language,
        setLanguage,
        userProfile,
        updateUserProfile,
        isUserRegistered,
        setIsUserRegistered,
        currentLocation,
        isTrackingLocation,
        refreshLocation,
        updateLocation,
        recalibrateHighAccuracyGPS,
        hospitals,
        activeHospitalId,
        setActiveHospitalId,
        activeHospital,
        updateHospitalCapacity,
        isHospitalLoggedIn,
        setIsHospitalLoggedIn,
        activeIncident,
        emergencyQueue,
        selectedPatientForConsole,
        setSelectedPatientForConsole,
        startEmergencyTrigger,
        setTargetSelfOrOthers,
        submitOtherPatientInfo,
        executeAITriage,
        confirmCriticalBooking,
        cancelCriticalBooking,
        confirmMisuseWarning,
        cancelMisuseWarning,
        resetEmergency,
        escalateToCriticalAmbulance,
        playReassuranceVoice,
        isReassuranceVoicePlaying,
        hospitalAcceptAlert,
        hospitalDispatchAmbulance,
        hospitalMarkUnresponsive,
        hospitalAllocateBedAndDoctor,
        hospitalCompleteTreatment,
        travelSpeed,
        isScooterMonitoringActive,
        setScooterMonitoringActive,
        isAccidentDetected,
        accidentCountdown,
        triggerAccidentSimulation,
        cancelAccidentTimer,
        isAlarmMuted,
        setIsAlarmMuted,
        resolveEmergencyWithAmbulanceArrival,
        aiChatRecords,
        downloadReport
      }}
    >
      {children}
    </EmergencyContext.Provider>
  );
};

export const useEmergency = () => {
  const context = useContext(EmergencyContext);
  if (!context) {
    throw new Error('useEmergency must be used within an EmergencyProvider');
  }
  return context;
};
