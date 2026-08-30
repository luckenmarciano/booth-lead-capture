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
  WifiOff,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BoothSettings, Lead, Language } from '../types/lead.js';
import { syncService } from '../services/syncService.js';
import { SignatureCanvas } from './SignatureCanvas.js';
import { DICT } from '../data/dictionary.js';

interface MobileVisitorFormProps {
  settings: BoothSettings;
  lang: Language;
  onSuccess: (lead: Lead) => void;
  isSimOffline: boolean;
  onToggleSimOffline: () => void;
  isInsideBezel?: boolean;
}

export const MobileVisitorForm: React.FC<MobileVisitorFormProps> = ({
  settings,
  lang,
  onSuccess,
  isSimOffline,
  onToggleSimOffline,
  isInsideBezel = true
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

      setLastSubmittedLead(result.lead);
      setIsSubmitted(true);
      onSuccess(result.lead);
    } catch (err: any) {
      setErrorMsg(err?.message || (lang === 'id' ? 'Gagal menyimpan data' : 'Failed to submit data'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
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

  const formCardContent = (
    <div
      style={{
        backgroundColor: '#fbf9f4',
        borderRadius: isInsideBezel ? '28px' : '20px',
        overflow: 'hidden',
        minHeight: '620px',
        display: 'flex',
        flexDirection: 'column',
        border: isInsideBezel ? 'none' : '1px solid #e6e0cd',
        boxShadow: isInsideBezel ? 'none' : '0 12px 36px rgba(15,47,61,0.08)'
      }}
    >
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(120deg, #0f2f3d 0%, #1f5c4a 100%)',
          padding: '24px 22px 20px',
          color: '#ffffff'
        }}
      >
        <div
          style={{
            fontSize: '10px',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            color: '#c9b896',
            marginBottom: '4px',
            fontWeight: 600
          }}
        >
          {settings.company_name || t.formBrand}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '20px',
            fontWeight: 600,
            lineHeight: 1.25
          }}
        >
          {t.formTitle}
        </div>
      </div>

      {/* Offline Mode Banner */}
      {isSimOffline && (
        <div
          style={{
            backgroundColor: '#fff4de',
            borderBottom: '1px solid #eddcb5',
            padding: '9px 20px',
            fontSize: '11px',
            color: '#8a5a00',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#c9932e',
              display: 'inline-block'
            }}
          />
          <span>{t.offlineBanner}</span>
        </div>
      )}

      {/* SUCCESS STATE / THANK YOU SCREEN */}
      {isSubmitted ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '14px',
            padding: '40px 24px',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#e4f0e9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1f5c4a',
              boxShadow: '0 4px 16px rgba(31,92,74,0.15)'
            }}
          >
            <CheckCircle2 size={36} />
          </div>

          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '22px',
              fontWeight: 600,
              color: '#0f2f3d'
            }}
          >
            {t.thankYou}
          </div>

          <div style={{ fontSize: '13px', color: '#6b6455', lineHeight: 1.5, maxWidth: '280px' }}>
            {isSimOffline || lastSubmittedLead?.sync_status === 'pending'
              ? t.statusOfflineMsg
              : t.statusOnlineMsg}
          </div>

          {lastSubmittedLead && (
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e6e0cd',
                borderRadius: '12px',
                padding: '14px 18px',
                width: '100%',
                maxWidth: '280px',
                textAlign: 'left',
                fontSize: '11.5px',
                color: '#4a453a',
                marginTop: '6px'
              }}
            >
              <div style={{ fontWeight: 700, color: '#0f2f3d', marginBottom: '4px' }}>
                {lastSubmittedLead.full_name}
              </div>
              <div>{lastSubmittedLead.company} • {lastSubmittedLead.city}</div>
              <div style={{ marginTop: '4px', fontSize: '10.5px', color: '#8a8371' }}>
                Minat: {lastSubmittedLead.interests.join(', ')}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleReset}
            style={{
              marginTop: '10px',
              padding: '10px 22px',
              borderRadius: '9px',
              border: '1px solid #d8d0b8',
              backgroundColor: '#ffffff',
              color: '#0f2f3d',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RotateCcw size={14} />
            <span>{t.fillAgain}</span>
          </button>
        </div>
      ) : (
        /* FORM INPUT STATE */
        <form onSubmit={handleSubmit} style={{ padding: '20px 22px 28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {errorMsg && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                fontSize: '12px'
              }}
            >
              {errorMsg}
            </div>
          )}

          {/* Nama Lengkap */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: 600, color: '#0f2f3d', marginBottom: '6px' }}>
              <User size={13} color="#2f7d5c" />
              <span>{t.labelName} *</span>
            </label>
            <input
              type="text"
              className="sa-input"
              placeholder={t.placeholderName}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          {/* Asal Perusahaan */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: 600, color: '#0f2f3d', marginBottom: '6px' }}>
              <Building size={13} color="#2f7d5c" />
              <span>{t.labelCompany}</span>
            </label>
            <input
              type="text"
              className="sa-input"
              placeholder={t.placeholderCompany}
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>

          {/* Nomor WhatsApp */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: 600, color: '#0f2f3d', marginBottom: '6px' }}>
              <Phone size={13} color="#2f7d5c" />
              <span>{t.labelContact} *</span>
            </label>
            <input
              type="tel"
              className="sa-input"
              placeholder={t.placeholderContact}
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              required
            />
          </div>

          {/* Alamat Email */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: 600, color: '#0f2f3d', marginBottom: '6px' }}>
              <Mail size={13} color="#2f7d5c" />
              <span>{t.labelEmail}</span>
            </label>
            <input
              type="email"
              className="sa-input"
              placeholder={t.placeholderEmail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Kota / Domisili */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: 600, color: '#0f2f3d', marginBottom: '6px' }}>
              <MapPin size={13} color="#2f7d5c" />
              <span>{t.labelCity}</span>
            </label>
            <input
              type="text"
              className="sa-input"
              placeholder={t.placeholderCity}
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          {/* Pilihan Minat Produk */}
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#0f2f3d', marginBottom: '8px' }}>
              {t.labelInterest}
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {settings.default_interests.map((interest, idx) => {
                const isSelected = selectedInterests.includes(interest);
                const isEven = idx % 2 === 0;
                return (
                  <div
                    key={interest}
                    className={`sa-interest-chip ${isSelected ? (isEven ? 'selected-oil' : 'selected-slick') : ''}`}
                    onClick={() => toggleInterest(interest)}
                  >
                    <div className="sa-check-box">
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                    <span>{interest}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Catatan / Kebutuhan Tambahan */}
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#0f2f3d', marginBottom: '6px' }}>
              {t.labelNotes}
            </label>
            <textarea
              className="sa-input"
              rows={2}
              placeholder={t.placeholderNotes}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Toggle Digital Signature */}
          <div>
            <button
              type="button"
              onClick={() => setShowSignature(!showSignature)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#1f5c4a',
                fontSize: '11.5px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                padding: '4px 0'
              }}
            >
              <PenTool size={13} />
              <span>{showSignature ? t.hideSignature : t.showSignature}</span>
            </button>

            {showSignature && (
              <div style={{ marginTop: '8px' }}>
                <SignatureCanvas onSave={(url) => setSignatureUrl(url)} initialData={signatureUrl} />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="sa-btn-primary"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '14px',
              marginTop: '6px'
            }}
          >
            {isSubmitting ? (
              <span>{t.submittingBtn}</span>
            ) : (
              <>
                <Send size={16} />
                <span>{t.submitBtn}</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );

  return (
    <div
      style={{
        padding: '24px 16px 60px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px'
      }}
    >
      {/* Offline Mode Toggle Button for testing */}
      <button
        type="button"
        onClick={onToggleSimOffline}
        style={{
          padding: '6px 14px',
          borderRadius: '8px',
          border: '1px solid #d8d0b8',
          background: '#ffffff',
          color: '#6b6455',
          fontSize: '11px',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px'
        }}
        className="no-print"
      >
        <WifiOff size={13} color="#c9932e" />
        <span>{isSimOffline ? t.simOfflineOn : t.simOfflineOff}</span>
      </button>

      {/* Phone Bezel Frame */}
      {isInsideBezel ? (
        <div
          style={{
            width: '100%',
            maxWidth: '344px',
            backgroundColor: '#111111',
            borderRadius: '40px',
            padding: '12px',
            boxShadow: '0 20px 50px rgba(15, 47, 61, 0.25)'
          }}
        >
          <div
            style={{
              width: '60px',
              height: '5px',
              backgroundColor: '#333333',
              borderRadius: '3px',
              margin: '0 auto 8px'
            }}
          />
          {formCardContent}
        </div>
      ) : (
        <div style={{ width: '100%', maxWidth: '480px' }}>
          {formCardContent}
        </div>
      )}
    </div>
  );
};
