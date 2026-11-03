import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { incident, patient, hospital } = req.body || {};
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(200).json({
        summary: `EMERGENCY INCIDENT SUMMARY - PULSEWAY\nIncident ID: ${incident?.id || 'INC-LIVE'}\nTimestamp: ${new Date().toISOString()}\nPatient: ${patient?.fullName || 'Anonymous'}\nSeverity: ${incident?.severity || 'CRITICAL'}\nNature: ${incident?.nature || 'Emergency Request'}\nAssigned Hospital: ${hospital?.name || 'City Trauma Care'}\nStatus: Coordinated via PulseWay Dispatch Protocol.`,
        generatedAt: new Date().toISOString()
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: `Generate a concise, professional Clinical Incident Handover Report for an arriving ambulance and emergency department receiving team:
Incident Details: ${JSON.stringify(incident)}
Patient Data: ${JSON.stringify(patient)}
Hospital Allocation: ${JSON.stringify(hospital)}

Keep it structured with: Primary Complaint, Triage Assessment, Pre-Hospital Interventions, and Receiving Department Instructions.`,
    });

    return res.status(200).json({
      summary: response.text || 'Summary report generated.',
      generatedAt: new Date().toISOString()
    });
  } catch (err) {
    return res.status(200).json({
      summary: `EMERGENCY CLINICAL REPORT\nGenerated: ${new Date().toLocaleString()}\nPatient: ${req.body?.patient?.fullName || 'Emergency Patient'}\nSeverity: ${req.body?.incident?.severity || 'CRITICAL'}\nAssigned Hospital: ${req.body?.hospital?.name || 'City Emergency Care'}`,
      generatedAt: new Date().toISOString()
    });
  }
}
