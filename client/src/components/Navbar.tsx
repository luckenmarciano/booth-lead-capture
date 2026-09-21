import React from 'react';
import {
  Tablet,
  Smartphone,
  LayoutDashboard,
  QrCode,
  Settings,
  RefreshCw,
  Wifi,
  WifiOff,
  Maximize2,
  Grid
} from 'lucide-react';
import { AppMode, BoothSettings, Language } from '../types/lead';
import { DICT } from '../data/dictionary';

interface NavbarProps {
  currentMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  onOpenSettings: () => void;
  settings: BoothSettings;
  lang: Language;
  onSetLang: (lang: Language) => void;
  isSimOffline: boolean;
  onToggleSimOffline: () => void;
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  onForceSync: () => void;
  onToggleFullscreen: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onSelectMode,
  onOpenSettings,
  settings,
  lang,
  onSetLang,
  isSimOffline,
  onToggleSimOffline,
  isOnline,
  isSyncing,
  onForceSync,
  pendingCount,
  onToggleFullscreen
}) => {
  const t = DICT[lang];

  const tabBtnStyle = (active: boolean) => ({
    padding: '10px 16px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '12.5px',
    fontWeight: 600,
    letterSpacing: '0.2px',
    whiteSpace: 'nowrap' as const,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: active ? '#ffffff' : 'transparent',
    color: active ? '#0f2f3d' : 'rgba(255, 255, 255, 0.75)',
    transition: 'all 0.18s ease'
  });

  const langBtnStyle = (active: boolean) => ({
    padding: '7px 12px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.3px',
    backgroundColor: active ? '#ffffff' : 'transparent',
    color: active ? '#0f2f3d' : 'rgba(255, 255, 255, 0.7)',
    transition: 'all 0.18s ease'
  });

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: '#0f2f3d',
        color: '#ffffff',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        boxShadow: '0 2px 16px rgba(0, 0, 0, 0.2)'
      }}
      className="no-print"
    >
      {/* Brand & Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => onSelectMode('kiosk')}>
        <img
          src="/osct-logo.png"
          alt="Oil Spill Combat Team"
          style={{
            width: '40px',
            height: '40px',
            objectFit: 'contain',
            flex: 'none',
            background: '#ffffff',
            borderRadius: '50%'
          }}
        />
        <img
          src="/sli-logo.png"
          alt="SLICKBAR"
          style={{
            width: '40px',
            height: '40px',
            objectFit: 'contain',
            flex: 'none',
            background: '#ffffff',
            borderRadius: '50%'
          }}
        />
        <div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '18px',
              fontWeight: 600,
              letterSpacing: '0.2px',
              lineHeight: 1.15
            }}
          >
            {settings.company_name || 'SpillAsia 2026'}
          </div>
          <div
            style={{
              fontSize: '10.5px',
              color: '#c9b896',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              fontWeight: 500
            }}
          >
            {t.brandTag}
          </div>
        </div>
      </div>

      {/* Center Nav Modes */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <div
          style={{
            display: 'flex',
            gap: '4px',
            background: 'rgba(255, 255, 255, 0.08)',
            padding: '4px',
            borderRadius: '11px',
            flexWrap: 'wrap'
          }}
        >
          <button
            type="button"
            style={tabBtnStyle(currentMode === 'kiosk')}
            onClick={() => onSelectMode('kiosk')}
          >
            <Tablet size={15} />
            <span>{t.navKiosk}</span>
          </button>

          <button
            type="button"
            style={tabBtnStyle(currentMode === 'mobile')}
            onClick={() => onSelectMode('mobile')}
          >
            <Smartphone size={15} />
            <span>{t.navForm}</span>
          </button>

          <button
            type="button"
            style={tabBtnStyle(currentMode === 'admin')}
            onClick={() => onSelectMode('admin')}
          >
            <LayoutDashboard size={15} />
            <span>{t.navAdmin}</span>
          </button>

          <button
            type="button"
            style={tabBtnStyle(currentMode === 'standee')}
            onClick={() => onSelectMode('standee')}
          >
            <QrCode size={15} />
            <span>{t.navStandee}</span>
          </button>

          <button
            type="button"
            style={tabBtnStyle(currentMode === 'launcher')}
            onClick={() => onSelectMode('launcher')}
            title="App Launcher & VPS Server Config"
          >
            <Grid size={15} />
            <span>Launcher</span>
          </button>
        </div>
      </div>

      {/* Right Controls: Offline Sync, Language, Fullscreen, Settings */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        {/* Offline / Online Realtime Sync Status Badge */}
        <button
          type="button"
          onClick={onForceSync}
          title={isOnline ? 'Online — Click to sync manually' : 'Offline — Click to try syncing'}
          style={{
            padding: '6px 12px',
            borderRadius: '999px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: isOnline ? 'rgba(31, 92, 74, 0.4)' : 'rgba(185, 28, 28, 0.4)',
            color: '#ffffff',
            transition: 'all 0.18s ease'
          }}
        >
          {isSyncing ? (
            <RefreshCw size={13} className="spin" />
          ) : isOnline ? (
            <Wifi size={13} color="#4ade80" />
          ) : (
            <WifiOff size={13} color="#f87171" />
          )}

          <span>
            {isSyncing
              ? 'Syncing...'
              : isOnline
              ? pendingCount > 0
                ? `${pendingCount} Pending`
                : 'Online'
              : 'Offline Mode (Simulated)'}
          </span>
        </button>

        {/* Fullscreen Button */}
        <button
          type="button"
          onClick={onToggleFullscreen}
          title={t.subFullscreen}
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <Maximize2 size={16} />
        </button>

        {/* Language Selector */}
        <div
          style={{
            display: 'inline-flex',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            padding: '3px',
            borderRadius: '8px'
          }}
        >
          <button
            type="button"
            style={langBtnStyle(lang === 'en')}
            onClick={() => onSetLang('en')}
          >
            EN
          </button>
          <button
            type="button"
            style={langBtnStyle(lang === 'id')}
            onClick={() => onSetLang('id')}
          >
            ID
          </button>
        </div>

        {/* Settings Button */}
        <button
          type="button"
          onClick={onOpenSettings}
          title={t.settingsTitle}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
