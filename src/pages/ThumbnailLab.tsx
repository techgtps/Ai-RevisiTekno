import React, { useState, useEffect, useRef } from 'react';
import {
  Image as ImageIcon,
  Sparkles,
  Eye,
  Copy,
  Download,
  Trash2,
  Kanban,
  FileText,
  AlertTriangle,
  RefreshCw,
  Plus,
  Bookmark,
  Check,
  Smartphone,
  Layers,
  Wand2,
  Info,
  Sliders,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ThumbnailConcept } from '../types';
import { ApiService } from '../services/api';

const STYLES = [
  'Dark Tech Kontras Tinggi (Signature Revisitekno)',
  'Split Screen Komparasi VS (Duel Gadget)',
  'Ekspresi Wajah Close-up + Gadget Floating',
  'Minimalist Clean Studio (Apple Aesthetic)',
  'Dramatis Cyberpunk / Neon Blue Rim-light',
];

const ACCENT_COLORS = [
  { name: 'Cyan Neon', hex: '#00f0ff', border: 'border-cyan-400', bg: 'bg-cyan-500' },
  { name: 'Electric Blue', hex: '#3b82f6', border: 'border-blue-400', bg: 'bg-blue-500' },
  { name: 'Emerald Tech', hex: '#10b981', border: 'border-emerald-400', bg: 'bg-emerald-500' },
  { name: 'Amber Warning', hex: '#f59e0b', border: 'border-amber-400', bg: 'bg-amber-500' },
  { name: 'Crimson Alert', hex: '#ef4444', border: 'border-red-400', bg: 'bg-red-500' },
];

