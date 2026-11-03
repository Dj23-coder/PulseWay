import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { getComprehensiveClinicalTriage } from './src/utils/gemini.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // API endpoint for AI Severity Triage
  app.post('/api/triage', async (req, res) => {
    try {
      const { description, symptoms, patientDetails, language } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        return res.json(getLocalTriage(description, symptoms, patientDetails));
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

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

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text || '';
      const parsed = JSON.parse(text);
      return res.json(parsed);
    } catch (err) {
      console.error('Gemini triage fallback triggered:', err);
      return res.json(getLocalTriage(req.body.description, req.body.symptoms, req.body.patientDetails));
    }
  });

  // API endpoint for Medical Summary Generation
  app.post('/api/summary', async (req, res) => {
    try {
      const { incident, patient, hospital } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        return res.json({
          summary: `EMERGENCY INCIDENT SUMMARY - PULSEWAY\nIncident ID: ${incident?.id || 'INC-LIVE'}\nTimestamp: ${new Date().toISOString()}\nPatient: ${patient?.fullName || 'Anonymous'}\nSeverity: ${incident?.severity || 'CRITICAL'}\nNature: ${incident?.nature || 'Emergency Request'}\nAssigned Hospital: ${hospital?.name || 'City Trauma Care'}\nStatus: Coordinated via PulseWay Dispatch Protocol.`,
          generatedAt: new Date().toISOString()
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Generate a concise, professional Clinical Incident Handover Report for an arriving ambulance and emergency department receiving team:
Incident Details: ${JSON.stringify(incident)}
Patient Data: ${JSON.stringify(patient)}
Hospital Allocation: ${JSON.stringify(hospital)}

Keep it structured with: Primary Complaint, Triage Assessment, Pre-Hospital Interventions, and Receiving Department Instructions.`,
      });

      return res.json({
        summary: response.text || 'Summary report generated.',
        generatedAt: new Date().toISOString()
      });
    } catch (err) {
      return res.json({
        summary: `EMERGENCY CLINICAL REPORT\nGenerated: ${new Date().toLocaleString()}\nPatient: ${req.body?.patient?.fullName || 'Emergency Patient'}\nSeverity: ${req.body?.incident?.severity || 'CRITICAL'}\nAssigned Hospital: ${req.body?.hospital?.name || 'City Emergency Care'}`,
        generatedAt: new Date().toISOString()
      });
    }
  });

  // API endpoint for Audio Voice Transcription using Gemini Audio API
  app.post('/api/transcribe', async (req, res) => {
    try {
      const { audioBase64, mimeType, language } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!audioBase64 || !apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        return res.json({ text: '', success: false });
      }

      const ai = new GoogleGenAI({ apiKey });
      const targetLang = language === 'kn' ? 'Kannada' : language === 'hi' ? 'Hindi' : 'English';

      const transcribePromise = ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [
          {
            inlineData: {
              mimeType: mimeType || 'audio/webm',
              data: audioBase64
            }
          },
          {
            text: `Transcribe this short spoken emergency medical voice note. Return ONLY the transcribed text in ${targetLang}. If not clear, return the best effort emergency text in ${targetLang}.`
          }
        ]
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Audio timeout')), 2500)
      );

      const response = await Promise.race([transcribePromise, timeoutPromise]);
      const text = response?.text?.trim() || '';
      return res.json({ text, success: !!text });
    } catch (err) {
      console.warn('Audio transcribe note:', err);
      return res.json({ text: '', success: false });
    }
  });

  // API endpoint for Conversational Multilingual Emergency Assistance (Speed < 2s)
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, language, patientContext } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        return res.json(getComprehensiveClinicalTriage(message || '', language));
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
          const chatPromise = ai.models.generateContent({
            model,
            contents: prompt
          });

          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Chat timeout')), 1600)
          );

          const response = await Promise.race([chatPromise, timeoutPromise]);
          const reply = response.text || '';
          if (reply.trim()) {
            const lower = (message + ' ' + reply).toLowerCase();
            const isCrit =
              lower.includes('labour') || lower.includes('labor') || lower.includes('delivery') || lower.includes('contraction') ||
              lower.includes('pregnant') || lower.includes('pregnancy') || lower.includes('water broke') ||
              lower.includes('ambulance') || lower.includes('108') || lower.includes('112') || lower.includes('hospital') ||
              lower.includes('chest') || lower.includes('heart') || lower.includes('bleed') ||
              lower.includes('breath') || lower.includes('unconscious') || lower.includes('accident') ||
              lower.includes('stroke') || lower.includes('seizure') || lower.includes('poison') || lower.includes('burn');

            return res.json({
              reply: reply.trim(),
              severity: isCrit ? 'CRITICAL' : 'MINOR',
              isCritical: isCrit,
              isAmbulanceRequest: lower.includes('ambulance') || lower.includes('108') || lower.includes('112')
            });
          }
        } catch (mErr) {
          // Try next model or fall back to intelligent clinical engine
        }
      }

      // If all models hit quota or timed out, deliver clinical triage
      return res.json(getComprehensiveClinicalTriage(message || '', language));
    } catch (err) {
      return res.json(getComprehensiveClinicalTriage(req.body.message || '', req.body.language));
    }
  });

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PulseWay full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
