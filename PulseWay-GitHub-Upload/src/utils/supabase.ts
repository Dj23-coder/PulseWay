import { createClient } from '@supabase/supabase-js';
import { EmergencyIncident, AIChatRecord, UserProfile, HospitalProfile, BloodGroup, Sex } from '../types';

const supabaseUrl = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || 
  process.env.SUPABASE_URL || 
  'https://vganzlzsbvtdzfuwcnqp.supabase.co';

const supabaseAnonKey = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || 
  process.env.SUPABASE_ANON_KEY || 
  'sb_publishable_c248BEc5ERPeXhwqaiw5ew_KpKA3EAR';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================================
// CITIZEN AUTHENTICATION & PRIVATE MEDICAL PROFILE STORAGE
// Each citizen's login and medical records are stored separately and kept private.
// ============================================================================

/**
 * Register a new citizen account in Supabase
 */
export async function registerCitizenAccount(
  profile: UserProfile, 
  password = 'User@123'
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('citizen_accounts')
      .upsert({
        mobile: profile.mobile.trim(),
        email: profile.email.trim().toLowerCase(),
        password: password,
        full_name: profile.fullName.trim(),
        dob: profile.dob,
        age: profile.age,
        sex: profile.sex,
        height: profile.height,
        weight: profile.weight,
        blood_group: profile.bloodGroup,
        allergies: profile.allergies,
        custom_allergies: profile.customAllergies,
        emergency_contacts: profile.emergencyContacts,
        permanent_address: profile.permanentAddress,
        gps_consent_confirmed: profile.gpsConsentConfirmed,
        gps_consent_timestamp: profile.gpsConsentTimestamp || new Date().toISOString(),
        primary_hospital_preference: profile.primaryHospitalPreference || 'Nearest Emergency Trauma Hub',
        updated_at: new Date().toISOString()
      }, { onConflict: 'mobile' })
      .select()
      .single();

    if (error) {
      console.warn('Supabase citizen register note:', error.message);
      return { success: false, error: error.message };
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('pulseway_citizen_session', JSON.stringify({
        mobile: profile.mobile,
        fullName: profile.fullName,
        timestamp: Date.now()
      }));
    }

    return { success: true, data };
  } catch (err: any) {
    console.warn('Supabase offline or table pending creation:', err);
    return { success: false, error: err?.message || 'Network error' };
  }
}

/**
 * Citizen Login - Verify mobile & password from Supabase
 */
export async function loginCitizenAccount(
  mobile: string, 
  password = 'User@123'
): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
  try {
    const cleanMobile = mobile.trim();
    const { data, error } = await supabase
      .from('citizen_accounts')
      .select('*')
      .eq('mobile', cleanMobile)
      .maybeSingle();

    if (error) {
      console.warn('Citizen login query note:', error.message);
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: 'No citizen account found with this mobile number. Please register.' };
    }

    if (data.password && data.password !== password) {
      return { success: false, error: 'Incorrect password. Please verify and try again.' };
    }

    const profile: UserProfile = {
      fullName: data.full_name,
      dob: data.dob,
      mobile: data.mobile,
      email: data.email || '',
      age: Number(data.age) || 28,
      sex: (data.sex as Sex) || 'Male',
      height: data.height || '175 cm',
      weight: data.weight || '70 kg',
      bloodGroup: (data.blood_group as BloodGroup) || 'O+',
      allergies: Array.isArray(data.allergies) ? data.allergies : [],
      customAllergies: Array.isArray(data.custom_allergies) ? data.custom_allergies : [],
      emergencyContacts: Array.isArray(data.emergency_contacts) ? data.emergency_contacts : [],
      permanentAddress: data.permanent_address || '',
      gpsConsentConfirmed: Boolean(data.gps_consent_confirmed),
      gpsConsentTimestamp: data.gps_consent_timestamp,
      primaryHospitalPreference: data.primary_hospital_preference
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('pulseway_citizen_session', JSON.stringify({
        mobile: profile.mobile,
        fullName: profile.fullName,
        timestamp: Date.now()
      }));
    }

    return { success: true, profile };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network connection failed' };
  }
}

