import React from 'react';
import {
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Download,
  Phone,
  Mail,
  Globe,
  Share2
} from 'lucide-react';
import { BoothSettings, Lead, Language } from '../types/lead.js';
import { DICT } from '../data/dictionary.js';

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
  const isPending = lead.sync_status === 'pending';

  const downloadVCard = () => {
    const vcardData = `BEGIN:VCARD
VERSION:3.0
FN:${settings.company_name} (Booth ${settings.booth_id})
ORG:${settings.company_name}
TITLE:Exhibition Booth Team
TEL;TYPE=WORK,VOICE:${settings.vcard_phone || '+6281234567890'}
EMAIL;TYPE=PREF,INTERNET:${settings.vcard_email || 'sales@spillasia.com'}
URL:${settings.vcard_website || 'https://spillasia2026.com'}
NOTE:${settings.tagline}
END:VCARD`;

    const blob = new Blob([vcardData], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${settings.company_name.replace(/\s+/g, '_')}_Contact.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
          padding: '36px 28px',
          textAlign: 'center',
          boxShadow: '0 16px 40px rgba(15, 47, 61, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
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
              fontFamily: 'var(--font-serif)',
              fontSize: '26px',
              fontWeight: 700,
              color: '#0f2f3d',
              marginBottom: '6px'
            }}
          >
            {t.thankYou}
          </h1>
          <p style={{ fontSize: '13.5px', color: '#6b6455', lineHeight: 1.5, maxWidth: '380px' }}>
            {isPending ? t.statusOfflineMsg : t.statusOnlineMsg}
          </p>
        </div>

        {/* Visitor Card Badge */}
        <div
          style={{
            width: '100%',
            backgroundColor: '#fbf9f4',
            border: '1px solid #e6e0cd',
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'left',
            marginTop: '8px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f2f3d' }}>
                {lead.full_name}
              </div>
              <div style={{ fontSize: '12px', color: '#6b6455' }}>
                {lead.company || '-'} • {lead.city || 'Jakarta'}
              </div>
            </div>
            <span
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '10.5px',
                fontWeight: 600,
                backgroundColor: isPending ? '#fff4de' : '#e4f0e9',
                color: isPending ? '#8a5a00' : '#1f5c4a'
              }}
            >
              {isPending ? t.badgePending : t.badgeSynced}
            </span>
          </div>

          <div style={{ fontSize: '11.5px', color: '#8a8371', borderTop: '1px dashed #e6e0cd', paddingTop: '10px', marginTop: '10px' }}>
            <strong>Minat Produk:</strong> {lead.interests.join(', ')}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', marginTop: '10px' }}>
          <button
            type="button"
            onClick={downloadVCard}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: '10px',
              border: '1px solid #d8d0b8',
              backgroundColor: '#ffffff',
              color: '#0f2f3d',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Download size={15} color="#1f5c4a" />
            <span>Simpan Kontak Booth ke Buku Telepon (vCard)</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="sa-btn-primary"
            style={{ width: '100%', padding: '13px' }}
          >
            <RotateCcw size={15} />
            <span>{isKioskMode ? 'Kembali ke Menu Utama Kiosk' : t.fillAgain}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
