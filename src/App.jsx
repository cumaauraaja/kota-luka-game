import React, { useState, useEffect, useRef } from 'react';
import { Send, User, MapPin, Briefcase, Wallet, Heart, Brain, Backpack, AlertTriangle, ShieldAlert, Activity, Eye, EyeOff, Copy, Download, Upload, RotateCcw, CheckCircle, X, Clock } from 'lucide-react';

const apiKey = import.meta.env.VITE_API_KEY;

const SYSTEM_PROMPT = `
Kamu adalah mesin naratif untuk sebuah game roleplay teks imersif berjudul "Kota Luka". Kamu bertindak sebagai Dungeon Master yang menjelma menjadi dunia, semua NPC, dan hukum realitas di dalam game. Patuhi aturan berikut tanpa kecuali:

1. PREMIS & DUNIA
- Setting: Sebuah kota fiksi modern yang luas, suram, dan realistis bernama Kota Luka.
- Kontras Sosial & Quiet Luxury: Terdapat kontras absolut. Saat pemain berada atau melihat Distrik Elit, deskripsikan kemewahan yang sangat minimalis, sunyi, namun mengintimidasi (Quiet Luxury). HINDARI deskripsi emas atau hal norak. Gunakan detail seperti material pakaian berbahan sutra, keheningan absolut di lobi gedung, dan bahasa tubuh karakter elite yang elegan namun merendahkan.
- Pemain: Seorang dewasa muda (18-25 tahun) di distrik miskin.
- Genre: Simulasi kehidupan, sandbox, drama psikologis, neo-noir. Eksplorasi tema dewasa dilakukan secara implisit, atmosferik, dan psikologis.

2. MEKANIK INTI, VISUAL LOCKING & NPC
- KONSISTENSI VISUAL (LOCKING): Kamu WAJIB terus-menerus "mengunci" penampilan karakter berdasarkan item di "inventaris" mereka. Jika pemain hanya memiliki "Pakaian kasual usang", kamu harus selalu menyebutkan bagaimana pakaian itu membuat pemain kedinginan di malam hari, membuat penjaga keamanan curiga, atau direndahkan. Berikan dorongan psikologis kuat agar pemain merasa harus upgrade gaya hidup.
- SKILL ADALAH MUTLAK (SKILL CHECKS): Setiap aksi WAJIB dievaluasi berdasarkan skill di LifeSheet (Pemula s/d Master). Jelaskan eksplisit jika aksi sukses/gagal karena limitasi skill.
- WAKTU & DURASI: Lacak pergerakan waktu ("Hari 1 - Pagi" -> "Siang" -> "Sore" -> "Malam" -> "Hari 2 - Pagi"). Setiap aktivitas memakan waktu (ngobrol 10 mnt, jalan 2 jam). Sesuaikan narasi (terik siang, gelapnya malam).
- AGENDA NPC & PSIKOLOGIS: NPC TIDAK HANYA REAKTIF. Mereka memiliki agenda tersembunyi. Gunakan "Psychological Framing" saat NPC berinteraksi (contoh: Ibu Kos memanipulasi rasa bersalah pemain atau membandingkannya dengan penghuni lain untuk menjatuhkan mental). 
- SISTEM FAKSI TAK KASAT MATA: Jika Trust pemain naik dengan satu NPC/kelompok, otomatis kurangi Respect/Trust dari faksi atau orang yang bermusuhan dengan mereka.

3. FORMAT OUTPUT (SANGAT PENTING & WAJIB)
Setiap balasanmu WAJIB berisi narasi dalam sudut pandang orang pertama ("Kamu").
Di akhir narasi teks (tepat sebelum blok JSON), kamu WAJIB menuliskan pertanyaan "Apa yang kamu lakukan selanjutnya?" ATAU membuat daftar 3 opsi tindakan bernomor (1, 2, 3) agar pemain bisa memilih.

Di bagian paling akhir balasanmu, kamu WAJIB menyertakan JSON LifeSheet yang diperbarui di dalam blok kode \`\`\`json.
JANGAN sertakan tag [LIFESHEET] di luar blok kode.

ATURAN JSON MUTLAK:
- DILARANG menggunakan tanda kutip ganda (\") di dalam value string (gunakan kutip tunggal (') jika butuh).
- DILARANG menggunakan baris baru (enter/newline) mentah di dalam value string. 
- DILARANG menggunakan trailing comma (koma di ujung list/object). 
- JSON ini di-parse oleh mesin, jika salah sintaks game akan ERROR.

Format Wajib JSON di akhir pesan:
\`\`\`json
{
  "nama": "nama pemain",
  "gender": "gender pemain",
  "usia": 20,
  "pekerjaan": "Pengangguran",
  "waktu": "Hari 1 - Pagi",
  "uang": 45000,
  "skills": {
    "Observasi": {"level": "Pemula", "deskripsi": "Baru bisa melihat yang jelas-jelas saja."},
    "Persuasi": {"level": "Pemula", "deskripsi": "Gugup saat berbohong atau meyakinkan orang."}
  },
  "inventaris": ["Ponsel pintar retak"],
  "tempat_tinggal": {"tipe": "Kamar Kos", "lokasi": "Distrik Pinggiran"},
  "hubungan_npc": {
    "Ibu Kos": {"trust": 0, "respect": -10, "affection": -20, "catatan": "Marah karena tunggakan."}
  },
  "reputasi_global": "Bukan Siapa-siapa",
  "status_kriminal": "Bersih",
  "ringkasan_narasi_terakhir": "..."
}
\`\`\`
`;

