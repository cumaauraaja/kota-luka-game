import React, { useState, useEffect, useRef } from 'react';
import { Send, User, MapPin, Briefcase, Wallet, Heart, Brain, Backpack, AlertTriangle, ShieldAlert, Activity, Eye, EyeOff, Copy, Download, Upload, RotateCcw, CheckCircle, X, Clock } from 'lucide-react';

// MASUKKAN API KEY KAMU DI ANTARA TANDA KUTIP DI BAWAH INI
const apiKey = import.meta.env.VITE_API_KEY;

const SYSTEM_PROMPT = `
Kamu adalah mesin naratif untuk sebuah game roleplay teks imersif berjudul "Kota Luka".
Kamu bertindak sebagai Dungeon Master yang menjelma menjadi dunia, semua NPC, dan hukum realitas di dalam game.
Patuhi aturan berikut tanpa tanpa kecuali:

1. PREMIS & DUNIA
- Setting: Sebuah kota fiksi modern yang luas, suram, dan realistis bernama Kota Luka. Terdapat kontras sosial yang absolut: Di satu sisi adalah distrik kumuh tempat pemain berada, dan di sisi lain terdapat "Distrik Elit" yang merepresentasikan Quiet Luxury (kemewahan yang sunyi, elegan, sangat tertutup, mahal namun tidak norak). Distrik elit ini seolah tak tersentuh oleh penderitaan di distrik bawah.
- Pemain: Seorang dewasa muda (18-25 tahun) di distrik miskin.
- Genre: Simulasi kehidupan, sandbox, drama psikologis, neo-noir. Eksplorasi tema dewasa dilakukan secara implisit, atmosferik, dan psikologis, bukan deskripsi grafis vulgar.

2. MEKANIK INTI & NPC
- SKILL ADALAH MUTLAK (SKILL CHECKS): Setiap aksi pemain WAJIB dievaluasi berdasarkan skill yang mereka miliki di LifeSheet. Level skill (Pemula, Amatir, Mahir, Expert, Master) secara langsung menentukan persentase keberhasilan atau kualitas hasil aksi. Jika skill kurang, aksi bisa gagal, berakibat fatal, atau sukses dengan komplikasi. Jelaskan secara eksplisit dalam narasi bagaimana skill pemain (atau ketiadaannya) memengaruhi hasilnya. AI berhak menambahkan skill baru secara otomatis ke LifeSheet jika pemain mencoba hal baru.
- Ekonomi realistis (Rupiah/Rp). Tagihan berjalan.
- WAKTU & DURASI: Kamu WAJIB melacak pergerakan waktu di dalam LifeSheet. Setiap aktivitas memakan waktu (misal: mengobrol 10 menit, berjalan antar distrik 2 jam, tidur 8 jam). Majukan waktu secara logis ("Hari 1 - Pagi" -> "Siang" -> "Sore" -> "Malam" -> "Hari 2 - Pagi"). Sesuaikan narasi dan suasana Kota Luka dengan waktu saat itu (panas terik siang hari, atau gelap dan berbahayanya malam).
- NPC memiliki memori (Trust, Respect, Affection -100 s/d 100).
- PERILAKU NPC: NPC tidak boleh hanya reaktif. Mereka harus menggunakan taktik manipulasi psikologis, eksploitasi transaksional, dan melakukan eskalasi terukur berdasarkan parameter Trust dan Respect mereka terhadap pemain.

3. FORMAT OUTPUT (SANGAT PENTING)
Setiap balasanmu WAJIB berisi narasi dalam sudut pandang orang pertama ("Kamu").
Di akhir narasi teks, kamu WAJIB menuliskan pertanyaan "Apa yang kamu lakukan selanjutnya?" ATAU membuat daftar 3 opsi tindakan bernomor (1, 2, 3).
Di bagian paling akhir balasanmu, kamu WAJIB menyertakan JSON LifeSheet yang diperbarui di dalam blok kode \`\`\`json.
JANGAN sertakan tag [LIFESHEET] di luar blok kode. Pastikan format JSON valid.
`;

