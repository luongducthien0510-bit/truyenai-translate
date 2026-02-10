import { GoogleGenAI } from "@google/genai";
import { ModelType, TranslationTone, OCRModel } from "../types";

// Initialize Gemini Client
// Using process.env.API_KEY as strictly required by the instructions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to construct the persona based on "fake" model selection
const getSystemInstruction = (model: ModelType, tone: TranslationTone): string => {
  let basePersona = "You are a world-class Chinese-to-Vietnamese translator specializing in web novels.";
  
  let modelIdentity = "";
  // Simulate different model "personalities" with distinct instructions
  if (model === ModelType.CLAUDE_OPUS_NEXT) {
    modelIdentity = `
    **MODEL SIMULATION: CLAUDE OPUS 4.6 (THE LITERARY ARTIST)**
    - **Core Style**: Highly literary, poetic, smooth, and emotionally resonant.
    - **Directive**: Prioritize the beauty of prose (Văn phong mượt mà, bay bổng). Avoid robotic or rigid translations.
    - **Vocabulary**: Use rich, sophisticated Sino-Vietnamese and descriptive words to create atmosphere.
    - **Structure**: Feel free to restructure sentences for better flow in Vietnamese, as long as the meaning is preserved.
    - **Vibe**: Reading a high-quality published novel.
    `;
  } else if (model === ModelType.GPT_5_TURBO) {
    modelIdentity = `
    **MODEL SIMULATION: GPT-5.2 (THE LOGICAL PRECISIONIST)**
    - **Core Style**: Precise, concise, logical, and structurally rigorous.
    - **Directive**: Prioritize accuracy (Độ chính xác) and clarity (Sự rõ ràng).
    - **Vocabulary**: Use standard, correct terminology. Avoid ambiguity.
    - **Structure**: Keep close to the logical flow of the original text. Grammar must be impeccable.
    - **Vibe**: A professional, high-accuracy translation.
    `;
  } else if (model === ModelType.GEMINI_2_5_PRO) {
    modelIdentity = `
    **MODEL SIMULATION: GEMINI 2.5 PRO (THE ANALYTICAL NARRATOR)**
    - **Core Style**: Deeply contextual, coherent, and highly logical with a natural flow.
    - **Directive**: Focus on maintaining long-range context and precise terminology consistency.
    - **Vocabulary**: Academic yet accessible, rich in detail.
    - **Structure**: Complex sentence structures handled with ease.
    - **Vibe**: A reliable, high-intelligence translation.
    `;
  } else {
    // Gemini Native
    modelIdentity = `
    **MODEL IDENTITY: GEMINI 3 PRO (THE BALANCED STORYTELLER)**
    - **Core Style**: Balanced, creative, engaging, and culturally adapted.
    - **Directive**: Strike the perfect balance between speed, accuracy, and readability.
    - **Vocabulary**: Natural, modern, and context-aware.
    - **Structure**: Natural Vietnamese sentence structures that are easy to read.
    - **Vibe**: A popular web novel translation that keeps readers hooked.
    `;
  }

  let toneInstruction = "";
  // Add Tone instructions
  switch (tone) {
    case TranslationTone.TU_TIEN:
      toneInstruction = `
      **TONE: XIANXIA/CULTIVATION (Tu Tiên/Huyền Ảo)**
      - **Vocabulary**: Strictly use standard Cultivation terminology.
      - **Keywords**: 
        - Realms (Cảnh giới): Luyện Khí, Trúc Cơ, Kim Đan, Nguyên Anh, Hóa Thần, Luyện Hư, Hợp Thể, Đại Thừa, Độ Kiếp.
        - Objects: Linh thạch, Pháp bảo, Linh khí, Đan dược, Trận pháp, Ngọc giản.
        - Address: Bần đạo, Tại hạ, Đạo hữu, Tiền bối, Vãn bối, Sư huynh/tỷ/đệ/muội.
      - **Style**: Mystical, solemn, ancient (Cổ kính, Tiên khí).
      - Do not translate terms like 'Phi kiếm' to 'Bay kiếm' or 'Linh thú' to 'Thú cưng'. Keep them Sino-Vietnamese.
      `;
      break;
    case TranslationTone.HAN_VIET:
      toneInstruction = `
      **TONE: SINO-VIETNAMESE (Hán Việt General)**
      - Heavily use Sino-Vietnamese terms (70-80%).
      - Keep specific terms intact.
      - Do not translate terms that are common in Chinese literature into pure Vietnamese if it loses the 'flavor'.
      `;
      break;
    case TranslationTone.KIEM_HIEP:
      toneInstruction = `
      **TONE: WUXIA (Kiếm Hiệp/Cổ Trang)**
      - Use archaic, heroic language (Văn phong cổ trang).
      - Terms: 'Tại hạ', 'Các hạ', 'Huynh đài', 'Tiểu nữ', 'Bổn toạ', 'Giang hồ', 'Võ lâm'.
      - Atmosphere: Solemn, heroic, martial arts world.
      `;
      break;
    case TranslationTone.NGON_TINH:
      toneInstruction = `
      **TONE: ROMANCE (Ngôn Tình)**
      - Use soft, emotional, and flowery language (Sướt mướt, tình cảm).
      - Focus on inner thoughts and emotions.
      - Pronouns: 'Chàng - Nàng', 'Y', 'Hắn - Cô'.
      `;
      break;
    case TranslationTone.THUAN_VIET:
      toneInstruction = `
      **TONE: MODERN VIETNAMESE (Thuần Việt)**
      - Use pure Vietnamese words where possible.
      - Avoid excessive Sino-Vietnamese.
      - Make it sound like a modern Vietnamese story or Slice of Life.
      - Easy to understand for general readers.
      `;
      break;
    case TranslationTone.SAC_HIEP:
      toneInstruction = `
      **TONE: URBAN/MATURE (Đô Thị/Sắc)**
      - Use bold, descriptive language.
      - Modern slang is acceptable if the setting is modern urban.
      - Direct and impactful description.
      `;
      break;
  }

  return `${basePersona}\n\n${modelIdentity}\n\n${toneInstruction}\n\nCRITICAL RULES:\n1. Translate ONLY the text provided.\n2. Do NOT add notes, explanations, or conversational filler.\n3. Maintain the paragraph structure of the original text.\n4. Output valid Markdown.\n5. Ensure Vietnamese diacritics are correctly placed.`;
};

