import React, { useState } from 'react';
import { generateMerchantImage } from '../services/gemini';
import { Download, Share2, Sparkles, Wand2 } from 'lucide-react';

export const MerchantMarketing: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "16:9" | "4:3">("1:1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setGeneratedImage(null);
    const img = await generateMerchantImage(prompt, aspectRatio);
    setGeneratedImage(img);
    setIsGenerating(false);
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-apple border border-gray-100">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-blue-50 p-2.5 rounded-xl">
           <Sparkles className="h-6 w-6 text-blue-600" />
        </div>
        <div>
           <h2 className="text-xl font-bold text-gray-900 tracking-tight">Merchant Studio</h2>
           <p className="text-xs text-gray-500 font-medium">Powered by Gemini 3 Pro</p>
        </div>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Prompt</label>
          <textarea
            className="w-full bg-[#F2F2F7] border-none rounded-xl p-4 text-[17px] text-gray-900 placeholder-gray-400 focus:ring-0 resize-none transition-all"
            rows={3}
            placeholder="Describe your product scene..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 ml-1">Aspect Ratio</label>
          <div className="grid grid-cols-3 gap-3">
            {(["1:1", "16:9", "4:3"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setAspectRatio(r)}
                className={`py-2.5 rounded-xl text-sm font-bold transition-all ${
                  aspectRatio === r 
                    ? 'bg-black text-white shadow-lg scale-[1.02]' 
                    : 'bg-[#F2F2F7] text-gray-500 hover:bg-gray-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt}
          className={`w-full py-4 rounded-full flex items-center justify-center font-bold text-[17px] text-white transition-all shadow-lg active:scale-[0.98] ${
            isGenerating || !prompt 
            ? 'bg-gray-300 cursor-not-allowed shadow-none' 
            : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'
          }`}
        >
          {isGenerating ? (
            <>
              <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full mr-2"></div>
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="h-5 w-5 mr-2" />
              Generate Asset
            </>
          )}
        </button>
      </div>

      {generatedImage && (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="relative group rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
            <img src={generatedImage} alt="Generated" className="w-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4 backdrop-blur-sm">
              <button className="p-3 bg-white/90 backdrop-blur rounded-full text-black hover:scale-110 transition-transform shadow-xl">
                <Download className="h-6 w-6" />
              </button>
              <button className="p-3 bg-white/90 backdrop-blur rounded-full text-black hover:scale-110 transition-transform shadow-xl">
                <Share2 className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};