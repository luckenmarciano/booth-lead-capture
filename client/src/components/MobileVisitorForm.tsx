import React, { useState } from 'react';
import {
  User,
  Building,
  Phone,
  Mail,
  MapPin,
  Check,
  Send,
  PenTool,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BoothSettings, Lead, Language } from '../types/lead';
import { syncService } from '../services/syncService';
import { SignatureCanvas } from './SignatureCanvas';
import { DICT } from '../data/dictionary';

interface MobileVisitorFormProps {
  settings: BoothSettings;
  lang: Language;
  onSetLang?: (lang: Language) => void;
  onSuccess: (lead: Lead) => void;
  isSimOffline?: boolean;
}

export const MobileVisitorForm: React.FC<MobileVisitorFormProps> = ({
  settings,
  lang,
  onSetLang,
  onSuccess,
  isSimOffline = false
}) => {
  const t = DICT[lang];

  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    settings.default_interests[0] || 'Oil Spill Combat Team'
  ]);
  const [notes, setNotes] = useState('');
  const [signatureUrl, setSignatureUrl] = useState('');
  const [showSignature, setShowSignature] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [lastSubmittedLead, setLastSubmittedLead] = useState<Lead | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg(lang === 'id' ? 'Silakan isi Nama Lengkap Anda' : 'Please enter your Full Name');
      return;
    }
    if (!whatsapp.trim()) {
      setErrorMsg(lang === 'id' ? 'Silakan isi Nomor WhatsApp Anda' : 'Please enter your WhatsApp Number');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const leadPayload = {
        id: 'lead_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        full_name: fullName.trim(),
        company: company.trim() || '-',
        city: city.trim() || 'Jakarta',
        whatsapp: whatsapp.trim(),
        email: email.trim() || undefined,
        interests: selectedInterests.length > 0 ? selectedInterests : [settings.default_interests[0] || 'Oil Spill Combat Team'],
        notes: notes.trim() || undefined,
        signature_url: signatureUrl || undefined,
        source: 'mobile_qr' as const,
        booth_id: settings.booth_id
      };

      const result = await syncService.submitLead(leadPayload);

      try {
        confetti({
          particleCount: 60,
          spread: 55,
          origin: { y: 0.6 }
        });
      } catch {}

      const finalLead: Lead = {
        ...leadPayload,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sync_status: result.status === 'synced' ? 'synced' : 'pending'
      };

      setLastSubmittedLead(finalLead);
      setIsSubmitted(true);
      onSuccess(finalLead);
    } catch (err: any) {
      console.error('[MobileVisitorForm] Submission error:', err);
      setErrorMsg(lang === 'id' ? 'Gagal menyimpan data. Silakan coba lagi.' : 'Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFullName('');
    setCompany('');
    setWhatsapp('');
    setEmail('');
    setCity('');
    setSelectedInterests([settings.default_interests[0] || 'Oil Spill Combat Team']);
    setNotes('');
    setSignatureUrl('');
    setShowSignature(false);
    setIsSubmitted(false);
    setLastSubmittedLead(null);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f4f1ea',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '16px 12px 48px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: '#fbf9f4',
          borderRadius: '24px',
          overflow: 'hidden',
          border: '1px solid #e6e0cd',
          boxShadow: '0 16px 40px rgba(15, 47, 61, 0.08)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header Banner */}
        <div
          style={{
            background: 'linear-gradient(120deg, #0f2f3d 0%, #1f5c4a 100%)',
            padding: '22px 20px 18px',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div
              style={{
                fontSize: '10px',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                color: '#c9b896',
                marginBottom: '3px',
                fontWeight: 700
              }}
            >
              {settings.company_name || 'SpillAsia 2026'} • {settings.booth_id}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '20px',
                fontWeight: 700,
                lineHeight: 1.2
              }}
            >
              {t.formTitle}
            </div>
          </div>

          {/* Language Toggle in Header */}
          {onSetLang && (
            <div
              style={{
                display: 'inline-flex',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(8px)',
                padding: '2px',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <button
                type="button"
                onClick={() => onSetLang('id')}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '10.5px',
                  fontWeight: 700,
                  backgroundColor: lang === 'id' ? '#ffffff' : 'transparent',
                  color: lang === 'id' ? '#0f2f3d' : '#ffffff'
                }}
              >
                ID
              </button>
              <button
                type="button"
                onClick={() => onSetLang('en')}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '10.5px',
                  fontWeight: 700,
                  backgroundColor: lang === 'en' ? '#ffffff' : 'transparent',
                  color: lang === 'en' ? '#0f2f3d' : '#ffffff'
                }}
              >
                EN
              </button>
            </div>
          )}
        </div>

        {/* SUCCESS STATE / THANK YOU SCREEN */}
        {isSubmitted ? (
          <div
            style={{
              padding: '36px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '14px'
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#e4f0e9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1f5c4a',
                boxShadow: '0 4px 16px rgba(31,92,74,0.15)'
              }}
            >
              <CheckCircle2 size={32} />
            </div>

            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '22px',
                fontWeight: 700,
                color: '#0f2f3d',
                margin: 0
              }}
            >
              {t.thankYouTitle}
            </h2>

            <p style={{ fontSize: '13px', color: '#6b6455', margin: 0, maxWidth: '320px', lineHeight: 1.5 }}>
              {t.thankYouSubtitle}
            </p>

            {/* Summary Badge */}
            {lastSubmittedLead && (
              <div
                style={{
                  width: '100%',
                  backgroundColor: '#ffffff',
                  borderRadius: '14px',
                  padding: '16px',
                  border: '1px solid #e6e0cd',
                  textAlign: 'left',
                  fontSize: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ fontWeight: 700, color: '#0f2f3d', fontSize: '13.5px' }}>
                  {lastSubmittedLead.full_name}
                </div>
                {lastSubmittedLead.company !== '-' && (
                  <div style={{ color: '#6b6455' }}>🏢 {lastSubmittedLead.company}</div>
                )}
                <div style={{ color: '#1f5c4a', fontWeight: 600 }}>💬 {lastSubmittedLead.whatsapp}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                  {lastSubmittedLead.interests.map((it, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '10px',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: '#e4f0e9',
                        color: '#1f5c4a',
                        fontWeight: 600
                      }}
                    >
                      {it}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reset / Fill Again Button */}
            <button
              type="button"
              onClick={handleResetForm}
              style={{
                width: '100%',
                padding: '13px 20px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #1f5c4a 0%, #0f2f3d 100%)',
                color: '#ffffff',
                fontSize: '13.5px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '10px'
              }}
            >
              <RotateCcw size={16} />
              <span>{t.btnFillAgain}</span>
            </button>
          </div>
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {errorMsg && (
              <div
                style={{
                  backgroundColor: '#fbeae5',
                  border: '1px solid #f2b8ab',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  color: '#9c2411',
                  fontSize: '12px',
                  fontWeight: 600
                }}
              >
                {errorMsg}
              </div>
            )}

            {/* 1. Nama Lengkap */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#0f2f3d', marginBottom: '6px' }}>
                <User size={14} color="#1f5c4a" />
                <span>{t.fullNameLabel}</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t.fullNamePlaceholder}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid #dcd5be',
                  backgroundColor: '#ffffff',
                  fontSize: '13.5px',
                  color: '#0f2f3d',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* 2. Perusahaan */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#0f2f3d', marginBottom: '6px' }}>
                <Building size={14} color="#1f5c4a" />
                <span>{t.companyLabel}</span>
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder={t.companyPlaceholder}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid #dcd5be',
                  backgroundColor: '#ffffff',
                  fontSize: '13.5px',
                  color: '#0f2f3d',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* 3. Nomor WhatsApp */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#0f2f3d', marginBottom: '6px' }}>
                <Phone size={14} color="#1f5c4a" />
                <span>{t.whatsappLabel}</span>
              </label>
              <input
                type="tel"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder={t.whatsappPlaceholder}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid #dcd5be',
                  backgroundColor: '#ffffff',
                  fontSize: '13.5px',
                  color: '#0f2f3d',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* 4. Email & Kota (Row) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', fontWeight: 700, color: '#0f2f3d', marginBottom: '6px' }}>
                  <Mail size={13} color="#1f5c4a" />
                  <span>{t.emailLabel}</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  style={{
                    width: '100%',
                    padding: '11px 12px',
                    borderRadius: '10px',
                    border: '1px solid #dcd5be',
                    backgroundColor: '#ffffff',
                    fontSize: '12.5px',
                    color: '#0f2f3d',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', fontWeight: 700, color: '#0f2f3d', marginBottom: '6px' }}>
                  <MapPin size={13} color="#1f5c4a" />
                  <span>{t.cityLabel}</span>
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={t.cityPlaceholder}
                  style={{
                    width: '100%',
                    padding: '11px 12px',
                    borderRadius: '10px',
                    border: '1px solid #dcd5be',
                    backgroundColor: '#ffffff',
                    fontSize: '12.5px',
                    color: '#0f2f3d',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* 5. Minat Produk (Chips) */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f2f3d', marginBottom: '8px' }}>
                {t.interestsLabel}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {settings.default_interests.map((interest) => {
                  const isSelected = selectedInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '999px',
                        border: isSelected ? '1.5px solid #1f5c4a' : '1px solid #d8d1bc',
                        backgroundColor: isSelected ? '#1f5c4a' : '#ffffff',
                        color: isSelected ? '#ffffff' : '#333333',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {isSelected && <Check size={12} strokeWidth={3} />}
                      <span>{interest}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 6. Tanda Tangan Digital (Opsional) */}
            <div>
              <button
                type="button"
                onClick={() => setShowSignature(!showSignature)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#1f5c4a',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <PenTool size={13} />
                <span>{showSignature ? t.sigToggleHide : t.sigToggleShow}</span>
              </button>

              {showSignature && (
                <div style={{ marginTop: '8px' }}>
                  <SignatureCanvas onSaveSignature={(url) => setSignatureUrl(url)} lang={lang} />
                </div>
              )}
            </div>

            {/* Tombol Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '16px 20px',
                borderRadius: '14px',
                border: 'none',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                background: 'linear-gradient(135deg, #1f5c4a 0%, #0f2f3d 100%)',
                color: '#ffffff',
                fontSize: '14.5px',
                fontWeight: 700,
                letterSpacing: '0.3px',
                boxShadow: '0 8px 24px rgba(31, 92, 74, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '6px'
              }}
            >
              <Send size={16} />
              <span>{isSubmitting ? t.btnSubmitting : t.btnSubmit}</span>
            </button>
          </form>
        )}
      </div>

      {/* Footer Branding */}
      <div style={{ marginTop: '16px', fontSize: '11px', color: '#8a8371', textAlign: 'center' }}>
        {settings.company_name} • {settings.kiosk_venue}
      </div>
    </div>
  );
};
export default MobileVisitorForm;
