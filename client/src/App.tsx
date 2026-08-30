import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { KioskHome } from './components/KioskHome';
import { VisitorFormModal } from './components/VisitorFormModal';
import { MobileVisitorForm } from './components/MobileVisitorForm';
import { ThankYouScreen } from './components/ThankYouScreen';
import { AdminDashboard } from './components/AdminDashboard';
import { QRStandeeGenerator } from './components/QRStandeeGenerator';
import { VideoScreensaver } from './components/VideoScreensaver';
import { SettingsModal } from './components/SettingsModal';
import { AppMode, BoothSettings, Lead, LeadStats, Language } from './types/lead';
import { DEFAULT_SETTINGS } from './data/defaultData';
import { offlineDB } from './services/db';
import { fetchSettingsApi, fetchStats, getApiBaseUrl } from './services/api';
import { useIdleTimer } from './hooks/useIdleTimer';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import { useFullscreen } from './hooks/useFullscreen';

export const App: React.FC = () => {
  // Check URL parameters for initial mode (e.g. ?mode=mobile from QR scan)
  const getInitialMode = (): { mode: AppMode; isDirectMobile: boolean } => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlMode = params.get('mode');
      if (urlMode === 'mobile' || urlMode === 'form') return { mode: 'mobile', isDirectMobile: true };
      if (urlMode === 'admin') return { mode: 'admin', isDirectMobile: false };
      if (urlMode === 'standee') return { mode: 'standee', isDirectMobile: false };
    }
    return { mode: 'kiosk', isDirectMobile: false };
  };

  const initial = getInitialMode();
  const [currentMode, setCurrentMode] = useState<AppMode>(initial.mode);
  const [lang, setLang] = useState<Language>('id');
  const [isSimOffline, setIsSimOffline] = useState(false);

  const [settings, setSettings] = useState<BoothSettings>(DEFAULT_SETTINGS);
  const [stats, setStats] = useState<LeadStats | null>(null);

  const [isTabletFormOpen, setIsTabletFormOpen] = useState(false);
  const [submittedLead, setSubmittedLead] = useState<Lead | null>(null);
  const [isScreensaverActive, setIsScreensaverActive] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { isOnline, isSyncing, pendingCount, triggerSync } = useNetworkStatus();
  const { toggleFullscreen } = useFullscreen();

  // Load Settings and Stats initially
  const loadInitialData = useCallback(async () => {
    try {
      const localSettings = await offlineDB.getLocalSettings();
      setSettings(localSettings);

      // Try fetching from backend if online
      try {
        const remoteSettings = await fetchSettingsApi();
        if (remoteSettings.success && remoteSettings.data) {
          setSettings((prev) => ({ ...prev, ...remoteSettings.data }));
          offlineDB.saveSettingsLocally(remoteSettings.data);
        }
        const remoteStats = await fetchStats();
        if (remoteStats.success) {
          setStats(remoteStats.data);
        }
      } catch {}
    } catch (err) {
      console.warn('[App] Error loading initial settings:', err);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Realtime Server-Sent Events (SSE) listener
  useEffect(() => {
    const base = getApiBaseUrl();
    const eventSourceUrl = `${base.replace(/\/api$/, '')}/api/events`;
    let es: EventSource | null = null;

    try {
      es = new EventSource(eventSourceUrl);

      es.addEventListener('stats_updated', (e: MessageEvent) => {
        try {
          const updatedStats = JSON.parse(e.data);
          setStats(updatedStats);
        } catch {}
      });

      es.addEventListener('settings_updated', (e: MessageEvent) => {
        try {
          const updatedSettings = JSON.parse(e.data);
          setSettings((prev) => ({ ...prev, ...updatedSettings }));
          offlineDB.saveSettingsLocally(updatedSettings);
        } catch {}
      });
    } catch (err) {
      console.warn('[SSE] EventSource connection failed (offline mode):', err);
    }

    return () => {
      es?.close();
    };
  }, []);

  // Idle Timer for Video Screensaver (active in kiosk mode when no modals or forms open)
  const isIdleLooperEligible =
    currentMode === 'kiosk' &&
    settings.video_enabled &&
    settings.idle_timeout_sec > 0 &&
    !isTabletFormOpen &&
    !isSettingsOpen &&
    !submittedLead;

  const { resetTimer, wake } = useIdleTimer({
    timeoutSeconds: settings.idle_timeout_sec || 60,
    enabled: isIdleLooperEligible,
    onIdle: () => {
      setIsScreensaverActive(true);
    },
    onActive: () => {}
  });

  const handleWakeFromScreensaver = () => {
    setIsScreensaverActive(false);
    wake();
  };

  const handleFormSubmitted = (lead: Lead) => {
    setIsTabletFormOpen(false);
    setSubmittedLead(lead);
    // Refresh stats
    fetchStats().then((res) => {
      if (res.success) setStats(res.data);
    }).catch(() => {});
  };

  const handleResetAfterSubmission = () => {
    setSubmittedLead(null);
    resetTimer();
  };

  // Only show Admin Navbar on Admin and Standee Generator screens
  const showAdminNavbar = currentMode === 'admin' || currentMode === 'standee';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f1ea', display: 'flex', flexDirection: 'column' }}>
      {/* Video Screensaver Overlay (Touch-to-wake) */}
      {isScreensaverActive && (
        <VideoScreensaver
          settings={settings}
          lang={lang}
          onWake={handleWakeFromScreensaver}
        />
      )}

      {/* Top Navbar ONLY for Admin & Standee Maker (Hidden for Kiosk and Mobile Visitors) */}
      {showAdminNavbar && (
        <Navbar
          currentMode={currentMode}
          onSelectMode={(mode) => {
            setCurrentMode(mode);
            setSubmittedLead(null);
            setIsTabletFormOpen(false);
            setIsScreensaverActive(false);
          }}
          onOpenSettings={() => setIsSettingsOpen(true)}
          settings={settings}
          lang={lang}
          onSetLang={setLang}
          isSimOffline={isSimOffline}
          onToggleSimOffline={() => setIsSimOffline(!isSimOffline)}
          isOnline={isOnline && !isSimOffline}
          isSyncing={isSyncing}
          pendingCount={pendingCount}
          onForceSync={triggerSync}
          onToggleFullscreen={toggleFullscreen}
        />
      )}

      {/* Main Content Area */}
      <main style={{ flex: 1, position: 'relative' }}>
        {/* VIEW 1: THANK YOU SCREEN (If lead just submitted on kiosk tablet) */}
        {submittedLead && currentMode === 'kiosk' ? (
          <ThankYouScreen
            lead={submittedLead}
            settings={settings}
            lang={lang}
            onReset={handleResetAfterSubmission}
            isKioskMode={true}
          />
        ) : (
          <>
            {/* VIEW 2: KIOSK TABLET HOME (Distraction-Free) */}
            {currentMode === 'kiosk' && (
              <KioskHome
                settings={settings}
                stats={stats}
                lang={lang}
                onSetLang={setLang}
                onOpenForm={() => setIsTabletFormOpen(true)}
                onPlayVideo={() => setIsScreensaverActive(true)}
                onOpenAdmin={() => setCurrentMode('admin')}
                onToggleFullscreen={toggleFullscreen}
                isSimOffline={isSimOffline}
              />
            )}

            {/* VIEW 3: MOBILE VISITOR FORM (Clean & Standalone) */}
            {currentMode === 'mobile' && (
              <MobileVisitorForm
                settings={settings}
                lang={lang}
                onSetLang={setLang}
                onSuccess={handleFormSubmitted}
                isSimOffline={isSimOffline}
              />
            )}

            {/* VIEW 4: ADMIN DASHBOARD */}
            {currentMode === 'admin' && (
              <AdminDashboard
                settings={settings}
                lang={lang}
                onOpenSettings={() => setIsSettingsOpen(true)}
              />
            )}

            {/* VIEW 5: PRINTABLE QR STANDEE MEJA */}
            {currentMode === 'standee' && (
              <QRStandeeGenerator
                settings={settings}
                lang={lang}
              />
            )}
          </>
        )}
      </main>

      {/* In-Tablet Form Modal */}
      <VisitorFormModal
        isOpen={isTabletFormOpen}
        onClose={() => setIsTabletFormOpen(false)}
        settings={settings}
        lang={lang}
        onSuccess={handleFormSubmitted}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentSettings={settings}
        onSaveSettings={(newSettings) => {
          setSettings(newSettings);
        }}
      />
    </div>
  );
};

export default App;
