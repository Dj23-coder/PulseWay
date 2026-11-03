import { HospitalProfile, SurvivalGuideEmergency, UserProfile, AIChatRecord } from '../types';

export const INITIAL_USER_PROFILE: UserProfile = {
  fullName: 'Arjun Ramesh Rao',
  dob: '12/06/1994',
  mobile: '9845012345',
  email: 'arjun.rao@example.com',
  age: 32,
  sex: 'Male',
  height: '178 cm',
  weight: '74 kg',
  bloodGroup: 'O+',
  allergies: ['Penicillin / Antibiotics', 'Dust / Asthma'],
  customAllergies: ['Sulfa drugs'],
  emergencyContacts: [
    {
      id: 'ec-1',
      fullName: 'Ramesh Rao',
      mobile: '9845098765',
      relationship: 'Dad',
      priority: 1
    },
    {
      id: 'ec-2',
      fullName: 'Ananya Rao',
      mobile: '9880011223',
      relationship: 'Wife',
      priority: 2
    }
  ],
  permanentAddress: '#42, 7th Cross, Indiranagar 100ft Road, Bengaluru, Karnataka - 560038',
  gpsConsentConfirmed: true,
  gpsConsentTimestamp: '2026-10-25T08:30:00Z',
  primaryHospitalPreference: 'hosp-1'
};

export const INITIAL_HOSPITALS: HospitalProfile[] = [
  {
    id: 'hosp-1',
    name: 'Manipal Super Specialty & Trauma Institute',
    phone: '+91 80 2502 4444',
    email: 'emergency.desk@manipalhospitals.demo',
    address: '98 HAL Old Airport Rd, Kodihalli, Bengaluru, Karnataka 560017',
    type: 'Private',
    avatarUrl: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=200',
    facilities: ['ICU', 'Trauma Centre', 'Cardiac', 'Neuro', 'Ortho', 'Gyno', 'Emergency Cases'],
    totalAmbulances: 14,
    occupiedAmbulances: 4,
    icuBedsTotal: 48,
    icuBedsAvailable: 9,
    generalBedsTotal: 180,
    generalBedsAvailable: 34,
    traumaBedsTotal: 24,
    traumaBedsAvailable: 6,
    avgResponseTimeMin: 7,
    isOnline: true,
    coordinates: { lat: 12.9592, lng: 77.6534, address: 'Old Airport Road, Bengaluru' }
  },
  {
    id: 'hosp-2',
    name: "Victoria Govt. Medical College & Trauma Care",
    phone: '+91 80 2670 1150',
    email: 'trauma.victoria@karnataka.gov.demo',
    address: 'Fort Road, Near City Market, Kalasipalya, Bengaluru 560002',
    type: 'Government',
    avatarUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=200',
    facilities: ['Trauma Centre', 'Emergency Cases', 'ICU', 'Ortho', 'General Surgery'],
    totalAmbulances: 20,
    occupiedAmbulances: 8,
    icuBedsTotal: 60,
    icuBedsAvailable: 14,
    generalBedsTotal: 400,
    generalBedsAvailable: 82,
    traumaBedsTotal: 36,
    traumaBedsAvailable: 11,
    avgResponseTimeMin: 9,
    isOnline: true,
    coordinates: { lat: 12.9628, lng: 77.5755, address: 'Kalasipalya, Bengaluru' }
  },
  {
    id: 'hosp-3',
    name: 'Apollo Hospital & Heart Center',
    phone: '+91 80 2630 4050',
    email: 'cardiac.dispatch@apollo.demo',
    address: '154/11 Bannerghatta Main Rd, Krishnaraju Layout, Bengaluru 560076',
    type: 'Private',
    avatarUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=200',
    facilities: ['Cardiac', 'ICU', 'Trauma Centre', 'Emergency Cases'],
    totalAmbulances: 12,
    occupiedAmbulances: 3,
    icuBedsTotal: 38,
    icuBedsAvailable: 8,
    generalBedsTotal: 160,
    generalBedsAvailable: 29,
    traumaBedsTotal: 18,
    traumaBedsAvailable: 5,
    avgResponseTimeMin: 6,
    isOnline: true,
    coordinates: { lat: 12.8953, lng: 77.5988, address: 'Bannerghatta Road, Bengaluru' }
  }
];

