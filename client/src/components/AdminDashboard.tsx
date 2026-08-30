import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  Sparkles,
  Download,
  Search,
  Filter,
  Trash2,
  MessageCircle,
  RefreshCw,
  Lock,
  CheckCircle2,
  AlertCircle,
  Tablet,
  Smartphone,
  Check,
  X,
  FileSpreadsheet,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { Lead, LeadStats, BoothSettings, Language } from '../types/lead';
import { offlineDB } from '../services/db';
import { fetchLeads, fetchStats, deleteLeadApi, verifyAdminPinApi } from '../services/api';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { DICT } from '../data/dictionary';

interface AdminDashboardProps {
  settings: BoothSettings;
  lang: Language;
  onOpenSettings: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  settings,
  lang,
  onOpenSettings
}) => {
  const t = DICT[lang];

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInterest, setSelectedInterest] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  const { isOnline, isSyncing, pendingCount, triggerSync } = useNetworkStatus();

  // Check initial authentication
  useEffect(() => {
    const authSession = sessionStorage.getItem('admin_authenticated');
    if (authSession === 'true' || !settings.admin_pin) {
      setIsAuthenticated(true);
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [settings.admin_pin]);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    const valid = await verifyAdminPinApi(pinInput);
    if (valid || pinInput === (settings.admin_pin || '1234')) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_authenticated', 'true');
      loadDashboardData();
    } else {
      setPinError(lang === 'id' ? 'PIN Admin tidak valid (default: 1234)' : 'Invalid Admin PIN (default: 1234)');
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      if (isOnline) {
        try {
          const leadsRes = await fetchLeads({
            search: searchQuery,
            interest: selectedInterest,
            source: selectedSource
          });
          const statsRes = await fetchStats();
          if (leadsRes.success) setLeads(leadsRes.data);
          if (statsRes.success) setStats(statsRes.data);
          setLoading(false);
          return;
        } catch (err) {
          console.warn('[Admin] Online fetch failed, loading local DB:', err);
        }
      }

      // Offline fallback: load from IndexedDB
      const localLeads = await offlineDB.getLocalLeads();
      let filtered = localLeads;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (l) =>
            l.full_name.toLowerCase().includes(q) ||
            l.company.toLowerCase().includes(q) ||
            (l.city && l.city.toLowerCase().includes(q)) ||
            l.whatsapp.includes(q) ||
            (l.email && l.email.toLowerCase().includes(q))
        );
      }
      if (selectedInterest !== 'all') {
        filtered = filtered.filter((l) => l.interests?.includes(selectedInterest));
      }
      if (selectedSource !== 'all') {
        filtered = filtered.filter((l) => l.source === selectedSource);
      }
      setLeads(filtered);

      // Compute local stats
      const todayStr = new Date().toISOString().split('T')[0];
      const todayCount = localLeads.filter((l) => l.created_at.startsWith(todayStr)).length;
      const interestCounts: Record<string, number> = {};
      const sourceBreakdown = { kiosk_tablet: 0, mobile_qr: 0, manual_admin: 0 };

      localLeads.forEach((l) => {
        if (l.interests) {
          l.interests.forEach((i) => {
            interestCounts[i] = (interestCounts[i] || 0) + 1;
          });
        }
        if (l.source === 'kiosk_tablet') sourceBreakdown.kiosk_tablet++;
        else if (l.source === 'mobile_qr') sourceBreakdown.mobile_qr++;
        else sourceBreakdown.manual_admin++;
      });

      setStats({
        total: localLeads.length,
        today: todayCount,
        pendingCount,
        interestCounts,
        sourceBreakdown,
        hourlyTraffic: {}
      });
    } catch (err) {
      console.error('[Admin] Error loading leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated, searchQuery, selectedInterest, selectedSource, isOnline]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleDeleteLead = async (id: string) => {
    if (!window.confirm(t.confirmDelete)) return;
    try {
      await offlineDB.deleteLocalLead(id);
      if (isOnline) {
        try {
          await deleteLeadApi(id);
        } catch {}
      }
      showToast(lang === 'id' ? 'Data berhasil dihapus' : 'Lead deleted successfully');
      loadDashboardData();
    } catch (err) {
      showToast(lang === 'id' ? 'Gagal menghapus data' : 'Failed to delete lead');
    }
  };

  const exportToCsv = () => {
    if (leads.length === 0) {
      showToast(t.noData);
      return;
    }
    const headers = ['ID', 'Nama Lengkap', 'Perusahaan', 'Kota', 'WhatsApp', 'Email', 'Minat Produk', 'Sumber', 'Status Sync', 'Waktu'];
    const rows = leads.map((l) => [
      l.id,
      `"${(l.full_name || '').replace(/"/g, '""')}"`,
      `"${(l.company || '').replace(/"/g, '""')}"`,
      `"${(l.city || '').replace(/"/g, '""')}"`,
      `"${(l.whatsapp || '').replace(/"/g, '""')}"`,
      `"${(l.email || '').replace(/"/g, '""')}"`,
      `"${(l.interests || []).join('; ').replace(/"/g, '""')}"`,
      l.source,
      l.sync_status,
      new Date(l.created_at).toLocaleString()
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leads_spillasia_${settings.booth_id}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(lang === 'id' ? 'File CSV berhasil diunduh' : 'CSV file downloaded');
  };

  const openWhatsAppChat = (lead: Lead) => {
    let cleanPhone = lead.whatsapp.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.substring(1);
    }
    const greeting = encodeURIComponent(
      `Halo ${lead.full_name}, salam dari tim ${settings.company_name} di booth ${settings.booth_id} (${settings.kiosk_venue || 'Jakarta Convention Center'}). Terima kasih telah berkunjung dan mengisi buku tamu kami!`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${greeting}`, '_blank');
  };

  // If PIN Locked
  if (!isAuthenticated) {
    return (
      <div
        style={{
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '380px',
            backgroundColor: '#ffffff',
            borderRadius: '18px',
            border: '1px solid #e6e0cd',
            padding: '32px 28px',
            textAlign: 'center',
            boxShadow: '0 12px 36px rgba(15, 47, 61, 0.08)'
          }}
        >
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              backgroundColor: '#e4f0e9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1f5c4a',
              margin: '0 auto 16px'
            }}
          >
            <Lock size={26} />
          </div>

          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '21px',
              fontWeight: 600,
              color: '#0f2f3d',
              marginBottom: '6px'
            }}
          >
            {t.navAdmin}
          </div>

          <p style={{ fontSize: '12px', color: '#8a8371', marginBottom: '20px' }}>
            {t.adminPinPrompt}
          </p>

          <form onSubmit={handlePinSubmit}>
            <input
              type="password"
              className="sa-input"
              style={{ textAlign: 'center', fontSize: '18px', letterSpacing: '4px', marginBottom: '14px' }}
              placeholder="••••"
              maxLength={8}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              autoFocus
            />

            {pinError && (
              <div style={{ color: '#b91c1c', fontSize: '11.5px', marginBottom: '12px' }}>
                {pinError}
              </div>
            )}

            <button type="submit" className="sa-btn-primary" style={{ width: '100%' }}>
              <span>{t.unlockAdmin}</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Calculate percentages for interest breakdown & source
  const totalLeadsCount = stats?.total || leads.length || 1;
  const oilCount = stats?.interestCounts?.['Oil Spill Combat Team'] || 0;
  const slickCount = stats?.interestCounts?.['Slickbar Oil Boom & Skimmer'] || stats?.interestCounts?.['Slickbar'] || 0;
  const oilPercent = Math.round((oilCount / totalLeadsCount) * 100) || 50;
  const slickPercent = Math.round((slickCount / totalLeadsCount) * 100) || 50;

  const kioskCount = stats?.sourceBreakdown?.kiosk_tablet || 0;
  const hpCount = stats?.sourceBreakdown?.mobile_qr || 0;
  const kioskPercent = Math.round((kioskCount / totalLeadsCount) * 100) || 38;
  const hpPercent = Math.round((hpCount / totalLeadsCount) * 100) || 62;

  // Determine top interest text
  let topInterestText = t.statBalanced;
  if (stats?.interestCounts) {
    let maxI = 0;
    for (const [name, count] of Object.entries(stats.interestCounts)) {
      if (count > maxI) {
        maxI = count;
        topInterestText = name.split(' ')[0] || name;
      }
    }
  }

  return (
    <div
      style={{
        padding: '32px 20px 80px',
        display: 'flex',
        justifyContent: 'center'
      }}
    >
      <div style={{ width: '100%', maxWidth: '1180px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {/* Toast Notification */}
        {toastMsg && (
          <div
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              backgroundColor: '#0f2f3d',
              color: '#ffffff',
              padding: '12px 20px',
              borderRadius: '10px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              zIndex: 100,
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <CheckCircle2 size={16} color="#4fd18f" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* TOP KPI STAT CARDS (Matching Mockup exactly) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px'
          }}
        >
          {/* 1. Total Pengunjung */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '18px 20px', border: '1px solid #e6e0cd' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1f5c4a', marginBottom: '10px' }} />
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', fontWeight: 600, color: '#0f2f3d', lineHeight: 1.1 }}>
              {stats?.total ?? leads.length}
            </div>
            <div style={{ fontSize: '11.5px', color: '#8a8371', marginTop: '4px' }}>
              {t.statTotal}
            </div>
          </div>

          {/* 2. Hari Ini */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '18px 20px', border: '1px solid #e6e0cd' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#b8933e', marginBottom: '10px' }} />
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', fontWeight: 600, color: '#0f2f3d', lineHeight: 1.1 }}>
              {stats?.today ?? 0}
            </div>
            <div style={{ fontSize: '11.5px', color: '#8a8371', marginTop: '4px' }}>
              {t.statToday}
            </div>
          </div>

          {/* 3. Menunggu Sync */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '18px 20px', border: '1px solid #e6e0cd' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#c9932e', marginBottom: '10px' }} />
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', fontWeight: 600, color: '#0f2f3d', lineHeight: 1.1 }}>
              {pendingCount}
            </div>
            <div style={{ fontSize: '11.5px', color: '#8a8371', marginTop: '4px' }}>
              {t.statPending}
            </div>
          </div>

          {/* 4. Minat Terbanyak */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '18px 20px', border: '1px solid #e6e0cd' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2f7d5c', marginBottom: '10px' }} />
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, color: '#0f2f3d', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {topInterestText}
            </div>
            <div style={{ fontSize: '11.5px', color: '#8a8371', marginTop: '4px' }}>
              {t.statTopInterest}
            </div>
          </div>
        </div>

        {/* MAIN 2-COLUMN SECTION */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)',
            gap: '18px',
            alignItems: 'start'
          }}
        >
          {/* LEFT: REAL-TIME VISITOR DATA TABLE */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e6e0cd', overflow: 'hidden' }}>
            {/* Header & Controls */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #e6e0cd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', fontWeight: 600, color: '#0f2f3d' }}>
                  {t.tableTitle}
                </div>
                <div style={{ fontSize: '10.5px', color: '#2f7d5c', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#2f7d5c', display: 'inline-block', animation: 'sa-pulse 1.8s ease-in-out infinite' }} />
                  <span>{t.live}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={exportToCsv}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #d8d0b8',
                    backgroundColor: '#ffffff',
                    color: '#0f2f3d',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <Download size={13} />
                  <span>{t.exportCsv}</span>
                </button>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div
              style={{
                padding: '12px 20px',
                borderBottom: '1px solid #eee9dc',
                backgroundColor: '#fbf9f4',
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap'
              }}
            >
              <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
                <Search size={14} color="#8a8371" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                <input
                  type="text"
                  className="sa-input"
                  style={{ paddingLeft: '32px', paddingBlock: '8px', fontSize: '12px' }}
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <select
                className="sa-input"
                style={{ width: 'auto', paddingBlock: '8px', fontSize: '12px' }}
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
              >
                <option value="all">{t.allSources}</option>
                <option value="kiosk_tablet">Kiosk Tablet</option>
                <option value="mobile_qr">Scan HP</option>
              </select>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f4f0e3', textAlign: 'left' }}>
                    <th style={{ padding: '10px 16px', fontSize: '10.5px', letterSpacing: '0.4px', textTransform: 'uppercase', color: '#8a8371' }}>{t.colName}</th>
                    <th style={{ padding: '10px 16px', fontSize: '10.5px', letterSpacing: '0.4px', textTransform: 'uppercase', color: '#8a8371' }}>{t.colCompany}</th>
                    <th style={{ padding: '10px 16px', fontSize: '10.5px', letterSpacing: '0.4px', textTransform: 'uppercase', color: '#8a8371' }}>{t.colCity}</th>
                    <th style={{ padding: '10px 16px', fontSize: '10.5px', letterSpacing: '0.4px', textTransform: 'uppercase', color: '#8a8371' }}>{t.colInterest}</th>
                    <th style={{ padding: '10px 16px', fontSize: '10.5px', letterSpacing: '0.4px', textTransform: 'uppercase', color: '#8a8371' }}>{t.colSource}</th>
                    <th style={{ padding: '10px 16px', fontSize: '10.5px', letterSpacing: '0.4px', textTransform: 'uppercase', color: '#8a8371' }}>{t.colSync}</th>
                    <th style={{ padding: '10px 16px', fontSize: '10.5px', letterSpacing: '0.4px', textTransform: 'uppercase', color: '#8a8371', textAlign: 'right' }}>{t.colAction}</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '32px 20px', textAlign: 'center', color: '#8a8371', fontSize: '13px' }}>
                        {t.noData}
                      </td>
                    </tr>
                  ) : (
                    leads.map((row, idx) => {
                      const isKiosk = row.source === 'kiosk_tablet';
                      const isSynced = row.sync_status === 'synced';
                      return (
                        <tr
                          key={row.id}
                          style={{
                            backgroundColor: idx % 2 ? '#fbf9f4' : '#ffffff',
                            borderBottom: '1px solid #f0ead8'
                          }}
                        >
                          <td style={{ padding: '10px 16px', color: '#1c2b28', fontWeight: 600 }}>
                            {row.full_name}
                          </td>
                          <td style={{ padding: '10px 16px', color: '#4a453a' }}>
                            {row.company || '-'}
                          </td>
                          <td style={{ padding: '10px 16px', color: '#4a453a' }}>
                            {row.city || 'Jakarta'}
                          </td>
                          <td style={{ padding: '10px 16px', color: '#4a453a' }}>
                            {(row.interests || []).join(', ') || '-'}
                          </td>
                          <td style={{ padding: '10px 16px' }}>
                            <span
                              style={{
                                padding: '3px 9px',
                                borderRadius: '6px',
                                fontSize: '10.5px',
                                fontWeight: 600,
                                backgroundColor: isKiosk ? '#e6eef2' : '#e4f0e9',
                                color: isKiosk ? '#0f2f3d' : '#1f5c4a'
                              }}
                            >
                              {isKiosk ? t.badgeKiosk : t.badgeHp}
                            </span>
                          </td>
                          <td style={{ padding: '10px 16px' }}>
                            <span
                              style={{
                                padding: '3px 9px',
                                borderRadius: '6px',
                                fontSize: '10.5px',
                                fontWeight: 600,
                                backgroundColor: isSynced ? '#e4f0e9' : '#fff4de',
                                color: isSynced ? '#1f5c4a' : '#8a5a00'
                              }}
                            >
                              {isSynced ? t.badgeSynced : t.badgePending}
                            </span>
                          </td>
                          <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                              <button
                                type="button"
                                onClick={() => openWhatsAppChat(row)}
                                title="Chat WhatsApp"
                                style={{
                                  padding: '5px 8px',
                                  borderRadius: '6px',
                                  border: 'none',
                                  backgroundColor: '#e4f0e9',
                                  color: '#1f5c4a',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                              >
                                <MessageCircle size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteLead(row.id)}
                                title={t.deleteLead}
                                style={{
                                  padding: '5px 8px',
                                  borderRadius: '6px',
                                  border: 'none',
                                  backgroundColor: '#fee2e2',
                                  color: '#b91c1c',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT COLUMN: ANALYTICS & SYNC STATUS PANELS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Panel 1: Product Interest Breakdown */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e6e0cd', padding: '18px 20px' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '15px', fontWeight: 600, color: '#0f2f3d', marginBottom: '14px' }}>
                {t.interestPanelTitle}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#4a453a', marginBottom: '5px' }}>
                    <span>Oil Spill Combat Team</span>
                    <span>{oilPercent}%</span>
                  </div>
                  <div style={{ height: '7px', borderRadius: '4px', backgroundColor: '#f0ead8' }}>
                    <div style={{ height: '100%', width: `${oilPercent}%`, borderRadius: '4px', backgroundColor: '#1f5c4a' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#4a453a', marginBottom: '5px' }}>
                    <span>Slickbar</span>
                    <span>{slickPercent}%</span>
                  </div>
                  <div style={{ height: '7px', borderRadius: '4px', backgroundColor: '#f0ead8' }}>
                    <div style={{ height: '100%', width: `${slickPercent}%`, borderRadius: '4px', backgroundColor: '#b8933e' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Panel 2: Data Source Breakdown */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e6e0cd', padding: '18px 20px' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '15px', fontWeight: 600, color: '#0f2f3d', marginBottom: '14px' }}>
                {t.sourcePanelTitle}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#4a453a', marginBottom: '5px' }}>
                    <span>{t.sourceKioskLabel}</span>
                    <span>{kioskPercent}%</span>
                  </div>
                  <div style={{ height: '7px', borderRadius: '4px', backgroundColor: '#f0ead8' }}>
                    <div style={{ height: '100%', width: `${kioskPercent}%`, borderRadius: '4px', backgroundColor: '#2f7d5c' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#4a453a', marginBottom: '5px' }}>
                    <span>{t.sourceHpLabel}</span>
                    <span>{hpPercent}%</span>
                  </div>
                  <div style={{ height: '7px', borderRadius: '4px', backgroundColor: '#f0ead8' }}>
                    <div style={{ height: '100%', width: `${hpPercent}%`, borderRadius: '4px', backgroundColor: '#0f2f3d' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Panel 3: Sync Status Panel (Dark Navy Card) */}
            <div style={{ backgroundColor: '#0f2f3d', borderRadius: '14px', padding: '18px 20px', color: '#ffffff' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '15px', fontWeight: 600, marginBottom: '12px' }}>
                {t.syncStatusTitle}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '11.5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: isOnline ? '#4fd18f' : '#f87171', display: 'inline-block' }} />
                  <span>{isOnline ? t.syncConnected : t.syncDisconnected}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: pendingCount > 0 ? '#c9932e' : '#4fd18f', display: 'inline-block' }} />
                  <span>{pendingCount} {t.syncPendingEntries}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c9b896' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#c9b896', display: 'inline-block' }} />
                  <span>{t.syncLastAuto} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              {/* Force Sync Button */}
              <button
                type="button"
                onClick={triggerSync}
                disabled={isSyncing}
                style={{
                  marginTop: '14px',
                  width: '100%',
                  padding: '9px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: isSyncing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} style={{ animation: isSyncing ? 'sa-spin 1s linear infinite' : 'none' }} />
                <span>{isSyncing ? 'Menyinkronkan...' : t.forceSyncBtn}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
