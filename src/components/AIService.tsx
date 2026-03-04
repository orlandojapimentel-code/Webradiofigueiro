import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Send, Sparkles, MessageSquare, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const getAIInstance = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY is not defined");
  }
  return new GoogleGenAI({ apiKey });
};

export const AIService: React.FC = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'dedication' | 'mood'>('dedication');

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    setResponse('');

    try {
      const ai = getAIInstance();
      const prompt = mode === 'dedication' 
        ? `Transforma esta mensagem numa dedicatória profissional de locutor de rádio para a Web Rádio Figueiró: "${input}". A resposta deve ser curta, calorosa e pronta para ser lida no ar.`
        : `Baseado no meu humor "${input}", sugere 3 tipos de música ou temas musicais ideais para eu ouvir agora na Web Rádio Figueiró. Sê inspirador e breve.`;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: prompt }] }],
      });

      setResponse(result.text || "Desculpa, não consegui gerar uma resposta agora.");
    } catch (error) {
      console.error('AI Error:', error);
      if (error instanceof Error && error.message.includes("GEMINI_API_KEY")) {
        setResponse("O assistente de IA está temporariamente indisponível (Chave API não configurada). Por favor, contacte o administrador.");
      } else {
        setResponse("Erro ao conectar com a inteligência artificial. Tenta novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="ai-assistant" className="py-12 px-4">
      <div className="max-w-4xl mx-auto glass rounded-3xl p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-radio-primary/20 rounded-2xl text-radio-primary">
            <Sparkles size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Assistente Inteligente WRF</h2>
            <p className="text-zinc-500 text-sm">Alimentado por Gemini 2.5 Flash</p>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <button 
            onClick={() => setMode('dedication')}
            className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${mode === 'dedication' ? 'bg-radio-primary text-white shadow-lg' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}
          >
            <MessageSquare size={18} />
            Dedicatórias
          </button>
          <button 
            onClick={() => setMode('mood')}
            className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${mode === 'mood' ? 'bg-radio-primary text-white shadow-lg' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}
          >
            <Music size={18} />
            Sugestão por Humor
          </button>
        </div>

        <div className="relative">
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'dedication' ? "Escreve para quem é a música e o motivo..." : "Como te sentes hoje? (ex: feliz, nostálgico, com energia...)"}
            className="w-full h-32 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-radio-primary outline-none resize-none transition-all"
          />
          <button 
            onClick={handleGenerate}
            disabled={isLoading || !input.trim()}
            className="absolute bottom-4 right-4 p-3 bg-radio-primary text-white rounded-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>

        <AnimatePresence>
          {response && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-6 bg-radio-primary/5 border border-radio-primary/20 rounded-2xl"
            >
              <p className="text-zinc-800 dark:text-zinc-200 leading-relaxed italic">
                "{response}"
              </p>
              <div className="mt-4 flex justify-end">
                <button 
                  onClick={() => window.open(`mailto:webradiofigueiro@gmail.com?subject=Dedicatória IA&body=${encodeURIComponent(response)}`)}
                  className="text-sm font-medium text-radio-primary hover:underline"
                >
                  Enviar para o Estúdio →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
