import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Calendar, MapPin, ExternalLink, Mail, Phone, Facebook, Twitter, Youtube, Instagram, CloudSun, Newspaper, Image as ImageIcon, PlayCircle, Sparkles, Music, MessageCircle } from 'lucide-react';
import { Player } from './components/Player';
import { AIService } from './components/AIService';
import { RADIO_EMAIL, RADIO_PHONE, SOCIAL_LINKS, PARTNERS, GALLERY_IMAGES, RADIO_WEBSITE } from './constants';

export default function App() {
  const [visitCount, setVisitCount] = useState(10160);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [weather, setWeather] = useState<any>(null);
  const [news, setNews] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'media'>('home');
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    console.log('App component mounted');
    try {
      // Dynamically load Centova Cast scripts
      const scripts = [
        "https://rs2.ptservidor.com:2199/system/recenttracks.js",
        "https://rs2.ptservidor.com:2199/system/streaminfo.js",
        "https://rs2.ptservidor.com:2199/system/request.js"
      ];

      scripts.forEach(src => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        document.body.appendChild(script);
      });

      // Increment visit count on load
      fetch('/api/visits/increment', { method: 'POST' })
        .then(res => res.json())
        .then(data => setVisitCount(data.count))
        .catch(err => console.error('Error incrementing visits:', err));

      // Fetch weather (mocking for Figueiró, Amarante)
      setWeather({ temp: 18, condition: 'Parcialmente Nublado', city: 'Figueiró' });

      // Mock news
      setNews([
        { 
          title: "Amarante celebra tradições locais no próximo fim de semana", 
          source: "Google Notícias", 
          time: "Há 2 horas",
          link: "https://news.google.com/search?q=Amarante+tradições+locais"
        },
        { 
          title: "Web Rádio Figueiró lança novo assistente de IA para ouvintes", 
          source: "WRF News", 
          time: "Há 5 horas",
          link: "https://www.webradiofigueiro.pt"
        },
        { 
          title: "Previsão do tempo: Sol regressa à região norte", 
          source: "Meteo PT", 
          time: "Há 1 dia",
          link: "https://news.google.com/search?q=Previsão+do+tempo+Amarante"
        }
      ]);

      // Dark mode class
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (error) {
      console.error('Error in App useEffect:', error);
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <div className="min-h-screen pb-40 font-sans text-zinc-900 dark:text-zinc-100">
      {/* SEO & Meta */}
      <header className="sticky top-0 z-40 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden shadow-lg shadow-radio-primary/30 flex items-center justify-center bg-radio-primary/10">
              {!logoError ? (
                <img 
                  src="/logo.png" 
                  alt="Logo WRF" 
                  className="w-full h-full object-cover" 
                  onError={() => setLogoError(true)}
                />
              ) : (
                <span className="text-radio-primary font-black text-xl">WRF</span>
              )}
            </div>
            <h1 className="text-xl font-bold tracking-tight hidden sm:block">Web Rádio Figueiró</h1>
          </div>

          <nav className="flex items-center gap-4 md:gap-6">
            <button 
              onClick={() => setActiveTab('home')}
              className={`text-xs md:text-sm font-bold transition-colors ${activeTab === 'home' ? 'text-radio-primary' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}
            >
              Início
            </button>
            <button 
              onClick={() => setActiveTab('media')}
              className={`text-xs md:text-sm font-bold transition-colors ${activeTab === 'media' ? 'text-radio-primary' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}
            >
              Explorar Media
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-xs font-medium">
              <Users size={14} className="text-radio-primary" />
              <span>{visitCount.toLocaleString()} Visitas</span>
            </div>
            
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {isDarkMode ? '🌞' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      {/* News Ticker */}
      <div className="bg-radio-primary text-white py-2 overflow-hidden whitespace-nowrap">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="inline-block"
        >
          <span className="mx-8 font-bold">ÚLTIMA HORA:</span>
          <span className="mx-8">Web Rádio Figueiró - A rádio que te acompanha em todo o lado!</span>
          <span className="mx-8">Sintoniza a melhor música 24h por dia.</span>
          <span className="mx-8">Novas funcionalidades de IA já disponíveis no site.</span>
          <span className="mx-8">Parceria FM Rent-a-car & Bicycle House - Visita o site fm-bicycle.pt</span>
        </motion.div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Content */}
        <div className="lg:col-span-8 space-y-8">
          
          <AnimatePresence mode="wait">
            {activeTab === 'home' ? (
              <motion.div 
                key="home"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                {/* Hero Section */}
                <section className="relative h-64 md:h-96 rounded-3xl overflow-hidden shadow-2xl">
                  <img 
                    src="https://picsum.photos/seed/radio/1200/600" 
                    alt="Radio Studio" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-8">
                    <motion.h2 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-4xl md:text-6xl font-black text-white mb-2"
                    >
                      A Tua Rádio Online
                    </motion.h2>
                    <p className="text-zinc-300 max-w-xl">
                      Emissão 24h a partir de Figueiró, Amarante. A melhor seleção musical, notícias da região e entretenimento sem limites.
                    </p>
                  </div>
                </section>

                {/* AI Assistant */}
                <AIService />

                {/* Programming */}
                <section id="programming" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass p-6 rounded-3xl">
                    <div className="flex items-center gap-2 mb-4 text-radio-primary">
                      <Calendar size={20} />
                      <h3 className="text-xl font-bold">Programação Diária</h3>
                    </div>
                    <ul className="space-y-4">
                      <li className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                        <span className="font-medium">Manhãs WRF</span>
                        <span className="text-zinc-500">08:00 - 12:00</span>
                      </li>
                      <li className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                        <span className="font-medium">Tardes de Música</span>
                        <span className="text-zinc-500">14:00 - 18:00</span>
                      </li>
                      <li className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                        <span className="font-medium">Noites Tranquilas</span>
                        <span className="text-zinc-500">21:00 - 00:00</span>
                      </li>
                    </ul>
                  </div>

                  <div className="glass p-6 rounded-3xl border-l-4 border-radio-primary">
                    <div className="flex items-center gap-2 mb-4 text-radio-primary">
                      <Sparkles size={20} />
                      <h3 className="text-xl font-bold">Destaques Semanais</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="p-4 bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl">
                        <h4 className="font-bold text-radio-primary">Night Grooves</h4>
                        <p className="text-sm text-zinc-500">Domingos, 22:00 - 00:00</p>
                        <p className="text-xs mt-1">1ª Hora: DJ Durval | 2ª Hora: DJ Convidado</p>
                      </div>
                      <div className="p-4 bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-radio-primary">Prazeres Interrompidos</h4>
                            <p className="text-sm text-zinc-500">Quartas e Sextas, 13:00 (Rep. 20:00)</p>
                          </div>
                          <a href="https://www.prazeresinterrompidos.pt/" target="_blank" className="p-2 bg-white dark:bg-zinc-700 rounded-full shadow-sm">
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </motion.div>
            ) : (
              <motion.div 
                key="media"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-12"
              >
                <div className="text-center py-8">
                  <h2 className="text-4xl font-black mb-2">Explorar Media</h2>
                  <p className="text-zinc-500">Galeria, Vídeos e Podcasts da Web Rádio Figueiró</p>
                </div>

                {/* Gallery */}
                <section id="gallery" className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold flex items-center gap-2">
                      <ImageIcon className="text-radio-primary" /> Galeria WRF
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {GALLERY_IMAGES.map((img, i) => (
                      <motion.div 
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        className="aspect-square rounded-2xl overflow-hidden shadow-md"
                      >
                        <img src={img.url} alt={`Gallery ${i}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </motion.div>
                    ))}
                  </div>
                </section>

                {/* Videos */}
                <section className="space-y-6">
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                    <PlayCircle className="text-radio-primary" /> Vídeos em Destaque
                  </h3>
                  <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black">
                    <iframe 
                      className="w-full h-full"
                      src="https://www.youtube.com/embed/r5GzTRSWXgc" 
                      title="YouTube video player" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                    ></iframe>
                  </div>
                </section>

                {/* Podcasts */}
                <section className="space-y-6">
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                    <Music className="text-radio-primary" /> Entrevistas & Podcasts
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass p-6 rounded-3xl space-y-4">
                      <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-2xl">
                        <p className="text-sm font-bold">Entrevista Especial: Ás da Concertina</p>
                        <audio controls className="w-full mt-2 h-8">
                          <source src="https://www.dropbox.com/scl/fi/u3r7msk0h6blqpjt8mrba/Entrevista-s-da-concertina-e-Vasquinho-24-01-2025.mp3?rlkey=2sb2suromeylsn0yiwoyc67mn&st=qhx3c6fq&dl=1" type="audio/mpeg" />
                        </audio>
                      </div>
                    </div>
                    <div className="glass p-6 rounded-3xl space-y-4">
                      <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-2xl">
                        <p className="text-sm font-bold">Prazeres Interrompidos - Promo</p>
                        <audio controls className="w-full mt-2 h-8">
                          <source src="https://www.dropbox.com/scl/fi/tz8ccze2co79c16pwq1jp/PROMO-Web-R-dio-Figueir.mp3?rlkey=88lpwhzqnl845jn86g4b4b7ai&st=try9kss2&dl=1" type="audio/mpeg" />
                        </audio>
                      </div>
                    </div>
                  </div>
                </section>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Sidebar */}
        <aside className="lg:col-span-4 space-y-8">
          
          {/* Weather Widget */}
          <div className="glass p-6 rounded-3xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2">
                <CloudSun className="text-radio-primary" /> Tempo em Figueiró
              </h3>
              <span className="text-xs text-zinc-500">Agora</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-black text-radio-primary">{weather?.temp}°C</div>
              <div>
                <p className="font-medium">{weather?.condition}</p>
                <p className="text-xs text-zinc-500">Figueiró, Amarante</p>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="glass p-6 rounded-3xl shadow-lg">
            <h3 className="font-bold mb-4">Segue-nos</h3>
            <div className="grid grid-cols-5 gap-4">
              <a href={SOCIAL_LINKS.facebook} target="_blank" className="p-3 bg-blue-600 text-white rounded-2xl flex items-center justify-center hover:scale-110 transition-transform">
                <Facebook size={20} />
              </a>
              <a href={SOCIAL_LINKS.instagram} target="_blank" className="p-3 bg-pink-600 text-white rounded-2xl flex items-center justify-center hover:scale-110 transition-transform">
                <Instagram size={20} />
              </a>
              <a href={`https://wa.me/351910270085`} target="_blank" className="p-3 bg-green-500 text-white rounded-2xl flex items-center justify-center hover:scale-110 transition-transform">
                <MessageCircle size={20} />
              </a>
              <a href={SOCIAL_LINKS.twitter} target="_blank" className="p-3 bg-sky-500 text-white rounded-2xl flex items-center justify-center hover:scale-110 transition-transform">
                <Twitter size={20} />
              </a>
              <a href={SOCIAL_LINKS.youtube} target="_blank" className="p-3 bg-red-600 text-white rounded-2xl flex items-center justify-center hover:scale-110 transition-transform">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* News */}
          <div className="glass p-6 rounded-3xl shadow-lg">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Newspaper size={18} className="text-radio-primary" /> Notícias Locais
            </h3>
            <div className="space-y-4">
              {news.map((item, i) => (
                <a 
                  key={i} 
                  href={item.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block group cursor-pointer"
                >
                  <h4 className="text-sm font-medium group-hover:text-radio-primary transition-colors">{item.title}</h4>
                  <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                    <span>{item.source}</span>
                    <span>{item.time}</span>
                  </div>
                </a>
              ))}
            </div>
            <button className="w-full mt-6 py-2 text-xs font-bold text-radio-primary hover:underline">
              Ver mais notícias no Google →
            </button>
          </div>

          {/* Recent Tracks Widget */}
          <div className="glass p-6 rounded-3xl shadow-lg">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Music size={18} className="text-radio-primary" /> Tocadas Recentemente
            </h3>
            <div className="cc_recenttracks_list text-sm overflow-hidden" data-username="orlando">
              Carregando ...
            </div>
          </div>

          {/* Song Request Form */}
          <div className="glass p-6 rounded-3xl shadow-lg">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-radio-primary">
              <Music size={18} /> Pedir uma Música
            </h3>
            <form className="cc_request_form space-y-3" data-username="orlando">
              <div data-type="result" className="text-xs font-bold text-radio-primary mb-2"></div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-zinc-500">Artista</label>
                <input type="text" name="request[artist]" className="w-full p-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-zinc-500">Música</label>
                <input type="text" name="request[title]" className="w-full p-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-zinc-500">Dedicado para</label>
                <input type="text" name="request[dedication]" className="w-full p-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-zinc-500">Seu nome</label>
                <input type="text" name="request[sender]" className="w-full p-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-zinc-500">Seu E-Mail</label>
                <input type="text" name="request[email]" className="w-full p-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm" />
              </div>
              <button type="button" data-type="submit" className="w-full py-3 bg-radio-primary text-white rounded-xl font-bold text-sm hover:scale-105 transition-transform shadow-lg">
                Submeter pedido
              </button>
            </form>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <a 
              href="https://www.viralagenda.com/pt/p/municipiodeamarante" 
              target="_blank"
              className="block w-full p-4 bg-zinc-900 text-white rounded-2xl font-bold text-center hover:bg-zinc-800 transition-colors shadow-lg"
            >
              Agenda Cultural
            </a>
            <a 
              href="https://www.farmaciasdeservico.net/mapa/3719" 
              target="_blank"
              className="block w-full p-4 bg-emerald-600 text-white rounded-2xl font-bold text-center hover:bg-emerald-700 transition-colors shadow-lg"
            >
              Farmácias de Serviço
            </a>
          </div>

          {/* Partnerships */}
          <div className="glass p-6 rounded-3xl shadow-lg border-2 border-radio-primary/20">
            <h3 className="font-bold mb-4">Parcerias WRF</h3>
            <div className="space-y-4">
              {PARTNERS.map((partner, i) => (
                <a key={i} href={partner.url} target="_blank" className="block p-4 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden">
                  <div className="h-20 mb-3 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900/50 rounded-xl">
                    <img 
                      src={partner.image} 
                      alt={partner.name} 
                      className="max-h-full max-w-full object-contain" 
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(partner.name)}&background=f27d26&color=fff`;
                      }}
                    />
                  </div>
                  <p className="text-lg font-bold text-radio-primary leading-tight mb-1">{partner.name}</p>
                  <p className="text-xs text-zinc-500">Visita o nosso site oficial para mais informações.</p>
                </a>
              ))}
              <div className="p-4 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-center">
                <p className="text-sm font-medium mb-2">Queres ser parceiro?</p>
                <button 
                  onClick={() => window.open(`mailto:${RADIO_EMAIL}?subject=Parceria WRF`)}
                  className="px-4 py-2 bg-radio-primary text-white rounded-xl text-xs font-bold hover:scale-105 transition-transform"
                >
                  Saber Mais
                </button>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="glass p-6 rounded-3xl shadow-lg">
            <h3 className="font-bold mb-4">Contactos</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail size={16} className="text-radio-primary" />
                <a href={`mailto:${RADIO_EMAIL}`} className="hover:underline">{RADIO_EMAIL}</a>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone size={16} className="text-radio-primary" />
                <span>{RADIO_PHONE}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MessageCircle size={16} className="text-green-500" />
                <a href={`https://wa.me/351910270085`} target="_blank" className="hover:underline">WhatsApp Estúdio</a>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin size={16} className="text-radio-primary" />
                <span>Figueiró, Amarante, Portugal</span>
              </div>
            </div>
            <button 
              onClick={() => window.open(`mailto:${RADIO_EMAIL}`)}
              className="w-full mt-6 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl text-sm font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              Enviar Email
            </button>
          </div>

        </aside>
      </main>

      {/* Fixed Player */}
      <Player />

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 py-12 border-t border-zinc-200 dark:border-zinc-800 text-center">
        <p className="text-sm text-zinc-500">
          © {new Date().getFullYear()} Web Rádio Figueiró. Todos os direitos reservados.
        </p>
        <p className="text-[10px] text-zinc-400 mt-2">
          Desenvolvido para uma experiência de rádio profissional de alta fidelidade.
        </p>
      </footer>
    </div>
  );
}
