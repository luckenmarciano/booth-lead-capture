#!/usr/bin/env bash
# ==============================================================================
# 🎪 Booth Lead Capture - 1-Click Deployment Script for Linux VPS
# ==============================================================================
set -e

echo "========================================================"
echo "🚀 Memulai Deployment Booth Lead Capture App di VPS..."
echo "========================================================"

# 0. Update repo ke versi terbaru
echo "📥 Mengambil pembaruan kode terbaru dari Git..."
git pull origin main || true

# 1. Periksa dan buat SWAP Memory jika RAM kecil (< 2GB) agar build Docker tidak crash
SWAP_TOTAL=$(free -m | awk '/Swap:/ {print $2}')
if [ "$SWAP_TOTAL" -lt 1024 ]; then
    echo "⚙️ Menyiapkan 2GB Swap Memory untuk stabilitas build..."
    if [ ! -f /swapfile ]; then
        fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
        chmod 600 /swapfile
        mkswap /swapfile
        swapon /swapfile || true
        echo '/swapfile none swap sw 0 0' >> /etc/fstab || true
        echo "✅ Swap Memory 2GB berhasil diaktifkan!"
    else
        swapon /swapfile || true
    fi
fi

# 2. Periksa apakah Docker terpasang
if ! command -v docker &> /dev/null; then
    echo "⚠️ Docker belum terpasang. Menginstal Docker secara otomatis..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl enable docker
    systemctl start docker
    rm -f get-docker.sh
    echo "✅ Docker berhasil diinstal!"
fi

# 3. Periksa apakah Docker Compose terpasang
if ! docker compose version &> /dev/null; then
    echo "⚠️ Docker Compose plugin belum terpasang. Menginstal Docker Compose..."
    apt-get update && apt-get install -y docker-compose-plugin || yum install -y docker-compose-plugin
    echo "✅ Docker Compose plugin berhasil diinstal!"
fi

# 4. Buat direktori data persisten jika belum ada
mkdir -p data

# 5. Build dan Jalankan Container menggunakan Docker Compose
echo "🐳 Menjalankan Docker Compose build & up..."
docker compose down || true
docker compose up -d --build

# Otomatis hubungkan ke network Caddy jika ada
if docker ps --format '{{.Names}}' | grep -q 'gladhy-caddy-1'; then
    echo "🔗 Menghubungkan container ke jaringan Caddy..."
    CADDY_NET=$(docker inspect gladhy-caddy-1 --format '{{range $net,$v := .NetworkSettings.Networks}}{{$net}}{{end}}' | awk '{print $1}')
    docker network connect "$CADDY_NET" booth-lead-capture 2>/dev/null || true
    docker restart gladhy-caddy-1 2>/dev/null || true
fi

# 6. Tunggu inisialisasi container
echo "⏳ Menunggu container aktif..."
sleep 6

# 7. Cek status container
echo "📊 Status Container:"
docker compose ps

# 8. Tes Health Check
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
