import React from 'react';
import {
  Lightbulb,
  Kanban,
  FileText,
  Image as ImageIcon,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  PlayCircle,
  Plus,
  Volume2,
  Calendar,
  CalendarClock,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PlanStatus } from '../types';

interface DashboardProps {
  onOpenQuickAction: () => void;
}

const STATUS_CONFIG: Record<PlanStatus, { label: string; color: string; badge: string }> = {
  Idea: { label: 'Ide Awal', color: 'bg-slate-500/10 border-slate-500/30 text-slate-300', badge: 'bg-slate-500' },
  Planning: { label: 'Perencanaan', color: 'bg-blue-500/10 border-blue-500/30 text-blue-300', badge: 'bg-blue-500' },
  'In Production': { label: 'Produksi / Syuting', color: 'bg-amber-500/10 border-amber-500/30 text-amber-300', badge: 'bg-amber-500' },
  Editing: { label: 'Editing Video', color: 'bg-purple-500/10 border-purple-500/30 text-purple-300', badge: 'bg-purple-500' },
  'Ready to Publish': { label: 'Siap Rilis', color: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300', badge: 'bg-cyan-500' },
  Published: { label: 'Telah Tayang', color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300', badge: 'bg-emerald-500' },
};

export const Dashboard: React.FC<DashboardProps> = ({ onOpenQuickAction }) => {
  const {
    ideas,
    plans,
    scripts,
    thumbnails,
    seoPackages,
    activities,
    channelProfile,
    setActiveTab,
    transferPlanToScript,
    transferPlanToThumbnail,
    setSelectedPlanForDetail,
  } = useApp();

  const ongoingPlans = plans.filter((p) => p.status !== 'Published');
  const recentPlans = [...plans].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  ).slice(0, 4);

  const stats = [
    {
      title: 'Ide Tersimpan',
      count: ideas.length,
      icon: Lightbulb,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      tab: 'ideas' as const,
    },
    {
      title: 'Rencana Video',
      count: plans.length,
      icon: Kanban,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
      tab: 'planner' as const,
    },
    {
      title: 'Naskah / Script',
      count: scripts.length,
      icon: FileText,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/20',
      tab: 'scripts' as const,
    },
    {
      title: 'Konsep Thumbnail',
      count: thumbnails.length,
      icon: ImageIcon,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      tab: 'thumbnails' as const,
    },
    {
      title: 'SEO & Jadwal',
      count: seoPackages.length,
      icon: CalendarClock,
      color: 'text-amber-300',
      bg: 'bg-amber-500/10 border-amber-500/20',
      tab: 'seo' as const,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-slate-100">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-[#1e293b] bg-gradient-to-r from-[#0d1624] via-[#111c30] to-[#0c1422] p-5 md:p-7 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 text-xs font-semibold text-cyan-400 mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Workspace YouTube {channelProfile.channelName}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Selamat berkarya, Tim {channelProfile.channelName}!
            </h2>
            <p className="mt-1.5 text-xs md:text-sm text-slate-300 leading-relaxed">
              Kreator pegang kendali riset, opini, dan keputusan akhir. Revisitekno AI siap membantu percepat pembuatan draf ide, naskah, sintesis suara, hingga perencanaan visual.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('ideas')}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-cyan-500/20 hover:brightness-110 active:scale-95 transition-all"
            >
              <Lightbulb className="h-4 w-4" />
              <span>Hasilkan Ide Baru</span>
            </button>
            <button
              onClick={onOpenQuickAction}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-[#162030] px-3.5 py-2.5 text-xs font-semibold text-slate-200 hover:bg-[#1c293e] hover:text-white transition-all"
            >
              <Plus className="h-4 w-4 text-cyan-400" />
              <span>Aksi Cepat</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real Application Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <button
              key={idx}
              onClick={() => setActiveTab(s.tab)}
              className="group flex flex-col justify-between rounded-xl border border-slate-800/90 bg-[#0f1624] p-4 text-left transition-all hover:border-cyan-500/40 hover:bg-[#131d2e] shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400 group-hover:text-slate-300">
                  {s.title}
                </span>
                <div className={`rounded-lg p-2 border ${s.bg}`}>
                  <Icon className={`h-4 w-4 ${s.color}`} />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl md:text-3xl font-extrabold text-white font-mono tracking-tight">
                  {s.count}
                </span>
                <span className="text-[11px] text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                  Buka <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Two-Column Layout: Ongoing Plans & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Ongoing Video Plans Overview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Kanban className="h-5 w-5 text-blue-400" />
              <h3 className="text-sm md:text-base font-bold text-white">
                Proyek Video Berjalan ({ongoingPlans.length})
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('planner')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>Buka Video Planner</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {recentPlans.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-800 bg-[#0e1522] p-8 text-center">
              <Layers className="h-8 w-8 text-slate-600 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-slate-300">Belum Ada Rencana Video</h4>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                Mulai susun rencana video teknologi pertama Anda dengan checklist dan alur produksi.
              </p>
              <button
                onClick={() => setActiveTab('planner')}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-500"
              >
                <Plus className="h-4 w-4" />
                <span>Buat Rencana Video Pertama</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPlans.map((plan) => {
                const statusConf = STATUS_CONFIG[plan.status];
                const completedChecks = plan.checklist.filter((c) => c.done).length;
                const totalChecks = plan.checklist.length;
                const progressPct =
                  totalChecks > 0 ? Math.round((completedChecks / totalChecks) * 100) : 0;

                return (
                  <div
                    key={plan.id}
                    className="group rounded-xl border border-slate-800/80 bg-[#0e1624] p-4 transition-all hover:border-slate-700 hover:bg-[#121c2d]"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold border ${statusConf.color}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${statusConf.badge}`} />
                            {statusConf.label}
                          </span>
                          <span className="text-[11px] text-slate-400 bg-slate-800/60 rounded px-1.5 py-0.5 font-medium">
                            {plan.videoFormat}
                          </span>
                          {plan.targetDate && (
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-slate-500" />
                              Target: {plan.targetDate}
                            </span>
                          )}
                        </div>
                        <h4
                          onClick={() => {
                            setSelectedPlanForDetail(plan);
                            setActiveTab('planner');
                          }}
                          className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors cursor-pointer hover:underline"
                        >
                          {plan.title}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-1">{plan.summary}</p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start">
                        <button
                          onClick={() => transferPlanToScript(plan)}
                          className="rounded-lg border border-slate-700 bg-slate-800/60 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors"
                          title="Tulis atau edit naskah"
                        >
                          <FileText className="h-3 w-3 inline mr-1" />
                          Naskah
                        </button>
                        <button
                          onClick={() => transferPlanToThumbnail(plan)}
                          className="rounded-lg border border-slate-700 bg-slate-800/60 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors"
                          title="Rancang thumbnail"
                        >
                          <ImageIcon className="h-3 w-3 inline mr-1" />
                          Thumbnail
                        </button>
                      </div>
                    </div>

                    {/* Progress bar */}
                    {totalChecks > 0 && (
                      <div className="mt-3.5 pt-3 border-t border-slate-800/70 flex items-center justify-between text-xs text-slate-400">
                        <span className="text-[11px]">
                          Checklist: {completedChecks}/{totalChecks} selesai ({progressPct}%)
                        </span>
                        <div className="w-28 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Quick Studio Access & Recent Log */}
        <div className="space-y-6">
          {/* Studio Shortcuts */}
          <div className="rounded-xl border border-slate-800/80 bg-[#0e1624] p-4">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span>Studio Kreatif Cepat</span>
            </h3>

            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('scripts')}
                className="w-full flex items-center justify-between rounded-lg border border-slate-800 bg-[#131c2d] p-2.5 text-xs font-semibold text-slate-200 hover:border-cyan-500/30 hover:bg-[#172338] transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="h-4 w-4 text-cyan-400" />
                  <span>Script Studio</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
              </button>

              <button
                onClick={() => setActiveTab('voice')}
                className="w-full flex items-center justify-between rounded-lg border border-slate-800 bg-[#131c2d] p-2.5 text-xs font-semibold text-slate-200 hover:border-cyan-500/30 hover:bg-[#172338] transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Volume2 className="h-4 w-4 text-purple-400" />
                  <span>Voice Studio (TTS)</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
              </button>

              <button
                onClick={() => setActiveTab('thumbnails')}
                className="w-full flex items-center justify-between rounded-lg border border-slate-800 bg-[#131c2d] p-2.5 text-xs font-semibold text-slate-200 hover:border-cyan-500/30 hover:bg-[#172338] transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <ImageIcon className="h-4 w-4 text-emerald-400" />
                  <span>Thumbnail Lab</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
              </button>

              <button
                onClick={() => setActiveTab('assistant')}
                className="w-full flex items-center justify-between rounded-lg border border-slate-800 bg-[#131c2d] p-2.5 text-xs font-semibold text-slate-200 hover:border-cyan-500/30 hover:bg-[#172338] transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="h-4 w-4 text-blue-400" />
                  <span>AI Assistant Chat</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
              </button>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="rounded-xl border border-slate-800/80 bg-[#0e1624] p-4">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              <span>Aktivitas Terakhir</span>
            </h3>

            {activities.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">Belum ada riwayat aktivitas.</p>
            ) : (
              <div className="space-y-3">
                {activities.slice(0, 5).map((act) => (
                  <div key={act.id} className="flex items-start gap-2.5 text-xs">
                    <span className="h-2 w-2 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-slate-300 font-medium truncate">
                        <span className="text-slate-500 mr-1">[{act.action}]</span>
                        {act.title}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {new Date(act.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        • {act.itemType.toUpperCase()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