const INITIAL_STORY = `Udara di kamar berukuran 3x3 meter ini terasa pengap, menempel di kulitmu bersama aroma debu dan sisa mi instan semalam. Sinar matahari pagi yang pucat berjuang menembus jendela berkaca buram, mencetak bayangan terali besi yang memanjang di atas kasur tipismu yang berderit. Di luar, sayup-sayup terdengar deru mesin berpadu dengan klakson tak sabaran—napas parau Kota Luka yang tak pernah peduli pada siapa pun yang tertinggal.

Kamu mengerjap, menatap langit-langit berjamur. Ponselmu yang layarnya retak bergetar singkat di atas lantai semen yang dingin. 

*Bzzzt.*

Sebuah pesan singkat masuk. 
**Pengirim: Ibu Kos**
*"Tunggakan bulan ini jatuh tempo besok pagi. Kalau tidak ada Rp 500.000, silakan angkat kaki dan bawa barang-barangmu."*

Kamu menelan ludah. Kamu tahu persis tidak ada uang sebanyak itu. Dompetmu menipis, dan sisa saldo di rekening mungkin hanya cukup untuk makan nasi bungkus tiga hari ke depan. Pakaian kasual usangmu yang tergeletak di lantai mengingatkan betapa jauhnya kamu dari kehidupan yang layak di kota ini.

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

const fetchWithRetry = async (url, options, maxRetries = 5) => {
  let retries = 0;
  const delays = [1000, 2000, 4000, 8000, 16000];

  while (retries < maxRetries) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      if (retries === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delays[retries]));
      retries++;
    }
  }
};

export default function App() {
  const [messages, setMessages] = useState([
    { role: 'model', content: INITIAL_STORY }
  ]);
  const [lifeSheet, setLifeSheet] = useState(INITIAL_LIFESHEET);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showStatsMobile, setShowStatsMobile] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Modal States
  const [showResetModal, setShowResetModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

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

  // --- SAVE & LOAD SYSTEM (FILE TXT) ---
  const handleExportClick = () => {
    setShowExportModal(true);
  };

  const downloadSaveFile = () => {
    const data = { messages, lifeSheet };
    const encoded = btoa(encodeURIComponent(JSON.stringify(data)));
    const blob = new Blob([encoded], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const date = new Date().toISOString().slice(0,10);
    link.download = `KotaLuka_Save_${date}.txt`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setShowExportModal(false);
    showToast('File simpanan berhasil diunduh!');
  };

  const handleImportClick = () => {
    setSelectedFile(null);
    setShowImportModal(true);
  };

  const processImport = () => {
    if (!selectedFile) {
      showToast('Pilih file simpanan terlebih dahulu.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target.result;
        const decodedString = decodeURIComponent(atob(content.trim()));
        const parsedData = JSON.parse(decodedString);
        
        if (parsedData.messages && parsedData.lifeSheet) {
          setMessages(parsedData.messages);
          setLifeSheet(parsedData.lifeSheet);
          setShowImportModal(false);
          setSelectedFile(null);
          showToast('Progres permainan berhasil dimuat!');
        } else {
          throw new Error("Struktur data tidak valid");
        }
      } catch (e) {
        console.error("Import error:", e);
        showToast('Gagal memuat: File simpanan tidak valid atau rusak.');
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleReset = () => {
    setMessages([{ role: 'model', content: INITIAL_STORY }]);
    setLifeSheet(INITIAL_LIFESHEET);
    setShowResetModal(false);
    showToast('Permainan diulang dari awal.');
  };

  const parseAIResponse = (text) => {
    const jsonRegex = /```json\s*([\s\S]*?)\s*```/i;
    const match = text.match(jsonRegex);
    
    let narrative = text;
    let newLifeSheet = null;

    if (match) {
      try {
        // SANITIZER KETAT: Memperbaiki kesalahan format umum yang dibuat LLM AI
        let jsonString = match[1];
        
        // 1. Hapus trailing comma pada objek atau array (cth: "kriminal": "Bersih", } -> "kriminal": "Bersih" })
        jsonString = jsonString.replace(/,\s*(?=[\]}])/g, '');
        
        // 2. Ganti semua karakter newline/enter mentah di dalam JSON menjadi spasi (mencegah unescaped string error)
        jsonString = jsonString.replace(/\n/g, ' ').replace(/\r/g, '');

        newLifeSheet = JSON.parse(jsonString);
        narrative = text.replace(jsonRegex, '').replace(/\[LIFESHEET\]/gi, '').trim();
      } catch (e) {
        console.error("Gagal membaca struktur LifeSheet dari AI (JSON rusak):", e);
        console.log("RAW JSON STR:", match[1]);
        // Tampilkan pesan kegagalan halus ke user jika parse gagal, tanpa membuat game crash
        showToast("Kesalahan sinkronisasi LifeSheet. Menggunakan data lama.");
      }
    }

    return { narrative, newLifeSheet };
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue.trim();
    setInputValue('');
    
    const newMessages = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const recentMessages = newMessages.slice(-5);
      
      const apiContents = recentMessages.map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      const dynamicSystemPrompt = `${SYSTEM_PROMPT}\n\n[STATUS LIFESHEET SAAT INI (ACUAN FAKTA)]\nIni adalah status pemain saat ini. Gunakan data ini sebagai acuan mutlak untuk kondisinya:\n${JSON.stringify(lifeSheet, null, 2)}`;

      const payload = {
        systemInstruction: { parts: [{ text: dynamicSystemPrompt }] },
        contents: apiContents,
      };

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
      
      const data = await fetchWithRetry(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (responseText) {
        const { narrative, newLifeSheet } = parseAIResponse(responseText);
        setMessages(prev => [...prev, { role: 'model', content: narrative }]);
        if (newLifeSheet) setLifeSheet(newLifeSheet);
      } else {
        throw new Error("Respons kosong dari server.");
      }

    } catch (error) {
      console.error("API Error:", error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: "*[Sistem Error: Koneksi ke Kota Luka terputus. Silakan coba tindakanmu lagi.]*",
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  // Dinamika Waktu UI (Efek Ambient)
  const getTimeAmbientClass = () => {
    const w = (lifeSheet.waktu || "").toLowerCase();
    if (w.includes("siang")) return "bg-amber-900/10"; // Panas/Pucat
    if (w.includes("sore")) return "bg-orange-950/20"; // Senja
    if (w.includes("malam")) return "bg-red-950/20"; // Gelap/Bahaya
    return "bg-transparent"; // Pagi/Default
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-300 font-sans overflow-hidden relative transition-colors duration-1000">
      
      {/* Time Ambient Overlay Effect */}
      <div className={`absolute inset-0 pointer-events-none transition-colors duration-1000 z-0 ${getTimeAmbientClass()}`} />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 bg-slate-800 border border-amber-500/50 text-amber-400 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm transition-all animate-bounce">
          <CheckCircle size={16} />
          {toastMessage}
        </div>
      )}

      {/* Modal Ekspor (Save) */}
      {showExportModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg shadow-xl max-w-sm w-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-emerald-500 flex items-center gap-2"><Download size={20}/> Ekspor Simpanan</h3>
              <button onClick={() => setShowExportModal(false)} className="text-slate-500 hover:text-white"><X size={20}/></button>
            </div>
            <p className="text-slate-400 mb-6 text-sm">
              Unduh progres permainanmu sebagai file <strong>.txt</strong>. Simpan file ini di memori HP Anda untuk memuatnya kembali nanti.
            </p>
            <div className="flex justify-end gap-3 mt-auto">
              <button onClick={downloadSaveFile} className="flex-1 py-3 flex items-center justify-center gap-2 font-semibold bg-emerald-700 hover:bg-emerald-600 text-white rounded-md transition">
                <Download size={18} /> Unduh File (.txt)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Impor (Load) */}
      {showImportModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg shadow-xl max-w-sm w-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-amber-500 flex items-center gap-2"><Upload size={20}/> Impor Simpanan</h3>
              <button onClick={() => setShowImportModal(false)} className="text-slate-500 hover:text-white"><X size={20}/></button>
            </div>
            <p className="text-slate-400 mb-4 text-sm">
              Pilih file <strong>.txt</strong> simpanan Kota Luka dari File Manager Anda untuk melanjutkan permainan.
            </p>
            <input 
              type="file" 
              accept=".txt"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-800 file:text-amber-500 hover:file:bg-slate-700 mb-6 cursor-pointer border border-slate-700 rounded-md p-1 bg-slate-950 focus:outline-none focus:border-amber-500"
            />
            <div className="flex justify-end gap-3 mt-auto">
              <button onClick={() => setShowImportModal(false)} className="px-4 py-3 font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition">Batal</button>
              <button onClick={processImport} disabled={!selectedFile} className="flex-1 py-3 flex items-center justify-center gap-2 font-semibold bg-amber-700 hover:bg-amber-600 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-md transition">
                <Upload size={18} /> Muat Game
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reset */}
      {showResetModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-red-500 mb-2 flex items-center gap-2"><AlertTriangle size={20}/> Peringatan</h3>
            <p className="text-slate-300 mb-6 text-sm">Apakah kamu yakin ingin mengulang dari awal? Progres saat ini yang belum di-ekspor akan hilang selamanya ditelan Kota Luka.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowResetModal(false)} className="px-4 py-2 text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition">Batal</button>
              <button onClick={handleReset} className="px-4 py-2 text-sm font-semibold bg-red-900 hover:bg-red-800 text-white rounded-md transition">Ya, Ulangi</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={`bg-slate-900/90 backdrop-blur-sm border-b border-slate-800 p-4 flex justify-between items-center z-10 shrink-0 shadow-md transition-colors duration-1000 ${lifeSheet.waktu?.toLowerCase().includes('malam') ? 'border-b-red-900/30' : ''}`}>
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-wider text-amber-500 uppercase font-serif">Kota Luka</h1>
          <p className="text-xs text-slate-500 tracking-widest hidden md:block">v1.2.0 // IMMERSIVE ENGINE</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Controls Desktop */}
          <div className="hidden md:flex gap-2 mr-2 border-r border-slate-700 pr-4">
            <button onClick={handleExportClick} className="flex items-center gap-2 p-2 text-xs font-semibold rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-emerald-400 transition border border-transparent hover:border-slate-600" title="Ekspor Simpanan">
              <Download size={14} /> Ekspor
            </button>
            <button onClick={handleImportClick} className="flex items-center gap-2 p-2 text-xs font-semibold rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-amber-400 transition border border-transparent hover:border-slate-600" title="Impor Simpanan">
              <Upload size={14} /> Impor
            </button>
            <button onClick={() => setShowResetModal(true)} className="flex items-center gap-2 p-2 text-xs font-semibold rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-red-400 transition border border-transparent hover:border-slate-600" title="Ulang Permainan">
              <RotateCcw size={14} /> Ulang
            </button>
          </div>

          {/* Controls Mobile Icons Only */}
          <div className="flex md:hidden gap-1 mr-2 border-r border-slate-700 pr-2">
            <button onClick={handleExportClick} className="p-2 rounded-md bg-slate-800 text-slate-300 hover:text-emerald-400 transition"><Download size={18} /></button>
            <button onClick={handleImportClick} className="p-2 rounded-md bg-slate-800 text-slate-300 hover:text-amber-400 transition"><Upload size={18} /></button>
            <button onClick={() => setShowResetModal(true)} className="p-2 rounded-md bg-slate-800 text-slate-300 hover:text-red-400 transition"><RotateCcw size={18} /></button>
          </div>

          <button 
            onClick={() => setShowStatsMobile(!showStatsMobile)}
            className="lg:hidden p-2 rounded-md bg-amber-900/50 border border-amber-700/50 text-amber-500 hover:bg-amber-800/50 transition flex items-center gap-2"
          >
            {showStatsMobile ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative z-10">
        
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
                        : 'bg-slate-900/90 backdrop-blur-sm text-slate-300 border border-slate-800 rounded-bl-none font-serif'
                    }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-900/90 backdrop-blur-sm border border-slate-800 rounded-lg rounded-bl-none p-4 flex gap-2 items-center text-slate-500">
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
          <div className="p-4 bg-slate-900/90 backdrop-blur-sm border-t border-slate-800 shrink-0">
            <form onSubmit={handleSendMessage} className="flex gap-2 max-w-4xl mx-auto">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Apa yang kamu lakukan?"
                className="flex-1 bg-slate-950/80 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-slate-200 transition"
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
        <div className={`w-full lg:w-80 xl:w-96 bg-slate-900/80 backdrop-blur-md border-l border-slate-800 flex flex-col shrink-0 overflow-y-auto 
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
                  <p className="text-slate-300">{lifeSheet.tempat_tinggal.tipe}</p>
                  <p className="text-xs">{lifeSheet.tempat_tinggal.lokasi}</p>
                </div>
              </div>
            </div>

            {/* Reputasi & Kriminal */}
            <div className="space-y-2 p-3 bg-slate-950/50 rounded-lg border border-slate-800 text-sm">
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
              {Object.keys(lifeSheet.skills).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(lifeSheet.skills).map(([name, data], idx) => (
                    <div key={idx} className="bg-slate-800/40 p-2 rounded text-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-slate-200">{name}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-amber-900/30 text-amber-300 border border-amber-800/50">
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
              {lifeSheet.inventaris.length > 0 ? (
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
              {Object.keys(lifeSheet.hubungan_npc).length > 0 ? (
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
