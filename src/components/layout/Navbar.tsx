import React from 'react';
import { Menu, Sparkles, Radio, ShieldCheck, HelpCircle } from 'lucide-react';
import { useApp, NavTab } from '../../context/AppContext';

interface NavbarProps {
  onToggleMobile: () => void;
  onOpenQuickAction: () => void;
}

const TAB_TITLES: Record<NavTab, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard Kreator', subtitle: 'Ringkasan produktivitas dan proyek konten aktif Revisitekno' },
  assistant: { title: 'AI Assistant', subtitle: 'Konsultasi ide, sudut pandang konten, dan optimasi naskah video' },
  ideas: { title: 'Idea Generator', subtitle: 'Eksplorasi konsep video teknologi berbasis audiens dan format' },
  planner: { title: 'Video Planner', subtitle: 'Papan manajemen produksi video dari tahap ide hingga siap tayang' },
  scripts: { title: 'Script Studio', subtitle: 'Penyusunan naskah video terstruktur dengan pemoles AI interaktif' },
  voice: { title: 'Voice Studio', subtitle: 'Sintesis suara narator Bahasa Indonesia berbasis Gemini TTS' },
  thumbnails: { title: 'Thumbnail Lab', subtitle: 'Rancangan visual thumbnail CTR tinggi dengan rasio 16:9' },
  seo: { title: 'YouTube SEO & Scheduler', subtitle: 'Optimasi hashtag, tag 500 karakter, deskripsi, judul CTR tinggi, dan rekomendasi waktu tayang' },
  library: { title: 'Content Library', subtitle: 'Pustaka arsip seluruh ide, rencana, naskah, dan konsep Anda' },
  settings: { title: 'Pengaturan & Integrasi', subtitle: 'Profil channel Revisitekno, preferensi, dan status API' },
};

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobile, onOpenQuickAction }) => {
  const { activeTab, apiStatus, setActiveTab } = useApp();
  const current = TAB_TITLES[activeTab] || { title: 'Workspace', subtitle: '' };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#1e293b] bg-[#0b0f17]/90 px-4 backdrop-blur-md">
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobile}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700/60 bg-[#151d2a] text-slate-300 md:hidden hover:text-white"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-sm md:text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>{current.title}</span>
            <span className="hidden sm:inline-block rounded bg-cyan-950/60 border border-cyan-800/40 text-[10px] font-mono px-1.5 py-0.5 text-cyan-400">
              V1.2
            </span>
          </h1>
          <p className="hidden md:block text-xs text-slate-400">{current.subtitle}</p>
        </div>
      </div>

      {/* Right: API status badge & Quick Action */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium border transition-colors ${
            apiStatus?.hasApiKey
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400 hover:border-emerald-700'
              : 'bg-amber-950/40 border-amber-800/60 text-amber-300 hover:border-amber-700'
          }`}
          title={
            apiStatus?.hasApiKey
              ? 'Gemini API aktif di server'
              : 'GEMINI_API_KEY belum dikonfigurasi di secrets'
          }
        >
          <Radio className="h-3 w-3 animate-pulse" />
          <span className="hidden xs:inline">
            {apiStatus?.hasApiKey ? 'Gemini 3.8 Aktif' : 'Konfigurasi API'}
          </span>
        </button>

        <button
          onClick={onOpenQuickAction}
          className="flex items-center gap-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-3 py-1.5 text-xs font-semibold transition-all active:scale-95"
        >
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Aksi Cepat</span>
          <span className="sm:hidden">+</span>
        </button>
      </div>
    </header>
  );
};