export const ThumbnailLab: React.FC = () => {
  const {
    thumbnails,
    plans,
    scripts,
    addOrUpdateThumbnail,
    removeThumbnail,
    channelProfile,
    apiStatus,
    showToast,
    pendingThumbnailInput,
    setPendingThumbnailInput,
  } = useApp();

  // Generator inputs
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState(channelProfile.targetAudience);
  const [style, setStyle] = useState(STYLES[0]);
  const [notes, setNotes] = useState('');
  const [generating, setGenerating] = useState(false);

  // Concept candidates
  const [concepts, setConcepts] = useState<ThumbnailConcept[]>([]);
  const [selectedConcept, setSelectedConcept] = useState<ThumbnailConcept | null>(null);

  // Interactive Live Graphic Customizer
  const [customHeadline, setCustomHeadline] = useState('');
  const [selectedAccentColor, setSelectedAccentColor] = useState(ACCENT_COLORS[0]);
  const [customBadge, setCustomBadge] = useState('REVISITEKNO AI');
  const [showSafeZone, setShowSafeZone] = useState(true);

  // AI Image generation state
  const [generatingImage, setGeneratingImage] = useState(false);
  const [showFaq, setShowFaq] = useState(false);

  // Canvas ref for exporting 1280x720 PNG
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Handle incoming transfer from Video Planner
  useEffect(() => {
    if (pendingThumbnailInput) {
      if (pendingThumbnailInput.existing) {
        setSelectedConcept(pendingThumbnailInput.existing);
        setCustomHeadline(pendingThumbnailInput.existing.textOverlay || '');
      } else {
        setTitle(pendingThumbnailInput.title || '');
        setTopic(pendingThumbnailInput.topic || pendingThumbnailInput.title || '');
      }
      setPendingThumbnailInput(null);
    }
  }, [pendingThumbnailInput, setPendingThumbnailInput]);

  // Set default selection
  useEffect(() => {
    if (!selectedConcept && thumbnails.length > 0) {
      setSelectedConcept(thumbnails[0]);
      setCustomHeadline(thumbnails[0].textOverlay || '');
    }
  }, [thumbnails, selectedConcept]);

  // Sync custom headline when selecting different concept
  useEffect(() => {
    if (selectedConcept) {
      setCustomHeadline(selectedConcept.textOverlay || selectedConcept.title || 'HOOK BESAR TEKNO');
    }
  }, [selectedConcept?.id]);

  const handleGenerateConcepts = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !topic.trim()) {
      showToast('Judul atau topik video wajib diisi.', 'error');
      return;
    }
    if (!apiStatus?.hasApiKey) {
      showToast('GEMINI_API_KEY belum dikonfigurasi di secrets.', 'error');
      return;
    }

    setGenerating(true);
    try {
      const result = await ApiService.generateThumbnailConcepts({
        title: title || topic,
        topic: topic || title,
        audience,
        style,
        notes,
        channelProfile,
      });

      const formatted: ThumbnailConcept[] = (result.concepts || []).map((g, idx) => ({
        id: `thumb-${Date.now()}-${idx}`,
        title: title || topic,
        topic: topic || title,
        conceptName: g.conceptName,
        mainSubject: g.mainSubject,
        composition: g.composition,
        focalPoint: g.focalPoint,
        background: g.background,
        colors: g.colors || [],
        textOverlay: g.textOverlay,
        textPlacement: g.textPlacement,
        contrastAndReadability: g.contrastAndReadability,
        imagePrompt: g.imagePrompt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      setConcepts(formatted);
      if (formatted.length > 0) {
        setSelectedConcept(formatted[0]);
        setCustomHeadline(formatted[0].textOverlay || '');
      }
      if (result.isFallback) {
        showToast(result.notice || 'Konsep thumbnail dirancang dengan template visual Revisitekno.', 'info');
      } else {
        showToast(`Berhasil menghasilkan ${formatted.length} konsep thumbnail!`, 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Gagal menghasilkan konsep thumbnail.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveConcept = (concept: ThumbnailConcept) => {
    const toSave: ThumbnailConcept = {
      ...concept,
      textOverlay: customHeadline || concept.textOverlay,
      updatedAt: new Date().toISOString(),
    };
    addOrUpdateThumbnail(toSave);
    setSelectedConcept(toSave);
    showToast('Konsep thumbnail berhasil disimpan ke pustaka.', 'success');
  };

  // Generate visual preview image using Gemini Flash Lite Image or Resilient SVG Fallback
  const handleGenerateAiImage = async (concept: ThumbnailConcept) => {
    if (!concept.imagePrompt && !concept.title) {
      showToast('Prompt gambar atau judul tidak ditemukan.', 'error');
      return;
    }
    if (!apiStatus?.hasApiKey) {
      showToast('GEMINI_API_KEY belum dikonfigurasi di secrets.', 'error');
      return;
    }

    setGeneratingImage(true);
    try {
      const result = await ApiService.generateThumbnailImage({
        prompt: concept.imagePrompt,
        title: concept.title,
        textOverlay: customHeadline || concept.textOverlay,
      });

      const updated: ThumbnailConcept = {
        ...concept,
        generatedImageUrl: result.imageUrl,
        textOverlay: customHeadline || concept.textOverlay,
        updatedAt: new Date().toISOString(),
      };

      addOrUpdateThumbnail(updated);
      setSelectedConcept(updated);
      setConcepts((prev) => prev.map((c) => (c.id === concept.id ? updated : c)));

      if (result.isFallback) {
        showToast(result.notice || 'Pratinjau kartu desain grafis 16:9 berhasil disiapkan!', 'info');
      } else {
        showToast('Gambar pratinjau AI 16:9 berhasil dibuat!', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Gagal menghasilkan pratinjau gambar AI.', 'error');
    } finally {
      setGeneratingImage(false);
    }
  };

  // Export 1280x720 PNG natively using HTML5 Canvas
  const handleDownloadPng = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 1280, 720);
    bgGrad.addColorStop(0, '#0a101d');
    bgGrad.addColorStop(0.5, '#0e1828');
    bgGrad.addColorStop(1, '#05080e');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1280, 720);

    // Grid pattern
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 1280; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 720);
      ctx.stroke();
    }
    for (let y = 0; y < 720; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1280, y);
      ctx.stroke();
    }

    // Glow effect
    const glow = ctx.createRadialGradient(250, 200, 10, 250, 200, 450);
    glow.addColorStop(0, `${selectedAccentColor.hex}44`);
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 1280, 720);

    // Draw frame
    ctx.strokeStyle = selectedAccentColor.hex;
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, 1220, 660);

    // Brand badge
    ctx.fillStyle = '#0c1626';
    ctx.fillRect(60, 60, 260, 48);
    ctx.strokeStyle = selectedAccentColor.hex;
    ctx.lineWidth = 2;
    ctx.strokeRect(60, 60, 260, 48);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(customBadge || 'REVISITEKNO AI', 80, 92);

    // 4K Badge
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(340, 60, 150, 48);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(340, 60, 150, 48);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('4K ULTRA HD', 360, 92);

    // Headline Box
    const headline = (customHeadline || selectedConcept?.textOverlay || 'REVISITEKNO REVIEW').toUpperCase();
    ctx.fillStyle = 'rgba(6, 11, 19, 0.92)';
    ctx.fillRect(60, 220, 1050, 220);
    ctx.strokeStyle = selectedAccentColor.hex;
    ctx.lineWidth = 4;
    ctx.strokeRect(60, 220, 1050, 220);

    // Left accent bar
    ctx.fillStyle = selectedAccentColor.hex;
    ctx.fillRect(60, 220, 16, 220);

    // Main text
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 52px sans-serif';
    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur = 12;

    // Handle multiline text wrapping
    const words = headline.split(' ');
    let line = '';
    let y = 310;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > 950 && n > 0) {
        ctx.fillText(line, 100, y);
        line = words[n] + ' ';
        y += 65;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 100, y);
    ctx.shadowBlur = 0;

    // Bottom Badges
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(60, 560, 200, 46);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.strokeRect(60, 560, 200, 46);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('✓ REVIEW JUJUR', 80, 590);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(280, 560, 220, 46);
    ctx.strokeStyle = selectedAccentColor.hex;
    ctx.strokeRect(280, 560, 220, 46);
    ctx.fillStyle = selectedAccentColor.hex;
    ctx.fillText('⚡ BENCHMARK 2026', 300, 590);

    // Safe zone warning (Bottom Right)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(1060, 610, 160, 50);
    ctx.strokeStyle = '#ef4444';
    ctx.strokeRect(1060, 610, 160, 50);
    ctx.fillStyle = '#f87171';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('ZONA DURASI YT', 1075, 642);

    // Trigger download
    const link = document.createElement('a');
    link.download = `Revisitekno_Thumbnail_1280x720_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('Berkas gambar thumbnail 1280x720 PNG berhasil diunduh!', 'success');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ImageIcon className="h-4 w-4" />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
              YouTube Thumbnail Lab & Visual Studio
            </h2>
          </div>
          <p className="mt-1 text-xs md:text-sm text-slate-400">
            Rancang konsep thumbnail CTR tinggi, sesuaikan desain grafis Dark Tech, dan ekspor 1280x720 PNG siap upload.
          </p>
        </div>

        <button
          onClick={() => setShowFaq(!showFaq)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-[#121c2d] px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors self-start sm:self-auto"
        >
          <Info className="h-3.5 w-3.5 text-cyan-400" />
          <span>{showFaq ? 'Tutup Info Error & Kuota' : 'Penyebab Error & Solusi'}</span>
        </button>
      </div>

      {/* Info & Troubleshooting Box (Addressing User Question 6 & 3) */}
      {showFaq && (
        <div className="rounded-2xl border border-cyan-500/30 bg-[#0c1828] p-5 space-y-3 text-xs animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span>Mengapa Pembuatan Gambar Thumbnail Terkadang Error?</span>
            </h3>
            <span className="text-[11px] text-cyan-300 font-mono">Status: Terproteksi</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300 leading-relaxed">
            <div className="p-3.5 rounded-xl bg-[#08101a] border border-slate-800 space-y-1.5">
              <span className="font-semibold text-amber-300 block">
                1. Kebijakan Model AI Gambar Google (Paid Tier):
              </span>
              <p>
                Model pembuatan gambar AI generatif murni (<code className="text-cyan-300">gemini-3.1-flash-lite-image</code>) secara resmi mewajibkan <strong>Google Cloud API Key Berbayar (Pay-As-You-Go / Billing Aktif)</strong>. Jika akun AI Studio Anda masih tier gratis, Google akan menolak permintaan dengan pesan <em>Quota / Billing Required</em>.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#08101a] border border-slate-800 space-y-1.5">
              <span className="font-semibold text-emerald-300 block">
                2. Solusi 100% Berhasil Tanpa Error di Revisitekno:
              </span>
              <p>
                Aplikasi ini dilengkapi <strong>Studio Desain Grafis Dark Tech 16:9 Otomatis</strong>. Jika model gambar AI tidak dapat diakses, sistem secara otomatis menghasilkan kartu visual beresolusi 1280x720 siap pakai yang bisa Anda unduh langsung sebagai <strong>PNG</strong> tanpa biaya dan bebas batasan kuota!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Concept Generator Form */}
      <form
        onSubmit={handleGenerateConcepts}
        className="rounded-2xl border border-slate-800 bg-[#0e1624] p-5 md:p-6 shadow-xl space-y-4"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Perancang Konsep Thumbnail CTR Tinggi</span>
          </span>
          <span className="text-[11px] text-slate-500">Rasio Standar: 16:9</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">
              Judul Video / Premis <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Misal: Review 30 Hari Laptop AI: Jangan Beli Dulu!"
              className="w-full rounded-xl border border-slate-700 bg-[#121c2d] p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Topik atau Niche</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Misal: Laptop Snapdragon X Elite, Gadget Review"
              className="w-full rounded-xl border border-slate-700 bg-[#121c2d] p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Gaya Visual Estetika</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-[#121c2d] p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              {STYLES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3 space-y-1">
            <label className="text-xs font-medium text-slate-300">
              Catatan Khusus / Referensi (Opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Misal: Tonjolkan perbandingan ukuran tipis dengan koin, beri tanda silang merah..."
              className="w-full rounded-xl border border-slate-700 bg-[#121c2d] p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={generating || !title.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all"
          >
            {generating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Merancang Konsep Visual...</span>
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                <span>Hasilkan 3 Konsep Thumbnail</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Main Studio View: Concept Inspector & Visual Canvas Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Saved & Candidate Concepts List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Daftar Konsep Thumbnail ({thumbnails.length + concepts.length})
            </h3>
          </div>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
            {/* Newly generated candidates */}
            {concepts.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  setSelectedConcept(c);
                  setCustomHeadline(c.textOverlay || '');
                }}
                className={`rounded-xl border p-3.5 text-xs cursor-pointer transition-all ${
                  selectedConcept?.id === c.id
                    ? 'border-emerald-500 bg-[#0c1a17] text-white shadow-md'
                    : 'border-slate-800 bg-[#0e1624] text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-emerald-400 font-semibold mb-1">
                  <span>HASIL GENERASI AI</span>
                  <span className="font-mono">16:9</span>
                </div>
                <h4 className="font-bold text-white text-xs line-clamp-1">{c.conceptName}</h4>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{c.mainSubject}</p>
              </div>
            ))}

            {/* Saved in library */}
            {thumbnails.map((t) => (
              <div
                key={t.id}
                onClick={() => {
                  setSelectedConcept(t);
                  setCustomHeadline(t.textOverlay || '');
                }}
                className={`rounded-xl border p-3.5 text-xs cursor-pointer transition-all ${
                  selectedConcept?.id === t.id
                    ? 'border-emerald-500 bg-[#0c1a17] text-white shadow-md'
                    : 'border-slate-800 bg-[#0e1624] text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span className="rounded bg-slate-800 px-1.5 py-0.5">TERSIMPAN</span>
                  {t.generatedImageUrl && <span className="text-emerald-400 font-medium">Ada Gambar</span>}
                </div>
                <h4 className="font-bold text-white text-xs line-clamp-1">{t.conceptName || t.title}</h4>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{t.textOverlay}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right 2 Columns: Detailed Inspector & 16:9 Canvas Simulator */}
        {selectedConcept ? (
          <div className="lg:col-span-2 space-y-5">
            {/* 16:9 Interactive Canvas Simulator & Live Designer */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Smartphone className="h-4 w-4 text-emerald-400" />
                  <span>Kanvas Desain Thumbnail 16:9 (Simulasi HP & Ekspor HD)</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowSafeZone(!showSafeZone)}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium border transition-colors ${
                      showSafeZone
                        ? 'bg-red-500/20 text-red-300 border-red-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    Zona Aman YT: {showSafeZone ? 'Aktif' : 'Nonaktif'}
                  </button>
                  <button
                    onClick={handleDownloadPng}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1 font-semibold text-white shadow transition-all active:scale-95"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Unduh PNG (1280x720)</span>
                  </button>
                </div>
              </div>

              {/* 16:9 Visual Frame */}
              <div className="relative aspect-video w-full rounded-2xl border-2 border-slate-700 bg-gradient-to-br from-[#0a0f18] via-[#101726] to-[#05080e] overflow-hidden shadow-2xl flex flex-col justify-between p-6">
                {/* Background image if generated */}
                {selectedConcept.generatedImageUrl ? (
                  <img
                    src={selectedConcept.generatedImageUrl}
                    alt={selectedConcept.conceptName}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#00f0ff_1px,transparent_1px)] [background-size:16px_16px]" />
                    <div
                      className="absolute inset-0 opacity-30 pointer-events-none"
                      style={{
                        background: `radial-gradient(circle at 25% 25%, ${selectedAccentColor.hex} 0%, transparent 60%)`,
                      }}
                    />
                  </>
                )}

                {/* Dark gradient overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/40 pointer-events-none" />

                {/* Top Bar inside frame */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block px-3 py-1 rounded-md text-[11px] font-black text-white bg-black/80 border ${selectedAccentColor.border} shadow`}
                    >
                      {customBadge || 'REVISITEKNO AI'}
                    </span>
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-semibold text-sky-400 bg-slate-900/80 border border-slate-700">
                      4K ULTRA HD
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-400 bg-black/60 px-2 py-0.5 rounded backdrop-blur">
                    16:9 • CTR Lab
                  </span>
                </div>

                {/* Text Overlay Simulated (Big, bold, readable on 5" screen) */}
                <div className="relative z-10 max-w-[80%] my-auto">
                  <div className="inline-block bg-black/90 backdrop-blur-md border border-cyan-500/50 rounded-xl p-3 md:p-4 shadow-2xl">
                    <span
                      className="font-black text-base sm:text-xl md:text-3xl text-white tracking-tight uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,1)] block"
                      style={{ color: '#ffffff' }}
                    >
                      {customHeadline || selectedConcept.textOverlay || 'TEKS HOOK BESAR'}
                    </span>
                  </div>
                </div>

                {/* Bottom Bar: YouTube Timestamp Safe Zone Indicator */}
                <div className="relative z-10 flex items-end justify-between">
                  <div className="flex items-center gap-2 text-[10px] text-slate-300 bg-black/70 px-2.5 py-1 rounded backdrop-blur-sm border border-slate-800">
                    <span className="text-emerald-400 font-semibold">Subjek:</span> {selectedConcept.focalPoint}
                  </div>

                  {/* YouTube Timestamp mock badge in bottom-right */}
                  {showSafeZone && (
                    <div className="rounded bg-black/95 px-2.5 py-1 text-[11px] font-mono text-white border border-red-500/50 shadow-lg">
                      <span className="text-red-400 mr-1 font-bold">ZONA YT:</span> 12:45
                    </div>
                  )}
                </div>
              </div>

              {/* Interactive Live Graphic Customization Controls */}
              <div className="rounded-xl border border-slate-800 bg-[#0e1624] p-4 text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Sliders className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Penyesuaian Langsung Teks & Warna Thumbnail</span>
                  </span>
                  <span className="text-[11px] text-slate-400">Pratinjau otomatis berubah di atas</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] text-slate-400 font-medium">
                      Teks Hook Utama (2-4 Kata Huruf Kapital)
                    </label>
                    <input
                      type="text"
                      value={customHeadline}
                      onChange={(e) => setCustomHeadline(e.target.value)}
                      placeholder="Misal: JANGAN FORMAT DULU!"
                      className="w-full rounded-lg border border-slate-700 bg-[#121c2d] p-2 text-xs font-bold text-white focus:outline-none focus:border-cyan-500 uppercase"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 font-medium">Lencana / Badge</label>
                    <input
                      type="text"
                      value={customBadge}
                      onChange={(e) => setCustomBadge(e.target.value)}
                      placeholder="REVISITEKNO AI"
                      className="w-full rounded-lg border border-slate-700 bg-[#121c2d] p-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">Warna Aksen:</span>
                    <div className="flex items-center gap-1.5">
                      {ACCENT_COLORS.map((col) => (
                        <button
                          key={col.name}
                          type="button"
                          onClick={() => setSelectedAccentColor(col)}
                          className={`h-5 w-5 rounded-full border-2 transition-transform ${
                            selectedAccentColor.name === col.name ? 'scale-125 border-white' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: col.hex }}
                          title={col.name}
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadPng}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 px-3.5 py-1.5 font-semibold text-white text-xs shadow hover:brightness-110 transition-all active:scale-95"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Ekspor Desain ke File PNG (1280x720)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Concept Specification Grid */}
            <div className="rounded-2xl border border-slate-800 bg-[#0e1624] p-5 space-y-4 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedConcept.conceptName}</h3>
                  <p className="text-[11px] text-slate-400">{selectedConcept.composition}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSaveConcept(selectedConcept)}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 font-semibold text-white hover:bg-emerald-500 transition-colors"
                  >
                    <Bookmark className="h-3.5 w-3.5" />
                    <span>Simpan ke Pustaka</span>
                  </button>

                  <button
                    onClick={() => removeThumbnail(selectedConcept.id)}
                    className="rounded-lg border border-slate-700 p-1.5 text-slate-400 hover:text-red-400"
                    title="Hapus"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="font-semibold text-slate-400 block">Subjek Utama:</span>
                  <p className="text-slate-200">{selectedConcept.mainSubject}</p>
                </div>

                <div className="space-y-1">
                  <span className="font-semibold text-slate-400 block">Titik Fokus Mata:</span>
                  <p className="text-slate-200">{selectedConcept.focalPoint}</p>
                </div>

                <div className="space-y-1">
                  <span className="font-semibold text-slate-400 block">Latar Belakang:</span>
                  <p className="text-slate-200">{selectedConcept.background}</p>
                </div>

                <div className="space-y-1">
                  <span className="font-semibold text-slate-400 block">
                    Keterbacaan di Layar HP:
                  </span>
                  <p className="text-slate-200">{selectedConcept.contrastAndReadability}</p>
                </div>
              </div>

              {/* Color Palette Chips */}
              {selectedConcept.colors && selectedConcept.colors.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <span className="font-semibold text-slate-400 block">
                    Palet Warna Direkomendasikan:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedConcept.colors.map((c, i) => (
                      <span
                        key={i}
                        className="rounded-lg bg-slate-800/80 border border-slate-700 px-2.5 py-1 text-[11px] text-slate-300"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Image Generation Action */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-cyan-400 flex items-center gap-1.5">
                    <Wand2 className="h-3.5 w-3.5" />
                    <span>Prompt Generator AI (16:9 Flash Lite Image)</span>
                  </span>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedConcept.imagePrompt);
                      showToast('Prompt disalin ke papan klip.', 'info');
                    }}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    <Copy className="h-3 w-3" />
                    <span>Salin Prompt</span>
                  </button>
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#090e18] p-3 text-[11px] font-mono text-slate-300 leading-relaxed">
                  {selectedConcept.imagePrompt}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handleGenerateAiImage(selectedConcept)}
                    disabled={generatingImage}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 py-2.5 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all"
                  >
                    {generatingImage ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin text-cyan-200" />
                        <span>Merender Pratinjau Visual Gambar...</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="h-4 w-4" />
                        <span>Hasilkan Pratinjau Gambar dengan AI / Fallback Grafis</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 rounded-2xl border border-dashed border-slate-800 bg-[#0e1624] p-12 text-center text-xs text-slate-500">
            <ImageIcon className="h-8 w-8 text-slate-600 mx-auto mb-2" />
            <span>Pilih salah satu konsep di sisi kiri atau rancang konsep baru melalui formulir di atas.</span>
          </div>
        )}
      </div>
    </div>
  );
};
