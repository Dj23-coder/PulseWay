export type SupportedLanguage = 'en' | 'kn' | 'hi';

export interface TranslationDictionary {
  // Global & Navigation
  appName: string;
  splitView: string;
  citizenApp: string;
  hospitalCenter: string;
  antiAbuseWarning: string;
  liveGps: string;
  accuracy: string;
  recalibrateGps: string;
  menu: string;

  // Language selector
  selectLanguage: string;
  langEn: string;
  langKn: string;
  langHi: string;

  // Citizen Registration / Login
  registrationTitle: string;
  registrationSubtitle: string;
  personalBiometrics: string;
  fullName: string;
  fullNamePlaceholder: string;
  age: string;
  dob: string;
  gender: string;
  genderMale: string;
  genderFemale: string;
  genderOther: string;
  bloodGroup: string;
  weight: string;
  height: string;
  medicalHistory: string;
  allergiesLabel: string;
  customAllergiesPlaceholder: string;
  emergencyContacts: string;
  primaryContact: string;
  secondaryContact: string;
  contactName: string;
  contactPhone: string;
  contactRelation: string;
  residentialAddress: string;
  addressPlaceholder: string;
  securityNotice: string;
  completeRegistrationBtn: string;
  saveChanges: string;

  // Citizen App Emergency Trigger & Shortcuts
  sosPrompt: string;
  chatPlaceholder: string;
  targetSelectionTitle: string;
  targetSelf: string;
  targetOthers: string;
  targetSelfDesc: string;
  targetOthersDesc: string;
  bystanderIntakeTitle: string;
  emergencyCauseLabel: string;
  emergencyCausePlaceholder: string;
  runAITriageBtn: string;

  // Shortcuts
  shortcutCardiac: string;
  shortcutCardiacDesc: string;
  shortcutTrauma: string;
  shortcutTraumaDesc: string;
  shortcutFire: string;
  shortcutFireDesc: string;
  shortcutWomen: string;
  shortcutWomenDesc: string;
  shortcutPoison: string;
  shortcutPoisonDesc: string;

  // Minor Case Guidance (Path A) - NO AMBULANCE
  minorEmergencyTitle: string;
  minorNoAmbulanceNotice: string;
  firstAidStepsTitle: string;
  closeGuidanceBtn: string;
  escalateToAmbulanceBtn: string;

  // Critical Booking Popups (Path B)
  criticalConfirmationTitle: string;
  criticalConfirmationDesc: string;
  confirmNextBtn: string;
  cancelFirstAidOnlyBtn: string;
  legalWarningTitle: string;
  legalWarningDesc: string;
  legalAuditNotice: string;
  confirmAmbulanceBtn: string;
  quitAbortBtn: string;

  // Hospital Waiting & Dispatch States
  waitingHospitalTitle: string;
  waitingHospitalDesc: string;
  hospitalAcceptedTitle: string;
  hospitalAcceptedDesc: string;
  broadcastRadius: string;

  // Dispatched & Live Tracking
  ambulanceDispatchedTitle: string;
  etaRemaining: string;
  driverName: string;
  callDriver: string;
  assignedHospital: string;
  callHospital: string;
  bedReservedSync: string;
  bedNo: string;
  doctorAllotted: string;
  ambulanceReachedBtn: string;
  copyTrackingLink: string;
  linkCopied: string;

  // Automated Reassurance Voice
  reassuranceVoicePlaying: string;
  replayVoiceBtn: string;
  muteVoiceBtn: string;
  reassuranceTranscript: string;

  // Treatment Completed
  treatmentCompletedTitle: string;
  treatmentCompletedDesc: string;
  bedFreedBadge: string;
  returnHomeBtn: string;

  // Accident Monitor
  soloCommuteTitle: string;
  speedLabel: string;
  motionArmed: string;
  testCrashBtn: string;
  impactDetectedTitle: string;
  countdownNotice: string;
  safeCancelBtn: string;

  // Hospital Login
  hospitalLoginTitle: string;
  hospitalLoginSubtitle: string;
  credentialStep: string;
  infrastructureStep: string;
  hospitalCodeLabel: string;
  hospitalNameLabel: string;
  officerNameLabel: string;
  officerDesignationLabel: string;
  officerIdLabel: string;
  phoneLabel: string;
  emailLabel: string;
  passwordLabel: string;
  loginBtn: string;
  nextStepBtn: string;
  backBtn: string;

  // Hospital Dashboard
  dashboardTitle: string;
  activeAlerts: string;
  ambulancesReady: string;
  bedsAvailable: string;
  avgResponseTime: string;
  incomingFeed: string;
  feedHint: string;
  tabAll: string;
  tabCritical: string;
  tabAwaiting: string;
  tabDispatched: string;
  tabCompleted: string;
  dispatchAmbulanceBtn: string;
  dispatchNote: string;
  markTreatmentCompletedBtn: string;
  treatmentCompletedBanner: string;
  lockAllocationBtn: string;
  dashboardSettings: string;
  logoutBtn: string;
  liveFleetRadarTitle: string;

  // WhatsApp & Emergency Contacts
  contactsNotifiedTitle: string;
  contactsNotifiedDesc: string;
  whatsappMessengerSent: string;
  openWhatsApp: string;
  openMessenger: string;
  messageContentLabel: string;

  // Patient Calling
  callPatient: string;
  callingPatient: string;
  patientPhone: string;
  simulateCallModalTitle: string;
  endCall: string;

  // Global Navigation & Layout
  dualSplitView: string;
  hospitalCommand: string;
  resetSos: string;
  realTimeSync: string;
  consoleActive: string;
  authRequired: string;
  bnsMonitored: string;
  directHospitalSync: string;

  // Chat & Categories
  suggestedCategories: string;
  hideSuggestions: string;
  emergencyChatTitle: string;
  noDemoIncidents: string;
  noDemoIncidentsDesc: string;
  noChatReports: string;
  noChatReportsDesc: string;

  // Hospital Dashboard Elements
  hospitalCommandCenterTitle: string;
  onlineDispatchReady: string;
  totalAmbulancesLabel: string;
  occupiedAmbulancesLabel: string;
  icuBedsLabel: string;
  traumaBedsLabel: string;
  generalBedsLabel: string;
  facilitiesLabel: string;
  contactDetailsLabel: string;
  saveSettingsBtn: string;
  closeBtn: string;
}

