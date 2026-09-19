import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Lead, BoothSettings, Language } from '../types/lead';

export interface ExportResult {
  success: boolean;
  filename: string;
  message?: string;
}

const formatDateTime = (dateStr?: string): string => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateStr;
  }
};

const getSourceLabel = (s: Lead['source'], lang: Language): string => {
  if (s === 'kiosk_tablet') return lang === 'id' ? 'Kiosk Tablet' : 'Kiosk Tablet';
  if (s === 'mobile_qr') return lang === 'id' ? 'Mobile QR (HP)' : 'Mobile QR (Phone)';
  return lang === 'id' ? 'Manual Admin' : 'Manual Admin';
};

const getSyncStatusLabel = (s: Lead['sync_status'], lang: Language): string => {
  if (s === 'synced') return lang === 'id' ? 'Tersinkronisasi' : 'Synced';
  if (s === 'failed') return lang === 'id' ? 'Gagal' : 'Failed';
  return lang === 'id' ? 'Menunggu (Lokal)' : 'Pending (Local)';
};

const generateFileName = (settings: BoothSettings, ext: string): string => {
  const company = (settings.company_name || 'Booth').replace(/[^\w-]+/g, '_');
  const booth = (settings.booth_id || 'Kiosk').replace(/[^\w-]+/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];
  return `leads_${company}_${booth}_${dateStr}.${ext}`;
};

/**
 * Trigger download of Blob content
 */
const downloadBlob = (content: BlobPart, mime: string, filename: string): void => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
};

// ==========================================
// 1. EXPORT TO REAL EXCEL (.XLSX)
// ==========================================
export const exportToExcel = async (
  leads: Lead[],
  settings: BoothSettings,
  lang: Language = 'id'
): Promise<ExportResult> => {
  if (!leads || leads.length === 0) {
    return { success: false, filename: '', message: 'Tidak ada data untuk diekspor' };
  }

  const isId = lang === 'id';
  const filename = generateFileName(settings, 'xlsx');

  const headers = isId
    ? [
        'No',
        'Nama Lengkap',
        'Perusahaan',
        'Jabatan',
        'Kota',
        'No. WhatsApp',
        'Email',
        'Minat Produk',
        'Preferensi Follow-Up',
        'Catatan',
        'Sumber Data',
        'Status Sinkronisasi',
        'Waktu Registrasi'
      ]
    : [
        'No',
        'Full Name',
        'Company',
        'Job Title',
        'City',
        'WhatsApp',
        'Email',
        'Product Interests',
        'Follow-up Preference',
        'Notes',
        'Data Source',
        'Sync Status',
        'Registration Time'
      ];

  const rows = leads.map((lead, idx) => [
    idx + 1,
    lead.full_name || '',
    lead.company || '',
    lead.job_title || '',
    lead.city || '',
    lead.whatsapp || '',
    lead.email || '',
    (lead.interests || []).join('; '),
    lead.follow_up_pref || '',
    lead.notes || '',
    getSourceLabel(lead.source, lang),
    getSyncStatusLabel(lead.sync_status, lang),
    formatDateTime(lead.created_at)
  ]);

  // Create workbook and worksheet
  const worksheetData = [headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Auto-calculate column widths
  const colWidths = headers.map((header, colIdx) => {
    let maxLength = header.length;
    for (let r = 0; r < rows.length; r++) {
      const cellVal = rows[r][colIdx] ? String(rows[r][colIdx]) : '';
      if (cellVal.length > maxLength) {
        maxLength = cellVal.length;
      }
    }
    // Cap at 45 chars for neat presentation
    return { wch: Math.min(Math.max(maxLength + 3, 10), 45) };
  });
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, isId ? 'Data Pengunjung' : 'Visitors');

  // Trigger write and download
  XLSX.writeFile(workbook, filename, { bookType: 'xlsx', type: 'binary' });

  return { success: true, filename };
};

