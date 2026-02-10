export enum ModelType {
  GEMINI_3_PRO = 'gemini-3-pro',
  GEMINI_2_5_PRO = 'gemini-2.5-pro',
  CLAUDE_OPUS_NEXT = 'claude-opus-next',
  GPT_5_TURBO = 'gpt-5-turbo'
}

export enum TranslationTone {
  HAN_VIET = 'han_viet', // Sino-Vietnamese (general)
  TU_TIEN = 'tu_tien', // Xianxia/Cultivation specific
  THUAN_VIET = 'thuan_viet', // Pure Vietnamese (modern/slice of life)
  KIEM_HIEP = 'kiem_hiep', // Wuxia style (heroic, archaic)
  NGON_TINH = 'ngon_tinh', // Romance (flowery, emotional)
  SAC_HIEP = 'sac_hiep' // Edgy/Mature (specific vocabulary)
}

export enum OCRModel {
  GEMINI_VISION = 'gemini-vision',
  VLM_OCR_1B = 'vlm-ocr-1b-vietnamese'
}

export interface TranslationConfig {
  model: ModelType;
  tone: TranslationTone;
  systemInstruction?: string;
}

export interface HistoryItem {
  id: string;
  source: string;
  target: string;
  timestamp: number;
  model: ModelType;
}