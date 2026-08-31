import React, { useState } from 'react';
import {
  X,
  Save,
  Tv,
  FileSpreadsheet,
  Lock,
  Plus,
  Trash2,
  CheckCircle2,
  Building2,
  Calendar,
  Globe
} from 'lucide-react';
import { BoothSettings } from '../types/lead';
import { updateSettingsApi } from '../services/api';
import { offlineDB } from '../services/db';
import { useIsMobile } from '../hooks/useIsMobile';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: BoothSettings;
  onSaveSettings: (newSettings: BoothSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentSettings,
  onSaveSettings
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'general' | 'video' | 'interests' | 'cloud' | 'security'>('general');
  const [formData, setFormData] = useState<BoothSettings>({ ...currentSettings });
  const [newInterestInput, setNewInterestInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const isMobile = useIsMobile();

  const handleAddInterest = () => {
    if (!newInterestInput.trim()) return;
    if (formData.default_interests.includes(newInterestInput.trim())) return;
    setFormData({
      ...formData,
      default_interests: [...formData.default_interests, newInterestInput.trim()]
    });
    setNewInterestInput('');
  };

  const handleRemoveInterest = (index: number) => {
    const updated = formData.default_interests.filter((_, i) => i !== index);
    setFormData({ ...formData, default_interests: updated });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await offlineDB.saveSettingsLocally(formData);
      try {
        // Server verifies the admin PIN before accepting settings changes.
        await updateSettingsApi(formData, formData.admin_pin || currentSettings.admin_pin);
      } catch (remoteErr) {
        console.warn('[Settings] Offline mode, saved locally only:', remoteErr);
      }
      onSaveSettings(formData);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error('[Settings] Error saving settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const tabBtnStyle = (tab: string) => ({
    padding: '10px 14px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: activeTab === tab ? '#0f2f3d' : 'transparent',
    color: activeTab === tab ? '#ffffff' : '#6b6455',
    fontSize: '12.5px',
    fontWeight: 600,
    cursor: 'pointer',
    textAlign: 'left' as const,
    width: '100%',
    whiteSpace: 'nowrap' as const,
    transition: 'all 0.15s ease'
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 47, 61, 0.65)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
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
          maxWidth: '780px',
          backgroundColor: '#fbf9f4',
          borderRadius: '20px',
          overflow: 'hidden',
          border: '1px solid #e6e0cd',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
          maxHeight: '88dvh',
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
            <div style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: '#c9b896', fontWeight: 600 }}>
              Konfigurasi Booth Pameran
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 600 }}>
              Pengaturan Sistem & Integrasi
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

        {/* Content with Sidebar Tabs (becomes a horizontal tab strip on mobile) */}
        <div className="sa-set-body" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left Tab List */}
          <div
            className="sa-set-tabs"
            style={{
              width: '200px',
              backgroundColor: '#ffffff',
              borderRight: '1px solid #e6e0cd',
              padding: isMobile ? '10px' : '16px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: isMobile ? '6px' : '4px',
              flexShrink: 0
            }}
          >
            <button type="button" style={tabBtnStyle('general')} onClick={() => setActiveTab('general')}>
              🏢 Info Booth & Venue
            </button>
            <button type="button" style={tabBtnStyle('video')} onClick={() => setActiveTab('video')}>
              🎬 Video Screensaver
            </button>
            <button type="button" style={tabBtnStyle('interests')} onClick={() => setActiveTab('interests')}>
              🏷️ Pilihan Minat Produk
            </button>
            <button type="button" style={tabBtnStyle('cloud')} onClick={() => setActiveTab('cloud')}>
              📊 Google Sheets & API
            </button>
            <button type="button" style={tabBtnStyle('security')} onClick={() => setActiveTab('security')}>
              🔒 PIN & Keamanan
            </button>
          </div>

          {/* Right Form Fields */}
          <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* TAB 1: GENERAL */}
              {activeTab === 'general' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#0f2f3d', marginBottom: '6px' }}>
                      Nomor / Kode Booth
                    </label>
                    <input
                      type="text"
                      className="sa-input"
                      value={formData.booth_id}
                      onChange={(e) => setFormData({ ...formData, booth_id: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#0f2f3d', marginBottom: '6px' }}>
                      Nama Event / Perusahaan
                    </label>
                    <input
                      type="text"
                      className="sa-input"
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#0f2f3d', marginBottom: '6px' }}>
                      Lokasi Venue Pameran
                    </label>
                    <input
                      type="text"
                      className="sa-input"
                      placeholder="cth. Jakarta Convention Center"
                      value={formData.kiosk_venue || ''}
                      onChange={(e) => setFormData({ ...formData, kiosk_venue: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#0f2f3d', marginBottom: '6px' }}>
                      Tanggal Pameran
                    </label>
                    <input
                      type="text"
                      className="sa-input"
                      placeholder="cth. 09 – 11 Sept 2026"
                      value={formData.date_range || ''}
                      onChange={(e) => setFormData({ ...formData, date_range: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#0f2f3d', marginBottom: '6px' }}>
                      Tagline / Slogan Perusahaan
                    </label>
                    <input
                      type="text"
                      className="sa-input"
                      value={formData.tagline}
                      onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    />
                  </div>
                </>
              )}

              {/* TAB 2: VIDEO SCREENSAVER */}
              {activeTab === 'video' && (
                <>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#0f2f3d', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.video_enabled}
                        onChange={(e) => setFormData({ ...formData, video_enabled: e.target.checked })}
                      />
                      <span>Aktifkan Video Screensaver (Auto Looping)</span>
                    </label>
                  </div>

                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#0f2f3d', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={Boolean(formData.video_sound_enabled)}
                        onChange={(e) => setFormData({ ...formData, video_sound_enabled: e.target.checked })}
                      />
                      <span>Putar video dengan suara</span>
                    </label>
                    <div style={{ fontSize: '10.5px', color: '#8a8371', marginTop: '4px' }}>
                      Default tanpa suara. Suara paling andal saat screensaver dibuka lewat tombol Video di layar utama; jika muncul otomatis dari idle, sebagian browser tetap membisukannya (aturan autoplay). Untuk file MP4/WebM hasilnya lebih konsisten dibanding YouTube.
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#0f2f3d', marginBottom: '6px' }}>
                      URL Video Company Profile (YouTube / MP4 / WebM)
                    </label>
                    <input
                      type="url"
                      className="sa-input"
                      placeholder="https://www.youtube.com/watch?v=... atau link .mp4"
                      value={formData.video_url}
                      onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    />
                    <div style={{ fontSize: '10.5px', color: '#8a8371', marginTop: '4px' }}>
                      Mendukung link YouTube (cth: https://youtu.be/... atau https://youtube.com/watch?v=...) serta file video langsung MP4/WebM.
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#0f2f3d', marginBottom: '6px' }}>
                      Waktu Inactivity / Idle Timeout (Detik)
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={600}
                      className="sa-input"
                      value={formData.idle_timeout_sec}
                      onChange={(e) => setFormData({ ...formData, idle_timeout_sec: parseInt(e.target.value) || 60 })}
                    />
                    <div style={{ fontSize: '10.5px', color: '#8a8371', marginTop: '4px' }}>
                      Layar akan otomatis kembali ke video loop jika tidak disentuh selama waktu ini (default: 60 detik / 1 menit).
                    </div>
                  </div>
                </>
              )}

              {/* TAB 3: PRODUCT INTERESTS */}
              {activeTab === 'interests' && (
                <>
                  <div style={{ fontSize: '12px', color: '#6b6455', marginBottom: '6px' }}>
                    Daftar pilihan produk / solusi yang dapat dipilih oleh pengunjung saat mengisi formulir:
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      className="sa-input"
                      style={{ flex: '1 1 160px' }}
                      placeholder="Tambah minat produk baru..."
                      value={newInterestInput}
                      onChange={(e) => setNewInterestInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddInterest();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddInterest}
                      className="sa-btn-primary"
                      style={{ padding: '10px 16px', fontSize: '12px' }}
                    >
                      <Plus size={15} />
                      <span>Tambah</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
                    {formData.default_interests.map((interest, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          backgroundColor: '#ffffff',
                          border: '1px solid #e6e0cd',
                          borderRadius: '8px',
                          fontSize: '12.5px'
                        }}
                      >
                        <span style={{ fontWeight: 600, color: '#0f2f3d' }}>{interest}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveInterest(idx)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#b91c1c',
                            cursor: 'pointer',
                            padding: '2px'
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* TAB 4: CLOUD & GSHEETS */}
              {activeTab === 'cloud' && (
                <>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#0f2f3d', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.gsheets_sync_enabled}
                        onChange={(e) => setFormData({ ...formData, gsheets_sync_enabled: e.target.checked })}
                      />
                      <span>Aktifkan Webhook Google Sheets</span>
                    </label>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#0f2f3d', marginBottom: '6px' }}>
                      URL Webhook Google Apps Script
                    </label>
                    <input
                      type="url"
                      className="sa-input"
                      placeholder="https://script.google.com/macros/s/.../exec"
                      value={formData.gsheets_webhook_url}
                      onChange={(e) => setFormData({ ...formData, gsheets_webhook_url: e.target.value })}
                    />
                  </div>

                  <div style={{ fontSize: '11px', color: '#8a8371', lineHeight: 1.5, background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e6e0cd' }}>
                    💡 <strong>Tips:</strong> Data pengunjung otomatis tersimpan di Docker database VPS lokal secara persisten. Webhook Google Sheets adalah integrasi cadangan opsional.
                  </div>
                </>
              )}

              {/* TAB 5: SECURITY */}
              {activeTab === 'security' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#0f2f3d', marginBottom: '6px' }}>
                      PIN Akses Dashboard Admin
                    </label>
                    <input
                      type="password"
                      maxLength={8}
                      className="sa-input"
                      placeholder="Default: 1234"
                      value={formData.admin_pin || '1234'}
                      onChange={(e) => setFormData({ ...formData, admin_pin: e.target.value })}
                    />
                    <div style={{ fontSize: '10.5px', color: '#8a8371', marginTop: '4px' }}>
                      PIN ini digunakan untuk mengunci dan membuka tab Dashboard Admin.
                    </div>
                  </div>
                </>
              )}

              {/* Submit Buttons */}
              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    border: '1px solid #d8d0b8',
                    backgroundColor: '#ffffff',
                    color: '#6b6455',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="sa-btn-primary"
                  style={{ padding: '10px 22px', fontSize: '13px' }}
                >
                  <Save size={15} />
                  <span>{isSaving ? 'Menyimpan...' : saveSuccess ? 'Tersimpan!' : 'Simpan Pengaturan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