/**
 * Fetch a single citizen's medical profile
 */
export async function getCitizenProfile(mobile: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('citizen_accounts')
      .select('*')
      .eq('mobile', mobile.trim())
      .maybeSingle();

    if (error || !data) return null;

    return {
      fullName: data.full_name,
      dob: data.dob,
      mobile: data.mobile,
      email: data.email || '',
      age: Number(data.age) || 28,
      sex: (data.sex as Sex) || 'Male',
      height: data.height || '',
      weight: data.weight || '',
      bloodGroup: (data.blood_group as BloodGroup) || 'O+',
      allergies: Array.isArray(data.allergies) ? data.allergies : [],
      customAllergies: Array.isArray(data.custom_allergies) ? data.custom_allergies : [],
      emergencyContacts: Array.isArray(data.emergency_contacts) ? data.emergency_contacts : [],
      permanentAddress: data.permanent_address || '',
      gpsConsentConfirmed: Boolean(data.gps_consent_confirmed),
      gpsConsentTimestamp: data.gps_consent_timestamp,
      primaryHospitalPreference: data.primary_hospital_preference
    };
  } catch (e) {
    return null;
  }
}

/**
 * Update citizen medical profile in Supabase
 */
export async function saveUserProfileToSupabase(profile: UserProfile) {
  try {
    const { error } = await supabase
      .from('citizen_accounts')
      .upsert({
        mobile: profile.mobile,
        full_name: profile.fullName,
        dob: profile.dob,
        age: profile.age,
        sex: profile.sex,
        height: profile.height,
        weight: profile.weight,
        blood_group: profile.bloodGroup,
        allergies: profile.allergies,
        custom_allergies: profile.customAllergies,
        emergency_contacts: profile.emergencyContacts,
        permanent_address: profile.permanentAddress,
        gps_consent_confirmed: profile.gpsConsentConfirmed,
        gps_consent_timestamp: profile.gpsConsentTimestamp || new Date().toISOString(),
        primary_hospital_preference: profile.primaryHospitalPreference,
        updated_at: new Date().toISOString()
      }, { onConflict: 'mobile' });

    if (error) {
      console.warn('Supabase profile save note:', error.message);
    }
  } catch (e) {
    // Fallback gracefully
  }
}

// ============================================================================
// HOSPITAL AUTHENTICATION & INFRASTRUCTURE STORAGE
// Hospitals login separately with hospital code/email and manage ER beds & fleet.
// ============================================================================

/**
 * Hospital Login - Verify hospital code / email & password from Supabase
 */
export async function loginHospitalAccount(
  identifier: string, 
  password = 'Hospital@123'
): Promise<{ success: boolean; hospital?: any; error?: string }> {
  try {
    const cleanId = identifier.trim();
    const { data, error } = await supabase
      .from('hospital_accounts')
      .select('*')
      .or(`hospital_code.eq.${cleanId},email.ilike.${cleanId}`)
      .maybeSingle();

    if (error) {
      console.warn('Hospital login query note:', error.message);
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: 'Hospital not registered with this Hospital Code or Email.' };
    }

    if (data.password && data.password !== password) {
      return { success: false, error: 'Invalid hospital security credentials.' };
    }

    return { success: true, hospital: data };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Hospital authentication service unreachable' };
  }
}

/**
 * Register or update hospital infrastructure details in Supabase
 */
export async function registerHospitalAccount(
  hospital: Partial<HospitalProfile> & { hospitalCode: string; password?: string; officerName?: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('hospital_accounts')
      .upsert({
        id: hospital.id || `hosp-${Date.now().toString().slice(-4)}`,
        hospital_code: hospital.hospitalCode,
        name: hospital.name || 'Emergency Hospital',
        email: hospital.email || 'emergency@hospital.org',
        password: hospital.password || 'Hospital@123',
        phone: hospital.phone || '+91 80 2500 0000',
        officer_name: hospital.officerName || 'Chief Medical Officer',
        address: hospital.address || 'Emergency Response Hub',
        type: hospital.type || 'Private',
        facilities: hospital.facilities || [],
        total_ambulances: hospital.totalAmbulances || 10,
        icu_beds_available: hospital.icuBedsAvailable || 5,
        trauma_beds_available: hospital.traumaBedsAvailable || 4,
        general_beds_available: hospital.generalBedsAvailable || 20,
        latitude: hospital.coordinates?.lat || 12.9716,
        longitude: hospital.coordinates?.lng || 77.5946,
        updated_at: new Date().toISOString()
      }, { onConflict: 'hospital_code' });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error' };
  }
}

