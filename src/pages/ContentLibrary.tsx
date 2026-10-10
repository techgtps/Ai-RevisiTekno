import React, { useState } from 'react';
import {
  FolderArchive,
  Search,
  Filter,
  Lightbulb,
  Kanban,
  FileText,
  Image as ImageIcon,
  Trash2,
  Edit3,
  ExternalLink,
  Download,
  Upload,
  RefreshCw,
  Layers,
  ArrowRight,
  Calendar,
  CalendarClock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { VideoIdea, VideoPlan, ScriptItem, ThumbnailConcept } from '../types';

type FilterType = 'all' | 'ideas' | 'plans' | 'scripts' | 'thumbnails' | 'seo';

export const ContentLibrary: React.FC = () => {
  const {
    ideas,
    plans,
    scripts,
    thumbnails,
    seoPackages,
    removeIdea,
    removePlan,
    removeScript,
    removeThumbnail,
    removeSeoPackage,
    transferIdeaToPlan,
    transferPlanToScript,
    transferPlanToThumbnail,
    transferScriptToVoice,
    setSelectedPlanForDetail,
    setSelectedScriptForEdit,
    setActiveTab,
    exportWorkspace,
    importWorkspace,
    showToast,
  } = useApp();

  const [filterType, setFilterType] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');

  // Deletion Confirmation modal state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    type: 'idea' | 'plan' | 'script' | 'thumbnail' | 'seo';
    title: string;
  } | null>(null);

  const handleConfirmDelete = () => {
    if (!deleteConfirm) return;
    const { id, type } = deleteConfirm;
    if (type === 'idea') removeIdea(id);
    else if (type === 'plan') removePlan(id);
    else if (type === 'script') removeScript(id);
    else if (type === 'thumbnail') removeThumbnail(id);
    else if (type === 'seo') removeSeoPackage(id);

    setDeleteConfirm(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importWorkspace(file);
    }
  };

  // Compile unified items list
  interface UnifiedItem {
    id: string;
    type: 'idea' | 'plan' | 'script' | 'thumbnail' | 'seo';
    title: string;
    summary: string;
    date: string;
    badge: string;
    badgeColor: string;
    original: any;
  }

  const allItems: UnifiedItem[] = [];

  if (filterType === 'all' || filterType === 'ideas') {
    ideas.forEach((i) =>
      allItems.push({
        id: i.id,
        type: 'idea',
        title: i.title,
        summary: i.coreConcept,
        date: i.updatedAt,
        badge: 'Ide Video',
        badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
        original: i,
      })
    );
  }

  if (filterType === 'all' || filterType === 'plans') {
    plans.forEach((p) =>
      allItems.push({
        id: p.id,
        type: 'plan',
        title: p.title,
        summary: p.summary || p.topic,
        date: p.updatedAt,
        badge: `Rencana: ${p.status}`,
        badgeColor: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
        original: p,
      })
    );
  }

  if (filterType === 'all' || filterType === 'scripts') {
    scripts.forEach((s) =>
      allItems.push({
        id: s.id,
        type: 'script',
        title: s.title,
        summary: `${s.wordCount} kata • Estimasi ~${s.estimatedDurationMinutes} mnt • ${s.status}`,
        date: s.updatedAt,
        badge: `Naskah: ${s.status}`,
        badgeColor: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
        original: s,
      })
    );
  }

  if (filterType === 'all' || filterType === 'thumbnails') {
    thumbnails.forEach((t) =>
      allItems.push({
        id: t.id,
        type: 'thumbnail',
        title: t.conceptName || t.title,
        summary: `Teks Overlay: "${t.textOverlay}" • Komposisi: ${t.composition}`,
        date: t.updatedAt,
        badge: 'Konsep Thumbnail',
        badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
        original: t,
      })
    );
  }

  if (filterType === 'all' || filterType === 'seo') {
    seoPackages.forEach((s) =>
      allItems.push({
        id: s.id,
        type: 'seo',
        title: s.selectedTitle || s.videoTitle,
        summary: `Fokus: ${s.mainKeyword} • ${s.hashtags?.length || 0} Hashtag • ${s.tags?.length || 0} Tag (${s.tagCharactersCount} Karakter) • Jadwal: ${s.recommendedSchedule?.dayOfWeek || 'Estimasi'}`,
        date: s.updatedAt,
        badge: 'SEO & Jadwal',
        badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
        original: s,
      })
    );
  }

  // Filter & Sort
  const filtered = allItems
    .filter((item) => {
      const q = searchQuery.toLowerCase();
      return item.title.toLowerCase().includes(q) || item.summary.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
      return a.title.localeCompare(b.title);
    });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FolderArchive className="h-4 w-4" />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
              Pustaka Konten Terpusat (Content Library)
            </h2>
          </div>
          <p className="mt-1 text-xs md:text-sm text-slate-400">
            Arsip terpadu seluruh ide, rencana video, naskah, dan thumbnail dalam penyimpanan lokal browser.
          </p>
        </div>

        {/* Backup & Restore Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <label className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-[#121c2d] px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-[#18263e] hover:text-white cursor-pointer transition-colors">
            <Upload className="h-3.5 w-3.5" />
            <span>Impor JSON</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={exportWorkspace}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-cyan-500/10 hover:brightness-110 active:scale-95 transition-all"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Cadangkan JSON</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 rounded-xl border border-slate-800 bg-[#0e1624] p-3 text-xs">
        {/* Search Input */}
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari naskah, rencana, konsep..."
            className="w-full rounded-lg border border-slate-700 bg-[#121c2d] py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Type Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: `Semua (${ideas.length + plans.length + scripts.length + thumbnails.length + seoPackages.length})` },
            { id: 'ideas', label: `Ide (${ideas.length})` },
            { id: 'plans', label: `Rencana (${plans.length})` },
            { id: 'scripts', label: `Naskah (${scripts.length})` },
            { id: 'thumbnails', label: `Thumbnail (${thumbnails.length})` },
            { id: 'seo', label: `SEO & Jadwal (${seoPackages.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as FilterType)}
              className={`rounded-lg px-2.5 py-1.5 font-medium transition-colors ${
                filterType === tab.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-[#121c2d] text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sort Select */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="rounded-lg border border-slate-700 bg-[#121c2d] px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 self-end md:self-auto"
        >
          <option value="newest">Terbaru Diperbarui</option>
          <option value="oldest">Paling Lama</option>
          <option value="title">Judul (A-Z)</option>
        </select>
      </div>

      {/* Items List */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-[#0e1624] p-12 text-center text-xs text-slate-500">
          <Layers className="h-8 w-8 text-slate-600 mx-auto mb-2" />
          <span>Tidak ada berkas yang sesuai dengan kriteria filter saat ini.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-[#0e1624] p-4 text-xs transition-all hover:border-slate-700 hover:bg-[#121d2f] shadow-sm"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(item.date).toLocaleDateString()}
                  </span>
                </div>

                <h4 className="font-bold text-white text-sm line-clamp-2 leading-snug">
                  {item.title}
                </h4>

                <p className="text-slate-400 line-clamp-3 leading-relaxed text-[11px]">
                  {item.summary}
                </p>
              </div>

              {/* Action Toolbar */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {item.type === 'idea' && (
                    <button
                      onClick={() => transferIdeaToPlan(item.original)}
                      className="text-blue-400 hover:text-blue-300 font-semibold text-[11px] flex items-center gap-1"
                    >
                      <Kanban className="h-3 w-3" />
                      <span>Ke Planner</span>
                    </button>
                  )}

                  {item.type === 'plan' && (
                    <button
                      onClick={() => {
                        setSelectedPlanForDetail(item.original);
                        setActiveTab('planner');
                      }}
                      className="text-cyan-400 hover:text-cyan-300 font-semibold text-[11px] flex items-center gap-1"
                    >
                      <Edit3 className="h-3 w-3" />
                      <span>Buka Plan</span>
                    </button>
                  )}

                  {item.type === 'script' && (
                    <button
                      onClick={() => {
                        setSelectedScriptForEdit(item.original);
                        setActiveTab('scripts');
                      }}
                      className="text-cyan-400 hover:text-cyan-300 font-semibold text-[11px] flex items-center gap-1"
                    >
                      <Edit3 className="h-3 w-3" />
                      <span>Edit Naskah</span>
                    </button>
                  )}

                  {item.type === 'thumbnail' && (
                    <button
                      onClick={() => {
                        setActiveTab('thumbnails');
                      }}
                      className="text-emerald-400 hover:text-emerald-300 font-semibold text-[11px] flex items-center gap-1"
                    >
                      <ImageIcon className="h-3 w-3" />
                      <span>Buka Lab</span>
                    </button>
                  )}

                  {item.type === 'seo' && (
                    <button
                      onClick={() => {
                        setActiveTab('seo');
                      }}
                      className="text-amber-400 hover:text-amber-300 font-semibold text-[11px] flex items-center gap-1"
                    >
                      <CalendarClock className="h-3 w-3" />
                      <span>Buka SEO</span>
                    </button>
                  )}
                </div>

                <button
                  onClick={() =>
                    setDeleteConfirm({
                      id: item.id,
                      type: item.type,
                      title: item.title,
                    })
                  }
                  className="rounded-lg p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                  title="Hapus"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Safety Confirmation Modal for Deletion */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0e1624] p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-red-400" />
              <span>Konfirmasi Penghapusan Item</span>
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              Apakah Anda yakin ingin menghapus{' '}
              <strong className="text-white">"{deleteConfirm.title}"</strong>?
              Tindakan ini tidak dapat dibatalkan, namun item lain yang terhubung tidak akan terhapus.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="rounded-lg border border-slate-700 px-3.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="rounded-lg bg-red-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-red-500"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
