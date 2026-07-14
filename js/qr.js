/**
 * qr.js — QR Code Generation & Download
 * Xenelasia Consultancy Digital Business Card
 * ============================================================
 * Uses the lightweight qrcode.js library (loaded via CDN with
 * fallback inline generation).
 */

'use strict';

const QRManager = (() => {
  const CONTAINER_ID = 'qr-code';
  const DOWNLOAD_BTN = document.getElementById('qr-download-btn');

  /**
   * Generate QR using the QRCode library (qrcode.js CDN).
   * If unavailable, fallback to a QR API.
   */
  function generate(employee) {
    const urlParams = new URLSearchParams(window.location.search);
    const showQr = urlParams.get('qr') === 'true';
    const qrSection = document.querySelector('[aria-labelledby="qr-heading"]');

    if (!showQr) {
      if (qrSection) {
        qrSection.style.display = 'none';
      }
      return;
    } else {
      if (qrSection) {
        qrSection.style.display = 'block';
      }
    }

    // Generate the QR link pointing to the visitor mode (removing &qr=true parameter)
    const cleanUrl = new URL(window.location.href);
    cleanUrl.searchParams.delete('qr');
    const qrTextUrl = cleanUrl.toString();

    const container = document.getElementById(CONTAINER_ID);
    if (!container) return;

    // Clear previous
    container.innerHTML = '';

    if (typeof QRCode !== 'undefined') {
      // Library available
      new QRCode(container, {
        text:           qrTextUrl,
        width:          200,
        height:         200,
        colorDark:      "#000000",
        colorLight:     "#FFFFFF",
        correctLevel:   QRCode.CorrectLevel.H,
      });

      // Render custom theme & logo on QR canvas
      setTimeout(() => {
        const canvas = container.querySelector('canvas');
        if (canvas) {
          applyThemeAndLogoToQR(canvas);
        }
      }, 80);
    } else {
      // Fallback: QR Server API (no backend needed, pure URL-based)
      const img = document.createElement('img');
      const encodedUrl = encodeURIComponent(qrTextUrl);
      img.src   = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedUrl}&bgcolor=ffffff&color=0b0f19&margin=4&qzone=1&format=svg`;
      img.alt   = 'QR Code to this digital card';
      img.width = 200;
      img.style.display = 'block';
      container.appendChild(img);
    }

    // Add local testing tips
    const isLocal = ['localhost', '127.0.0.1', ''].includes(window.location.hostname) || window.location.protocol === 'file:';
    if (isLocal && employee) {
      const infoBox = document.createElement('div');
      infoBox.style.marginTop = '15px';
      infoBox.style.padding = '10px';
      infoBox.style.background = 'rgba(255, 77, 109, 0.05)';
      infoBox.style.border = '1px dashed rgba(255, 77, 109, 0.2)';
      infoBox.style.borderRadius = '8px';
      infoBox.style.fontSize = '0.75rem';
      infoBox.style.color = 'var(--text-secondary)';
      infoBox.style.textAlign = 'left';
      infoBox.style.lineHeight = '1.4';
      
      const username = employee.firstName.toLowerCase();
      infoBox.innerHTML = `
        <span style="font-weight:700; color:var(--coral);">💡 Local Test Mode</span><br>
        1. Both PC and phone must be on the same Wi-Fi.<br>
        2. Access the site on your PC via your IP address:<br>
        <code style="background:rgba(255,255,255,0.1); padding:2px 4px; border-radius:3px; font-family:monospace; display:block; margin:4px 0; word-break:break-all;">http://192.168.1.23:8000/?user=${username}&qr=true</code>
        Then scan the regenerated QR. When deployed, it links to your domain automatically.
      `;
      container.appendChild(infoBox);
    }
  }

  /**
   * Download the QR code as PNG.
   */
  async function downloadQR() {
    const container = document.getElementById(CONTAINER_ID);
    if (!container) return;

    const name = window.activeEmployee ? window.activeEmployee.firstName.toLowerCase() : 'employee';
    const filename = `${name}-qr.png`;

    // Try canvas (qrcode.js generates a canvas)
    const canvas = container.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = filename;
      link.href     = canvas.toDataURL('image/png');
      link.click();
      return;
    }

    // Try SVG/img
    const img = container.querySelector('img');
    if (img) {
      try {
        const response = await fetch(img.src);
        const blob     = await response.blob();
        const blobUrl  = URL.createObjectURL(blob);
        const link     = document.createElement('a');
        link.download  = filename;
        link.href      = blobUrl;
        link.click();
        URL.revokeObjectURL(blobUrl);
      } catch {
        // Fallback: open in new tab
        window.open(img.src, '_blank');
      }
    }
  function applyThemeAndLogoToQR(canvas) {
    const ctx = canvas.getContext('2d');
    const size = canvas.width;

    // 1. Get offscreen QR copy
    const offscreen = document.createElement('canvas');
    offscreen.width = size;
    offscreen.height = size;
    const oCtx = offscreen.getContext('2d');
    oCtx.drawImage(canvas, 0, 0);

    // 2. Clear canvas
    ctx.clearRect(0, 0, size, size);

    // 3. Draw gradient background on original canvas
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, '#FF4D6D');    // Coral Red
    grad.addColorStop(0.3, '#D63AF9');  // Magenta
    grad.addColorStop(0.7, '#7B2FBE');  // Purple
    grad.addColorStop(1, '#3B82F6');    // Electric Blue

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // 4. Clip gradient to QR pattern
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(offscreen, 0, 0);

    // 5. Draw white background underneath (for non-QR pixels)
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);

    // Update img tag immediately with the gradient (before logo loads)
    const imgElement = canvas.parentElement.querySelector('img');
    if (imgElement) {
      imgElement.src = canvas.toDataURL('image/png');
    }

    // 6. Draw central logo (source-over overlay)
    ctx.globalCompositeOperation = 'source-over';
    const logo = new Image();
    logo.onload = () => {
      const logoSize = size * 0.22; // 22% of QR width
      const x = (size - logoSize) / 2;
      const y = (size - logoSize) / 2;

      // Quiet zone card (rounded white block)
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      const radius = 6;
      if (ctx.roundRect) {
        ctx.roundRect(x - 4, y - 4, logoSize + 8, logoSize + 8, radius);
      } else {
        ctx.rect(x - 4, y - 4, logoSize + 8, logoSize + 8);
      }
      ctx.fill();

      // Draw the actual Xenelasia logo
      ctx.drawImage(logo, x, y, logoSize, logoSize);

      // Update img tag again once logo loads
      if (imgElement) {
        imgElement.src = canvas.toDataURL('image/png');
      }
    };
    logo.src = 'assets/logo/logo.webp';
  }

  function init() {
    // Generate initially once event triggers
    document.addEventListener('employeeLoaded', (e) => {
      generate(e.detail);
    });

    // Re-generate if URL changes (for SPA-like behaviour)
    window.addEventListener('popstate', () => {
      if (window.activeEmployee) {
        generate(window.activeEmployee);
      }
    });

    DOWNLOAD_BTN?.addEventListener('click', () => {
      downloadQR();
      if (typeof Toast !== 'undefined') {
        Toast.show('⬇️ Downloading QR Code…');
      }
    });
  }

  return { init, generate };
})();

document.addEventListener('DOMContentLoaded', () => {
  QRManager.init();
});
