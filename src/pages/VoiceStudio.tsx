import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  Play,
  Pause,
  Download,
  RefreshCw,
  Sliders,
  Layers,
  Sparkles,
  AlertCircle,
  FileText,
  CheckCircle2,
  RotateCcw,
  Headphones,
  Check,
  Radio,
  Info,
  Clock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TTSChunkItem, TTSVoiceOption } from '../types';
import { ApiService } from '../services/api';

const GEMINI_VOICES: TTSVoiceOption[] = [
  { id: 'Kore', name: 'Kore', gender: 'Female', description: 'Jernih, hangat, artikulasi rapi untuk narasi panjang', tone: 'Professional & Warm' },
  { id: 'Puck', name: 'Puck', gender: 'Male', description: 'Energik, dinamis, cocok untuk review gadget & Shorts', tone: 'Energetic & Youthful' },
  { id: 'Fenrir', name: 'Fenrir', gender: 'Male', description: 'Berat, tenang, berwibawa untuk analisis teknologi', tone: 'Deep & Authoritative' },
  { id: 'Zephyr', name: 'Zephyr', gender: 'Female', description: 'Cepat, lugas, santai untuk tutorial & perbandingan', tone: 'Friendly & Casual' },
  { id: 'Charon', name: 'Charon', gender: 'Male', description: 'Formal, stabil untuk berita dan dokumenter tech', tone: 'Documentary & Formal' },
];

const STYLE_PRESETS = [
  'Clear, engaging Indonesian tech video narrator',
  'Casual and friendly tech reviewer explaining smartphone features',
  'Energetic, fast-paced YouTube Shorts voice-over',
  'Calm, focused tutorial instructor guide',
  'Authoritative, investigative tech journalism breakdown',
];

