import { ModelType, TranslationTone, OCRModel } from './types';

export const MODELS = [
  { 
    id: ModelType.GEMINI_3_PRO, 
    name: 'Gemini 3 Pro', 
    desc: 'Cân bằng tốt nhất giữa tốc độ và sự sáng tạo.',
    icon: '✨'
  },
  { 
    id: ModelType.GEMINI_2_5_PRO, 
    name: 'Gemini 2.5 Pro', 
    desc: 'Ổn định, lý luận sâu, ngữ cảnh rộng.',
    icon: '🧠'
  },
  { 
    id: ModelType.CLAUDE_OPUS_NEXT, 
    name: 'Claude Opus 4.6 (Simulated)', 
    desc: 'Văn phong mượt mà, đậm chất văn học.',
    icon: '🎭'
  },
  { 
    id: ModelType.GPT_5_TURBO, 
    name: 'GPT-5.2 (Simulated)', 
    desc: 'Chính xác cao, logic chặt chẽ.',
    icon: '⚡'
  },
];

export const TONES = [
  { id: TranslationTone.TU_TIEN, name: 'Tu Tiên (Xianxia)', desc: 'Chuyên dụng: Cảnh giới, Pháp bảo, Đan dược, Thần thông' },
  { id: TranslationTone.HAN_VIET, name: 'Hán Việt (General)', desc: 'Giữ nguyên từ Hán Việt, văn phong trang trọng' },
  { id: TranslationTone.KIEM_HIEP, name: 'Kiếm Hiệp (Wuxia)', desc: 'Văn phong cổ trang, hào hùng' },
  { id: TranslationTone.NGON_TINH, name: 'Ngôn Tình (Romance)', desc: 'Nhẹ nhàng, lãng mạn, giàu cảm xúc' },
  { id: TranslationTone.THUAN_VIET, name: 'Thuần Việt (Modern)', desc: 'Dễ hiểu, văn phong hiện đại' },
  { id: TranslationTone.SAC_HIEP, name: 'Sắc/Đô Thị', desc: 'Phóng khoáng, dùng từ mạnh' },
];

export const OCR_MODELS = [
  {
    id: OCRModel.GEMINI_VISION,
    name: 'Gemini Vision (Trung)',
    desc: 'Tối ưu cho văn bản tiếng Trung (Truyện, Manhua).',
    icon: '🇨🇳'
  },
  {
    id: OCRModel.VLM_OCR_1B,
    name: 'VLM-OCR-1B (Việt)',
    desc: 'Tối ưu cho văn bản tiếng Việt (Smoky1496).',
    icon: '🇻🇳'
  }
];

export const SAMPLE_TEXT = `少年坐在山崖之巅，看着云海翻腾，心中却是一片平静。
“这就是修仙界吗？”他喃喃自语。
身后传来一阵轻微的脚步声，一名身着白衣的女子缓缓走来，容颜绝世，气质清冷。
“师弟，该出发了。”女子淡淡说道。`;