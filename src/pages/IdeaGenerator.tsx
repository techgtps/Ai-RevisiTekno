import React, { useState } from 'react';
import {
  Lightbulb,
  Sparkles,
  Send,
  Kanban,
  FileText,
  Bookmark,
  BookmarkCheck,
  Trash2,
  Edit3,
  Check,
  X,
  AlertTriangle,
  Layers,
  ArrowRight,
  Filter,
  Plus,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { VideoFormat, VideoIdea } from '../types';
import { ApiService } from '../services/api';

const FORMAT_OPTIONS: VideoFormat[] = [
  'Long-form YouTube',
  'Review & Hands-on',
  'Perbandingan (VS)',
  'Tutorial & How-to',
  'Explainer & Analisis',
  'YouTube Shorts',
  'Storytelling & Tech History',
];

const TONE_OPTIONS = [
  'Santai & Informatif (Casual Review)',
  'Kritis & Analitis (Deep-dive)',
  'Cepat & Padat (To the point)',
  'Edukatif & Mudah Dipahami Pemula',
  'Objektif & Berbasis Uji Benchmark',
];

const OBJECTIVE_OPTIONS = [
  'Membantu audiens mengambil keputusan beli',
  'Menyelesaikan masalah teknis spesifik (Solusi cepat)',
  'Membongkar mitos atau strategi pemasaran brand',
  'Memberikan wawasan tren masa depan',
  'Hiburan informatif & eksplorasi gadget unik',
];

export const IdeaGenerator: React.FC = () => {
  const {
    channelProfile,
    ideas,
    addOrUpdateIdea,
    removeIdea,
    transferIdeaToPlan,
    transferIdeaToScript,
    apiStatus,
    showToast,
    setActiveTab,
  } = useApp();

  // Generator form state
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState(channelProfile.targetAudience);
  const [format, setFormat] = useState<VideoFormat>('Long-form YouTube');
  const [objective, setObjective] = useState(OBJECTIVE_OPTIONS[0]);
  const [tone, setTone] = useState(TONE_OPTIONS[0]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Generated candidate ideas
  const [generatedList, setGeneratedList] = useState<VideoIdea[]>([]);

  // Editing state for an idea
  const [editingIdea, setEditingIdea] = useState<VideoIdea | null>(null);

  // Manual create modal
  const [isCreatingManual, setIsCreatingManual] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualConcept, setManualConcept] = useState('');
  const [manualHook, setManualHook] = useState('');
  const [manualPoints, setManualPoints] = useState('');

  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      showToast('Mohon masukkan topik atau niche video.', 'error');
      return;
    }
    if (!apiStatus?.hasApiKey) {
      showToast('GEMINI_API_KEY belum dikonfigurasi di secrets.', 'error');
      return;
    }

    setLoading(true);
    setFallbackNotice(null);
    try {
      const results = await ApiService.generateIdeas({
        topic,
        audience,
        format,
        objective,
        tone,
        additionalNotes,
        channelProfile,
      });

      const formatted: VideoIdea[] = (results.ideas || []).map((r, idx) => ({
        id: `gen-idea-${Date.now()}-${idx}`,
        title: r.title,
        coreConcept: r.coreConcept,
        hook: r.hook,
        viewerProblem: r.viewerProblem,
        talkingPoints: r.talkingPoints || [],
        structure: r.structure,
        thumbnailDirection: r.thumbnailDirection,
        difficulty: (r.difficulty as any) || 'Sedang',
        researchNeeded: r.researchNeeded || 'Lakukan verifikasi fakta spesifikasi resmi.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      setGeneratedList(formatted);
      if (results.isFallback) {
        setFallbackNotice(
          results.notice ||
            'Kuota API Gemini gratis sementara penuh (Error 429). Ide otomatis dirancang dengan template cerdas Revisitekno agar perencanaan Anda tidak terhenti.'
        );
        showToast('Ide berhasil dibuat dengan template cerdas Revisitekno.', 'info');
      } else {
        showToast(`Berhasil menghasilkan ${formatted.length} konsep ide!`, 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Gagal menghasilkan ide video.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToLibrary = (idea: VideoIdea) => {
    addOrUpdateIdea(idea);
  };

  const isSavedInLibrary = (id: string) => {
    return ideas.some((item) => item.id === id);
  };

  const handleCreateManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;

    const newIdea: VideoIdea = {
      id: 'manual-idea-' + Date.now(),
      title: manualTitle,
      coreConcept: manualConcept || 'Konsep ide mandiri oleh kreator',
      hook: manualHook || 'Hook awal video',
      viewerProblem: 'Kebutuhan informasi penonton',
      talkingPoints: manualPoints
        ? manualPoints.split('\n').filter((p) => p.trim())
        : ['Poin bahasan 1', 'Poin bahasan 2'],
      structure: 'Intro -> Isi -> Outro',
      thumbnailDirection: 'Thumbnail visual kontras tinggi',
      difficulty: 'Sedang',
      researchNeeded: 'Perlu pengujian mandiri',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addOrUpdateIdea(newIdea);
    setIsCreatingManual(false);
    setManualTitle('');
    setManualConcept('');
    setManualHook('');
    setManualPoints('');
  };

  const handleSaveEdit = () => {
    if (!editingIdea) return;
    addOrUpdateIdea(editingIdea);
    setEditingIdea(null);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 md:p-6 text-slate-100">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Lightbulb className="h-4 w-4" />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
              YouTube Idea Generator
            </h2>
          </div>
          <p className="mt-1 text-xs md:text-sm text-slate-400">
            Hasilkan ide video teknologi terstruktur dengan hook teruji, poin bahasan, dan arah visual.
          </p>
        </div>

        <button
          onClick={() => setIsCreatingManual(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-[#141d2c] px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-[#1a263a] hover:text-white transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4 text-cyan-400" />
          <span>Tulis Ide Mandiri</span>
        </button>
      </div>

      {/* Generation Form */}
      <form
        onSubmit={handleGenerate}
        className="rounded-2xl border border-slate-800 bg-[#0e1624] p-5 md:p-6 shadow-xl space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Kriteria Perancangan Ide</span>
          </div>
          <span className="text-[11px] text-slate-500">Channel: {channelProfile.channelName}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Topik / Niche */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Topik, Gadget, atau Isu Teknologi <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Contoh: Perbandingan Kamera iPhone 16 Pro vs S25 Ultra, Alasan jangan beli laptop gaming murah..."
              className="w-full rounded-xl border border-slate-700 bg-[#121c2d] px-3.5 py-2.5 text-xs md:text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
              required
            />
          </div>

          {/* Format Video */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Format Video</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as VideoFormat)}
              className="w-full rounded-xl border border-slate-700 bg-[#121c2d] px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
            >
              {FORMAT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Target Audiens */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Target Audiens</label>
            <input
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="Contoh: Mahasiswa IT, Pembeli gadget hemat, Kreator konten"
              className="w-full rounded-xl border border-slate-700 bg-[#121c2d] px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
            />
          </div>

          {/* Nada / Tone */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Gaya Bahasa / Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-[#121c2d] px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
            >
              {TONE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Tujuan Konten */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Tujuan Konten</label>
            <select
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-[#121c2d] px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
            >
              {OBJECTIVE_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>

          {/* Catatan Tambahan */}
          <div className="md:col-span-2 lg:col-span-3 space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Instruksi Tambahan (Opsional)
            </label>
            <input
              type="text"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Misal: Sorot masalah panas saat gaming, tekankan faktor harga bekas di Indonesia..."
              className="w-full rounded-xl border border-slate-700 bg-[#121c2d] px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <p className="text-[11px] text-slate-400">
            AI menghasilkan saran struktur konseptual. Kreator tetap memegang kendali verifikasi riset.
          </p>

          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all"
          >
            {loading ? (
              <>
                <Sparkles className="h-4 w-4 animate-spin text-cyan-200" />
                <span>Merancang Ide Video...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Hasilkan Ide Video Sekarang</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Generated Results Section */}
      {generatedList.length > 0 && (
        <div className="space-y-4">
          {fallbackNotice && (
            <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-3.5 text-xs text-amber-200 flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-amber-300">Mode Template Cerdas Aktif:</span>
                <p className="mt-0.5 text-slate-300 leading-relaxed text-[11px]">{fallbackNotice}</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <h3 className="text-base font-bold text-white">
                Hasil Eksplorasi Ide Terbaru ({generatedList.length})
              </h3>
            </div>
            <span className="text-xs text-slate-400">Klik "Simpan" untuk memasukkan ke pustaka</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {generatedList.map((idea) => {
              const saved = isSavedInLibrary(idea.id);
              return (
                <div
                  key={idea.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-[#0f1726] p-5 transition-all hover:border-slate-700 hover:bg-[#121c2e] shadow-md"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                              idea.difficulty === 'Rendah'
                                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                                : idea.difficulty === 'Sedang'
                                ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                                : 'bg-red-500/10 text-red-300 border border-red-500/30'
                            }`}
                          >
                            Tingkat Kesulitan: {idea.difficulty}
                          </span>
                        </div>
                        <h4 className="text-sm md:text-base font-bold text-white leading-snug">
                          {idea.title}
                        </h4>
                      </div>

                      <button
                        onClick={() => handleSaveToLibrary(idea)}
                        className={`rounded-lg p-2 transition-colors ${
                          saved
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                        title={saved ? 'Tersimpan di Pustaka' : 'Simpan ke Pustaka'}
                      >
                        {saved ? (
                          <BookmarkCheck className="h-4 w-4" />
                        ) : (
                          <Bookmark className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {/* Core concept & Hook */}
                    <div className="space-y-2 text-xs">
                      <div className="rounded-xl bg-[#090d16] p-3 border border-slate-800/80">
                        <span className="font-semibold text-cyan-400 block mb-1">
                          Hook Pembuka (0-10 detik):
                        </span>
                        <p className="italic text-slate-300">"{idea.hook}"</p>
                      </div>

                      <div className="text-slate-300">
                        <span className="font-semibold text-slate-400">Konsep Utama: </span>
                        {idea.coreConcept}
                      </div>

                      <div>
                        <span className="font-semibold text-slate-400 block mb-1">Poin Pembahasan:</span>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-300 pl-1">
                          {idea.talkingPoints.map((pt, i) => (
                            <li key={i}>{pt}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="rounded-lg bg-slate-900/60 p-2.5 border border-slate-800 text-slate-300">
                        <span className="font-semibold text-slate-400 block text-[11px] mb-0.5">
                          Arah Visual Thumbnail:
                        </span>
                        <p className="text-[11px] text-slate-400">{idea.thumbnailDirection}</p>
                      </div>

                      <div className="flex items-start gap-1.5 text-[11px] text-amber-300/90 bg-amber-950/20 p-2 rounded-lg border border-amber-900/40">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-400" />
                        <span>
                          <strong className="text-amber-300">Riset Wajib: </strong>
                          {idea.researchNeeded}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                    <button
                      onClick={() => setEditingIdea(idea)}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Edit Rincian</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => transferIdeaToPlan(idea)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/40 bg-blue-500/10 px-2.5 py-1.5 text-xs font-semibold text-blue-300 hover:bg-blue-500/20 transition-colors"
                      >
                        <Kanban className="h-3.5 w-3.5" />
                        <span>Kirim ke Planner</span>
                      </button>

                      <button
                        onClick={() => transferIdeaToScript(idea)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:brightness-110 transition-colors"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>Tulis Naskah</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Saved Ideas in Content Library quick view */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="h-4 w-4 text-amber-400" />
            <h3 className="text-base font-bold text-white">
              Ide Tersimpan di Pustaka ({ideas.length})
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('library')}
            className="text-xs font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>Buka Content Library</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {ideas.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-800 bg-[#0e1624] p-8 text-center text-slate-500 text-xs">
            Belum ada ide yang disimpan ke Pustaka. Gunakan formulir di atas untuk menghasilkan ide baru atau buat secara mandiri.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ideas.map((savedIdea) => (
              <div
                key={savedIdea.id}
                className="rounded-xl border border-slate-800 bg-[#0e1522] p-4 flex flex-col justify-between hover:border-slate-700 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-white line-clamp-2">{savedIdea.title}</h4>
                    <button
                      onClick={() => removeIdea(savedIdea.id)}
                      className="text-slate-500 hover:text-red-400 p-1"
                      title="Hapus ide"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{savedIdea.coreConcept}</p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <button
                    onClick={() => transferIdeaToPlan(savedIdea)}
                    className="text-blue-400 hover:text-blue-300 font-medium text-[11px] flex items-center gap-1"
                  >
                    <Kanban className="h-3 w-3" />
                    <span>Jadikan Rencana</span>
                  </button>

                  <button
                    onClick={() => transferIdeaToScript(savedIdea)}
                    className="text-cyan-400 hover:text-cyan-300 font-medium text-[11px] flex items-center gap-1"
                  >
                    <FileText className="h-3 w-3" />
                    <span>Mulai Naskah</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manual Idea Creation Modal */}
      {isCreatingManual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0e1624] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Catat Ide Video Mandiri</h3>
              <button
                onClick={() => setIsCreatingManual(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManual} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Judul Ide Video *</label>
                <input
                  type="text"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  placeholder="Misal: Review Jangka Panjang Setup Ergonomis"
                  className="w-full rounded-lg border border-slate-700 bg-[#121c2d] p-2.5 text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Inti Konsep Video</label>
                <textarea
                  rows={2}
                  value={manualConcept}
                  onChange={(e) => setManualConcept(e.target.value)}
                  placeholder="Premis utama dan sudut pandang video..."
                  className="w-full rounded-lg border border-slate-700 bg-[#121c2d] p-2.5 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Hook Kalimat Pembuka</label>
                <input
                  type="text"
                  value={manualHook}
                  onChange={(e) => setManualHook(e.target.value)}
                  placeholder="Kalimat pemancing rasa penasaran 10 detik pertama..."
                  className="w-full rounded-lg border border-slate-700 bg-[#121c2d] p-2.5 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Poin Pembahasan (1 per baris)</label>
                <textarea
                  rows={3}
                  value={manualPoints}
                  onChange={(e) => setManualPoints(e.target.value)}
                  placeholder="Poin 1&#10;Poin 2&#10;Poin 3"
                  className="w-full rounded-lg border border-slate-700 bg-[#121c2d] p-2.5 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingManual(false)}
                  className="rounded-lg border border-slate-700 px-3 py-1.5 text-slate-300 hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-1.5 font-semibold text-white hover:brightness-110"
                >
                  Simpan Ide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Idea Modal */}
      {editingIdea && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0e1624] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Edit Rincian Ide</h3>
              <button onClick={() => setEditingIdea(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Judul Video</label>
                <input
                  type="text"
                  value={editingIdea.title}
                  onChange={(e) => setEditingIdea({ ...editingIdea, title: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-[#121c2d] p-2.5 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Hook</label>
                <input
                  type="text"
                  value={editingIdea.hook}
                  onChange={(e) => setEditingIdea({ ...editingIdea, hook: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-[#121c2d] p-2.5 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Konsep Utama</label>
                <textarea
                  rows={2}
                  value={editingIdea.coreConcept}
                  onChange={(e) => setEditingIdea({ ...editingIdea, coreConcept: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-[#121c2d] p-2.5 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Arah Visual Thumbnail</label>
                <input
                  type="text"
                  value={editingIdea.thumbnailDirection}
                  onChange={(e) => setEditingIdea({ ...editingIdea, thumbnailDirection: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-[#121c2d] p-2.5 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setEditingIdea(null)}
                  className="rounded-lg border border-slate-700 px-3 py-1.5 text-slate-300 hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="rounded-lg bg-cyan-600 px-4 py-1.5 font-semibold text-white hover:bg-cyan-500"
                >
                  Terapkan Perubahan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
