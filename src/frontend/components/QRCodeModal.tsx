import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Branch } from '../../types';
import { Modal } from './Modal';
import { printQRCard, downloadCardAsPNG } from '../utils/printQR';
import { Download, QrCode, Printer, Sparkles, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch: Branch | null;
  businessName?: string;
  logoUrl?: string;
}

const PRESET_LOGOS = [
  { name: 'Dental Icon', url: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=120' },
  { name: 'Coffee Cup', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=120' },
  { name: 'Scissors', url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=120' },
];

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  branch,
  businessName = 'Smile Dental Clinic',
  logoUrl = ''
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [currentLogo, setCurrentLogo] = useState<string>(logoUrl || '');
  const [includeLogo, setIncludeLogo] = useState<boolean>(false);
  const [frameTitle, setFrameTitle] = useState<string>('Scan to Leave 5★ Google Review');
  const [primaryColor, setPrimaryColor] = useState<string>('#2563EB');
  const [isDownloadingCardPNG, setIsDownloadingCardPNG] = useState(false);
  const [isDownloadingPNG, setIsDownloadingPNG] = useState(false);
  const [isPrintingCard, setIsPrintingCard] = useState(false);

  const reviewUrl = branch ? `${window.location.origin}/review/${branch.id}` : '';

  useEffect(() => {
    if (branch) {
      generateQRWithLogo();
    }
  }, [branch, currentLogo, includeLogo, primaryColor, reviewUrl]);

  const generateQRWithLogo = async () => {
    if (!reviewUrl) return;

    try {
      const canvas = document.createElement('canvas');
      const size = 500;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rawQrDataUrl = await QRCode.toDataURL(reviewUrl, {
        errorCorrectionLevel: 'H',
        margin: 2,
        color: {
          dark: '#1E293B',
          light: '#FFFFFF',
        },
        width: size,
      });

      const qrImg = new Image();
      qrImg.crossOrigin = 'anonymous';

      qrImg.onload = () => {
        ctx.clearRect(0, 0, size, size);
        ctx.drawImage(qrImg, 0, 0, size, size);

        if (includeLogo && currentLogo && currentLogo.trim() !== '') {
          const logoImg = new Image();
          logoImg.crossOrigin = 'anonymous';

          logoImg.onload = () => {
            const logoSize = size * 0.22;
            const logoX = (size - logoSize) / 2;
            const logoY = (size - logoSize) / 2;

            ctx.save();
            ctx.fillStyle = '#FFFFFF';
            ctx.strokeStyle = primaryColor;
            ctx.lineWidth = 4;

            ctx.beginPath();
            ctx.arc(size / 2, size / 2, logoSize / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(size / 2, size / 2, (logoSize / 2) - 2, 0, Math.PI * 2);
            ctx.clip();

            ctx.drawImage(logoImg, logoX + 2, logoY + 2, logoSize - 4, logoSize - 4);
            ctx.restore();

            setQrDataUrl(canvas.toDataURL('image/png'));
          };

          logoImg.onerror = () => {
            setQrDataUrl(canvas.toDataURL('image/png'));
          };

          logoImg.src = currentLogo;
        } else {
          setQrDataUrl(canvas.toDataURL('image/png'));
        }
      };

      qrImg.src = rawQrDataUrl;
    } catch (err) {
      console.error('Failed to generate QR Code:', err);
    }
  };

  const handleDownloadPNG = () => {
    if (!qrDataUrl || !branch) return;
    setIsDownloadingPNG(true);
    const link = document.createElement('a');
    link.download = `${branch.name.replace(/\s+/g, '_')}_QR_Code.png`;
    link.href = qrDataUrl;
    link.click();
    setTimeout(() => setIsDownloadingPNG(false), 500);
  };

  const handleDownloadCardPNG = async () => {
    if (!branch) return;
    setIsDownloadingCardPNG(true);
    try {
      await downloadCardAsPNG({
        businessName,
        branchName: branch.name,
        qrDataUrl,
        primaryColor,
        frameTitle,
        reviewUrl,
        logoUrl: includeLogo ? currentLogo : ''
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsDownloadingCardPNG(false);
    }
  };

  const handlePrintCard = async () => {
    if (!branch) return;
    setIsPrintingCard(true);
    try {
      await printQRCard({
        businessName,
        branchName: branch.name,
        qrDataUrl,
        primaryColor,
        frameTitle,
        reviewUrl,
        logoUrl: includeLogo ? currentLogo : ''
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsPrintingCard(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCurrentLogo(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!branch) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`QR Scanner Studio - ${branch.name}`}
      subtitle="Tabletop scanner card with your centered business logo"
      maxWidth="max-w-3xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Print / Display Card Preview */}
        <div className="clay-card bg-white p-6 border border-[#DCE3EC] flex flex-col items-center text-center">
          <div className="w-full max-w-[260px] bg-[#EEF2F7] rounded-3xl border border-[#DCE3EC] p-5 flex flex-col items-center relative shadow-[inset_1px_1px_3px_rgba(255,255,255,0.9),4px_4px_12px_rgba(100,116,139,0.08)]">
            <div className="flex items-center space-x-1.5 text-[#2563EB] font-extrabold text-xs uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>{businessName}</span>
            </div>

            <h4 className="text-base font-extrabold text-[#1E293B] leading-tight mb-3">
              {frameTitle}
            </h4>

            {qrDataUrl ? (
              <div className="p-2 bg-white rounded-2xl border border-[#DCE3EC] relative shadow-[2px_2px_6px_rgba(100,116,139,0.06)]">
                <img src={qrDataUrl} alt="QR Code with Centered Logo" className="w-48 h-48 object-contain" />
              </div>
            ) : (
              <div className="w-48 h-48 bg-white rounded-2xl flex items-center justify-center text-[#1E293B]">
                <QrCode className="w-10 h-10 animate-pulse text-[#2563EB]" />
              </div>
            )}

            <div className="mt-3 text-[10px] text-white font-extrabold bg-[#2563EB] px-3 py-1 rounded-full uppercase shadow-[1px_1px_4px_rgba(37,99,235,0.3)]">
              ★ Leave a 5-Star Review in 10 Seconds ★
            </div>

            <div className="mt-2 text-[9px] text-[#64748B] font-mono font-bold">
              Powered by ReviewScore AI
            </div>
          </div>
        </div>

        {/* Customization Controls */}
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-bold text-[#1E293B] mb-1">
              Frame Display Heading
            </label>
            <input
              type="text"
              value={frameTitle}
              onChange={e => setFrameTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs clay-input"
            />
          </div>

          <div className="flex items-center justify-between w-full flex-wrap gap-2 min-h-[44px] px-3 py-2 clay-card bg-white border border-[#DCE3EC] rounded-2xl">
            <label className="font-bold text-[#1E293B] text-xs cursor-pointer select-none flex-1 min-w-0">
              Include center logo
            </label>
            <button
              type="button"
              onClick={() => setIncludeLogo(!includeLogo)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 cursor-pointer ${
                includeLogo ? 'bg-[#2563EB]' : 'bg-[#CBD5E1]'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  includeLogo ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E293B] mb-1">
              Center Company Logo in Scanner
            </label>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 border border-[#DCE3EC] bg-[#EEF2F7] rounded-2xl text-[#1E293B] flex items-center justify-center overflow-hidden shrink-0 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9)]">
                {currentLogo ? (
                  <img src={currentLogo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-5 h-5 text-[#2563EB]" />
                )}
              </div>
              <input
                type="text"
                value={currentLogo}
                onChange={e => setCurrentLogo(e.target.value)}
                placeholder="Paste Logo Image URL..."
                className="flex-1 px-3.5 py-2 text-xs clay-input"
              />
              <label className="px-3 py-2 clay-btn-secondary text-xs cursor-pointer flex items-center space-x-1 shrink-0">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload</span>
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-[10px] text-[#64748B] font-bold">Quick Presets:</span>
              {PRESET_LOGOS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentLogo(p.url)}
                  className="text-[10px] px-2.5 py-1 bg-[#EEF2F7] text-[#1E293B] border border-[#DCE3EC] rounded-xl font-bold hover:bg-[#2563EB] hover:text-white cursor-pointer transition-colors"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E293B] mb-1">
              Brand Accent Color
            </label>
            <div className="flex items-center space-x-2">
              {['#2563EB', '#1E293B', '#38BDF8'].map(color => (
                <button
                  key={color}
                  onClick={() => setPrimaryColor(color)}
                  className={`w-7 h-7 rounded-full border-2 border-[#DCE3EC] cursor-pointer ${
                    primaryColor === color ? 'ring-2 ring-[#2563EB] scale-110' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="bg-[#EEF2F7] p-3.5 rounded-2xl border border-[#DCE3EC] text-xs text-[#1E293B] space-y-1">
            <p className="font-extrabold text-[#1E293B]">Direct Customer Scanner Link:</p>
            <p className="font-mono text-[10px] break-all text-[#2563EB] bg-white p-2 rounded-xl border border-[#DCE3EC] font-bold">
              {reviewUrl}
            </p>
          </div>

          <div className="pt-2 flex flex-col space-y-2">
            <button
              onClick={handleDownloadCardPNG}
              disabled={isDownloadingCardPNG || isPrintingCard || isDownloadingPNG}
              className="w-full py-2.5 px-4 clay-btn-primary text-sm flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
            >
              {isDownloadingCardPNG ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Generating Printable Card...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Printable Card (PNG)</span>
                </>
              )}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleDownloadPNG}
                disabled={isDownloadingCardPNG || isPrintingCard || isDownloadingPNG}
                className="h-10 px-2.5 clay-btn-secondary text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 whitespace-nowrap shadow-xs"
              >
                {isDownloadingPNG ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1E293B] shrink-0" />
                    <span>Preparing...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 shrink-0" />
                    <span>QR Only (PNG)</span>
                  </>
                )}
              </button>

              <button
                onClick={handlePrintCard}
                disabled={isDownloadingCardPNG || isPrintingCard || isDownloadingPNG}
                className="h-10 px-2.5 clay-btn-secondary text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 whitespace-nowrap shadow-xs"
              >
                {isPrintingCard ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2563EB] shrink-0" />
                    <span>Opening...</span>
                  </>
                ) : (
                  <>
                    <Printer className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                    <span>Print PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
