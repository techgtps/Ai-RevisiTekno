import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { ToastContainer } from './components/common/ToastContainer';
import { QuickActionModal } from './components/common/QuickActionModal';

// Pages
import { Dashboard } from './pages/Dashboard';
import { AiAssistant } from './pages/AiAssistant';
import { IdeaGenerator } from './pages/IdeaGenerator';
import { VideoPlanner } from './pages/VideoPlanner';
import { ScriptStudio } from './pages/ScriptStudio';
import { VoiceStudio } from './pages/VoiceStudio';
import { ThumbnailLab } from './pages/ThumbnailLab';
import { YouTubeSeoScheduler } from './pages/YouTubeSeoScheduler';
import { ContentLibrary } from './pages/ContentLibrary';
import { SettingsPage } from './pages/Settings';

const MainAppContent: React.FC = () => {
  const { activeTab } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onOpenQuickAction={() => setQuickActionOpen(true)} />;
      case 'assistant':
        return <AiAssistant />;
      case 'ideas':
        return <IdeaGenerator />;
      case 'planner':
        return <VideoPlanner />;
      case 'scripts':
        return <ScriptStudio />;
      case 'voice':
        return <VoiceStudio />;
      case 'thumbnails':
        return <ThumbnailLab />;
      case 'seo':
        return <YouTubeSeoScheduler />;
      case 'library':
        return <ContentLibrary />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard onOpenQuickAction={() => setQuickActionOpen(true)} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#070b12] text-slate-100 font-sans antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Sidebar Navigation */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
        onOpenQuickAction={() => setQuickActionOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <Navbar
          onToggleMobile={() => setMobileMenuOpen(!mobileMenuOpen)}
          onOpenQuickAction={() => setQuickActionOpen(true)}
        />

        <main className="flex-1 overflow-y-auto">
          {renderActivePage()}
        </main>
      </div>

      {/* Global Quick Action Modal */}
      <QuickActionModal
        isOpen={quickActionOpen}
        onClose={() => setQuickActionOpen(false)}
      />

      {/* Toast Feedback */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
