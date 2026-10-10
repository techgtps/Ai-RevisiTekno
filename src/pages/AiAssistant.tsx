import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Lightbulb,
  Kanban,
  FileText,
  Copy,
  Trash2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ChatMessage, VideoIdea, VideoPlan } from '../types';
import { ApiService } from '../services/api';
import { StorageService } from '../services/storage';

export const AiAssistant: React.FC = () => {
  const {
    channelProfile,
    apiStatus,
    showToast,
    addOrUpdateIdea,
    addOrUpdatePlan,
    transferIdeaToScript,
    setActiveTab,
  } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>(StorageService.getChats());
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    if (!apiStatus?.hasApiKey) {
      showToast(
        'GEMINI_API_KEY belum dikonfigurasi di secrets. Mohon atur di panel Secrets.',
        'error'
      );
      return;
    }

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    StorageService.saveChats(updated);
    setInput('');
    setLoading(true);

    try {
      const apiMessages = updated.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const replyText = await ApiService.sendChat(apiMessages, channelProfile, {
        channelName: channelProfile.channelName,
        niche: channelProfile.niche,
        targetAudience: channelProfile.targetAudience,
      });

      const assistantMsg: ChatMessage = {
        id: 'msg-ai-' + Date.now(),
        role: 'assistant',
        content: replyText,
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...updated, assistantMsg];
      setMessages(finalMessages);
      StorageService.saveChats(finalMessages);
    } catch (err: any) {
      showToast(err.message || 'Gagal menghubungi asisten AI.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Yakin ingin menghapus seluruh riwayat percakapan asisten?')) {
      StorageService.clearChats();
      setMessages(StorageService.getChats());
      showToast('Riwayat obrolan dibersihkan.', 'info');
    }
  };

  const handleSaveAsIdea = (content: string) => {
    const firstLine = content.split('\n')[0].replace(/^#+\s*/, '').trim();
    const newIdea: VideoIdea = {
      id: 'idea-' + Date.now(),
      title: firstLine.length > 5 && firstLine.length < 80 ? firstLine : `Ide dari Diskusi AI: ${channelProfile.channelName}`,
      coreConcept: content.substring(0, 300) + '...',
      hook: 'Temukan dalam video ini...',
      viewerProblem: 'Rasa penasaran penonton terhadap topik teknologi terkini.',
      talkingPoints: ['Poin utama 1', 'Poin utama 2', 'Poin utama 3'],
      structure: 'Intro -> Pembahasan Utama -> Kesimpulan',
      thumbnailDirection: 'Visual kontras tinggi dengan teks judul lugas',
      difficulty: 'Sedang',
      researchNeeded: 'Perlu cek spesifikasi & uji mandiri',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addOrUpdateIdea(newIdea);
    showToast('Tersimpan sebagai Ide Konten baru di Pustaka!', 'success');
  };

  const handleSaveAsPlan = (content: string) => {
    const firstLine = content.split('\n')[0].replace(/^#+\s*/, '').trim();
    const newPlan: VideoPlan = {
      id: 'plan-' + Date.now(),
      title: firstLine.length > 5 && firstLine.length < 80 ? firstLine : `Rencana Video: ${channelProfile.channelName}`,
      topic: channelProfile.niche,
      contentObjective: 'Membahas topik hasil brainstorming AI',
      targetAudience: channelProfile.targetAudience,
      videoFormat: 'Long-form YouTube',
      summary: content.substring(0, 400),
      hook: 'Hook pembuka dari asisten',
      talkingPoints: ['Poin 1', 'Poin 2', 'Poin 3'],
      researchNotes: 'Riset lanjutan dari catatan AI',
      checklist: [
        { id: 'c-1', text: 'Verifikasi klaim teknis', done: false },
        { id: 'c-2', text: 'Susun draf di Script Studio', done: false },
        { id: 'c-3', text: 'Siapkan thumbnail di Thumbnail Lab', done: false },
      ],
      status: 'Planning',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addOrUpdatePlan(newPlan);
    showToast('Tersimpan sebagai Rencana Video di Video Planner!', 'success');
  };

  const handleSendToScript = (content: string) => {
    const firstLine = content.split('\n')[0].replace(/^#+\s*/, '').trim();
    transferIdeaToScript({
      id: 'temp-script-' + Date.now(),
      title: firstLine.length > 5 && firstLine.length < 80 ? firstLine : `Draf Naskah dari Diskusi AI`,
      coreConcept: content,
      hook: '',
      viewerProblem: '',
      talkingPoints: [],
      structure: '',
      thumbnailDirection: '',
      difficulty: 'Sedang',
      researchNeeded: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  const quickPrompts = [
    'Berikan 3 ide video perbandingan gadget dengan sudut pandang unik di 2026',
    'Bantu buat 2 hook 10 detik pertama yang memancing rasa penasaran',
    'Bagaimana cara menjelaskan teknologi AI kepada audiens awam tanpa membosankan?',
    'Review struktur video review teknologi: apa saja yang wajib dites?',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto p-3 md:p-6 text-slate-100">
      {/* Top Bar inside Assistant */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
              <span>Konsultan Kreatif {channelProfile.channelName}</span>
              <span className="rounded bg-cyan-950/60 border border-cyan-800/40 text-[10px] font-mono text-cyan-400 px-1.5 py-0.5">
                Gemini 3.8 Flash
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Diskusikan sudut pandang, uji kelemahan ide, atau sempurnakan naskah Anda
            </p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-[#121927] px-2.5 py-1.5 text-xs text-slate-400 hover:text-red-400 hover:border-red-900/50 transition-colors"
          title="Hapus riwayat chat"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Bersihkan</span>
        </button>
      </div>

      {/* Warning banner if API key is not configured */}
      {!apiStatus?.hasApiKey && (
        <div className="mt-3 flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-950/30 p-3.5 text-xs text-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold text-amber-300">GEMINI_API_KEY belum terdeteksi.</span>
            <p className="mt-0.5 text-amber-200/90 leading-relaxed">
              Untuk mengaktifkan kemampuan AI, tambahkan kunci API Gemini pada menu pengaturan Secrets. Seluruh fitur manual workspace tetap dapat Anda gunakan.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('settings')}
            className="rounded-lg bg-amber-600/30 border border-amber-500/40 px-2.5 py-1 font-semibold text-amber-200 hover:bg-amber-600/50"
          >
            Pengaturan
          </button>
        </div>
      )}

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs md:text-sm ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="h-8 w-8 rounded-lg bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400 shrink-0 mt-1 shadow-sm">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 shadow-md ${
                  isUser
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-tr-none'
                    : 'bg-[#111928] border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>

                {/* Response Action Toolbar for Assistant answers */}
                {!isUser && (
                  <div className="mt-3.5 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5 text-[11px]">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(msg.content);
                        showToast('Teks disalin ke papan klip.', 'info');
                      }}
                      className="inline-flex items-center gap-1 rounded-md bg-slate-800/70 hover:bg-slate-700 px-2 py-1 text-slate-300 hover:text-white transition-colors"
                      title="Salin jawaban"
                    >
                      <Copy className="h-3 w-3" />
                      <span>Salin</span>
                    </button>

                    <button
                      onClick={() => handleSaveAsIdea(msg.content)}
                      className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-1 transition-colors"
                      title="Simpan sebagai ide"
                    >
                      <Lightbulb className="h-3 w-3" />
                      <span>Jadikan Ide</span>
                    </button>

                    <button
                      onClick={() => handleSaveAsPlan(msg.content)}
                      className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-1 transition-colors"
                      title="Jadikan rencana video"
                    >
                      <Kanban className="h-3 w-3" />
                      <span>Buat Rencana</span>
                    </button>

                    <button
                      onClick={() => handleSendToScript(msg.content)}
                      className="inline-flex items-center gap-1 rounded-md bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-1 transition-colors"
                      title="Kirim ke Script Studio"
                    >
                      <FileText className="h-3 w-3" />
                      <span>Kirim ke Script</span>
                    </button>
                  </div>
                )}

                <div className="mt-1 text-[10px] text-slate-400 text-right opacity-70">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {isUser && (
                <div className="h-8 w-8 rounded-lg bg-blue-900/60 border border-blue-700/60 flex items-center justify-center text-blue-300 shrink-0 mt-1 shadow-sm">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 text-xs md:text-sm justify-start animate-pulse">
            <div className="h-8 w-8 rounded-lg bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400 shrink-0 mt-1">
              <Bot className="h-4 w-4 animate-spin" />
            </div>
            <div className="rounded-2xl rounded-tl-none bg-[#111928] border border-slate-800 p-4 text-slate-400">
              <span className="inline-flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-spin" />
                Menganalisis dan menyusun respon untuk Revisitekno...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Pill recommendations */}
      {messages.length <= 2 && (
        <div className="py-2">
          <div className="text-[11px] font-semibold text-slate-400 mb-2">Rekomendasi Pemantik Diskusi:</div>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                onClick={() => handleSend(qp)}
                className="rounded-lg border border-slate-800 bg-[#0f1725] px-3 py-1.5 text-xs text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300 hover:bg-[#142136] transition-all text-left"
              >
                {qp}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="pt-2 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tanyakan ide video, periksa hook naskah, atau diskusikan topik gadget..."
            disabled={loading}
            className="w-full rounded-xl border border-slate-700/80 bg-[#121927] py-3 pl-4 pr-12 text-xs md:text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-60 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/20 hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all"
            aria-label="Kirim"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
        <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500">
          <span>AI adalah asisten persiapan. Verifikasi fakta teknis tetap tanggung jawab kreator.</span>
          <span>{channelProfile.channelName} AI v1.2</span>
        </div>
      </div>
    </div>
  );
};
