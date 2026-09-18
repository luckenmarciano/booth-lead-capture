import React, { useState, useEffect } from 'react';
import {
  Monitor,
  Smartphone,
  LayoutDashboard,
  QrCode,
  Server,
  Globe,
  CheckCircle,
  XCircle,
  Sparkles,
  Settings,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  X
} from 'lucide-react';
import { AppMode, Language } from '../types/lead';
import { getApiBaseUrl, setApiBaseUrl } from '../services/api';

interface ModeLauncherProps {
  onSelectMode: (mode: AppMode) => void;
  lang: Language;
  onSetLang: (lang: Language) => void;
  onClose?: () => void;
}

export const ModeLauncher: React.FC<ModeLauncherProps> = ({
  onSelectMode,
  lang,
  onSetLang,
  onClose
}) => {
  const [vpsUrl, setVpsUrl] = useState('');
  const [showVpsSettings, setShowVpsSettings] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('api_base_url');
    if (saved) {
      setVpsUrl(saved.replace(/\/api\/?$/, ''));
    } else {
      setVpsUrl('');
    }
  }, []);

  const handleSaveVpsUrl = async (urlToSave: string) => {
    let formatted = urlToSave.trim().replace(/\/+$/, '');
    if (formatted && !formatted.startsWith('http://') && !formatted.startsWith('https://')) {
      formatted = 'http://' + formatted;
    }
    const apiPath = formatted ? `${formatted}/api` : '/api';
    localStorage.setItem('api_base_url', apiPath);
    setApiBaseUrl(apiPath);
    setVpsUrl(formatted);
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage(lang === 'id' ? 'Menghubungkan ke server...' : 'Connecting to server...');
    try {
      const formatted = vpsUrl.trim().replace(/\/+$/, '');
      const testBase = formatted ? (formatted.startsWith('http') ? formatted : `http://${formatted}`) : '';
      const endpoint = testBase ? `${testBase}/api/health` : '/api/health';

      const res = await fetch(endpoint, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        setTestStatus('success');
        setTestMessage(lang === 'id' ? 'Terhubung! Server VPS aktif.' : 'Connected! VPS Server is online.');
        await handleSaveVpsUrl(vpsUrl);
      } else {
        setTestStatus('failed');
        setTestMessage(lang === 'id' ? `Server merespons HTTP ${res.status}` : `Server responded HTTP ${res.status}`);
      }
    } catch (err: any) {
      setTestStatus('failed');
      setTestMessage(lang === 'id' ? 'Gagal terhubung. Pastikan IP/Domain VPS benar dan server aktif.' : 'Connection failed. Check IP/Domain and server status.');
    }
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        backgroundColor: '#0f2f3d',
        backgroundImage: 'radial-gradient(circle at 50% 0%, #1f5c4a 0%, #0f2f3d 75%)',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        boxSizing: 'border-box',
        position: 'relative'
      }}
    >
      {/* Top Bar: Language & Optional Close */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 10
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(8px)',
            padding: '3px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <button
            type="button"
            onClick={() => onSetLang('en')}
            style={{
              padding: '5px 10px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 700,
              backgroundColor: lang === 'en' ? '#ffffff' : 'transparent',
              color: lang === 'en' ? '#0f2f3d' : '#ffffff'
            }}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => onSetLang('id')}
            style={{
              padding: '5px 10px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 700,
              backgroundColor: lang === 'id' ? '#ffffff' : 'transparent',
              color: lang === 'id' ? '#0f2f3d' : '#ffffff'
            }}
          >
            ID
          </button>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Main Launcher Box */}
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px'
        }}
      >
        {/* Header Branding */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(228, 240, 233, 0.15)',
              border: '1px solid rgba(228, 240, 233, 0.25)',
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: '#d4c5a9',
              marginBottom: '12px'
            }}
          >
            <Sparkles size={14} color="#e6d5b8" />
            <span>Booth Lead Capture Android</span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(24px, 5vw, 32px)',
              fontWeight: 800,
              margin: '0 0 6px 0',
              letterSpacing: '-0.02em',
              color: '#ffffff'
            }}
          >
            {lang === 'id' ? 'Pilih Mode Aplikasi' : 'Select App Mode'}
          </h1>
          <p style={{ fontSize: '13.5px', color: '#b2c8d2', margin: 0, maxWidth: '440px' }}>
            {lang === 'id'
              ? 'Pilih tampilan mode kerja yang ingin Anda jalankan di perangkat Android ini.'
              : 'Choose which operational mode to launch on this Android device.'}
          </p>
        </div>

        {/* 4 Mode Grid Cards */}
        <div
          style={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '14px'
          }}
        >
          {/* Card 1: Tablet Kiosk */}
          <div
            onClick={() => onSelectMode('kiosk')}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(12px)',
              borderRadius: '18px',
              border: '1.5px solid rgba(255, 255, 255, 0.15)',
              padding: '20px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
            }}
            className="sa-mode-card"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: '#1f5c4a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}
              >
                <Monitor size={22} />
              </div>
              <ArrowRight size={18} color="#b2c8d2" />
            </div>

            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
                {lang === 'id' ? 'Kiosk Tablet Meja' : 'Desk Tablet Kiosk'}
              </div>
              <div style={{ fontSize: '12px', color: '#b2c8d2', lineHeight: 1.4 }}>
                {lang === 'id'
                  ? 'Buku tamu layar penuh di meja booth. Dilengkapi video screensaver & QR code scan.'
                  : 'Distraction-free guestbook for booth visitors. Features video screensaver & QR scan.'}
              </div>
            </div>
          </div>

          {/* Card 2: Mobile Visitor Form */}
          <div
            onClick={() => onSelectMode('mobile')}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(12px)',
              borderRadius: '18px',
              border: '1.5px solid rgba(255, 255, 255, 0.15)',
              padding: '20px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
            }}
            className="sa-mode-card"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: '#2f7d5c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}
              >
                <Smartphone size={22} />
              </div>
              <ArrowRight size={18} color="#b2c8d2" />
            </div>

            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
                {lang === 'id' ? 'Formulir Mobile HP' : 'Mobile Visitor Form'}
              </div>
              <div style={{ fontSize: '12px', color: '#b2c8d2', lineHeight: 1.4 }}>
                {lang === 'id'
                  ? 'Formulir pengunjung mandiri dengan desain responsif untuk smartphone.'
                  : 'Optimized guestbook interface for smartphones and visitor device scanning.'}
              </div>
            </div>
          </div>

          {/* Card 3: Admin Dashboard */}
          <div
            onClick={() => onSelectMode('admin')}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(12px)',
              borderRadius: '18px',
              border: '1.5px solid rgba(255, 255, 255, 0.15)',
              padding: '20px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
            }}
            className="sa-mode-card"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: '#0f2f3d',
                  border: '1px solid rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}
              >
                <LayoutDashboard size={22} />
              </div>
              <ArrowRight size={18} color="#b2c8d2" />
            </div>

            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
                {lang === 'id' ? 'Dashboard Admin' : 'Admin Dashboard'}
              </div>
              <div style={{ fontSize: '12px', color: '#b2c8d2', lineHeight: 1.4 }}>
                {lang === 'id'
                  ? 'Kelola data pengunjung real-time, status sync, ekspor Excel/PDF & PIN proteksi.'
                  : 'Monitor real-time leads, sync status, export Excel/PDF & PIN protection.'}
              </div>
            </div>
          </div>

          {/* Card 4: Standee Maker */}
          <div
            onClick={() => onSelectMode('standee')}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(12px)',
              borderRadius: '18px',
              border: '1.5px solid rgba(255, 255, 255, 0.15)',
              padding: '20px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
            }}
            className="sa-mode-card"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: '#8a5a00',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}
              >
                <QrCode size={22} />
              </div>
              <ArrowRight size={18} color="#b2c8d2" />
            </div>

            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
                {lang === 'id' ? 'Standee QR Meja' : 'Desk QR Standee Maker'}
              </div>
              <div style={{ fontSize: '12px', color: '#b2c8d2', lineHeight: 1.4 }}>
                {lang === 'id'
                  ? 'Cetak poster QR Code meja booth untuk dipindai oleh pengunjung.'
                  : 'Generate & print booth desk QR posters for instant visitor scanning.'}
              </div>
            </div>
          </div>
        </div>

        {/* VPS Server URL Settings Bar */}
        <div
          style={{
            width: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
              <Server size={16} color="#4ade80" />
              <span>{lang === 'id' ? 'Koneksi Server Online (VPS):' : 'Online VPS Server Connection:'}</span>
              <span style={{ color: '#4ade80', fontWeight: 700, backgroundColor: 'rgba(74, 222, 128, 0.15)', padding: '2px 8px', borderRadius: '6px', fontSize: '11.5px' }}>
                {vpsUrl || (lang === 'id' ? 'Mode Lokal Perangkat (Offline First)' : 'Local Offline First')}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowVpsSettings(!showVpsSettings)}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '6px 12px',
                color: '#ffffff',
                fontSize: '11.5px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Settings size={14} />
              <span>{showVpsSettings ? (lang === 'id' ? 'Tutup Pengaturan' : 'Close Settings') : (lang === 'id' ? 'Atur IP/Domain VPS' : 'Configure VPS IP/Domain')}</span>
            </button>
          </div>

          {/* Collapsible VPS Settings Input */}
          {showVpsSettings && (
            <div style={{ borderTop: '1px dashed rgba(255,255,255,0.15)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '12px', color: '#b2c8d2' }}>
                {lang === 'id'
                  ? 'Masukkan IP VPS atau Domain tempat backend server berjalan (misal: http://186.70.73.12:3001 atau https://booth.domain.com).'
                  : 'Enter your VPS IP address or Domain where backend server is running (e.g. http://186.70.73.12:3001 or https://booth.domain.com).'}
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="e.g. http://186.70.73.12:3001"
                  value={vpsUrl}
                  onChange={(e) => setVpsUrl(e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: '220px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.25)',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    color: '#ffffff',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />

                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testStatus === 'testing'}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#1f5c4a',
                    color: '#ffffff',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <RefreshCw size={14} className={testStatus === 'testing' ? 'spin' : ''} />
                  <span>{testStatus === 'testing' ? (lang === 'id' ? 'Menguji...' : 'Testing...') : (lang === 'id' ? 'Simpan & Tes Koneksi' : 'Save & Test Connection')}</span>
                </button>
              </div>

              {testStatus !== 'idle' && (
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: testStatus === 'success' ? '#4ade80' : '#f87171',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {testStatus === 'success' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                  <span>{testMessage}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModeLauncher;