const INITIAL_STORY = `Udara di kamar berukuran 3x3 meter ini terasa pengap, menempel di kulitmu bersama aroma debu dan sisa mi instan semalam. Sinar matahari pagi yang pucat berjuang menembus jendela berkaca buram, mencetak bayangan terali besi yang memanjang di atas kasur tipismu yang berderit. Di luar, sayup-sayup terdengar deru mesin berpadu dengan klakson tak sabaran—napas parau Kota Luka yang tak pernah peduli pada siapa pun yang tertinggal.

Kamu mengerjap, menatap langit-langit berjamur. Ponselmu yang layarnya retak bergetar singkat di atas lantai semen yang dingin. 

*Bzzzt.*

Sebuah pesan singkat masuk. 
**Pengirim: Ibu Kos**
*"Tunggakan bulan ini jatuh tempo besok pagi. Kalau tidak ada Rp 500.000, silakan angkat kaki dan bawa barang-barangmu."*

Kamu menelan ludah. Kamu tahu persis tidak ada uang sebanyak itu. Dompetmu menipis, dan sisa saldo di rekening mungkin hanya cukup untuk makan nasi bungkus tiga hari ke depan.

Sebelum kita mulai menghadapi kerasnya Kota Luka, **Siapa namamu dan apa jenis kelaminmu?**`;

const INITIAL_LIFESHEET = {
  nama: "?",
  gender: "?",
  usia: 20,
  pekerjaan: "Pengangguran",
  waktu: "Hari 1 - Pagi",
  uang: 45000,
  skills: {
    "Observasi": { level: "Pemula", deskripsi: "Mampu memperhatikan detail dasar di sekitar." },
    "Persuasi": { level: "Pemula", deskripsi: "Kemampuan berbicara untuk meyakinkan orang lain." },
    "Ketahanan Fisik": { level: "Pemula", deskripsi: "Stamina dasar untuk bertahan di kerasnya jalanan." }
  },
  inventaris: ["Ponsel pintar (layar retak)", "Pakaian kasual usang", "Dompet kulit tipis"],
  tempat_tinggal: { tipe: "Kamar Kos Kumuh", lokasi: "Distrik Pinggiran, Kota Luka" },
  hubungan_npc: {
    "Ibu Kos": { trust: 0, respect: -10, affection: -20, catatan: "Marah karena tunggakan sewa. Memberi ultimatum pengusiran." }
  },
  reputasi_global: "Bukan Siapa-siapa",
  status_kriminal: "Bersih",
  ringkasan_narasi_terakhir: "Terbangun dan mendapat ancaman pengusiran."
};

