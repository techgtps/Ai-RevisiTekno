import React, { useState, useEffect } from 'react';
import {
  FileText,
  Sparkles,
  Volume2,
  Copy,
  Download,
  Save,
  Check,
  RefreshCw,
  Wand2,
  Clock,
  BookOpen,
  Scissors,
  CheckCheck,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Plus,
  Trash2,
  List,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ScriptItem, VideoFormat, ScriptStatus } from '../types';
import { ApiService } from '../services/api';

const SCRIPT_STATUSES: ScriptStatus[] = [
  'Draft',
  'In Revision',
  'Ready for Recording',
  'Recorded',
];

const STATUS_BADGES: Record<ScriptStatus, { label: string; color: string }> = {
  Draft: { label: 'Draf Awal', color: 'bg-slate-500/10 border-slate-500/30 text-slate-300' },
  'In Revision': { label: 'Revisi & Poles', color: 'bg-amber-500/10 border-amber-500/30 text-amber-300' },
  'Ready for Recording': { label: 'Siap Rekaman', color: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300' },
  Recorded: { label: 'Selesai Direkam', color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' },
};

const FORMATS: VideoFormat[] = [
  'Long-form YouTube',
  'Review & Hands-on',
  'Perbandingan (VS)',
  'Tutorial & How-to',
  'Explainer & Analisis',
  'YouTube Shorts',
  'Storytelling & Tech History',
];

export const ScriptStudio: React.FC = () => {
  const {
    scripts,
    addOrUpdateScript,
    removeScript,
    transferScriptToVoice,
    channelProfile,
    apiStatus,
    showToast,
    pendingScriptInput,
    setPendingScriptInput,
    selectedScriptForEdit,
    setSelectedScriptForEdit,
  } = useApp();

  // Active script in editor
  const [currentScript, setCurrentScript] = useState<ScriptItem>(() => {
    if (selectedScriptForEdit) return selectedScriptForEdit;
    if (scripts.length > 0) return scripts[0];
    return {
      id: 'script-' + Date.now(),
      title: 'Naskah Video Baru',
      topic: 'Teknologi Terkini',
      targetAudience: channelProfile.targetAudience,
      videoFormat: 'Long-form YouTube',
      targetDuration: '8-10 menit',
      tone: 'Santai & Kritis',
      objective: 'Edukasi dan rekomendasi produk',
      content: '',
      wordCount: 0,
      estimatedDurationMinutes: 0,
      status: 'Draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  // Generator form state for generating a brand new script
  const [showGenerator, setShowGenerator] = useState(false);
  const [genTopic, setGenTopic] = useState('');
  const [genTitle, setGenTitle] = useState('');
  const [genDuration, setGenDuration] = useState('8-10 menit');
  const [genFormat, setGenFormat] = useState<VideoFormat>('Long-form YouTube');
  const [genTone, setGenTone] = useState('Santai, lugas, jujur berbasis pengalaman pakai');
  const [genObjective, setGenObjective] = useState('Panduan komparasi belanja gadget');
  const [genTalkingPoints, setGenTalkingPoints] = useState('');
  const [genNotes, setGenNotes] = useState('');
  const [generating, setGenerating] = useState(false);

  // Text selection and AI refiner state
  const [selectedText, setSelectedText] = useState('');
  const [refineAction, setRefineAction] = useState('improve-hook');
  const [customInstruction, setCustomInstruction] = useState('');
  const [refining, setRefining] = useState(false);

  // Compare & Apply modal state (to prevent silent replacement!)
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [proposedText, setProposedText] = useState('');
  const [originalSelectedText, setOriginalSelectedText] = useState('');

  // Handle incoming script transfer from Idea Generator, Planner, or Assistant
  useEffect(() => {
    if (pendingScriptInput) {
      setGenTitle(pendingScriptInput.title || '');
      setGenTopic(pendingScriptInput.topic || pendingScriptInput.title || '');
      if (pendingScriptInput.talkingPoints) {
        setGenTalkingPoints(pendingScriptInput.talkingPoints.join('\n'));
      }
      if (pendingScriptInput.notes) {
        setGenNotes(pendingScriptInput.notes);
      }
      setShowGenerator(true);
      setPendingScriptInput(null);
    }
  }, [pendingScriptInput, setPendingScriptInput]);

  useEffect(() => {
    if (selectedScriptForEdit) {
      setCurrentScript(selectedScriptForEdit);
      setShowGenerator(false);
      setSelectedScriptForEdit(null);
    }
  }, [selectedScriptForEdit, setSelectedScriptForEdit]);

  // Recalculate word count and estimated duration
  const handleContentChange = (newContent: string) => {
    const words = newContent.trim().split(/\s+/).filter(Boolean).length;
    // Average speech rate in Indonesian narration is approx 130 words per minute
    const duration = parseFloat((words / 130).toFixed(1));

    setCurrentScript((prev) => ({
      ...prev,
      content: newContent,
      wordCount: words,
      estimatedDurationMinutes: duration,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleSave = () => {
    if (!currentScript.title.trim()) {
      showToast('Judul naskah wajib diisi.', 'error');
      return;
    }
    addOrUpdateScript(currentScript);
  };

  const handleCreateNewBlank = () => {
    const blank: ScriptItem = {
      id: 'script-' + Date.now(),
      title: 'Naskah Draf Baru',
      topic: '',
      targetAudience: channelProfile.targetAudience,
      videoFormat: 'Long-form YouTube',
      targetDuration: '8 menit',
      tone: 'Santai & Lugas',
      objective: '',
      content: `[00:00 - HOOK]\n(Tuliskan kalimat pembuka 5-10 detik pertama di sini)\n\n[00:45 - INTRO]\n(Pengantar topik dan konteks pengujian)\n\n[02:00 - PEMBAHASAN UTAMA]\n(Poin-poin pembahasan dan rekaman B-roll)\n\n[07:00 - KESIMPULAN REVISITEKNO]\n(Opini akhir dan rekomendasi)\n\n[08:00 - CALL TO ACTION]\n(Ajakan diskusi di komentar dan subscribe)`,
      wordCount: 30,
      estimatedDurationMinutes: 0.2,
      status: 'Draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCurrentScript(blank);
    setShowGenerator(false);
  };

  const handleGenerateScript = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genTopic.trim()) {
      showToast('Topik video wajib diisi.', 'error');
      return;
    }
    if (!apiStatus?.hasApiKey) {
      showToast('GEMINI_API_KEY belum dikonfigurasi di secrets.', 'error');
      return;
    }

    setGenerating(true);
    try {
      const result = await ApiService.generateScript({
        topic: genTopic,
        title: genTitle || genTopic,
        audience: channelProfile.targetAudience,
        format: genFormat,
        duration: genDuration,
        tone: genTone,
        objective: genObjective,
        talkingPoints: genTalkingPoints.split('\n').filter((p) => p.trim()),
        additionalNotes: genNotes,
      });

      const generatedScriptText = result.script || '';
      const words = generatedScriptText.trim().split(/\s+/).filter(Boolean).length;
      const duration = parseFloat((words / 130).toFixed(1));

      const newScriptItem: ScriptItem = {
        id: 'script-' + Date.now(),
        title: genTitle || genTopic,
        topic: genTopic,
        targetAudience: channelProfile.targetAudience,
        videoFormat: genFormat,
        targetDuration: genDuration,
        tone: genTone,
        objective: genObjective,
        content: generatedScriptText,
        wordCount: words,
        estimatedDurationMinutes: duration,
        status: 'Draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setCurrentScript(newScriptItem);
      addOrUpdateScript(newScriptItem);
      setShowGenerator(false);
      if (result.isFallback) {
        showToast(result.notice || 'Draf naskah dibuat menggunakan struktur teruji Revisitekno.', 'info');
      } else {
        showToast('Draf naskah berhasil dibuat!', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Gagal menghasilkan naskah.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  // Text selection handler
  const handleTextareaSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    const selection = target.value.substring(target.selectionStart, target.selectionEnd);
    if (selection && selection.trim().length > 3) {
      setSelectedText(selection.trim());
    }
  };

  // Run AI Refiner on selected text
  const handleRefineSelectedText = async () => {
    if (!selectedText.trim()) {
      showToast('Pilih / blok bagian teks yang ingin disempurnakan terlebih dahulu.', 'error');
      return;
    }
    if (!apiStatus?.hasApiKey) {
      showToast('GEMINI_API_KEY belum dikonfigurasi.', 'error');
      return;
    }

    setRefining(true);
    try {
      const result = await ApiService.refineScript({
        action: refineAction,
        selectedText,
        fullScriptContext: currentScript.content,
        instruction: customInstruction,
      });

      setOriginalSelectedText(selectedText);
      setProposedText(result);
      setCompareModalOpen(true);
    } catch (err: any) {
      showToast(err.message || 'Gagal menyempurnakan naskah.', 'error');
    } finally {
      setRefining(false);
    }
  };

  // Apply proposed text change to script safely
  const handleApplyReplacement = () => {
    if (!originalSelectedText || !proposedText) return;

    const newContent = currentScript.content.replace(originalSelectedText, proposedText);
    handleContentChange(newContent);
    setCompareModalOpen(false);
    setSelectedText('');
    showToast('Perubahan berhasil diterapkan ke naskah!', 'success');
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(currentScript.content);
    showToast('Seluruh naskah disalin ke papan klip.', 'info');
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([currentScript.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentScript.title.replace(/\s+/g, '_')}_Naskah.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Berkas naskah .txt berhasil diunduh.', 'success');
  };

  const [scriptToDelete, setScriptToDelete] = useState<ScriptItem | null>(null);

  const handleConfirmDeleteScript = () => {
    if (!scriptToDelete) return;
    const targetId = scriptToDelete.id;
    const targetTitle = scriptToDelete.title || 'Draf Naskah';
    removeScript(targetId);

    if (currentScript.id === targetId) {
      const remaining = scripts.filter((s) => s.id !== targetId);
      if (remaining.length > 0) {
        setCurrentScript(remaining[0]);
      } else {
        handleCreateNewBlank();
      }
    }
    setScriptToDelete(null);
    showToast(`Naskah "${targetTitle}" berhasil dihapus dari penyimpanan.`, 'info');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-slate-100">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FileText className="h-4 w-4" />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
              YouTube Script Studio
            </h2>
          </div>
          <p className="mt-1 text-xs md:text-sm text-slate-400">
            Tulis, kembangkan, dan sempurnakan naskah video teknologi dengan pemoles AI terarah.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowGenerator(!showGenerator)}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
              showGenerator
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/20 hover:brightness-110'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>{showGenerator ? 'Tutup Generator' : '+ Buat Draf AI Baru'}</span>
          </button>

          <button
            onClick={handleCreateNewBlank}
            className="rounded-xl border border-slate-700 bg-[#121c2d] px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-[#18263e] hover:text-white"
          >
            + Naskah Kosong
          </button>
        </div>
      </div>

      {/* Script Generator Accordion Drawer */}
      {showGenerator && (
        <form
          onSubmit={handleGenerateScript}
          className="rounded-2xl border border-cyan-500/30 bg-[#0d1624] p-5 md:p-6 shadow-xl space-y-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <Wand2 className="h-4 w-4" />
              <span>Generator Naskah Video Lengkap</span>
            </div>
            <button
              type="button"
              onClick={() => setShowGenerator(false)}
              className="text-slate-400 hover:text-white text-xs"
            >
              Batal
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Judul Video</label>
              <input
                type="text"
                value={genTitle}
                onChange={(e) => setGenTitle(e.target.value)}
                placeholder="Misal: Review 30 Hari Laptop ARM Snapdragon X Elite"
                className="w-full rounded-lg border border-slate-700 bg-[#121c2d] p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">
                Topik Utama <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={genTopic}
                onChange={(e) => setGenTopic(e.target.value)}
                placeholder="Misal: Uji Kompatibilitas Software & Baterai Laptop ARM"
                className="w-full rounded-lg border border-slate-700 bg-[#121c2d] p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Format Konten</label>
              <select
                value={genFormat}
                onChange={(e) => setGenFormat(e.target.value as VideoFormat)}
                className="w-full rounded-lg border border-slate-700 bg-[#121c2d] p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {FORMATS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Target Durasi Narasi</label>
              <input
                type="text"
                value={genDuration}
                onChange={(e) => setGenDuration(e.target.value)}
                placeholder="Contoh: 8-10 menit (atau 60 detik untuk Shorts)"
                className="w-full rounded-lg border border-slate-700 bg-[#121c2d] p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Gaya Bahasa / Tone</label>
              <input
                type="text"
                value={genTone}
                onChange={(e) => setGenTone(e.target.value)}
                placeholder="Misal: Santai, jujur, lugas, ramah"
                className="w-full rounded-lg border border-slate-700 bg-[#121c2d] p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Tujuan Konten</label>
              <input
                type="text"
                value={genObjective}
                onChange={(e) => setGenObjective(e.target.value)}
                placeholder="Misal: Menjelaskan batas toleransi software"
                className="w-full rounded-lg border border-slate-700 bg-[#121c2d] p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-medium text-slate-300">
                Poin-Poin Bahasan Penting (1 per baris)
              </label>
              <textarea
                rows={3}
                value={genTalkingPoints}
                onChange={(e) => setGenTalkingPoints(e.target.value)}
                placeholder="Uji baterai offline vs online&#10;Software DJP dan printer lawas&#10;Performa video editing di DaVinci Resolve"
                className="w-full rounded-lg border border-slate-700 bg-[#121c2d] p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Catatan Khusus</label>
              <textarea
                rows={3}
                value={genNotes}
                onChange={(e) => setGenNotes(e.target.value)}
                placeholder="Jangan lupa masukkan peringatan disclaimer garansi..."
                className="w-full rounded-lg border border-slate-700 bg-[#121c2d] p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={generating}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-2.5 text-xs font-semibold text-white shadow-lg hover:brightness-110 active:scale-95 disabled:opacity-50"
            >
              {generating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Menulis Naskah Video...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Mulai Tulis Draf Naskah</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Main Studio Workspace: Scripts Drawer & Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Script Switcher & Metadata */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-[#0e1624] p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <List className="h-4 w-4 text-cyan-400" />
                <span>Naskah Tersimpan ({scripts.length})</span>
              </span>
            </div>

            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
              {scripts.length === 0 ? (
                <div className="p-3 text-center text-[11px] text-slate-500 italic">
                  Belum ada naskah tersimpan.
                </div>
              ) : (
                scripts.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setCurrentScript(s)}
                    className={`group flex items-center justify-between rounded-lg p-2.5 transition-all text-xs cursor-pointer ${
                      currentScript.id === s.id
                        ? 'bg-cyan-500/15 border border-cyan-500/30 text-white font-medium shadow-sm'
                        : 'text-slate-400 hover:bg-[#121c2d] hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="font-semibold truncate text-slate-200 group-hover:text-white">
                        {s.title || 'Tanpa Judul'}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                        <span>{s.wordCount || 0} kata</span>
                        <span>~{s.estimatedDurationMinutes || 0} mnt</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setScriptToDelete(s);
                      }}
                      className="p-1.5 rounded-lg text-red-400/80 hover:text-red-200 hover:bg-red-500/20 border border-transparent hover:border-red-500/40 transition-all shrink-0 ml-1"
                      title={`Hapus naskah "${s.title}"`}
                      aria-label={`Hapus naskah ${s.title}`}
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Script Details Card */}
          <div className="rounded-xl border border-slate-800 bg-[#0e1624] p-4 space-y-3 text-xs">
            <h4 className="font-bold text-white text-xs border-b border-slate-800 pb-2">
              Metadata Naskah
            </h4>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Status Naskah</label>
              <select
                value={currentScript.status}
                onChange={(e) =>
                  setCurrentScript({ ...currentScript, status: e.target.value as ScriptStatus })
                }
                className="w-full rounded-lg border border-slate-700 bg-[#121c2d] p-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {SCRIPT_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {STATUS_BADGES[st].label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Format Video</label>
              <select
                value={currentScript.videoFormat}
                onChange={(e) =>
                  setCurrentScript({ ...currentScript, videoFormat: e.target.value as VideoFormat })
                }
                className="w-full rounded-lg border border-slate-700 bg-[#121c2d] p-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {FORMATS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-[11px] text-slate-400">
              <div className="flex justify-between">
                <span>Jumlah Kata:</span>
                <span className="font-mono text-white font-semibold">{currentScript.wordCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimasi Durasi:</span>
                <span className="font-mono text-cyan-400 font-semibold">
                  ~{currentScript.estimatedDurationMinutes} Menit
                </span>
              </div>
              <div className="flex justify-between">
                <span>Kec. Bicara Standar:</span>
                <span className="font-mono text-slate-300">130 kata/mnt</span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                onClick={() => transferScriptToVoice(currentScript)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 py-2.5 text-xs font-semibold text-purple-300 transition-all active:scale-95"
              >
                <Volume2 className="h-4 w-4" />
                <span>Buka di Voice Studio</span>
              </button>

              <button
                type="button"
                onClick={() => setScriptToDelete(currentScript)}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-950/20 hover:bg-red-950/40 py-2 text-xs font-semibold text-red-400 hover:text-red-300 transition-all active:scale-95"
                title="Hapus naskah aktif saat ini agar tidak menumpuk"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Hapus Naskah Ini</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right 3 Columns: Main Editor + Refiner Tools */}
        <div className="lg:col-span-3 space-y-3">
          {/* Editor Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-800 bg-[#0e1624] p-3 text-xs">
            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={currentScript.title}
                onChange={(e) => setCurrentScript({ ...currentScript, title: e.target.value })}
                placeholder="Judul Naskah Video..."
                className="w-full bg-transparent font-bold text-white text-sm md:text-base focus:outline-none border-b border-transparent focus:border-cyan-500 pb-0.5"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopyScript}
                className="rounded-lg border border-slate-700 bg-slate-800/80 p-2 text-slate-300 hover:text-white"
                title="Salin Naskah"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={handleDownloadTxt}
                className="rounded-lg border border-slate-700 bg-slate-800/80 p-2 text-slate-300 hover:text-white"
                title="Unduh file .txt"
              >
                <Download className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setScriptToDelete(currentScript)}
                className="flex items-center gap-1.5 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/20 hover:border-red-500/60 hover:text-red-200 transition-colors"
                title="Hapus naskah aktif saat ini agar tidak menumpuk sampah"
              >
                <Trash2 className="h-3.5 w-3.5 text-red-400" />
                <span className="hidden sm:inline">Hapus Naskah</span>
              </button>

              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-3.5 py-1.5 font-semibold text-white shadow hover:brightness-110 active:scale-95"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Simpan Naskah</span>
              </button>
            </div>
          </div>

          {/* AI Section Refiner Toolbar */}
          <div className="rounded-xl border border-slate-800/80 bg-[#111928] p-3 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-cyan-400 flex items-center gap-1.5">
                <Wand2 className="h-3.5 w-3.5" />
                <span>AI Section Refiner (Poles Bagian Teks)</span>
              </span>
              <span className="text-[11px] text-slate-400">
                {selectedText
                  ? `"${selectedText.substring(0, 30)}..." (${selectedText.length} karakter dipilih)`
                  : 'Blok kalimat di naskah untuk memoles'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={refineAction}
                onChange={(e) => setRefineAction(e.target.value)}
                className="rounded-lg border border-slate-700 bg-[#162236] px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="improve-hook">Pertajam Hook (Bikin Penasaran)</option>
                <option value="simplify">Sederhanakan Penjelasan Teknis</option>
                <option value="expand">Perluas dengan Analogi & Contoh</option>
                <option value="shorten">Padatkan / Hapus Kalimat Bertele-tele</option>
                <option value="casual-tone">Ubah ke Nada Santai & Akrab</option>
                <option value="pro-tone">Ubah ke Nada Profesional / Jurnalis</option>
                <option value="fact-check-flag">Cek Potensi Celah / Riset Spesifikasi</option>
                <option value="custom">Instruksi Kustom Sendiri</option>
              </select>

              {refineAction === 'custom' && (
                <input
                  type="text"
                  value={customInstruction}
                  onChange={(e) => setCustomInstruction(e.target.value)}
                  placeholder="Instruksi kustom, misal: Tambahkan humor sarkas ringan..."
                  className="flex-1 min-w-[200px] rounded-lg border border-slate-700 bg-[#162236] px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              )}

              <button
                type="button"
                onClick={handleRefineSelectedText}
                disabled={refining || !selectedText}
                className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3.5 py-1.5 font-semibold text-white hover:bg-cyan-500 disabled:opacity-40 transition-all active:scale-95"
              >
                {refining ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Memoles...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Poles Bagian Terpilih</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Main Textarea */}
          <div className="relative">
            <textarea
              rows={22}
              value={currentScript.content}
              onChange={(e) => handleContentChange(e.target.value)}
              onSelect={handleTextareaSelect}
              placeholder="Tuliskan draf naskah video Anda di sini...&#10;Gunakan penanda seperti [HOOK], [INTRO], [PEMBAHASAN], [B-ROLL: footage HP], [KESIMPULAN], [CTA]..."
              className="w-full rounded-2xl border border-slate-800 bg-[#0c121e] p-5 font-mono text-xs md:text-sm text-slate-100 placeholder-slate-600 leading-relaxed focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all scrollbar-thin scrollbar-thumb-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Compare & Review Modal Before Applying Change */}
      {compareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl border border-slate-800 bg-[#0e1624] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                  <span>Tinjau Perubahan Naskah Sebelum Diterapkan</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Kreator pegang kendali: bandingkan teks asli dan usulan perbaikan AI
                </p>
              </div>
              <button
                onClick={() => setCompareModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                Batal
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Teks Asli */}
              <div className="space-y-1.5">
                <span className="font-semibold text-slate-400 block">Teks Asli Kreator:</span>
                <div className="rounded-xl border border-slate-800 bg-[#0a0f18] p-3 text-slate-300 max-h-60 overflow-y-auto whitespace-pre-wrap font-mono text-[11px] leading-relaxed">
                  {originalSelectedText}
                </div>
              </div>

              {/* Usulan AI */}
              <div className="space-y-1.5">
                <span className="font-semibold text-cyan-400 block">
                  Usulan Perbaikan ({refineAction}):
                </span>
                <div className="rounded-xl border border-cyan-900/60 bg-[#091522] p-3 text-cyan-100 max-h-60 overflow-y-auto whitespace-pre-wrap font-mono text-[11px] leading-relaxed">
                  {proposedText}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <p className="text-[11px] text-slate-500">
                Menerapkan perubahan hanya akan mengganti bagian teks yang dipilih.
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCompareModalOpen(false)}
                  className="rounded-lg border border-slate-700 px-3.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
                >
                  Tolak Perubahan
                </button>
                <button
                  type="button"
                  onClick={handleApplyReplacement}
                  className="rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-1.5 text-xs font-semibold text-white hover:brightness-110"
                >
                  Terapkan ke Naskah
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Script Confirmation Modal */}
      {scriptToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0e1624] p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-red-400" />
              <span>Hapus Naskah Tersimpan?</span>
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              Apakah Anda yakin ingin menghapus naskah{' '}
              <strong className="text-white">"{scriptToDelete.title || 'Tanpa Judul'}"</strong>?
              Naskah yang dihapus tidak dapat dipulihkan kembali.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setScriptToDelete(null)}
                className="rounded-lg border border-slate-700 px-3.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteScript}
                className="rounded-lg bg-red-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-red-500 transition-colors"
              >
                Ya, Hapus Naskah
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
