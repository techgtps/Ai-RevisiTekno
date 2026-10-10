import React from 'react';
import {
  LayoutDashboard,
  Bot,
  Lightbulb,
  Kanban,
  FileText,
  Volume2,
  Image as ImageIcon,
  CalendarClock,
  FolderArchive,
  Settings,
  Sparkles,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { useApp, NavTab } from '../../context/AppContext';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  onOpenQuickAction: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen, onOpenQuickAction }) => {
  const { activeTab, setActiveTab, channelProfile, apiStatus, plans, scripts, ideas, seoPackages } = useApp();

  const navItems: { tab: NavTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { tab: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { tab: 'assistant', label: 'AI Assistant', icon: Bot },
    { tab: 'ideas', label: 'Idea Generator', icon: Lightbulb, badge: ideas.length },
    { tab: 'planner', label: 'Video Planner', icon: Kanban, badge: plans.length },
    { tab: 'scripts', label: 'Script Studio', icon: FileText, badge: scripts.length },
    { tab: 'voice', label: 'Voice Studio', icon: Volume2 },
    { tab: 'thumbnails', label: 'Thumbnail Lab', icon: ImageIcon },
    { tab: 'seo', label: 'SEO & Scheduler', icon: CalendarClock, badge: seoPackages.length },
    { tab: 'library', label: 'Content Library', icon: FolderArchive },
    { tab: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleSelect = (tab: NavTab) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 flex h-screen w-64 flex-col border-r border-[#1e293b] bg-[#0b0f17] text-slate-200 transition-transform duration-300 ease-in-out md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-[#1e293b] px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
              <Sparkles className="h-5 w-5 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold tracking-tight text-white">
                <span>REVISITEKNO</span>
                <span className="rounded bg-cyan-500/20 px-1 py-0.2 text-[10px] font-mono text-cyan-400 border border-cyan-500/40">
                  AI
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium">YouTube Studio v1.2</div>
            </div>
          </div>
        </div>

        {/* Quick Action Button */}
        <div className="p-3">
          <button
            onClick={() => {
              setMobileOpen(false);
              onOpenQuickAction();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 py-2.5 px-3 text-xs font-semibold text-white shadow-md shadow-cyan-500/10 transition-all hover:brightness-110 active:scale-[0.98]"
          >
            <Sparkles className="h-4 w-4" />
            <span>+ Rancang Konten Baru</span>
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-1 scrollbar-thin scrollbar-thumb-slate-800">
          <div className="px-2 pb-1 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
            Workspace Kreator
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => handleSelect(item.tab)}
                className={`group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-400 hover:bg-[#151d2a] hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-mono ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300'
                        : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Channel & API Status footer */}
        <div className="border-t border-[#1e293b] bg-[#0d131d] p-3">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-medium text-slate-300 truncate max-w-[140px]">
              {channelProfile.channelName}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-slate-400">
              <Radio
                className={`h-3 w-3 ${
                  apiStatus?.hasApiKey ? 'text-emerald-400 animate-pulse' : 'text-amber-400'
                }`}
              />
              {apiStatus?.hasApiKey ? 'AI Aktif' : 'Kunci Belum Diisi'}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 line-clamp-1">
            {channelProfile.niche}
          </div>
        </div>
      </aside>
    </>
  );
};