export default function App() {
  const [messages, setMessages] = useState([{ role: 'model', content: INITIAL_STORY }]);
  const [lifeSheet, setLifeSheet] = useState(INITIAL_LIFESHEET);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showStatsMobile, setShowStatsMobile] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleReset = () => {
    setMessages([{ role: 'model', content: INITIAL_STORY }]);
    setLifeSheet(INITIAL_LIFESHEET);
    showToast('Permainan diulang dari awal.');
  };

  const parseAIResponse = (text) => {
    const jsonRegex = /```json\s*([\s\S]*?)\s*```/i;
    const match = text.match(jsonRegex);
    let narrative = text;
    let newLifeSheet = null;

    if (match) {
      try {
        newLifeSheet = JSON.parse(match[1]);
        narrative = text.replace(jsonRegex, '').replace(/\[LIFESHEET\]/gi, '').trim();
      } catch (e) {
        console.error("Gagal membaca struktur LifeSheet dari AI:", e);
      }
    }
    return { narrative, newLifeSheet };
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    if (apiKey === "MASUKKAN_API_KEY_AI_STUDIO_KAMU_DISINI" || apiKey.trim() === "") {
        setMessages(prev => [...prev, { role: 'user', content: inputValue }, { role: 'model', content: "*[Sistem: API Key belum dimasukkan di baris kode ke-5!]*", isError: true }]);
        setInputValue('');
        return;
    }

    const userText = inputValue.trim();
    setInputValue('');
    
    const newMessages = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const recentMessages = newMessages.slice(-5);
      
      let apiContents = recentMessages.map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      while (apiContents.length > 0 && apiContents[0].role === 'model') {
          apiContents.shift();
      }

      const dynamicSystemPrompt = `${SYSTEM_PROMPT}\n\n[STATUS LIFESHEET SAAT INI (ACUAN FAKTA)]\nIni adalah status pemain saat ini. Gunakan data ini sebagai acuan mutlak:\n${JSON.stringify(lifeSheet, null, 2)}`;

      const payload = {
        systemInstruction: { parts: [{ text: dynamicSystemPrompt }] },
        contents: apiContents,
      };

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (responseText) {
        const { narrative, newLifeSheet } = parseAIResponse(responseText);
        setMessages(prev => [...prev, { role: 'model', content: narrative }]);
        if (newLifeSheet) setLifeSheet(newLifeSheet);
      } else {
        throw new Error("Respons kosong dari server.");
      }

    } catch (error) {
      console.error("Kesalahan API:", error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: `*[Sistem Error: Koneksi terputus (${error.message}). Silakan coba tindakanmu lagi.]*`,
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-300 font-sans overflow-hidden relative">
      
      {toastMessage && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 bg-slate-800 border border-amber-500/50 text-amber-400 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm transition-all animate-bounce">
          <CheckCircle size={16} />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center z-10 shrink-0 shadow-md">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-wider text-amber-500 uppercase font-serif">Kota Luka</h1>
          <p className="text-xs text-slate-500 tracking-widest hidden md:block">v1.2.0 // IMMERSIVE ENGINE</p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleReset} className="flex items-center gap-2 p-2 text-xs font-semibold rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-red-400 transition border border-transparent hover:border-slate-600" title="Ulang Permainan">
            <RotateCcw size={14} /> Ulang
          </button>
          <button 
            onClick={() => setShowStatsMobile(!showStatsMobile)}
            className="lg:hidden p-2 rounded-md bg-amber-900/50 border border-amber-700/50 text-amber-500 hover:bg-amber-800/50 transition flex items-center gap-2"
          >
            {showStatsMobile ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Left Column: Story/Chat */}
        <div className={`flex flex-col flex-1 w-full transition-all duration-300 ${showStatsMobile ? 'hidden lg:flex' : 'flex'}`}>
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[90%] md:max-w-[75%] rounded-lg p-4 leading-relaxed whitespace-pre-wrap shadow-sm
                    ${msg.role === 'user' 
                      ? 'bg-amber-900/40 text-amber-100 border border-amber-700/50 rounded-br-none' 
                      : msg.isError 
                        ? 'bg-red-950/50 text-red-400 border border-red-900 rounded-bl-none italic'
                        : 'bg-slate-900 text-slate-300 border border-slate-800 rounded-bl-none font-serif'
                    }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-900 border border-slate-800 rounded-lg rounded-bl-none p-4 flex gap-2 items-center text-slate-500">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  <span className="ml-2 text-sm italic font-serif">Kota sedang merespons...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-slate-900 border-t border-slate-800 shrink-0">
            <form onSubmit={handleSendMessage} className="flex gap-2 max-w-4xl mx-auto">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Apa yang kamu lakukan?"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-slate-200 transition"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="bg-amber-700 hover:bg-amber-600 disabled:opacity-50 disabled:hover:bg-amber-700 text-white rounded-lg px-4 md:px-6 py-3 flex items-center justify-center transition"
              >
                <Send size={18} className="md:mr-2" />
                <span className="hidden md:inline font-semibold tracking-wide">Aksi</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: LIFESHEET (Stats) */}
        <div className={`w-full lg:w-80 xl:w-96 bg-slate-900/80 border-l border-slate-800 flex flex-col shrink-0 overflow-y-auto 
          ${showStatsMobile ? 'absolute inset-0 z-20' : 'hidden lg:flex'}`}
        >
          <div className="p-5 space-y-6">
            <div className="text-center pb-4 border-b border-slate-800">
              <h2 className="text-xl font-bold text-amber-500 uppercase tracking-widest mb-1">LIFESHEET</h2>
              <p className="text-xs text-slate-500">Status Karakter</p>
            </div>

            {/* Basic Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-300">
                <User size={16} className="text-slate-500" />
                <span className="font-semibold">{lifeSheet.nama !== "?" ? lifeSheet.nama : "Tidak Diketahui"}</span>
                <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400 ml-auto">{lifeSheet.usia} thn | {lifeSheet.gender !== "?" ? lifeSheet.gender : "-"}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Clock size={16} className="text-blue-500" />
                <span className="font-semibold text-blue-200">{lifeSheet.waktu || "Hari 1 - Pagi"}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Briefcase size={16} className="text-slate-500" />
                <span className="text-sm">{lifeSheet.pekerjaan}</span>
              </div>
              <div className="flex items-center gap-3 text-emerald-400">
                <Wallet size={16} />
                <span className="font-mono font-bold tracking-tight">{formatRupiah(lifeSheet.uang)}</span>
              </div>
              <div className="flex items-start gap-3 text-slate-400 text-sm">
                <MapPin size={16} className="text-slate-500 mt-0.5" />
                <div>
                  <p className="text-slate-300">{lifeSheet.tempat_tinggal?.tipe}</p>
                  <p className="text-xs">{lifeSheet.tempat_tinggal?.lokasi}</p>
                </div>
              </div>
            </div>

            {/* Reputasi & Kriminal */}
            <div className="space-y-2 p-3 bg-slate-950 rounded-lg border border-slate-800 text-sm">
              <div className="flex items-center gap-2">
                <Activity size={14} className="text-blue-400" />
                <span className="text-slate-400">Reputasi:</span>
                <span className="text-slate-200">{lifeSheet.reputasi_global}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldAlert size={14} className={lifeSheet.status_kriminal === "Bersih" ? "text-emerald-500" : "text-red-500"} />
                <span className="text-slate-400">Status:</span>
                <span className={lifeSheet.status_kriminal === "Bersih" ? "text-slate-200" : "text-red-400"}>{lifeSheet.status_kriminal}</span>
              </div>
            </div>

            {/* Skills */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Brain size={14} /> Skills
              </h3>
              {lifeSheet.skills && Object.keys(lifeSheet.skills).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(lifeSheet.skills).map(([name, data], idx) => (
                    <div key={idx} className="bg-slate-800/50 p-2 rounded text-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-slate-200">{name}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-amber-900/50 text-amber-300 border border-amber-800/50">
                          {data.level}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{data.deskripsi}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-600 italic">Belum ada skill yang terasah.</p>
              )}
            </div>

            {/* Inventory */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Backpack size={14} /> Inventaris
              </h3>
              {lifeSheet.inventaris && lifeSheet.inventaris.length > 0 ? (
                <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                  {lifeSheet.inventaris.map((item, idx) => (
                    <li key={idx} className="marker:text-slate-600">{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-600 italic">Tasmu kosong.</p>
              )}
            </div>

            {/* Hubungan NPC */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Heart size={14} /> Hubungan
              </h3>
              {lifeSheet.hubungan_npc && Object.keys(lifeSheet.hubungan_npc).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(lifeSheet.hubungan_npc).map(([name, stats], idx) => (
                    <div key={idx} className="border-l-2 border-slate-700 pl-3">
                      <div className="font-semibold text-slate-200 text-sm mb-1">{name}</div>
                      <div className="flex gap-2 text-xs text-slate-400 mb-1">
                        <span className={stats.trust >= 0 ? "text-emerald-400/80" : "text-red-400/80"}>Tr: {stats.trust}</span>
                        <span className={stats.respect >= 0 ? "text-emerald-400/80" : "text-red-400/80"}>Rs: {stats.respect}</span>
                        <span className={stats.affection >= 0 ? "text-emerald-400/80" : "text-red-400/80"}>Af: {stats.affection}</span>
                      </div>
                      <p className="text-xs text-slate-500 italic leading-tight">{stats.catatan}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-600 italic">Belum ada yang mengenalmu.</p>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