export const translations: Record<SupportedLanguage, TranslationDictionary> = {
  en: {
    appName: 'PulseWay',
    splitView: 'Split View',
    citizenApp: 'Citizen App',
    hospitalCenter: 'Hospital Center',
    antiAbuseWarning: 'WARNING: False or prank alerts are punishable under BNS & IT Act.',
    liveGps: 'Live GPS',
    accuracy: 'Accuracy',
    recalibrateGps: 'Recalibrate GPS',
    menu: 'Menu',

    selectLanguage: 'Language',
    langEn: 'English',
    langKn: 'ಕನ್ನಡ (Kannada)',
    langHi: 'हिंदी (Hindi)',

    registrationTitle: 'PulseWay Quick Registration',
    registrationSubtitle: 'Emergency profile initialization for instant clinical dispatch',
    personalBiometrics: '1. Personal & Biometrics',
    fullName: 'Full Legal Name *',
    fullNamePlaceholder: 'e.g. Ramesh Kumar',
    age: 'Age',
    dob: 'Date of Birth (DD/MM/YYYY)',
    gender: 'Gender',
    genderMale: 'Male',
    genderFemale: 'Female',
    genderOther: 'Other',
    bloodGroup: 'Blood Group',
    weight: 'Weight (kg)',
    height: 'Height (cm)',
    medicalHistory: '2. Critical Medical History',
    allergiesLabel: 'Chronic Drug / Environmental Allergies',
    customAllergiesPlaceholder: 'Add custom allergy (e.g. Sulfa drugs, Latex)',
    emergencyContacts: '3. Emergency Contacts (SOS Alerted)',
    primaryContact: 'Primary Emergency Contact',
    secondaryContact: 'Secondary Emergency Contact',
    contactName: 'Contact Person Name',
    contactPhone: 'Mobile Number (+91)',
    contactRelation: 'Relationship',
    residentialAddress: '4. Permanent Residential Address',
    addressPlaceholder: 'Street, House No, Landmark, City & Pincode',
    securityNotice: 'Your medical data is encrypted and securely transmitted only during authenticated emergency dispatch.',
    completeRegistrationBtn: 'Complete Registration & Launch Emergency Hub',
    saveChanges: 'Save Changes',

    sosPrompt: 'Describe emergency or tap a shortcut...',
    chatPlaceholder: 'e.g. Severe chest pain, motorcycle collision, burn injury...',
    targetSelectionTitle: 'Who is this emergency for?',
    targetSelf: 'For Myself (My Registered Profile)',
    targetOthers: 'For Someone Else (Bystander Intake)',
    targetSelfDesc: 'Uses your saved blood group, age, allergies & emergency contacts.',
    targetOthersDesc: 'Quickly input victim condition, approximate age & gender.',
    bystanderIntakeTitle: 'Step 2: Bystander Victim Triage',
    emergencyCauseLabel: 'Nature of Emergency *',
    emergencyCausePlaceholder: 'e.g. Unconscious after fall, bleeding heavily from leg',
    runAITriageBtn: 'Run Instant AI Clinical Triage',

    shortcutCardiac: 'Medical / Cardiac',
    shortcutCardiacDesc: 'Severe chest pain, palpitations, fainting',
    shortcutTrauma: 'Accident / Trauma',
    shortcutTraumaDesc: 'Vehicular collision, fracture, deep wound',
    shortcutFire: 'Fire & Thermal Burns',
    shortcutFireDesc: 'Blaze, smoke inhalation, chemical burns',
    shortcutWomen: "Women's Safety",
    shortcutWomenDesc: 'SOS alert, harassment, distress tracking',
    shortcutPoison: 'Poisoning / Toxins',
    shortcutPoisonDesc: 'Snake bite, pesticide, toxic ingestion',

    minorEmergencyTitle: 'Path A: Minor Emergency - Ambulance Not Dispatched',
    minorNoAmbulanceNotice: 'Ambulance dispatch is strictly reserved for critical life threats. Your symptoms are evaluated as stable and non-critical. Follow calm first-aid care below.',
    firstAidStepsTitle: 'Step-by-Step Calm First Aid Guidance',
    closeGuidanceBtn: 'Done / Close Guidance',
    escalateToAmbulanceBtn: 'Condition Worsening? Request Ambulance Escalation',

    criticalConfirmationTitle: 'Confirm Ambulance & Hospital Bed Reservation?',
    criticalConfirmationDesc: 'This appears to be a critical emergency. Do you want to confirm an ambulance and a bed at the nearest hospital?',
    confirmNextBtn: 'Confirm (Next)',
    cancelFirstAidOnlyBtn: 'Cancel (First Aid Only)',
    legalWarningTitle: 'Statutory Warning: Legal Accountability',
    legalWarningDesc: 'Warning: Making a false or prank emergency request is a punishable offence under law. Misuse of emergency services will lead to legal action under BNS & IT Act. Proceed only if this is a genuine emergency.',
    legalAuditNotice: 'Digital fingerprint, device ID, and live GPS coordinates are logged for official audit compliance.',
    confirmAmbulanceBtn: 'Confirm Ambulance',
    quitAbortBtn: 'Quit (Abort Request)',

    waitingHospitalTitle: 'Looking & Waiting for Response from Nearest Hospital...',
    waitingHospitalDesc: 'Per emergency protocol, the ambulance is dispatched only after the hospital dashboard confirms acceptance and assigns an ALS unit.',
    hospitalAcceptedTitle: 'Hospital Connected & Preparing Unit',
    hospitalAcceptedDesc: 'The hospital emergency center has acknowledged your case. Waiting for dashboard dispatch command...',
    broadcastRadius: 'Broadcast Radius',

    ambulanceDispatchedTitle: 'Ambulance En-Route',
    etaRemaining: 'ETA Remaining',
    driverName: 'Driver / Paramedic',
    callDriver: 'Direct Driver Call',
    assignedHospital: 'Assigned Hospital',
    callHospital: 'Call Emergency Desk',
    bedReservedSync: 'Hospital Pre-Arrival Reservation Synced',
    bedNo: 'Assigned Bed',
    doctorAllotted: 'Doctor Allotted',
    ambulanceReachedBtn: 'Ambulance Has Reached (Resolve & Return to Home)',
    copyTrackingLink: 'Copy Tracking Link',
    linkCopied: 'Link Copied!',

    reassuranceVoicePlaying: 'Paramedic Automated Reassurance Broadcast Active',
    replayVoiceBtn: 'Replay Reassurance Audio',
    muteVoiceBtn: 'Mute Voice',
    reassuranceTranscript: 'Stay calm. Help is on the way. An Advanced Life Support ambulance and medical crew have been dispatched to your exact location. Keep the patient in a comfortable position and stay on the line.',

    treatmentCompletedTitle: 'Emergency Care Delivered & Closed',
    treatmentCompletedDesc: 'The clinical team has finalized emergency stabilization and recorded complete discharge/ward transfer. The allotted bed has been restored to the hospital capacity.',
    bedFreedBadge: 'Bed & Unit Restored',
    returnHomeBtn: 'Return to Clean Home View',

    soloCommuteTitle: 'Solo Commute Accident Monitor',
    speedLabel: 'Speed',
    motionArmed: 'Motion Armed',
    testCrashBtn: 'Test Crash Simulator',
    impactDetectedTitle: 'Sudden Deceleration Impact Detected!',
    countdownNotice: 'Are you okay? Code Red automated emergency ambulance will trigger in...',
    safeCancelBtn: 'I am Safe (Cancel Alert)',

    hospitalLoginTitle: 'Hospital Emergency Portal',
    hospitalLoginSubtitle: 'Clinical Operations & Fleet Dispatch Desk',
    credentialStep: '1. Credential Verification',
    infrastructureStep: '2. Infrastructure & Active Capacity',
    hospitalCodeLabel: 'Hospital System ID / Code *',
    hospitalNameLabel: 'Hospital Facility Name *',
    officerNameLabel: 'Emergency In-Charge Officer *',
    officerDesignationLabel: 'Designation *',
    officerIdLabel: 'Medical Council Registration ID *',
    phoneLabel: 'Emergency Dispatch Desk Phone *',
    emailLabel: 'Official Clinical Email *',
    passwordLabel: 'Authentication Passcode *',
    loginBtn: 'Authenticate & Open Emergency Dispatch Center',
    nextStepBtn: 'Proceed to Infrastructure Setup →',
    backBtn: '← Back to Credentials',

    dashboardTitle: 'Hospital Emergency Coordination Center',
    activeAlerts: 'Active Alerts',
    ambulancesReady: 'Ambulances Ready',
    bedsAvailable: 'Beds Available',
    avgResponseTime: 'Avg. Response Time',
    incomingFeed: 'Emergency Live Feed',
    feedHint: 'Click on any patient profile to open Clinical Console. Dispatched ambulances can be tracked in real-time.',
    tabAll: 'All Cases',
    tabCritical: 'Critical',
    tabAwaiting: 'Awaiting',
    tabDispatched: 'Dispatched',
    tabCompleted: 'Completed',
    dispatchAmbulanceBtn: 'Ambulance Dispatch (Deploy ALS Unit Now)',
    dispatchNote: 'Strict Protocol: Ambulance is mobilized only after clicking this button.',
    markTreatmentCompletedBtn: 'Mark Treatment Completed & Automatically Free Allotted Bed',
    treatmentCompletedBanner: 'Treatment completed. Allotted bed has been returned to active hospital vacancy pool.',
    lockAllocationBtn: 'Lock Pre-Arrival Bed & Doctor Allocation',
    dashboardSettings: 'Dashboard Settings',
    logoutBtn: 'Switch / Log Out',
    liveFleetRadarTitle: 'Live Ambulance Dispatch & Fleet Radar',

    contactsNotifiedTitle: 'Emergency Contacts Notified',
    contactsNotifiedDesc: 'Patient condition & live ambulance tracking dispatched via WhatsApp & Messenger',
    whatsappMessengerSent: 'Sent via WhatsApp & Messenger',
    openWhatsApp: 'Open in WhatsApp',
    openMessenger: 'Open in Messenger',
    messageContentLabel: 'Dispatched Message Copy',

    callPatient: 'Call Patient',
    callingPatient: 'Calling Patient...',
    patientPhone: 'Patient Phone',
    simulateCallModalTitle: 'Hospital Emergency Dispatch Line',
    endCall: 'End Call',

    dualSplitView: 'Dual Split-View',
    hospitalCommand: 'Hospital Command',
    resetSos: 'Reset SOS',
    realTimeSync: 'Real-Time Sync',
    consoleActive: 'Console Active',
    authRequired: 'Authentication Required',
    bnsMonitored: 'BNS & IT Act Monitored',
    directHospitalSync: 'Direct Hospital Sync',

    suggestedCategories: 'Suggested Emergency Categories:',
    hideSuggestions: 'Hide suggestions',
    emergencyChatTitle: 'Emergency Assistance Chat & Triage',
    noDemoIncidents: 'No Active Emergency Incidents',
    noDemoIncidentsDesc: 'The hospital emergency command center is active and monitoring incoming live alerts in real-time.',
    noChatReports: 'No AI Chat Reports Yet',
    noChatReportsDesc: 'When you report an emergency, your consultation summary and triage logs will be archived here.',

    hospitalCommandCenterTitle: 'Hospital Emergency Command Center',
    onlineDispatchReady: 'Online · Dispatch Ready',
    totalAmbulancesLabel: 'Total Ambulances in Fleet',
    occupiedAmbulancesLabel: 'Currently Occupied Ambulances',
    icuBedsLabel: 'ICU Beds (Total / Available)',
    traumaBedsLabel: 'Trauma Beds (Total / Available)',
    generalBedsLabel: 'General Beds (Total / Available)',
    facilitiesLabel: 'Clinical Facilities',
    contactDetailsLabel: 'Emergency Desk Contact Information',
    saveSettingsBtn: 'Save Infrastructure Settings',
    closeBtn: 'Close'
  },

  kn: {
    appName: 'ಪಲ್ಸ್‌ವೇ',
    splitView: 'ದ್ವಿಮುಖ ನೋಟ',
    citizenApp: 'ನಾಗರಿಕ ಆ್ಯಪ್',
    hospitalCenter: 'ಆಸ್ಪತ್ರೆ ಕೇಂದ್ರ',
    antiAbuseWarning: 'ಎಚ್ಚರಿಕೆ: ಸುಳ್ಳು ಅಥವಾ ತಮಾಷೆಯ ತುರ್ತು ಕರೆಗಳು ಬಿಎನ್‌ಎಸ್ ಮತ್ತು ಐಟಿ ಕಾಯ್ದೆಯಡಿ ಶಿಕ್ಷಾರ್ಹ.',
    liveGps: 'ಲೈವ್ ಜಿಪಿಎಸ್',
    accuracy: 'ನಿಖರತೆ',
    recalibrateGps: 'ಮರು-ಮಾಪನ ಮಾಡಿ',
    menu: 'ಮೆನು',

    selectLanguage: 'ಭಾಷೆ',
    langEn: 'English',
    langKn: 'ಕನ್ನಡ',
    langHi: 'हिंदी',

    registrationTitle: 'ಪಲ್ಸ್‌ವೇ ತ್ವರಿತ ನೋಂದಣಿ',
    registrationSubtitle: 'ತ್ವರಿತ ತುರ್ತು ರಕ್ಷಣೆಗಾಗಿ ನಿಮ್ಮ ವೈದ್ಯಕೀಯ ವಿವರಗಳನ್ನು ದಾಖಲಿಸಿ',
    personalBiometrics: '1. ವೈಯಕ್ತಿಕ ಮತ್ತು ಜೈವಿಕ ವಿವರಗಳು',
    fullName: 'ಪೂರ್ಣ ಹೆಸರು *',
    fullNamePlaceholder: 'ಉದಾ: ರಮೇಶ್ ಕುಮಾರ್',
    age: 'ವಯಸ್ಸು',
    dob: 'ಹುಟ್ಟಿದ ದಿನಾಂಕ (DD/MM/YYYY)',
    gender: 'ಲಿಂಗ',
    genderMale: 'ಪುರುಷ',
    genderFemale: 'ಮಹಿಳೆ',
    genderOther: 'ಇತರೆ',
    bloodGroup: 'ರಕ್ತದ ಗುಂಪು',
    weight: 'ತೂಕ (ಕೆ.ಜಿ)',
    height: 'ಎತ್ತರ (ಸೆಂ.ಮೀ)',
    medicalHistory: '2. ವೈದ್ಯಕೀಯ ಇತಿಹಾಸ ಮತ್ತು ಅಲರ್ಜಿಗಳು',
    allergiesLabel: 'ಔಷಧಿ ಅಥವಾ ಇತರ ಅಲರ್ಜಿಗಳು',
    customAllergiesPlaceholder: 'ಹೊಸ ಅಲರ್ಜಿ ಸೇರಿಸಿ (ಉದಾ: ಪೆನ್ಸಿಲಿನ್)',
    emergencyContacts: '3. ತುರ್ತು ಸಂಪರ್ಕ ವ್ಯಕ್ತಿಗಳು (SOS ಸಂದೇಶ)',
    primaryContact: 'ಪ್ರಾಥಮಿಕ ತುರ್ತು ಸಂಪರ್ಕ',
    secondaryContact: 'ದ್ವಿತೀಯ ತುರ್ತು ಸಂಪರ್ಕ',
    contactName: 'ಸಂಪರ್ಕ ವ್ಯಕ್ತಿಯ ಹೆಸರು',
    contactPhone: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (+91)',
    contactRelation: 'ಸಂಬಂಧ',
    residentialAddress: '4. ಕಾಯಂ ವಿಳಾಸ ಮತ್ತು ಸ್ಥಳ',
    addressPlaceholder: 'ಮನೆ ನಂ, ರಸ್ತೆ, ಹತ್ತಿರದ ಹೆಗ್ಗುರುತು, ಊರು ಮತ್ತು ಪಿನ್‌ಕೋಡ್',
    securityNotice: 'ನಿಮ್ಮ ವೈದ್ಯಕೀಯ ಮಾಹಿತಿಯು ಸಂಪೂರ್ಣ ಸುರಕ್ಷಿತವಾಗಿದ್ದು ತುರ್ತು ಸಂದರ್ಭದಲ್ಲಿ ಮಾತ್ರ ಬಳಸಲಾಗುತ್ತದೆ.',
    completeRegistrationBtn: 'ನೋಂದಣಿ ಪೂರ್ಣಗೊಳಿಸಿ ತುರ್ತು ಹಬ್ ತೆರೆಯಿರಿ',
    saveChanges: 'ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ',

    sosPrompt: 'ತುರ್ತು ಪರಿಸ್ಥಿತಿಯನ್ನು ವಿವರಿಸಿ ಅಥವಾ ಆಯ್ಕೆ ಮಾಡಿ...',
    chatPlaceholder: 'ಉದಾ: ತೀವ್ರ ಎದೆನೋವು, ಬೈಕ್ ಅಪಘಾತ, ಸುಟ್ಟ ಗಾಯ...',
    targetSelectionTitle: 'ಈ ತುರ್ತು ಸೇವೆ ಯಾರಿಗಾಗಿ?',
    targetSelf: 'ನನಗಾಗಿ (ನನ್ನ ನೋಂದಾಯಿತ ಪ್ರೊಫೈಲ್)',
    targetOthers: 'ಇತರರಿಗಾಗಿ (ಹಾದಿಹೋಕರ ಸಹಾಯ)',
    targetSelfDesc: 'ನಿಮ್ಮ ಉಳಿಸಿದ ರಕ್ತದ ಗುಂಪು, ವಯಸ್ಸು ಮತ್ತು ತುರ್ತು ಸಂಪರ್ಕಗಳನ್ನು ಬಳಸುತ್ತದೆ.',
    targetOthersDesc: 'ಗಾಯಾಳುವಿನ ಪರಿಸ್ಥಿತಿ, ಅಂದಾಜು ವಯಸ್ಸು ಮತ್ತು ಲಿಂಗ ದಾಖಲಿಸಿ.',
    bystanderIntakeTitle: 'ಹಂತ 2: ಗಾಯಾಳು ಪ್ರಾಥಮಿಕ ವಿವರ',
    emergencyCauseLabel: 'ತುರ್ತು ಪರಿಸ್ಥಿತಿಯ ಸ್ವರೂಪ *',
    emergencyCausePlaceholder: 'ಉದಾ: ಬಿದ್ದ ನಂತರ ಪ್ರಜ್ಞಾಹೀನತೆ, ಕಾಲಿನಲ್ಲಿ ತೀವ್ರ ರಕ್ತಸ್ರಾವ',
    runAITriageBtn: 'ತ್ವರಿತ ಎಐ ವೈದ್ಯಕೀಯ ವಿಶ್ಲೇಷಣೆ ನಡೆಸಿ',

    shortcutCardiac: 'ಹೃದಯ / ವೈದ್ಯಕೀಯ ತುರ್ತು',
    shortcutCardiacDesc: 'ತೀವ್ರ ಎದೆನೋವು, ಉಸಿರಾಟದ ತೊಂದರೆ, ಮೂರ್ಛೆ',
    shortcutTrauma: 'ಅಪಘಾತ / ಗಾಯ',
    shortcutTraumaDesc: 'ವಾಹನ ಅಪಘಾತ, ಮೂಳೆ ಮುರಿತ, ತೀವ್ರ ಗಾಯ',
    shortcutFire: 'ಬೆಂಕಿ / ಸುಟ್ಟ ಗಾಯಗಳು',
    shortcutFireDesc: 'ಜ್ವಾಲೆ, ಹೊಗೆ ಉಸಿರಾಟ, ರಾಸಾಯನಿಕ ಸುಟ್ಟ ಗಾಯ',
    shortcutWomen: 'ಮಹಿಳೆಯರ ಸುರಕ್ಷತೆ',
    shortcutWomenDesc: 'SOS ತುರ್ತು ಎಚ್ಚರಿಕೆ, ಕಿರುಕುಳ, ಲೈವ್ ಟ್ರ್ಯಾಕಿಂಗ್',
    shortcutPoison: 'ವಿಷಬಾಧೆ / ವಿಷಜಂತು ಕಡಿತ',
    shortcutPoisonDesc: 'ಹಾವು ಕಡಿತ, ಕೀಟನಾಶಕ, ವಿಷಕಾರಿ ಸೇವನೆ',

    minorEmergencyTitle: 'ಮಾರ್ಗ A: ಸಣ್ಣಪುಟ್ಟ ತುರ್ತು - ಆಂಬ್ಯುಲೆನ್ಸ್ ಅಗತ್ಯವಿಲ್ಲ',
    minorNoAmbulanceNotice: 'ಆಂಬ್ಯುಲೆನ್ಸ್ ಅನ್ನು ಕೇವಲ ಜೀವನ್ಮರಣ ತುರ್ತು ಪರಿಸ್ಥಿತಿಗಳಿಗೆ ಮಾತ್ರ ಕಳುಹಿಸಲಾಗುತ್ತದೆ. ನಿಮ್ಮ ಲಕ್ಷಣಗಳು ಸಾಮಾನ್ಯವಾಗಿದ್ದು ಆಸ್ಪತ್ರೆ ಆಂಬ್ಯುಲೆನ್ಸ್ ಕರೆಯುವ ಅಗತ್ಯವಿಲ್ಲ. ಕೆಳಗಿನ ಪ್ರಥಮ ಚಿಕಿತ್ಸೆಯನ್ನು ಅನುಸರಿಸಿ.',
    firstAidStepsTitle: 'ಹಂತ-ಹಂತದ ಪ್ರಥಮ ಚಿಕಿತ್ಸಾ ಮಾರ್ಗದರ್ಶಿ',
    closeGuidanceBtn: 'ಮುಕ್ತಾಯ / ಮುಚ್ಚಿ',
    escalateToAmbulanceBtn: 'ಪರಿಸ್ಥಿತಿ ಉಲ್ಬಣಗೊಂಡರೆ? ಆಂಬ್ಯುಲೆನ್ಸ್ ವಿನಂತಿಸಿ',

    criticalConfirmationTitle: 'ಆಂಬ್ಯುಲೆನ್ಸ್ ಮತ್ತು ಹಾಸಿಗೆ ಕಾಯ್ದಿರಿಸುವಿಕೆಯನ್ನು ದೃಢೀಕರಿಸಿ?',
    criticalConfirmationDesc: 'ಇದು ತೀವ್ರ ತುರ್ತು ಪರಿಸ್ಥಿತಿಯಂತೆ ಕಾಣುತ್ತಿದೆ. ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆಯಿಂದ ಆಂಬ್ಯುಲೆನ್ಸ್ ಮತ್ತು ಬೆಡ್ ಕಾಯ್ದಿರಿಸಲು ನೀವು ಬಯಸುವಿರಾ?',
    confirmNextBtn: 'ದೃಢೀಕರಿಸಿ (ಮುಂದೆ)',
    cancelFirstAidOnlyBtn: 'ರದ್ದುಮಾಡಿ (ಪ್ರಥಮ ಚಿಕಿತ್ಸೆ ಸಾಕು)',
    legalWarningTitle: 'ಕಾನೂನುಬದ್ಧ ಎಚ್ಚರಿಕೆ: ಕಾನೂನಿನ ಹೊಣೆಗಾರಿಕೆ',
    legalWarningDesc: 'ಎಚ್ಚರಿಕೆ: ಸುಳ್ಳು ಅಥವಾ ತಮಾಷೆಯ ತುರ್ತು ಕರೆ ಮಾಡುವುದು ಕಾನೂನಿನ ಪ್ರಕಾರ ಅಪರಾಧವಾಗಿದೆ. ಸೇವೆಗಳ ದುರುಪಯೋಗವು ಬಿಎನ್‌ಎಸ್ ಮತ್ತು ಐಟಿ ಕಾಯ್ದೆಯಡಿ ಕಾನೂನು ಕ್ರಮಕ್ಕೆ ಒಳಪಡುತ್ತದೆ. ನಿಜವಾದ ತುರ್ತು ಸಂದರ್ಭದಲ್ಲಿ ಮಾತ್ರ ಮುಂದುವರಿಯಿರಿ.',
    legalAuditNotice: 'ಡಿಜಿಟಲ್ ಫಿಂಗರ್‌ಪ್ರಿಂಟ್ ಮತ್ತು ಲೈವ್ ಜಿಪಿಎಸ್ ಸ್ಥಳವನ್ನು ಆಡಿಟ್‌ಗಾಗಿ ದಾಖಲಿಸಲಾಗಿದೆ.',
    confirmAmbulanceBtn: 'ಆಂಬ್ಯುಲೆನ್ಸ್ ದೃಢೀಕರಿಸಿ',
    quitAbortBtn: 'ರದ್ದುಮಾಡಿ ಹೊರಬನ್ನಿ',

    waitingHospitalTitle: 'ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆಯಿಂದ ಪ್ರತಿಕ್ರಿಯೆಗಾಗಿ ಕಾಯಲಾಗುತ್ತಿದೆ...',
    waitingHospitalDesc: 'ತುರ್ತು ನಿಯಮಾವಳಿಯಂತೆ, ಆಸ್ಪತ್ರೆಯ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಅನುಮೋದಿಸಿ ಆಂಬ್ಯುಲೆನ್ಸ್ ನಿಯೋಜಿಸಿದ ನಂತರವೇ ವಾಹನ ಹೊರಡುತ್ತದೆ.',
    hospitalAcceptedTitle: 'ಆಸ್ಪತ್ರೆ ಸಂಪರ್ಕಗೊಂಡಿದೆ ಮತ್ತು ಸಿದ್ಧತೆ ನಡೆಯುತ್ತಿದೆ',
    hospitalAcceptedDesc: 'ಆಸ್ಪತ್ರೆಯ ತುರ್ತು ಕೇಂದ್ರವು ನಿಮ್ಮ ಪ್ರಕರಣವನ್ನು ಸ್ವೀಕರಿಸಿದೆ. ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಆದೇಶಕ್ಕಾಗಿ ಕಾಯಲಾಗುತ್ತಿದೆ...',
    broadcastRadius: 'ಪ್ರಸಾರ ವ್ಯಾಪ್ತಿ',

    ambulanceDispatchedTitle: 'ಆಂಬ್ಯುಲೆನ್ಸ್ ದಾರಿಯಲ್ಲಿದೆ',
    etaRemaining: 'ಬರುವ ಅಂದಾಜು ಸಮಯ',
    driverName: 'ಚಾಲಕ / ಪ್ಯಾರಾಮೆಡಿಕ್',
    callDriver: 'ಚಾಲಕರಿಗೆ ನೇರ ಕರೆ',
    assignedHospital: 'ನಿಯೋಜಿತ ಆಸ್ಪತ್ರೆ',
    callHospital: 'ತುರ್ತು ಡೆಸ್ಕ್‌ಗೆ ಕರೆ ಮಾಡಿ',
    bedReservedSync: 'ಆಸ್ಪತ್ರೆಯ ಬೆಡ್ ಕಾಯ್ದಿರಿಸುವಿಕೆ ಸಿಂಕ್ ಆಗಿದೆ',
    bedNo: 'ನಿಯೋಜಿತ ಬೆಡ್',
    doctorAllotted: 'ನಿಯೋಜಿತ ವೈದ್ಯರು',
    ambulanceReachedBtn: 'ಆಂಬ್ಯುಲೆನ್ಸ್ ತಲುಪಿದೆ (ಪೂರ್ಣಗೊಳಿಸಿ ಮುಖಪುಟಕ್ಕೆ ಮರಳಿ)',
    copyTrackingLink: 'ಟ್ರ್ಯಾಕಿಂಗ್ ಲಿಂಕ್ ನಕಲಿಸಿ',
    linkCopied: 'ಲಿಂಕ್ ನಕಲಿಸಲಾಗಿದೆ!',

    reassuranceVoicePlaying: 'ಪ್ಯಾರಾಮೆಡಿಕ್ ಸ್ವಯಂಚಾಲಿತ ಧ್ವನಿ ಭರವಸೆ ಪ್ರಸಾರವಾಗುತ್ತಿದೆ',
    replayVoiceBtn: 'ಧ್ವನಿ ಸಂದೇಶವನ್ನು ಮರುಪ್ಲೇ ಮಾಡಿ',
    muteVoiceBtn: 'ಧ್ವನಿ ಮ್ಯೂಟ್ ಮಾಡಿ',
    reassuranceTranscript: 'ದಯವಿಟ್ಟು ಶಾಂತರಾಗಿರಿ. ಸಹಾಯವು ದಾರಿಯಲ್ಲಿದೆ. ನಿಮ್ಮ ನಿಖರವಾದ ಸ್ಥಳಕ್ಕೆ ಸುಸಜ್ಜಿತ ಆಂಬ್ಯುಲೆನ್ಸ್ ಮತ್ತು ವೈದ್ಯಕೀಯ ತಂಡವನ್ನು ರವಾನಿಸಲಾಗಿದೆ. ರೋಗಿಯನ್ನು ಆರಾಮವಾಗಿ ಇರಿಸಿ ಮತ್ತು ಸಂಪರ್ಕದಲ್ಲಿರಿ.',

    treatmentCompletedTitle: 'ತುರ್ತು ಚಿಕಿತ್ಸೆ ಪೂರ್ಣಗೊಂಡಿದೆ',
    treatmentCompletedDesc: 'ವೈದ್ಯಕೀಯ ತಂಡವು ರೋಗಿಯ ತುರ್ತು ಚಿಕಿತ್ಸೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಪೂರ್ಣಗೊಳಿಸಿದೆ. ನಿಯೋಜಿಸಲಾದ ಬೆಡ್ ಅನ್ನು ಆಸ್ಪತ್ರೆಯ ಲಭ್ಯವಿರುವ ಬೆಡ್‌ಗಳ ಪಟ್ಟಿಗೆ ಮರಳಿ ಸೇರಿಸಲಾಗಿದೆ.',
    bedFreedBadge: 'ಬೆಡ್ ಮತ್ತು ಆಂಬ್ಯುಲೆನ್ಸ್ ಮುಕ್ತವಾಗಿದೆ',
    returnHomeBtn: 'ಮುಖಪುಟಕ್ಕೆ ಮರಳಿ',

    soloCommuteTitle: 'ಏಕಾಂಗಿ ಪ್ರಯಾಣ ಅಪಘಾತ ಮಾನಿಟರ್',
    speedLabel: 'ವೇಗ',
    motionArmed: 'ಚಲನೆ ಮಾನಿಟರ್ ಆನ್ ಆಗಿದೆ',
    testCrashBtn: 'ಅಪಘಾತ ಸಿಮ್ಯುಲೇಟರ್ ಪರೀಕ್ಷಿಸಿ',
    impactDetectedTitle: 'ತೀವ್ರ ಅಪಘಾತ ಪತ್ತೆಯಾಗಿದೆ!',
    countdownNotice: 'ನೀವು ಸುರಕ್ಷಿತವಾಗಿದ್ದೀರಾ? ಕೋಡ್ ರೆಡ್ ತುರ್ತು ಆಂಬ್ಯುಲೆನ್ಸ್ ಹೊರಡಲು ಕ್ಷಣಗಣನೆ...',
    safeCancelBtn: 'ನಾನು ಸುರಕ್ಷಿತವಾಗಿದ್ದೇನೆ (ಎಚ್ಚರಿಕೆ ರದ್ದುಮಾಡಿ)',

    hospitalLoginTitle: 'ಆಸ್ಪತ್ರೆ ತುರ್ತು ಪೋರ್ಟಲ್',
    hospitalLoginSubtitle: 'ವೈದ್ಯಕೀಯ ಕಾರ್ಯಾಚರಣೆ ಮತ್ತು ವಾಹನ ರವಾನೆ ಕೇಂದ್ರ',
    credentialStep: '1. ಅಧಿಕೃತ ದಾಖಲಾತಿ ಪರಿಶೀಲನೆ',
    infrastructureStep: '2. ಮೂಲಸೌಕರ್ಯ ಮತ್ತು ಹಾಸಿಗೆ ಸಾಮರ್ಥ್ಯ',
    hospitalCodeLabel: 'ಆಸ್ಪತ್ರೆ ಕೋಡ್ / ಐಡಿ *',
    hospitalNameLabel: 'ಆಸ್ಪತ್ರೆಯ ಹೆಸರು *',
    officerNameLabel: 'ತುರ್ತು ವಿಭಾಗದ ಮುಖ್ಯ ಅಧಿಕಾರಿ *',
    officerDesignationLabel: 'ಹುದ್ದೆ *',
    officerIdLabel: 'ಮೆಡಿಕಲ್ ಕೌನ್ಸಿಲ್ ನೋಂದಣಿ ಸಂಖ್ಯೆ *',
    phoneLabel: 'ತುರ್ತು ರವಾನೆ ಡೆಸ್ಕ್ ಫೋನ್ *',
    emailLabel: 'ಅಧಿಕೃತ ಈಮೇಲ್ *',
    passwordLabel: 'ಗುಪ್ತಪದ (ಪಾಸ್‌ವರ್ಡ್) *',
    loginBtn: 'ಪ್ರವೇಶಿಸಿ ತುರ್ತು ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತೆರೆಯಿರಿ',
    nextStepBtn: 'ಮೂಲಸೌಕರ್ಯ ಸೆಟಪ್‌ಗೆ ಮುಂದುವರಿಯಿರಿ →',
    backBtn: '← ಹಿಂದಕ್ಕೆ',

    dashboardTitle: 'ಆಸ್ಪತ್ರೆ ತುರ್ತು ಸಮನ್ವಯ ಕೇಂದ್ರ',
    activeAlerts: 'ಸಕ್ರಿಯ ಕರೆಗಳು',
    ambulancesReady: 'ಸಿದ್ಧವಿರುವ ಆಂಬ್ಯುಲೆನ್ಸ್‌ಗಳು',
    bedsAvailable: 'ಲಭ್ಯವಿರುವ ಬೆಡ್‌ಗಳು',
    avgResponseTime: 'ಸರಾಸರಿ ಪ್ರತಿಕ್ರಿಯೆ ಸಮಯ',
    incomingFeed: 'ತುರ್ತು ಲೈವ್ ಫೀಡ್',
    feedHint: 'ಕ್ಲಿನಿಕಲ್ ಕನ್ಸೋಲ್ ತೆರೆಯಲು ಯಾವುದೇ ಪ್ರೊಫೈಲ್ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ. ಆಂಬ್ಯುಲೆನ್ಸ್ ಲೈವ್ ಮ್ಯಾಪ್‌ನಲ್ಲಿ ಟ್ರ್ಯಾಕ್ ಮಾಡಬಹುದು.',
    tabAll: 'ಎಲ್ಲಾ ಪ್ರಕರಣಗಳು',
    tabCritical: 'ತೀವ್ರ ತುರ್ತು',
    tabAwaiting: 'ಕಾಯುತ್ತಿರುವವು',
    tabDispatched: 'ರವಾನಿಸಲಾಗಿದೆ',
    tabCompleted: 'ಪೂರ್ಣಗೊಂಡಿದೆ',
    dispatchAmbulanceBtn: 'ಆಂಬ್ಯುಲೆನ್ಸ್ ರವಾನಿಸಿ (ALS ಯೂನಿಟ್ ಕಳುಹಿಸಿ)',
    dispatchNote: 'ಕಟ್ಟುನಿಟ್ಟಿನ ನಿಯಮ: ಈ ಬಟನ್ ಒತ್ತಿದ ನಂತರವೇ ಆಂಬ್ಯುಲೆನ್ಸ್ ಹೊರಡುತ್ತದೆ.',
    markTreatmentCompletedBtn: 'ಚಿಕಿತ್ಸೆ ಪೂರ್ಣಗೊಂಡಿದೆ ಎಂದು ಗುರುತಿಸಿ ಬೆಡ್ ಮುಕ್ತಗೊಳಿಸಿ',
    treatmentCompletedBanner: 'ಚಿಕಿತ್ಸೆ ಪೂರ್ಣಗೊಂಡಿದೆ. ನಿಯೋಜಿತ ಬೆಡ್ ಆಸ್ಪತ್ರೆಯ ಖಾಲಿ ಬೆಡ್‌ಗಳ ಪಟ್ಟಿಗೆ ಮರಳಿದೆ.',
    lockAllocationBtn: 'ಬೆಡ್ ಮತ್ತು ವೈದ್ಯರ ನಿಯೋಜನೆ ದೃಢೀಕರಿಸಿ',
    dashboardSettings: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಸೆಟ್ಟಿಂಗ್ಸ್',
    logoutBtn: 'ಲಾಗ್ ಔಟ್',
    liveFleetRadarTitle: 'ಲೈವ್ ಆಂಬ್ಯುಲೆನ್ಸ್ ಮತ್ತು ವಾಹನ ಟ್ರ್ಯಾಕಿಂಗ್ ರಾಡಾರ್',

    contactsNotifiedTitle: 'ತುರ್ತು ಸಂಪರ್ಕಗಳಿಗೆ ಸಂದೇಶ ಕಳುಹಿಸಲಾಗಿದೆ',
    contactsNotifiedDesc: 'ರೋಗಿಯ ಸ್ಥಿತಿ ಮತ್ತು ಲೈವ್ ಆಂಬ್ಯುಲೆನ್ಸ್ ಟ್ರ್ಯಾಕಿಂಗ್ ಅನ್ನು ವಾಟ್ಸಾಪ್ ಮತ್ತು ಮೆಸೆಂಜರ್ ಮೂಲಕ ಕಳುಹಿಸಲಾಗಿದೆ',
    whatsappMessengerSent: 'ವಾಟ್ಸಾಪ್ ಮತ್ತು ಮೆಸೆಂಜರ್ ಮೂಲಕ ಕಳುಹಿಸಲಾಗಿದೆ',
    openWhatsApp: 'ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ತೆರೆಯಿರಿ',
    openMessenger: 'ಮೆಸೆಂಜರ್‌ನಲ್ಲಿ ತೆರೆಯಿರಿ',
    messageContentLabel: 'ರವಾನಿಸಲಾದ ಸಂದೇಶದ ಪ್ರತಿ',

    callPatient: 'ರೋಗಿಗೆ ಕರೆ ಮಾಡಿ',
    callingPatient: 'ರೋಗಿಗೆ ಕರೆ ಮಾಡಲಾಗುತ್ತಿದೆ...',
    patientPhone: 'ರೋಗಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ',
    simulateCallModalTitle: 'ಆಸ್ಪತ್ರೆ ತುರ್ತು ರವಾನೆ ಕರೆ ವ್ಯವಸ್ಥೆ',
    endCall: 'ಕರೆ ಮುಕ್ತಾಯಗೊಳಿಸಿ',

    dualSplitView: 'ದ್ವಿಮುಖ ನೋಟ',
    hospitalCommand: 'ಆಸ್ಪತ್ರೆ ಕಮಾಂಡ್',
    resetSos: 'ಮರುಹೊಂದಿಸಿ',
    realTimeSync: 'ನೈಜ-ಸಮಯದ ಸಿಂಕ್',
    consoleActive: 'ಕನ್ಸೋಲ್ ಸಕ್ರಿಯವಾಗಿದೆ',
    authRequired: 'ದೃಢೀಕರಣ ಅಗತ್ಯವಿದೆ',
    bnsMonitored: 'ಬಿಎನ್‌ಎಸ್ ಮತ್ತು ಐಟಿ ಕಾಯ್ದೆ ಮೇಲ್ವಿಚಾರಣೆ',
    directHospitalSync: 'ನೇರ ಆಸ್ಪತ್ರೆ ಸಿಂಕ್',

    suggestedCategories: 'ಸೂಚಿಸಲಾದ ತುರ್ತು ವಿಭಾಗಗಳು:',
    hideSuggestions: 'ಮುಚ್ಚಿ',
    emergencyChatTitle: 'ತುರ್ತು ಸಹಾಯ ಚಾಟ್ ಮತ್ತು ಟ್ರಯೇಜ್',
    noDemoIncidents: 'ಯಾವುದೇ ಸಕ್ರಿಯ ತುರ್ತು ಕರೆಗಳಿಲ್ಲ',
    noDemoIncidentsDesc: 'ಕಮಾಂಡ್ ಕೇಂದ್ರವು ನೈಜ-ಸಮಯದ ತುರ್ತು ಕರೆಗಳನ್ನು ನಿಗಾ ವಹಿಸುತ್ತಿದೆ.',
    noChatReports: 'ಇನ್ನೂ ಯಾವುದೇ ಚಾಟ್ ವರದಿಗಳಿಲ್ಲ',
    noChatReportsDesc: 'ನೀವು ತುರ್ತು ಪರಿಸ್ಥಿತಿಯನ್ನು ವರದಿ ಮಾಡಿದಾಗ, ನಿಮ್ಮ ವರದಿ ಇಲ್ಲಿ ಸಂಗ್ರಹವಾಗುತ್ತದೆ.',

    hospitalCommandCenterTitle: 'ಆಸ್ಪತ್ರೆ ತುರ್ತು ಕಮಾಂಡ್ ಕೇಂದ್ರ',
    onlineDispatchReady: 'ಆನ್‌ಲೈನ್ · ರವಾನೆಗೆ ಸಿದ್ಧವಾಗಿದೆ',
    totalAmbulancesLabel: 'ಒಟ್ಟು ಆಂಬ್ಯುಲೆನ್ಸ್‌ಗಳು',
    occupiedAmbulancesLabel: 'ಕಾರ್ಯನಿರತ ಆಂಬ್ಯುಲೆನ್ಸ್‌ಗಳು',
    icuBedsLabel: 'ಐಸಿಯು ಬೆಡ್‌ಗಳು (ಒಟ್ಟು / ಲಭ್ಯ)',
    traumaBedsLabel: 'ಟ್ರಾಮಾ ಬೆಡ್‌ಗಳು (ಒಟ್ಟು / ಲಭ್ಯ)',
    generalBedsLabel: 'ಜನರಲ್ ಬೆಡ್‌ಗಳು (ಒಟ್ಟು / ಲಭ್ಯ)',
    facilitiesLabel: 'ಲಭ್ಯವಿರುವ ಸೌಲಭ್ಯಗಳು',
    contactDetailsLabel: 'ತುರ್ತು ಸಂಪರ್ಕ ಮಾಹಿತಿ',
    saveSettingsBtn: 'ಸೆಟ್ಟಿಂಗ್ಸ್ ಉಳಿಸಿ',
    closeBtn: 'ಮುಚ್ಚಿ'
  },

  hi: {
    appName: 'पल्सवे',
    splitView: 'विभाजित दृश्य',
    citizenApp: 'नागरिक ऐप',
    hospitalCenter: 'अस्पताल केंद्र',
    antiAbuseWarning: 'चेतावनी: झूठे या शरारती आपातकालीन कॉल बीएनएस और आईटी अधिनियम के तहत दंडनीय हैं।',
    liveGps: 'लाइव जीपीएस',
    accuracy: 'सटीकता',
    recalibrateGps: 'जीपीएस पुनः कैलिब्रेट करें',
    menu: 'मेनू',

    selectLanguage: 'भाषा',
    langEn: 'English',
    langKn: 'ಕನ್ನಡ',
    langHi: 'हिंदी',

    registrationTitle: 'पल्सवे त्वरित पंजीकरण',
    registrationSubtitle: 'तत्काल आपातकालीन सहायता के लिए अपनी चिकित्सा प्रोफ़ाइल दर्ज करें',
    personalBiometrics: '1. व्यक्तिगत एवं बायोमेट्रिक विवरण',
    fullName: 'पूरा कानूनी नाम *',
    fullNamePlaceholder: 'उदा: रमेश कुमार',
    age: 'आयु',
    dob: 'जन्म तिथि (DD/MM/YYYY)',
    gender: 'लिंग',
    genderMale: 'पुरुष',
    genderFemale: 'महिला',
    genderOther: 'अन्य',
    bloodGroup: 'रक्त समूह',
    weight: 'वजन (किग्रा)',
    height: 'ऊंचाई (सेमी)',
    medicalHistory: '2. महत्वपूर्ण चिकित्सा इतिहास',
    allergiesLabel: 'दवा या अन्य एलर्जी',
    customAllergiesPlaceholder: 'नई एलर्जी जोड़ें (उदा: पेनिसिलिन)',
    emergencyContacts: '3. आपातकालीन संपर्क (SOS संदेश हेतु)',
    primaryContact: 'प्राथमिक आपातकालीन संपर्क',
    secondaryContact: 'द्वितीयक आपातकालीन संपर्क',
    contactName: 'संपर्क व्यक्ति का नाम',
    contactPhone: 'मोबाइल नंबर (+91)',
    contactRelation: 'संबंध',
    residentialAddress: '4. स्थायी निवास का पता',
    addressPlaceholder: 'मकान नं, सड़क, नजदीकी लैंडमार्क, शहर व पिनकोड',
    securityNotice: 'आपकी चिकित्सा जानकारी पूरी तरह एन्क्रिप्टेड है और केवल आपात स्थिति में उपयोग की जाती है।',
    completeRegistrationBtn: 'पंजीकरण पूर्ण करें और आपातकालीन हब खोलें',
    saveChanges: 'बदलाव सुरक्षित करें',

    sosPrompt: 'आपात स्थिति का विवरण दें या शॉर्टकट चुनें...',
    chatPlaceholder: 'उदा: तेज सीने में दर्द, बाइक दुर्घटना, जलने की चोट...',
    targetSelectionTitle: 'यह आपातकालीन सेवा किसके लिए है?',
    targetSelf: 'मेरे स्वयं के लिए (मेरी पंजीकृत प्रोफ़ाइल)',
    targetOthers: 'किसी अन्य व्यक्ति के लिए (राहगीर सहायता)',
    targetSelfDesc: 'आपके सहेजे गए रक्त समूह, आयु, एलर्जी और संपर्कों का उपयोग करता है।',
    targetOthersDesc: 'घायल व्यक्ति की स्थिति, अनुमानित आयु और लिंग दर्ज करें।',
    bystanderIntakeTitle: 'चरण 2: पीड़ित व्यक्ति का प्राथमिक विवरण',
    emergencyCauseLabel: 'आपात स्थिति का प्रकार *',
    emergencyCausePlaceholder: 'उदा: गिरने के बाद बेहोश, पैर से भारी रक्तस्राव',
    runAITriageBtn: 'तत्काल एआई क्लिनिकल ट्राइएज चलाएं',

    shortcutCardiac: 'हृदय / चिकित्सा आपातकाल',
    shortcutCardiacDesc: 'सीने में तेज दर्द, सांस लेने में तकलीफ, बेहोशी',
    shortcutTrauma: 'दुर्घटना / गंभीर चोट',
    shortcutTraumaDesc: 'सड़क दुर्घटना, हड्डी टूटना, गहरा घाव',
    shortcutFire: 'आग / जलने की चोट',
    shortcutFireDesc: 'आग, धुएं में सांस लेना, रासायनिक जलन',
    shortcutWomen: 'महिला सुरक्षा',
    shortcutWomenDesc: 'SOS आपातकालीन चेतावनी, छेड़छाड़, लाइव ट्रैकिंग',
    shortcutPoison: 'विषाक्तता / जहरीला डंक',
    shortcutPoisonDesc: 'सांप का काटना, कीटनाशक, जहरीला पदार्थ निगलना',

    minorEmergencyTitle: 'पथ A: सामान्य आपातकाल - एम्बुलेंस की आवश्यकता नहीं',
    minorNoAmbulanceNotice: 'एम्बुलेंस केवल जानलेवा आपात स्थितियों के लिए आरक्षित है। आपके लक्षण सामान्य पाए गए हैं और एम्बुलेंस की आवश्यकता नहीं है। कृपया नीचे दिए गए प्राथमिक उपचार का पालन करें।',
    firstAidStepsTitle: 'चरण-दर-चरण शांत प्राथमिक उपचार मार्गदर्शन',
    closeGuidanceBtn: 'समाप्त / मार्गदर्शन बंद करें',
    escalateToAmbulanceBtn: 'स्थिति बिगड़ने पर एम्बुलेंस की मांग करें',

    criticalConfirmationTitle: 'एम्बुलेंस और अस्पताल बेड आरक्षण की पुष्टि करें?',
    criticalConfirmationDesc: 'यह एक गंभीर आपातकालीन स्थिति प्रतीत होती है। क्या आप निकटतम अस्पताल से एम्बुलेंस और बेड बुक करना चाहते हैं?',
    confirmNextBtn: 'पुष्टि करें (आगे बढ़ें)',
    cancelFirstAidOnlyBtn: 'रद्द करें (केवल प्राथमिक उपचार)',
    legalWarningTitle: 'सांविधिक चेतावनी: कानूनी जवाबदेही',
    legalWarningDesc: 'चेतावनी: झूठी या शरारती आपातकालीन कॉल करना कानूनन अपराध है। सेवाओं के दुरुपयोग पर बीएनएस और आईटी अधिनियम के तहत कानूनी कार्रवाई की जाएगी। केवल वास्तविक आपात स्थिति में ही आगे बढ़ें।',
    legalAuditNotice: 'ऑडिट अनुपालन के लिए डिजिटल फिंगरप्रिंट और लाइव जीपीएस स्थान दर्ज किया जा रहा है।',
    confirmAmbulanceBtn: 'एम्बुलेंस की पुष्टि करें',
    quitAbortBtn: 'रद्द कर बाहर निकलें',

    waitingHospitalTitle: 'निकटतम अस्पताल से प्रतिक्रिया की प्रतीक्षा की जा रही है...',
    waitingHospitalDesc: 'आपातकालीन प्रोटोकॉल के अनुसार, अस्पताल द्वारा पुष्टि और एम्बुलेंस आवंटित करने के बाद ही वाहन रवाना होता है।',
    hospitalAcceptedTitle: 'अस्पताल जुड़ गया है और तैयारी चल रही है',
    hospitalAcceptedDesc: 'अस्पताल के आपातकालीन केंद्र ने आपके मामले को स्वीकार कर लिया है। डैशबोर्ड आदेश की प्रतीक्षा है...',
    broadcastRadius: 'प्रसारण दायरा',

    ambulanceDispatchedTitle: 'एम्बुलेंस रास्ते में है',
    etaRemaining: 'पहुंचने का अनुमानित समय',
    driverName: 'चालक / पैरामेडिक',
    callDriver: 'चालक को सीधे कॉल करें',
    assignedHospital: 'आवंटित अस्पताल',
    callHospital: 'आपातकालीन डेस्क पर कॉल करें',
    bedReservedSync: 'अस्पताल बेड आरक्षण सिंक हो गया है',
    bedNo: 'आवंटित बेड',
    doctorAllotted: 'आवंटित डॉक्टर',
    ambulanceReachedBtn: 'एम्बुलेंस पहुंच गई है (समाधान करें और होम पर लौटें)',
    copyTrackingLink: 'ट्रैकिंग लिंक कॉपी करें',
    linkCopied: 'लिंक कॉपी हो गया!',

    reassuranceVoicePlaying: 'पैरामेडिक स्वचालित ध्वनि संदेश सक्रिय है',
    replayVoiceBtn: 'ध्वनि संदेश दोबारा सुनें',
    muteVoiceBtn: 'आवाज म्यूट करें',
    reassuranceTranscript: 'कृपया शांत रहें। सहायता रास्ते में है। आपके सटीक स्थान पर एक सुसज्जित एम्बुलेंस और मेडिकल टीम रवाना कर दी गई है। कृपया रोगी को आराम से रखें और लाइन पर बने रहें।',

    treatmentCompletedTitle: 'आपातकालीन उपचार संपन्न व समाप्त',
    treatmentCompletedDesc: 'मेडिकल टीम ने आपातकालीन उपचार सफलतापूर्वक पूरा कर लिया है। आवंटित बेड अस्पताल के रिक्त बेड पूल में वापस जोड़ दिया गया है।',
    bedFreedBadge: 'बेड व वाहन मुक्त',
    returnHomeBtn: 'मुख्य पृष्ठ पर लौटें',

    soloCommuteTitle: 'एकल यात्रा दुर्घटना मॉनिटर',
    speedLabel: 'गति',
    motionArmed: 'मोशन मॉनिटर सक्रिय',
    testCrashBtn: 'दुर्घटना सिम्युलेटर परीक्षण',
    impactDetectedTitle: 'गंभीर दुर्घटना का प्रभाव पाया गया!',
    countdownNotice: 'क्या आप सुरक्षित हैं? कोड रेड आपातकालीन एम्बुलेंस ट्रिगर होने में शेष समय...',
    safeCancelBtn: 'मैं सुरक्षित हूँ (अलर्ट रद्द करें)',

    hospitalLoginTitle: 'अस्पताल आपातकालीन पोर्टल',
    hospitalLoginSubtitle: 'चिकित्सा संचालन एवं वाहन प्रेषण डेस्क',
    credentialStep: '1. आधिकारिक क्रेडेंशियल सत्यापन',
    infrastructureStep: '2. बुनियादी ढांचा और बेड क्षमता',
    hospitalCodeLabel: 'अस्पताल कोड / आईडी *',
    hospitalNameLabel: 'अस्पताल का नाम *',
    officerNameLabel: 'आपातकालीन प्रभारी अधिकारी *',
    officerDesignationLabel: 'पदनाम *',
    officerIdLabel: 'मेडिकल काउंसिल पंजीकरण आईडी *',
    phoneLabel: 'आपातकालीन प्रेषण डेस्क फोन *',
    emailLabel: 'आधिकारिक ईमेल *',
    passwordLabel: 'सुरक्षा पासवर्ड *',
    loginBtn: 'लॉग इन करें और आपातकालीन डैशबोर्ड खोलें',
    nextStepBtn: 'इन्फ्रास्ट्रक्चर सेटअप पर आगे बढ़ें →',
    backBtn: '← क्रेडेंशियल पर वापस',

    dashboardTitle: 'अस्पताल आपातकालीन समन्वय केंद्र',
    activeAlerts: 'सक्रिय कॉल',
    ambulancesReady: 'तैयार एम्बुलेंस',
    bedsAvailable: 'उपलब्ध बेड',
    avgResponseTime: 'औसत प्रतिक्रिया समय',
    incomingFeed: 'आपातकालीन लाइव फीड',
    feedHint: 'क्लिनिकल कंसोल खोलने के लिए किसी भी प्रोफाइल पर क्लिक करें। एम्बुलेंस को लाइव मैप पर ट्रैक किया जा सकता है।',
    tabAll: 'सभी मामले',
    tabCritical: 'गंभीर',
    tabAwaiting: 'प्रतीक्षारत',
    tabDispatched: 'प्रेषित',
    tabCompleted: 'पूर्ण',
    dispatchAmbulanceBtn: 'एम्बुलेंस प्रेषित करें (ALS यूनिट भेजें)',
    dispatchNote: 'कड़ा नियम: यह बटन दबाने के बाद ही एम्बुलेंस रवाना होगी।',
    markTreatmentCompletedBtn: 'उपचार पूर्ण चिह्नित करें और बेड मुक्त करें',
    treatmentCompletedBanner: 'उपचार संपन्न हुआ। आवंटित बेड अस्पताल के उपलब्ध बेड पूल में वापस आ गया है।',
    lockAllocationBtn: 'बेड व डॉक्टर का आवंटन लॉक करें',
    dashboardSettings: 'डैशबोर्ड सेटिंग्स',
    logoutBtn: 'लॉग आउट',
    liveFleetRadarTitle: 'लाइव एम्बुलेंस प्रेषण एवं रडार ट्रैकिंग',

    contactsNotifiedTitle: 'आपातकालीन संपर्कों को सूचित किया गया',
    contactsNotifiedDesc: 'रोगी की स्थिति और लाइव एम्बुलेंस ट्रैकिंग व्हाट्सएप और मैसेंजर द्वारा भेजी गई है',
    whatsappMessengerSent: 'व्हाट्सएप और मैसेंजर द्वारा भेजा गया',
    openWhatsApp: 'व्हाट्सएप पर खोलें',
    openMessenger: 'मैसेंजर पर खोलें',
    messageContentLabel: 'प्रेषित संदेश प्रतिलिपि',

    callPatient: 'मरीज को कॉल करें',
    callingPatient: 'मरीज को कॉल किया जा रहा है...',
    patientPhone: 'मरीज का फोन',
    simulateCallModalTitle: 'अस्पताल आपातकालीन प्रेषण कॉलिंग',
    endCall: 'कॉल समाप्त करें',

    dualSplitView: 'डुअल व्यू',
    hospitalCommand: 'अस्पताल कमांड',
    resetSos: 'रीसेट करें',
    realTimeSync: 'रीयल-टाइम सिंक',
    consoleActive: 'कंसोल सक्रिय',
    authRequired: 'प्रमाणीकरण आवश्यक',
    bnsMonitored: 'बीएनएस और आईटी अधिनियम निगरानी',
    directHospitalSync: 'प्रत्यक्ष अस्पताल सिंक',

    suggestedCategories: 'सुझाई गई आपातकालीन श्रेणियां:',
    hideSuggestions: 'छिपाएं',
    emergencyChatTitle: 'आपातकालीन सहायता चैट और ट्राइएज',
    noDemoIncidents: 'कोई सक्रिय आपातकालीन घटना नहीं',
    noDemoIncidentsDesc: 'कमांड सेंटर रीयल-टाइम आपातकालीन अलर्ट की सक्रिय रूप से निगरानी कर रहा है।',
    noChatReports: 'अभी तक कोई एआई चैट रिपोर्ट नहीं',
    noChatReportsDesc: 'जब आप आपात स्थिति दर्ज करेंगे, तो आपकी ट्राइएज रिपोर्ट यहां सुरक्षित हो जाएगी।',

    hospitalCommandCenterTitle: 'अस्पताल आपातकालीन कमांड सेंटर',
    onlineDispatchReady: 'ऑनलाइन · प्रेषण तैयार',
    totalAmbulancesLabel: 'बेड़े में कुल एम्बुलेंस',
    occupiedAmbulancesLabel: 'वर्तमान में व्यस्त एम्बुलेंस',
    icuBedsLabel: 'आईसीयू बेड (कुल / उपलब्ध)',
    traumaBedsLabel: 'ट्रॉमा बेड (कुल / उपलब्ध)',
    generalBedsLabel: 'सामान्य बेड (कुल / उपलब्ध)',
    facilitiesLabel: 'उपलब्ध चिकित्सा सुविधाएं',
    contactDetailsLabel: 'आपातकालीन डेस्क संपर्क जानकारी',
    saveSettingsBtn: 'सेटिंग्स सहेजें',
    closeBtn: 'बंद करें'
  }
};
