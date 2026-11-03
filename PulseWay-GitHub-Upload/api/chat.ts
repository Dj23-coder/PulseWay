import { GoogleGenAI } from '@google/genai';

const clinicalKnowledgeBase: Record<string, {
  reply: string;
  severity: 'CRITICAL' | 'MINOR';
  isCritical: boolean;
  isAmbulanceRequest?: boolean;
}> = {
  headache: {
    reply: "CLINICAL GUIDANCE: TENSION / MILD HEADACHE (MINOR)\n• Rest in a quiet, dark room.\n• Stay hydrated with 300-500ml water.\n• Recommended OTC Medicine: Paracetamol (Dolo 650mg / Crocin) after meals.\n• Red Flag Warnings: If accompanied by sudden vision loss, stiff neck, or vomiting, call 108/112.",
    severity: 'MINOR',
    isCritical: false
  },
  fever: {
    reply: "CLINICAL GUIDANCE: MILD FEVER & COLD (MINOR)\n• Rest and keep hydrated with warm fluids and electrolyte ORS.\n• Recommended OTC Medicine: Paracetamol 500mg/650mg every 6 hours if temperature > 100°F.\n• Red Flag Warnings: High fever > 103°F, shivering with confusion, or breathing difficulty.",
    severity: 'MINOR',
    isCritical: false
  },
  labour: {
    reply: "EMERGENCY CLINICAL TRIAGE: ACTIVE LABOUR / CHILDBIRTH (CRITICAL)\n• ACTION: ALS Ambulance is immediately advised.\n• Patient Care: Position mother on left side, do not push until EMS arrives.\n• Pack clean towels and sanitize hands. An Advanced Life Support unit is prioritized.",
    severity: 'CRITICAL',
    isCritical: true,
    isAmbulanceRequest: true
  }
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message = '', language = 'en', patientContext = {} } = req.body || {};
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(200).json(clinicalKnowledgeBase.fever);
    }

    const ai = new GoogleGenAI({ apiKey });
    const langMap: Record<string, string> = {
      kn: 'Kannada (ಕನ್ನಡ)',
      hi: 'Hindi (हिंदी)',
      en: 'English'
    };
    const langName = langMap[language] || 'English';

    const prompt = `You are PulseWay's authoritative emergency medical AI triage assistant.
Target language: ${langName}. MUST REPLY DIRECTLY IN ${langName}.
User inquiry: "${message}"
Patient details: ${JSON.stringify(patientContext || {})}

CRITICAL RULES:
1. EMERGENCY & LABOUR PAIN: If the user describes active labour / labor pain, childbirth, pregnancy emergency, heart attack, chest pain, stroke, severe bleeding, difficulty breathing, seizures, poisoning, major trauma, OR IF THE PERSON ASKS FOR AN AMBULANCE, you MUST classify as CRITICAL. Give urgent life-saving steps and strongly advise calling an ALS ambulance.
2. MINOR / NON-CRITICAL CASES: If the case is non-life-threatening (e.g. headache, mild fever, cold, cough, sore throat, acidity, minor cut, mild sprain, diarrhea), analyze the problem thoughtfully and provide:
   - Self-Treatment Steps (1, 2, 3...)
   - Specific Common Over-The-Counter Medicine Names (e.g. Paracetamol, Dolo 650mg, ORS, Antacids, Betadine, etc.)
   - Clear warning signs on when to seek urgent emergency hospital care.`;

    const modelsToTry = ['gemini-3.5-flash-lite', 'gemini-3.6-flash', 'gemini-3.5-flash'];
    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt
        });

        const reply = response.text || '';
        if (reply.trim()) {
          const lower = (message + ' ' + reply).toLowerCase();
          const isCrit =
            lower.includes('labour') || lower.includes('labor') || lower.includes('delivery') || lower.includes('contraction') ||
            lower.includes('pregnant') || lower.includes('pregnancy') || lower.includes('water broke') ||
            lower.includes('ambulance') || lower.includes('108') || lower.includes('112') || lower.includes('hospital') ||
            lower.includes('chest') || lower.includes('heart') || lower.includes('bleed') ||
            lower.includes('breath') || lower.includes('unconscious') || lower.includes('accident') ||
            lower.includes('critical') || lower.includes('emergency');

          const isAmbReq = lower.includes('ambulance') || lower.includes('108') || lower.includes('als') || lower.includes('dispatch') || lower.includes('emergency vehicle');

          return res.status(200).json({
            reply,
            severity: isCrit ? 'CRITICAL' : 'MINOR',
            isCritical: isCrit,
            isAmbulanceRequest: isAmbReq
          });
        }
      } catch (err) {
        continue;
      }
    }

    return res.status(200).json(clinicalKnowledgeBase.fever);
  } catch (error: any) {
    return res.status(200).json(clinicalKnowledgeBase.fever);
  }
}
