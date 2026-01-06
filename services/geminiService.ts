
import { GoogleGenAI, Type } from "@google/genai";
import { CorrectionResult, Quiz, CoachInteraction, Annotation } from "../types";

// Always use the required initialization pattern
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeWork = async (text: string, imageData?: string): Promise<CorrectionResult> => {
  const model = "gemini-3-pro-preview";
  const contents = imageData 
    ? { parts: [{ text: `Analyse et corrige ce travail scolaire. Voici le texte (si OCR nécessaire) et l'image : ${text}` }, { inlineData: { data: imageData.split(',')[1], mimeType: 'image/png' } }] }
    : `Analyse et corrige ce travail scolaire : ${text}`;

  const response = await ai.models.generateContent({
    model,
    contents,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          score: { type: Type.NUMBER },
          feedback: { type: Type.STRING },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          annotations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                original: { type: Type.STRING },
                suggested: { type: Type.STRING },
                comment: { type: Type.STRING },
                type: { type: Type.STRING, description: "grammar, spelling, style, content" }
              },
              required: ["original", "suggested", "comment", "type"]
            }
          },
          concepts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                score: { type: Type.NUMBER }
              },
              required: ["name", "score"]
            }
          },
          quizPrompt: { type: Type.STRING }
        },
        required: ["title", "score", "feedback", "strengths", "weaknesses", "annotations", "concepts"]
      }
    }
  });

  const data = JSON.parse(response.text || '{}');
  return {
    ...data,
    id: Math.random().toString(36).substr(2, 9),
    date: new Date().toISOString(),
  };
};

export const generateQuiz = async (topicOrPrompt: string, difficulty: string = 'Intermédiaire'): Promise<Quiz> => {
  const model = "gemini-3-pro-preview";
  const response = await ai.models.generateContent({
    model,
    contents: `Génère un quiz de 5 questions sur le sujet suivant : ${topicOrPrompt}. Difficulté : ${difficulty}. Réponds uniquement en JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswer: { type: Type.NUMBER },
                explanation: { type: Type.STRING }
              },
              required: ["question", "options", "correctAnswer", "explanation"]
            }
          }
        },
        required: ["title", "questions"]
      }
    }
  });

  const data = JSON.parse(response.text || '{}');
  return { ...data, id: Math.random().toString(36).substr(2, 9), difficulty };
};

export const explainConcept = async (annotation: Annotation, fullText: string): Promise<CoachInteraction> => {
  const model = "gemini-3-pro-preview";
  const response = await ai.models.generateContent({
    model,
    contents: `Tu es un professeur expert et bienveillant. Explique en détail l'erreur suivante : "${annotation.original}" corrigé en "${annotation.suggested}". 
    Le contexte original de l'élève est : "${fullText}".
    Ta mission :
    1. Fournir une explication pédagogique profonde de la règle concernée.
    2. Expliquer pourquoi la suggestion est plus appropriée dans ce contexte précis.
    3. Créer un mini-exercice (QCM) d'application directe pour valider la compréhension.
    
    Réponds impérativement au format JSON structuré selon le schéma demandé.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          explanation: { type: Type.STRING, description: "Une explication détaillée, structurée et encourageante." },
          miniExercise: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.NUMBER },
              explanation: { type: Type.STRING, description: "Le feedback détaillé à montrer après la réponse (explique pourquoi c'est juste ou faux)." }
            },
            required: ["question", "options", "correctAnswer", "explanation"]
          }
        },
        required: ["explanation", "miniExercise"]
      }
    }
  });
  
  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Erreur parsing CoachInteraction:", e);
    return { explanation: response.text || "Désolé, je n'ai pas pu générer l'explication interactive." };
  }
};

export const askCoach = async (question: string, context: string): Promise<string> => {
  const model = "gemini-3-flash-preview";
  const response = await ai.models.generateContent({
    model,
    contents: `Tu es un coach pédagogique bienveillant. L'élève demande : "${question}". Contexte du travail : "${context}". Réponds de manière concise, pédagogique et encourageante en français.`,
  });
  return response.text || "Je n'ai pas pu formuler de réponse. Peux-tu reformuler ?";
};
