import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Building,
  Phone,
  Mail,
  MapPin,
  Check,
  Send,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BoothSettings, Lead, Language } from '../types/lead';
import { syncService } from '../services/syncService';
import { DICT } from '../data/dictionary';
import { useIsMobile } from '../hooks/useIsMobile';

interface VisitorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: BoothSettings;
  lang: Language;
  onSuccess: (lead: Lead) => void;
}

export const VisitorFormModal: React.FC<VisitorFormModalProps> = ({
  isOpen,
  onClose,
  settings,
  lang,
  onSuccess
}) => {
  if (!isOpen) return null;

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const isMobile = useIsMobile();

  // settings starts as the bundled DEFAULT_SETTINGS and is replaced once the
  // real settings finish loading from the server — if the visitor hasn't
  // touched their interest selection yet, drop any stale default that no
  // longer matches the current interest list so it doesn't linger alongside
  // whatever the visitor actually picks.
  useEffect(() => {
    setSelectedInterests((prev) => {
      const stillValid = prev.filter((i) => settings.default_interests.includes(i));
      if (stillValid.length > 0) return stillValid;
      return [settings.default_interests[0] || 'Oil Spill Combat Team'];
    });
  }, [settings.default_interests]);

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
      setErrorMsg(lang === 'id' ? 'Silakan isi Nama Lengkap' : 'Please enter your Full Name');
      return;
    }
    if (!email.trim()) {
      setErrorMsg(lang === 'id' ? 'Silakan isi Alamat Email' : 'Please enter your Email Address');
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
        email: email.trim(),
        interests: selectedInterests.length > 0 ? selectedInterests : [settings.default_interests[0] || 'Oil Spill Combat Team'],
        notes: notes.trim() || undefined,
        source: 'kiosk_tablet' as const,
        booth_id: settings.booth_id
      };

      const result = await syncService.submitLead(leadPayload);

      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.5 }
        });
      } catch {}

      onSuccess(result.lead);
    } catch (err: any) {
      setErrorMsg(err?.message || (lang === 'id' ? 'Gagal menyimpan data' : 'Failed to submit data'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 47, 61, 0.65)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: '#fbf9f4',
          borderRadius: '20px',
          overflow: 'hidden',
          border: '1px solid #e6e0cd',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
          maxHeight: '90dvh',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(120deg, #0f2f3d 0%, #1f5c4a 100%)',
            padding: '20px 24px',
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
                marginBottom: '2px',
                fontWeight: 600
              }}
            >
              {settings.company_name} • Kiosk Tablet
            </div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(18px, 5vw, 20px)',
                fontWeight: 800,
                letterSpacing: '-0.02em'
              }}
            >
              {t.ctaFill}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: '40px',
              height: '40px',
              flexShrink: 0,
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
        </div>

        {/* Scrollable Form Body */}
        <div style={{ padding: '24px', overflowY: 'auto' }}>
          {errorMsg && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                fontSize: '12px',
                marginBottom: '16px'
              }}
            >
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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

            {/* Grid: WhatsApp & Email */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: 600, color: '#0f2f3d', marginBottom: '6px' }}>
                  <Phone size={13} color="#2f7d5c" />
                  <span>{t.labelContact}</span>
                </label>
                <input
                  type="tel"
                  className="sa-input"
                  placeholder={t.placeholderContact}
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: 600, color: '#0f2f3d', marginBottom: '6px' }}>
                  <Mail size={13} color="#2f7d5c" />
                  <span>{t.labelEmail} *</span>
                </label>
                <input
                  type="email"
                  className="sa-input"
                  placeholder={t.placeholderEmail}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Kota */}
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

            {/* Minat Produk */}
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

            {/* Catatan */}
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="sa-btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '14px',
                marginTop: '10px'
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
        </div>
      </div>
    </div>
  );
};
