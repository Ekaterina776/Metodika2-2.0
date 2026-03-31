import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export type TaskType = 'test' | 'flashcards' | 'matching';

export interface GeneratedTask {
  type: TaskType;
  title: string;
  content: any;
}

export const generateTask = async (prompt: string, type: TaskType): Promise<GeneratedTask> => {
  const model = "gemini-3-flash-preview";

  let responseSchema: any;

  if (type === 'test') {
    responseSchema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        questions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correctAnswer: { type: Type.STRING }
            },
            required: ["question", "options", "correctAnswer"]
          }
        }
      },
      required: ["title", "questions"]
    };
  } else if (type === 'flashcards') {
    responseSchema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        cards: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              front: { type: Type.STRING },
              back: { type: Type.STRING }
            },
            required: ["front", "back"]
          }
        }
      },
      required: ["title", "cards"]
    };
  } else if (type === 'matching') {
    responseSchema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        pairs: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              left: { type: Type.STRING },
              right: { type: Type.STRING }
            },
            required: ["left", "right"]
          }
        }
      },
      required: ["title", "pairs"]
    };
  }

  const systemInstruction = `Вы — эксперт-методист по русскому языку и литературе. 
  Ваша задача — генерировать качественные учебные задания на основе запроса пользователя.
  Тип задания: ${type}.
  Язык: Русский.
  Ответ должен быть строго в формате JSON согласно схеме.`;

  const result = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema,
    },
  });

  const text = result.text;
  if (!text) throw new Error("Empty response from Gemini");

  return {
    type,
    title: JSON.parse(text).title || "Новое задание",
    content: JSON.parse(text)
  };
};
