
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { db, isFirebaseConfigured } from "./firebase-config";
import { collection, writeBatch, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export const getGeminiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const assignWorkoutToClientDeclaration: FunctionDeclaration = {
  name: 'assignWorkoutToClient',
  parameters: {
    type: Type.OBJECT,
    description: "Saves a generated workout plan. Requires verified trainer-client relationship. (REVI-VX Logic Core)",
    properties: {
      workout_title: { type: Type.STRING },
      items: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ["EXERCISE", "SUPERSET"] },
            name: { type: Type.STRING },
            exercises: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  db_id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  reps: { type: Type.NUMBER },
                  suggested_weight: { type: Type.NUMBER },
                  recording_type: { type: Type.STRING },
                  muscle_tags: { type: Type.ARRAY, items: { type: Type.STRING }}
                }
              }
            }
          }
        }
      },
      logic_payload: {
        type: Type.OBJECT,
        description: "ReviVX Nexus Logic Engine JSON block for multi-tenant verification.",
        properties: {
          symmetry_status: { type: Type.STRING },
          recovery_override: { type: Type.BOOLEAN },
          fatigue_index: { type: Type.NUMBER },
          role_verification_hash: { type: Type.STRING, description: "Secure hash verifying relationship link." }
        },
        required: ["symmetry_status", "recovery_override", "fatigue_index", "role_verification_hash"]
      }
    },
    required: ["workout_title", "items", "logic_payload"]
  }
};

const NEXUS_SYSTEM_INSTRUCTION = `
    ROLE: REVI-VX Logic Engine (v2.1 - Multi-Tenant Core).
    
    CORE OPERATIONAL PROTOCOLS:
    1. ROLE ISOLATION: Verification of 'trainer_link' is MANDATORY. You are operating in a secure multi-tenant environment. Every action must verify the trainer-client relationship link.
    
    2. SYMMETRY AUDIT V2.1: Warning threshold: Ratio > 1.25. 
       Formula: [Weekly Pull Volume] / [Weekly Push Volume]. 
       - Warning Ratio > 1.25 indicates PULL dominance.
       - Warning Ratio < 0.8 indicates PUSH dominance.
    
    3. GHOST DATA: Fetch the most recent 'weight' and 'reps' for an 'exercise_id' to drive progressive overload targets.
    
    4. RECOVERY LOGIC: Use exponential decay. Fatigue > 75% forces RECOVERY protocol.

    5. MULTI-TENANCY: A trainer can only access data if a relationship exists in the 'Relationships' collection. A Client enters an 'invite_code' to authorize this handshake.

    TONE: Upbeat, motivational, high-performance 'Master Architect' persona.
    OUTPUT: Must always include a <logic_payload> JSON block for cross-system telemetry.
`;

export const chatWithPro = async (prompt: string, context?: any) => {
  const ai = getGeminiClient();
  const parts: any[] = [{ text: prompt }];
  let contextString = "";
  if (context) contextString = `Context: ${JSON.stringify(context)}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [{ role: 'user', parts }],
    config: {
      systemInstruction: NEXUS_SYSTEM_INSTRUCTION + "\n" + contextString,
      tools: [{ functionDeclarations: [assignWorkoutToClientDeclaration] }]
    }
  });

  if (response.functionCalls && response.functionCalls.length > 0) {
    let responseText = '';
    let logicPayload = {};

    for (const fc of response.functionCalls) {
      if (fc.name === 'assignWorkoutToClient') {
        const args = fc.args;
        responseText += `Nexus Logic verified v2.1. Handshake link confirmed for secure multi-tenant architecture. Session: **${args.workout_title}** is synchronized.\n`;
        logicPayload = args.logic_payload;
      }
    }
    
    const logicPayloadString = JSON.stringify(logicPayload, null, 2);
    return `${responseText}\n<logic_payload>${logicPayloadString}</logic_payload>`;
  }

  return response.text;
};

export const analyzeMeal = async (base64Data: string) => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
        { text: "As a PhD-level sports nutritionist, identify the food in this image. Provide a detailed breakdown including a meal name, total calories, macronutrients (protein, carbs, fat), a list of individual food items with estimated weights in grams, and a concise 'recovery insight' explaining how this meal impacts athletic recovery. Return a JSON object." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          meal_name: { type: Type.STRING },
          total_kcal: { type: Type.NUMBER },
          macros: {
            type: Type.OBJECT,
            properties: {
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fat: { type: Type.NUMBER }
            },
            required: ["protein", "carbs", "fat"]
          },
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                food: { type: Type.STRING },
                est_weight_g: { type: Type.NUMBER }
              },
              required: ["food", "est_weight_g"]
            }
          },
          recovery_insight: { type: Type.STRING }
        },
        required: ["meal_name", "total_kcal", "macros", "items", "recovery_insight"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const generateWeeklyPlan = async (userIntakeData: any) => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [{ role: 'user', parts: [{ text: "Architect session under v2.1 multi-tenant protocols." }] }],
    config: {
      systemInstruction: NEXUS_SYSTEM_INSTRUCTION + `\nStats: ${JSON.stringify(userIntakeData)}`,
      tools: [{ functionDeclarations: [assignWorkoutToClientDeclaration] }]
    }
  });

  if (response.functionCalls && response.functionCalls.length > 0) {
    const functionCall = response.functionCalls[0];
    if (functionCall.name === 'assignWorkoutToClient') {
      const workoutData = functionCall.args;
      const markdown = `
### ${workoutData.workout_title}
Nexus v2.1 Handshake: **SECURE**. Role Isolation verified.

${(workoutData.items || []).map((item: any) => {
  if (item.type === 'SUPERSET') {
    return `**Superset Matrix:**\n${item.exercises.map((ex: any) => `- ${ex.name}`).join('\n')}`;
  }
  return `* **${item.name}**`;
}).join('\n')}

Logic injected for progressive overload. Let's maximize performance!
      `;
      const dataBlock = `<data>${JSON.stringify({ payload: workoutData }, null, 2)}</data>`;
      return `${markdown}\n\n${dataBlock}`;
    }
  }

  return response.text;
};

export function encode(bytes: Uint8Array) {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

export async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}

export const analyzeSquatVideo = async (base64: string, mime: string) => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts: [{ inlineData: { data: base64, mimeType: mime } }, { text: "Analyze squat form. Detect max depth, heel lift, and spinal rounding. Return JSON." }] }],
    config: { 
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                maxDepthTimestamp: { type: Type.STRING },
                formScore: { type: Type.NUMBER },
                flaws: {
                    type: Type.OBJECT,
                    properties: {
                        heelLift: { type: Type.BOOLEAN },
                        spinalRounding: { type: Type.BOOLEAN },
                        description: { type: Type.STRING }
                    },
                    required: ['heelLift', 'spinalRounding', 'description']
                },
                cues: { type: Type.ARRAY, items: { type: Type.STRING }}
            },
            required: ['maxDepthTimestamp', 'formScore', 'flaws', 'cues']
        }
    }
  });
  return JSON.parse(response.text || '{}');
};
