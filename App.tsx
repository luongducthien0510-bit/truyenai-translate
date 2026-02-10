import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Copy, 
  RotateCcw, 
  BookOpen, 
  Eraser,
  Wand2,
  Check,
  AlertCircle,
  Image as ImageIcon,
  Loader2,
  X,
  PenLine
} from 'lucide-react';

import { MODELS, TONES, OCR_MODELS, SAMPLE_TEXT } from './constants';
import { ModelType, TranslationTone, OCRModel } from './types';
import { streamTranslation, extractTextFromImage } from './services/gemini';
import { Button } from './components/Button';
import { Select } from './components/Select';

const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>(ModelType.GEMINI_3_PRO);
  const [selectedTone, setSelectedTone] = useState<string>(TranslationTone.HAN_VIET);
  const [selectedOCR, setSelectedOCR] = useState<string>(OCRModel.GEMINI_VISION);
  const [copied, setCopied] = useState(false);
  
  // New state for image preview and drag interaction
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const outputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize output textarea
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.style.height = 'auto';
      outputRef.current.style.height = outputRef.current.scrollHeight + 'px';
    }
  }, [outputText]);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    
    setIsTranslating(true);
    setOutputText(''); // Clear previous output
    setError(null); // Clear previous errors

    try {
      await streamTranslation(
        inputText,
        selectedModel as ModelType,
        selectedTone as TranslationTone,
        (chunk) => {
          setOutputText(prev => prev + chunk);
        }
      );
    } catch (err: any) {
      console.error("Translation error:", err);
      handleError(err);
    } finally {
      setIsTranslating(false);
    }
  };

  const processImageFile = async (file: File) => {
    // Validate type
    if (!file.type.startsWith('image/')) {
      setError("Vui lòng chỉ chọn file ảnh (JPG, PNG, WebP).");
      return;
    }

    setIsScanning(true);
    setError(null);

    // Create preview and prepare for OCR
    try {
      const reader = new FileReader();
      
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const result = reader.result as string;
          setImagePreview(result); // Set preview immediately
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
      });

      reader.readAsDataURL(file);
      const base64Data = await base64Promise;

      // Perform OCR with selected model
      const text = await extractTextFromImage(base64Data, file.type, selectedOCR as OCRModel);
      
      if (text.trim()) {
        setInputText(text.trim());
      } else {
        setError("Không tìm thấy văn bản nào trong ảnh.");
      }
    } catch (err: any) {
      console.error("OCR error:", err);
      handleError(err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    // Reset input so same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- Drag and Drop Handlers ---
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      processImageFile(file);
    }
  };

  // --- Paste Handler ---
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (file) processImageFile(file);
        return; // Stop after finding the first image
      }
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setInputText(''); // Optionally clear text or keep it? User might want to keep text. 
    // Usually if removing image, we might want to reset, but let's just remove the preview.
  };

  const handleError = (err: any) => {
    let errorMessage = "Đã xảy ra lỗi không xác định. Vui lòng thử lại.";
      
    const errString = err?.toString() || "";
    
    if (errString.includes("403") || errString.includes("API key")) {
      errorMessage = "Lỗi xác thực (403): API Key không hợp lệ hoặc thiếu.";
    } else if (errString.includes("429")) {
      errorMessage = "Lỗi hạn ngạch (429): Hệ thống đang quá tải. Vui lòng đợi.";
    } else if (errString.includes("503")) {
      errorMessage = "Máy chủ bận (503): Dịch vụ AI đang bảo trì. Hãy thử lại sau.";
    } else if (errString.includes("SAFETY")) {
      errorMessage = "Lỗi an toàn: Nội dung bị chặn bởi bộ lọc.";
    }
    setError(errorMessage);
  };

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadSample = () => {
    setImagePreview(null);
    setInputText(SAMPLE_TEXT);
    setError(null);
  };

  const clearAll = () => {
    setImagePreview(null);
    setInputText('');
    setOutputText('');
    setError(null);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 selection:bg-indigo-500/30">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageUpload} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent hidden sm:block">
              TruyệnAI Translate
            </h1>
          </div>
          <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-400">
             <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Powered by Gemini 3
             </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Controls */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 backdrop-blur-sm">
          <div className="md:col-span-3">
            <Select 
              label="Mô hình Dịch (Translator)" 
              options={MODELS} 
              value={selectedModel} 
              onChange={setSelectedModel}
              disabled={isTranslating || isScanning}
            />
          </div>
          <div className="md:col-span-3">
            <Select 
              label="Phong cách (Tone)" 
              options={TONES} 
              value={selectedTone} 
              onChange={setSelectedTone}
              disabled={isTranslating || isScanning}
            />
          </div>
           <div className="md:col-span-3">
            <Select 
              label="Bộ quét ảnh (OCR Engine)" 
              options={OCR_MODELS} 
              value={selectedOCR} 
              onChange={setSelectedOCR}
              disabled={isTranslating || isScanning}
            />
          </div>
          <div className="md:col-span-3 flex items-end">
            <Button 
              onClick={handleTranslate} 
              disabled={!inputText.trim() || isTranslating || isScanning}
              isLoading={isTranslating}
              className="w-full h-[42px] text-base"
              icon={<Wand2 className="w-4 h-4" />}
            >
              {isTranslating ? 'Đang dịch...' : 'Bắt đầu dịch'}
            </Button>
          </div>
        </div>

        {/* Translation Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-280px)] min-h-[500px]">
          
          {/* Source Input */}
          <div className="flex flex-col gap-2 h-full">
            <div className="flex items-center justify-between px-1">
              <span className="text-sm font-medium text-slate-400">Nguồn (Source)</span>
              <div className="flex gap-2">
                 <button 
                  onClick={triggerFileUpload}
                  className="text-xs flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors"
                  disabled={isTranslating || isScanning}
                >
                  <ImageIcon className="w-3 h-3" />
                  Chọn ảnh
                </button>
                 <button 
                  onClick={loadSample}
                  className="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors"
                  disabled={isTranslating || isScanning}
                >
                  Dùng mẫu
                </button>
                <button 
                  onClick={clearAll}
                  className="text-xs flex items-center gap-1 text-slate-500 hover:text-red-400 transition-colors"
                  disabled={isTranslating || isScanning}
                >
                  <Eraser className="w-3 h-3" /> Xóa
                </button>
              </div>
            </div>
            
            <div 
              className={`relative flex-1 group flex flex-col bg-slate-800 border rounded-xl overflow-hidden transition-all duration-200 ${isDragging ? 'border-indigo-500 ring-2 ring-indigo-500/30' : 'border-slate-700'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {/* Image Preview Area */}
              {imagePreview && (
                <div className="relative w-full h-48 bg-slate-900/50 border-b border-slate-700 flex items-center justify-center p-2 group/image">
                   <img 
                    src={imagePreview} 
                    alt="Uploaded content" 
                    className="h-full w-auto object-contain rounded-md shadow-sm"
                   />
                   <button 
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1 bg-slate-900/80 hover:bg-red-500 text-slate-200 rounded-full transition-colors border border-slate-700"
                    title="Xóa ảnh"
                   >
                     <X className="w-4 h-4" />
                   </button>
                </div>
              )}

              {/* Text Area */}
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onPaste={handlePaste}
                placeholder="Nhập text, dán ảnh (Ctrl+V) hoặc kéo thả ảnh vào đây..."
                className="flex-1 w-full p-4 bg-transparent outline-none resize-none text-lg leading-relaxed font-serif placeholder:text-slate-600"
                spellCheck={false}
              />

              {/* Empty State Overlay (only if no text and no image) */}
              {!inputText && !imagePreview && !isScanning && (
                 <div className="absolute inset-0 pointer-events-none flex flex-col gap-2 items-center justify-center text-slate-600 opacity-20">
                    <BookOpen className="w-16 h-16" />
                    <span className="text-sm font-medium">Kéo thả ảnh hoặc nhập text</span>
                 </div>
              )}

              {/* Dragging Overlay */}
              {isDragging && (
                <div className="absolute inset-0 bg-indigo-900/50 backdrop-blur-sm border-2 border-indigo-500 border-dashed rounded-xl z-20 flex flex-col items-center justify-center pointer-events-none">
                  <ImageIcon className="w-12 h-12 text-indigo-300 mb-2 animate-bounce" />
                  <span className="text-indigo-200 font-medium">Thả ảnh vào đây để quét text</span>
                </div>
              )}

              {/* Loading/OCR Overlay */}
              {isScanning && (
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                  <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-3" />
                  <p className="text-emerald-400 font-medium">Đang đọc văn bản...</p>
                  <p className="text-slate-500 text-xs mt-1">
                    {selectedOCR === OCRModel.VLM_OCR_1B ? 'VLM-OCR-1B (VN)' : 'Gemini Vision (CN)'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Arrow */}
          <div className="hidden lg:flex flex-col items-center justify-center gap-4 text-slate-600">
            <div className={`p-2 rounded-full border border-slate-700 transition-all duration-500 ${isTranslating ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400 rotate-180' : 'bg-slate-800'}`}>
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>

          {/* Target Output */}
          <div className="flex flex-col gap-2 h-full">
             <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-400">Tiếng Việt (Vietnamese)</span>
                {!isTranslating && outputText && !error && (
                  <span className="text-xs text-slate-500 flex items-center gap-1 opacity-50">
                    <PenLine className="w-3 h-3" />
                    Có thể sửa
                  </span>
                )}
              </div>
              <button 
                onClick={handleCopy}
                disabled={!outputText || !!error}
                className={`text-xs flex items-center gap-1 transition-colors ${copied ? 'text-green-400' : 'text-slate-500 hover:text-white'}`}
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Đã sao chép' : 'Sao chép'}
              </button>
            </div>
            <div className={`relative flex-1 flex flex-col bg-slate-800 border rounded-xl overflow-hidden shadow-inner bg-opacity-50 transition-all ${error ? 'border-red-500/50 bg-red-900/10' : 'border-slate-700 focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/20'}`}>
              {error ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300">
                  <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 ring-1 ring-red-500/30">
                    <AlertCircle className="w-8 h-8 text-red-400" />
                  </div>
                  <h3 className="text-red-200 font-semibold text-lg mb-2">Thất bại</h3>
                  <p className="text-red-300/80 text-sm max-w-xs mb-6 leading-relaxed">{error}</p>
                  <button 
                    onClick={() => setError(null)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-lg text-sm text-slate-200 transition-all shadow-sm"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Quay lại
                  </button>
                </div>
              ) : (
                <textarea
                  value={outputText}
                  onChange={(e) => setOutputText(e.target.value)}
                  style={{ fontFamily: '"Times New Roman", Times, serif' }}
                  className="flex-1 w-full p-6 bg-transparent outline-none resize-none text-xl leading-8 text-slate-100 placeholder:text-slate-600"
                  placeholder={isTranslating ? "Đang phân tích và dịch..." : "Bản dịch sẽ hiện ở đây (có thể chỉnh sửa)..."}
                  spellCheck={false}
                />
              )}
               {isTranslating && !error && (
                <div className="absolute bottom-4 right-4">
                  <span className="flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                  </span>
                </div>
              )}
            </div>
          </div>

        </div>
        
        {/* Footer Info */}
        <div className="mt-8 text-center text-xs text-slate-500">
           <p>Lưu ý: Các mô hình như Claude Opus 4.6 và GPT-5.2 là mô phỏng dựa trên công nghệ Gemini 3 Pro để phục vụ mục đích demo.</p>
        </div>
      </main>
    </div>
  );
};

export default App;