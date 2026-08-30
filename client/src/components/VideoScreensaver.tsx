import React, { useRef, useState, useMemo } from 'react';
import { Sparkles, Play, Volume2, VolumeX, Building2 } from 'lucide-react';
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
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const youtubeId = useMemo(() => getYouTubeId(settings.video_url), [settings.video_url]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

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
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        padding: '32px',
        boxSizing: 'border-box'
      }}
    >
      {/* Video Player Background if available (Supports YouTube & MP4/WebM) */}
      {!hasError && settings.video_url ? (
        youtubeId ? (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              overflow: 'hidden',
              zIndex: 1,
              pointerEvents: 'none'
            }}
          >
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=${youtubeId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3`}
              title="YouTube Screensaver Video"
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
          </div>
        ) : (
          <video
            ref={videoRef}
            src={settings.video_url}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            onError={() => setHasError(true)}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 1
            }}
          />
        )
      ) : null}

      {/* Dark Luxury Gradient Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(160deg, rgba(18, 58, 48, 0.88) 0%, rgba(15, 47, 61, 0.92) 55%, rgba(26, 68, 56, 0.9) 100%)',
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

      {/* Top Header Bar */}
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
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '11px',
              background: 'linear-gradient(135deg, #2f7d5c, #b8933e)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-serif)',
              fontWeight: 700,
              fontSize: '20px',
              color: '#ffffff',
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
            }}
          >
            S
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '20px', color: '#ffffff', lineHeight: 1.2 }}>
              {settings.company_name}
            </div>
            <div style={{ fontSize: '11px', color: '#c9b896', letterSpacing: '1px', textTransform: 'uppercase' }}>
              {settings.kiosk_venue || 'Jakarta Convention Center'} • {settings.booth_id}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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

          {!hasError && settings.video_url && (
            <button
              type="button"
              onClick={toggleMute}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(0, 0, 0, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          )}
        </div>
      </div>

      {/* Center Animated Play Icon & Company Showcase */}
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
        {(!settings.video_url || hasError) && (
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
        )}

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

      {/* Bottom Pulsing Touch to Wake Prompt */}
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
  );
};
