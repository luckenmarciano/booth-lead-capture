import React, { useState, useEffect } from 'react';
import {
  Printer,
  QrCode,
  Download,
  Sparkles,
  Camera,
  CheckCircle2,
  FileText,
  Building2
} from 'lucide-react';
import QRCode from 'qrcode';
import { BoothSettings, Language } from '../types/lead.js';
import { DICT } from '../data/dictionary.js';

interface QRStandeeGeneratorProps {
  settings: BoothSettings;
  lang?: Language;
}

export const QRStandeeGenerator: React.FC<QRStandeeGeneratorProps> = ({
  settings,
  lang = 'id'
}) => {
  const t = DICT[lang];
  const [sizeFormat, setSizeFormat] = useState<'A4' | 'A5'>('A5');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [targetUrl, setTargetUrl] = useState<string>('');

  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}?mode=mobile&booth=${encodeURIComponent(settings.booth_id)}`;
    setTargetUrl(url);

    QRCode.toDataURL(url, {
      width: 480,
      margin: 1.5,
      color: {
        dark: '#0f2f3d',
        light: '#ffffff'
      }
    })
      .then(setQrDataUrl)
      .catch(console.error);
  }, [settings.booth_id]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '24px 20px 80px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px'
      }}
    >
      {/* Control Bar */}
      <div
        className="no-print"
        style={{
          width: '100%',
          backgroundColor: '#ffffff',
          border: '1px solid #e6e0cd',
          borderRadius: '16px',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          boxShadow: '0 4px 16px rgba(15, 47, 61, 0.04)'
        }}
      >
        <div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 600, color: '#0f2f3d' }}>
            Generator Poster Standee Meja Booth
          </div>
          <div style={{ fontSize: '12px', color: '#8a8371' }}>
            Cetak dan taruh poster QR ini di atas meja pameran agar pengunjung dapat scan langsung.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', background: '#f4f1ea', padding: '3px', borderRadius: '8px' }}>
            <button
              type="button"
              onClick={() => setSizeFormat('A5')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: sizeFormat === 'A5' ? '#0f2f3d' : 'transparent',
                color: sizeFormat === 'A5' ? '#ffffff' : '#6b6455',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              A5 (Meja / Desk)
            </button>
            <button
              type="button"
              onClick={() => setSizeFormat('A4')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: sizeFormat === 'A4' ? '#0f2f3d' : 'transparent',
                color: sizeFormat === 'A4' ? '#ffffff' : '#6b6455',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              A4 (Poster Dinding)
            </button>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="sa-btn-primary"
            style={{ padding: '10px 18px', fontSize: '13px' }}
          >
            <Printer size={15} />
            <span>Cetak Standee (PDF)</span>
          </button>
        </div>
      </div>

      {/* PRINTABLE STANDEE SHEET */}
      <div
        id="printable-standee"
        style={{
          width: sizeFormat === 'A5' ? '460px' : '620px',
          minHeight: sizeFormat === 'A5' ? '650px' : '880px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: '1.5px solid #d8d0b8',
          padding: sizeFormat === 'A5' ? '32px 28px' : '48px 40px',
          boxShadow: '0 20px 60px rgba(15, 47, 61, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          textAlign: 'center',
          color: '#0f2f3d',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative Top Accent Ribbon */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '8px',
            background: 'linear-gradient(90deg, #1f5c4a 0%, #b8933e 50%, #2f7d5c 100%)'
          }}
        />

        {/* Header Branding */}
        <div>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #2f7d5c, #b8933e)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-serif)',
              fontWeight: 700,
              fontSize: '22px',
              color: '#ffffff',
              margin: '0 auto 12px'
            }}
          >
            S
          </div>

          <div
            style={{
              fontSize: '11px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: '#b8933e',
              fontWeight: 700,
              marginBottom: '4px'
            }}
          >
            {settings.kiosk_venue || 'Jakarta Convention Center'} • {settings.booth_id}
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: sizeFormat === 'A5' ? '26px' : '34px',
              fontWeight: 700,
              color: '#0f2f3d',
              lineHeight: 1.15,
              marginBottom: '8px'
            }}
          >
            {settings.company_name}
          </h1>

          <p
            style={{
              fontSize: sizeFormat === 'A5' ? '12.5px' : '14.5px',
              color: '#6b6455',
              maxWidth: '420px',
              margin: '0 auto',
              lineHeight: 1.4
            }}
          >
            {settings.tagline}
          </p>
        </div>

        {/* QR Code Center Box */}
        <div
          style={{
            margin: '20px auto',
            backgroundColor: '#ffffff',
            border: '2px solid #e6e0cd',
            borderRadius: '24px',
            padding: sizeFormat === 'A5' ? '20px' : '26px',
            boxShadow: '0 8px 30px rgba(15, 47, 61, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="Scan QR Buku Tamu"
              style={{
                width: sizeFormat === 'A5' ? '180px' : '240px',
                height: sizeFormat === 'A5' ? '180px' : '240px',
                display: 'block'
              }}
            />
          ) : (
            <div style={{ width: '200px', height: '200px', background: '#f4f1ea' }} />
          )}

          <div
            style={{
              backgroundColor: '#0f2f3d',
              color: '#ffffff',
              padding: '6px 18px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '1px'
            }}
          >
            SCAN DISINI
          </div>
        </div>

        {/* 3 Step Instruction Guide */}
        <div
          style={{
            backgroundColor: '#fbf9f4',
            border: '1px solid #e6e0cd',
            borderRadius: '16px',
            padding: sizeFormat === 'A5' ? '14px 16px' : '18px 24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px',
            textAlign: 'center'
          }}
        >
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#1f5c4a', marginBottom: '2px' }}>1</div>
            <div style={{ fontSize: '10.5px', fontWeight: 600, color: '#0f2f3d' }}>Buka Kamera HP</div>
            <div style={{ fontSize: '9px', color: '#8a8371' }}>Arahkan ke QR di atas</div>
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#1f5c4a', marginBottom: '2px' }}>2</div>
            <div style={{ fontSize: '10.5px', fontWeight: 600, color: '#0f2f3d' }}>Isi Buku Tamu</div>
            <div style={{ fontSize: '9px', color: '#8a8371' }}>Cukup 30 detik</div>
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#1f5c4a', marginBottom: '2px' }}>3</div>
            <div style={{ fontSize: '10.5px', fontWeight: 600, color: '#0f2f3d' }}>Dapatkan Katalog</div>
            <div style={{ fontSize: '9px', color: '#8a8371' }}>& Konsultasi Gratis</div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ fontSize: '10px', color: '#8a8371', marginTop: '16px' }}>
          {settings.date_range || '09 – 11 Sept 2026'} • Powered by SpillAsia Digital Booth
        </div>
      </div>
    </div>
  );
};