/**
 * Fetch all registered hospitals from Supabase
 */
export async function fetchHospitalsFromSupabase(): Promise<HospitalProfile[]> {
  try {
    const { data, error } = await supabase
      .from('hospital_accounts')
      .select('*')
      .order('name');

    if (error || !data || data.length === 0) return [];

    return data.map((row: any) => ({
      id: row.id,
      name: row.name,
      phone: row.phone,
      email: row.email,
      address: row.address,
      type: row.type || 'Private',
      avatarUrl: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=300',
      facilities: Array.isArray(row.facilities) ? row.facilities : [],
      totalAmbulances: Number(row.total_ambulances) || 12,
      occupiedAmbulances: 2,
      icuBedsTotal: 15,
      icuBedsAvailable: Number(row.icu_beds_available) || 8,
      generalBedsTotal: 40,
      generalBedsAvailable: Number(row.general_beds_available) || 24,
      traumaBedsTotal: 10,
      traumaBedsAvailable: Number(row.trauma_beds_available) || 6,
      avgResponseTimeMin: 7,
      isOnline: true,
      coordinates: {
        lat: Number(row.latitude) || 12.9716,
        lng: Number(row.longitude) || 77.5946,
        address: row.address
      }
    }));
  } catch (e) {
    return [];
  }
}

/**
 * Update hospital live bed capacity in Supabase
 */
export async function updateHospitalCapacityInSupabase(
  hospitalId: string, 
  updates: Partial<HospitalProfile>
) {
  try {
    const payload: any = { updated_at: new Date().toISOString() };
    if (updates.name) payload.name = updates.name;
    if (updates.phone) payload.phone = updates.phone;
    if (updates.email) payload.email = updates.email;
    if (updates.address) payload.address = updates.address;
    if (updates.totalAmbulances !== undefined) payload.total_ambulances = updates.totalAmbulances;
    if (updates.icuBedsAvailable !== undefined) payload.icu_beds_available = updates.icuBedsAvailable;
    if (updates.traumaBedsAvailable !== undefined) payload.trauma_beds_available = updates.traumaBedsAvailable;
    if (updates.generalBedsAvailable !== undefined) payload.general_beds_available = updates.generalBedsAvailable;
    if (updates.facilities) payload.facilities = updates.facilities;

    await supabase
      .from('hospital_accounts')
      .update(payload)
      .eq('id', hospitalId);
  } catch (e) {
    // Non-blocking fallback
  }
}

// ============================================================================
// EMERGENCY INCIDENTS LIFECYCLE COORDINATION
// ============================================================================

/**
 * Persist an active emergency incident to Supabase in real-time
 */
