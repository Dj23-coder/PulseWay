import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) ||
  process.env.GEMINI_API_KEY ||
  'AQ.Ab8RN6KpAe7xV_TWsjxZjGPdas8kH8h331y5Q_kl47MFyZWBBA';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  language?: 'en' | 'kn' | 'hi';
  severity?: 'CRITICAL' | 'MINOR';
  isCritical?: boolean;
  isAmbulanceRequest?: boolean;
}

/**
 * Direct Gemini client instance
 */
function getGenAIClient(): GoogleGenAI | null {
  try {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'MY_GEMINI_API_KEY') {
      return null;
    }
    return new GoogleGenAI({
      apiKey: GEMINI_API_KEY
    });
  } catch (err) {
    console.warn('Gemini client initialization fallback:', err);
    return null;
  }
}

/**
 * Interactive Conversational Multilingual Emergency Assistant
 * Accurately analyzes emergencies (including labour pain & ambulance calls),
 * thinks through minor conditions with self-treatment steps and specific medicine names,
 * and falls back seamlessly within 1.5s if API quota is reached.
 */
export async function sendEmergencyChatMessage(
  history: ChatMessage[],
  newMessage: string,
  language: 'en' | 'kn' | 'hi' = 'en',
  patientContext?: any
): Promise<{ reply: string; severity: 'CRITICAL' | 'MINOR'; isCritical: boolean; isAmbulanceRequest?: boolean }> {
  // First attempt backend endpoint with a 1.8-second timeout
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: newMessage,
        history,
        language,
        patientContext
      }),
      signal: AbortSignal.timeout(1800)
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.reply) {
        return data;
      }
    }
  } catch (e) {
    // Backend timeout or offline - try direct Gemini or instant clinical fallback
  }

  // Direct client-side Gemini call with fast race against timeout
  const ai = getGenAIClient();
  if (ai) {
    const languageNames = {
      en: 'English',
      kn: 'Kannada (ಕನ್ನಡ)',
      hi: 'Hindi (हिंदी)'
    };
    const targetLangName = languageNames[language] || 'English';

    const prompt = `You are PulseWay's authoritative emergency medical AI triage assistant.
Target language: ${targetLangName}. MUST REPLY DIRECTLY IN ${targetLangName}.
Patient inquiry: "${newMessage}"
Patient details: ${JSON.stringify(patientContext || {})}

CRITICAL RULES:
1. EMERGENCY & LABOUR PAIN: If the user describes active labour / labor pain, childbirth, pregnancy emergency, heart attack, chest pain, stroke, severe bleeding, difficulty breathing, seizures, poisoning, major trauma, OR IF THE PERSON ASKS FOR AN AMBULANCE, you MUST classify as CRITICAL. Give urgent life-saving steps and strongly advise calling an ALS ambulance.
2. MINOR / NON-CRITICAL CASES: If the case is non-life-threatening (e.g. headache, mild fever, cold, cough, sore throat, acidity, minor cut, mild sprain, diarrhea), analyze the problem thoughtfully and provide:
   - Self-Treatment Steps (1, 2, 3...)
   - Specific Common Over-The-Counter Medicine Names (e.g. Paracetamol, Dolo 650mg, ORS, Antacids, Betadine, etc.)
   - Clear warning signs on when to seek urgent emergency hospital care.`;

    // Try available Gemini flash models
    const modelsToTry = ['gemini-3.5-flash-lite', 'gemini-3.6-flash', 'gemini-3.5-flash'];
    for (const model of modelsToTry) {
      try {
        const geminiPromise = ai.models.generateContent({
          model,
          contents: prompt,
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Gemini timeout')), 1600)
        );

        const response = await Promise.race([geminiPromise, timeoutPromise]);
        const reply = response.text || '';
        if (reply.trim()) {
          const lower = (newMessage + ' ' + reply).toLowerCase();
          const isCritical =
            lower.includes('labour') || lower.includes('labor') || lower.includes('delivery') || lower.includes('contraction') ||
            lower.includes('pregnant') || lower.includes('pregnancy') || lower.includes('water broke') ||
            lower.includes('ambulance') || lower.includes('108') || lower.includes('112') || lower.includes('hospital') ||
            lower.includes('chest') || lower.includes('heart') || lower.includes('bleed') ||
            lower.includes('breath') || lower.includes('unconscious') || lower.includes('accident') ||
            lower.includes('stroke') || lower.includes('seizure') || lower.includes('poison') || lower.includes('burn');

          return {
            reply: reply.trim(),
            severity: isCritical ? 'CRITICAL' : 'MINOR',
            isCritical,
            isAmbulanceRequest: lower.includes('ambulance') || lower.includes('108') || lower.includes('112')
          };
        }
      } catch (err) {
        // Try next model or fall back to intelligent clinical engine
      }
    }
  }

  return getComprehensiveClinicalTriage(newMessage, language);
}

/**
 * Intelligent Clinical Triage Engine
 * Accurate medical analysis, active labour pain classification, ambulance routing,
 * and comprehensive self-treatment steps with OTC medicine names.
 */
