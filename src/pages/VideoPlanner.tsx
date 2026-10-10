import React, { useState, useEffect } from 'react';
import {
  Kanban,
  ListFilter,
  Plus,
  Search,
  Calendar,
  CalendarClock,
  CheckSquare,
  FileText,
  Image as ImageIcon,
  Edit3,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Clock,
  X,
  AlertCircle,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { VideoPlan, PlanStatus, VideoFormat, PlanChecklistItem } from '../types';

const STATUS_LIST: PlanStatus[] = [
  'Idea',
  'Planning',
  'In Production',
  'Editing',
  'Ready to Publish',
  'Published',
];

const STATUS_DETAILS: Record<
  PlanStatus,
  { label: string; bg: string; border: string; text: string; dot: string }
> = {
  Idea: {
    label: 'Ide Awal',
    bg: 'bg-slate-900/50',
    border: 'border-slate-800',
    text: 'text-slate-300',
    dot: 'bg-slate-400',
  },
  Planning: {
    label: 'Perencanaan',
    bg: 'bg-blue-950/20',
    border: 'border-blue-900/40',
    text: 'text-blue-300',
    dot: 'bg-blue-400',
  },
  'In Production': {
    label: 'Produksi / Syuting',
    bg: 'bg-amber-950/20',
    border: 'border-amber-900/40',
    text: 'text-amber-300',
    dot: 'bg-amber-400',
  },
  Editing: {
    label: 'Editing Video',
    bg: 'bg-purple-950/20',
    border: 'border-purple-900/40',
    text: 'text-purple-300',
    dot: 'bg-purple-400',
  },
  'Ready to Publish': {
    label: 'Siap Tayang',
    bg: 'bg-cyan-950/20',
    border: 'border-cyan-900/40',
    text: 'text-cyan-300',
    dot: 'bg-cyan-400',
  },
  Published: {
    label: 'Telah Dipublikasikan',
    bg: 'bg-emerald-950/20',
    border: 'border-emerald-900/40',
    text: 'text-emerald-300',
    dot: 'bg-emerald-400',
  },
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

export const VideoPlanner: React.FC = () => {
  const {
    plans,
    scripts,
    thumbnails,
    addOrUpdatePlan,
    removePlan,
    transferPlanToScript,
    transferPlanToThumbnail,
    transferPlanToSeo,
    pendingPlanInput,
    setPendingPlanInput,
    selectedPlanForDetail,
    setSelectedPlanForDetail,
    showToast,
  } = useApp();

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'targetDate' | 'title'>('updated');

  // Modal editor state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<VideoPlan | null>(null);

  // New checklist item buffer in modal
  const [newChecklistText, setNewChecklistText] = useState('');

  // Handle incoming pending plan from Ideas or Assistant
  useEffect(() => {
    if (pendingPlanInput) {
      const newPlan: VideoPlan = {
        id: 'plan-' + Date.now(),
        title: pendingPlanInput.title || 'Rencana Video Baru',
        topic: pendingPlanInput.topic || '',
        contentObjective: pendingPlanInput.contentObjective || 'Edukasi dan ulasan teknologi',
        targetAudience: pendingPlanInput.targetAudience || 'Penonton teknologi Indonesia',
        videoFormat: pendingPlanInput.videoFormat || 'Long-form YouTube',
        summary: pendingPlanInput.summary || '',
        hook: pendingPlanInput.hook || '',
        talkingPoints: pendingPlanInput.talkingPoints || [],
        researchNotes: pendingPlanInput.researchNotes || '',
        checklist: pendingPlanInput.checklist || [
          { id: 'chk-1', text: 'Riset spesifikasi & pengujian mandiri', done: false },
          { id: 'chk-2', text: 'Tulis naskah lengkap di Script Studio', done: false },
          { id: 'chk-3', text: 'Buat thumbnail CTR tinggi di Thumbnail Lab', done: false },
          { id: 'chk-4', text: 'Rekam footage B-roll & A-roll', done: false },
        ],
        status: (pendingPlanInput.status as PlanStatus) || 'Idea',
        targetDate: new Date(Date.now() + 3600000 * 24 * 7).toISOString().split('T')[0],
        personalNotes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setEditingPlan(newPlan);
      setIsModalOpen(true);
      setPendingPlanInput(null);
    }
  }, [pendingPlanInput, setPendingPlanInput]);

  // Handle selected plan detail from dashboard
  useEffect(() => {
    if (selectedPlanForDetail) {
      setEditingPlan(selectedPlanForDetail);
      setIsModalOpen(true);
      setSelectedPlanForDetail(null);
    }
  }, [selectedPlanForDetail, setSelectedPlanForDetail]);

  const handleCreateNew = () => {
    const blank: VideoPlan = {
      id: 'plan-' + Date.now(),
      title: '',
      topic: '',
      contentObjective: '',
      targetAudience: 'Penonton teknologi Indonesia',
      videoFormat: 'Long-form YouTube',
      summary: '',
      hook: '',
      talkingPoints: [],
      researchNotes: '',
      checklist: [
        { id: 'chk-1', text: 'Riset spesifikasi & verifikasi riil', done: false },
        { id: 'chk-2', text: 'Penyusunan naskah di Script Studio', done: false },
        { id: 'chk-3', text: 'Rancang konsep thumbnail di Thumbnail Lab', done: false },
        { id: 'chk-4', text: 'Syuting video & perekaman audio', done: false },
        { id: 'chk-5', text: 'Editing video & color grading', done: false },
      ],
      status: 'Idea',
      targetDate: new Date(Date.now() + 3600000 * 24 * 7).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEditingPlan(blank);
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan || !editingPlan.title.trim()) {
      showToast('Judul rencana video wajib diisi.', 'error');
      return;
    }
    addOrUpdatePlan(editingPlan);
    setIsModalOpen(false);
    setEditingPlan(null);
  };

  const handleStatusChange = (plan: VideoPlan, newStatus: PlanStatus) => {
    const updated = { ...plan, status: newStatus };
    addOrUpdatePlan(updated);
  };

  const handleToggleChecklist = (plan: VideoPlan, checkId: string) => {
    const updatedChecks = plan.checklist.map((item) =>
      item.id === checkId ? { ...item, done: !item.done } : item
    );
    addOrUpdatePlan({ ...plan, checklist: updatedChecks });
  };

  const handleAddChecklistModal = () => {
    if (!newChecklistText.trim() || !editingPlan) return;
    const item: PlanChecklistItem = {
      id: 'chk-' + Date.now(),
      text: newChecklistText.trim(),
      done: false,
    };
    setEditingPlan({
      ...editingPlan,
      checklist: [...editingPlan.checklist, item],
    });
    setNewChecklistText('');
  };

  const handleRemoveChecklistModal = (id: string) => {
    if (!editingPlan) return;
    setEditingPlan({
      ...editingPlan,
      checklist: editingPlan.checklist.filter((c) => c.id !== id),
    });
  };

  // Filter & Sort
  const filteredPlans = plans
    .filter((p) => {
      const matchSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.summary.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'updated') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      if (sortBy === 'targetDate') {
        return (a.targetDate || '').localeCompare(b.targetDate || '');
      }
      return a.title.localeCompare(b.title);
    });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Kanban className="h-4 w-4" />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
              Papan Perencana Konten Video
            </h2>
          </div>
          <p className="mt-1 text-xs md:text-sm text-slate-400">
            Kelola tahapan produksi video YouTube Anda dari tahap ide hingga rilis publik secara teratur.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/20 hover:brightness-110 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Buat Rencana Video</span>
        </button>
      </div>

      {/* Filter and View Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 rounded-xl border border-slate-800 bg-[#0e1624] p-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search */}
          <div className="relative min-w-[200px] flex-1 sm:flex-none">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari rencana video..."
              className="w-full rounded-lg border border-slate-700 bg-[#121c2d] py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-700 bg-[#121c2d] px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="all">Semua Status ({plans.length})</option>
            {STATUS_LIST.map((st) => (
              <option key={st} value={st}>
                {STATUS_DETAILS[st].label} ({plans.filter((p) => p.status === st).length})
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-lg border border-slate-700 bg-[#121c2d] px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="updated">Terakhir Diperbarui</option>
            <option value="targetDate">Target Tayang</option>
            <option value="title">Judul Video (A-Z)</option>
          </select>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 border border-slate-700 bg-[#121c2d] p-1 rounded-lg self-end md:self-auto">
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
              viewMode === 'kanban'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Kanban className="h-3.5 w-3.5" />
            <span>Papan Kanban</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
              viewMode === 'list'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ListFilter className="h-3.5 w-3.5" />
            <span>Daftar Rinci</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {filteredPlans.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-[#0e1624] p-12 text-center">
          <Layers className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-300">Tidak Ada Rencana Video Ditemukan</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'all'
              ? 'Coba sesuaikan kata kunci pencarian atau filter status Anda.'
              : 'Mulai buat perencanaan video teknologi pertama Anda dengan mengklik tombol di bawah.'}
          </p>
          <button
            onClick={handleCreateNew}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
          >
            <Plus className="h-4 w-4" />
            <span>Buat Rencana Video</span>
          </button>
        </div>
      ) : viewMode === 'kanban' ? (
        /* KANBAN BOARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 overflow-x-auto pb-4">
          {STATUS_LIST.map((colStatus) => {
            const conf = STATUS_DETAILS[colStatus];
            const colPlans = filteredPlans.filter((p) => p.status === colStatus);

            return (
              <div
                key={colStatus}
                className={`flex flex-col rounded-xl border ${conf.border} ${conf.bg} p-3 min-w-[240px]`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${conf.dot}`} />
                    <span className={`text-xs font-bold ${conf.text}`}>{conf.label}</span>
                  </div>
                  <span className="rounded-full bg-slate-800 px-1.5 py-0.2 text-[10px] font-mono text-slate-400">
                    {colPlans.length}
                  </span>
                </div>

                {/* Cards in Column */}
                <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[70vh] pr-0.5 scrollbar-thin scrollbar-thumb-slate-800">
                  {colPlans.map((plan) => {
                    const completed = plan.checklist.filter((c) => c.done).length;
                    const total = plan.checklist.length;
                    const linkedScript = scripts.find((s) => s.id === plan.linkedScriptId);
                    const linkedThumb = thumbnails.find((t) => t.id === plan.linkedThumbnailId);

                    return (
                      <div
                        key={plan.id}
                        className="group rounded-lg border border-slate-800 bg-[#0d1420] p-3 text-xs shadow transition-all hover:border-slate-700 hover:bg-[#111a2a]"
                      >
                        <div className="flex items-start justify-between gap-1.5 mb-1.5">
                          <span className="text-[10px] font-semibold text-cyan-400/90 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/40">
                            {plan.videoFormat}
                          </span>
                          <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setEditingPlan(plan);
                                setIsModalOpen(true);
                              }}
                              className="text-slate-400 hover:text-white p-0.5"
                              title="Edit"
                            >
                              <Edit3 className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => removePlan(plan.id)}
                              className="text-slate-400 hover:text-red-400 p-0.5"
                              title="Hapus"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        <h4
                          onClick={() => {
                            setEditingPlan(plan);
                            setIsModalOpen(true);
                          }}
                          className="font-bold text-slate-200 group-hover:text-cyan-300 transition-colors line-clamp-2 cursor-pointer hover:underline mb-1"
                        >
                          {plan.title}
                        </h4>

                        {plan.summary && (
                          <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">
                            {plan.summary}
                          </p>
                        )}

                        {/* Status selector directly on card */}
                        <div className="my-2">
                          <select
                            value={plan.status}
                            onChange={(e) => handleStatusChange(plan, e.target.value as PlanStatus)}
                            className="w-full rounded bg-[#152033] border border-slate-700/60 text-[10px] py-1 px-1.5 text-slate-300 focus:outline-none focus:border-cyan-500"
                          >
                            {STATUS_LIST.map((st) => (
                              <option key={st} value={st}>
                                Ubah status: {STATUS_DETAILS[st].label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Checklist info */}
                        {total > 0 && (
                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/70">
                            <span>Checklist ({completed}/{total})</span>
                            <div className="w-16 h-1 rounded-full bg-slate-800 overflow-hidden">
                              <div
                                className="h-full bg-cyan-400"
                                style={{ width: `${(completed / total) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Linked studio tools */}
                        <div className="mt-2.5 pt-2 border-t border-slate-800/80 grid grid-cols-3 gap-1 text-[10px]">
                          <button
                            onClick={() => transferPlanToScript(plan)}
                            className={`flex items-center justify-center gap-1 font-medium transition-colors p-1 rounded bg-[#121c2d] ${
                              linkedScript ? 'text-cyan-400' : 'text-slate-400 hover:text-cyan-300'
                            }`}
                            title="Buka atau buat naskah"
                          >
                            <FileText className="h-3 w-3" />
                            <span>{linkedScript ? 'Naskah' : '+ Naskah'}</span>
                          </button>

                          <button
                            onClick={() => transferPlanToThumbnail(plan)}
                            className={`flex items-center justify-center gap-1 font-medium transition-colors p-1 rounded bg-[#121c2d] ${
                              linkedThumb ? 'text-emerald-400' : 'text-slate-400 hover:text-emerald-300'
                            }`}
                            title="Buka atau buat thumbnail"
                          >
                            <ImageIcon className="h-3 w-3" />
                            <span>{linkedThumb ? 'Visual' : '+ Visual'}</span>
                          </button>

                          <button
                            onClick={() => transferPlanToSeo(plan)}
                            className={`flex items-center justify-center gap-1 font-medium transition-colors p-1 rounded bg-[#121c2d] ${
                              plan.linkedSeoId ? 'text-amber-400' : 'text-slate-400 hover:text-amber-300'
                            }`}
                            title="Buka SEO & Jadwal YouTube"
                          >
                            <CalendarClock className="h-3 w-3" />
                            <span>{plan.linkedSeoId ? 'SEO' : '+ SEO'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="space-y-3">
          {filteredPlans.map((plan) => {
            const conf = STATUS_DETAILS[plan.status];
            const completed = plan.checklist.filter((c) => c.done).length;
            const total = plan.checklist.length;

            return (
              <div
                key={plan.id}
                className="rounded-xl border border-slate-800 bg-[#0e1624] p-4 text-xs transition-all hover:border-slate-700 hover:bg-[#111b2b] flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold border ${conf.border} ${conf.text}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${conf.dot}`} />
                      {conf.label}
                    </span>
                    <span className="bg-slate-800 text-slate-400 rounded px-1.5 py-0.5 text-[10px]">
                      {plan.videoFormat}
                    </span>
                    {plan.targetDate && (
                      <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                        <Calendar className="h-3 w-3 text-slate-500" />
                        Target: {plan.targetDate}
                      </span>
                    )}
                  </div>

                  <h4
                    onClick={() => {
                      setEditingPlan(plan);
                      setIsModalOpen(true);
                    }}
                    className="text-sm font-bold text-white hover:text-cyan-300 cursor-pointer transition-colors hover:underline"
                  >
                    {plan.title}
                  </h4>

                  <p className="text-slate-400 line-clamp-1">{plan.summary || plan.topic}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right text-[11px] text-slate-400 hidden sm:block">
                    <div>Checklist: {completed}/{total}</div>
                    <div className="text-[10px] text-slate-500">
                      Diperbarui: {new Date(plan.updatedAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => transferPlanToScript(plan)}
                      className="rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-[11px] font-medium text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300"
                    >
                      <FileText className="h-3 w-3 inline mr-1" />
                      Naskah
                    </button>
                    <button
                      onClick={() => transferPlanToThumbnail(plan)}
                      className="rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-[11px] font-medium text-slate-300 hover:border-emerald-500/40 hover:text-emerald-300"
                    >
                      <ImageIcon className="h-3 w-3 inline mr-1" />
                      Thumbnail
                    </button>
                    <button
                      onClick={() => transferPlanToSeo(plan)}
                      className="rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-[11px] font-medium text-slate-300 hover:border-amber-500/40 hover:text-amber-300"
                    >
                      <CalendarClock className="h-3 w-3 inline mr-1" />
                      SEO
                    </button>
                    <button
                      onClick={() => {
                        setEditingPlan(plan);
                        setIsModalOpen(true);
                      }}
                      className="rounded-lg border border-slate-700 bg-slate-800/80 p-1.5 text-slate-300 hover:text-white"
                      title="Edit"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => removePlan(plan.id)}
                      className="rounded-lg border border-slate-700 bg-slate-800/80 p-1.5 text-slate-400 hover:text-red-400"
                      title="Hapus"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PLAN DETAIL & EDIT MODAL */}
      {isModalOpen && editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl border border-slate-800 bg-[#0d1422] p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  {editingPlan.title ? 'Detail & Edit Rencana Video' : 'Buat Rencana Video Baru'}
                </h3>
                <p className="text-xs text-slate-400">Atur seluruh variabel produksi dan checklist kerja</p>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingPlan(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Working Title */}
                <div className="md:col-span-2 space-y-1">
                  <label className="font-semibold text-slate-300">
                    Working Title (Judul Kerja) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingPlan.title}
                    onChange={(e) => setEditingPlan({ ...editingPlan, title: e.target.value })}
                    placeholder="Contoh: Review Jangka Panjang Laptop AI Snapdragon 2026"
                    className="w-full rounded-lg border border-slate-700 bg-[#121c2d] p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                {/* Topic */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Topik / Niche Utama</label>
                  <input
                    type="text"
                    value={editingPlan.topic}
                    onChange={(e) => setEditingPlan({ ...editingPlan, topic: e.target.value })}
                    placeholder="Contoh: Laptop ARM, Gadget Review"
                    className="w-full rounded-lg border border-slate-700 bg-[#121c2d] p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Format */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Format Video</label>
                  <select
                    value={editingPlan.videoFormat}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, videoFormat: e.target.value as VideoFormat })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-[#121c2d] p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    {FORMATS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Status Alur Kerja</label>
                  <select
                    value={editingPlan.status}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, status: e.target.value as PlanStatus })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-[#121c2d] p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    {STATUS_LIST.map((st) => (
                      <option key={st} value={st}>
                        {STATUS_DETAILS[st].label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Target Date */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Target Tanggal Tayang</label>
                  <input
                    type="date"
                    value={editingPlan.targetDate || ''}
                    onChange={(e) => setEditingPlan({ ...editingPlan, targetDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-[#121c2d] p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Hook & Summary */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Hook Pembuka (0-15 Detik)</label>
                <input
                  type="text"
                  value={editingPlan.hook}
                  onChange={(e) => setEditingPlan({ ...editingPlan, hook: e.target.value })}
                  placeholder="Kalimat pemantik rasa penasaran di awal video..."
                  className="w-full rounded-lg border border-slate-700 bg-[#121c2d] p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Ringkasan Konsep / Premis</label>
                <textarea
                  rows={2}
                  value={editingPlan.summary}
                  onChange={(e) => setEditingPlan({ ...editingPlan, summary: e.target.value })}
                  placeholder="Ceritakan gambaran besar apa yang dibahas dalam video ini..."
                  className="w-full rounded-lg border border-slate-700 bg-[#121c2d] p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Research Notes */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">
                  Catatan Riset & Verifikasi Spesifikasi
                </label>
                <textarea
                  rows={2}
                  value={editingPlan.researchNotes}
                  onChange={(e) =>
                    setEditingPlan({ ...editingPlan, researchNotes: e.target.value })
                  }
                  placeholder="Tuliskan data uji benchmark, klaim brand yang perlu diverifikasi, link acuan..."
                  className="w-full rounded-lg border border-slate-700 bg-[#121c2d] p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Checklist Section */}
              <div className="rounded-xl border border-slate-800 bg-[#101726] p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <CheckSquare className="h-4 w-4 text-cyan-400" />
                    <span>Checklist Produksi Video</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {editingPlan.checklist.filter((c) => c.done).length} dari{' '}
                    {editingPlan.checklist.length} selesai
                  </span>
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {editingPlan.checklist.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-2 rounded-lg bg-[#141e30] px-3 py-1.5 border border-slate-800"
                    >
                      <label className="flex items-center gap-2 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={item.done}
                          onChange={() => {
                            const updated = editingPlan.checklist.map((c) =>
                              c.id === item.id ? { ...c, done: !c.done } : c
                            );
                            setEditingPlan({ ...editingPlan, checklist: updated });
                          }}
                          className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                        />
                        <span
                          className={`text-xs ${
                            item.done ? 'line-through text-slate-500' : 'text-slate-200'
                          }`}
                        >
                          {item.text}
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemoveChecklistModal(item.id)}
                        className="text-slate-500 hover:text-red-400"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newChecklistText}
                    onChange={(e) => setNewChecklistText(e.target.value)}
                    placeholder="Tambah item checklist (misal: Rekam audio VO, Siapkan props)..."
                    className="flex-1 rounded-lg border border-slate-700 bg-[#141e30] px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddChecklistModal();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddChecklistModal}
                    className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700"
                  >
                    + Tambah
                  </button>
                </div>
              </div>

              {/* Personal Notes */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Catatan Pribadi Kreator</label>
                <textarea
                  rows={2}
                  value={editingPlan.personalNotes || ''}
                  onChange={(e) =>
                    setEditingPlan({ ...editingPlan, personalNotes: e.target.value })
                  }
                  placeholder="Catatan tambahan untuk tim atau diri sendiri..."
                  className="w-full rounded-lg border border-slate-700 bg-[#121c2d] p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Modal footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Hapus rencana video ini?')) {
                      removePlan(editingPlan.id);
                      setIsModalOpen(false);
                      setEditingPlan(null);
                    }
                  }}
                  className="text-red-400 hover:text-red-300 font-medium text-xs flex items-center gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Hapus Rencana</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingPlan(null);
                    }}
                    className="rounded-lg border border-slate-700 px-3 py-1.5 text-slate-300 hover:bg-slate-800"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-1.5 font-semibold text-white hover:brightness-110"
                  >
                    Simpan Rencana
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
