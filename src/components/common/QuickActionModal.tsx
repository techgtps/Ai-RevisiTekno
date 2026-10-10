import React from 'react';
import {
  X,
  Lightbulb,
  Kanban,
  FileText,
  Volume2,
  Image as ImageIcon,
  CalendarClock,
  Bot,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({ isOpen, onClose }) => {
  const { setActiveTab } = useApp();

  if (!isOpen) return null;

  const actions = [
    {
      title: 'Eksplorasi Ide Konten',
      desc: 'Hasilkan 4 ide video teknologi berdasarkan topik & audiens dengan AI',
      icon: Lightbulb,
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400',
      action: () => {
        setActiveTab('ideas');
        onClose();
      },
    },
    {
      title: 'Buat Rencana Video',
      desc: 'Susun rencana produksi baru di papan kerja dengan checklist',
      icon: Kanban,
      color: 'from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-400',
      action: () => {
        setActiveTab('planner');
        onClose();
      },
    },
    {
      title: 'Tulis Naskah Video',
      desc: 'Masuk ke Script Studio untuk menulis atau merilis draft naskah baru',
      icon: FileText,
      color: 'from-cyan-500/20 to-teal-500/10 border-cyan-500/30 text-cyan-400',
      action: () => {
        setActiveTab('scripts');
        onClose();
      },
    },
    {
      title: 'Voice Studio (TTS)',
      desc: 'Ubah teks narasi menjadi suara pengisi suara Bahasa Indonesia',
      icon: Volume2,
      color: 'from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-400',
      action: () => {
        setActiveTab('voice');
        onClose();
      },
    },
    {
      title: 'Rancang Thumbnail CTR Tinggi',
      desc: 'Eksplorasi konsep visual 16:9, sudut komposisi, dan prompt AI',
      icon: ImageIcon,
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400',
      action: () => {
        setActiveTab('thumbnails');
        onClose();
      },
    },
    {
      title: 'YouTube SEO & Scheduler',
      desc: 'Optimasi hashtag, tag 500 karakter, deskripsi video & rekomendasi jadwal tayang',
      icon: CalendarClock,
      color: 'from-cyan-500/20 to-amber-500/10 border-cyan-500/30 text-cyan-300',
      action: () => {
        setActiveTab('seo');
        onClose();
      },
    },
    {
      title: 'Diskusi dengan AI Assistant',
      desc: 'Tanya saran strategi, perbaiki hook, atau minta review topik gadget',
      icon: Bot,
      color: 'from-sky-500/20 to-cyan-500/10 border-sky-500/30 text-sky-400',
      action: () => {
        setActiveTab('assistant');
        onClose();
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-800 bg-[#0d131d] p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
          <div>
            <h2 className="text-base font-bold text-white">Menu Aksi Cepat Kreator</h2>
            <p className="text-xs text-slate-400">Pilih langkah kerja kreatif yang ingin Anda mulai sekarang</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto">
          {actions.map((act, i) => {
            const Icon = act.icon;
            return (
              <button
                key={i}
                onClick={act.action}
                className="group flex flex-col justify-between text-left rounded-xl border border-slate-800/80 bg-[#121927] p-4 transition-all hover:border-cyan-500/40 hover:bg-[#162133] hover:shadow-lg hover:shadow-cyan-500/5 active:scale-[0.99]"
              >
                <div>
                  <div className={`inline-flex rounded-lg border p-2.5 bg-gradient-to-br ${act.color} mb-3`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                    {act.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">{act.desc}</p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-[11px] font-medium text-cyan-400 opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                  <span>Mulai</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
