import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Sparkles, MessageSquare, Music, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RADIO_PHONE } from '../constants';

const getAIInstance = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY is not defined");
  }
  return new GoogleGenAI({ apiKey });
};

export const AIService: React.FC = () => {
  const [input, setInput] = useState('');
  const [song, setSong] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'dedication' | 'mood' | 'request'>('request');

  const handleGenerate = async () => {
    if (!input.trim() && mode !== 'request') return;
    if (mode === 'request' && (!input.trim() || !song.trim())) return;

    setIsLoading(true);
    setResponse('');

    try {
      const ai = getAIInstance();
      let prompt = "";
      
      if (mode === 'request') {
        prompt = `Age como o Assistente Virtual da Web Rádio Figueiró. O ouvinte quer pedir a música "${song}" com a seguinte dedicatória: "${input}". 
        Responde diretamente ao ouvinte de forma muito simpática, entusiasta e breve (máximo 2 frases). 
        Confirma que a escolha é fantástica e diz que o pedido está pronto para ser enviado ao estúdio.`;
      } else if (mode === 'dedication') {
        prompt = `Age como o Assistente Virtual da Web Rádio Figueiró. O ouvinte escreveu esta dedicatória: "${input}". 
        Responde de forma calorosa, elogiando a mensagem e dizendo que é perfeita para passar na rádio. Sê muito breve.`;
      } else {
        prompt = `Age como o Assistente Virtual da Web Rádio Figueiró. O ouvinte sente-se "${input}". 
        Sugere 2 ou 3 estilos musicais ou artistas que combinem com este estado de espírito e convida-o a continuar sintonizado na WRF. Sê breve e inspirador.`;
      }

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: prompt }] }],
      });

      setResponse(result.text || "Olá! Que bom falar contigo. O teu pedido parece fantástico!");
    } catch (error) {
      console.error('AI Error:', error);
      if (error instanceof Error && error.message.includes("GEMINI_API_KEY")) {
        setResponse("O assistente de IA está temporariamente indisponível (Chave API não configurada). Por favor, utiliza o formulário ou o WhatsApp diretamente.");
      } else {
        setResponse("Olá! Tive um pequeno problema técnico, mas não te preocupes. Podes enviar o teu pedido diretamente pelo WhatsApp!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhatsApp = () => {
    const cleanPhone = RADIO_PHONE.replace(/\s+/g, '').replace('+', '');
    const text = mode === 'request' 
      ? `*Pedido de Música - Web Rádio Figueiró*\n\n*Música:* ${song}\n*Dedicatória:* ${input}`
      : `*Dedicatória - Web Rádio Figueiró*\n\n${input}`;
    
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const scrollToForm = () => {
    const element = document.getElementById('request-form');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      element.classList.add('ring-4', 'ring-radio-primary/50');
      setTimeout(() => element.classList.remove('ring-4', 'ring-radio-primary/50'), 2000);
    }
  };

  return (
    <section id="ai-assistant" className="py-12 px-4">
      <div className="max-w-4xl mx-auto glass rounded-3xl p-8 shadow-xl border-2 border-radio-primary/20">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-radio-primary/20 rounded-2xl text-radio-primary animate-pulse">
            <Sparkles size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Assistente Virtual WRF</h2>
            <p className="text-zinc-500 text-sm">Estou aqui para te ajudar com os teus pedidos!</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button 
            onClick={() => { setMode('request'); setResponse(''); }}
            className={`flex-1 min-w-[140px] py-3 rounded-xl flex items-center justify-center gap-2 transition-all font-black uppercase text-xs tracking-wider ${mode === 'request' ? 'bg-radio-primary text-white shadow-lg scale-105 ring-2 ring-radio-primary/20' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200'}`}
          >
            <Music size={18} />
            Pedir Música
          </button>
          <button 
            onClick={() => { setMode('dedication'); setResponse(''); }}
            className={`flex-1 min-w-[140px] py-3 rounded-xl flex items-center justify-center gap-2 transition-all font-black uppercase text-xs tracking-wider ${mode === 'dedication' ? 'bg-radio-primary text-white shadow-lg scale-105 ring-2 ring-radio-primary/20' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200'}`}
          >
            <MessageSquare size={18} />
            Dedicatória
          </button>
          <button 
            onClick={() => { setMode('mood'); setResponse(''); }}
            className={`flex-1 min-w-[140px] py-3 rounded-xl flex items-center justify-center gap-2 transition-all font-black uppercase text-xs tracking-wider ${mode === 'mood' ? 'bg-radio-primary text-white shadow-lg scale-105 ring-2 ring-radio-primary/20' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200'}`}
          >
            <Sparkles size={18} />
            Sugestão
          </button>
        </div>

        <div className="space-y-4">
          {mode === 'request' && (
            <input 
              type="text"
              value={song}
              onChange={(e) => setSong(e.target.value)}
              placeholder="Qual é a música que queres ouvir?"
              className="w-full p-4 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 focus:border-radio-primary outline-none transition-all shadow-sm"
            />
          )}
          
          <div className="relative">
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === 'request' ? "Para quem é a música e qual o motivo?" :
                mode === 'dedication' ? "Escreve aqui a tua mensagem especial..." : 
                "Como te sentes hoje? (ex: feliz, nostálgico, com energia...)"
              }
              className="w-full h-32 p-4 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 focus:border-radio-primary outline-none resize-none transition-all shadow-sm"
            />
            <button 
              onClick={handleGenerate}
              disabled={isLoading || !input.trim() || (mode === 'request' && !song.trim())}
              className="absolute bottom-4 right-4 p-3 bg-radio-primary text-white rounded-xl hover:scale-110 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-lg"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {response && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-6 bg-white dark:bg-zinc-900 border-2 border-radio-primary/20 rounded-3xl shadow-inner relative overflow-hidden"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-radio-primary/10 flex items-center justify-center shrink-0">
                  <Sparkles size={20} className="text-radio-primary" />
                </div>
                <div className="space-y-4 flex-1">
                  <p className="text-zinc-800 dark:text-zinc-100 leading-relaxed font-medium">
                    {response}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button 
                      onClick={handleWhatsApp}
                      className="flex-1 flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-green-600 transition-all shadow-lg hover:scale-105 active:scale-95 justify-center"
                    >
                      <MessageCircle size={18} />
                      WhatsApp Estúdio
                    </button>
                    <button 
                      onClick={scrollToForm}
                      className="flex-1 flex items-center gap-2 px-6 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all shadow-md hover:scale-105 active:scale-95 justify-center"
                    >
                      <Music size={18} />
                      Formulário de Pedido
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