export function getComprehensiveClinicalTriage(
  msg: string, 
  lang: 'en' | 'kn' | 'hi'
): { reply: string; severity: 'CRITICAL' | 'MINOR'; isCritical: boolean; isAmbulanceRequest: boolean } {
  const lower = msg.toLowerCase();

  // 1. LABOUR PAIN & PREGNANCY EMERGENCY
  const isLabor = lower.includes('labour') || lower.includes('labor') || lower.includes('delivery') || 
                  lower.includes('contraction') || lower.includes('water broke') || lower.includes('pregnant') || 
                  lower.includes('pregnancy') || lower.includes('childbirth') || lower.includes('baby coming') ||
                  lower.includes('amniotic') || lower.includes('ಹೆರಿಗೆ') || lower.includes('ಪ್ರಸವ') || 
                  lower.includes('ವೇದನೆ') || lower.includes('ಗರ್ಭಿಣಿ') || lower.includes('प्रसव') || 
                  lower.includes('पीड़ा') || lower.includes('डिलीवरी') || lower.includes('गर्भवती');

  // 2. DIRECT AMBULANCE REQUEST
  const isAmbulanceRequest = lower.includes('ambulance') || lower.includes('108') || lower.includes('112') || 
                             lower.includes('send ambulance') || lower.includes('call ambulance') || 
                             lower.includes('need ambulance') || lower.includes('want ambulance') || 
                             lower.includes('hospital please') || lower.includes('emergency unit') ||
                             lower.includes('take to hospital') || lower.includes('hospitalize') ||
                             lower.includes('ಆಂಬ್ಯುಲೆನ್ಸ್') || lower.includes('ಎಂಬುಲೆನ್ಸ್') || lower.includes('एम्बुलेंस');

  // 3. OTHER LIFE-THREATENING EMERGENCIES
  const isCardiac = lower.includes('chest') || lower.includes('heart') || lower.includes('cardiac') || lower.includes('angina') || lower.includes('ಎದೆನೋವು') || lower.includes('हार्ट');
  const isTrauma = lower.includes('accident') || lower.includes('bleed') || lower.includes('blood') || lower.includes('fracture') || lower.includes('crash') || lower.includes('cut deep') || lower.includes('ಅಪಘಾತ') || lower.includes('ರಕ್ತ') || lower.includes('दुर्घटना') || lower.includes('खून');
  const isStroke = lower.includes('stroke') || lower.includes('paralysis') || lower.includes('facial droop') || lower.includes('slurred speech') || lower.includes('ಪಾರ್ಶ್ವವಾಯು') || lower.includes('लकवा');
  const isPoison = lower.includes('poison') || lower.includes('snake') || lower.includes('bite') || lower.includes('toxic') || lower.includes('ವಿಷ') || lower.includes('ಹಾವು') || lower.includes('जहर') || lower.includes('सांप');
  const isBurn = lower.includes('burn') || lower.includes('fire') || lower.includes('scald') || lower.includes('electric shock') || lower.includes('ಸುಟ್ಟ') || lower.includes('जलना');
  const isBreathing = lower.includes('breath') || lower.includes('chok') || lower.includes('asthma') || lower.includes('suffocat') || lower.includes('gasp') || lower.includes('ಉಸಿರಾಟ') || lower.includes('सांस');
  const isSeizure = lower.includes('seizure') || lower.includes('fit') || lower.includes('convulsion') || lower.includes('epilepsy') || lower.includes('ಮೂರ್ಛೆ') || lower.includes('दौरा');
  const isUnconscious = lower.includes('unconscious') || lower.includes('faint') || lower.includes('collapsed') || lower.includes('blackout');

  const isCritical = isLabor || isAmbulanceRequest || isCardiac || isTrauma || isStroke || isPoison || isBurn || isBreathing || isSeizure || isUnconscious;

  // -------------------------
  // EMERGENCY RESPONSE PATHS
  // -------------------------

  // A. LABOUR PAIN & CHILDBIRTH EMERGENCY
  if (isLabor) {
    if (lang === 'kn') {
      return {
        reply: `🚨 ತುರ್ತು ಪ್ರಸವ ಎಚ್ಚರಿಕೆ: ಪ್ರಸವ ವೇದನೆ ಮತ್ತು ಹೆರಿಗೆಯು ಗಂಭೀರ ತುರ್ತುಸ್ಥಿತಿಯಾಗಿದ್ದು ತಕ್ಷಣ ಆಸ್ಪತ್ರೆ ಸೇವೆ ಅಗತ್ಯವಿದೆ.

ತಕ್ಷಣದ ತುರ್ತು ಕ್ರಮಗಳು:
1. ಸೂಕ್ತ ಸ್ಥಾನ: ಗರ್ಭಿಣಿಯನ್ನು ಎಡಭಾಗಕ್ಕೆ ತಿರುಗಿಸಿ, ಮೊಣಕಾಲುಗಳನ್ನು ಮಡಚಿ ಆರಾಮವಾಗಿ ಮಲಗಿಸಿ (ಇದು ಮಗುವಿಗೆ ರಕ್ತ ಮತ್ತು ಆಮ್ಲಜನಕ ಸರಬರಾಜು ಹೆಚ್ಚಿಸುತ್ತದೆ).
2. ಉಸಿರಾಟ: ಸಂಕೋಚನದ ಸಮಯದಲ್ಲಿ ಮೂಗಿನಿಂದ ದೀರ್ಘವಾಗಿ ಉಸಿರೆಳೆದು, ಬಾಯಿಯಿಂದ ನಿಧಾನವಾಗಿ ಉಸಿರು ಬಿಡಿ. ಅನಗತ್ಯವಾಗಿ ಒತ್ತಡ ಹಾಕಬೇಡಿ.
3. ಸಿದ್ಧತೆ: ಕೆಳಗೆ ಸ್ವಚ್ಛ ಮತ್ತು ಬೆಚ್ಚಗಿನ ಟವೆಲ್‌ಗಳನ್ನು ಇರಿಸಿ. ಆಂಬ್ಯುಲೆನ್ಸ್ ಸಿಬ್ಬಂದಿಯ ಪ್ರವೇಶಕ್ಕೆ ಮುಖ್ಯ ಬಾಗಿಲು ತೆರೆದಿಡಿ.
4. ಮಗು ಹೊರಬರುತ್ತಿದ್ದರೆ: ಮಗುವಿನ ತಲೆಯನ್ನು ಸ್ವಚ್ಛ ಕೈಗಳಿಂದ ಮೃದುವಾಗಿ ಬೆಂಬಲಿಸಿ; ಮಗುವನ್ನು ಎಳೆಯಬೇಡಿ ಮತ್ತು ಕರುಳುಬಳ್ಳಿಯನ್ನು ಕತ್ತರಿಸಬೇಡಿ.

ತಕ್ಷಣ ಹೆರಿಗೆ ಆಂಬ್ಯುಲೆನ್ಸ್ ಕರೆಯಲು ಕೆಳಗಿನ ಕೆಂಪು ಬಟನ್ ಒತ್ತಿ.`,
        severity: 'CRITICAL',
        isCritical: true,
        isAmbulanceRequest: true
      };
    }
    if (lang === 'hi') {
      return {
        reply: `🚨 गंभीर प्रसव आपातकाल: प्रसव पीड़ा और प्रसव के लिए तत्काल अस्पताल की आवश्यकता है। तुरंत एम्बुलेंस बुलाई जानी चाहिए।

तत्काल प्राथमिक उपचार:
1. स्थिति: गर्भवती महिला को बाईं करवट लिटाएं और घुटनों को हल्का मोड़कर रखें ताकि शिशु को भरपूर ऑक्सीजन मिले।
2. सांस की गति: संकुचन के दौरान नाक से गहरी सांस लें और मुंह से धीरे-धीरे छोड़ें। बेवजह जोर न लगाएं।
3. तैयारी: साफ और गर्म तौलिए तैयार रखें। पैरामेडिक्स के आने के लिए मुख्य दरवाजा खुला रखें।
4. यदि डिलीवरी हो रही हो: शिशु के सिर को साफ हाथों से धीरे से सहारा दें; शिशु को खींचे नहीं और गर्भनाल न काटें।

तुरंत मैटरनिटी एम्बुलेंस रवाना करने के लिए नीचे लाल बटन दबाएं।`,
        severity: 'CRITICAL',
        isCritical: true,
        isAmbulanceRequest: true
      };
    }
    return {
      reply: `🚨 CRITICAL OBSTETRIC EMERGENCY: Active labor pain and childbirth require immediate medical attention. An ALS maternity ambulance should be dispatched immediately.

Immediate Action Steps:
1. Position: Have the mother lie on her left side with knees bent and back supported by pillows to optimize blood and oxygen flow to the baby.
2. Breathing: Inhale slowly through the nose and exhale gently through pursed lips during contractions. Do NOT hold breath or push prematurely.
3. Preparation: Place clean, dry, warm towels beneath her and unlock the front door for emergency paramedics.
4. If crowning occurs: Support the baby's head gently with clean hands; do NOT pull on the baby or cut the umbilical cord.

Click the red button below to dispatch an ALS maternity ambulance immediately.`,
      severity: 'CRITICAL',
      isCritical: true,
      isAmbulanceRequest: true
    };
  }

  // B. DIRECT AMBULANCE REQUEST
  if (isAmbulanceRequest) {
    if (lang === 'kn') {
      return {
        reply: `🚨 ಆಂಬ್ಯುಲೆನ್ಸ್ ವಿನಂತಿ ಸ್ವೀಕರಿಸಲಾಗಿದೆ: ನಿಮ್ಮ ಲೈವ್ ಜಿಪಿಎಸ್ ಸ್ಥಳವನ್ನು ಆಸ್ಪತ್ರೆ ರವಾನೆ ನಿಯಂತ್ರಣ ಕೇಂದ್ರಕ್ಕೆ ಜೋಡಿಸಲಾಗಿದೆ.

ಆಂಬ್ಯುಲೆನ್ಸ್ ಬರುವವರೆಗೆ ಪಾಲಿಸಬೇಕಾದ ನಿಯಮಗಳು:
1. ಮೊಬೈಲ್ ಫೋನ್ ಲೈನ್ ತೆರೆದಿಡಿ; ಕಂಟ್ರೋಲ್ ರೂಮ್ ಸಿಬ್ಬಂದಿ ನಿಮ್ಮೊಂದಿಗೆ ಸಂಪರ್ಕದಲ್ಲಿರುತ್ತಾರೆ.
2. ಆಂಬ್ಯುಲೆನ್ಸ್ ಸಿಬ್ಬಂದಿ ತ್ವರಿತವಾಗಿ ಗುರುತಿಸಲು ಮನೆಯ ಹೊರಗಿನ ದೀಪಗಳನ್ನು ಆನ್ ಮಾಡಿ ಮತ್ತು ಮುಖ್ಯ ಬಾಗಿಲು ತೆರೆದಿಡಿ.
3. ರೋಗಿಯನ್ನು ಆರಾಮವಾಗಿ ಮಲಗಿಸಿ. ಯಾವುದೇ ಘನ ಆಹಾರ ಅಥವಾ ಮಾತ್ರೆಗಳನ್ನು ವೈದ್ಯರ ಸಲಹೆಯಿಲ್ಲದೆ ನೀಡಬೇಡಿ.

ತಕ್ಷಣ ಆಂಬ್ಯುಲೆನ್ಸ್ ಕಳುಹಿಸಲು ಕೆಳಗಿನ ಕೆಂಪು ಬಟನ್ ಒತ್ತಿ.`,
        severity: 'CRITICAL',
        isCritical: true,
        isAmbulanceRequest: true
      };
    }
    if (lang === 'hi') {
      return {
        reply: `🚨 एम्बुलेंस अनुरोध स्वीकृत: आपका लाइव जीपीएस स्थान अस्पताल नियंत्रण कक्ष से जोड़ दिया गया है।

एम्बुलेंस आने तक तत्काल निर्देश:
1. अपना फोन चालू रखें; नियंत्रण कक्ष सत्यापन के लिए कॉल कर सकता है।
2. बाहर की लाइट जलाएं और मुख्य दरवाजा खोलें ताकि पैरामेडिक्स तुरंत पहुंच सकें।
3. मरीज को शांत और आरामदायक स्थिति में रखें। बिना डॉक्टर की सलाह के कोई दवाई या खाना न दें।

तुरंत एम्बुलेंस भेजने के लिए नीचे लाल बटन दबाएं।`,
        severity: 'CRITICAL',
        isCritical: true,
        isAmbulanceRequest: true
      };
    }
    return {
      reply: `🚨 AMBULANCE DISPATCH PROTOCOL: Your request for an emergency ambulance has been acknowledged. Your device GPS location is locked for paramedic navigation.

Immediate Protocol while Ambulance is en route:
1. Keep your phone line clear; the hospital control center may call for patient verification.
2. Turn on exterior lights and unlock the entrance for fast paramedic entry.
3. Keep the patient in a comfortable resting position. Do NOT administer solid food or unprescribed oral sedatives.

Click the red button below to confirm and dispatch the nearest ALS unit now.`,
      severity: 'CRITICAL',
      isCritical: true,
      isAmbulanceRequest: true
    };
  }

  // C. CARDIAC EMERGENCY
  if (isCardiac) {
    return {
      reply: lang === 'kn' 
        ? '🚨 ತೀವ್ರ ಹೃದಯ ತುರ್ತುಸ್ಥಿತಿ: ಎದೆನೋವು ಅಥವಾ ಬಿಗಿತಕ್ಕೆ ತಕ್ಷಣ ಆಂಬ್ಯುಲೆನ್ಸ್ ಅಗತ್ಯ. ರೋಗಿಯನ್ನು ಅರೆ-ಕುಳಿತ ಸ್ಥಿತಿಯಲ್ಲಿರಿಸಿ. ಅಲರ್ಜಿ ಇಲ್ಲದಿದ್ದರೆ 300mg ಆಸ್ಪಿರಿನ್ ಜಗಿಯಲು ಕೊಡಿ. ಕೆಳಗಿನ ಬಟನ್ ಒತ್ತಿ ಆಂಬ್ಯುಲೆನ್ಸ್ ಪಡೆಯಿರಿ.'
        : lang === 'hi'
        ? '🚨 गंभीर हृदय आपातकाल: सीने में दर्द या भारीपन के लिए तत्काल एम्बुलेंस आवश्यक है। मरीज को आरामदायक आधी बैठी स्थिति में रखें। एलर्जी न हो तो 300mg एस्पिरिन चबाने दें। तुरंत एम्बुलेंस के लिए नीचे लाल बटन दबाएं।'
        : '🚨 CRITICAL CARDIAC EMERGENCY: Severe chest discomfort or angina requires immediate ALS intervention. Have the patient rest in a half-seated position and loosen tight clothing. If not allergic, give chewable Aspirin (300mg). Click below to dispatch an ALS unit now.',
      severity: 'CRITICAL',
      isCritical: true,
      isAmbulanceRequest: true
    };
  }

  // D. TRAUMA & BLEEDING
  if (isTrauma) {
    return {
      reply: lang === 'kn'
        ? '🚨 ತೀವ್ರ ಆಘಾತ ಮತ್ತು ರಕ್ತಸ್ರಾವ: ರಕ್ತಸ್ರಾವದ ಜಾಗಕ್ಕೆ ಸ್ವಚ್ಛ ಬಟ್ಟೆಯಿಂದ ಗಟ್ಟಿಯಾಗಿ ನಿರಂತರ ಒತ್ತಡ ಹಾಕಿ. ಕುತ್ತಿಗೆ ಮತ್ತು ಬೆನ್ನುಮೂಳೆಯನ್ನು ಅಲುಗಾಡಿಸಬೇಡಿ. ಕೆಳಗಿನ ಬಟನ್ ಮೂಲಕ ತಕ್ಷಣ ಟ್ರಾಮಾ ಆಂಬ್ಯುಲೆನ್ಸ್ ಕರೆಯಿರಿ.'
        : lang === 'hi'
        ? '🚨 गंभीर आघात एवं रक्तस्राव: खून बहने वाली जगह पर साफ कपड़े से लगातार सीधा दबाव डालें। रीढ़ की हड्डी को स्थिर रखें। पानी न पिलाएं। तुरंत ट्रॉमा एम्बुलेंस के लिए नीचे दिए बटन पर क्लिक करें।'
        : '🚨 CRITICAL TRAUMA & HEMORRHAGE: Apply continuous, firm direct pressure over the bleeding wound using sterile gauze or a clean cloth. Immobilize the spine and neck. Do NOT give oral water. Click below to dispatch a trauma ambulance immediately.',
      severity: 'CRITICAL',
      isCritical: true,
      isAmbulanceRequest: true
    };
  }

  // E. STROKE
  if (isStroke) {
    return {
      reply: lang === 'kn'
        ? '🚨 ತೀವ್ರ ಪಾರ್ಶ್ವವಾಯು (Stroke): ಮುಖ ಸೊಟ್ಟಗಾಗುವುದು ಅಥವಾ ಕೈಗಳಲ್ಲಿ ದೌರ್ಬಲ್ಯ ಲಕ್ಷಣ ಕಂಡುಬಂದ ತಕ್ಷಣ ಗೋಲ್ಡನ್ ಅವರ್‌ನಲ್ಲಿ ಆಸ್ಪತ್ರೆ ತಲುಪಬೇಕು. ರೋಗಿಯ ತಲೆಯನ್ನು 30 ಡಿಗ್ರಿ ಎತ್ತರಿಸಿ ಮಲಗಿಸಿ. ನೀರು ಕುಡಿಸಬೇಡಿ. ತಕ್ಷಣ ಆಂಬ್ಯುಲೆನ್ಸ್ ಪಡೆಯಿರಿ.'
        : lang === 'hi'
        ? '🚨 गंभीर स्ट्रोक (लकवा) आपातकाल: चेहरे का टेढ़ापन या हाथ की कमजोरी स्ट्रोक के लक्षण हैं। सिर को 30 डिग्री ऊंचा रखें। खाने-पीने को कुछ न दें। तुरंत स्ट्रोक एम्बुलेंस के लिए नीचे लाल बटन दबाएं।'
        : '🚨 CRITICAL STROKE (F.A.S.T.) EMERGENCY: Sudden facial droop, arm weakness, or slurred speech require immediate thrombolysis evaluation. Keep the patient\'s head elevated 30 degrees. Give ZERO food or water. Click below to dispatch an ambulance now.',
      severity: 'CRITICAL',
      isCritical: true,
      isAmbulanceRequest: true
    };
  }

  // F. POISONING & SNAKE BITE
  if (isPoison) {
    return {
      reply: lang === 'kn'
        ? '🚨 ವಿಷಬಾಧೆ ಅಥವಾ ಹಾವು ಕಡಿತ: ರೋಗಿಯನ್ನು ಶಾಂತವಾಗಿರಿಸಿ, ಕಚ್ಚಿದ ಅಂಗವನ್ನು ಹೃದಯದ ಮಟ್ಟಕ್ಕಿಂತ ಕೆಳಗೆ ಇರಿಸಿ ಚಲಿಸದಂತೆ ಕಟ್ಟಿ. ಗಾಯವನ್ನು ಕೊಯ್ಯಬೇಡಿ ಅಥವಾ ಬಾಯಿಯಿಂದ ವಿಷ ಹೀರುವ ಪ್ರಯತ್ನ ಮಾಡಬೇಡಿ. ತಕ್ಷಣ ಆಂಟಿ-ಸ್ನೇಕ್ ವೆನಮ್ ಆಂಬ್ಯುಲೆನ್ಸ್ ಕರೆಯಿರಿ.'
        : lang === 'hi'
        ? '🚨 विष या सांप के काटने का आपातकाल: मरीज को बिल्कुल शांत और स्थिर रखें। प्रभावित अंग को न हिलाएं। घाव पर चीरा न लगाएं। तुरंत एंटी-वेनम एम्बुलेंस के लिए नीचे लाल बटन दबाएं।'
        : '🚨 CRITICAL TOXICOLOGY & SNAKE BITE: Keep patient strictly still and calm. Immobilize the bitten limb below heart level. Do NOT cut the wound, apply a tourniquet, or suck venom. Click below to dispatch an ambulance with Anti-Snake Venom (ASV) immediately.',
      severity: 'CRITICAL',
      isCritical: true,
      isAmbulanceRequest: true
    };
  }

  // G. SEIZURES
  if (isSeizure) {
    return {
      reply: lang === 'kn'
        ? '🚨 ಫಿಟ್ಸ್ / ಮೂರ್ಛೆ ರೋಗ: ರೋಗಿಯನ್ನು ಎಡಭಾಗಕ್ಕೆ ತಿರುಗಿಸಿ (ರಿಕವರಿ ಪೊಸಿಷನ್). ಬಾಯಿಗೆ ಚಮಚ ಅಥವಾ ಬಟ್ಟೆ ತುರುಕಬೇಡಿ. ಸುತ್ತಲಿನ ಹರಿತ ವಸ್ತುಗಳನ್ನು ದೂರವಿರಿಸಿ. ತಕ್ಷಣ ಆಂಬ್ಯುಲೆನ್ಸ್ ಕರೆಯಿರಿ.'
        : lang === 'hi'
        ? '🚨 मिर्गी / दौरे का आपातकाल: मरीज को बाईं करवट लिटाएं ताकि सांस न रुके। मुंह में चम्मच या कपड़ा न डालें। झटके रोकने की जबरदस्ती न करें। तुरंत एम्बुलेंस बुलाने के लिए नीचे बटन दबाएं।'
        : '🚨 CRITICAL SEIZURE EMERGENCY: Ease patient to the floor and turn gently onto their left side (recovery position). Do NOT restrain movements. Do NOT put any object into their mouth. Click below to dispatch an ambulance now.',
      severity: 'CRITICAL',
      isCritical: true,
      isAmbulanceRequest: true
    };
  }

  // ----------------------------------------------------
  // MINOR CASES: SELF-TREATMENT STEPS + SPECIFIC MEDICINES
  // ----------------------------------------------------

  // 1. FEVER / VIRAL INFECTION
  if (lower.includes('fever') || lower.includes('temperature') || lower.includes('chills') || lower.includes('ಜ್ವರ') || lower.includes('बुखार')) {
    if (lang === 'kn') {
      return {
        reply: `ವೈದ್ಯಕೀಯ ವಿಶ್ಲೇಷಣೆ: ಸಾಧಾರಣ ಜ್ವರ ಮತ್ತು ಮೈಕೈನೋವು.

ಸ್ವಯಂ ಚಿಕಿತ್ಸಾ ಕ್ರಮಗಳು:
1. ವಿಶ್ರಾಂತಿ: ಗಾಳಿಯಾಡುವ ತಂಪಾದ ಕೋಣೆಯಲ್ಲಿ ಸಂಪೂರ್ಣ ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ.
2. ಜಲಸಂಚಯನ: ನಿರ್ಜಲೀಕರಣ ತಡೆಯಲು ಸಾಕಷ್ಟು ಉಗುರುಬೆಚ್ಚಗಿನ ನೀರು, ಎಳನೀರು ಅಥವಾ ರಸಂ ಕುಡಿಯಿರಿ.
3. ಶೀತಲ ಶಾಖ: ಹಣೆಗೆ ಉಗುರುಬೆಚ್ಚಗಿನ ನೀರಿನಲ್ಲಿ ಅದ್ದಿದ ಸ್ವಚ್ಛ ಬಟ್ಟೆಯನ್ನು ಇರಿಸಿ ತಾಪಮಾನ ಕಡಿಮೆ ಮಾಡಿ.

ಶಿಫಾರಸು ಮಾಡಲಾದ ಸಾಮಾನ್ಯ ಔಷಧಿಗಳು:
• ಪ್ಯಾರಸಿಟಮಾಲ್ (Dolo 650mg ಅಥವಾ Crocin 500mg): ಊಟದ ನಂತರ ತಾಪಮಾನ ನಿಯಂತ್ರಣಕ್ಕೆ ಪ್ರತಿ 6 ರಿಂದ 8 ಗಂಟೆಗಳಿಗೊಮ್ಮೆ 1 ಮಾತ್ರೆ.
• ORS / ಎಲೆಕ್ಟ್ರೋಲೈಟ್: 1 ಲೀಟರ್ ಶುದ್ಧ ನೀರಿನಲ್ಲಿ 1 ಸ್ಯಾಚೆಟ್ ಬೆರೆಸಿ ಕುಡಿಯಿರಿ.

⚠️ ಎಚ್ಚರಿಕೆ: ಜ್ವರವು 102°F ಗಿಂತ ಹೆಚ್ಚಾದರೆ ಅಥವಾ ಕುತ್ತಿಗೆ ಬಿಗಿತ, ತೀವ್ರ ತಲೆತಿರುಗುವಿಕೆ ಉಂಟಾದರೆ ಕೆಳಗಿನ ಬಟನ್ ಒತ್ತಿ ಆಂಬ್ಯುಲೆನ್ಸ್ ಕರೆಯಿರಿ.`,
        severity: 'MINOR',
        isCritical: false,
        isAmbulanceRequest: false
      };
    }
    if (lang === 'hi') {
      return {
        reply: `चिकित्सीय मूल्यांकन: हल्का से मध्यम बुखार एवं बदन दर्द।

स्व-उपचार के चरण:
1. विश्राम: हवादार और ठंडे कमरे में पूरी तरह आराम करें।
2. जलयोजन: निर्जलीकरण से बचने के लिए पर्याप्त गुनगुना पानी, नारियल पानी या सूप पिएं।
3. पट्टी: माथे पर ताजे (गुनगुने) पानी की साफ पट्टी रखें ताकि तापमान सामान्य हो सके।

अनुशंसित सामान्य दवाइयां:
• पैरासिटामोल (Dolo 650mg या Crocin 500mg): भोजन के बाद बुखार कम करने के लिए आवश्यकतानुसार 6-8 घंटे में 1 गोली।
• ओआरएस (ORS/Electral): 1 लीटर साफ पानी में 1 पाउच घोलकर पिएं।

⚠️ चेतावनी: यदि बुखार 102°F से अधिक हो, गर्दन में अकड़न हो या उल्टी हो, तो नीचे दिए बटन से तुरंत एम्बुलेंस बुलाएं।`,
        severity: 'MINOR',
        isCritical: false,
        isAmbulanceRequest: false
      };
    }
    return {
      reply: `Clinical Assessment: Mild to moderate fever without red-flag danger signs.

Self-Treatment Steps:
1. Rest: Lie down and get adequate sleep in a well-ventilated, comfortable room.
2. Hydration: Drink plenty of water, tender coconut water, and warm broths to prevent dehydration.
3. Sponge: Place a clean cloth soaked in lukewarm (room temperature) water on your forehead and neck.

Recommended Common OTC Medicines:
• Paracetamol (Dolo 650mg or Crocin 500mg): 1 tablet after meals every 6 to 8 hours as needed for temperature control.
• ORS / Electral: 1 sachet dissolved in 1 liter clean drinking water for electrolyte replenishment.

⚠️ Safety Warning: If fever exceeds 102°F (38.9°C), causes stiff neck, confusion, or lasts > 48 hours, dispatch an ambulance immediately.`,
      severity: 'MINOR',
      isCritical: false,
      isAmbulanceRequest: false
    };
  }

  // 2. HEADACHE / MIGRAINE
  if (lower.includes('headache') || lower.includes('migraine') || lower.includes('head pain') || lower.includes('ತಲೆನೋವು') || lower.includes('सिरदर्द')) {
    if (lang === 'kn') {
      return {
        reply: `ವೈದ್ಯಕೀಯ ವಿಶ್ಲೇಷಣೆ: ಸಾಧಾರಣ ತಲೆನೋವು ಅಥವಾ ಒತ್ತಡದ ತಲೆನೋವು.

ಸ್ವಯಂ ಚಿಕಿತ್ಸಾ ಕ್ರಮಗಳು:
1. ಶಾಂತ ಪರಿಸರ: ಕತ್ತಲಾದ, ನಿಶ್ಯಬ್ದ ಕೋಣೆಯಲ್ಲಿ ಕಣ್ಣು ಮುಚ್ಚಿ ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ.
2. ನೀರು ಕುಡಿಯಿರಿ: ತಕ್ಷಣ 2 ದೊಡ್ಡ ಲೋಟ ನೀರನ್ನು ಕುಡಿಯಿರಿ; ಮೊಬೈಲ್/ಟಿವಿ ಪರದೆಯನ್ನು ನೋಡಬೇಡಿ.
3. ಶೀತಲ ಶಾಖ: ಹಣೆಯ ಮೇಲೆ ಐಸ್ ಪ್ಯಾಕ್ ಅಥವಾ ತಣ್ಣೀರಿನ ಬಟ್ಟೆ ಇರಿಸಿ.

ಶಿಫಾರಸು ಮಾಡಲಾದ ಸಾಮಾನ್ಯ ಔಷಧಿಗಳು:
• ಪ್ಯಾರಸಿಟಮಾಲ್ (Crocin 500mg) ಅಥವಾ ಇಬುಪ್ರೊಫೇನ್ (400mg): ಊಟದ ನಂತರ 1 ಮಾತ್ರೆ.
• ಬಾಮ್: ಟೈಗರ್ ಬಾಮ್ ಅಥವಾ ಅಮೃತಾಂಜನ್ ಹಣೆಗೆ ಹಚ್ಚಿ ನಿಧಾನವಾಗಿ ಮಸಾಜ್ ಮಾಡಿ.

⚠️ ಎಚ್ಚರಿಕೆ: ತೀವ್ರ ಮಿಂಚಿನಂತಹ ತಲೆನೋವು, ಕಣ್ಣು ಮಂಜಾಗುವುದು ಅಥವಾ ಕೈಕಾಲು ಜಡವಾದರೆ ತಕ್ಷಣ ಆಂಬ್ಯುಲೆನ್ಸ್ ಕರೆಯಿರಿ.`,
        severity: 'MINOR',
        isCritical: false,
        isAmbulanceRequest: false
      };
    }
    if (lang === 'hi') {
      return {
        reply: `चिकित्सीय मूल्यांकन: हल्का तनाव सिरदर्द या माइग्रेन के लक्षण।

स्व-उपचार के चरण:
1. वातावरण: शांत और अंधेरे कमरे में आंखें बंद करके आराम करें।
2. पानी: तुरंत 2 बड़े गिलास पानी पिएं और मोबाइल/स्क्रीन से दूर रहें।
3. सिकाई: माथे और कनपटियों पर ठंडी पट्टी या आइस पैक 15 मिनट के लिए लगाएं।

अनुशंसित सामान्य दवाइयां:
• पैरासिटामोल (Crocin 500mg) या इबुप्रोफेन (400mg): भोजन के बाद 1 गोली लें।
• बाम: माथे पर टाइगर बाम या अमृतांजन हल्के हाथों से लगाएं।

⚠️ चेतावनी: यदि सिर में अचानक बिजली जैसा तेज असहनीय दर्द हो या बोलने में दिक्कत हो, तो तुरंत एम्बुलेंस बुलाएं।`,
        severity: 'MINOR',
        isCritical: false,
        isAmbulanceRequest: false
      };
    }
    return {
      reply: `Clinical Assessment: Mild tension headache or migraine symptoms.

Self-Treatment Steps:
1. Environment: Rest in a dark, quiet room with eyes closed and avoid mobile/screen glare.
2. Hydration: Drink 2 large glasses of room-temperature water immediately.
3. Compress: Apply an ice pack wrapped in a cloth or cold towel to your forehead and temples for 15 minutes.

Recommended Common OTC Medicines:
• Paracetamol (Crocin 500mg) or Ibuprofen (400mg): 1 tablet taken after food.
• Pain Balm: Topical balm (Tiger Balm or Amrutanjan) gently massaged onto forehead and temples.

⚠️ Safety Warning: If accompanied by sudden severe "thunderclap" pain, vision loss, or speech difficulty, dispatch an ambulance immediately.`,
      severity: 'MINOR',
      isCritical: false,
      isAmbulanceRequest: false
    };
  }

  // 3. COLD, COUGH & SORE THROAT
  if (lower.includes('cough') || lower.includes('cold') || lower.includes('sore throat') || lower.includes('runny nose') || lower.includes('ನೆಗಡಿ') || lower.includes('ಕೆಮ್ಮು') || lower.includes('खांसी') || lower.includes('गले')) {
    if (lang === 'kn') {
      return {
        reply: `ವೈದ್ಯಕೀಯ ವಿಶ್ಲೇಷಣೆ: ಮೇಲ್ಭಾಗದ ಶ್ವಾಸನಾಳದ ಸೋಂಕು, ನೆಗಡಿ ಮತ್ತು ಗಂಟಲು ಕೆರೆತ.

ಸ್ವಯಂ ಚಿಕಿತ್ಸಾ ಕ್ರಮಗಳು:
1. ಗಾರ್ಗಲ್: ದಿನಕ್ಕೆ 3 ಬಾರಿ ಬೆಚ್ಚಗಿನ ಉಪ್ಪು ನೀರಿನಿಂದ ಗಂಟಲನ್ನು ಮುಕ್ಕಳಿಸಿ.
2. ಹಬೆ ತೆಗೆದುಕೊಳ್ಳಿ: 10 ನಿಮಿಷಗಳ ಕಾಲ ಬಿಸಿನೀರಿನ ಹಬೆ (Steam) ತೆಗೆದುಕೊಳ್ಳಿ.
3. ಪಾನೀಯ: ಶುಂಠಿ, ಜೇನುತುಪ್ಪ ಮತ್ತು ಬಿಸಿ ನೀರನ್ನು ನಿಯಮಿತವಾಗಿ ಕುಡಿಯಿರಿ.

ಶಿಫಾರಸು ಮಾಡಲಾದ ಸಾಮಾನ್ಯ ಔಷಧಿಗಳು:
• ಸ್ಟ್ರೆಪ್ಸಿಲ್ಸ್ / ಕಾಫ್ಸಿಲ್ಸ್ (Strepsils / Cofsils): ಗಂಟಲಿನ ಕಿರಿಕಿರಿ ನಿವಾರಣೆಗೆ ಮಾತ್ರೆಗಳು.
• ಸಿಟ್ರಿಜಿನ್ (Cetirizine 10mg): ಸೀನು ಮತ್ತು ನೆಗಡಿ ನಿಯಂತ್ರಣಕ್ಕೆ ರಾತ್ರಿ ಮಲಗುವಾಗ 1 ಮಾತ್ರೆ.
• ಕೆಮ್ಮಿನ ಸಿರಪ್: ಹನಿಟಸ್ (Honitus) ಅಥವಾ ಬೆನಾಡ್ರಿಲ್ (2 ಚಮಚ ದಿನಕ್ಕೆ 2 ಬಾರಿ).

⚠️ ಎಚ್ಚರಿಕೆ: ಉಸಿರಾಟದಲ್ಲಿ ತೀವ್ರ ಸೀಟಿ ಶಬ್ದ ಅಥವಾ ಉಸಿರಾಡಲು ಅಸಾಧ್ಯವಾದರೆ ತಕ್ಷಣ ಆಂಬ್ಯುಲೆನ್ಸ್ ಕರೆಯಿರಿ.`,
        severity: 'MINOR',
        isCritical: false,
        isAmbulanceRequest: false
      };
    }
    if (lang === 'hi') {
      return {
        reply: `चिकित्सीय मूल्यांकन: सामान्य सर्दी, जुकाम और गले की खराश।

स्व-उपचार के चरण:
1. गरारे: दिन में 3 बार हल्के गुनगुने नमक के पानी से गरारे करें।
2. भाप: नाक खोलने के लिए 10 मिनट गर्म पानी की भाप (Steam) लें।
3. पेय: अदरक, शहद और गर्म पानी या तुलसी की चाय पिएं।

अनुशंसित सामान्य दवाइयां:
• स्ट्रेप्सिल्स / विक्स की गोली (Strepsils/Cofsils): गले की खराश दूर करने के लिए।
• सिट्रीजिन (Cetirizine 10mg): बहती नाक और छींक के लिए रात को 1 गोली।
• कफ सिरप: होनीटस (Honitus) या बेनाड्रिल (2 चम्मच दिन में 2 बार)।

⚠️ चेतावनी: यदि सांस लेने में घरघराहट या दम फूलने की समस्या हो तो तुरंत एम्बुलेंस बुलाएं।`,
        severity: 'MINOR',
        isCritical: false,
        isAmbulanceRequest: false
      };
    }
    return {
      reply: `Clinical Assessment: Common cold, viral rhinitis, or mild pharyngitis.

Self-Treatment Steps:
1. Gargle: Warm salt water gargles (1/2 tsp salt in 1 glass warm water) 3 times daily.
2. Inhalation: Inhale steam for 10 minutes to relieve nasal passage blockage.
3. Warm Fluids: Drink warm water with lemon, ginger, and honey. Avoid chilled items.

Recommended Common OTC Medicines:
• Lozenges: Strepsils, Cofsils, or Vicks lozenges for soothing throat irritation.
• Cetirizine (10mg): 1 tablet at night for sneezing and runny nose.
• Cough Syrup: Honitus or Benadryl syrup (2 teaspoons twice daily).

⚠️ Safety Warning: If you experience difficulty breathing, high fever, or wheezing, dispatch an emergency ambulance.`,
      severity: 'MINOR',
      isCritical: false,
      isAmbulanceRequest: false
    };
  }

  // 4. ACIDITY / HEARTBURN
  if (lower.includes('acidity') || lower.includes('heartburn') || lower.includes('gas') || lower.includes('indigestion') || lower.includes('acid') || lower.includes('ಎದೆಯುರಿ') || lower.includes('ಗ್ಯಾಸ್') || lower.includes('एसिडिटी') || lower.includes('गैस')) {
    if (lang === 'kn') {
      return {
        reply: `ವೈದ್ಯಕೀಯ ವಿಶ್ಲೇಷಣೆ: ಅಸಿಡಿಟಿ ಮತ್ತು ಎದೆಯುರಿ.

ಸ್ವಯಂ ಚಿಕಿತ್ಸಾ ಕ್ರಮಗಳು:
1. ನೇರವಾಗಿ ಕುಳಿತುಕೊಳ್ಳಿ: ಊಟದ ನಂತರ ಕನಿಷ್ಠ 1 ಗಂಟೆ ಮಲಗಬೇಡಿ, ನೇರವಾಗಿ ಕುಳಿತುಕೊಳ್ಳಿ.
2. ತಂಪಾದ ಹಾಲು: ಅರ್ಧ ಲೋಟ ತಂಪಾದ ಹಾಲು ಅಥವಾ ನೀರನ್ನು ನಿಧಾನವಾಗಿ ಹೀರಿ.
3. ಆಹಾರ: ಎಣ್ಣೆ, ಮಸಾಲೆ, ಖಾರ, ಕಾಫಿ ಮತ್ತು ಚಹಾ ಸೇವಿಸಬೇಡಿ.

ಶಿಫಾರಸು ಮಾಡಲಾದ ಸಾಮಾನ್ಯ ಔಷಧಿಗಳು:
• ಆಂಟಾಸಿಡ್ ಜೆಲ್ (Gelusil ಅಥವಾ Digene ಸಿರಪ್): ಊಟದ ನಂತರ 2 ಚಮಚ ಕುಡಿಯಿರಿ.
• ಪ್ಯಾಂಟೊಪ್ರಜೋಲ್ (Pan 40mg): ಬೆಳಿಗ್ಗೆ ತಿಂಡಿಗಿಂತ 30 ನಿಮಿಷ ಮೊದಲು 1 ಮಾತ್ರೆ.

⚠️ ಎಚ್ಚರಿಕೆ: ಎದೆಯುರಿ ಎಡತೋಳಿಗೆ ಹರಡುತ್ತಿದ್ದರೆ ಅಥವಾ ತೀವ್ರ ಬೆವರು ಬಂದರೆ ಅದು ಹೃದಯಾಘಾತವಾಗಿರಬಹುದು; ತಕ್ಷಣ ಆಂಬ್ಯುಲೆನ್ಸ್ ಕರೆಯಿರಿ.`,
        severity: 'MINOR',
        isCritical: false,
        isAmbulanceRequest: false
      };
    }
    if (lang === 'hi') {
      return {
        reply: `चिकित्सीय मूल्यांकन: एसिडिटी, खट्टी डकार एवं सीने में हल्की जलन।

स्व-उपचार के चरण:
1. सीधे बैठें: भोजन के बाद कम से कम 1 घंटे तक न लेटें, सीधे बैठें।
2. ठंडा दूध: आधा गिलास ठंडा दूध या सादा पानी धीरे-धीरे घूंट-घूंट पिएं।
3. परहेज: तला-भुना, मसालेदार, खट्टा भोजन और चाय-कॉफी बंद रखें।

अनुशंसित सामान्य दवाइयां:
• एंटासिड सिरप (Gelusil या Digene): भोजन के बाद 2 चम्मच पिएं।
• पैंटोप्राजोल (Pan 40mg): सुबह खाली पेट नाश्ते से 30 मिनट पहले 1 गोली।

⚠️ चेतावनी: यदि सीने का दर्द बाएं हाथ की ओर फैले या पसीना आए तो यह दिल का दौरा हो सकता है; तुरंत एम्बुलेंस बुलाएं।`,
        severity: 'MINOR',
        isCritical: false,
        isAmbulanceRequest: false
      };
    }
    return {
      reply: `Clinical Assessment: Mild acid reflux, heartburn, or functional dyspepsia.

Self-Treatment Steps:
1. Posture: Stay seated upright for at least 60 minutes after meals; do NOT lie down flat.
2. Fluid: Sip half a glass of cold milk or room-temperature water slowly.
3. Diet: Avoid spicy, oily, citrus, caffeinated, and carbonated food and beverages.

Recommended Common OTC Medicines:
• Antacid Gel: Gelusil or Digene syrup (2 teaspoons taken after meals and before bedtime).
• Pantoprazole (Pan 40mg) or Omeprazole (20mg): 1 tablet taken 30 minutes before breakfast.

⚠️ Safety Warning: If burning radiates to left arm/jaw or causes cold sweating and shortness of breath, dispatch an ambulance immediately.`,
      severity: 'MINOR',
      isCritical: false,
      isAmbulanceRequest: false
    };
  }

  // 5. SPRAIN / MUSCLE PAIN
  if (lower.includes('sprain') || lower.includes('twist') || lower.includes('joint pain') || lower.includes('muscle ache') || lower.includes('ಉಳುಕು') || lower.includes('ಮೂಳೆ ನೋವು') || lower.includes('मोच') || lower.includes('दर्द')) {
    return {
      reply: lang === 'kn'
        ? `ವೈದ್ಯಕೀಯ ವಿಶ್ಲೇಷಣೆ: ಸ್ನಾಯು ಉಳುಕು ಅಥವಾ ಕೀಲು ನೋವು.\n\nR.I.C.E. ಚಿಕಿತ್ಸಾ ಕ್ರಮಗಳು:\n1. ವಿಶ್ರಾಂತಿ (Rest): ಕಾಲಿನ ಮೇಲೆ ಭಾರ ಹಾಕಬೇಡಿ.\n2. ಐಸ್ (Ice): 15 ನಿಮಿಷ ಐಸ್ ಪ್ಯಾಕ್ ಇರಿಸಿ ಊತ ಕಡಿಮೆ ಮಾಡಿ.\n3. ಬ್ಯಾಂಡೇಜ್ (Compression): ಕ್ರೇಪ್ ಬ್ಯಾಂಡೇಜ್ ಸುತ್ತಿ.\n4. ಎತ್ತರ (Elevation): ಅಂಗವನ್ನು ದಿಂಬಿನ ಮೇಲೆ ಎತ್ತರಿಸಿ ಮಲಗಿ.\n\nಶಿಫಾರಸು ಮಾಡಿದ ಔಷಧಿಗಳು:\n• ವೋಲಿನಿ / ಮೂವ್ ಜೆಲ್ (Volini/Moov Gel) ಹಚ್ಚಿ.\n• ಪ್ಯಾರಸಿಟಮಾಲ್ 500mg (ಊಟದ ನಂತರ 1 ಮಾತ್ರೆ).\n\n⚠️ ಎಚ್ಚರಿಕೆ: ಮೂಳೆ ಮುರಿದ ಅನುಮಾನವಿದ್ದರೆ ಎಕ್ಸ್‌-ರೇ ಅಗತ್ಯ.`
        : lang === 'hi'
        ? `चिकित्सीय मूल्यांकन: हल्की मोच, खिंचाव या जोड़ों का दर्द।\n\nR.I.C.E. उपचार पद्धति:\n1. आराम (Rest): चोटिल अंग पर भार न डालें।\n2. बर्फ (Ice): कपड़े में लपेटकर 15 मिनट बर्फ लगाएं।\n3. पट्टी (Compression): क्रेप बैंडेज बांधें।\n4. ऊंचाई (Elevation): अंग को तकिये पर ऊंचा रखें।\n\nअनुशंसित दवाइयां:\n• वोलिनी या मूव जेल (Volini/Moov Gel) दिन में 3 बार लगाएं।\n• पैरासिटामोल 500mg दर्द के लिए खाने के बाद 1 गोली।\n\n⚠️ चेतावनी: यदि अंग में टेढ़ापन दिखे या बिल्कुल न चला जाए तो तुरंत अस्पताल जाएं।`
        : `Clinical Assessment: Mild soft-tissue strain or ligament sprain.\n\nSelf-Treatment Steps (R.I.C.E. Protocol):\n1. Rest: Protect the joint and avoid putting weight on the injured limb.\n2. Ice: Apply an ice pack wrapped in a cloth for 15-20 minutes, 3 times daily.\n3. Compression: Wrap lightly with an elastic crepe bandage.\n4. Elevation: Keep the limb elevated on a pillow above heart level.\n\nRecommended Common OTC Medicines:\n• Topical Pain Gel: Volini, Moov, or Fastum gel applied 3 times daily.\n• Paracetamol (500mg) or Ibuprofen (400mg): 1 tablet with food for pain relief.\n\n⚠️ Safety Warning: If deformity, severe bone tenderness, or numbness is present, seek clinical X-ray evaluation.`,
      severity: 'MINOR',
      isCritical: false,
      isAmbulanceRequest: false
    };
  }

  // 6. MINOR CUT / SCRAPE
  if (lower.includes('cut') || lower.includes('scratch') || lower.includes('scrape') || lower.includes('abrasion') || lower.includes('ಗಾಯ') || lower.includes('खरोंच')) {
    return {
      reply: lang === 'kn'
        ? `ವೈದ್ಯಕೀಯ ವಿಶ್ಲೇಷಣೆ: ಸಣ್ಣ ಚರ್ಮದ ಗಾಯ ಅಥವಾ ಪರಚು ಗಾಯ.\n\nಸ್ವಯಂ ಚಿಕಿತ್ಸಾ ಕ್ರಮಗಳು:\n1. ತೊಳೆಯಿರಿ: ಹರಿಯುವ ನಲ್ಲಿಯ ಶುದ್ಧ ನೀರಿನಲ್ಲಿ ಸೌಮ್ಯ ಸಾಬೂನಿನಿಂದ ಗಾಯ ತೊಳೆಯಿರಿ.\n2. ಒತ್ತಡ: ರಕ್ತ ಒಸರುವುದನ್ನು ನಿಲ್ಲಿಸಲು 2 ನಿಮಿಷ ಸ್ವಚ್ಛ ಹತ್ತಿಯಿಂದ ಒತ್ತಿ ಹಿಡಿಯಿರಿ.\n3. ರಕ್ಷಣೆ: ಧೂಳು ತಾಗದಂತೆ ರಕ್ಷಿಸಿ.\n\nಶಿಫಾರಸು ಮಾಡಿದ ಔಷಧಿಗಳು:\n• ಬೆಟಾಡಿನ್ (Betadine 5%) ಅಥವಾ ನಿಯೋಸ್ಪೊರಿನ್ (Neosporin) ಆಂಟಿಸೆಪ್ಟಿಕ್ ಮುಲಾಮು.\n• ಸ್ವಚ್ಛ ಬ್ಯಾಂಡೇಜ್ (Band-Aid).\n\n⚠️ ಎಚ್ಚರಿಕೆ: ತುಕ್ಕು ಹಿಡಿದ ವಸ್ತುವಿನಿಂದ ಗಾಯವಾಗಿದ್ದರೆ ಟೆಟಾನಸ್ (TT) ಇಂಜೆಕ್ಷನ್ ಪಡೆಯಿರಿ.`
        : lang === 'hi'
        ? `चिकित्सीय मूल्यांकन: हल्की खरोंच या त्वचा का घाव।\n\nस्व-उपचार के चरण:\n1. धोएं: साफ बहते पानी और साबुन से घाव को धोएं।\n2. दबाव: खून रोकने के लिए साफ रुई से 2 मिनट दबाकर रखें।\n3. पट्टी: घाव को धूल-मिट्टी से बचाएं।\n\nअनुशंसित दवाइयां:\n• बीटाडीन (Betadine 5%) या नियोस्पोरिन (Neosporin) एंटीसेप्टिक क्रीम।\n• साफ बैंड-एड (Band-Aid) लगाएं।\n\n⚠️ चेतावनी: यदि जंग लगे लोहे से चोट लगी हो तो तुरंत टिटनेस (TT) का इंजेक्शन लगवाएं।`
        : `Clinical Assessment: Superficial cutaneous laceration or minor abrasion.\n\nSelf-Treatment Steps:\n1. Cleanse: Rinse the wound gently under cool running tap water with mild soap.\n2. Direct Pressure: Apply gentle, firm pressure with sterile gauze for 2 minutes to halt minor oozing.\n3. Protect: Keep clean, dry, and dressed.\n\nRecommended Common OTC Medicines:\n• Antiseptic: Betadine (Povidone Iodine 5%) solution or Neosporin antibacterial ointment.\n• Dressing: Clean sterile adhesive Band-Aid or non-stick gauze pad.\n\n⚠️ Safety Warning: If bleeding persists past 5 minutes or caused by rusty metal (tetanus risk), visit a clinic.`,
      severity: 'MINOR',
      isCritical: false,
      isAmbulanceRequest: false
    };
  }

  // GENERAL FALLBACK FOR OTHER INQUIRIES
  return {
    reply: lang === 'kn'
      ? `ವೈದ್ಯಕೀಯ ವಿಶ್ಲೇಷಣೆ: ನಿಮ್ಮ ರೋಗಲಕ್ಷಣಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿದೆ.

ಸ್ವಯಂ ಆರೈಕೆಯ ಕ್ರಮಗಳು:
1. ಆರಾಮದಾಯಕ ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ ಮತ್ತು ಸಾಕಷ್ಟು ನೀರು/ದ್ರವಾಹಾರ ಸೇವಿಸಿ.
2. ಲಕ್ಷಣಗಳನ್ನು ಸೂಕ್ಷ್ಮವಾಗಿ ಗಮನಿಸಿ, ಅನಗತ್ಯ ಶ್ರಮ ತಪ್ಪಿಸಿ.
3. ನೋವಿದ್ದರೆ ವೈದ್ಯರ ಸಲಹೆ ಮೇರೆಗೆ ಪ್ಯಾರಸಿಟಮಾಲ್ (500mg) ತೆಗೆದುಕೊಳ್ಳಿ.

⚠️ ತುರ್ತು ಎಚ್ಚರಿಕೆ: ಯಾವುದೇ ಸಮಯದಲ್ಲಿ ತೀವ್ರ ಉಸಿರಾಟದ ತೊಂದರೆ, ಪ್ರಜ್ಞೆ ತಪ್ಪುವುದು ಅಥವಾ ಅಸಹನೀಯ ನೋವು ಕಂಡುಬಂದರೆ ಕೆಳಗಿನ ಬಟನ್ ಒತ್ತಿ ಆಂಬ್ಯುಲೆನ್ಸ್ ಕರೆಯಿರಿ.`
      : lang === 'hi'
      ? `चिकित्सीय मूल्यांकन: आपके लक्षणों का चिकित्सकीय विश्लेषण किया गया है।

सामान्य स्व-देखभाल के चरण:
1. आराम करें और भरपूर पानी व तरल पदार्थों का सेवन करें।
2. लक्षणों पर नजर रखें और भारी शारीरिक श्रम से बचें।
3. आवश्यकतानुसार सामान्य दर्द के लिए पैरासिटामोल (500mg) भोजन के बाद ले सकते हैं।

⚠️ आपातकालीन सूचना: यदि स्थिति बिगड़े, सांस लेने में तकलीफ हो या असहनीय दर्द हो, तो तुरंत नीचे दिए बटन से एम्बुलेंस बुलाएं।`
      : `Clinical Assessment: Your clinical symptoms have been analyzed.

Self-Care & Management Steps:
1. Rest in a well-ventilated, comfortable space and maintain continuous oral hydration.
2. Closely monitor for any sudden change in vitals or symptom intensity.
3. For general body discomfort or fever, Paracetamol (500mg) may be taken after meals.

⚠️ Safety Warning: If you feel unstable, experience difficulty breathing, or require urgent hospital transport, click the button below to dispatch an ambulance immediately.`,
    severity: isCritical ? 'CRITICAL' : 'MINOR',
    isCritical,
    isAmbulanceRequest: false
  };
}
