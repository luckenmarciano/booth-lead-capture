import { Language } from '../types/lead';

export interface TranslationDict {
  brandTag: string;
  navKiosk: string;
  navForm: string;
  navAdmin: string;
  navStandee: string;
  subSplash: string;
  subMain: string;
  subLandscape: string;
  subPortrait: string;
  subFullscreen: string;
  subRealDevice: string;
  videoLabel: string;
  tapToContinue: string;
  idleNote: string;
  kioskBrand: string;
  kioskVenue: string;
  welcomeTitle: string;
  welcomeSub: string;
  ctaFill: string;
  ctaFillSub: string;
  qrHint: string;
  qrLabel: string;
  qrUpdate: string;
  dateRange: string;
  poweredBy: string;
  formBrand: string;
  formTitle: string;
  formSubtitle: string;
  offlineBanner: string;
  thankYou: string;
  statusOnlineMsg: string;
  statusOfflineMsg: string;
  fillAgain: string;
  labelName: string;
  placeholderName: string;
  labelCompany: string;
  placeholderCompany: string;
  labelContact: string;
  placeholderContact: string;
  labelEmail: string;
  placeholderEmail: string;
  labelCity: string;
  placeholderCity: string;
  labelInterest: string;
  labelNotes: string;
  placeholderNotes: string;
  labelSignature: string;
  showSignature: string;
  hideSignature: string;
  clearSignature: string;
  submitBtn: string;
  submittingBtn: string;
  simOfflineOn: string;
  simOfflineOff: string;
  statTotal: string;
  statToday: string;
  statPending: string;
  statTopInterest: string;
  statBalanced: string;
  tableTitle: string;
  live: string;
  colName: string;
  colCompany: string;
  colCity: string;
  colInterest: string;
  colSource: string;
  colSync: string;
  colTime: string;
  colAction: string;
  interestPanelTitle: string;
  sourcePanelTitle: string;
  sourceKioskLabel: string;
  sourceHpLabel: string;
  syncStatusTitle: string;
  syncConnected: string;
  syncDisconnected: string;
  syncPendingEntries: string;
  syncLastAuto: string;
  badgeKiosk: string;
  badgeHp: string;
  badgeSynced: string;
  badgePending: string;
  syncOnlineBadge: string;
  syncOfflineBadge: string;
  forceSyncBtn: string;
  exportExcel: string;
  exportCsv: string;
  searchPlaceholder: string;
  allInterests: string;
  allSources: string;
  noData: string;
  directWhatsapp: string;
  deleteLead: string;
  confirmDelete: string;
  settingsTitle: string;
  adminPinPrompt: string;
  enterPin: string;
  unlockAdmin: string;
}