export const SURVIVAL_GUIDE_DATA: SurvivalGuideEmergency[] = [
  {
    id: 'heart-attack',
    title: 'Heart Attack / Cardiac Arrest',
    kannadaTitle: 'ಹೃದಯಾಘಾತ (Heart Attack)',
    hindiTitle: 'दिल का दौरा (Heart Attack)',
    category: 'Cardiovascular',
    aloneInstructions: [
      'Immediately stop all physical activity. Sit down on the floor or lean against a solid wall to prevent falling if you faint.',
      'Loosen all tight clothing around your collar, chest, and belt to ease breathing effort.',
      'If you have Disprin / Aspirin (300mg) and are NOT allergic, chew it thoroughly before swallowing—do not swallow whole.',
      'Take slow, deep breaths. Do NOT attempt to cough vigorously as this strains the heart unless explicitly instructed by a paramedic.',
      'Unlock your main front door immediately so emergency personnel can enter without breaking in.'
    ],
    assistedInstructions: [
      'Position the patient in a half-sitting position with knees bent and back well supported.',
      'If the patient becomes unresponsive and stops normal breathing, immediately initiate CPR: 100-120 chest compressions per minute at center of chest.',
      'Give chewable Aspirin 300mg if the patient is fully conscious and has no allergy or internal bleeding history.',
      'Do not give water or allow the patient to stand or walk under any circumstances.'
    ],
    emergencyMedicines: ['Aspirin (300 mg chewable)', 'Sorbitrate (5 mg sublingual under doctor advice)', 'Oxygen therapy on arrival'],
    bestPractices: [
      'Act within the Golden Hour (first 60 minutes).',
      'Keep patient calm; panic spikes adrenaline and accelerates cardiac ischemia.'
    ],
    dangerSigns: ['Crushing chest pressure radiating to left arm/jaw', 'Cold profuse sweating', 'Cyanosis (blue lips)']
  },
  {
    id: 'accident-trauma',
    title: 'Road Accident & Polytrauma',
    kannadaTitle: 'ರಸ್ತೆ ಅಪಘಾತ ಮತ್ತು ತೀವ್ರ ಗಾಯ (Accident & Trauma)',
    hindiTitle: 'सड़क दुर्घटना एवं गंभीर चोट (Accident & Trauma)',
    category: 'Trauma',
    aloneInstructions: [
      'If on a busy road and you can move safely, move off the active vehicle carriageway to the footpath or curb.',
      'Keep your head, neck, and spine as still as possible. Do not shake your head violently.',
      'If bleeding heavily, press your palm firmly against the wound using any clean garment or cloth.',
      'Stay seated on the ground; do not try to stand up immediately as internal bleeding or shock can cause sudden collapse.'
    ],
    assistedInstructions: [
      'DO NOT remove a motorcycle helmet unless the airway is critically obstructed and breathing has stopped.',
      'Do NOT move or drag the victim unless there is imminent fire or explosion hazard—protect the cervical spine.',
      'Apply direct, continuous firm pressure over any arterial or heavy bleeding wound using sterile gauze or clean cloth.',
      'Keep the injured person warm with a jacket or sheet to prevent hypothermic shock.'
    ],
    emergencyMedicines: ['Sterile compressive trauma bandage', 'Tourniquet for severe limb hemorrhage', 'IV normal saline / Ringer Lactate via EMS'],
    bestPractices: [
      'Keep cervical collar aligned.',
      'Never give water or oral fluids to a trauma victim before surgical evaluation.'
    ],
    dangerSigns: ['Bleeding from ears or nose', 'Inability to move limbs', 'Pale, clammy skin with rapid weak pulse']
  },
  {
    id: 'labor-pain',
    title: 'Emergency Labor & Childbirth',
    kannadaTitle: 'ಪ್ರಸವ ವೇದನೆ (Labor Pain & Childbirth)',
    hindiTitle: 'प्रसव पीड़ा (Labor Pain & Childbirth)',
    category: 'Obstetrics',
    aloneInstructions: [
      'Sit or lie on your left side on a clean bed or soft rug with clean towels underneath you.',
      'Breathe slowly through your nose and exhale softly through pursed lips during contractions.',
      'Time the intervals between contractions. If contractions are under 3 minutes apart or you feel rectal pressure, birth is imminent.',
      'Unlock the front door and keep your phone and hospital bag within reach.'
    ],
    assistedInstructions: [
      'Support the mother in a comfortable semi-reclining or hands-and-knees position on clean dry towels or sheets.',
      'If the baby’s head is crowning, support the head gently with clean hands; do NOT pull on the baby or force delivery.',
      'Once delivered, dry the baby immediately with clean warm cloths and place baby directly skin-to-skin on the mother’s chest.',
      'Do NOT cut or pull the umbilical cord; wait for the ambulance paramedics with sterile clamps.'
    ],
    emergencyMedicines: ['Sterile delivery kit', 'Clean warm receiving towels', 'Oxytocin (administered only by skilled EMS/doctor)'],
    bestPractices: [
      'Wash hands thoroughly with soap or antiseptic before assisting.',
      'Keep both mother and newborn warmly insulated against cold draft.'
    ],
    dangerSigns: ['Bright red continuous vaginal hemorrhage', 'Severe headache with visual disturbance (Preeclampsia)', 'Cord prolapse']
  },
  {
    id: 'seizures',
    title: 'Seizures & Convulsions',
    kannadaTitle: 'ಮೂರ್ಛೆ ರೋಗ / ಫಿಟ್ಸ್ (Seizures / Fits)',
    hindiTitle: 'दौरे पड़ना / मिर्गी (Seizures / Fits)',
    category: 'Neurology',
    aloneInstructions: [
      'If you feel an aura or warning sign, immediately lower yourself to the floor on a soft surface away from stairs and sharp edges.',
      'Loosen any tight collars, neckties, or scarves.',
      'Lie gently on your left side (recovery position) so saliva can drain freely.'
    ],
    assistedInstructions: [
      'Gently ease the person to the ground and turn them onto their side (recovery position) to keep the airway open.',
      'Clear the surrounding area of furniture, glass, or hard objects that could cause injury.',
      'DO NOT hold them down or try to restrain their convulsive movements.',
      'DO NOT put any object, spoon, finger, or cloth into their mouth—this can fracture teeth or block the trachea.',
      'Time the seizure; if it lasts longer than 5 minutes or recurs without regaining consciousness, it is a life-threatening Status Epilepticus.'
    ],
    emergencyMedicines: ['Midazolam nasal spray (if prescribed for patient)', 'Lorazepam IV administered by ALS unit'],
    bestPractices: [
      'Place a folded jacket or soft cushion under their head.',
      'Stay with the person until they are fully awake and reoriented.'
    ],
    dangerSigns: ['Seizure lasting > 5 minutes', 'Difficulty breathing after seizure stops', 'Victim pregnant or injured']
  },
  {
    id: 'snake-bites',
    title: 'Venomous Snake Bite',
    kannadaTitle: 'ಹಾವು ಕಡಿತ (Snake Bite)',
    hindiTitle: 'सांप का काटना (Snake Bite)',
    category: 'Toxicology',
    aloneInstructions: [
      'Remain completely calm and still. Physical movement and rapid heart rate pump venom rapidly through the lymphatic channels.',
      'Remove all rings, watches, bracelets, or tight shoes immediately before swelling starts.',
      'Keep the bitten limb immobilized at or slightly below the level of your heart.'
    ],
    assistedInstructions: [
      'Immobilize the bitten limb using a splint or firm cardboard without applying a tight blood-choking tourniquet.',
      'DO NOT cut the fang marks or attempt to suck out the venom with your mouth or suction devices.',
      'DO NOT apply ice, electricity, or herbal pastes to the wound.',
      'Transport the victim immediately to the nearest hospital stocked with Polyvalent Anti-Snake Venom (ASV).'
    ],
    emergencyMedicines: ['Polyvalent Anti-Snake Venom (ASV) - Hospital only', 'Tetanus toxoid booster', 'IV Neostigmine for neurotoxic bites'],
    bestPractices: [
      'Note the snake’s color and head shape from a safe distance if possible, but do NOT risk catching it.',
      'Keep the patient as motionless as possible.'
    ],
    dangerSigns: ['Drooping eyelids (Ptosis)', 'Difficulty swallowing or breathing', 'Rapidly spreading swelling and dark discoloration']
  },
  {
    id: 'strokes',
    title: 'Stroke (Brain Attack)',
    kannadaTitle: 'ಪಾರ್ಶ್ವವಾಯು / ಸ್ಟ್ರೋಕ್ (Stroke)',
    hindiTitle: 'लकवा / स्ट्रोक (Stroke)',
    category: 'Neurology',
    aloneInstructions: [
      'Check FAST: Can you smile evenly? Can you raise both arms? Is speech slurred? If yes, every minute counts.',
      'Sit or lie on your side with head slightly elevated. Do NOT take Aspirin—if this is a hemorrhagic bleed, Aspirin can be fatal.',
      'Do not eat or drink anything because swallowing reflexes may be paralyzed.'
    ],
    assistedInstructions: [
      'Perform FAST test: Face drooping, Arm weakness, Speech difficulty, Time to call.',
      'Keep patient lying down on their side with head elevated 15-30 degrees.',
      'Note the exact time symptoms began—clot-busting thrombolytic therapy requires arrival within a 4.5-hour window.',
      'Do NOT administer Aspirin, blood pressure pills, or water.'
    ],
    emergencyMedicines: ['Tissue Plasminogen Activator (tPA) / Tenecteplase - CT verified in hospital', 'Blood pressure management in ICU'],
    bestPractices: [
      'Every minute saves 1.9 million brain neurons.',
      'Take patient directly to a stroke-ready hospital equipped with 24/7 CT scan.'
    ],
    dangerSigns: ['Complete loss of movement on one side', 'Inability to speak or comprehend', 'Sudden thunderclap headache']
  },
  {
    id: 'chemical-burns',
    title: 'Chemical & Thermal Burns',
    kannadaTitle: 'ರಾಸಾಯನಿಕ ಮತ್ತು ಬೆಂಕಿ ಸುಟ್ಟ ಗಾಯಗಳು (Chemical Burns)',
    hindiTitle: 'रासायनिक एवं आग से जलना (Chemical Burns)',
    category: 'Dermatology & Trauma',
    aloneInstructions: [
      'Immediately flush the burned area under cool, clean, running tap water for at least 20 continuous minutes.',
      'Carefully brush off dry chemical powders before flushing with water.',
      'Remove chemical-soaked clothing and jewelry unless it is melted and adhered directly to burned skin.',
      'Do not apply toothpaste, butter, ice, or oil.'
    ],
    assistedInstructions: [
      'Flush eyes or skin continuously with sterile saline or copious clean tap water for 20 minutes.',
      'Cover the rinsed burn gently with a clean, sterile, non-adherent dressing or clean plastic wrap.',
      'Keep the patient warm away from the water spray to prevent hypothermia.',
      'Never burst or prick burn blisters.'
    ],
    emergencyMedicines: ['Silver Sulfadiazine burn dressing (hospital)', 'Copious isotonic saline eye flush', 'Pain analgesics via EMS'],
    bestPractices: [
      'Flush with cool water, never ice water.',
      'Identify chemical name or container label to inform doctors on arrival.'
    ],
    dangerSigns: ['Burns over face, hands, groin, or joints', 'Inhalation burns (soot in nose/cough)', 'Circumferential burns around limb']
  },
  {
    id: 'bleeding',
    title: 'Severe Bleeding & Hemorrhage',
    kannadaTitle: 'ತೀವ್ರ ರಕ್ತಸ್ರಾವ (Severe Bleeding)',
    hindiTitle: 'गंभीर रक्तस्राव (Severe Bleeding)',
    category: 'Vascular & Trauma',
    aloneInstructions: [
      'Press firmly directly over the bleeding wound using a clean pad, cloth, or your bare hand if nothing else is available.',
      'Do not let up on the pressure—maintain firm, unwavering compression for at least 10-15 minutes.',
      'If the wound is on an arm or leg, elevate the limb above heart level while continuing pressure.',
      'Lie down to keep blood circulating to your vital organs and brain.'
    ],
    assistedInstructions: [
      'Apply direct, heavy manual pressure directly into the wound using sterile dressing or clean cloth.',
      'If bleeding soaks through the dressing, do NOT remove the first dressing; add more layers on top and press harder.',
      'For severe, spurting arterial limb wounds where direct pressure fails, apply a commercial tourniquet 2-3 inches above the wound (not over a joint).',
      'Keep the patient warm and reassure them calmly.'
    ],
    emergencyMedicines: ['Hemostatic gauze (QuikClot / Celox)', 'Arterial tourniquet', 'Tranexamic Acid (TXA) via paramedic'],
    bestPractices: [
      'Firm direct pressure stops over 90% of bleeds.',
      'Record the exact time a tourniquet was tightened.'
    ],
    dangerSigns: ['Pulsatile spurting bright red blood', 'Patient dizzy, confused, or losing consciousness', 'Extremity cold and white']
  }
];
export const INITIAL_AI_CHAT_RECORDS: AIChatRecord[] = [];
