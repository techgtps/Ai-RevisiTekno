import React, { useState, useEffect } from 'react';
import {
  CalendarClock,
  Sparkles,
  Hash,
  Tag,
  FileText,
  Copy,
  Check,
  RefreshCw,
  Clock,
  CheckSquare,
  Square,
  Kanban,
  Save,
  Plus,
  Trash2,
  AlertCircle,
  Info,
  ArrowRight,
  TrendingUp,
  Download,
  Share2,
  Sliders,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SeoPackage, UploadChecklist, VideoFormat } from '../types';
import { ApiService } from '../services/api';

const DEFAULT_CHECKLIST: UploadChecklist = {
  titleReviewed: false,
  descriptionReviewed: false,
  tagsReviewed: false,
  thumbnailReady: false,
  videoChecked: false,
  scheduleSelected: false,
};

export const YouTubeSeoScheduler: React.FC = () => {
  const {
    channelProfile,
    plans,
    scripts,
    seoPackages,
    addOrUpdateSeoPackage,
    removeSeoPackage,
    addOrUpdatePlan,
    apiStatus,
    showToast,
    pendingSeoInput,
    setPendingSeoInput,
  } = useApp();

  // Active / Selected SEO Package
  const [activePackageId, setActivePackageId] = useState<string>(() => {
    return seoPackages.length > 0 ? seoPackages[0].id : 'new-seo-' + Date.now();
  });

  // 1. Video Inputs
  const [videoTitle, setVideoTitle] = useState('');
  const [videoTopic, setVideoTopic] = useState('');
  const [mainKeyword, setMainKeyword] = useState('');
  const [videoScript, setVideoScript] = useState('');
  const [videoFormat, setVideoFormat] = useState<'Shorts' | 'Long-form'>('Long-form');
  const [targetAudience, setTargetAudience] = useState(channelProfile.targetAudience);

  // 2. Generated & Editable SEO elements
  const [alternativeTitles, setAlternativeTitles] = useState<string[]>([]);
  const [selectedTitle, setSelectedTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [newHashtagInput, setNewHashtagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');

  // 3. Schedule Advisor
  const [recommendedSchedule, setRecommendedSchedule] = useState({
    dayOfWeek: 'Kamis & Jumat',
    timeWindow: '18:30 - 20:30 WIB',
    timezone: 'WIB',
    reasoning: 'Waktu santai malam prime-time penonton teknologi Indonesia setelah jam kerja/kuliah.',
    isEstimate: true,
  });
  const [scheduledDateTime, setScheduledDateTime] = useState('');

  // 4. Checklist state
  const [checklist, setChecklist] = useState<UploadChecklist>(DEFAULT_CHECKLIST);

  // 5. Linking state
  const [selectedPlanIdToLink, setSelectedPlanIdToLink] = useState<string>('');

  // UI state
  const [generating, setGenerating] = useState(false);
  const [copiedState, setCopiedState] = useState<string | null>(null);
  const [showScheduleInfo, setShowScheduleInfo] = useState(false);
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);

  // Handle cross-navigation transfer from Video Planner
  useEffect(() => {
    if (pendingSeoInput) {
      setVideoTitle(pendingSeoInput.title || '');
      setSelectedTitle(pendingSeoInput.title || '');
      setVideoTopic(pendingSeoInput.topic || pendingSeoInput.title || '');
      setMainKeyword(pendingSeoInput.topic ? pendingSeoInput.topic.split(' ').slice(0, 3).join(' ') : '');
      if (pendingSeoInput.scriptSummary) {
        setVideoScript(pendingSeoInput.scriptSummary);
      }
      if (pendingSeoInput.format) {
        setVideoFormat(pendingSeoInput.format.includes('Short') ? 'Shorts' : 'Long-form');
      }
      if (pendingSeoInput.planId) {
        setSelectedPlanIdToLink(pendingSeoInput.planId);
      }
      setPendingSeoInput(null);
    }
  }, [pendingSeoInput, setPendingSeoInput]);

  // Load existing SEO package when selection changes
  useEffect(() => {
    const existing = seoPackages.find((s) => s.id === activePackageId);
    if (existing) {
      setVideoTitle(existing.videoTitle);
      setSelectedTitle(existing.selectedTitle || existing.videoTitle);
      setVideoTopic(existing.videoTopic);
      setMainKeyword(existing.mainKeyword);
      setVideoScript(existing.scriptSummary || '');
      setVideoFormat(existing.videoFormat);
      setTargetAudience(existing.targetAudience);
      setAlternativeTitles(existing.alternativeTitles || []);
      setDescription(existing.description || '');
      setHashtags(existing.hashtags || []);
      setTags(existing.tags || []);
      if (existing.recommendedSchedule) {
        setRecommendedSchedule(existing.recommendedSchedule);
      }
      if (existing.scheduledDateTime) {
        setScheduledDateTime(existing.scheduledDateTime);
      }
      if (existing.checklist) {
        setChecklist(existing.checklist);
      }
      if (existing.linkedPlanId) {
        setSelectedPlanIdToLink(existing.linkedPlanId);
      }
    }
  }, [activePackageId]);

  // Calculate current YouTube tags character count (tags joined by comma)
  const currentTagsCharCount = tags.join(',').length;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedState(label);
    showToast(`${label} disalin ke papan klip!`, 'info');
    setTimeout(() => setCopiedState(null), 2500);
  };

  // Generate SEO Package via server
  const handleGenerateSeo = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!videoTitle.trim() && !videoTopic.trim()) {
      showToast('Judul atau topik video wajib diisi.', 'error');
      return;
    }
    if (!apiStatus?.hasApiKey) {
      showToast('GEMINI_API_KEY belum dikonfigurasi.', 'error');
      return;
    }

    setGenerating(true);
    try {
      const result = await ApiService.generateSeoPackage({
        videoTitle: videoTitle || videoTopic,
        videoTopic: videoTopic || videoTitle,
        mainKeyword: mainKeyword || videoTopic || 'teknologi',
        videoScript,
        videoFormat,
        targetAudience,
        channelProfile,
      });

      setAlternativeTitles(result.alternativeTitles || []);
      setSelectedTitle(videoTitle || result.alternativeTitles?.[0] || '');
      setDescription(result.description || '');
      setHashtags(result.hashtags || []);
      setTags(result.tags || []);
      if (result.recommendedSchedule) {
        setRecommendedSchedule(result.recommendedSchedule);
      }

      if (result.isFallback) {
        setFallbackNotice(result.notice || 'Paket SEO dibuat menggunakan template cerdas Revisitekno.');
        showToast(result.notice || 'Paket SEO dibuat menggunakan template cerdas Revisitekno.', 'info');
      } else {
        setFallbackNotice(null);
        showToast('Paket SEO YouTube & Jadwal berhasil dihasilkan!', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Gagal menghasilkan SEO paket.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  // Tag management
  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    const clean = newTagInput.trim().replace(/^#/, '');
    if (tags.includes(clean)) {
      showToast('Tag sudah ada.', 'error');
      return;
    }
    const testLength = [...tags, clean].join(',').length;
    if (testLength > 500) {
      showToast('Menambahkan tag ini akan melebihi batas 500 karakter YouTube!', 'error');
      return;
    }
    setTags([...tags, clean]);
    setNewTagInput('');
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  // Hashtag management
  const handleAddHashtag = () => {
    if (!newHashtagInput.trim()) return;
    let clean = newHashtagInput.trim();
    if (!clean.startsWith('#')) clean = '#' + clean;
    if (hashtags.includes(clean)) {
      showToast('Hashtag sudah ada.', 'error');
      return;
    }
    setHashtags([...hashtags, clean]);
    setNewHashtagInput('');
  };

  const handleRemoveHashtag = (index: number) => {
    setHashtags(hashtags.filter((_, i) => i !== index));
  };

  // Checklist toggle
  const toggleChecklistItem = (key: keyof UploadChecklist) => {
    setChecklist((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const completedChecklistCount = Object.values(checklist).filter(Boolean).length;
  const checklistPercentage = Math.round((completedChecklistCount / 6) * 100);

  // Save SEO Package to Local Storage
  const handleSavePackage = () => {
    const pkg: SeoPackage = {
      id: activePackageId.startsWith('new-seo') ? 'seo-' + Date.now() : activePackageId,
      videoTitle: videoTitle || 'Video YouTube',
      videoTopic,
      mainKeyword,
      videoFormat,
      targetAudience,
      scriptSummary: videoScript,
      alternativeTitles,
      selectedTitle: selectedTitle || videoTitle,
      description,
      hashtags,
      tags,
      tagCharactersCount: currentTagsCharCount,
      recommendedSchedule,
      scheduledDateTime,
      checklist,
      linkedPlanId: selectedPlanIdToLink || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addOrUpdateSeoPackage(pkg);
    setActivePackageId(pkg.id);

    // If linked to plan, update the plan's schedule and title
    if (selectedPlanIdToLink) {
      const plan = plans.find((p) => p.id === selectedPlanIdToLink);
      if (plan) {
        const updatedPlan = {
          ...plan,
          title: selectedTitle || plan.title,
          linkedSeoId: pkg.id,
          scheduledPublishDate: scheduledDateTime || plan.scheduledPublishDate,
          targetDate: scheduledDateTime ? scheduledDateTime.split('T')[0] : plan.targetDate,
          updatedAt: new Date().toISOString(),
        };
        addOrUpdatePlan(updatedPlan);
        showToast(`Paket SEO ditautkan ke rencana "${plan.title}".`, 'info');
      }
    }
  };

  // Create new blank package
  const handleCreateNewPackage = () => {
    const newId = 'new-seo-' + Date.now();
    setActivePackageId(newId);
    setVideoTitle('');
    setSelectedTitle('');
    setVideoTopic('');
    setMainKeyword('');
    setVideoScript('');
    setAlternativeTitles([]);
    setDescription('');
    setHashtags([]);
    setTags([]);
    setScheduledDateTime('');
    setChecklist(DEFAULT_CHECKLIST);
    setSelectedPlanIdToLink('');
    showToast('Formulir SEO baru siap diisi.', 'info');
  };

  // Pre-fill from existing plan
  const handleImportPlan = (planId: string) => {
    const target = plans.find((p) => p.id === planId);
    if (!target) return;
    setVideoTitle(target.title);
    setSelectedTitle(target.title);
    setVideoTopic(target.topic);
    setMainKeyword(target.topic ? target.topic.split(' ').slice(0, 3).join(' ') : '');
    setVideoScript(target.summary || target.hook || '');
    setVideoFormat(target.videoFormat.includes('Short') ? 'Shorts' : 'Long-form');
    setSelectedPlanIdToLink(target.id);
    showToast(`Data diimpor dari rencana "${target.title}".`, 'success');
  };

  // Pre-fill from existing script
  const handleImportScript = (scriptId: string) => {
    const target = scripts.find((s) => s.id === scriptId);
    if (!target) return;
    setVideoTitle(target.title);
    setSelectedTitle(target.title);
    setVideoTopic(target.topic);
    setMainKeyword(target.topic ? target.topic.split(' ').slice(0, 3).join(' ') : '');
    setVideoScript(target.content.substring(0, 800));
    setVideoFormat(target.videoFormat.includes('Short') ? 'Shorts' : 'Long-form');
    showToast(`Data diimpor dari naskah "${target.title}".`, 'success');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-slate-100">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <CalendarClock className="h-4 w-4" />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
              YouTube SEO & Scheduler
            </h2>
          </div>
          <p className="mt-1 text-xs md:text-sm text-slate-400">
            Optimasi metadata YouTube (judul, tag 500 karakter, hashtag, deskripsi) dan jadwalkan publikasi video secara terarah.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleCreateNewPackage}
            className="rounded-xl border border-slate-700 bg-[#121c2d] px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-[#18263e] hover:text-white transition-colors"
          >
            + Paket SEO Baru
          </button>

          <button
            onClick={handleSavePackage}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-cyan-500/15 hover:brightness-110 active:scale-95 transition-all"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Simpan Paket SEO</span>
          </button>
        </div>
      </div>

      {/* Main Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Inputs & Sources) - 5 cols */}
        <div className="lg:col-span-5 space-y-5">
          {/* Saved SEO Packages Switcher */}
          {seoPackages.length > 0 && (
            <div className="rounded-xl border border-slate-800 bg-[#0e1624] p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <CalendarClock className="h-3.5 w-3.5 text-amber-400" />
                  <span>Paket SEO Tersimpan ({seoPackages.length})</span>
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                {seoPackages.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setActivePackageId(s.id)}
                    className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-all border ${
                      activePackageId === s.id
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-semibold shadow-sm'
                        : 'bg-[#121c2d] border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="truncate max-w-[170px]">{s.selectedTitle || s.videoTitle}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSeoPackage(s.id);
                      }}
                      className="text-slate-500 hover:text-red-400 p-0.5"
                      title="Hapus paket SEO ini"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Import from Plan / Script */}
          <div className="rounded-xl border border-slate-800/80 bg-[#0e1624] p-3.5 text-xs space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 block">
              Tarik Otomatis dari Workspace Kreator:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                onChange={(e) => {
                  if (e.target.value) handleImportPlan(e.target.value);
                }}
                defaultValue=""
                className="rounded-lg border border-slate-700 bg-[#121c2d] p-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
              >
                <option value="" disabled>
                  Tarik dari Rencana Video...
                </option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>

              <select
                onChange={(e) => {
                  if (e.target.value) handleImportScript(e.target.value);
                }}
                defaultValue=""
                className="rounded-lg border border-slate-700 bg-[#121c2d] p-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
              >
                <option value="" disabled>
                  Tarik dari Naskah...
                </option>
                {scripts.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 1. Video Input Form */}
          <form
            onSubmit={handleGenerateSeo}
            className="rounded-2xl border border-slate-800 bg-[#0e1624] p-5 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5" />
                <span>Parameter Konten Video</span>
              </span>
              <span className="text-[11px] text-slate-500">1/6 Input</span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">
                Judul Video <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="Misal: Review 30 Hari Laptop AI Windows on ARM"
                className="w-full rounded-xl border border-slate-700 bg-[#121c2d] p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">
                  Topik Video <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={videoTopic}
                  onChange={(e) => setVideoTopic(e.target.value)}
                  placeholder="Laptop Snapdragon X Elite"
                  className="w-full rounded-xl border border-slate-700 bg-[#121c2d] p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">
                  Kata Kunci Utama (Focus Keyword) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={mainKeyword}
                  onChange={(e) => setMainKeyword(e.target.value)}
                  placeholder="review laptop windows arm"
                  className="w-full rounded-xl border border-slate-700 bg-[#121c2d] p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Format Video</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setVideoFormat('Long-form')}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-colors ${
                      videoFormat === 'Long-form'
                        ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                        : 'bg-[#121c2d] border-slate-700 text-slate-400'
                    }`}
                  >
                    Long-form
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoFormat('Shorts')}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-colors ${
                      videoFormat === 'Shorts'
                        ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                        : 'bg-[#121c2d] border-slate-700 text-slate-400'
                    }`}
                  >
                    Shorts (Vertikal)
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Target Audiens</label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="Penggemar gadget Indonesia"
                  className="w-full rounded-xl border border-slate-700 bg-[#121c2d] p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">
                Naskah / Poin Bahasan Video (Opsional)
              </label>
              <textarea
                rows={3}
                value={videoScript}
                onChange={(e) => setVideoScript(e.target.value)}
                placeholder="Tempel draf naskah atau poin bahasan penting video untuk hasil deskripsi yang sangat akurat..."
                className="w-full rounded-xl border border-slate-700 bg-[#121c2d] p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={generating || (!videoTitle.trim() && !videoTopic.trim())}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-cyan-500 py-3 text-xs font-bold text-white shadow-lg shadow-orange-500/20 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 transition-all"
            >
              {generating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-white" />
                  <span>Merancang Paket SEO & Rekomendasi Jadwal...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Hasilkan Paket SEO Lengkap & Jadwal</span>
                </>
              )}
            </button>
          </form>

          {/* 8. Simple Upload Checklist */}
          <div className="rounded-2xl border border-slate-800 bg-[#0e1624] p-5 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckSquare className="h-3.5 w-3.5" />
                <span>Checklist Persiapan Upload</span>
              </span>
              <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                {completedChecklistCount}/6 ({checklistPercentage}%)
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-300"
                style={{ width: `${checklistPercentage}%` }}
              />
            </div>

            <div className="space-y-2 pt-1 text-xs">
              {[
                { key: 'titleReviewed', label: 'Judul video sudah ditinjau & dioptimalkan' },
                { key: 'descriptionReviewed', label: 'Deskripsi video sudah disesuaikan' },
                { key: 'tagsReviewed', label: 'Hashtag & Tag (<500 karakter) sudah diperiksa' },
                { key: 'thumbnailReady', label: 'Thumbnail 16:9 siap & beresolusi tajam' },
                { key: 'videoChecked', label: 'File video dicek (Audio jernih, resolusi 1080p/4K)' },
                { key: 'scheduleSelected', label: 'Jadwal tayang (tanggal & jam) sudah ditentukan' },
              ].map((item) => {
                const k = item.key as keyof UploadChecklist;
                const isDone = checklist[k];
                return (
                  <div
                    key={k}
                    onClick={() => toggleChecklistItem(k)}
                    className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-colors ${
                      isDone
                        ? 'bg-emerald-950/20 text-emerald-200 border border-emerald-900/40'
                        : 'bg-[#121c2d] text-slate-300 hover:text-white border border-transparent'
                    }`}
                  >
                    {isDone ? (
                      <CheckSquare className="h-4 w-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Square className="h-4 w-4 text-slate-500 shrink-0" />
                    )}
                    <span className={`text-xs ${isDone ? 'line-through text-slate-400' : ''}`}>
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (SEO Outputs & Schedule Advisor) - 7 cols */}
        <div className="lg:col-span-7 space-y-5">
          {fallbackNotice && (
            <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-3.5 text-xs text-amber-200 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-amber-300">Mode Template Cerdas Aktif:</span>
                <p className="mt-0.5 text-slate-300 leading-relaxed text-[11px]">{fallbackNotice}</p>
              </div>
            </div>
          )}

          {/* 5. Title Suggestions */}
          <div className="rounded-2xl border border-slate-800 bg-[#0e1624] p-5 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Rekomendasi Judul Ber-CTR Tinggi</span>
              </span>
              <span className="text-[11px] text-slate-500">Pilih judul terbaik</span>
            </div>

            {/* Currently Selected Active Title */}
            <div className="space-y-1">
              <label className="text-[11px] text-slate-400 font-medium">Judul Terpilih untuk Video Ini:</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={selectedTitle}
                  onChange={(e) => setSelectedTitle(e.target.value)}
                  placeholder="Ketik atau pilih salah satu alternatif di bawah..."
                  className="flex-1 rounded-xl border border-cyan-500/40 bg-[#121c2d] p-2.5 text-xs md:text-sm font-bold text-white focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(selectedTitle, 'Judul video')}
                  className="rounded-xl border border-slate-700 bg-slate-800/80 p-2.5 text-slate-300 hover:text-white"
                  title="Salin judul terpilih"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Alternative options list */}
            {alternativeTitles.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="text-[11px] text-slate-400 font-medium block">
                  Alternatif Judul dari AI (Klik untuk Menerapkan):
                </span>
                <div className="space-y-1.5">
                  {alternativeTitles.map((altTitle, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedTitle(altTitle);
                        showToast('Judul diterapkan ke form utama.', 'info');
                      }}
                      className={`flex items-center justify-between gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        selectedTitle === altTitle
                          ? 'border-cyan-500 bg-cyan-950/20 text-white font-semibold'
                          : 'border-slate-800 bg-[#121c2d] text-slate-300 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="h-5 w-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] shrink-0 font-mono">
                          {idx + 1}
                        </span>
                        <span className="truncate">{altTitle}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(altTitle, 'Judul alternatif');
                          }}
                          className="p-1 rounded text-slate-400 hover:text-white"
                          title="Salin judul ini"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. Video Tags Generator (Enforce 500 Char limit) */}
          <div className="rounded-2xl border border-slate-800 bg-[#0e1624] p-5 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Tag className="h-3.5 w-3.5 text-blue-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Tag Video YouTube Studio (Maks. 500 Karakter)
                </span>
              </div>

              {/* Tag characters counter indicator */}
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                    currentTagsCharCount > 500
                      ? 'bg-red-950/40 text-red-400 border-red-500/50'
                      : currentTagsCharCount > 450
                      ? 'bg-amber-950/40 text-amber-400 border-amber-500/50'
                      : 'bg-blue-950/40 text-blue-400 border-blue-500/40'
                  }`}
                >
                  {currentTagsCharCount} / 500 Karakter
                </span>

                <button
                  type="button"
                  onClick={() => copyToClipboard(tags.join(','), 'Daftar Tag')}
                  disabled={tags.length === 0}
                  className="inline-flex items-center gap-1 rounded-lg bg-blue-600/30 border border-blue-500/40 px-2.5 py-1 text-xs font-semibold text-blue-200 hover:bg-blue-600/40 disabled:opacity-50"
                  title="Salin seluruh tag dengan pemisah koma untuk YouTube Studio"
                >
                  <Copy className="h-3 w-3" />
                  <span>Salin Tag</span>
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Tag video di YouTube Studio dipisahkan dengan tanda koma tanpa awalan tanda pagar (<code className="text-blue-300">#</code>). Tempel langsung ke kolom Tag video di YouTube Studio.
            </p>

            {/* Tag Pills */}
            <div className="flex flex-wrap gap-1.5 min-h-[48px] p-2 rounded-xl border border-slate-800 bg-[#101726]">
              {tags.length === 0 ? (
                <span className="text-slate-500 italic text-xs p-1">Belum ada tag yang dibuat.</span>
              ) : (
                tags.map((tagItem, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded-lg bg-blue-500/15 border border-blue-500/30 px-2 py-1 text-xs text-blue-200"
                  >
                    <span>{tagItem}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(idx)}
                      className="text-slate-400 hover:text-red-300 ml-0.5"
                      title="Hapus tag ini"
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Add tag input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Tambah tag baru secara manual (tekan Enter)..."
                className="flex-1 rounded-lg border border-slate-700 bg-[#121c2d] px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500"
              >
                + Tambah Tag
              </button>
            </div>
          </div>

          {/* 2. Hashtag Generator */}
          <div className="rounded-2xl border border-slate-800 bg-[#0e1624] p-5 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Hash className="h-3.5 w-3.5 text-cyan-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Hashtag YouTube ({hashtags.length})
                </span>
              </div>

              <button
                type="button"
                onClick={() => copyToClipboard(hashtags.join(' '), 'Daftar Hashtag')}
                disabled={hashtags.length === 0}
                className="inline-flex items-center gap-1 rounded-lg bg-cyan-600/30 border border-cyan-500/40 px-2.5 py-1 text-xs font-semibold text-cyan-200 hover:bg-cyan-600/40 disabled:opacity-50"
              >
                <Copy className="h-3 w-3" />
                <span>Salin Semua Hashtag</span>
              </button>
            </div>

            {/* Hashtag Badges */}
            <div className="flex flex-wrap gap-1.5 min-h-[40px] p-2 rounded-xl border border-slate-800 bg-[#101726]">
              {hashtags.length === 0 ? (
                <span className="text-slate-500 italic text-xs p-1">Belum ada hashtag.</span>
              ) : (
                hashtags.map((ht, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 px-2 py-1 text-xs text-cyan-300 font-semibold"
                  >
                    <span>{ht}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveHashtag(idx)}
                      className="text-slate-400 hover:text-red-300 ml-0.5"
                      title="Hapus hashtag ini"
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Add hashtag input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newHashtagInput}
                onChange={(e) => setNewHashtagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddHashtag();
                  }
                }}
                placeholder="Tambah hashtag baru (contoh: #Laptop2026)..."
                className="flex-1 rounded-lg border border-slate-700 bg-[#121c2d] px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={handleAddHashtag}
                className="rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500"
              >
                + Tambah
              </button>
            </div>
          </div>

          {/* 4. SEO Description Generator */}
          <div className="rounded-2xl border border-slate-800 bg-[#0e1624] p-5 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Deskripsi YouTube Teroptimasi SEO
                </span>
              </div>

              <button
                type="button"
                onClick={() => copyToClipboard(description, 'Deskripsi YouTube')}
                disabled={!description.trim()}
                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600/30 border border-emerald-500/40 px-2.5 py-1 text-xs font-semibold text-emerald-200 hover:bg-emerald-600/40 disabled:opacity-50"
              >
                <Copy className="h-3 w-3" />
                <span>Salin Deskripsi</span>
              </button>
            </div>

            <textarea
              rows={8}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi video terstruktur yang ramah penonton dan algoritma YouTube..."
              className="w-full rounded-xl border border-slate-700 bg-[#121c2d] p-3 text-xs text-slate-100 font-mono leading-relaxed focus:outline-none focus:border-emerald-500 scrollbar-thin scrollbar-thumb-slate-800"
            />
          </div>

          {/* 6. Upload Time Advisor & Schedule Setting */}
          <div className="rounded-2xl border border-slate-800 bg-[#0e1624] p-5 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Rekomendasi Waktu Publikasi (Upload Time Advisor)
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowScheduleInfo(!showScheduleInfo)}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
              >
                <Info className="h-3.5 w-3.5 text-cyan-400" />
                <span>Basis Estimasi</span>
              </button>
            </div>

            {showScheduleInfo && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-3 text-xs text-amber-200/90 leading-relaxed space-y-1 animate-in fade-in">
                <div className="font-semibold text-amber-300">
                  Transparansi Data (Tanpa Fabrikasi):
                </div>
                <p>
                  Rekomendasi waktu publikasi di bawah ini merupakan <strong>estimasi objektif</strong> berdasarkan pola aktivitas konsumsi penonton video teknologi di Indonesia (Zona Waktu WIB). Revisitekno AI tidak merekayasa metrik YouTube Analytics pribadi jika channel belum terhubung ke API otorisasi resmi.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl border border-slate-800 bg-[#121c2d] space-y-1">
                <span className="text-[11px] text-slate-400 block font-medium">Hari Direkomendasikan:</span>
                <span className="text-sm font-bold text-white flex items-center gap-1.5">
                  <CalendarClock className="h-4 w-4 text-amber-400" />
                  <span>{recommendedSchedule.dayOfWeek}</span>
                </span>
                <p className="text-[10px] text-slate-400 mt-1">{recommendedSchedule.reasoning}</p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800 bg-[#121c2d] space-y-1">
                <span className="text-[11px] text-slate-400 block font-medium">Jam Prime-Time:</span>
                <span className="text-sm font-bold text-cyan-300 font-mono">
                  {recommendedSchedule.timeWindow}
                </span>
                <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-medium border border-slate-700">
                  Estimasi Audiens Indonesia
                </span>
              </div>
            </div>

            {/* Set Specific Publishing Date & Time */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <label className="text-xs font-semibold text-slate-200 block">
                Tentukan Tanggal & Jam Rencana Publikasi Anda:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="datetime-local"
                  value={scheduledDateTime}
                  onChange={(e) => setScheduledDateTime(e.target.value)}
                  className="rounded-xl border border-slate-700 bg-[#121c2d] p-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />

                <div className="flex items-center gap-2">
                  <select
                    value={selectedPlanIdToLink}
                    onChange={(e) => setSelectedPlanIdToLink(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-700 bg-[#121c2d] p-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="">Tautkan ke Rencana Video (Opsional)...</option>
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 italic">
                *Catatan: Menyimpan jadwal ke sistem hanya memperbarui rencana produksi Anda. Revisitekno AI tidak akan mengunggah video otomatis ke channel YouTube (Anda memegang kendali penuh di YouTube Studio).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