export const VoiceStudio: React.FC = () => {
  const {
    apiStatus,
    showToast,
    pendingVoiceText,
    setPendingVoiceText,
    setActiveTab,
  } = useApp();

  // Mode: 'simple' | 'pro'
  const [mode, setMode] = useState<'simple' | 'pro'>('simple');

  // Simple Mode State
  const [simpleText, setSimpleText] = useState(
    'Halo semuanya, selamat datang kembali di Revisitekno! Di video kali ini kita bakal bahas tuntas laptop terbaru yang katanya punya baterai tahan 16 jam.'
  );
  const [selectedVoice, setSelectedVoice] = useState('Kore');
  const [selectedStyle, setSelectedStyle] = useState(STYLE_PRESETS[0]);
  const [generatingSimple, setGeneratingSimple] = useState(false);
  const [simpleAudioUrl, setSimpleAudioUrl] = useState<string | null>(null);
  const [simpleAudioBase64, setSimpleAudioBase64] = useState<string | null>(null);
  const [isPlayingSimple, setIsPlayingSimple] = useState(false);

  // Fallback: Browser Web Speech API
  const [useBrowserSpeech, setUseBrowserSpeech] = useState(false);
  const [isSpeakingBrowser, setIsSpeakingBrowser] = useState(false);

  // Pro Mode State
  const [proRawText, setProRawText] = useState(
    `[Bagian 1: Pembuka]\nHalo semuanya, selamat datang di Revisitekno. Hari ini kita uji laptop Windows on ARM secara ekstrem.\n\n[Bagian 2: Pengujian]\nKita mulai dari daya tahan baterai. Selama 8 jam dipakai browsing dan edit dokumen, baterai cuma turun 30 persen.\n\n[Bagian 3: Kesimpulan]\nKesimpulannya, kalau kalian butuh laptop tahan seharian tanpa bawa charger berat, ini pilihan yang sangat menarik.`
  );
  const [chunks, setChunks] = useState<TTSChunkItem[]>([]);
  const [generatingPro, setGeneratingPro] = useState(false);
  const [combiningPro, setCombiningPro] = useState(false);
  const [combinedAudioUrl, setCombinedAudioUrl] = useState<string | null>(null);
  const [combinedAudioBase64, setCombinedAudioBase64] = useState<string | null>(null);

  // Currently playing chunk preview
  const [playingChunkId, setPlayingChunkId] = useState<string | null>(null);

  // Quota & Reset FAQ info toggle
  const [showQuotaInfo, setShowQuotaInfo] = useState(false);

  const simpleAudioRef = useRef<HTMLAudioElement | null>(null);
  const chunkAudioRef = useRef<HTMLAudioElement | null>(null);

  // Handle incoming text from Script Studio
  useEffect(() => {
    if (pendingVoiceText) {
      setSimpleText(pendingVoiceText);
      setProRawText(pendingVoiceText);
      setPendingVoiceText(null);
      showToast('Teks naskah berhasil dimuat ke Voice Studio!', 'info');
    }
  }, [pendingVoiceText, setPendingVoiceText]);

  // Clean audio urls on unmount
  useEffect(() => {
    return () => {
      if (simpleAudioUrl) URL.revokeObjectURL(simpleAudioUrl);
      if (combinedAudioUrl) URL.revokeObjectURL(combinedAudioUrl);
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Simple Mode: Generate audio via server
  const handleGenerateSimple = async () => {
    if (!simpleText.trim()) {
      showToast('Teks narasi tidak boleh kosong.', 'error');
      return;
    }

    if (!apiStatus?.hasApiKey) {
      showToast(
        'GEMINI_API_KEY belum dikonfigurasi. Anda dapat mencoba opsi Browser TTS Fallback di bawah.',
        'error'
      );
      return;
    }

    setGeneratingSimple(true);
    try {
      const data = await ApiService.synthesizeSpeech({
        text: simpleText.trim(),
        voiceName: selectedVoice,
        style: selectedStyle,
      });

      setSimpleAudioBase64(data.audioBase64);

      // Convert base64 WAV into Object URL
      const byteCharacters = atob(data.audioBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'audio/wav' });

      if (simpleAudioUrl) URL.revokeObjectURL(simpleAudioUrl);
      const newUrl = URL.createObjectURL(blob);
      setSimpleAudioUrl(newUrl);

      showToast(`Audio narasi (${data.voiceName}) berhasil dibuat!`, 'success');
    } catch (err: any) {
      setShowQuotaInfo(true);
      showToast(err.message || 'Gagal menghasilkan audio dari teks.', 'error');
    } finally {
      setGeneratingSimple(false);
    }
  };

  const handleDownloadSimple = () => {
    if (!simpleAudioUrl) return;
    const a = document.createElement('a');
    a.href = simpleAudioUrl;
    a.download = `Revisitekno_VO_${selectedVoice}_${Date.now()}.wav`;
    a.click();
    showToast('Berkas WAV berhasil diunduh.', 'success');
  };

  // Browser Web Speech API fallback player
  const handleBrowserSpeechToggle = () => {
    if (!('speechSynthesis' in window)) {
      showToast('Browser Anda tidak mendukung Web Speech API.', 'error');
      return;
    }

    if (isSpeakingBrowser) {
      window.speechSynthesis.cancel();
      setIsSpeakingBrowser(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(simpleText);
    utterance.lang = 'id-ID';
    utterance.rate = 1.0;

    utterance.onend = () => setIsSpeakingBrowser(false);
    utterance.onerror = () => setIsSpeakingBrowser(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeakingBrowser(true);
  };

  // Pro Mode: Chunking helper
  const handleSplitIntoChunks = () => {
    const rawParagraphs = proRawText
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const generatedChunks: TTSChunkItem[] = rawParagraphs.map((text, idx) => ({
      id: `chunk-${Date.now()}-${idx}`,
      order: idx + 1,
      text,
      status: 'idle',
      durationEstimateSec: Math.max(2, Math.round(text.split(/\s+/).length / 2.2)),
    }));

    setChunks(generatedChunks);
    setCombinedAudioUrl(null);
    setCombinedAudioBase64(null);
    showToast(`Naskah dipecah menjadi ${generatedChunks.length} segmen narasi teratur.`, 'info');
  };

  // Generate single chunk in Pro Mode
  const handleGenerateSingleChunk = async (chunkId: string) => {
    const targetChunk = chunks.find((c) => c.id === chunkId);
    if (!targetChunk) return;

    if (!apiStatus?.hasApiKey) {
      showToast('GEMINI_API_KEY belum dikonfigurasi.', 'error');
      return;
    }

    // Set chunk state to generating
    setChunks((prev) =>
      prev.map((c) => (c.id === chunkId ? { ...c, status: 'generating', error: undefined } : c))
    );

    try {
      const data = await ApiService.synthesizeSpeech({
        text: targetChunk.text,
        voiceName: selectedVoice,
        style: selectedStyle,
      });

      const byteCharacters = atob(data.audioBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);

      setChunks((prev) =>
        prev.map((c) =>
          c.id === chunkId
            ? { ...c, status: 'ready', audioBase64: data.audioBase64, audioUrl: url }
            : c
        )
      );
      showToast(`Segmen #${targetChunk.order} siap didengarkan.`, 'success');
    } catch (err: any) {
      setChunks((prev) =>
        prev.map((c) =>
          c.id === chunkId ? { ...c, status: 'error', error: err.message || 'Gagal sintesis' } : c
        )
      );
      setShowQuotaInfo(true);
      showToast(`Segmen #${targetChunk.order} gagal disintesis.`, 'error');
    }
  };

  // Generate all pending chunks in Pro Mode sequentially
  const handleGenerateAllChunks = async () => {
    if (chunks.length === 0) {
      handleSplitIntoChunks();
      return;
    }

    if (!apiStatus?.hasApiKey) {
      showToast('GEMINI_API_KEY belum dikonfigurasi.', 'error');
      return;
    }

    setGeneratingPro(true);
    let successCount = 0;

    for (const chunk of chunks) {
      if (chunk.status === 'ready' && chunk.audioBase64) {
        successCount++;
        continue;
      }

      setChunks((prev) =>
        prev.map((c) => (c.id === chunk.id ? { ...c, status: 'generating' } : c))
      );

      try {
        const data = await ApiService.synthesizeSpeech({
          text: chunk.text,
          voiceName: selectedVoice,
          style: selectedStyle,
        });

        const byteCharacters = atob(data.audioBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);

        setChunks((prev) =>
          prev.map((c) =>
            c.id === chunk.id
              ? { ...c, status: 'ready', audioBase64: data.audioBase64, audioUrl: url }
              : c
          )
        );
        successCount++;
      } catch (err: any) {
        setChunks((prev) =>
          prev.map((c) =>
            c.id === chunk.id ? { ...c, status: 'error', error: err.message || 'Gagal' } : c
          )
        );
      }
    }

    setGeneratingPro(false);
    showToast(`Selesai memproses: ${successCount} dari ${chunks.length} segmen siap.`, 'info');
  };

  // Combine ready chunks into master WAV file
  const handleCombineAllChunks = async () => {
    const readyChunks = chunks.filter((c) => c.status === 'ready' && c.audioBase64);
    if (readyChunks.length === 0) {
      showToast('Belum ada segmen audio yang berhasil disintesis.', 'error');
      return;
    }

    setCombiningPro(true);
    try {
      const base64List = readyChunks.map((c) => c.audioBase64!);
      const result = await ApiService.combineSpeechChunks(base64List);

      setCombinedAudioBase64(result.combinedAudioBase64);

      const byteCharacters = atob(result.combinedAudioBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'audio/wav' });

      if (combinedAudioUrl) URL.revokeObjectURL(combinedAudioUrl);
      const newUrl = URL.createObjectURL(blob);
      setCombinedAudioUrl(newUrl);

      showToast(
        `Sukses menggabungkan ${result.chunkCount} segmen menjadi 1 file WAV master!`,
        'success'
      );
    } catch (err: any) {
      showToast(err.message || 'Gagal menggabungkan segmen audio.', 'error');
    } finally {
      setCombiningPro(false);
    }
  };

  const handlePlayPreviewChunk = (chunk: TTSChunkItem) => {
    if (!chunk.audioUrl) return;

    if (playingChunkId === chunk.id) {
      chunkAudioRef.current?.pause();
      setPlayingChunkId(null);
      return;
    }

    if (chunkAudioRef.current) {
      chunkAudioRef.current.pause();
    }

    const audio = new Audio(chunk.audioUrl);
    chunkAudioRef.current = audio;
    audio.onended = () => setPlayingChunkId(null);
    audio.play();
    setPlayingChunkId(chunk.id);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-slate-100">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Volume2 className="h-4 w-4" />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
              Revisitekno Voice Studio (TTS)
            </h2>
          </div>
          <p className="mt-1 text-xs md:text-sm text-slate-400">
            Sintesis suara pengisi suara Bahasa Indonesia berbasis Gemini 3.8 Flash Lite TTS untuk video YouTube Anda.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-1 border border-slate-700 bg-[#0f1726] p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setMode('simple')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              mode === 'simple'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Volume2 className="h-3.5 w-3.5" />
            <span>Mode Standar</span>
          </button>
          <button
            onClick={() => setMode('pro')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              mode === 'pro'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Pro Mode (Chunking)</span>
          </button>
        </div>
      </div>

      {/* Voice & Preset Controls Bar */}
      <div className="rounded-2xl border border-slate-800 bg-[#0e1624] p-4 md:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="h-3.5 w-3.5" />
            <span>Pengaturan Model Suara Narator</span>
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            Model: gemini-3.8-flash-lite-tts
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Voice Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Pilihan Karakter Suara</label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-[#121c2d] px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              {GEMINI_VOICES.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.gender}) - {v.tone}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500">
              {GEMINI_VOICES.find((v) => v.id === selectedVoice)?.description}
            </p>
          </div>

          {/* Style Preset */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Gaya Artikulasi Narasi</label>
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-[#121c2d] px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              {STYLE_PRESETS.map((st, i) => (
                <option key={i} value={st}>
                  {st}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500">Memberikan panduan intonasi ke model TTS.</p>
          </div>

          {/* Quick Info & Action */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Format Output Audio</label>
            <div className="rounded-xl border border-slate-800 bg-[#121c2d] p-2.5 text-xs text-slate-300 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">WAV (24kHz Mono 16-bit)</div>
                <div className="text-[10px] text-slate-400">Siap diimpor ke Premiere/CapCut</div>
              </div>
              <span className="rounded bg-purple-500/20 text-purple-300 px-2 py-0.5 text-[10px] font-mono border border-purple-500/40">
                RIFF WAV
              </span>
            </div>
          </div>
        </div>

        {/* Quota & Reset Schedule Info Toggle */}
        <div className="pt-2 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => setShowQuotaInfo(!showQuotaInfo)}
            className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1.5 transition-colors"
          >
            <Info className="h-3.5 w-3.5" />
            <span>{showQuotaInfo ? 'Sembunyikan Info Kuota & Jadwal Reset' : 'Batas limit pembuatan suara direset kapan? Klik untuk info'}</span>
          </button>

          {showQuotaInfo && (
            <div className="mt-2.5 rounded-xl border border-purple-500/20 bg-purple-950/20 p-3.5 text-xs text-purple-200/90 space-y-2 animate-in fade-in">
              <div className="font-semibold text-purple-300 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-purple-400" />
                <span>Jadwal Reset Batas Pembuatan Suara (Gemini TTS):</span>
              </div>
              <ul className="list-disc list-inside space-y-1.5 text-[11px] text-slate-300 pl-1">
                <li>
                  <strong className="text-white">Reset Tiap 1 Menit (Rate Limit / RPM):</strong> Kebanyakan error batas kuota (Error 429) terjadi jika tombol ditekan terlalu cepat berturut-turut. Batas laju ini otomatis pulih dalam <strong>20–60 detik</strong>.
                </li>
                <li>
                  <strong className="text-white">Reset Harian (Daily Quota):</strong> Kuota pembuatan gratis direset <strong>setiap 24 jam</strong>, tepatnya pukul <strong>07:00 pagi WIB</strong> (00:00 UTC) setiap hari. Anda <em>tidak perlu menunggu berhari-hari</em>.
                </li>
                <li>
                  <strong className="text-white">Opsi Bebas Kuota:</strong> Jika kuota server habis, Anda selalu bisa menggunakan tombol <em>"Dengarkan via Suara Browser"</em> di bawah untuk mendengarkan pratinjau naskah secara gratis tanpa batas kuota.
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* MODE 1: SIMPLE MODE */}
      {mode === 'simple' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Input Textarea */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-300">
                Teks Narasi yang Akan Disintesis
              </label>
              <span className="text-slate-400 font-mono text-[11px]">
                {simpleText.length} karakter • ~{simpleText.trim().split(/\s+/).filter(Boolean).length} kata
              </span>
            </div>

            <textarea
              rows={12}
              value={simpleText}
              onChange={(e) => setSimpleText(e.target.value)}
              placeholder="Ketik atau tempel teks narasi video di sini..."
              className="w-full rounded-2xl border border-slate-800 bg-[#0c121e] p-4 text-xs md:text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500 font-mono leading-relaxed scrollbar-thin scrollbar-thumb-slate-800"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={() => setActiveTab('scripts')}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Ambil Teks dari Script Studio</span>
              </button>

              <button
                type="button"
                onClick={handleGenerateSimple}
                disabled={generatingSimple || !simpleText.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-purple-500/20 hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all"
              >
                {generatingSimple ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-purple-200" />
                    <span>Mensintesis Suara ({selectedVoice})...</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="h-4 w-4" />
                    <span>Hasilkan Audio Narasi (WAV)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right: Audio Player & Download Panel */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-[#0e1624] p-5 space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <Headphones className="h-4 w-4 text-purple-400" />
                <span>Pemutar Audio Narasi</span>
              </h3>

              {simpleAudioUrl ? (
                <div className="space-y-4">
                  <div className="rounded-xl border border-purple-500/30 bg-[#131a29] p-4 text-center space-y-3">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-purple-600/20 text-purple-300 border border-purple-500/40">
                      <Volume2 className="h-6 w-6 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Audio Narasi Siap</h4>
                      <p className="text-[11px] text-slate-400">
                        Karakter: {selectedVoice} • Format: audio/wav
                      </p>
                    </div>

                    <audio
                      ref={simpleAudioRef}
                      src={simpleAudioUrl}
                      controls
                      className="w-full mt-2 filter invert hue-rotate-180"
                    />
                  </div>

                  <button
                    onClick={handleDownloadSimple}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 py-2.5 text-xs font-semibold text-white shadow-md shadow-purple-500/20 transition-all active:scale-95"
                  >
                    <Download className="h-4 w-4" />
                    <span>Unduh Audio Narasi (.WAV)</span>
                  </button>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-800 bg-[#0c121e] p-8 text-center text-xs text-slate-500">
                  <Volume2 className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                  <span>Belum ada audio yang dibuat. Klik tombol "Hasilkan Audio Narasi" untuk memulai.</span>
                </div>
              )}

              {/* Browser Web Speech Fallback */}
              <div className="rounded-xl border border-slate-800/80 bg-[#0c121e] p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Radio className="h-3.5 w-3.5 text-amber-400" />
                    <span>Alternatif: Web Speech Browser</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Opsi fallback menggunakan mesin suara bawaan browser lokal. Berguna untuk mendengarkan alur naskah secara instan tanpa menggunakan kuota server API.
                </p>
                <button
                  type="button"
                  onClick={handleBrowserSpeechToggle}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 py-2 text-xs text-slate-200 hover:bg-slate-700 hover:text-white"
                >
                  {isSpeakingBrowser ? (
                    <>
                      <Pause className="h-3.5 w-3.5 text-amber-400" />
                      <span>Hentikan Suara Browser</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Dengarkan via Suara Browser (Preview)</span>
                    </>
                  )}
                </button>
                <p className="text-[10px] text-slate-500 italic">
                  *Catatan: Suara browser hanya untuk pratinjau langsung di tab ini dan tidak dapat diunduh sebagai file master WAV.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: PRO MODE (CHUNKING & MERGING) */}
      {mode === 'pro' && (
        <div className="space-y-6">
          {/* Top description */}
          <div className="rounded-xl border border-purple-500/20 bg-purple-950/10 p-4 text-xs text-purple-200 flex items-start gap-3">
            <Info className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-purple-300">
                Pro Mode: Segmentasi & Penggabungan Naskah Panjang
              </span>
              <p className="mt-0.5 text-purple-200/80">
                Untuk naskah video berdurasi lebih dari 5 menit, Pro Mode membagi naskah per paragraf atau penanda scene. Anda dapat menghasilkan audio per segmen, mengulang segmen tertentu yang perlu diubah intonasinya, dan menggabungkan seluruh segmen menjadi 1 berkas WAV utuh tanpa jeda.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Raw text and splitter */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-300">Naskah Lengkap untuk Dipecah</label>
                <span className="text-[11px] text-slate-400">Pisahkan dengan baris kosong (paragraf)</span>
              </div>

              <textarea
                rows={10}
                value={proRawText}
                onChange={(e) => setProRawText(e.target.value)}
                placeholder="Tempel naskah panjang di sini. Tiap paragraf otomatis menjadi 1 segmen..."
                className="w-full rounded-2xl border border-slate-800 bg-[#0c121e] p-4 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500 font-mono leading-relaxed"
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSplitIntoChunks}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
                >
                  Pecah Naskah Menjadi Segmen
                </button>

                <button
                  type="button"
                  onClick={handleGenerateAllChunks}
                  disabled={generatingPro || chunks.length === 0}
                  className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2 text-xs font-semibold text-white hover:bg-purple-500 disabled:opacity-40"
                >
                  {generatingPro ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Memproses Semua Segmen...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Sintesis Seluruh Segmen</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right: Master Combine Box */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-800 bg-[#0e1624] p-5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center justify-between border-b border-slate-800 pb-3">
                  <span>Hasil Master Audio Gabungan</span>
                  <span className="text-xs font-mono text-purple-400">
                    {chunks.filter((c) => c.status === 'ready').length}/{chunks.length} Segmen Siap
                  </span>
                </h3>

                <button
                  onClick={handleCombineAllChunks}
                  disabled={combiningPro || chunks.filter((c) => c.status === 'ready').length === 0}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-2.5 text-xs font-semibold text-white shadow-lg disabled:opacity-40 hover:brightness-110 active:scale-95 transition-all"
                >
                  {combiningPro ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Menggabungkan RIFF WAV Header di Server...</span>
                    </>
                  ) : (
                    <>
                      <Layers className="h-4 w-4" />
                      <span>Gabungkan Seluruh Segmen Menjadi 1 File WAV</span>
                    </>
                  )}
                </button>

                {combinedAudioUrl && (
                  <div className="rounded-xl border border-emerald-500/30 bg-[#0b1a16] p-4 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>File Master WAV Utuh Berhasil Dibuat</span>
                    </div>

                    <audio src={combinedAudioUrl} controls className="w-full filter invert" />

                    <a
                      href={combinedAudioUrl}
                      download={`Revisitekno_Master_Combined_${Date.now()}.wav`}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      <span>Unduh File Master Lengkap (.WAV)</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Segments Queue List */}
          {chunks.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Daftar Segmen Narasi Terurut ({chunks.length})</span>
              </h3>

              <div className="space-y-2.5">
                {chunks.map((chk) => (
                  <div
                    key={chk.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-800 bg-[#0d1420] p-3 text-xs hover:border-slate-700"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className="rounded bg-slate-800 px-2 py-1 text-[10px] font-mono text-slate-300 shrink-0">
                        #{chk.order}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-200 line-clamp-2 leading-relaxed">{chk.text}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                          <span>~{chk.durationEstimateSec} detik</span>
                          <span>• Status: {chk.status.toUpperCase()}</span>
                          {chk.error && <span className="text-red-400">({chk.error})</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      {chk.status === 'ready' && chk.audioUrl && (
                        <>
                          <button
                            onClick={() => handlePlayPreviewChunk(chk)}
                            className="rounded-lg bg-slate-800 px-2.5 py-1.5 text-[11px] font-semibold text-slate-200 hover:bg-slate-700 flex items-center gap-1"
                          >
                            {playingChunkId === chk.id ? (
                              <Pause className="h-3 w-3 text-cyan-400" />
                            ) : (
                              <Play className="h-3 w-3 text-emerald-400" />
                            )}
                            <span>{playingChunkId === chk.id ? 'Pause' : 'Play'}</span>
                          </button>

                          <a
                            href={chk.audioUrl}
                            download={`Segmen_${chk.order}_${selectedVoice}.wav`}
                            className="rounded-lg border border-slate-700 p-1.5 text-slate-400 hover:text-white"
                            title="Unduh segmen ini saja"
                          >
                            <Download className="h-3 w-3" />
                          </a>
                        </>
                      )}

                      <button
                        onClick={() => handleGenerateSingleChunk(chk.id)}
                        disabled={chk.status === 'generating'}
                        className="rounded-lg border border-purple-500/40 bg-purple-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-purple-300 hover:bg-purple-500/20 disabled:opacity-40"
                      >
                        {chk.status === 'generating' ? (
                          <RefreshCw className="h-3 w-3 animate-spin inline mr-1" />
                        ) : chk.status === 'ready' ? (
                          'Sintesis Ulang'
                        ) : (
                          'Sintesis'
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
