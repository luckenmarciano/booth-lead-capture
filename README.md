# 🎪 Sistem Buku Tamu & Lead Capture Booth Pameran

Aplikasi web/mobile responsif, modern, dan siap produksi untuk sistem buku tamu (lead capture) booth pameran dengan fitur ganda:
1. **Mode Kiosk Tablet (Di Meja Booth)**: Tombol besar interaktif, QR Code dinamis untuk scan HP, Video Company Profile screensaver dengan *touch-to-wake* & *idle looping timer*, serta dukungan Fullscreen Kiosk Mode.
2. **Formulir Pengunjung (Untuk HP Pengunjung via Scan QR)**: Form mobile-first super responsif, pilihan minat produk interaktif, digital signature, e-Badge pengunjung, download katalog & vCard kontak tim booth.
3. **Cloud Backend VPS & Database (Dockerized)**: REST API & real-time Server-Sent Events (SSE), persistent database, export Excel/CSV, dan integrasi Google Sheets Webhook.
4. **Offline-First & Auto-Sync Engine (IndexedDB)**: Pengunjung tetap dapat mengisi formulir saat jaringan internet terputus; data disimpan dengan aman di perangkat lokal tablet dan otomatis disinkronkan ke Cloud saat online kembali.
5. **Admin Dashboard & QR Standee Generator**: Statistik pengunjung realtime, tombol direct chat WhatsApp ke leads, ekspor data, dan pembuat poster QR meja booth siap cetak (A4/A5).

---

## 🚀 Panduan Menjalankan di Komputer Lokal

### 1. Prasyarat
- **Node.js**: Versi 18 atau lebih baru
- **NPM**: Versi 9 atau lebih baru

### 2. Instalasi Dependensi
Jalankan perintah ini di root folder proyek:
```bash
npm run install:all
```

### 3. Menjalankan Mode Development
```bash
npm run dev
```
- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:3001`

---

## 🐙 Cara Menghubungkan & Push ke GitHub

Jika Anda sudah membuat repository di GitHub, ikuti langkah berikut untuk mengunggah proyek ini:

```bash
cd d:\Project_Lucken\booth-lead-capture

# Inisialisasi Git jika belum
git init
git add .
git commit -m "feat: inisialisasi aplikasi booth lead capture dengan docker vps & offline sync"

# Hubungkan ke repository GitHub Anda (ganti URL dengan repository Anda)
git branch -M main
git remote add origin https://github.com/USERNAME_ANDA/NAMA_REPO_ANDA.git

# Push ke GitHub
git push -u origin main
```

---

## 🐳 Cara Deploy ke VPS Menggunakan Docker

Proyek ini telah dilengkapi dengan `Dockerfile` dan `docker-compose.yml` multi-stage siap pakai.

### Opsi A: 1-Command Deployment di VPS (Sangat Mudah)

1. **Clone repository ke VPS Anda:**
   ```bash
   git clone https://github.com/USERNAME_ANDA/NAMA_REPO_ANDA.git booth-lead-capture
   cd booth-lead-capture
   ```

2. **Jalankan aplikasi dengan Docker Compose:**
   ```bash
   docker compose up -d --build
   ```

3. **Cek status aplikasi:**
   ```bash
   docker compose ps
   docker compose logs -f
   ```

Aplikasi Anda kini sudah aktif dan berjalan di port `3001` (misal: `http://IP_VPS_ANDA:3001`).

### Opsi B: Setup Nginx Reverse Proxy & Domain SSL (Opsional)
Jika Anda menggunakan domain (misal: `booth.domainanda.com`), Anda dapat menggunakan template `docker/nginx.conf` dan memasang SSL gratis via Certbot:
```bash
sudo certbot --nginx -d booth.domainanda.com
```

---

## 📱 Panduan Fitur & Penggunaan

### 1. Mode Kiosk Tablet Meja Booth
- Buka aplikasi di tablet booth (iPad, Galaxy Tab, dll).
- Klik tombol **Maximize / Layar Penuh** di pojok kanan atas.
- **Video Screensaver**: Jika tablet tidak disentuh selama 1 menit (dapat diatur di Pengaturan), video company profile akan otomatis berputar di layar.
- **Sentuh Layar**: Cukup sentuh layar di mana saja untuk menghentikan video dan kembali ke menu utama buku tamu.

### 2. Formulir HP Pengunjung (Scan QR)
- Pengunjung cukup membuka kamera HP dan mengarahkan ke QR Code di layar tablet atau standee meja.
- Pengunjung langsung diarahkan ke form ringan tanpa perlu login atau install aplikasi.
- Setelah mengisi form, pengunjung mendapatkan **Digital Visitor Pass / E-Badge** serta tombol 1-klik untuk mengunduh brosur/katalog produk dan menyimpan kontak tim booth ke buku telepon ponsel.

### 3. Mode Offline & Auto-Sync
- Jika koneksi WiFi pameran lambat atau terputus, indikator di atas akan berubah menjadi **🟡 Offline Mode**.
- Tablet tetap bisa menerima isian tamu secara normal dan menyimpannya di **IndexedDB** browser.
- Saat internet kembali terhubung (atau saat mengklik tombol **Sync**), semua data yang tertunda akan langsung diunggah ke backend database VPS dan Google Sheets.

### 4. Admin Dashboard (PIN Default: `1234`)
- Masuk ke tab **Admin & Leads** di navbar.
- Masukkan PIN: `1234` (dapat diubah di menu Pengaturan).
- Lihat statistik pengunjung real-time, filter minat produk, ekspor ke CSV/Excel, atau klik tombol **WhatsApp Direct** untuk langsung mengirimkan pesan pembuka ke prospek pameran Anda.

### 5. Cetak Poster QR Meja Booth (Standee Generator)
- Masuk ke tab **Standee Meja** di navbar.
- Pilih ukuran (A4 Poster atau A5 Desk Stand).
- Klik **"Cetak Standee (Print / PDF)"** untuk mencetak poster beresolusi tinggi dengan instruksi 3 langkah siap ditaruh di atas meja pameran.

---

## 📊 Integrasi Google Sheets (Opsional)

Jika Anda ingin salinan data pengunjung otomatis masuk ke spreadsheet Google Sheets:
1. Buka spreadsheet Google baru.
2. Masuk ke menu **Ekstensi (Extensions)** -> **Apps Script**.
3. Buka menu **Pengaturan** di aplikasi booth -> Tab **Cloud Database & VPS** -> Klik **"Salin Kode Google Apps Script"**.
4. Paste kode ke editor Apps Script, lalu klik **Deploy** -> **New deployment** -> Tipe **Web app** -> Set access **"Anyone"**.
5. Salin URL Web App yang dihasilkan dan tempelkan ke kolom URL Webhook Google Sheets di aplikasi booth.
6. Klik **"Uji Kirim Data Tes"** untuk memastikan data terhubung.
