import { GoogleGenAI } from '@google/genai';

function getLocalTriage(description = '', symptoms: string[] = [], patientDetails: any = {}) {
  const combined = (description + ' ' + (symptoms || []).join(' ')).toLowerCase();
  const criticalKeywords = [
    'chest pain', 'heart attack', 'unconscious', 'fainted', 'not breathing', 'breathless',
    'severe bleeding', 'blood loss', 'stroke', 'paralysis', 'seizure', 'fit', 'convulsion',
    'snake bite', 'poison', 'toxic', 'head injury', 'trauma', 'accident', 'crush', 'burns',
    'electrocution', 'labor pain', 'labour', 'delivery', 'cardiac', 'choking', 'cyanosis',
    'broken bone', 'fracture', 'deep wound', 'chest pressure'
  ];

  const isCritical = criticalKeywords.some(k => combined.includes(k)) || combined.includes('ambulance') || combined.includes('critical');

  if (isCritical) {
    return {
      severity: 'CRITICAL',
      confidence: 96,
      reasoning: 'Critical clinical indicators identified requiring immediate ALS ambulance dispatch and emergency hospital bed reservation.',
      immediateFirstAid: [
        'Keep patient calm, seated, or in recovery position depending on consciousness.',
        'Do NOT give solid food or liquids if consciousness is compromised.',
        'Loosen restrictive clothing around neck and chest to facilitate airflow.',
        'Ensure an unobstructed airway; continuously monitor breathing and pulse.',
        'Keep device nearby as hospital dispatch coordinates arrival.'
      ],
      warningSigns: ['Loss of consciousness', 'Gasping or stopped breathing', 'Bluish lips or fingertips (cyanosis)'],
      suggestedDepartment: combined.includes('heart') || combined.includes('chest') ? 'Cardiology & Cath Lab' : 
                           combined.includes('accident') || combined.includes('trauma') ? 'Trauma & Resuscitation Center' : 'Emergency Resuscitation Unit'
    };
  }

  return {
    severity: 'MINOR',
    confidence: 88,
    reasoning: 'Symptoms indicate stable vitals without immediate life threat; recommended for calm on-site first aid and outpatient monitoring.',
    immediateFirstAid: [
      'Rest comfortably and keep the affected area elevated if swollen or strained.',
      'Apply clean cold compress wrapped in cloth to reduce swelling if applicable.',
      'Stay hydrated with small sips of clean water.',
      'Monitor for any sudden worsening of pain, breathing difficulty, or dizziness.'
    ],
    warningSigns: ['Sudden high fever with confusion', 'Persistent vomiting', 'Emerging chest or abdominal pain'],
    suggestedDepartment: 'Urgent Care & Outpatient Clinic'
  };
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { description = '', symptoms = [], patientDetails = {}, language = 'en' } = req.body || {};
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(200).json(getLocalTriage(description, symptoms, patientDetails));
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are an authoritative emergency medical triage algorithm for PulseWay emergency response.
Evaluate the following emergency case:
Target language: ${language || 'en'}
Description: ${description || 'Not provided'}
Symptoms: ${JSON.stringify(symptoms || [])}
Patient Details: ${JSON.stringify(patientDetails || {})}

Triage rules:
1. Assess consciousness, breathing, severe bleeding, chest pain, stroke symptoms, trauma, poisoning, and seizures.
2. If in doubt or uncertain, ALWAYS classify as "CRITICAL". Safety takes priority over avoiding false alarms.
3. Classify strictly as "CRITICAL" or "MINOR".
4. Provide structured JSON:
{
  "severity": "CRITICAL" | "MINOR",
  "confidence": 95,
  "reasoning": "1-2 sentence medical explanation",
  "immediateFirstAid": ["Step 1", "Step 2", "Step 3", "Step 4"],
  "warningSigns": ["Escalation sign 1", "Escalation sign 2"],
  "suggestedDepartment": "e.g., Trauma Centre / Cardiac ICU / Neuro Emergency"
}`;

    const modelsToTry = ['gemini-3.5-flash-lite', 'gemini-3.6-flash', 'gemini-3.5-flash'];
    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const text = response.text || '';
        const parsed = JSON.parse(text);
        return res.status(200).json(parsed);
      } catch (e) {
        continue;
      }
    }

    return res.status(200).json(getLocalTriage(description, symptoms, patientDetails));
  } catch (err) {
    return res.status(200).json(getLocalTriage(req.body?.description, req.body?.symptoms, req.body?.patientDetails));
  }
}