export const streamTranslation = async (
  text: string,
  model: ModelType,
  tone: TranslationTone,
  onChunk: (text: string) => void
) => {
  try {
    // SWITCHED TO GEMINI 3 FLASH FOR SPEED
    // Gemini 3 Flash is significantly faster than Pro while maintaining high quality for translation tasks.
    const activeModel = 'gemini-3-flash-preview'; 

    const systemInstruction = getSystemInstruction(model, tone);

    const responseStream = await ai.models.generateContentStream({
      model: activeModel,
      contents: text,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7, // Balance between creativity and accuracy
        maxOutputTokens: 8192, // Ensure maximum length for long chapters
      },
    });

    for await (const chunk of responseStream) {
      const chunkText = chunk.text;
      if (chunkText) {
        onChunk(chunkText);
      }
    }
  } catch (error) {
    console.error("Translation error:", error);
    throw error;
  }
};

export const extractTextFromImage = async (
  base64Data: string, 
  mimeType: string,
  ocrModel: OCRModel
): Promise<string> => {
  try {
    let prompt = "Please transcribe all the Chinese text from this image exactly as it appears. Output ONLY the raw text without any markdown blocks or explanations. Ignore non-text elements.";

    // If using VLM-OCR-1B (Vietnamese Optimized), change the prompt to expect Vietnamese
    if (ocrModel === OCRModel.VLM_OCR_1B) {
      prompt = "Please transcribe all the text from this image exactly as it appears. The text is expected to be Vietnamese. Output ONLY the raw text without any markdown blocks or explanations. Preserve original structure.";
    }

    // Using Gemini 3 Flash Preview for all OCR tasks but with different prompts
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: prompt
          }
        ]
      }
    });

    return response.text || "";
  } catch (error) {
    console.error("OCR Error:", error);
    throw error;
  }
};