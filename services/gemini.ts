import { GoogleGenAI, Type } from "@google/genai";
import { ServiceLevel, Quote } from "../types";

// NOTE: In a real production app, backend logic should handle API keys.
// For this frontend-only MVP demo, we assume process.env.API_KEY is available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * USES: gemini-2.5-flash with googleMaps tool
 * Purpose: Validate addresses and find locations globally.
 */
export const searchAddress = async (query: string, userLat?: number, userLng?: number): Promise<string[]> => {
  if (!process.env.API_KEY) return ["Times Square, New York", "Oxford Circus, London", "Shibuya Crossing, Tokyo"];

  try {
    const modelId = "gemini-2.5-flash";
    const tools = [{ googleMaps: {} }];
    const toolConfig = userLat && userLng ? {
      retrievalConfig: {
        latLng: {
          latitude: userLat,
          longitude: userLng
        }
      }
    } : undefined;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Find 5 distinct real addresses or landmarks globally that match this query: "${query}". Return ONLY the address strings separated by pipes (|). Do not include any other text.`,
      config: {
        tools,
        toolConfig,
        temperature: 0.1
      }
    });

    const text = response.text || "";
    const candidates = text.split('|').map(s => s.trim()).filter(s => s.length > 5);
    
    if (candidates.length === 0 && text.length > 5) {
       return [text.trim()];
    }

    return candidates.length > 0 ? candidates : [`${query}`];
  } catch (e) {
    console.error("Address search failed", e);
    return [`${query}`];
  }
};

/**
 * USES: gemini-3-pro-preview with Thinking Budget
 * Purpose: The "Tenbox Core Decision Engine".
 */
export const generateQuotes = async (pickup: string, dropoff: string, item: string, scheduledTime?: string): Promise<Quote[]> => {
  if (!process.env.API_KEY) return getMockQuotes();

  const scheduleContext = scheduledTime 
    ? `IMPORTANT: This is a SCHEDULED delivery for ${scheduledTime}. ETAs must reflect this future date.` 
    : `This is an IMMEDIATE delivery request.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `
        Context: You are the core routing engine for 'Tenbox', a global delivery aggregator.
        Task: Analyze the request: Pickup "${pickup}", Dropoff "${dropoff}", Item "${item}".
        ${scheduleContext}
        
        Logic:
        1. Estimate the distance and traffic conditions for this route anywhere in the world.
        2. Detect the appropriate currency for the location (e.g. USD, EUR, GBP, JPY). Default to USD if unsure.
        3. Select the best underlying courier for 3 service levels: SAVER, STANDARD, RUSH.
        4. Available global couriers: 'DHL', 'FedEx', 'Uber Connect', 'Local Courier', 'Grab', 'Glovo'.
        5. Calculate a realistic price.
        
        Output: JSON array of 3 Quote objects.
      `,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              serviceLevel: { type: Type.STRING, enum: [ServiceLevel.SAVER, ServiceLevel.STANDARD, ServiceLevel.RUSH] },
              price: { type: Type.NUMBER },
              currency: { type: Type.STRING },
              eta: { type: Type.STRING },
              courierName: { type: Type.STRING },
              reliabilityScore: { type: Type.NUMBER }
            }
          }
        }
      }
    });

    const rawQuotes = JSON.parse(response.text || "[]");
    
    // Sanitize quotes to avoid crashing on missing data
    return rawQuotes.map((q: any, i: number) => ({
      id: q.id || `quote-${i}`,
      serviceLevel: q.serviceLevel || ServiceLevel.STANDARD,
      price: q.price || 25,
      currency: q.currency || 'USD',
      eta: q.eta || 'Calculating...',
      courierName: q.courierName || 'Local Partner',
      reliabilityScore: q.reliabilityScore || 90
    }));

  } catch (e) {
    console.error("Quote generation failed", e);
    return getMockQuotes();
  }
};

export const generateMerchantImage = async (prompt: string, aspectRatio: "1:1" | "16:9" | "4:3"): Promise<string | null> => {
  if (!process.env.API_KEY) return "https://picsum.photos/800/800";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: {
        parts: [{ text: `Professional product photography. ${prompt}` }]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: "1K"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (e) {
    console.error("Image generation failed", e);
    return null;
  }
};

const getMockQuotes = (): Quote[] => [
  {
    id: 'q1',
    serviceLevel: ServiceLevel.SAVER,
    price: 15.50,
    currency: 'USD',
    eta: 'Tomorrow by 12 PM',
    courierName: 'FedEx Ground',
    reliabilityScore: 98
  },
  {
    id: 'q2',
    serviceLevel: ServiceLevel.STANDARD,
    price: 28.00,
    currency: 'USD',
    eta: 'Today by 6 PM',
    courierName: 'DHL Express',
    reliabilityScore: 92
  },
  {
    id: 'q3',
    serviceLevel: ServiceLevel.RUSH,
    price: 45.00,
    currency: 'USD',
    eta: 'Today within 45 mins',
    courierName: 'Uber Connect',
    reliabilityScore: 85
  }
];