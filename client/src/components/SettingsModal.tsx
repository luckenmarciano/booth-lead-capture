import React, { useState, useRef, useEffect } from 'react';
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
  Upload,
  Film,
  AlertCircle,
  Server
} from 'lucide-react';
import { BoothSettings } from '../types/lead';
import { updateSettingsApi, uploadServerVideoApi, deleteServerVideoApi } from '../services/api';
import { offlineDB } from '../services/db';
import { useIsMobile } from '../hooks/useIsMobile';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: BoothSettings;
  onSaveSettings: (newSettings: BoothSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings: currentSettings,
  onSaveSettings
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'general' | 'video' | 'interests' | 'cloud' | 'security'>('general');
  const [formData, setFormData] = useState<BoothSettings>({ ...currentSettings });
  const [newInterestInput, setNewInterestInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const isMobile = useIsMobile();

  // Local video blob state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localVideoName, setLocalVideoName] = useState<string>('');
  const [localVideoSize, setLocalVideoSize] = useState<number>(0);
  const [blobSaveProgress, setBlobSaveProgress] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');
  const [storedBlobInfo, setStoredBlobInfo] = useState<{ name: string; size: number } | null>(null);

  // Load stored blob metadata from localStorage on mount
  useEffect(() => {
    const raw = localStorage.getItem('local_video_meta');
    if (raw) {
      try { setStoredBlobInfo(JSON.parse(raw)); } catch {}
    }
  }, []);

  const LOCAL_BLOB_KEY = 'local_video_v1';

  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLocalVideoName(file.name);
    setLocalVideoSize(file.size);
    setBlobSaveProgress('saving');
    try {
      await offlineDB.saveVideoBlob(LOCAL_BLOB_KEY, file);
      const meta = { name: file.name, size: file.size };
      localStorage.setItem('local_video_meta', JSON.stringify(meta));
      setStoredBlobInfo(meta);
      setFormData(prev => ({ ...prev, video_source: 'local', video_local_blob_key: LOCAL_BLOB_KEY }));
      setBlobSaveProgress('done');
    } catch {
      setBlobSaveProgress('error');
    }
  };

  const handleDeleteLocalVideo = async () => {
    await offlineDB.deleteVideoBlob(LOCAL_BLOB_KEY);
    localStorage.removeItem('local_video_meta');
    setStoredBlobInfo(null);
    setLocalVideoName('');
    setLocalVideoSize(0);
    setBlobSaveProgress('idle');
    setFormData(prev => ({ ...prev, video_source: 'url', video_local_blob_key: undefined }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Server-hosted video state
  const serverFileInputRef = useRef<HTMLInputElement>(null);
  const [serverUploadProgress, setServerUploadProgress] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
  const [serverUploadError, setServerUploadError] = useState('');

  const handleServerVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setServerUploadProgress('uploading');
    setServerUploadError('');
    try {
      const pin = formData.admin_pin || currentSettings.admin_pin;
      const result = await uploadServerVideoApi(file, pin);
      setFormData(prev => ({
        ...prev,
        video_source: 'server',
        video_server_url: result.data.video_server_url,
        video_server_original_name: result.data.video_server_original_name,
        video_server_size: result.data.video_server_size
      }));
      setServerUploadProgress('done');
    } catch (err: any) {
      setServerUploadError(err.message || 'Gagal mengunggah video');
      setServerUploadProgress('error');
    }
  };

  const handleDeleteServerVideo = async () => {
    try {
      const pin = formData.admin_pin || currentSettings.admin_pin;
      await deleteServerVideoApi(pin);
    } catch (err) {
      console.error('[Settings] Failed to delete server video:', err);
    }
    setFormData(prev => ({
      ...prev,
      video_source: 'url',
      video_server_url: undefined,
      video_server_original_name: undefined,
      video_server_size: undefined
    }));
    setServerUploadProgress('idle');
    setServerUploadError('');
    if (serverFileInputRef.current) serverFileInputRef.current.value = '';
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
      // Only keep the local blob key while local file mode is actually selected.
      // Server-video fields (video_server_*) are intentionally left as-is when
      // switching away from 'server' — the uploaded file stays on the server
      // disk until explicitly deleted via the "Hapus" button.
      const dataToSave: BoothSettings = { ...formData };
      if (dataToSave.video_source !== 'local') {
        dataToSave.video_local_blob_key = undefined;
      }
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
                      Default tanpa suara. Suara paling andal saat screensaver dibuka lewat tombol Video di layar utama; jika muncul otomatis dari idle, sebagian browser tetap membisukannya (aturan autoplay). Untuk file MP4/WebM hasilnya lebih konsisten dibanding YouTube.
                    </div>
                  </div>

                  {/* Source Toggle */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#0f2f3d', marginBottom: '2px' }}>Sumber Video</div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {/* URL Option */}
                      <label
                        style={{
                          flex: '1 1 180px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '12px 14px',
                          borderRadius: '10px',
                          border: `2px solid ${(formData.video_source ?? 'url') === 'url' ? '#1f5c4a' : '#e6e0cd'}`,
                          backgroundColor: (formData.video_source ?? 'url') === 'url' ? '#f0f8f4' : '#ffffff',
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                      >
                        <input
                          type="radio"
                          name="video_source"
                          value="url"
                          checked={(formData.video_source ?? 'url') === 'url'}
                          onChange={() => setFormData(prev => ({ ...prev, video_source: 'url' }))}
                          style={{ accentColor: '#1f5c4a' }}
                        />
                        <Globe size={16} color="#1f5c4a" />
                        <div>
                          <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f2f3d' }}>URL Online</div>
                          <div style={{ fontSize: '10.5px', color: '#8a8371' }}>YouTube / Link MP4</div>
                        </div>
                      </label>

                      {/* Local File Option */}
                      <label
                        style={{
                          flex: '1 1 180px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '12px 14px',
                          borderRadius: '10px',
                          border: `2px solid ${formData.video_source === 'local' ? '#1f5c4a' : '#e6e0cd'}`,
                          backgroundColor: formData.video_source === 'local' ? '#f0f8f4' : '#ffffff',
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                      >
                        <input
                          type="radio"
                          name="video_source"
                          value="local"
                          checked={formData.video_source === 'local'}
                          onChange={() => setFormData(prev => ({ ...prev, video_source: 'local' }))}
                          style={{ accentColor: '#1f5c4a' }}
                        />
                        <Film size={16} color="#1f5c4a" />
                        <div>
                          <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f2f3d' }}>File Lokal Perangkat</div>
                          <div style={{ fontSize: '10.5px', color: '#8a8371' }}>MP4 / MKV dari tablet</div>
                        </div>
                      </label>

                      {/* Server Storage Option */}
                      <label
                        style={{
                          flex: '1 1 180px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '12px 14px',
                          borderRadius: '10px',
                          border: `2px solid ${formData.video_source === 'server' ? '#1f5c4a' : '#e6e0cd'}`,
                          backgroundColor: formData.video_source === 'server' ? '#f0f8f4' : '#ffffff',
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                      >
                        <input
                          type="radio"
                          name="video_source"
                          value="server"
                          checked={formData.video_source === 'server'}
                          onChange={() => setFormData(prev => ({ ...prev, video_source: 'server' }))}
                          style={{ accentColor: '#1f5c4a' }}
                        />
                        <Server size={16} color="#1f5c4a" />
                        <div>
                          <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f2f3d' }}>Simpan di Server</div>
                          <div style={{ fontSize: '10.5px', color: '#8a8371' }}>Terpusat, otomatis ke semua tablet</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* URL Input — shown when source = url */}
                  {(formData.video_source ?? 'url') === 'url' && (
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
                  )}

                  {/* Local File Picker — shown when source = local */}
                  {formData.video_source === 'local' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {/* Already stored file info */}
                      {storedBlobInfo && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 14px',
                            backgroundColor: '#f0f8f4',
                            border: '1.5px solid #1f5c4a',
                            borderRadius: '10px',
                            gap: '10px',
                            flexWrap: 'wrap'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Film size={20} color="#1f5c4a" />
                            <div>
                              <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f2f3d' }}>{storedBlobInfo.name}</div>
                              <div style={{ fontSize: '11px', color: '#4a7c5c' }}>
                                {formatBytes(storedBlobInfo.size)} · Tersimpan di perangkat ini
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleDeleteLocalVideo}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '7px 12px',
                              borderRadius: '7px',
                              border: '1px solid #f87171',
                              backgroundColor: '#fff5f5',
                              color: '#b91c1c',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={13} />
                            Hapus
                          </button>
                        </div>
                      )}

                      {/* File Picker Button */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/mp4,video/webm,video/mkv,video/x-matroska,video/*"
                        style={{ display: 'none' }}
                        onChange={handleVideoFileChange}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          padding: '14px',
                          borderRadius: '10px',
                          border: '2px dashed #1f5c4a',
                          backgroundColor: '#f8fdf9',
                          color: '#1f5c4a',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          width: '100%',
                          transition: 'background 0.15s'
                        }}
                      >
                        <Upload size={18} />
                        {storedBlobInfo ? 'Ganti Video Lokal' : 'Pilih Video dari Perangkat'}
                      </button>

                      {/* Save Progress */}
                      {blobSaveProgress === 'saving' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#1f5c4a', fontWeight: 600 }}>
                          <div style={{
                            width: '16px', height: '16px', borderRadius: '50%',
                            border: '2px solid #1f5c4a', borderTopColor: 'transparent',
                            animation: 'sa-spin 0.7s linear infinite', flexShrink: 0
                          }} />
                          Menyimpan video ke perangkat... ({localVideoName && formatBytes(localVideoSize)})
                        </div>
                      )}
                      {blobSaveProgress === 'done' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#16a34a', fontWeight: 600 }}>
                          <CheckCircle2 size={15} /> Video berhasil disimpan! Bisa diputar offline.
                        </div>
                      )}
                      {blobSaveProgress === 'error' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#b91c1c', fontWeight: 600 }}>
                          <AlertCircle size={15} /> Gagal menyimpan. Coba file yang lebih kecil.
                        </div>
                      )}

                      <div style={{ fontSize: '10.5px', color: '#8a8371', lineHeight: 1.5, background: '#ffffff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e6e0cd' }}>
                        💡 <strong>Tips:</strong> Video disimpan langsung di memori tablet ini (IndexedDB). Tidak memerlukan koneksi internet untuk diputar. Maksimum ukuran file bergantung pada kapasitas storage browser (biasanya &gt;500 MB). Format terbaik: <strong>MP4 H.264</strong>.
                      </div>
                    </div>
                  )}

                  {/* Server Video Uploader — shown when source = server */}
                  {formData.video_source === 'server' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {/* Already stored file info */}
                      {formData.video_server_url && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 14px',
                            backgroundColor: '#f0f8f4',
                            border: '1.5px solid #1f5c4a',
                            borderRadius: '10px',
                            gap: '10px',
                            flexWrap: 'wrap'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Server size={20} color="#1f5c4a" />
                            <div>
                              <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f2f3d' }}>{formData.video_server_original_name}</div>
                              <div style={{ fontSize: '11px', color: '#4a7c5c' }}>
                                {formData.video_server_size ? formatBytes(formData.video_server_size) : ''} · Tersimpan di server, otomatis ke semua tablet
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleDeleteServerVideo}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '7px 12px',
                              borderRadius: '7px',
                              border: '1px solid #f87171',
                              backgroundColor: '#fff5f5',
                              color: '#b91c1c',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={13} />
                            Hapus
                          </button>
                        </div>
                      )}

                      {/* File Picker Button */}
                      <input
                        ref={serverFileInputRef}
                        type="file"
                        accept="video/mp4,video/webm,video/mkv,video/x-matroska,video/*"
                        style={{ display: 'none' }}
                        onChange={handleServerVideoFileChange}
                      />
                      <button
                        type="button"
                        onClick={() => serverFileInputRef.current?.click()}
                        disabled={serverUploadProgress === 'uploading'}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          padding: '14px',
                          borderRadius: '10px',
                          border: '2px dashed #1f5c4a',
                          backgroundColor: '#f8fdf9',
                          color: '#1f5c4a',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: serverUploadProgress === 'uploading' ? 'not-allowed' : 'pointer',
                          opacity: serverUploadProgress === 'uploading' ? 0.6 : 1,
                          width: '100%',
                          transition: 'background 0.15s'
                        }}
                      >
                        <Upload size={18} />
                        {formData.video_server_url ? 'Ganti Video Server' : 'Unggah Video ke Server'}
                      </button>

                      {/* Upload Progress */}
                      {serverUploadProgress === 'uploading' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#1f5c4a', fontWeight: 600 }}>
                          <div style={{
                            width: '16px', height: '16px', borderRadius: '50%',
                            border: '2px solid #1f5c4a', borderTopColor: 'transparent',
                            animation: 'sa-spin 0.7s linear infinite', flexShrink: 0
                          }} />
                          Mengunggah video ke server... (bisa beberapa menit tergantung koneksi)
                        </div>
                      )}
                      {serverUploadProgress === 'done' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#16a34a', fontWeight: 600 }}>
                          <CheckCircle2 size={15} /> Video berhasil diunggah ke server!
                        </div>
                      )}
                      {serverUploadProgress === 'error' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#b91c1c', fontWeight: 600 }}>
                          <AlertCircle size={15} /> {serverUploadError || 'Gagal mengunggah video.'}
                        </div>
                      )}

                      <div style={{ fontSize: '10.5px', color: '#8a8371', lineHeight: 1.5, background: '#ffffff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e6e0cd' }}>
                        💡 <strong>Tips:</strong> Video disimpan di server pusat (VPS). Semua tablet & browser admin otomatis mendapatkan video terbaru tanpa perlu upload ulang. Maksimum ukuran file: <strong>200 MB</strong>. Format didukung: MP4, WebM, MKV, MOV.
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
