import React, { useState, useMemo, useRef, useEffect } from 'react';
import { BoothSettings, Language } from '../types/lead';
import { DICT } from '../data/dictionary';

interface VideoScreensaverProps {
  settings: BoothSettings;
  lang: Language;
  onWake: () => void;
}

const getYouTubeId = (url?: string): string | null => {
  if (!url) return null;
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/;
  const match = url.trim().match(regExp);
  return match ? match[1] : null;
};

export const VideoScreensaver: React.FC<VideoScreensaverProps> = ({
  settings,
  lang,
  onWake
}) => {
  const t = DICT[lang];
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Play with sound only if the booth opted in; otherwise muted.
  const soundOn = Boolean(settings.video_sound_enabled);

  const youtubeId = useMemo(() => getYouTubeId(settings.video_url), [settings.video_url]);

  // When a real video can play, show ONLY the full-bleed video (no chrome).
  const showVideo = !hasError && Boolean(settings.video_url);

  // For MP4/WebM: if the browser blocks unmuted autoplay, fall back to muted
  // playback so the screensaver never freezes on a black frame.
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !showVideo || youtubeId) return;
    el.play().catch(() => {
      el.muted = true;
      el.play().catch(() => {});
    });
  }, [showVideo, youtubeId, settings.video_url]);

  return (
    <div
      onClick={onWake}
      role="button"
      tabIndex={0}
      aria-label="Sentuh layar untuk membuka buku tamu"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onWake();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#0a1f29',
        zIndex: 9999,
        cursor: 'pointer',
        overflow: 'hidden'
      }}
    >
      {showVideo ? (
        /* ── FULL-BLEED VIDEO ONLY — no header, text, buttons or overlay ── */
        youtubeId ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&mute=${soundOn ? 0 : 1}&loop=1&playlist=${youtubeId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3`}
            title="Video Company Profile"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '100vw',
              height: '100vh',
              minWidth: '177.78vh',
              minHeight: '56.25vw',
              transform: 'translate(-50%, -50%)',
              border: 'none',
              pointerEvents: 'none'
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            ref={videoRef}
            src={settings.video_url}
            autoPlay
            loop
            muted={!soundOn}
            playsInline
            onError={() => setHasError(true)}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              pointerEvents: 'none'
            }}
          />
        )
      ) : (
        /* ── FALLBACK (no video / load error): branded poster ── */
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
            padding: '32px',
            boxSizing: 'border-box'
          }}
        >
          {/* Dark luxury gradient overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(160deg, rgba(18, 58, 48, 0.88) 0%, rgba(15, 47, 61, 0.92) 55%, rgba(26, 68, 56, 0.9) 100%)',
              zIndex: 2,
              pointerEvents: 'none'
            }}
          />

          {/* Repeating fine pattern */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'repeating-linear-gradient(115deg, rgba(255,255,255,0.03) 0 2px, transparent 2px 26px)',
              zIndex: 3,
              pointerEvents: 'none'
            }}
          />

          {/* Top header bar */}
          <div
            style={{
              position: 'relative',
              zIndex: 10,
              width: '100%',
              maxWidth: '1200px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img
                src="/osct-logo.png"
                alt="Oil Spill Combat Team"
                style={{
                  width: '46px',
                  height: '46px',
                  objectFit: 'contain',
                  flexShrink: 0,
                  background: '#ffffff',
                  borderRadius: '50%',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
                }}
              />
              <div>
                <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '20px', color: '#ffffff', lineHeight: 1.2 }}>
                  {settings.company_name}
                </div>
                <div style={{ fontSize: '11px', color: '#c9b896', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  {settings.kiosk_venue || 'Jakarta Convention Center'} • {settings.booth_id}
                </div>
              </div>
            </div>

            <div
              style={{
                background: 'rgba(0, 0, 0, 0.45)',
                backdropFilter: 'blur(8px)',
                color: '#c9b896',
                fontSize: '11px',
                padding: '6px 12px',
                borderRadius: '8px',
                letterSpacing: '0.3px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              {t.idleNote}
            </div>
          </div>

          {/* Center play icon & company showcase */}
          <div
            style={{
              position: 'relative',
              zIndex: 10,
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              gap: '16px'
            }}
          >
            <div
              style={{
                width: '92px',
                height: '92px',
                borderRadius: '50%',
                border: '2px solid rgba(255, 255, 255, 0.65)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'sa-glow 2.4s ease-in-out infinite',
                background: 'rgba(15, 47, 61, 0.5)',
                backdropFilter: 'blur(12px)',
                flexShrink: 0
              }}
            >
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderStyle: 'solid',
                  borderWidth: '18px 0 18px 28px',
                  borderColor: 'transparent transparent transparent #ffffff',
                  marginLeft: '6px'
                }}
              />
            </div>

            <div
              style={{
                color: '#e8e0cc',
                fontSize: '12px',
                letterSpacing: '2.5px',
                textTransform: 'uppercase',
                fontWeight: 600,
                opacity: 0.9
              }}
            >
              {t.videoLabel}
            </div>

            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(28px, 5vw, 48px)',
                fontWeight: 700,
                color: '#ffffff',
                letterSpacing: '0.3px',
                lineHeight: 1.15,
                maxWidth: '850px'
              }}
            >
              {settings.company_name}
            </h1>

            <p
              style={{
                fontSize: 'clamp(14px, 2vw, 17px)',
                color: '#c9b896',
                maxWidth: '620px',
                lineHeight: 1.6
              }}
            >
              {settings.tagline}
            </p>
          </div>

          {/* Bottom pulsing touch-to-wake prompt */}
          <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 34px',
                borderRadius: '999px',
                background: 'rgba(255, 255, 255, 0.16)',
                backdropFilter: 'blur(14px)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: 600,
                letterSpacing: '0.4px',
                animation: 'sa-pulse 2s ease-in-out infinite',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)'
              }}
            >
              <span>{t.tapToContinue}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