export const DICT: Record<Language, TranslationDict> = {
  id: {
    brandTag: 'Sistem Buku Tamu Digital',
    navKiosk: 'Kiosk Tablet',
    navForm: 'Formulir HP',
    navAdmin: 'Dashboard Admin',
    navStandee: 'Standee Meja',
    subSplash: 'Splash Video',
    subMain: 'Menu Utama',
    subLandscape: 'Landscape',
    subPortrait: 'Portrait',
    subFullscreen: 'Layar Penuh',
    subRealDevice: 'Device Nyata',
    videoLabel: 'Video Company Profile · Looping',
    tapToContinue: 'Sentuh layar untuk melanjutkan',
    idleNote: 'Auto-loop jika idle > 2 menit',
    kioskBrand: 'SpillAsia 2026',
    kioskVenue: 'Jakarta Convention Center',
    welcomeTitle: 'Selamat Datang di Booth Kami',
    welcomeSub: 'Silakan isi buku tamu untuk mendapatkan katalog produk & konsultasi langsung.',
    ctaFill: 'Isi Buku Tamu',
    ctaFillSub: 'Sentuh untuk mulai pengisian di tablet',
    qrHint: 'atau scan QR di samping dari HP Anda',
    qrLabel: 'QR Code Dinamis',
    qrUpdate: 'Diperbarui secara real-time',
    dateRange: '09 – 11 Sept 2026',
    poweredBy: 'Powered by SpillAsia Digital Booth',
    formBrand: 'SpillAsia 2026',
    formTitle: 'Buku Tamu Digital',
    formSubtitle: 'Terima kasih telah mengunjungi booth kami. Silakan lengkapi formulir di bawah ini.',
    offlineBanner: 'Mode Offline — data disimpan lokal & akan sinkron otomatis',
    thankYou: 'Terima kasih!',
    statusOnlineMsg: 'Data Anda telah tersimpan dan tersinkron secara real-time.',
    statusOfflineMsg: 'Data tersimpan aman di perangkat ini dan akan tersinkron otomatis begitu koneksi tersedia.',
    fillAgain: 'Isi Lagi',
    labelName: 'Nama Lengkap',
    placeholderName: 'cth. Andi Pratama',
    labelCompany: 'Asal Perusahaan',
    placeholderCompany: 'cth. PT Petrokimia Nusantara',
    labelContact: 'Nomor WhatsApp',
    placeholderContact: 'cth. 0812-3456-7890',
    labelEmail: 'Alamat Email (Opsional)',
    placeholderEmail: 'cth. andi@petrokimia.co.id',
    labelCity: 'Kota / Domisili',
    placeholderCity: 'cth. Jakarta',
    labelInterest: 'Pilihan Minat Produk',
    labelNotes: 'Catatan / Kebutuhan Khusus',
    placeholderNotes: 'Tuliskan kebutuhan atau pertanyaan Anda di sini...',
    labelSignature: 'Tanda Tangan Digital (Opsional)',
    showSignature: '+ Tambah Tanda Tangan Digital',
    hideSignature: 'Sembunyikan Tanda Tangan',
    clearSignature: 'Hapus Tanda Tangan',
    submitBtn: 'Kirim & Simpan',
    submittingBtn: 'Menyimpan Data...',
    simOfflineOn: 'Nonaktifkan simulasi offline',
    simOfflineOff: 'Simulasikan mode offline',
    statTotal: 'Total Pengunjung',
    statToday: 'Hari Ini',
    statPending: 'Menunggu Sync',
    statTopInterest: 'Minat Terbanyak',
    statBalanced: 'Seimbang',
    tableTitle: 'Data Pengunjung Real-time',
    live: 'Live',
    colName: 'Nama',
    colCompany: 'Perusahaan',
    colCity: 'Kota',
    colInterest: 'Minat Produk',
    colSource: 'Sumber',
    colSync: 'Sync',
    colTime: 'Waktu',
    colAction: 'Aksi',
    interestPanelTitle: 'Minat Produk',
    sourcePanelTitle: 'Sumber Data',
    sourceKioskLabel: 'Kiosk Tablet',
    sourceHpLabel: 'Scan HP Pengunjung',
    syncStatusTitle: 'Status Sinkronisasi',
    syncConnected: 'Server Realtime DB — Terhubung',
    syncDisconnected: 'Server Terputus — Mode Offline Aktif',
    syncPendingEntries: 'entri lokal menunggu koneksi',
    syncLastAuto: 'Sync otomatis terakhir:',
    badgeKiosk: 'Kiosk',
    badgeHp: 'HP',
    badgeSynced: 'Tersinkron',
    badgePending: 'Menunggu',
    syncOnlineBadge: 'Tersinkron · online',
    syncOfflineBadge: 'data lokal · belum sync',
    forceSyncBtn: 'Sinkronkan Sekarang',
    exportExcel: 'Ekspor Excel',
    exportCsv: 'Ekspor CSV',
    searchPlaceholder: 'Cari nama, perusahaan, WhatsApp, kota...',
    allInterests: 'Semua Minat',
    allSources: 'Semua Sumber',
    noData: 'Belum ada data pengunjung yang tercatat.',
    directWhatsapp: 'Hubungi WhatsApp',
    deleteLead: 'Hapus',
    confirmDelete: 'Apakah Anda yakin ingin menghapus data ini?',
    settingsTitle: 'Pengaturan Booth',
    adminPinPrompt: 'Masukkan PIN Admin untuk mengakses dashboard',
    enterPin: 'Masukkan PIN (Default: 1234)',
    unlockAdmin: 'Buka Dashboard'
  },
  en: {
    brandTag: 'Digital Guest Book System',
    navKiosk: 'Tablet Kiosk',
    navForm: 'Mobile Form',
    navAdmin: 'Admin Dashboard',
    navStandee: 'Desk Standee',
    subSplash: 'Splash Video',
    subMain: 'Main Menu',
    subLandscape: 'Landscape',
    subPortrait: 'Portrait',
    subFullscreen: 'Fullscreen',
    subRealDevice: 'Real Device',
    videoLabel: 'Company Profile Video · Looping',
    tapToContinue: 'Touch screen to continue',
    idleNote: 'Auto-loops after 2 min idle',
    kioskBrand: 'SpillAsia 2026',
    kioskVenue: 'Jakarta Convention Center',
    welcomeTitle: 'Welcome to Our Booth',
    welcomeSub: 'Please sign our guest book to receive product catalogs & direct consultation.',
    ctaFill: 'Sign Guest Book',
    ctaFillSub: 'Touch to start on tablet',
    qrHint: 'or scan the QR beside it with your phone',
    qrLabel: 'Dynamic QR Code',
    qrUpdate: 'Refreshes in real-time',
    dateRange: 'Sept 09 – 11, 2026',
    poweredBy: 'Powered by SpillAsia Digital Booth',
    formBrand: 'SpillAsia 2026',
    formTitle: 'Digital Guest Book',
    formSubtitle: 'Thank you for visiting our booth. Please complete the form below.',
    offlineBanner: 'Offline Mode — data saved locally & will sync automatically',
    thankYou: 'Thank you!',
    statusOnlineMsg: 'Your data has been saved and synced in real-time.',
    statusOfflineMsg: 'Data is safely stored on this device and will sync automatically once connected.',
    fillAgain: 'Fill Again',
    labelName: 'Full Name',
    placeholderName: 'e.g. Andi Pratama',
    labelCompany: 'Company',
    placeholderCompany: 'e.g. PT Petrokimia Nusantara',
    labelContact: 'WhatsApp Number',
    placeholderContact: 'e.g. 0812-3456-7890',
    labelEmail: 'Email Address (Optional)',
    placeholderEmail: 'e.g. andi@petrokimia.co.id',
    labelCity: 'City',
    placeholderCity: 'e.g. Jakarta',
    labelInterest: 'Product Interest',
    labelNotes: 'Notes / Inquiries',
    placeholderNotes: 'Write your requirements or questions here...',
    labelSignature: 'Digital Signature (Optional)',
    showSignature: '+ Add Digital Signature',
    hideSignature: 'Hide Signature',
    clearSignature: 'Clear Signature',
    submitBtn: 'Submit & Save',
    submittingBtn: 'Saving Data...',
    simOfflineOn: 'Turn off offline simulation',
    simOfflineOff: 'Simulate offline mode',
    statTotal: 'Total Visitors',
    statToday: 'Today',
    statPending: 'Pending Sync',
    statTopInterest: 'Top Interest',
    statBalanced: 'Balanced',
    tableTitle: 'Real-time Visitor Data',
    live: 'Live',
    colName: 'Name',
    colCompany: 'Company',
    colCity: 'City',
    colInterest: 'Product Interest',
    colSource: 'Source',
    colSync: 'Sync',
    colTime: 'Time',
    colAction: 'Action',
    interestPanelTitle: 'Product Interest',
    sourcePanelTitle: 'Data Source',
    sourceKioskLabel: 'Tablet Kiosk',
    sourceHpLabel: 'Visitor Phone Scan',
    syncStatusTitle: 'Sync Status',
    syncConnected: 'Realtime Server DB — Connected',
    syncDisconnected: 'Server Disconnected — Offline Mode Active',
    syncPendingEntries: 'local entries waiting for connection',
    syncLastAuto: 'Last auto-sync:',
    badgeKiosk: 'Kiosk',
    badgeHp: 'Phone',
    badgeSynced: 'Synced',
    badgePending: 'Pending',
    syncOnlineBadge: 'Synced · online',
    syncOfflineBadge: 'local data · not synced',
    forceSyncBtn: 'Sync Now',
    exportExcel: 'Export Excel',
    exportCsv: 'Export CSV',
    searchPlaceholder: 'Search name, company, WhatsApp, city...',
    allInterests: 'All Interests',
    allSources: 'All Sources',
    noData: 'No visitor data recorded yet.',
    directWhatsapp: 'Contact WhatsApp',
    deleteLead: 'Delete',
    confirmDelete: 'Are you sure you want to delete this lead?',
    settingsTitle: 'Booth Settings',
    adminPinPrompt: 'Enter Admin PIN to access dashboard',
    enterPin: 'Enter PIN (Default: 1234)',
    unlockAdmin: 'Unlock Dashboard'
  }
};
