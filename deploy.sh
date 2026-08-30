#!/usr/bin/env bash
# ==============================================================================
# 🎪 Booth Lead Capture - 1-Click Deployment Script for Linux VPS
# ==============================================================================
set -e

echo "========================================================"
echo "🚀 Memulai Deployment Booth Lead Capture App..."
echo "========================================================"

# 1. Periksa apakah Docker terpasang
if ! command -v docker &> /dev/null; then
    echo "⚠️ Docker belum terpasang. Menginstal Docker secara otomatis..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl enable docker
    systemctl start docker
    rm get-docker.sh
    echo "✅ Docker berhasil diinstal!"
fi

# 2. Periksa apakah Docker Compose terpasang
if ! docker compose version &> /dev/null; then
    echo "⚠️ Docker Compose plugin belum terpasang. Menginstal Docker Compose..."
    apt-get update && apt-get install -y docker-compose-plugin || yum install -y docker-compose-plugin
    echo "✅ Docker Compose plugin berhasil diinstal!"
fi

# 3. Buat direktori data persisten jika belum ada
mkdir -p data

# 4. Build dan Jalankan Container menggunakan Docker Compose
echo "🐳 Menjalankan Docker Compose build & up..."
docker compose down || true
docker compose up -d --build

# 5. Tunggu inisialisasi container
echo "⏳ Menunggu container aktif..."
sleep 5

# 6. Cek status container
echo "📊 Status Container:"
docker compose ps

# 7. Tes Health Check
echo "🔍 Menjalankan Health Check..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health || echo "000")

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "========================================================"
    echo "🎉 DEPLOYMENT BERHASIL & AKTIF!"
    echo "========================================================"
    IP=$(curl -s https://api.ipify.org || hostname -I | awk '{print $1}')
    echo "🌐 Akses Aplikasi:"
    echo "   • Kiosk Tablet:      http://${IP}:3001"
    echo "   • Form Mobile HP:    http://${IP}:3001?mode=mobile"
    echo "   • Admin Dashboard:   http://${IP}:3001 (Tab Admin / PIN: 1234)"
    echo "   • Standee Meja QR:   http://${IP}:3001 (Tab Standee)"
    echo "========================================================"
else
    echo "⚠️ Container sedang berjalan, silakan periksa log:"
    echo "   docker compose logs -f"
fi
