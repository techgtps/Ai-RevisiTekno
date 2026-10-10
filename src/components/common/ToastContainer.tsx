import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

function cleanToastMessage(msg: string): string {
  if (!msg) return 'Pemberitahuan sistem.';
  if (
    msg.includes('429') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('quota') ||
    msg.includes('exceeded your current quota')
  ) {
    return 'Batas kuota gratis API Gemini tercapai (Error 429). Mohon tunggu sekitar 20-30 detik sebelum mencoba lagi.';
  }

  try {
    const parsed = JSON.parse(msg);
    if (parsed.error?.message) {
      if (parsed.error.code === 429 || parsed.error.status === 'RESOURCE_EXHAUSTED') {
        return 'Batas kuota gratis API Gemini tercapai (Error 429). Mohon tunggu sejenak.';
      }
      return parsed.error.message;
    }
  } catch {}

  return msg;
}

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm sm:max-w-md w-full pointer-events-none px-3">
      {toasts.map((toast) => {
        let Icon = Info;
        let borderClass = 'border-blue-500/40 bg-[#0e1726]/95 text-blue-200';
        let iconClass = 'text-blue-400';

        if (toast.type === 'success') {
          Icon = CheckCircle2;
          borderClass = 'border-emerald-500/40 bg-[#0a1f18]/95 text-emerald-200';
          iconClass = 'text-emerald-400';
        } else if (toast.type === 'error') {
          Icon = AlertCircle;
          borderClass = 'border-red-500/50 bg-[#251014]/95 text-red-200 shadow-red-950/40';
          iconClass = 'text-red-400';
        }

        const displayMessage = cleanToastMessage(toast.message);

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-3.5 shadow-2xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-2 ${borderClass}`}
          >
            <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${iconClass}`} />
            <div className="flex-1 text-xs font-medium leading-relaxed max-h-36 overflow-y-auto">
              {displayMessage}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white shrink-0 -mr-1 -mt-1 p-1"
              aria-label="Tutup notifikasi"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
