import React, { useState, useEffect, useRef } from 'react';
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
  Globe,
  UploadCloud,
  Film,
  HardDrive,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { BoothSettings } from '../types/lead';
import { updateSettingsApi } from '../services/api';
import { offlineDB } from '../services/db';
import { useIsMobile } from '../hooks/useIsMobile';
import { formatFileSize } from '../services/videoManager';

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

  // Local Tablet Video State
  const [videoSourceType, setVideoSourceType] = useState<'local' | 'url'>(
    formData.video_source_type || (formData.video_local_name ? 'local' : (formData.video_url ? 'url' : 'local'))
  );
  const [localVideoMeta, setLocalVideoMeta] = useState<{
    name: string;
    size: number;
    type: string;
    updated_at?: string;
  } | null>(null);
  const [localVideoPreviewUrl, setLocalVideoPreviewUrl] = useState<string | null>(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [videoUploadError, setVideoUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);

  // Load existing local video blob on mount/open
  useEffect(() => {
    let activeUrl: string | null = null;
    const loadSavedVideo = async () => {
      try {
        const media = await offlineDB.getVideoMedia();
        if (media && media.blob) {
          activeUrl = URL.createObjectURL(media.blob);
          setLocalVideoPreviewUrl(activeUrl);
          setLocalVideoMeta({
            name: media.name,
            size: media.size,
            type: media.type,
            updated_at: media.updated_at
          });
          if (!formData.video_local_name) {
            setFormData((prev) => ({
              ...prev,
              video_local_name: media.name,
              video_local_size: media.size
            }));
          }
        }
      } catch (err) {
        console.warn('[SettingsModal] Error loading existing local video:', err);
      }
    };

    if (isOpen) {
      loadSavedVideo();
    }

    return () => {
      if (activeUrl) {
        URL.revokeObjectURL(activeUrl);
      }
    };
  }, [isOpen]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate video format
    const isValidFormat =
      file.type.startsWith('video/') ||
      Boolean(file.name.match(/\.(mp4|webm|mov|mkv|avi|m4v)$/i));

    if (!isValidFormat) {
      setVideoUploadError('Format file tidak didukung. Harap pilih file video (MP4, WebM, MOV).');
      return;
    }

    setIsUploadingVideo(true);
    setVideoUploadError(null);

    try {
      const res = await offlineDB.saveVideoMedia(file, file.name, file.type || 'video/mp4', file.size);
      if (localVideoPreviewUrl) {
        URL.revokeObjectURL(localVideoPreviewUrl);
      }
      const newUrl = URL.createObjectURL(file);
      setLocalVideoPreviewUrl(newUrl);
      setLocalVideoMeta({
        name: res.name,
        size: res.size,
        type: res.type,
        updated_at: new Date().toISOString()
      });
      setFormData((prev) => ({
        ...prev,
        video_source_type: 'local',
        video_local_name: res.name,
        video_local_size: res.size,
        video_local_updated_at: new Date().toISOString()
      }));
      setVideoSourceType('local');
    } catch (err) {
      console.error('[SettingsModal] Error saving video file:', err);
      setVideoUploadError('Gagal menyimpan file video ke penyimpanan tablet.');
    } finally {
      setIsUploadingVideo(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveLocalVideo = async () => {
    try {
      await offlineDB.deleteVideoMedia();
      if (localVideoPreviewUrl) {
        URL.revokeObjectURL(localVideoPreviewUrl);
        setLocalVideoPreviewUrl(null);
      }
      setLocalVideoMeta(null);
      setFormData((prev) => ({
        ...prev,
        video_local_name: '',
        video_local_size: 0,
        video_local_updated_at: undefined
      }));
    } catch (err) {
      console.error('[SettingsModal] Error deleting video:', err);
    }
  };

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
      const dataToSave = {
        ...formData,
        video_source_type: videoSourceType
      };
      await offlineDB.saveSettingsLocally(dataToSave);
      try {
        // Server verifies the admin PIN before accepting settings changes.
        await updateSettingsApi(dataToSave, dataToSave.admin_pin || currentSettings.admin_pin);
      } catch (remoteErr) {
        console.warn('[Settings] Offline mode, saved locally only:', remoteErr);
      }
      onSaveSettings(dataToSave);
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
                      Default tanpa suara. Suara paling andal saat screensaver dibuka lewat tombol Video di layar utama; jika muncul otomatis dari idle, sebagian browser membisukannya secara default (kebijakan autoplay).
                    </div>
                  </div>

                  {/* Video Source Selector */}
                  <div style={{ marginTop: '4px' }}>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#0f2f3d', marginBottom: '8px' }}>
                      Pilih Sumber Video Screensaver
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px' }}>
                      {/* Option A: Tablet Storage */}
                      <div
                        onClick={() => {
                          setVideoSourceType('local');
                          setFormData((prev) => ({ ...prev, video_source_type: 'local' }));
                        }}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '10px',
                          border: videoSourceType === 'local' ? '2px solid #0f2f3d' : '1px solid #dcd7c5',
                          backgroundColor: videoSourceType === 'local' ? 'rgba(15, 47, 61, 0.05)' : '#ffffff',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '12.5px', color: '#0f2f3d' }}>
                            <HardDrive size={15} color="#0f2f3d" />
                            <span>Penyimpanan Tablet</span>
                          </div>
                          <span style={{ fontSize: '9.5px', fontWeight: 700, backgroundColor: '#e2f0d9', color: '#2d6a4f', padding: '2px 6px', borderRadius: '4px' }}>
                            OFFLINE
                          </span>
                        </div>
                        <p style={{ fontSize: '11px', color: '#6b6455', margin: 0 }}>
                          Pilih file video langsung dari memori/galeri tablet. 100% lancar tanpa butuh internet saat pameran.
                        </p>
                      </div>

                      {/* Option B: Online URL */}
                      <div
                        onClick={() => {
                          setVideoSourceType('url');
                          setFormData((prev) => ({ ...prev, video_source_type: 'url' }));
                        }}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '10px',
                          border: videoSourceType === 'url' ? '2px solid #0f2f3d' : '1px solid #dcd7c5',
                          backgroundColor: videoSourceType === 'url' ? 'rgba(15, 47, 61, 0.05)' : '#ffffff',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '12.5px', color: '#0f2f3d', marginBottom: '4px' }}>
                          <Globe size={15} color="#0f2f3d" />
                          <span>Link URL / YouTube</span>
                        </div>
                        <p style={{ fontSize: '11px', color: '#6b6455', margin: 0 }}>
                          Gunakan tautan YouTube atau direct link MP4/WebM online (memerlukan koneksi internet aktif).
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* SOURCE 1: LOCAL TABLET FILE UPLOAD */}
                  {videoSourceType === 'local' && (
                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #e0d9c4', borderRadius: '12px', padding: '16px' }}>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/mp4,video/webm,video/ogg,video/quicktime,video/*"
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                      />

                      {localVideoMeta && localVideoPreviewUrl ? (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <CheckCircle2 size={20} color="#2d6a4f" />
                              <div>
                                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f2f3d' }}>
                                  Video Tersimpan di Tablet
                                </div>
                                <div style={{ fontSize: '11px', color: '#6b6455' }}>
                                  {localVideoMeta.name} • {formatFileSize(localVideoMeta.size)}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploadingVideo}
                                style={{
                                  padding: '6px 12px',
                                  borderRadius: '6px',
                                  border: '1px solid #c9c2b0',
                                  backgroundColor: '#ffffff',
                                  fontSize: '11.5px',
                                  fontWeight: 600,
                                  color: '#0f2f3d',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <RefreshCw size={12} />
                                <span>Ganti Video</span>
                              </button>
                              <button
                                type="button"
                                onClick={handleRemoveLocalVideo}
                                style={{
                                  padding: '6px 12px',
                                  borderRadius: '6px',
                                  border: '1px solid #f2c0bd',
                                  backgroundColor: '#fff5f5',
                                  fontSize: '11.5px',
                                  fontWeight: 600,
                                  color: '#c53030',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <Trash2 size={12} />
                                <span>Hapus</span>
                              </button>
                            </div>
                          </div>

                          {/* Video Preview Player */}
                          <div
                            style={{
                              borderRadius: '8px',
                              overflow: 'hidden',
                              backgroundColor: '#0a1f29',
                              position: 'relative',
                              maxHeight: '220px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <video
                              ref={previewVideoRef}
                              src={localVideoPreviewUrl}
                              controls
                              playsInline
                              style={{ width: '100%', maxHeight: '220px', objectFit: 'contain' }}
                            />
                          </div>
                          <div style={{ fontSize: '10.5px', color: '#2d6a4f', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>✅ Video tersimpan di memori internal offline tablet dan siap diputar otomatis saat screensaver aktif.</span>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          style={{
                            border: '2px dashed #c4bc9f',
                            borderRadius: '10px',
                            padding: '24px 16px',
                            textAlign: 'center',
                            backgroundColor: '#faf8f2',
                            cursor: isUploadingVideo ? 'wait' : 'pointer',
                            transition: 'border-color 0.2s'
                          }}
                        >
                          {isUploadingVideo ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                              <RefreshCw size={28} color="#0f2f3d" className="animate-spin" />
                              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f2f3d' }}>
                                Menyimpan video ke memori tablet...
                              </div>
                              <div style={{ fontSize: '11px', color: '#6b6455' }}>
                                Mohon tunggu beberapa saat
                              </div>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                              <div
                                style={{
                                  width: '48px',
                                  height: '48px',
                                  borderRadius: '50%',
                                  backgroundColor: 'rgba(15, 47, 61, 0.08)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#0f2f3d'
                                }}
                              >
                                <UploadCloud size={24} />
                              </div>
                              <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0f2f3d' }}>
                                Pilih File Video dari Tablet
                              </div>
                              <div style={{ fontSize: '11px', color: '#6b6455', maxWidth: '360px' }}>
                                Sentuh di sini untuk membuka galeri / pengelola file tablet. Mendukung format MP4, WebM, atau MOV.
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  fileInputRef.current?.click();
                                }}
                                style={{
                                  marginTop: '6px',
                                  padding: '8px 16px',
                                  borderRadius: '8px',
                                  backgroundColor: '#0f2f3d',
                                  color: '#ffffff',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  border: 'none',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                              >
                                <Film size={14} />
                                <span>Buka File Video Tablet</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {videoUploadError && (
                        <div style={{ marginTop: '8px', padding: '8px 12px', borderRadius: '6px', backgroundColor: '#fff5f5', border: '1px solid #fed7d7', color: '#c53030', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <AlertCircle size={14} />
                          <span>{videoUploadError}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* SOURCE 2: ONLINE URL */}
                  {videoSourceType === 'url' && (
                    <div>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#0f2f3d', marginBottom: '6px' }}>
                        URL Video Company Profile (YouTube / MP4 Web)
                      </label>
                      <input
                        type="url"
                        className="sa-input"
                        placeholder="https://www.youtube.com/watch?v=... atau link .mp4"
                        value={formData.video_url}
                        onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                      />
                      <div style={{ fontSize: '10.5px', color: '#8a8371', marginTop: '4px' }}>
                        Mendukung link YouTube (cth: https://youtu.be/... atau https://youtube.com/watch?v=...) serta file video langsung MP4/WebM online.
                      </div>
                    </div>
                  )}

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