export async function saveIncidentToSupabase(incident: EmergencyIncident, citizenMobile?: string) {
  try {
    const { data, error } = await supabase
      .from('emergency_incidents')
      .upsert({
        id: incident.id,
        citizen_mobile: citizenMobile || incident.patient?.phone || '',
        timestamp: incident.timestamp,
        status: incident.status,
        severity: incident.severity,
        target: incident.target,
        patient_name: incident.patient.fullName,
        patient_age: incident.patient.age,
        patient_sex: incident.patient.sex,
        patient_blood: incident.patient.bloodGroup,
        patient_cause: incident.patient.cause,
        patient_phone: incident.patient.phone,
        latitude: incident.coordinates.lat,
        longitude: incident.coordinates.lng,
        address: incident.coordinates.address,
        assigned_hospital_id: incident.assignedHospitalId,
        assigned_hospital_name: incident.assignedHospitalName,
        ambulance_vehicle_no: incident.ambulance?.vehicleNo,
        ambulance_driver_name: incident.ambulance?.driverName,
        ambulance_driver_phone: incident.ambulance?.driverPhone,
        ambulance_eta_minutes: incident.ambulance?.etaMinutes,
        pre_arrival_bed: incident.preArrivalAllocation?.bedNo,
        pre_arrival_doctor: incident.preArrivalAllocation?.doctorAllotted,
        pre_arrival_dept: incident.preArrivalAllocation?.department,
        raw_incident: incident,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase incident upsert note:', error.message);
    }
    return { data, error };
  } catch (err) {
    console.warn('Supabase offline or table pending creation:', err);
    return { error: err };
  }
}

/**
 * Fetch incidents from Supabase
 * If hospitalId is passed, fetches incidents assigned to that hospital or awaiting acceptance.
 */
export async function fetchIncidentsFromSupabase(hospitalId?: string): Promise<EmergencyIncident[]> {
  try {
    let query = supabase
      .from('emergency_incidents')
      .select('*')
      .order('timestamp', { ascending: false });

    if (hospitalId) {
      query = query.or(`assigned_hospital_id.eq.${hospitalId},status.eq.WAITING_HOSPITAL_ACCEPTANCE`);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    return data.map((row: any) => row.raw_incident || ({
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
      assignedHospitalName: row.assigned_hospital_name,
      ambulance: row.ambulance_vehicle_no ? {
        vehicleNo: row.ambulance_vehicle_no,
        driverName: row.ambulance_driver_name,
        driverPhone: row.ambulance_driver_phone,
        etaMinutes: row.ambulance_eta_minutes,
        currentCoords: { lat: Number(row.latitude), lng: Number(row.longitude) }
      } : undefined,
      preArrivalAllocation: row.pre_arrival_bed ? {
        bedNo: row.pre_arrival_bed,
        doctorAllotted: row.pre_arrival_doctor,
        department: row.pre_arrival_dept,
        floorNo: '3',
        roomNo: '308-A',
        confirmedByHospital: true,
        confirmedAt: row.updated_at
      } : undefined
    }));
  } catch (err) {
    return [];
  }
}

/**
 * Fetch ONLY the incidents belonging to a specific citizen (Strict Privacy)
 */
export async function fetchCitizenIncidents(citizenMobile: string): Promise<EmergencyIncident[]> {
  try {
    const { data, error } = await supabase
      .from('emergency_incidents')
      .select('*')
      .eq('citizen_mobile', citizenMobile.trim())
      .order('timestamp', { ascending: false });

    if (error || !data) return [];

    return data.map((row: any) => row.raw_incident || ({
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
    }));
  } catch (err) {
    return [];
  }
}

/**
 * Persist AI clinical triage consultation logs
 */
export async function saveTriageLogToSupabase(record: AIChatRecord, citizenMobile?: string) {
  try {
    const { error } = await supabase
      .from('ai_triage_logs')
      .upsert({
        id: record.id,
        citizen_mobile: citizenMobile || '',
        timestamp: record.timestamp,
        patient_name: record.patientName,
        emergency_type: record.emergencyType,
        severity: record.severity,
        summary_report: record.summaryReport,
        triage_details: record.triageDetails,
        vital_stats_snapshot: record.vitalStatsSnapshot
      }, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase triage log note:', error.message);
    }
  } catch (e) {
    // Non-blocking fallback
  }
}

/**
 * Fetch clinical triage logs for a specific citizen
 */
export async function fetchCitizenTriageLogs(citizenMobile: string): Promise<AIChatRecord[]> {
  try {
    const { data, error } = await supabase
      .from('ai_triage_logs')
      .select('*')
      .eq('citizen_mobile', citizenMobile.trim())
      .order('timestamp', { ascending: false });

    if (error || !data) return [];

    return data.map((row: any) => ({
      id: row.id,
      timestamp: row.timestamp,
      patientName: row.patient_name,
      emergencyType: row.emergency_type,
      severity: row.severity,
      summaryReport: row.summary_report,
      triageDetails: row.triage_details,
      vitalStatsSnapshot: row.vital_stats_snapshot
    }));
  } catch (e) {
    return [];
  }
}
