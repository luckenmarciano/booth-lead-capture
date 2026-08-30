import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  QrCode,
  Play,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Maximize2,
  Tv,
  Smartphone,
  Tablet
} from 'lucide-react';
import QRCode from 'qrcode';
import { BoothSettings, LeadStats, Language } from '../types/lead';
import { DICT } from '../data/dictionary';

interface KioskHomeProps {
  settings: BoothSettings;
  stats?: LeadStats | null;
  lang: Language;
  onOpenForm: () => void;
  onPlayVideo: () => void;
  isSimOffline: boolean;
  onToggleSimOffline: () => void;
}

export const KioskHome: React.FC<KioskHomeProps> = ({
  settings,
  stats,
  lang,
  onOpenForm,
  onPlayVideo,
  isSimOffline,
  onToggleSimOffline
}) => {
  const t = DICT[lang];

  const [kioskScreen, setKioskScreen] = useState<'splash' | 'main'>('main');
  const [orientation, setOrientation] = useState<'landscape' | 'portrait' | 'full'>('landscape');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [mobileFormUrl, setMobileFormUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const targetUrl = `${origin}?mode=mobile&booth=${encodeURIComponent(settings.booth_id)}`;
    setMobileFormUrl(targetUrl);

    QRCode.toDataURL(targetUrl, {
      width: 260,
      margin: 1.5,
      color: {
        dark: '#0f2f3d',
        light: '#ffffff'
      }
    })
      .then(setQrDataUrl)
      .catch(console.error);
  }, [settings.booth_id]);

  const copyMobileLink = () => {
    navigator.clipboard.writeText(mobileFormUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isSplash = kioskScreen === 'splash';
  const isMainScreen = kioskScreen === 'main';
  const isLandscape = orientation === 'landscape';
  const isFull = orientation === 'full';

  const subTabBtnStyle = (active: boolean) => ({
    padding: '7px 14px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '11.5px',
    fontWeight: 600,
    whiteSpace: 'nowrap' as const,
    backgroundColor: active ? '#0f2f3d' : 'transparent',
    color: active ? '#ffffff' : '#6b6455',
    transition: 'all 0.18s ease'
  });

  const bezelStyle = isFull
    ? { width: '100%', maxWidth: '1200px', margin: '0 auto' }
    : isLandscape
    ? {
        width: '100%',
        maxWidth: '944px',
        backgroundColor: '#161616',
        borderRadius: '30px',
        padding: '14px',
        boxShadow: '0 24px 60px rgba(15, 47, 61, 0.28)',
        transition: 'all 0.3s ease'
      }
    : {
        width: '100%',
        maxWidth: '520px',
        backgroundColor: '#161616',
        borderRadius: '34px',
        padding: '14px',
        boxShadow: '0 24px 60px rgba(15, 47, 61, 0.28)',
        transition: 'all 0.3s ease'
      };

  const screenStyle = isFull
    ? {
        position: 'relative' as const,
        width: '100%',
        minHeight: '620px',
        borderRadius: '18px',
        overflow: 'hidden',
        backgroundColor: '#fbf9f4',
        border: '1px solid #e6e0cd',
        boxShadow: '0 10px 30px rgba(15,47,61,0.06)'
      }
    : isLandscape
    ? {
        position: 'relative' as const,
        width: '100%',
        height: '572px',
        borderRadius: '18px',
        overflow: 'hidden',
        backgroundColor: '#fbf9f4'
      }
    : {
        position: 'relative' as const,
        width: '100%',
        height: '820px',
        borderRadius: '22px',
        overflow: 'hidden',
        backgroundColor: '#fbf9f4'
      };

  return (
    <div
      style={{
        padding: '24px 16px 60px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px'
      }}
    >
      {/* Sub Selector Bar: Splash / Main & Landscape / Portrait / Full */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center'
        }}
        className="no-print"
      >
        <div
          style={{
            display: 'flex',
            gap: '4px',
            background: '#ffffff',
            padding: '4px',
            borderRadius: '9px',
            border: '1px solid #e3ddc9',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}
        >
          <button
            type="button"
            style={subTabBtnStyle(isSplash)}
            onClick={() => setKioskScreen('splash')}
          >
            {t.subSplash}
          </button>
          <button
            type="button"
            style={subTabBtnStyle(isMainScreen)}
            onClick={() => setKioskScreen('main')}
          >
            {t.subMain}
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '4px',
            background: '#ffffff',
            padding: '4px',
            borderRadius: '9px',
            border: '1px solid #e3ddc9',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}
        >
          <button
            type="button"
            style={subTabBtnStyle(orientation === 'landscape')}
            onClick={() => setOrientation('landscape')}
          >
            {t.subLandscape}
          </button>
          <button
            type="button"
            style={subTabBtnStyle(orientation === 'portrait')}
            onClick={() => setOrientation('portrait')}
          >
            {t.subPortrait}
          </button>
          <button
            type="button"
            style={subTabBtnStyle(orientation === 'full')}
            onClick={() => setOrientation('full')}
          >
            {t.subRealDevice}
          </button>
        </div>
      </div>

      {/* Main Bezel Frame / Screen */}
      <div style={bezelStyle}>
        <div style={screenStyle}>
          {/* 1. SPLASH / SCREENSAVER VIDEO MODE */}
          {isSplash && (
            <div
              onClick={() => setKioskScreen('main')}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(160deg, #123a30 0%, #0f2f3d 55%, #1a4438 100%)',
                cursor: 'pointer',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '24px'
              }}
            >
              {/* Background Geometric Texture */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'repeating-linear-gradient(115deg, rgba(255,255,255,0.03) 0 2px, transparent 2px 26px)',
                  pointerEvents: 'none'
                }}
              />

              {/* Top Header on Splash */}
              <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div
                  style={{
                    color: '#e8e0cc',
                    fontSize: '11px',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    opacity: 0.9,
                    fontWeight: 600
                  }}
                >
                  {t.videoLabel}
                </div>
                <div
                  style={{
                    background: 'rgba(0, 0, 0, 0.45)',
                    backdropFilter: 'blur(8px)',
                    color: '#c9b896',
                    fontSize: '10px',
                    padding: '5px 10px',
                    borderRadius: '6px',
                    letterSpacing: '0.3px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  {t.idleNote}
                </div>
              </div>

              {/* Center Glowing Play Ring & Company Presentation */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  gap: '16px',
                  margin: 'auto 0'
                }}
              >
                <div
                  style={{
                    width: '84px',
                    height: '84px',
                    borderRadius: '50%',
                    border: '2px solid rgba(255, 255, 255, 0.65)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'sa-glow 2.4s ease-in-out infinite',
                    background: 'rgba(15, 47, 61, 0.4)',
                    backdropFilter: 'blur(10px)',
                    marginBottom: '8px'
                  }}
                >
                  <div
                    style={{
                      width: 0,
                      height: 0,
                      borderStyle: 'solid',
                      borderWidth: '15px 0 15px 24px',
                      borderColor: 'transparent transparent transparent #ffffff',
                      marginLeft: '5px'
                    }}
                  />
                </div>

                <div
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'clamp(24px, 4vw, 36px)',
                    fontWeight: 700,
                    color: '#ffffff',
                    letterSpacing: '0.3px',
                    lineHeight: 1.2
                  }}
                >
                  {settings.company_name}
                </div>

                <div
                  style={{
                    fontSize: '13.5px',
                    color: '#c9b896',
                    maxWidth: '520px',
                    lineHeight: 1.5,
                    padding: '0 20px'
                  }}
                >
                  {settings.tagline}
                </div>
              </div>

              {/* Bottom Tap Prompt */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 2,
                  textAlign: 'center',
                  marginBottom: '10px'
                }}
              >
                <div
                  style={{
                    display: 'inline-block',
                    padding: '11px 26px',
                    borderRadius: '999px',
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.35)',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 600,
                    letterSpacing: '0.4px',
                    animation: 'sa-pulse 2s ease-in-out infinite',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.25)'
                  }}
                >
                  {t.tapToContinue}
                </div>
              </div>
            </div>
          )}

          {/* 2. MAIN KIOSK MENU SCREEN */}
          {isMainScreen && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: '#fbf9f4',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              {/* Header Bar */}
              <div
                style={{
                  padding: isLandscape || isFull ? '18px 28px' : '20px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #e6e0cd',
                  background: '#ffffff'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '7px',
                      background: 'linear-gradient(135deg, #2f7d5c, #b8933e)',
                      flex: 'none'
                    }}
                  />
                  <div>
                    <div
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontWeight: 600,
                        fontSize: '15.5px',
                        color: '#0f2f3d',
                        lineHeight: 1.2
                      }}
                    >
                      {settings.company_name}
                    </div>
                    <div
                      style={{
                        fontSize: '9.5px',
                        color: '#8a8371',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                        fontWeight: 600
                      }}
                    >
                      {settings.kiosk_venue || t.kioskVenue} • {settings.booth_id}
                    </div>
                  </div>
                </div>

                {/* Sync Badge */}
                <button
                  type="button"
                  onClick={onToggleSimOffline}
                  title="Klik untuk simulasi offline"
                  style={{
                    padding: '5px 12px',
                    borderRadius: '999px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '10px',
                    fontWeight: 600,
                    letterSpacing: '0.2px',
                    background: isSimOffline ? '#fff4de' : '#e4f0e9',
                    color: isSimOffline ? '#8a5a00' : '#1f5c4a',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: isSimOffline ? '#c9932e' : '#2f7d5c',
                      display: 'inline-block',
                      animation: isSimOffline ? 'none' : 'sa-pulse 1.8s ease-in-out infinite'
                    }}
                  />
                  <span>{isSimOffline ? t.syncOfflineBadge : t.syncOnlineBadge}</span>
                </button>
              </div>

              {/* Main Interactive Body */}
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: isLandscape || isFull ? 'row' : 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: isLandscape || isFull ? '48px' : '30px',
                  padding: isLandscape || isFull ? '20px 48px' : '24px 20px',
                  overflowY: 'auto'
                }}
              >
                {/* Left Column: Big Welcome & Big CTA Button */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '16px',
                    textAlign: 'center',
                    maxWidth: isLandscape || isFull ? '360px' : '100%'
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: isLandscape || isFull ? '28px' : '23px',
                      fontWeight: 600,
                      color: '#0f2f3d',
                      lineHeight: 1.25
                    }}
                  >
                    {t.welcomeTitle}
                  </div>

                  <p style={{ fontSize: '12px', color: '#6b6455', lineHeight: 1.5, margin: 0 }}>
                    {t.welcomeSub}
                  </p>

                  {/* GIANT KIOSK CTA BUTTON */}
                  <button
                    type="button"
                    onClick={onOpenForm}
                    className="sa-kiosk-cta"
                    style={{
                      width: '100%',
                      padding: isLandscape || isFull ? '20px 36px' : '18px 28px',
                      fontSize: isLandscape || isFull ? '17px' : '16px'
                    }}
                  >
                    <Sparkles size={20} color="#b8933e" />
                    <span>{t.ctaFill}</span>
                  </button>

                  <div style={{ fontSize: '11px', color: '#8a8371' }}>
                    {t.qrHint}
                  </div>
                </div>

                {/* Right Column: Dynamic QR Code Box */}
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e6e0cd',
                    borderRadius: '18px',
                    padding: '22px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: '0 6px 24px rgba(15, 47, 61, 0.06)',
                    maxWidth: '240px'
                  }}
                >
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="QR Code Registrasi"
                      style={{
                        width: '140px',
                        height: '140px',
                        display: 'block',
                        borderRadius: '8px'
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '140px',
                        height: '140px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#f4f1ea',
                        borderRadius: '8px'
                      }}
                    >
                      <QrCode size={48} color="#8a8371" />
                    </div>
                  )}

                  <div style={{ fontSize: '11.5px', color: '#0f2f3d', fontWeight: 700 }}>
                    {t.qrLabel}
                  </div>

                  <div
                    style={{
                      fontSize: '9.5px',
                      color: '#8a8371',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: '#2f7d5c',
                        display: 'inline-block',
                        animation: 'sa-pulse 1.8s ease-in-out infinite'
                      }}
                    />
                    <span>{t.qrUpdate}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Footer Bar */}
              <div
                style={{
                  padding: '12px 26px',
                  borderTop: '1px solid #e6e0cd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#ffffff',
                  fontSize: '10.5px',
                  color: '#8a8371'
                }}
              >
                <div>{settings.date_range || t.dateRange}</div>
                <div>{t.poweredBy}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Helper Link Tools below Kiosk */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginTop: '6px'
        }}
        className="no-print"
      >
        <button
          type="button"
          onClick={copyMobileLink}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '8px',
            background: '#ffffff',
            border: '1px solid #e3ddc9',
            color: copied ? '#1f5c4a' : '#6b6455',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          <span>{copied ? 'Link Form Disalin!' : 'Salin URL Form Pengunjung'}</span>
        </button>

        <a
          href={mobileFormUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '8px',
            background: '#ffffff',
            border: '1px solid #e3ddc9',
            color: '#0f2f3d',
            fontSize: '11px',
            fontWeight: 600,
            textDecoration: 'none'
          }}
        >
          <ExternalLink size={13} />
          <span>Buka Form Pengunjung di Tab Baru</span>
        </a>
      </div>
    </div>
  );
};