// ==========================================
// 2. EXPORT TO REAL VECTOR PDF (.PDF)
// ==========================================
export const exportToPdf = async (
  leads: Lead[],
  settings: BoothSettings,
  lang: Language = 'id'
): Promise<ExportResult> => {
  if (!leads || leads.length === 0) {
    return { success: false, filename: '', message: 'Tidak ada data untuk diekspor' };
  }

  const isId = lang === 'id';
  const filename = generateFileName(settings, 'pdf');

  // A4 Landscape orientation: 297mm width, 210mm height
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Top header color banner (Dark Navy: #0f2f3d)
  doc.setFillColor(15, 47, 61);
  doc.rect(0, 0, pageWidth, 24, 'F');

  // Emerald accent strip (#1f5c4a)
  doc.setFillColor(31, 92, 74);
  doc.rect(0, 24, pageWidth, 2, 'F');

  // Header texts
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  const companyTitle = settings.company_name || 'Booth Exhibition';
  doc.text(
    isId ? `DATA PENGUNJUNG BOOTH — ${companyTitle.toUpperCase()}` : `BOOTH VISITOR DATA — ${companyTitle.toUpperCase()}`,
    14,
    11
  );

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(220, 235, 230);
  const venueText = settings.kiosk_venue ? `Venue: ${settings.kiosk_venue}  |  ` : '';
  const boothText = `Booth: ${settings.booth_id || '-'}`;
  doc.text(`${venueText}${boothText}`, 14, 18);

  // Top Right Info
  const exportDateStr = formatDateTime(new Date().toISOString());
  doc.setFontSize(8);
  doc.text(`${isId ? 'Waktu Ekspor' : 'Exported'}: ${exportDateStr}`, pageWidth - 14, 11, { align: 'right' });
  doc.text(`${isId ? 'Total Pengunjung' : 'Total Leads'}: ${leads.length}`, pageWidth - 14, 18, { align: 'right' });

  // Reset text color for body
  doc.setTextColor(28, 43, 40);

  // Table Headers
  const tableHeaders = isId
    ? ['No', 'Nama', 'Perusahaan & Jabatan', 'Kontak (WA / Email)', 'Kota', 'Minat Produk', 'Sumber', 'Waktu']
    : ['No', 'Name', 'Company & Job Title', 'Contact (WA / Email)', 'City', 'Product Interests', 'Source', 'Time'];

  // Table Rows Data
  const tableRows = leads.map((lead, idx) => {
    const companyJob = [lead.company, lead.job_title].filter(Boolean).join('\n') || '-';
    const contact = [lead.whatsapp, lead.email].filter(Boolean).join('\n') || '-';
    const interests = (lead.interests || []).join(', ') || '-';
    const source = getSourceLabel(lead.source, lang);
    const time = formatDateTime(lead.created_at);

    return [
      idx + 1,
      lead.full_name || '-',
      companyJob,
      contact,
      lead.city || '-',
      interests,
      source,
      time
    ];
  });

  // Render Table via autoTable
  autoTable(doc, {
    head: [tableHeaders],
    body: tableRows,
    startY: 32,
    margin: { left: 14, right: 14, bottom: 16 },
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2.8,
      textColor: [28, 43, 40],
      lineColor: [225, 220, 205],
      lineWidth: 0.2,
      overflow: 'linebreak',
      valign: 'middle'
    },
    headStyles: {
      fillColor: [15, 47, 61],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'left',
      cellPadding: 3.5
    },
    alternateRowStyles: {
      fillColor: [248, 246, 240] // Light beige matching app theme
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' }, // No
      1: { cellWidth: 38, fontStyle: 'bold' }, // Nama
      2: { cellWidth: 44 }, // Perusahaan & Jabatan
      3: { cellWidth: 46 }, // Kontak
      4: { cellWidth: 26 }, // Kota
      5: { cellWidth: 50 }, // Minat Produk
      6: { cellWidth: 26 }, // Sumber
      7: { cellWidth: 29, fontSize: 7.5 } // Waktu
    },
    didDrawPage: (data) => {
      // Footer text & Page numbering
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(138, 131, 113);

      const footerText = isId
        ? 'Dibuat otomatis oleh Sistem Buku Tamu Digital Booth Kiosk'
        : 'Auto-generated by Booth Exhibition Digital Guest Book System';
      doc.text(footerText, 14, pageHeight - 8);

      const pageNumStr = `${isId ? 'Halaman' : 'Page'} ${data.pageNumber}`;
      doc.text(pageNumStr, pageWidth - 14, pageHeight - 8, { align: 'right' });
    }
  });

  // Save the PDF file directly
  doc.save(filename);

  return { success: true, filename };
};

// ==========================================
// 3. EXPORT TO CSV (UTF-8 WITH BOM)
// ==========================================
export const exportToCsv = async (
  leads: Lead[],
  settings: BoothSettings,
  lang: Language = 'id'
): Promise<ExportResult> => {
  if (!leads || leads.length === 0) {
    return { success: false, filename: '', message: 'Tidak ada data untuk diekspor' };
  }

  const isId = lang === 'id';
  const filename = generateFileName(settings, 'csv');

  const headers = isId
    ? [
        'Nama Lengkap',
        'Perusahaan',
        'Jabatan',
        'Kota',
        'WhatsApp',
        'Email',
        'Minat Produk',
        'Preferensi Follow-up',
        'Catatan',
        'Sumber',
        'Status Sinkronisasi',
        'Waktu Registrasi'
      ]
    : [
        'Full Name',
        'Company',
        'Job Title',
        'City',
        'WhatsApp',
        'Email',
        'Product Interests',
        'Follow-up Preference',
        'Notes',
        'Source',
        'Sync Status',
        'Registration Time'
      ];

  const esc = (v: string) => `"${(v || '').replace(/"/g, '""')}"`;

  const rows = leads.map((l) => [
    l.full_name || '',
    l.company || '',
    l.job_title || '',
    l.city || '',
    l.whatsapp || '',
    l.email || '',
    (l.interests || []).join('; '),
    l.follow_up_pref || '',
    l.notes || '',
    getSourceLabel(l.source, lang),
    getSyncStatusLabel(l.sync_status, lang),
    formatDateTime(l.created_at)
  ]);

  const csvContent =
    '\uFEFF' + [headers, ...rows].map((r) => r.map(esc).join(',')).join('\r\n');

  downloadBlob(csvContent, 'text/csv;charset=utf-8', filename);

  return { success: true, filename };
};
