export interface PrintQRCardParams {
  businessName: string;
  branchName: string;
  qrDataUrl: string;
  frameTitle?: string;
  frameSubtitle?: string;
  primaryColor?: string;
  accentColor?: string;
  bgColor?: string;
  showGoogleBadge?: boolean;
  badgeRating?: string;
  badgeReviewCount?: string;
  reviewUrl: string;
  frameStyle?: string;
  logoUrl?: string;
}

export function printQRCard(params: PrintQRCardParams) {
  const {
    businessName,
    branchName,
    qrDataUrl,
    frameTitle = 'Scan to Review Us on Google',
    frameSubtitle = 'Point phone camera at QR code',
    primaryColor = '#4F46E5',
    accentColor = '#F59E0B',
    bgColor = '#FFFFFF',
    showGoogleBadge = true,
    badgeRating = '5.0',
    badgeReviewCount = '200+',
    reviewUrl,
    frameStyle = 'table-tent',
    logoUrl,
  } = params;

  const isTableTent = frameStyle === 'table-tent';

  const cardHtml = `
    <div class="standee-card">
      ${logoUrl ? `<img src="${logoUrl}" class="logo-img" alt="Logo" />` : ''}
      <div class="business-badge">${businessName} • ${branchName}</div>
      <h1 class="title">${frameTitle}</h1>
      <p class="subtitle">${frameSubtitle}</p>
      
      <div class="qr-box">
        <img src="${qrDataUrl}" class="qr-img" alt="QR Scanner" />
      </div>

      ${
        showGoogleBadge
          ? `
        <div class="badge-wrapper">
          <div class="google-badge">
            <span>Google ★ ${badgeRating}</span>
            <span class="review-count">(${badgeReviewCount} reviews)</span>
          </div>
        </div>
      `
          : ''
      }

      <div class="footer-note">Powered by ReviewScore AI • ${reviewUrl}</div>
    </div>
  `;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Print QR Standee - ${businessName}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 0;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
            background: #ffffff;
            color: #0f172a;
          }
          .no-print {
            text-align: center;
            padding: 16px;
            background: #1e293b;
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }
          .print-btn {
            padding: 10px 24px;
            background: #4f46e5;
            color: #ffffff;
            border: none;
            border-radius: 10px;
            font-weight: 800;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .print-btn:hover {
            background: #4338ca;
          }
          .page-container {
            width: 210mm;
            min-height: 297mm;
            padding: 12mm 15mm;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #ffffff;
          }
          .standee-card {
            width: 140mm;
            background: #ffffff;
            border: 3px solid ${primaryColor};
            border-radius: 24px;
            padding: 24px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.06);
            margin: 0 auto;
          }
          .logo-img {
            height: 48px;
            max-width: 180px;
            object-fit: contain;
            margin: 0 auto 10px auto;
            display: block;
          }
          .business-badge {
            display: inline-block;
            padding: 6px 16px;
            background: ${accentColor}20;
            color: ${primaryColor};
            font-size: 12px;
            font-weight: 800;
            border-radius: 50px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 10px;
          }
          .title {
            font-size: 22px;
            font-weight: 900;
            color: ${primaryColor};
            margin: 0 0 6px 0;
            line-height: 1.25;
          }
          .subtitle {
            font-size: 13px;
            color: #64748b;
            margin: 0 0 16px 0;
            font-weight: 500;
          }
          .qr-box {
            background: ${bgColor};
            border: 2px solid #e2e8f0;
            border-radius: 24px;
            padding: 12px;
            display: inline-block;
            margin: 0 auto;
            overflow: hidden;
          }
          .qr-img {
            width: 200px;
            height: 200px;
            display: block;
            border-radius: 16px;
            overflow: hidden;
          }
          .badge-wrapper {
            margin-top: 14px;
          }
          .google-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: #fffbebf5;
            border: 1.5px solid #fde68a;
            color: #78350f;
            padding: 6px 16px;
            border-radius: 50px;
            font-size: 12px;
            font-weight: 800;
          }
          .review-count {
            color: #b45309;
          }
          .footer-note {
            margin-top: 14px;
            font-size: 10px;
            color: #94a3b8;
            font-family: monospace;
          }
          .fold-divider {
            width: 100%;
            border-bottom: 2px dashed #cbd5e1;
            margin: 25px 0;
            text-align: center;
            position: relative;
          }
          .fold-divider span {
            background: #ffffff;
            padding: 0 14px;
            font-size: 11px;
            color: #64748b;
            font-weight: 700;
            letter-spacing: 1px;
            text-transform: uppercase;
          }
          @media print {
            .no-print {
              display: none !important;
            }
            body {
              background: #ffffff;
            }
            .page-container {
              padding: 10mm;
            }
          }
        </style>
      </head>
      <body>
        <div class="no-print">
          <span style="font-size: 13px; font-weight: 600;">Print or Save as PDF for ${businessName}</span>
          <button class="print-btn" onclick="window.print()">🖨️ Print / Save PDF</button>
        </div>

        <div class="page-container">
          <div style="width: 100%;">
            ${cardHtml}
          </div>
        </div>

      </body>
    </html>
  `;

  // Try creating an in-page hidden printing iframe first (works universally in sandbox/iframe environments)
  try {
    let iframe = document.getElementById('qr-print-frame') as HTMLIFrameElement;
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'qr-print-frame';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0px';
      iframe.style.height = '0px';
      iframe.style.border = '0';
      iframe.style.visibility = 'hidden';
      document.body.appendChild(iframe);
    }

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (e) {
          console.warn('Iframe print failed, attempting popup window...', e);
          openPopupWindow(htmlContent);
        }
      }, 500);
      return;
    }
  } catch (err) {
    console.warn('In-page iframe creation failed:', err);
  }

  openPopupWindow(htmlContent);
}

function openPopupWindow(htmlContent: string) {
  try {
    const printWindow = window.open('', '_blank', 'width=850,height=1000');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      setTimeout(() => {
        try {
          printWindow.focus();
          printWindow.print();
        } catch (e) {
          console.error('Popup print failed', e);
        }
      }, 500);
    } else {
      window.print();
    }
  } catch (e) {
    window.print();
  }
}

/**
 * Renders and downloads the complete Standee Card as a High-Res PNG image
 */
export async function downloadCardAsPNG(params: PrintQRCardParams) {
  const {
    businessName,
    branchName,
    qrDataUrl,
    frameTitle = 'Scan to Review Us on Google',
    frameSubtitle = 'Point phone camera at QR code',
    primaryColor = '#4F46E5',
    accentColor = '#F59E0B',
    showGoogleBadge = true,
    badgeRating = '5.0',
    badgeReviewCount = '200+',
    logoUrl,
  } = params;

  const width = 800;
  
  // Calculate dynamic height to remove empty space
  const margin = 40;
  let expectedHeight = margin + 50; // top padding
  if (logoUrl) {
    expectedHeight += 60 + 20; // logo space
  }
  expectedHeight += 36 + 30; // business badge pill
  expectedHeight += 35; // title
  expectedHeight += 30; // subtitle
  const qrSize = 360;
  expectedHeight += qrSize + 50; // QR and spacing
  if (showGoogleBadge) {
    expectedHeight += 44 + 25; // badge and spacing
  }
  expectedHeight += 20; // footer text
  expectedHeight += margin; // bottom margin

  const height = expectedHeight;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 1. Canvas Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // 2. Card Border Frame
  const cardW = width - margin * 2;
  const cardH = height - margin * 2;
  const cornerRadius = 32;

  ctx.save();
  ctx.strokeStyle = primaryColor;
  ctx.lineWidth = 8;
  ctx.fillStyle = '#FFFFFF';

  ctx.beginPath();
  ctx.roundRect(margin, margin, cardW, cardH, cornerRadius);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  let currentY = margin + 50;

  // 3. Optional Logo
  if (logoUrl) {
    await new Promise<void>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const logoH = 60;
        const logoW = (img.width / img.height) * logoH;
        ctx.drawImage(img, (width - logoW) / 2, currentY, logoW, logoH);
        currentY += logoH + 20;
        resolve();
      };
      img.onerror = () => resolve();
      img.src = logoUrl;
    });
  }

  // 4. Business Badge Pill
  ctx.save();
  ctx.fillStyle = `${accentColor}25`;
  ctx.font = 'bold 16px -apple-system, sans-serif';
  const badgeText = `${businessName.toUpperCase()} • ${branchName.toUpperCase()}`;
  const textMetrics = ctx.measureText(badgeText);
  const pillW = textMetrics.width + 40;
  const pillH = 36;
  const pillX = (width - pillW) / 2;

  ctx.beginPath();
  ctx.roundRect(pillX, currentY, pillW, pillH, 18);
  ctx.fill();

  ctx.fillStyle = primaryColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(badgeText, width / 2, currentY + pillH / 2);
  ctx.restore();

  currentY += pillH + 30;

  // 5. Frame Title
  ctx.save();
  ctx.fillStyle = primaryColor;
  ctx.font = '900 32px -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(frameTitle, width / 2, currentY);
  ctx.restore();

  currentY += 35;

  // 6. Frame Subtitle
  ctx.save();
  ctx.fillStyle = '#64748B';
  ctx.font = '500 18px -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(frameSubtitle, width / 2, currentY);
  ctx.restore();

  currentY += 30;

  // 7. QR Code Image & Container
  const qrX = (width - qrSize) / 2;
  const qrY = currentY;
  const qrRadius = 24;

  // QR Container box
  ctx.save();
  ctx.fillStyle = (params as any).bgColor || '#FFFFFF';
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32, qrRadius + 8);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  await new Promise<void>((resolve) => {
    const qrImg = new Image();
    qrImg.onload = () => {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(qrX, qrY, qrSize, qrSize, qrRadius);
      ctx.clip();
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
      ctx.restore();
      resolve();
    };
    qrImg.onerror = () => resolve();
    qrImg.src = qrDataUrl;
  });

  currentY = qrY + qrSize + 50;

  // 8. Google Rating Badge
  if (showGoogleBadge) {
    ctx.save();
    ctx.fillStyle = '#FFFBEB';
    ctx.strokeStyle = '#FDE68A';
    ctx.lineWidth = 2;

    const gBadgeW = 280;
    const gBadgeH = 44;
    const gBadgeX = (width - gBadgeW) / 2;

    ctx.beginPath();
    ctx.roundRect(gBadgeX, currentY, gBadgeW, gBadgeH, 22);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#78350F';
    ctx.font = 'bold 18px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Google ★ ${badgeRating} (${badgeReviewCount} reviews)`, width / 2, currentY + gBadgeH / 2);
    ctx.restore();

    currentY += gBadgeH + 25;
  }

  // 9. Footer
  ctx.save();
  ctx.fillStyle = '#94A3B8';
  ctx.font = '14px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`Powered by ReviewScore AI`, width / 2, currentY);
  ctx.restore();

  // Trigger PNG download
  const link = document.createElement('a');
  link.download = `QR-Scanner-Standee-${businessName.replace(/\s+/g, '-')}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
