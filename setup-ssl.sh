#!/usr/bin/env bash
# ==============================================================================
# 🔒 Setup Domain & SSL Gratis (HTTPS Certbot + Nginx) untuk Booth Lead Capture
# Penggunaan: ./setup-ssl.sh namadomain.com
# ==============================================================================
set -e

DOMAIN=$1

if [ -z "$DOMAIN" ]; then
    echo "❌ Harap masukkan nama domain Anda."
    echo "Contoh penggunaan: ./setup-ssl.sh booth.perusahaananda.com"
    exit 1
fi

echo "========================================================"
echo "🌐 Menyiapkan Domain & SSL untuk: $DOMAIN"
echo "========================================================"

# 1. Install Nginx dan Certbot
echo "📦 Menginstal Nginx dan Certbot..."
apt-get update
apt-get install -y nginx certbot python3-certbot-nginx

# 2. Buat konfigurasi Nginx untuk domain
echo "⚙️ Mengonfigurasi Nginx Reverse Proxy..."
cat <<EOF > /etc/nginx/sites-available/booth.conf
server {
    listen 80;
    server_name $DOMAIN;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # Disable buffering for Realtime SSE
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 86400s;
    }
}
EOF

# 3. Aktifkan konfigurasi Nginx
ln -sf /etc/nginx/sites-available/booth.conf /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default || true
nginx -t
systemctl enable --now nginx
systemctl restart nginx
echo "✅ Konfigurasi Nginx berhasil diaktifkan!"

# 4. Pasang SSL Gratis dengan Let's Encrypt
echo "🔒 Memasang sertifikat SSL HTTPS gratis dengan Certbot..."
certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --register-unsafely-without-email --redirect || {
    echo "⚠️ Certbot otomatis belum selesai. Silakan jalankan manual:"
    echo "   certbot --nginx -d $DOMAIN"
}

echo "========================================================"
echo "🎉 DOMAIN & SSL BERHASIL DIKONFIGURASI!"
echo "========================================================"
echo "🌐 Akses aman via HTTPS:"
echo "   • Kiosk Tablet:      https://$DOMAIN"
echo "   • Form Mobile HP:    https://$DOMAIN?mode=mobile"
echo "   • Dashboard Admin:   https://$DOMAIN (Tab Admin)"
echo "========================================================"
