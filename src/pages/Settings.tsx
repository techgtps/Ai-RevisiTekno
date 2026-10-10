import React, { useState } from 'react';
import {
  Settings,
  Sliders,
  Radio,
  CheckCircle2,
  AlertCircle,
  Database,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  Volume2,
  Save,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ChannelProfile, AppSettings, VideoFormat } from '../types';

const FORMAT_OPTIONS: VideoFormat[] = [
  'Long-form YouTube',
  'Review & Hands-on',
  'Perbandingan (VS)',
  'Tutorial & How-to',
  'Explainer & Analisis',
  'YouTube Shorts',
  'Storytelling & Tech History',
];

export const SettingsPage: React.FC = () => {
  const {
    channelProfile,
    updateChannelProfile,
    appSettings,
    updateAppSettings,
    apiStatus,
    refreshApiStatus,
    exportWorkspace,
    importWorkspace,
    resetWorkspace,
    showToast,
  } = useApp();

  const [profileForm, setProfileForm] = useState<ChannelProfile>(channelProfile);
  const [settingsForm, setSettingsForm] = useState<AppSettings>(appSettings);
  const [refreshingStatus, setRefreshingStatus] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateChannelProfile(profileForm);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateAppSettings(settingsForm);
  };

  const handleToggleFormat = (fmt: VideoFormat) => {
    const current = profileForm.preferredFormats || [];
    if (current.includes(fmt)) {
      setProfileForm({
        ...profileForm,
        preferredFormats: current.filter((f) => f !== fmt),
      });
    } else {
      setProfileForm({
        ...profileForm,
        preferredFormats: [...current, fmt],
      });
    }
  };

  const handleCheckApiAgain = async () => {
    setRefreshingStatus(true);
    await refreshApiStatus();
    setRefreshingStatus(false);
    showToast('Status koneksi server diperbarui.', 'info');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importWorkspace(file);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto p-4 md:p-6 text-slate-100">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-5">
        <div className="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
            Pengaturan & Integrasi Workspace
          </h2>
          <p className="text-xs text-slate-400">
            Kelola profil channel Revisitekno, parameter asisten AI, dan pencadangan data lokal.
          </p>
        </div>
      </div>

      {/* SECTION 1: INTEGRATION STATUS */}
      <div className="rounded-2xl border border-slate-800 bg-[#0e1624] p-5 md:p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Radio className="h-4 w-4 text-cyan-400" />
            <span>Status Integrasi Provider & Penyimpanan</span>
          </h3>

          <button
            onClick={handleCheckApiAgain}
            disabled={refreshingStatus}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${refreshingStatus ? 'animate-spin' : ''}`} />
            <span>Periksa Ulang</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Gemini AI Status */}
          <div
            className={`rounded-xl border p-4 space-y-2 ${
              apiStatus?.hasApiKey
                ? 'border-emerald-500/30 bg-[#0b1a16]'
                : 'border-amber-500/30 bg-[#1c150c]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200">Gemini 3.8 Flash (AI Teks)</span>
              {apiStatus?.hasApiKey ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-400" />
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              {apiStatus?.hasApiKey
                ? 'Terhubung aman via environment server Google AI Studio.'
                : 'GEMINI_API_KEY belum terdeteksi di server environment.'}
            </p>
          </div>

          {/* Gemini TTS Status */}
          <div
            className={`rounded-xl border p-4 space-y-2 ${
              apiStatus?.hasApiKey
                ? 'border-purple-500/30 bg-[#131124]'
                : 'border-slate-800 bg-[#0c121e]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200">Voice Studio (TTS)</span>
              <Volume2 className="h-4 w-4 text-purple-400" />
            </div>
            <p className="text-[11px] text-slate-400">
              gemini-3.8-flash-lite-tts • Suara: Kore, Puck, Fenrir, Zephyr, Charon.
            </p>
          </div>

          {/* Storage Status */}
          <div className="rounded-xl border border-cyan-500/30 bg-[#0c1826] p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200">Penyimpanan Workspace</span>
              <Database className="h-4 w-4 text-cyan-400" />
            </div>
            <p className="text-[11px] text-slate-400">
              Penyimpanan Browser Lokal (LocalStorage v1.2) dengan fitur Ekspor/Impor JSON aman.
            </p>
          </div>
        </div>

        {/* AI Key Instructions */}
        {!apiStatus?.hasApiKey && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-4 text-xs text-amber-200 space-y-1.5">
            <div className="font-semibold text-amber-300">Cara Mengaktifkan Fitur AI:</div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Kunci API tidak pernah diminta atau disimpan di browser kode publik. Konfigurasikan
              variabel rahasia <code>GEMINI_API_KEY</code> di panel <strong>Settings &gt; Secrets</strong> pada antarmuka Google AI Studio. Server akan mendeteksinya secara otomatis tanpa perlu mengubah baris kode.
            </p>
          </div>
        )}
      </div>

      {/* SECTION 2: CHANNEL PROFILE */}
      <form
        onSubmit={handleSaveProfile}
        className="rounded-2xl border border-slate-800 bg-[#0e1624] p-5 md:p-6 space-y-5 shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span>Profil Kreator & Identitas Channel YouTube</span>
            </h3>
            <p className="text-xs text-slate-400">
              Informasi ini dijadikan konteks otomatis bagi asisten AI saat brainstorming ide dan naskah.
            </p>
          </div>

          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2 text-xs font-semibold text-white shadow hover:brightness-110 active:scale-95"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Simpan Profil</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Nama Channel YouTube</label>
            <input
              type="text"
              value={profileForm.channelName}
              onChange={(e) => setProfileForm({ ...profileForm, channelName: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-[#121c2d] p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Bahasa Utama Konten</label>
            <input
              type="text"
              value={profileForm.preferredLanguage}
              onChange={(e) => setProfileForm({ ...profileForm, preferredLanguage: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-[#121c2d] p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="md:col-span-2 space-y-1">
            <label className="font-semibold text-slate-300">Niche & Fokus Konten</label>
            <input
              type="text"
              value={profileForm.niche}
              onChange={(e) => setProfileForm({ ...profileForm, niche: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-[#121c2d] p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="md:col-span-2 space-y-1">
            <label className="font-semibold text-slate-300">Target Audiens</label>
            <input
              type="text"
              value={profileForm.targetAudience}
              onChange={(e) => setProfileForm({ ...profileForm, targetAudience: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-[#121c2d] p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="md:col-span-2 space-y-1">
            <label className="font-semibold text-slate-300">Tujuan Konten Channel</label>
            <input
              type="text"
              value={profileForm.contentObjective}
              onChange={(e) => setProfileForm({ ...profileForm, contentObjective: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-[#121c2d] p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Formats checkboxes */}
          <div className="md:col-span-2 space-y-2">
            <label className="font-semibold text-slate-300 block">
              Format Video Favorit Channel
            </label>
            <div className="flex flex-wrap gap-2">
              {FORMAT_OPTIONS.map((fmt) => {
                const active = profileForm.preferredFormats?.includes(fmt);
                return (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => handleToggleFormat(fmt)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${
                      active
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-[#121c2d] text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {fmt}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="md:col-span-2 space-y-1">
            <label className="font-semibold text-slate-300">
              Instruksi Penulisan Khas Kreator (Persona)
            </label>
            <textarea
              rows={3}
              value={profileForm.creatorGuidelines}
              onChange={(e) =>
                setProfileForm({ ...profileForm, creatorGuidelines: e.target.value })
              }
              placeholder="Contoh: Fokus pada pengalaman pakai harian, jangan gunakan istilah teknis tanpa penjelasan..."
              className="w-full rounded-xl border border-slate-700 bg-[#121c2d] p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </form>

      {/* SECTION 3: APPLICATION PREFERENCES */}
      <form
        onSubmit={handleSaveSettings}
        className="rounded-2xl border border-slate-800 bg-[#0e1624] p-5 md:p-6 space-y-4 shadow-xl text-xs"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="h-4 w-4 text-cyan-400" />
            <span>Preferensi Workspace & Voice Studio</span>
          </h3>

          <button
            type="submit"
            className="rounded-xl bg-slate-800 px-4 py-1.5 font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
          >
            Simpan Preferensi
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Format Default Ide/Plan</label>
            <select
              value={settingsForm.defaultFormat}
              onChange={(e) =>
                setSettingsForm({ ...settingsForm, defaultFormat: e.target.value as VideoFormat })
              }
              className="w-full rounded-xl border border-slate-700 bg-[#121c2d] p-2.5 text-white focus:outline-none focus:border-cyan-500"
            >
              {FORMAT_OPTIONS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Mode Default Voice Studio</label>
            <select
              value={settingsForm.defaultVoiceMode}
              onChange={(e) =>
                setSettingsForm({ ...settingsForm, defaultVoiceMode: e.target.value as any })
              }
              className="w-full rounded-xl border border-slate-700 bg-[#121c2d] p-2.5 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="simple">Mode Standar (Cepat)</option>
              <option value="pro">Pro Mode (Chunking Naskah Panjang)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Karakter Suara Utama</label>
            <select
              value={settingsForm.defaultVoice}
              onChange={(e) => setSettingsForm({ ...settingsForm, defaultVoice: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-[#121c2d] p-2.5 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="Kore">Kore (Hangat, Jernih)</option>
              <option value="Puck">Puck (Energik, Muda)</option>
              <option value="Fenrir">Fenrir (Berat, Otoritatif)</option>
              <option value="Zephyr">Zephyr (Cepat, Santai)</option>
              <option value="Charon">Charon (Formal, Dokumenter)</option>
            </select>
          </div>
        </div>
      </form>

      {/* SECTION 4: DATA MANAGEMENT */}
      <div className="rounded-2xl border border-slate-800 bg-[#0e1624] p-5 md:p-6 space-y-4 shadow-xl text-xs">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Database className="h-4 w-4 text-cyan-400" />
          <span>Manajemen Pencadangan & Reset Data</span>
        </h3>

        <p className="text-slate-400 leading-relaxed text-[11px]">
          Data Anda disimpan secara persisten di penyimpanan browser lokal. Kami menyarankan untuk secara berkala mengunduh berkas pencadangan JSON agar rencana konten Anda tetap aman.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={exportWorkspace}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2.5 font-semibold text-white shadow hover:brightness-110 active:scale-95"
          >
            <Download className="h-4 w-4" />
            <span>Ekspor & Cadangkan JSON</span>
          </button>

          <label className="flex items-center gap-2 rounded-xl border border-slate-700 bg-[#141e30] px-4 py-2.5 font-semibold text-slate-200 hover:bg-[#1a2840] cursor-pointer">
            <Upload className="h-4 w-4" />
            <span>Pulihkan dari File JSON</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={() => {
              if (
                window.confirm(
                  'PERINGATAN: Apakah Anda yakin ingin mereset seluruh data kembali ke contoh awal Revisitekno? Semua ide dan rencana yang belum diekspor akan terhapus.'
                )
              ) {
                resetWorkspace();
              }
            }}
            className="flex items-center gap-2 rounded-xl border border-red-900/60 bg-red-950/20 px-4 py-2.5 font-semibold text-red-300 hover:bg-red-950/40"
          >
            <RotateCcw className="h-4 w-4 text-red-400" />
            <span>Reset ke Data Awal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
