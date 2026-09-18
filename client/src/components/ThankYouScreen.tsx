import React from 'react';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import { BoothSettings, Lead, Language } from '../types/lead';
import { DICT } from '../data/dictionary';

interface ThankYouScreenProps {
  lead: Lead;
  settings: BoothSettings;
  lang: Language;
  onReset: () => void;
  isKioskMode?: boolean;
}

export const ThankYouScreen: React.FC<ThankYouScreenProps> = ({
  lead,
  settings,
  lang,
  onReset,
  isKioskMode = false
}) => {
  const t = DICT[lang];

  return (
    <div
      style={{
        maxWidth: '560px',
        margin: '0 auto',
        padding: '36px 20px 60px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <div
        style={{
          width: '100%',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          border: '1px solid #e6e0cd',
          padding: '40px 28px',
          textAlign: 'center',
          boxShadow: '0 16px 40px rgba(15, 47, 61, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px'
        }}
      >
        {/* Big Check Circle */}
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: '#e4f0e9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1f5c4a',
            boxShadow: '0 8px 24px rgba(31, 92, 74, 0.15)'
          }}
        >
          <CheckCircle2 size={42} />
        </div>

        <div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(22px, 6vw, 26px)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: '#0f2f3d',
              marginBottom: '8px'
            }}
          >
            {lang === 'id' ? `Terima Kasih, ${lead.full_name}!` : `Thank You, ${lead.full_name}!`}
          </h1>
          <p style={{ fontSize: '14px', color: '#6b6455', lineHeight: 1.5, maxWidth: '380px', margin: 0 }}>
            {t.thankYouSubtitle}
          </p>
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', marginTop: '10px' }}>
          <button
            type="button"
            onClick={onReset}
            className="sa-btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '14.5px', fontWeight: 700 }}
          >
            <RotateCcw size={16} />
            <span>{isKioskMode ? (lang === 'id' ? 'Kembali ke Menu Utama' : 'Return to Main Menu') : t.fillAgain}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
