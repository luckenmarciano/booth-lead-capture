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
  heroWelcome: string;
  heroDesc: string;
  ctaFill: string;
  ctaFillSub: string;
  btnRegister: string;
  btnRegisterSub: string;
  qrHint: string;
  qrLabel: string;
  qrUpdate: string;
  qrLiveBadge: string;
  qrHeaderTitle: string;
  qrHeaderSubtitle: string;
  dateRange: string;
  exhibitionDate: string;
  poweredBy: string;
  formBrand: string;
  formTitle: string;
  formSubtitle: string;
  offlineBanner: string;
  thankYou: string;
  thankYouTitle: string;
  thankYouSubtitle: string;
  statusOnlineMsg: string;
  statusOfflineMsg: string;
  fillAgain: string;
  btnFillAgain: string;
  labelName: string;
  fullNameLabel: string;
  placeholderName: string;
  fullNamePlaceholder: string;
  labelCompany: string;
  companyLabel: string;
  placeholderCompany: string;
  companyPlaceholder: string;
  labelContact: string;
  whatsappLabel: string;
  placeholderContact: string;
  whatsappPlaceholder: string;
  labelEmail: string;
  emailLabel: string;
  placeholderEmail: string;
  emailPlaceholder: string;
  labelCity: string;
  cityLabel: string;
  placeholderCity: string;
  cityPlaceholder: string;
  labelInterest: string;
  interestsLabel: string;
  labelNotes: string;
  placeholderNotes: string;
  labelSignature: string;
  showSignature: string;
  hideSignature: string;
  sigToggleShow: string;
  sigToggleHide: string;
  clearSignature: string;
  submitBtn: string;
  submittingBtn: string;
  btnSubmit: string;
  btnSubmitting: string;
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
  exportPdf: string;
  exportLabel: string;
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
    welcomeSub: 'Silakan isi buku tamu untuk mendapatkan katalog produk & konsultasi langsung bersama tim ahli kami.',
    heroWelcome: 'Selamat Datang di Booth Kami',
    heroDesc: 'Silakan isi buku tamu untuk mendapatkan katalog produk & konsultasi langsung bersama tim ahli kami.',
    ctaFill: 'Isi Buku Tamu',
    ctaFillSub: 'Sentuh untuk mulai pengisian di tablet',
    btnRegister: 'Isi Buku Tamu',
    btnRegisterSub: 'Sentuh untuk mulai pengisian di tablet',
    qrHint: 'Pindai QR Code di samping menggunakan kamera smartphone Anda untuk mengisi formulir digital langsung dari HP.',
    qrLabel: 'Pindai untuk Isi dari HP',
    qrUpdate: 'Diperbarui secara real-time',
    qrLiveBadge: 'Diperbarui secara real-time',
    qrHeaderTitle: 'Pindai untuk Isi dari HP',
    qrHeaderSubtitle: 'Pindai QR Code di atas menggunakan kamera smartphone Anda untuk mengisi formulir digital langsung dari HP.',
    dateRange: '09 – 11 Sept 2026',
    exhibitionDate: '09 – 11 Sept 2026',
    poweredBy: 'Powered by SpillAsia Digital Booth',
    formBrand: 'SpillAsia 2026',
    formTitle: 'Buku Tamu Pengunjung',
    formSubtitle: 'Terima kasih telah mengunjungi booth kami. Silakan lengkapi formulir di bawah ini.',
    offlineBanner: 'Mode Offline — data disimpan lokal & akan sinkron otomatis',
    thankYou: 'Terima Kasih atas Kunjungan Anda!',
    thankYouTitle: 'Terima Kasih atas Kunjungan Anda!',
    thankYouSubtitle: 'Data Anda telah tersimpan. Tim kami akan segera mengirimkan materi presentasi dan katalog produk pilihan Anda.',
    statusOnlineMsg: 'Data Anda telah tersimpan dan tersinkron secara real-time.',
    statusOfflineMsg: 'Data tersimpan aman di perangkat ini dan akan tersinkron otomatis begitu koneksi tersedia.',
    fillAgain: 'Isi Buku Tamu Lagi',
    btnFillAgain: 'Isi Buku Tamu Lagi',
    labelName: 'Nama Lengkap',
    fullNameLabel: 'Nama Lengkap',
    placeholderName: 'cth. Andi Pratama',
    fullNamePlaceholder: 'cth. Andi Pratama',
    labelCompany: 'Asal Perusahaan / Instansi',
    companyLabel: 'Asal Perusahaan / Instansi',
    placeholderCompany: 'cth. PT Petrokimia Nusantara',
    companyPlaceholder: 'cth. PT Petrokimia Nusantara',
    labelContact: 'Nomor WhatsApp',
    whatsappLabel: 'Nomor WhatsApp',
    placeholderContact: 'cth. 0812-3456-7890',
    whatsappPlaceholder: 'cth. 0812-3456-7890',
    labelEmail: 'Alamat Email (Opsional)',
    emailLabel: 'Alamat Email (Opsional)',
    placeholderEmail: 'cth. andi@petrokimia.co.id',
    emailPlaceholder: 'cth. andi@petrokimia.co.id',
    labelCity: 'Kota / Domisili',
    cityLabel: 'Kota / Domisili',
    placeholderCity: 'cth. Jakarta',
    cityPlaceholder: 'cth. Jakarta',
    labelInterest: 'Pilihan Minat Produk',
    interestsLabel: 'Pilihan Minat Produk',
    labelNotes: 'Catatan / Kebutuhan Khusus',
    placeholderNotes: 'Tuliskan kebutuhan atau pertanyaan Anda di sini...',
    labelSignature: 'Tanda Tangan Digital (Opsional)',
    showSignature: '+ Tambah Tanda Tangan Digital',
    hideSignature: 'Sembunyikan Tanda Tangan',
    sigToggleShow: '+ Tambah Tanda Tangan Digital',
    sigToggleHide: 'Sembunyikan Tanda Tangan',
    clearSignature: 'Hapus Tanda Tangan',
    submitBtn: 'Kirim & Simpan Data',
    submittingBtn: 'Menyimpan Data...',
    btnSubmit: 'Kirim & Simpan Data',
    btnSubmitting: 'Menyimpan Data...',
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
    interestPanelTitle: 'Distribusi Minat Produk',
    sourcePanelTitle: 'Sumber Data Registrasi',
    sourceKioskLabel: 'Kiosk Tablet Meja',
    sourceHpLabel: 'Scan HP Pengunjung',
    syncStatusTitle: 'Status Sinkronisasi Real-time',
    syncConnected: 'Server Realtime DB — Terhubung',
    syncDisconnected: 'Server Terputus — Mode Offline Aktif',
    syncPendingEntries: 'entri lokal menunggu koneksi',
    syncLastAuto: 'Sync otomatis terakhir:',
    badgeKiosk: 'Kiosk',
    badgeHp: 'Scan HP',
    badgeSynced: 'Tersinkron',
    badgePending: 'Menunggu',
    syncOnlineBadge: 'Tersinkron · online',
    syncOfflineBadge: 'data lokal · belum sync',
    forceSyncBtn: 'Sinkronkan Sekarang',
    exportExcel: 'Excel',
    exportCsv: 'CSV',
    exportPdf: 'PDF',
    exportLabel: 'Ekspor Data',
    searchPlaceholder: 'Cari nama, perusahaan, WhatsApp, kota...',
    allInterests: 'Semua Minat',
    allSources: 'Semua Sumber',
    noData: 'Belum ada data pengunjung yang tercatat.',
    directWhatsapp: 'Hubungi WhatsApp',
    deleteLead: 'Hapus',
    confirmDelete: 'Apakah Anda yakin ingin menghapus data ini?',
    settingsTitle: 'Pengaturan Booth & Pameran',
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
    welcomeSub: 'Please sign our guest book to receive product catalogs & direct consultation with our experts.',
    heroWelcome: 'Welcome to Our Booth',
    heroDesc: 'Please sign our guest book to receive product catalogs & direct consultation with our experts.',
    ctaFill: 'Sign Guest Book',
    ctaFillSub: 'Touch to start on tablet',
    btnRegister: 'Sign Guest Book',
    btnRegisterSub: 'Touch to start on tablet',
    qrHint: 'Scan the QR Code above with your smartphone camera to fill out the registration form directly on your phone.',
    qrLabel: 'Scan with Smartphone',
    qrUpdate: 'Refreshes in real-time',
    qrLiveBadge: 'Refreshes in real-time',
    qrHeaderTitle: 'Scan with Smartphone',
    qrHeaderSubtitle: 'Scan the QR Code above with your smartphone camera to fill out the registration form directly on your phone.',
    dateRange: 'Sept 09 – 11, 2026',
    exhibitionDate: 'Sept 09 – 11, 2026',
    poweredBy: 'Powered by SpillAsia Digital Booth',
    formBrand: 'SpillAsia 2026',
    formTitle: 'Visitor Guest Book',
    formSubtitle: 'Thank you for visiting our booth. Please complete the form below.',
    offlineBanner: 'Offline Mode — data saved locally & will sync automatically',
    thankYou: 'Thank You for Visiting!',
    thankYouTitle: 'Thank You for Visiting!',
    thankYouSubtitle: 'Your details have been saved. Our team will send presentation materials and product catalogs to your contact.',
    statusOnlineMsg: 'Your data has been saved and synced in real-time.',
    statusOfflineMsg: 'Data is safely stored on this device and will sync automatically once connected.',
    fillAgain: 'Fill Guest Book Again',
    btnFillAgain: 'Fill Guest Book Again',
    labelName: 'Full Name',
    fullNameLabel: 'Full Name',
    placeholderName: 'e.g. Andi Pratama',
    fullNamePlaceholder: 'e.g. Andi Pratama',
    labelCompany: 'Company / Organization',
    companyLabel: 'Company / Organization',
    placeholderCompany: 'e.g. PT Petrokimia Nusantara',
    companyPlaceholder: 'e.g. PT Petrokimia Nusantara',
    labelContact: 'WhatsApp Number',
    whatsappLabel: 'WhatsApp Number',
    placeholderContact: 'e.g. 0812-3456-7890',
    whatsappPlaceholder: 'e.g. 0812-3456-7890',
    labelEmail: 'Email Address (Optional)',
    emailLabel: 'Email Address (Optional)',
    placeholderEmail: 'e.g. andi@petrokimia.co.id',
    emailPlaceholder: 'e.g. andi@petrokimia.co.id',
    labelCity: 'City / Domicile',
    cityLabel: 'City / Domicile',
    placeholderCity: 'e.g. Jakarta',
    cityPlaceholder: 'e.g. Jakarta',
    labelInterest: 'Product Interest',
    interestsLabel: 'Product Interest',
    labelNotes: 'Notes / Inquiries',
    placeholderNotes: 'Write your inquiries or requirements here...',
    labelSignature: 'Digital Signature (Optional)',
    showSignature: '+ Add Digital Signature',
    hideSignature: 'Hide Signature',
    sigToggleShow: '+ Add Digital Signature',
    sigToggleHide: 'Hide Signature',
    clearSignature: 'Clear Signature',
    submitBtn: 'Submit & Save Details',
    submittingBtn: 'Submitting Data...',
    btnSubmit: 'Submit & Save Details',
    btnSubmitting: 'Submitting Data...',
    simOfflineOn: 'Disable offline simulation',
    simOfflineOff: 'Simulate offline mode',
    statTotal: 'Total Visitors',
    statToday: 'Today',
    statPending: 'Pending Sync',
    statTopInterest: 'Top Interest',
    statBalanced: 'Balanced',
    tableTitle: 'Real-time Visitor Records',
    live: 'Live',
    colName: 'Name',
    colCompany: 'Company',
    colCity: 'City',
    colInterest: 'Product Interest',
    colSource: 'Source',
    colSync: 'Sync',
    colTime: 'Time',
    colAction: 'Action',
    interestPanelTitle: 'Product Interest Breakdown',
    sourcePanelTitle: 'Registration Source',
    sourceKioskLabel: 'Desk Tablet Kiosk',
    sourceHpLabel: 'Visitor Smartphone Scan',
    syncStatusTitle: 'Real-time Sync Status',
    syncConnected: 'Server Realtime DB — Connected',
    syncDisconnected: 'Server Disconnected — Offline Mode Active',
    syncPendingEntries: 'local entries awaiting connection',
    syncLastAuto: 'Last auto-sync:',
    badgeKiosk: 'Kiosk',
    badgeHp: 'Mobile QR',
    badgeSynced: 'Synced',
    badgePending: 'Pending',
    syncOnlineBadge: 'Synced · online',
    syncOfflineBadge: 'local data · not synced',
    forceSyncBtn: 'Sync Now',
    exportExcel: 'Excel',
    exportCsv: 'CSV',
    exportPdf: 'PDF',
    exportLabel: 'Export Data',
    searchPlaceholder: 'Search name, company, WhatsApp, city...',
    allInterests: 'All Interests',
    allSources: 'All Sources',
    noData: 'No visitor data recorded yet.',
    directWhatsapp: 'Chat WhatsApp',
    deleteLead: 'Delete',
    confirmDelete: 'Are you sure you want to delete this record?',
    settingsTitle: 'Booth & Event Settings',
    adminPinPrompt: 'Enter Admin PIN to access dashboard',
    enterPin: 'Enter PIN (Default: 1234)',
    unlockAdmin: 'Unlock Dashboard'
  }
};
