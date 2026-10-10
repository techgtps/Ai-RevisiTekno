import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  ChannelProfile,
  VideoIdea,
  VideoPlan,
  ScriptItem,
  ThumbnailConcept,
  SeoPackage,
  AppSettings,
  AppActivity,
  ApiStatusResponse,
} from '../types';
import { StorageService } from '../services/storage';
import { ApiService } from '../services/api';

export type NavTab =
  | 'dashboard'
  | 'assistant'
  | 'ideas'
  | 'planner'
  | 'scripts'
  | 'voice'
  | 'thumbnails'
  | 'seo'
  | 'library'
  | 'settings';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  apiStatus: ApiStatusResponse | null;
  refreshApiStatus: () => Promise<void>;

  channelProfile: ChannelProfile;
  updateChannelProfile: (profile: ChannelProfile) => void;

  appSettings: AppSettings;
  updateAppSettings: (settings: AppSettings) => void;

  ideas: VideoIdea[];
  addOrUpdateIdea: (idea: VideoIdea) => void;
  removeIdea: (id: string) => void;

  plans: VideoPlan[];
  addOrUpdatePlan: (plan: VideoPlan) => void;
  removePlan: (id: string) => void;

  scripts: ScriptItem[];
  addOrUpdateScript: (script: ScriptItem) => void;
  removeScript: (id: string) => void;

  thumbnails: ThumbnailConcept[];
  addOrUpdateThumbnail: (thumbnail: ThumbnailConcept) => void;
  removeThumbnail: (id: string) => void;

  seoPackages: SeoPackage[];
  addOrUpdateSeoPackage: (pkg: SeoPackage) => void;
  removeSeoPackage: (id: string) => void;

  activities: AppActivity[];

  // Cross-studio routing & transfer helpers
  pendingScriptInput: { title?: string; topic?: string; talkingPoints?: string[]; notes?: string } | null;
  setPendingScriptInput: (data: any) => void;

  pendingPlanInput: Partial<VideoPlan> | null;
  setPendingPlanInput: (data: Partial<VideoPlan> | null) => void;

  pendingVoiceText: string | null;
  setPendingVoiceText: (text: string | null) => void;

  pendingThumbnailInput: { title?: string; topic?: string; planId?: string; existing?: ThumbnailConcept } | null;
  setPendingThumbnailInput: (data: any) => void;

  pendingSeoInput: { title?: string; topic?: string; scriptSummary?: string; format?: any; planId?: string } | null;
  setPendingSeoInput: (data: any) => void;

  selectedPlanForDetail: VideoPlan | null;
  setSelectedPlanForDetail: (plan: VideoPlan | null) => void;

  selectedScriptForEdit: ScriptItem | null;
  setSelectedScriptForEdit: (script: ScriptItem | null) => void;

  // Actions
  transferIdeaToPlan: (idea: VideoIdea) => void;
  transferIdeaToScript: (idea: VideoIdea) => void;
  transferPlanToScript: (plan: VideoPlan) => void;
  transferPlanToThumbnail: (plan: VideoPlan) => void;
  transferPlanToSeo: (plan: VideoPlan) => void;
  transferScriptToVoice: (script: ScriptItem) => void;

  // Toasts
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Backup & Reset
  exportWorkspace: () => void;
  importWorkspace: (file: File) => Promise<boolean>;
  resetWorkspace: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [apiStatus, setApiStatus] = useState<ApiStatusResponse | null>(null);

  const [channelProfile, setChannelProfile] = useState<ChannelProfile>(StorageService.getProfile());
  const [appSettings, setAppSettings] = useState<AppSettings>(StorageService.getSettings());

  const [ideas, setIdeas] = useState<VideoIdea[]>(StorageService.getIdeas());
  const [plans, setPlans] = useState<VideoPlan[]>(StorageService.getPlans());
  const [scripts, setScripts] = useState<ScriptItem[]>(StorageService.getScripts());
  const [thumbnails, setThumbnails] = useState<ThumbnailConcept[]>(StorageService.getThumbnails());
  const [seoPackages, setSeoPackages] = useState<SeoPackage[]>(StorageService.getSeoPackages());
  const [activities, setActivities] = useState<AppActivity[]>(StorageService.getActivities());

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Transfer states
  const [pendingScriptInput, setPendingScriptInput] = useState<any>(null);
  const [pendingPlanInput, setPendingPlanInput] = useState<Partial<VideoPlan> | null>(null);
  const [pendingVoiceText, setPendingVoiceText] = useState<string | null>(null);
  const [pendingThumbnailInput, setPendingThumbnailInput] = useState<any>(null);
  const [pendingSeoInput, setPendingSeoInput] = useState<any>(null);
  const [selectedPlanForDetail, setSelectedPlanForDetail] = useState<VideoPlan | null>(null);
  const [selectedScriptForEdit, setSelectedScriptForEdit] = useState<ScriptItem | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const refreshApiStatus = useCallback(async () => {
    const status = await ApiService.getStatus();
    setApiStatus(status);
  }, []);

  useEffect(() => {
    refreshApiStatus();
  }, [refreshApiStatus]);

  // Update Activity helper
  const reloadActivities = () => {
    setActivities(StorageService.getActivities());
  };

  const updateChannelProfile = (profile: ChannelProfile) => {
    StorageService.saveProfile(profile);
    setChannelProfile(profile);
    reloadActivities();
    showToast('Profil channel berhasil diperbarui', 'success');
  };

  const updateAppSettings = (settings: AppSettings) => {
    StorageService.saveSettings(settings);
    setAppSettings(settings);
    showToast('Pengaturan aplikasi berhasil disimpan', 'success');
  };

  const addOrUpdateIdea = (idea: VideoIdea) => {
    const updated = StorageService.saveIdea(idea);
    setIdeas(updated);
    reloadActivities();
    showToast(`Ide "${idea.title}" berhasil disimpan!`, 'success');
  };

  const removeIdea = (id: string) => {
    const updated = StorageService.deleteIdea(id);
    setIdeas(updated);
    reloadActivities();
    showToast('Ide berhasil dihapus dari pustaka.', 'info');
  };

  const addOrUpdatePlan = (plan: VideoPlan) => {
    const updated = StorageService.savePlan(plan);
    setPlans(updated);
    reloadActivities();
    showToast(`Rencana video "${plan.title}" tersimpan.`, 'success');
  };

  const removePlan = (id: string) => {
    const updated = StorageService.deletePlan(id);
    setPlans(updated);
    reloadActivities();
    showToast('Rencana video berhasil dihapus.', 'info');
  };

  const addOrUpdateScript = (script: ScriptItem) => {
    const updated = StorageService.saveScript(script);
    setScripts(updated);
    reloadActivities();
    showToast(`Naskah "${script.title}" berhasil disimpan!`, 'success');
  };

  const removeScript = (id: string) => {
    const updated = StorageService.deleteScript(id);
    setScripts(updated);
    reloadActivities();
    showToast('Naskah berhasil dihapus.', 'info');
  };

  const addOrUpdateThumbnail = (thumb: ThumbnailConcept) => {
    const updated = StorageService.saveThumbnail(thumb);
    setThumbnails(updated);
    reloadActivities();
    showToast(`Konsep thumbnail "${thumb.conceptName || thumb.title}" tersimpan.`, 'success');
  };

  const removeThumbnail = (id: string) => {
    const updated = StorageService.deleteThumbnail(id);
    setThumbnails(updated);
    reloadActivities();
    showToast('Konsep thumbnail dihapus.', 'info');
  };

  const addOrUpdateSeoPackage = (pkg: SeoPackage) => {
    const updated = StorageService.saveSeoPackage(pkg);
    setSeoPackages(updated);
    reloadActivities();
    showToast(`Paket SEO "${pkg.selectedTitle || pkg.videoTitle}" berhasil disimpan!`, 'success');
  };

  const removeSeoPackage = (id: string) => {
    const updated = StorageService.deleteSeoPackage(id);
    setSeoPackages(updated);
    reloadActivities();
    showToast('Paket SEO berhasil dihapus.', 'info');
  };

  // Workflow Handlers
  const transferIdeaToPlan = (idea: VideoIdea) => {
    const newPlanData: Partial<VideoPlan> = {
      title: idea.title,
      topic: idea.coreConcept,
      summary: idea.coreConcept,
      hook: idea.hook,
      talkingPoints: idea.talkingPoints,
      researchNotes: idea.researchNeeded,
      status: 'Idea',
      checklist: [
        { id: 'c-init-1', text: 'Riset mendalam & verifikasi spesifikasi', done: false },
        { id: 'c-init-2', text: 'Tulis draf naskah di Script Studio', done: false },
        { id: 'c-init-3', text: 'Rancang konsep thumbnail di Thumbnail Lab', done: false },
      ],
    };
    setPendingPlanInput(newPlanData);
    setActiveTab('planner');
    showToast(`Ide dikirim ke Video Planner untuk dilengkapi.`, 'info');
  };

  const transferIdeaToScript = (idea: VideoIdea) => {
    setPendingScriptInput({
      title: idea.title,
      topic: idea.coreConcept,
      talkingPoints: idea.talkingPoints,
      notes: `Hook saran: ${idea.hook}\nStruktur saran: ${idea.structure}\nRiset wajib: ${idea.researchNeeded}`,
    });
    setSelectedScriptForEdit(null);
    setActiveTab('scripts');
    showToast(`Ide berhasil disiapkan di Script Studio.`, 'info');
  };

  const transferPlanToScript = (plan: VideoPlan) => {
    // Check if script already linked
    if (plan.linkedScriptId) {
      const existing = scripts.find((s) => s.id === plan.linkedScriptId);
      if (existing) {
        setSelectedScriptForEdit(existing);
        setActiveTab('scripts');
        showToast(`Membuka naskah terkait untuk "${plan.title}".`, 'info');
        return;
      }
    }
    setPendingScriptInput({
      title: plan.title,
      topic: plan.topic,
      talkingPoints: plan.talkingPoints,
      notes: `Hook: ${plan.hook}\nRiset: ${plan.researchNotes}`,
      linkedPlanId: plan.id,
    });
    setSelectedScriptForEdit(null);
    setActiveTab('scripts');
    showToast(`Menyiapkan penulisan naskah untuk rencana "${plan.title}".`, 'info');
  };

  const transferPlanToThumbnail = (plan: VideoPlan) => {
    if (plan.linkedThumbnailId) {
      const existing = thumbnails.find((t) => t.id === plan.linkedThumbnailId);
      if (existing) {
        setPendingThumbnailInput({
          title: plan.title,
          topic: plan.topic,
          planId: plan.id,
          existing,
        });
        setActiveTab('thumbnails');
        showToast(`Membuka thumbnail terkait untuk "${plan.title}".`, 'info');
        return;
      }
    }
    setPendingThumbnailInput({
      title: plan.title,
      topic: plan.topic,
      planId: plan.id,
    });
    setActiveTab('thumbnails');
    showToast(`Rencana video dialihkan ke Thumbnail Lab.`, 'info');
  };

  const transferPlanToSeo = (plan: VideoPlan) => {
    setPendingSeoInput({
      title: plan.title,
      topic: plan.topic,
      scriptSummary: plan.summary || plan.hook,
      format: plan.videoFormat,
      planId: plan.id,
    });
    setActiveTab('seo');
    showToast(`Rencana "${plan.title}" dialihkan ke SEO & Scheduler.`, 'info');
  };

  const transferScriptToVoice = (script: ScriptItem) => {
    setPendingVoiceText(script.content);
    setActiveTab('voice');
    showToast(`Naskah "${script.title}" dimasukkan ke Voice Studio.`, 'info');
  };

  const exportWorkspace = () => {
    const data = StorageService.exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revisitekno_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Pencadangan file JSON berhasil diunduh.', 'success');
  };

  const importWorkspace = async (file: File): Promise<boolean> => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const success = StorageService.importData(parsed);
      if (success) {
        setChannelProfile(StorageService.getProfile());
        setAppSettings(StorageService.getSettings());
        setIdeas(StorageService.getIdeas());
        setPlans(StorageService.getPlans());
        setScripts(StorageService.getScripts());
        setThumbnails(StorageService.getThumbnails());
        setSeoPackages(StorageService.getSeoPackages());
        reloadActivities();
        showToast('Pencadangan berhasil dipulihkan!', 'success');
        return true;
      } else {
        showToast('Format berkas tidak valid.', 'error');
        return false;
      }
    } catch (e) {
      showToast('Gagal membaca berkas JSON.', 'error');
      return false;
    }
  };

  const resetWorkspace = () => {
    StorageService.resetToDefault();
    setChannelProfile(StorageService.getProfile());
    setAppSettings(StorageService.getSettings());
    setIdeas(StorageService.getIdeas());
    setPlans(StorageService.getPlans());
    setScripts(StorageService.getScripts());
    setThumbnails(StorageService.getThumbnails());
    setSeoPackages(StorageService.getSeoPackages());
    reloadActivities();
    showToast('Workspace berhasil dikembalikan ke draf awal.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        apiStatus,
        refreshApiStatus,
        channelProfile,
        updateChannelProfile,
        appSettings,
        updateAppSettings,
        ideas,
        addOrUpdateIdea,
        removeIdea,
        plans,
        addOrUpdatePlan,
        removePlan,
        scripts,
        addOrUpdateScript,
        removeScript,
        thumbnails,
        addOrUpdateThumbnail,
        removeThumbnail,
        seoPackages,
        addOrUpdateSeoPackage,
        removeSeoPackage,
        activities,
        pendingScriptInput,
        setPendingScriptInput,
        pendingPlanInput,
        setPendingPlanInput,
        pendingVoiceText,
        setPendingVoiceText,
        pendingThumbnailInput,
        setPendingThumbnailInput,
        pendingSeoInput,
        setPendingSeoInput,
        selectedPlanForDetail,
        setSelectedPlanForDetail,
        selectedScriptForEdit,
        setSelectedScriptForEdit,
        transferIdeaToPlan,
        transferIdeaToScript,
        transferPlanToScript,
        transferPlanToThumbnail,
        transferPlanToSeo,
        transferScriptToVoice,
        toasts,
        showToast,
        removeToast,
        exportWorkspace,
        importWorkspace,
        resetWorkspace,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
