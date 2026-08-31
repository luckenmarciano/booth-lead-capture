import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  QrCode,
  ChevronRight,
  Maximize2,
  Lock,
  Tv
} from 'lucide-react';
import QRCode from 'qrcode';
import { BoothSettings, LeadStats, Language } from '../types/lead';
import { DICT } from '../data/dictionary';

interface KioskHomeProps {
  settings: BoothSettings;
  stats?: LeadStats | null;
  lang: Language;
  onSetLang: (lang: Language) => void;
  onOpenForm: () => void;
  onPlayVideo: () => void;
  onOpenAdmin: () => void;
  onToggleFullscreen: () => void;
  isSimOffline?: boolean;
}

export const KioskHome: React.FC<KioskHomeProps> = ({
  settings,
  lang,
  onSetLang,
  onOpenForm,
  onPlayVideo,
  onOpenAdmin,
  onToggleFullscreen
}) => {
  const t = DICT[lang];

  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const targetUrl = `${origin}?mode=mobile&booth=${encodeURIComponent(settings.booth_id)}`;

    QRCode.toDataURL(targetUrl, {
      width: 280,
      margin: 1.5,
      color: {
        dark: '#0f2f3d',
        light: '#ffffff'
      }
    })
      .then(setQrDataUrl)
      .catch(console.error);
  }, [settings.booth_id]);

  return (
    <div
      style={{
        minHeight: '100dvh',
        backgroundColor: '#fbf9f4',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative'
      }}
    >
      {/* 1. ELEGANT KIOSK HEADER (Distraction-Free) */}
      <header
        style={{
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          borderBottom: '1px solid #e6e0cd',
          backgroundColor: '#ffffff',
          boxShadow: '0 2px 10px rgba(15, 47, 61, 0.03)'
        }}
      >
        {/* Brand & Event Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src="/osct-logo.png"
            alt="Oil Spill Combat Team"
            style={{
              width: '42px',
              height: '42px',
              objectFit: 'contain',
              flexShrink: 0
            }}
          />
          <div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '18px',
                color: '#0f2f3d',
                lineHeight: 1.2
              }}
            >
              {settings.company_name || 'SpillAsia 2026'}
            </div>
            <div
              style={{
                fontSize: '10.5px',
                color: '#8a8371',
                letterSpacing: '0.6px',
                textTransform: 'uppercase',
                fontWeight: 600
              }}
            >
              {settings.kiosk_venue || 'Jakarta Convention Center'} • {settings.booth_id || 'BOOTH-A12'}
            </div>
          </div>
        </div>

        {/* Right Action Tools: Language + Video + Fullscreen + Discreet Admin Lock */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Language Switcher */}
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: '#f4f1ea',
              padding: '3px',
              borderRadius: '8px',
              border: '1px solid #e6e0cd'
            }}
          >
            <button
              type="button"
              onClick={() => onSetLang('id')}
              style={{
                padding: '8px 12px',
                minHeight: '34px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 700,
                backgroundColor: lang === 'id' ? '#0f2f3d' : 'transparent',
                color: lang === 'id' ? '#ffffff' : '#6b6455',
                transition: 'all 0.15s ease'
              }}
            >
              ID
            </button>
            <button
              type="button"
              onClick={() => onSetLang('en')}
              style={{
                padding: '8px 12px',
                minHeight: '34px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 700,
                backgroundColor: lang === 'en' ? '#0f2f3d' : 'transparent',
                color: lang === 'en' ? '#ffffff' : '#6b6455',
                transition: 'all 0.15s ease'
              }}
            >
              EN
            </button>
          </div>

          {/* Play Video Screensaver Button */}
          {settings.video_enabled && (
            <button
              type="button"
              onClick={onPlayVideo}
              title="Putar Video Company Profile"
              style={{
                padding: '9px 14px',
                minHeight: '38px',
                borderRadius: '8px',
                border: '1px solid #e0d9c4',
                backgroundColor: '#ffffff',
                color: '#1f5c4a',
                fontSize: '11.5px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <Tv size={14} />
              <span>Video</span>
            </button>
          )}

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={onToggleFullscreen}
            title="Layar Penuh Kiosk"
            style={{
              padding: '9px 11px',
              minHeight: '38px',
              minWidth: '38px',
              borderRadius: '8px',
              border: '1px solid #e0d9c4',
              backgroundColor: '#ffffff',
              color: '#0f2f3d',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Maximize2 size={14} />
          </button>

          {/* Discreet Admin Lock Button */}
          <button
            type="button"
            onClick={onOpenAdmin}
            title="Akses Admin Dashboard (Perlu PIN)"
            style={{
              padding: '9px 11px',
              minHeight: '38px',
              minWidth: '38px',
              borderRadius: '8px',
              border: '1px solid #e0d9c4',
              backgroundColor: '#ffffff',
              color: '#8a8371',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
          >
            <Lock size={14} />
          </button>
        </div>
      </header>

      {/* 2. MAIN INTERACTIVE KIOSK CONTENT */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 24px'
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '1040px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '40px',
            alignItems: 'center'
          }}
        >
          {/* LEFT SIDE: WELCOME, INVITATION & GIANT BUTTON */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
          >
            {/* Event Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '999px',
                background: 'rgba(31, 92, 74, 0.08)',
                border: '1px solid rgba(31, 92, 74, 0.2)',
                color: '#1f5c4a',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
                width: 'fit-content'
              }}
            >
              <Sparkles size={13} color="#b8933e" />
              <span>{settings.date_range || t.exhibitionDate}</span>
            </div>

            {/* Main Welcome Heading */}
            <div>
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(27px, 4vw, 42px)',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: '#0f2f3d',
                  lineHeight: 1.15,
                  marginBottom: '12px'
                }}
              >
                {t.heroWelcome}
              </h1>
              <p
                style={{
                  fontSize: '14.5px',
                  color: '#6b6455',
                  lineHeight: 1.6,
                  maxWidth: '460px'
                }}
              >
                {t.heroDesc}
              </p>
            </div>

            {/* GIANT PRIMARY BUTTON: "ISI BUKU TAMU" */}
            <button
              type="button"
              onClick={onOpenForm}
              style={{
                width: '100%',
                maxWidth: '420px',
                padding: '20px 28px',
                borderRadius: '16px',
                border: 'none',
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #1f5c4a 0%, #17483a 60%, #0f2f3d 100%)',
                color: '#ffffff',
                boxShadow: '0 12px 32px rgba(31, 92, 74, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 16px 40px rgba(31, 92, 74, 0.45)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(31, 92, 74, 0.35)';
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <div
                  style={{
                    fontSize: '11px',
                    letterSpacing: '1.2px',
                    textTransform: 'uppercase',
                    color: '#c9b896',
                    fontWeight: 700,
                    marginBottom: '4px'
                  }}
                >
                  {t.btnRegisterSub}
                </div>
                <div
                  style={{
                    fontSize: '21px',
                    fontWeight: 700,
                    letterSpacing: '0.2px'
                  }}
                >
                  {t.btnRegister}
                </div>
              </div>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 'none'
                }}
              >
                <ChevronRight size={22} />
              </div>
            </button>
          </div>

          {/* RIGHT SIDE: DYNAMIC QR CODE CARD */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              padding: '28px 24px',
              border: '1px solid #e6e0cd',
              boxShadow: '0 16px 48px rgba(15, 47, 61, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '16px',
              maxWidth: '380px',
              margin: '0 auto'
            }}
          >
            {/* Live Indicator */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '999px',
                backgroundColor: '#e4f0e9',
                color: '#1f5c4a',
                fontSize: '11px',
                fontWeight: 600
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: '#2f7d5c',
                  display: 'inline-block',
                  animation: 'sa-pulse 1.8s infinite'
                }}
              />
              <span>{t.qrLiveBadge}</span>
            </div>

            {/* QR Card Frame */}
            <div
              style={{
                backgroundColor: '#fbf9f4',
                padding: '16px',
                borderRadius: '18px',
                border: '2px dashed #d6ceb8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Scan QR untuk Isi Form di HP"
                  style={{
                    width: '100%',
                    maxWidth: '220px',
                    height: 'auto',
                    display: 'block',
                    borderRadius: '8px'
                  }}
                />
              ) : (
                <div style={{ width: '220px', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <QrCode size={48} color="#0f2f3d" />
                </div>
              )}
            </div>

            {/* Instruction */}
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: '16px',
                  color: '#0f2f3d',
                  marginBottom: '4px'
                }}
              >
                {t.qrHeaderTitle}
              </div>
              <p
                style={{
                  fontSize: '12.5px',
                  color: '#6b6455',
                  lineHeight: 1.45,
                  margin: 0
                }}
              >
                {t.qrHeaderSubtitle}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SUBTLE FOOTER */}
      <footer
        style={{
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '6px 16px',
          borderTop: '1px solid #ede8db',
          fontSize: '11px',
          color: '#8a8371'
        }}
      >
        <div>
          {settings.company_name} • {settings.kiosk_venue}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#2f7d5c',
              display: 'inline-block'
            }}
          />
          <span>Offline & Real-time Auto-Sync Ready</span>
        </div>
      </footer>
    </div>
  );
};
export default KioskHome;
