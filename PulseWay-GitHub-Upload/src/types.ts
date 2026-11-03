export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type Sex = 'Male' | 'Female' | 'Other';

export interface EmergencyContact {
  id: string;
  fullName: string;
  mobile: string;
  relationship: string;
  priority: number;
}

export interface UserProfile {
  fullName: string;
  dob: string; // DD/MM/YYYY
  mobile: string;
  email: string;
  age: number;
  sex: Sex;
  height: string; // e.g. "175 cm" or "5'9\""
  weight: string; // e.g. "72 kg"
  bloodGroup: BloodGroup;
  allergies: string[];
  customAllergies: string[];
  emergencyContacts: EmergencyContact[];
  permanentAddress: string;
  gpsConsentConfirmed: boolean;
  gpsConsentTimestamp?: string;
  primaryHospitalPreference?: string;
}

export type EmergencySeverity = 'CRITICAL' | 'MINOR';

export type IncidentStatus = 
  | 'IDLE'
  | 'TRIGGER_TARGET_PROMPT' // Self vs Others
  | 'DATA_GATHERING_OTHERS'
  | 'AI_TRIAGING'
  | 'MINOR_FIRST_AID' // Path A
  | 'CRITICAL_POPUP_BOOKING' // Path B Popup 1
  | 'CRITICAL_POPUP_MISUSE' // Path B Popup 2
  | 'WAITING_HOSPITAL_ACCEPTANCE' // Looking/waiting for the response from nearest hospital
  | 'HOSPITAL_ACCEPTED'
  | 'AMBULANCE_DISPATCHED'
  | 'AMBULANCE_ARRIVED'
  | 'EN_ROUTE_HOSPITAL'
  | 'TREATMENT_COMPLETED'
  | 'RESOLVED';

export interface AuditLogEntry {
  timestamp: string;
  deviceId: string;
  latitude: number;
  longitude: number;
  action: string;
  details: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
  address?: string;
  accuracyMeters?: number;
  landmark?: string;
}

export interface AmbulanceDetails {
  vehicleNo: string;
  driverName: string;
  driverPhone: string;
  status: 'DISPATCHED' | 'ON_THE_WAY' | 'ARRIVED' | 'EN_ROUTE_HOSPITAL';
  etaMinutes: number;
  currentCoords: Coordinates;
}

export interface PreArrivalAllocation {
  bedNo: string;
  floorNo: string;
  roomNo: string;
  doctorAllotted: string;
  department: string;
  confirmedByHospital: boolean;
  confirmedAt?: string;
}

export interface EmergencyIncident {
  id: string;
  timestamp: string;
  target: 'SELF' | 'OTHERS';
  patient: {
    fullName: string;
    age: number;
    sex: Sex;
    bloodGroup: BloodGroup;
    height?: string;
    weight?: string;
    allergies?: string[];
    cause: string;
    phone: string;
    emergencyContacts?: EmergencyContact[];
    address?: string;
  };
  severity: EmergencySeverity;
  confidence: number;
  status: IncidentStatus;
  firstAidInstructions: string[];
  warningSigns: string[];
  clinicalReasoning: string;
  suggestedDepartment: string;
  coordinates: Coordinates;
  assignedHospitalId?: string;
  assignedHospitalName?: string;
  assignedHospitalPhone?: string;
  ambulance?: AmbulanceDetails;
  preArrivalAllocation?: PreArrivalAllocation;
  auditLogs: AuditLogEntry[];
  unresponsiveReported?: boolean;
  alertBroadcastRadiusKm: number;
  waitTimerSeconds: number;
}

export interface HospitalFacility {
  id: string;
  name: string;
  enabled: boolean;
}

export interface HospitalProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  type: 'Private' | 'Government';
  avatarUrl: string;
  facilities: string[];
  totalAmbulances: number;
  occupiedAmbulances: number;
  icuBedsTotal: number;
  icuBedsAvailable: number;
  generalBedsTotal: number;
  generalBedsAvailable: number;
  traumaBedsTotal: number;
  traumaBedsAvailable: number;
  avgResponseTimeMin: number;
  isOnline: boolean;
  coordinates: Coordinates;
}

export interface SurvivalGuideEmergency {
  id: string;
  title: string;
  kannadaTitle: string;
  hindiTitle: string;
  category: string;
  aloneInstructions: string[];
  assistedInstructions: string[];
  emergencyMedicines: string[];
  bestPractices: string[];
  dangerSigns: string[];
}

export interface AIChatRecord {
  id: string;
  timestamp: string;
  patientName: string;
  emergencyType: string;
  severity: EmergencySeverity;
  summaryReport: string;
  triageDetails: string;
  vitalStatsSnapshot?: string;
}
