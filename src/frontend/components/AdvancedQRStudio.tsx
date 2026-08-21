import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Branch, QrConfig, QrTemplate } from '../../types';
import { Modal } from './Modal';
import { printQRCard, downloadCardAsPNG } from '../utils/printQR';
import {
  Download, QrCode, Printer, Sparkles, Image as ImageIcon, Upload,
  Palette, Layout, Layers, Copy, Check, FileText, Smartphone, Monitor, Loader2,
  Star, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface AdvancedQRStudioProps {
  isOpen: boolean;
  onClose: () => void;
  branch: Branch | null;
  businessName?: string;
  logoUrl?: string;
  onSaveSuccess?: () => void;
}

export const PRESET_QR_TEMPLATES: QrTemplate[] = [
  {
    id: 'tmpl-minimal',
    name: 'Minimal Clean',
    category: 'Minimal',
    description: 'Crisp monochrome contrast for modern offices and clinics.',
    isPreset: true,
    createdAt: new Date().toISOString(),
    config: {
      dotStyle: 'square',
      eyeShape: 'square',
      fgColor: '#1E293B',
      bgColor: '#FFFFFF',
      isTransparent: false,
      useGradient: false,
      eyeColor: '#1E293B',
      margin: 2,
      errorCorrectionLevel: 'H',
      logoSize: 24,
      logoBorderWidth: 3,
      logoBorderColor: '#1E293B',
      logoBgColor: '#FFFFFF',
      logoShape: 'rounded',
      frameStyle: 'table-tent',
      primaryColor: '#2563EB',
      accentColor: '#1E293B',
      frameTitle: 'Scan to Leave 5★ Review',
      frameSubtitle: 'Takes less than 10 seconds with AI!',
      showGoogleBadge: true,
      badgeRating: '4.9',
      badgeReviewCount: '150+'
    }
  },
  {
    id: 'tmpl-modern',
    name: 'Blue Accent Modern',
    category: 'Modern',
    description: 'Vibrant blue frame theme with crisp scannable QR code.',
    isPreset: true,
    createdAt: new Date().toISOString(),
    config: {
      dotStyle: 'square',
      eyeShape: 'square',
      fgColor: '#1E293B',
      bgColor: '#FFFFFF',
      isTransparent: false,
      useGradient: false,
      eyeColor: '#1E293B',
      margin: 2,
      errorCorrectionLevel: 'H',
      logoSize: 24,
      logoBorderWidth: 3,
      logoBorderColor: '#2563EB',
      logoBgColor: '#FFFFFF',
      logoShape: 'rounded',
      frameStyle: 'table-tent',
      primaryColor: '#2563EB',
      accentColor: '#38BDF8',
      frameTitle: 'Scan to Review Us on Google',
      frameSubtitle: '1-Tap AI Review Assistant',
      showGoogleBadge: true,
      badgeRating: '5.0',
      badgeReviewCount: '200+'
    }
  },
  {
    id: 'tmpl-luxury',
    name: 'Dark Classic',
    category: 'Luxury',
    description: 'Premium dark canvas frame with bold high-contrast details.',
    isPreset: true,
    createdAt: new Date().toISOString(),
    config: {
      dotStyle: 'square',
      eyeShape: 'square',
      fgColor: '#1E293B',
      bgColor: '#FFFFFF',
      isTransparent: false,
      useGradient: false,
      eyeColor: '#1E293B',
      margin: 2,
      errorCorrectionLevel: 'H',
      logoSize: 24,
      logoBorderWidth: 3,
      logoBorderColor: '#2563EB',
      logoBgColor: '#FFFFFF',
      logoShape: 'circle',
      frameStyle: 'standee',
      primaryColor: '#1E293B',
      accentColor: '#2563EB',
      frameTitle: 'VIP Guest Review Stand',
      frameSubtitle: 'Share your 5-Star experience',
      showGoogleBadge: true,
      badgeRating: '4.98',
      badgeReviewCount: '500+'
    }
  }
];

export const AdvancedQRStudio: React.FC<AdvancedQRStudioProps> = ({
  isOpen,
  onClose,
  branch,
  businessName = 'Smile Dental Clinic',
  logoUrl = '',
  onSaveSuccess
}) => {
  if (!branch) return null;

  const { fetchWithAuth } = useAuth();
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const [activeTab, setActiveTab] = useState<'TEMPLATES' | 'DESIGN' | 'LOGO' | 'BRANDING' | 'EXPORT'>('TEMPLATES');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('tmpl-minimal');
  const [templates, setTemplates] = useState<QrTemplate[]>(PRESET_QR_TEMPLATES);

  const [config, setConfig] = useState<QrConfig>(branch.qrConfig || PRESET_QR_TEMPLATES[0].config);
  const [currentLogo, setCurrentLogo] = useState<string>((branch.qrConfig && branch.qrConfig.logoUrl) || logoUrl || '');
  const [includeLogo, setIncludeLogo] = useState<boolean>(!!(branch.qrConfig && branch.qrConfig.logoUrl));
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [previewMode, setPreviewMode] = useState<'TABLET' | 'MOBILE' | 'PRINT'>('TABLET');
  const [copiedLink, setCopiedLink] = useState(false);

  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloadingCardPNG, setIsDownloadingCardPNG] = useState(false);
  const [isDownloadingSVG, setIsDownloadingSVG] = useState(false);

  const reviewUrl = `${window.location.origin}/review/${branch.id}`;

  // Sync state when branch updates
  useEffect(() => {
    if (branch) {
      const initialConfig = branch.qrConfig || PRESET_QR_TEMPLATES[0].config;
      setConfig(initialConfig);
      setCurrentLogo(initialConfig.logoUrl || logoUrl || '');
      setIncludeLogo(!!initialConfig.logoUrl);
      setSelectedTemplateId(branch.qrConfig ? 'custom' : 'tmpl-minimal');
    }
  }, [branch, logoUrl]);

  useEffect(() => {
    generateBaseQR();
  }, [config, reviewUrl, includeLogo, currentLogo]);

  const handleSaveCustomization = async () => {
    setIsSaving(true);
    try {
      const qrConfig: QrConfig = {
        ...config,
        logoUrl: includeLogo ? currentLogo : undefined
      };
      
      const res = await fetchWithAuth(`/api/branches/${branch.id}`, {
        method: 'PUT',
        body: JSON.stringify({ qrConfig })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('QR Code customization saved successfully!', 'success');
        if (onSaveSuccess) onSaveSuccess();
      } else {
        showToast(data.message || 'Failed to save customization.', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Network error while saving customization.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetCustomization = async () => {
    if (!window.confirm('Are you sure you want to reset all QR code customizations to default?')) {
      return;
    }
    setIsSaving(true);
    try {
      const defaultConfig = PRESET_QR_TEMPLATES[0].config;
      
      const res = await fetchWithAuth(`/api/branches/${branch.id}`, {
        method: 'PUT',
        body: JSON.stringify({ qrConfig: null })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setConfig(defaultConfig);
        setCurrentLogo(logoUrl || '');
        setIncludeLogo(false);
        setSelectedTemplateId('tmpl-minimal');
        showToast('QR Code customization reset to default!', 'success');
        if (onSaveSuccess) onSaveSuccess();
      } else {
        showToast(data.message || 'Failed to reset customization.', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Network error while resetting customization.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const generateBaseQR = async () => {
    try {
      const canvas = document.createElement('canvas');
      const size = 600;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const qrObj = QRCode.create(reviewUrl, {
        errorCorrectionLevel: config.errorCorrectionLevel || 'H',
      });

      const N = qrObj.modules.size;
      const marginModules = config.margin || 2;
      const totalModules = N + marginModules * 2;
      const cellSize = size / totalModules;

      // 1. Draw Background
      ctx.fillStyle = config.isTransparent ? '#00000000' : (config.bgColor || '#FFFFFF');
      if (!config.isTransparent) {
        ctx.beginPath();
        const radius = size * 0.08;
        if (ctx.roundRect) {
          ctx.roundRect(0, 0, size, size, radius);
        } else {
          ctx.rect(0, 0, size, size);
        }
        ctx.fill();
      }

      // 2. Helper to draw Eye
      const drawEye = (startRow: number, startCol: number) => {
        const eyeX = (startCol + marginModules) * cellSize;
        const eyeY = (startRow + marginModules) * cellSize;
        const eyeWidth = cellSize * 7;
        const eyeInnerWidth = cellSize * 3;
        const eyeInnerX = eyeX + cellSize * 2;
        const eyeInnerY = eyeY + cellSize * 2;

        // Clear eye background
        if (!config.isTransparent) {
          ctx.fillStyle = config.bgColor || '#FFFFFF';
          ctx.fillRect(eyeX, eyeY, eyeWidth, eyeWidth);
        }

        ctx.fillStyle = config.eyeColor || config.fgColor || '#1E293B';

        if (config.eyeShape === 'circle') {
          // Outer circle
          ctx.beginPath();
          ctx.arc(eyeX + eyeWidth / 2, eyeY + eyeWidth / 2, eyeWidth / 2, 0, Math.PI * 2);
          ctx.fill();

          // Cutout
          ctx.fillStyle = config.isTransparent ? '#FFFFFF' : (config.bgColor || '#FFFFFF');
          ctx.beginPath();
          ctx.arc(eyeX + eyeWidth / 2, eyeY + eyeWidth / 2, (cellSize * 5) / 2, 0, Math.PI * 2);
          ctx.fill();

          // Inner dot
          ctx.fillStyle = config.eyeColor || config.fgColor || '#1E293B';
          ctx.beginPath();
          ctx.arc(eyeX + eyeWidth / 2, eyeY + eyeWidth / 2, eyeInnerWidth / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (config.eyeShape === 'rounded') {
          // Outer rounded rect
          ctx.beginPath();
          ctx.roundRect(eyeX, eyeY, eyeWidth, eyeWidth, cellSize * 1.8);
          ctx.fill();

          // Cutout
          ctx.fillStyle = config.isTransparent ? '#FFFFFF' : (config.bgColor || '#FFFFFF');
          ctx.beginPath();
          ctx.roundRect(eyeX + cellSize, eyeY + cellSize, cellSize * 5, cellSize * 5, cellSize * 1.2);
          ctx.fill();

          // Inner dot
          ctx.fillStyle = config.eyeColor || config.fgColor || '#1E293B';
          ctx.beginPath();
          ctx.roundRect(eyeInnerX, eyeInnerY, eyeInnerWidth, eyeInnerWidth, cellSize * 0.8);
          ctx.fill();
        } else {
          // Standard Square
          ctx.fillRect(eyeX, eyeY, eyeWidth, eyeWidth);

          ctx.fillStyle = config.isTransparent ? '#FFFFFF' : (config.bgColor || '#FFFFFF');
          ctx.fillRect(eyeX + cellSize, eyeY + cellSize, cellSize * 5, cellSize * 5);

          ctx.fillStyle = config.eyeColor || config.fgColor || '#1E293B';
          ctx.fillRect(eyeInnerX, eyeInnerY, eyeInnerWidth, eyeInnerWidth);
        }
      };

      // 3. Draw standard modules
      ctx.fillStyle = config.fgColor || '#1E293B';

      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          const isDark = qrObj.modules.get(r, c);
          if (!isDark) continue;

          // Skip eye regions - they are drawn separately
          const isEye = (r < 7 && c < 7) || (r < 7 && c >= N - 7) || (r >= N - 7 && c < 7);
          if (isEye) continue;

          const x = (c + marginModules) * cellSize;
          const y = (r + marginModules) * cellSize;

          if (config.dotStyle === 'dots' || config.dotStyle === 'circle') {
            ctx.beginPath();
            ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize * 0.42, 0, Math.PI * 2);
            ctx.fill();
          } else if (config.dotStyle === 'rounded') {
            ctx.beginPath();
            ctx.roundRect(x + 0.5, y + 0.5, cellSize - 0.5, cellSize - 0.5, cellSize * 0.35);
            ctx.fill();
          } else {
            // square blocks
            ctx.fillRect(x, y, cellSize + 0.5, cellSize + 0.5);
          }
        }
      }

      // Draw custom eyes
      drawEye(0, 0);
      drawEye(0, N - 7);
      drawEye(N - 7, 0);

      // Draw logo in center if enabled
      if (includeLogo && currentLogo && currentLogo.trim() !== '') {
        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';

        logoImg.onload = () => {
          const logoPercent = (config.logoSize || 22) / 100;
          const logoBoxSize = size * logoPercent;
          const logoX = (size - logoBoxSize) / 2;
          const logoY = (size - logoBoxSize) / 2;

          ctx.save();
          ctx.fillStyle = config.logoBgColor || '#FFFFFF';
          ctx.strokeStyle = config.logoBorderColor || config.primaryColor || '#2563EB';
          ctx.lineWidth = config.logoBorderWidth || 4;

          if (config.logoShape === 'circle') {
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, logoBoxSize / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(size / 2, size / 2, (logoBoxSize / 2) - 3, 0, Math.PI * 2);
            ctx.clip();
          } else if (config.logoShape === 'rounded') {
            const radius = 12;
            ctx.beginPath();
            ctx.roundRect(logoX, logoY, logoBoxSize, logoBoxSize, radius);
            ctx.fill();
            ctx.stroke();

            ctx.beginPath();
            ctx.roundRect(logoX + 2, logoY + 2, logoBoxSize - 4, logoBoxSize - 4, radius - 2);
            ctx.clip();
          } else {
            ctx.fillRect(logoX, logoY, logoBoxSize, logoBoxSize);
            ctx.strokeRect(logoX, logoY, logoBoxSize, logoBoxSize);

            ctx.beginPath();
            ctx.rect(logoX + 2, logoY + 2, logoBoxSize - 4, logoBoxSize - 4);
            ctx.clip();
          }

          const logoW = logoImg.width;
          const logoH = logoImg.height;
          const maxLogoSize = logoBoxSize - 8;
          let drawW = maxLogoSize;
          let drawH = maxLogoSize;
          if (logoW > logoH) {
            drawH = maxLogoSize * (logoH / logoW);
          } else if (logoH > logoW) {
            drawW = maxLogoSize * (logoW / logoH);
          }
          const drawX = logoX + 4 + (maxLogoSize - drawW) / 2;
          const drawY = logoY + 4 + (maxLogoSize - drawH) / 2;

          ctx.drawImage(logoImg, drawX, drawY, drawW, drawH);
          ctx.restore();

          setQrDataUrl(canvas.toDataURL('image/png'));
        };

        logoImg.onerror = () => {
          setQrDataUrl(canvas.toDataURL('image/png'));
        };

        const proxiedLogo = (currentLogo.startsWith('http') && !currentLogo.startsWith(window.location.origin)) 
          ? `/api/settings/proxy-image?url=${encodeURIComponent(currentLogo)}` 
          : currentLogo;
        logoImg.src = proxiedLogo;
      } else {
        setQrDataUrl(canvas.toDataURL('image/png'));
      }
    } catch (e) {
      console.error('Failed to generate QR Code:', e);
    }
  };

  const handleSelectTemplate = (tmpl: QrTemplate) => {
    setSelectedTemplateId(tmpl.id);
    setConfig(tmpl.config);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(reviewUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      await printQRCard({
        businessName,
        branchName: branch.name,
        qrDataUrl,
        frameTitle: config.frameTitle,
        frameSubtitle: config.frameSubtitle,
        primaryColor: config.primaryColor,
        accentColor: config.accentColor,
        bgColor: config.bgColor,
        showGoogleBadge: config.showGoogleBadge,
        badgeRating: config.badgeRating,
        badgeReviewCount: config.badgeReviewCount,
        reviewUrl,
        frameStyle: config.frameStyle,
        logoUrl: includeLogo ? currentLogo : ''
      });
    } catch (err) {
      console.error('Print Error:', err);
    } finally {
      setIsPrinting(false);
    }
  };

  const handleDownloadCardPNG = async () => {
    setIsDownloadingCardPNG(true);
    try {
      await downloadCardAsPNG({
        businessName,
        branchName: branch.name,
        qrDataUrl,
        frameTitle: config.frameTitle,
        frameSubtitle: config.frameSubtitle,
        primaryColor: config.primaryColor,
        accentColor: config.accentColor,
        bgColor: config.bgColor,
        showGoogleBadge: config.showGoogleBadge,
        badgeRating: config.badgeRating,
        badgeReviewCount: config.badgeReviewCount,
        reviewUrl,
        frameStyle: config.frameStyle,
        logoUrl: includeLogo ? currentLogo : ''
      });
    } catch (err) {
      console.error('Download Standee PNG Error:', err);
    } finally {
      setIsDownloadingCardPNG(false);
    }
  };

  const handleDownloadPNG = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `${branch.name.replace(/\s+/g, '_')}_QR_Code.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const handleDownloadSVG = async () => {
    setIsDownloadingSVG(true);
    try {
      const svgString = await QRCode.toString(reviewUrl, {
        type: 'svg',
        color: {
          dark: config.fgColor || '#1E293B',
          light: config.bgColor || '#FFFFFF'
        },
        margin: config.margin || 2
      });

      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${branch.name.replace(/\s+/g, '_')}_QR_Vector.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('SVG Generation Error:', e);
    } finally {
      setIsDownloadingSVG(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawResult = event.target?.result as string;
        if (rawResult) {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxDim = 250;
            let w = img.width;
            let h = img.height;
            if (w > maxDim || h > maxDim) {
              if (w > h) {
                h = Math.round((h * maxDim) / w);
                w = maxDim;
              } else {
                w = Math.round((w * maxDim) / h);
                h = maxDim;
              }
            }
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, w, h);
              const compressedDataUrl = canvas.toDataURL('image/png');
              setCurrentLogo(compressedDataUrl);
              setIncludeLogo(true);
            } else {
              setCurrentLogo(rawResult);
              setIncludeLogo(true);
            }
          };
          img.src = rawResult;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Advanced QR Studio & Designer - ${branch.name}`}
      subtitle="Customize shape, colors, centered logo, branding frames, and print-ready layouts"
      maxWidth="max-w-5xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Customization Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-4 text-xs">
          {/* Navigation Tabs */}
          <div className="flex items-center space-x-1.5 border-b border-[#E8EDF5] pb-2 overflow-x-auto text-xs font-bold">
            {[
              { id: 'TEMPLATES', label: 'Presets', icon: Layers },
              { id: 'DESIGN', label: 'QR Style', icon: Palette },
              { id: 'LOGO', label: 'Center Logo', icon: ImageIcon },
              { id: 'BRANDING', label: 'Frame Copy', icon: Layout },
              { id: 'EXPORT', label: 'Export / Print', icon: Download },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-2xl transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'clay-btn-primary text-xs'
                      : 'clay-btn-secondary text-xs'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: TEMPLATES */}
          {activeTab === 'TEMPLATES' && (
            <div className="space-y-4">
              <span className="text-xs font-extrabold text-[#1E293B] block">Select Preset Theme:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-h-[380px] overflow-y-auto p-1">
                {templates.map(tmpl => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tmpl)}
                    className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between clay-card ${
                      selectedTemplateId === tmpl.id
                        ? 'bg-[#EEF2F7] border-[#2563EB] shadow-[inset_1px_1px_3px_rgba(255,255,255,0.9)]'
                        : 'bg-white border-[#DCE3EC] hover:bg-[#EEF2F7]'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-[#EEF2F7] text-[#2563EB] rounded-full border border-[#DCE3EC] uppercase inline-block mb-1">
                        {tmpl.category}
                      </span>
                      <h4 className="text-xs font-extrabold mt-1 text-[#1E293B]">{tmpl.name}</h4>
                      <p className="text-[10px] text-[#64748B] line-clamp-2 mt-1">{tmpl.description}</p>
                    </div>

                    <div className="mt-3 flex items-center space-x-1.5">
                      <div className="w-4 h-4 rounded-full border border-[#DCE3EC]" style={{ backgroundColor: tmpl.config.fgColor }} />
                      <div className="w-4 h-4 rounded-full border border-[#DCE3EC]" style={{ backgroundColor: tmpl.config.primaryColor }} />
                      <div className="w-4 h-4 rounded-full border border-[#DCE3EC]" style={{ backgroundColor: tmpl.config.accentColor }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: QR STYLE */}
          {activeTab === 'DESIGN' && (
            <div className="space-y-4 max-h-[380px] overflow-y-auto p-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#1E293B] mb-1">Dot Pattern Style</label>
                  <select
                    value={config.dotStyle}
                    onChange={e => setConfig({ ...config, dotStyle: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 clay-input text-xs"
                  >
                    <option value="square">Square Blocks</option>
                    <option value="dots">Smooth Dots</option>
                    <option value="rounded">Rounded Squares</option>
                    <option value="circle">Full Circles</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#1E293B] mb-1">Corner Eye Shape</label>
                  <select
                    value={config.eyeShape}
                    onChange={e => setConfig({ ...config, eyeShape: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 clay-input text-xs"
                  >
                    <option value="square">Standard Square</option>
                    <option value="rounded">Smooth Rounded</option>
                    <option value="circle">Circular Eye</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#1E293B] mb-1">Foreground Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={config.fgColor}
                      onChange={e => setConfig({ ...config, fgColor: e.target.value })}
                      className="w-10 h-10 cursor-pointer rounded-xl border border-[#DCE3EC] p-0 bg-transparent shrink-0"
                    />
                    <input
                      type="text"
                      value={config.fgColor}
                      onChange={e => setConfig({ ...config, fgColor: e.target.value })}
                      className="flex-1 h-10 px-3.5 py-2 clay-input font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#1E293B] mb-1">Background Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={config.bgColor}
                      onChange={e => setConfig({ ...config, bgColor: e.target.value })}
                      className="w-10 h-10 cursor-pointer rounded-xl border border-[#DCE3EC] p-0 bg-transparent shrink-0"
                    />
                    <input
                      type="text"
                      value={config.bgColor}
                      onChange={e => setConfig({ ...config, bgColor: e.target.value })}
                      className="flex-1 h-10 px-3.5 py-2 clay-input font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 items-end">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-[#1E293B]">Margin Padding</label>
                    <span className="text-[10px] font-mono font-bold text-[#2563EB] bg-[#EEF2F7] px-1.5 py-0.5 rounded border border-[#DCE3EC]">
                      {config.margin}px
                    </span>
                  </div>
                  <div className="h-[38px] flex items-center px-3 clay-input bg-white">
                    <input
                      type="range"
                      min="0"
                      max="4"
                      value={config.margin}
                      onChange={e => setConfig({ ...config, margin: parseInt(e.target.value) })}
                      className="w-full accent-[#2563EB] cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1.5">Error Correction Level</label>
                  <select
                    value={config.errorCorrectionLevel}
                    onChange={e => setConfig({ ...config, errorCorrectionLevel: e.target.value as any })}
                    className="w-full h-[38px] px-3.5 clay-input text-xs"
                  >
                    <option value="L">Low (7% recovery)</option>
                    <option value="M">Medium (15% recovery)</option>
                    <option value="Q">Quartile (25% recovery)</option>
                    <option value="H">High (30% - Best for Logos)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CENTER LOGO */}
          {activeTab === 'LOGO' && (
            <div className="space-y-4 max-h-[380px] overflow-y-auto p-1">
              <div className="flex items-center justify-between w-full flex-wrap gap-2 min-h-[44px] px-3 py-2 clay-card bg-white border border-[#DCE3EC] rounded-2xl">
                <label className="font-bold text-[#1E293B] text-xs cursor-pointer select-none flex-1 min-w-0">
                  Include center logo in QR code
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
                <label className="block font-bold text-[#1E293B] mb-1">Company Logo Image</label>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-[#EEF2F7] rounded-2xl border border-[#DCE3EC] flex items-center justify-center overflow-hidden shrink-0 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9)]">
                    {currentLogo ? (
                      <img src={currentLogo} alt="Center Logo" className="w-full h-full object-contain" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-[#2563EB]" />
                    )}
                  </div>
                  <input
                    type="text"
                    value={currentLogo}
                    onChange={e => setCurrentLogo(e.target.value)}
                    placeholder="Paste Logo Image URL..."
                    className="flex-1 px-3.5 py-2.5 clay-input text-xs"
                  />
                  <label className="px-3.5 py-2.5 clay-btn-secondary text-xs cursor-pointer flex items-center space-x-1 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 items-end">
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1.5">Logo Box Shape</label>
                  <select
                    value={config.logoShape}
                    onChange={e => setConfig({ ...config, logoShape: e.target.value as any })}
                    className="w-full h-[38px] px-3.5 clay-input text-xs"
                  >
                    <option value="rounded">Smooth Rounded Box</option>
                    <option value="circle">Circular Container</option>
                    <option value="square">Sharp Square Box</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-[#1E293B]">Logo Box Scale</label>
                    <span className="text-[10px] font-mono font-bold text-[#2563EB] bg-[#EEF2F7] px-1.5 py-0.5 rounded border border-[#DCE3EC]">
                      {config.logoSize}%
                    </span>
                  </div>
                  <div className="h-[38px] flex items-center px-3 clay-input bg-white">
                    <input
                      type="range"
                      min="15"
                      max="30"
                      value={config.logoSize}
                      onChange={e => setConfig({ ...config, logoSize: parseInt(e.target.value) })}
                      className="w-full accent-[#2563EB] cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FRAME & COPY BRANDING */}
          {activeTab === 'BRANDING' && (
            <div className="space-y-4 max-h-[380px] overflow-y-auto p-1">
              <div>
                <label className="block font-bold text-[#1E293B] mb-1">Frame Headline CTA</label>
                <input
                  type="text"
                  value={config.frameTitle}
                  onChange={e => setConfig({ ...config, frameTitle: e.target.value })}
                  placeholder="Scan to Leave a 5★ Review"
                  className="w-full px-3.5 py-2.5 clay-input text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1E293B] mb-1">Subtitle / Subheadline</label>
                <input
                  type="text"
                  value={config.frameSubtitle}
                  onChange={e => setConfig({ ...config, frameSubtitle: e.target.value })}
                  placeholder="Takes less than 10 seconds!"
                  className="w-full px-3.5 py-2.5 clay-input text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#1E293B] mb-1">Primary Theme Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={config.primaryColor}
                      onChange={e => setConfig({ ...config, primaryColor: e.target.value })}
                      className="w-10 h-10 cursor-pointer rounded-xl border border-[#DCE3EC] p-0 bg-transparent shrink-0"
                    />
                    <input
                      type="text"
                      value={config.primaryColor}
                      onChange={e => setConfig({ ...config, primaryColor: e.target.value })}
                      className="flex-1 h-10 px-3.5 py-2 clay-input font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#1E293B] mb-1">Accent Badge Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={config.accentColor}
                      onChange={e => setConfig({ ...config, accentColor: e.target.value })}
                      className="w-10 h-10 cursor-pointer rounded-xl border border-[#DCE3EC] p-0 bg-transparent shrink-0"
                    />
                    <input
                      type="text"
                      value={config.accentColor}
                      onChange={e => setConfig({ ...config, accentColor: e.target.value })}
                      className="flex-1 h-10 px-3.5 py-2 clay-input font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DOWNLOAD & PRINT */}
          {activeTab === 'EXPORT' && (
            <div className="space-y-4">
              <div className="p-4 clay-card bg-white border border-[#DCE3EC] space-y-2">
                <h4 className="font-extrabold text-[#1E293B] flex items-center space-x-1.5">
                  <Printer className="w-4 h-4 text-[#2563EB]" />
                  <span>300 DPI High-Resolution & Vector Export</span>
                </h4>
                <p className="text-[#64748B] text-xs leading-relaxed">
                  Export your customized QR scanner card for desktop acrylic standees, vinyl table tents, or professional print shops.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleDownloadCardPNG}
                  className="py-3 px-4 clay-btn-primary text-xs flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Standee Card (PNG)</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="py-3 px-4 clay-btn-secondary text-xs flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-[#2563EB]" />
                  <span>Print / Save PDF Table Tent</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPNG}
                  className="py-2.5 px-3 clay-btn-secondary text-xs flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#1E293B]" />
                  <span>Raw QR Code Only (PNG)</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadSVG}
                  className="py-2.5 px-3 clay-btn-secondary text-xs flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-[#2563EB]" />
                  <span>SVG Vector File</span>
                </button>
              </div>

              <div className="p-3.5 bg-[#EEF2F7] rounded-2xl border border-[#DCE3EC] flex items-center justify-between">
                <div className="truncate pr-2">
                  <span className="block text-[10px] text-[#64748B] font-mono uppercase font-bold">Direct Scanner Target URL:</span>
                  <span className="font-mono text-[#2563EB] font-extrabold truncate">{reviewUrl}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3.5 py-2 clay-btn-secondary text-xs flex items-center space-x-1 shrink-0 cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-[#22C55E]" /> : <Copy className="w-3.5 h-3.5 text-[#1E293B]" />}
                  <span>{copiedLink ? 'Copied' : 'Copy URL'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Database persistence buttons */}
          <div className="flex items-center space-x-3 pt-4 border-t border-[#E8EDF5]">
            <button
              type="button"
              onClick={handleSaveCustomization}
              disabled={isSaving}
              className="flex-1 py-3 px-4 clay-btn-primary text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Check className="w-4 h-4 text-white" />
              )}
              <span>{isSaving ? 'Saving...' : 'Save Customization'}</span>
            </button>
            <button
              type="button"
              onClick={handleResetCustomization}
              disabled={isSaving}
              className="py-3 px-4 bg-[#EF4444] hover:bg-[#DC2626] text-white text-xs font-bold rounded-2xl flex items-center justify-center space-x-2 cursor-pointer shadow-md disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <RefreshCw className="w-4 h-4 text-white" />
              <span>Reset Customization</span>
            </button>
          </div>
        </div>

        {/* Right Column: Live Interactive Card Preview (5 cols) */}
        <div className="lg:col-span-5 clay-card bg-white border border-[#DCE3EC] p-6 flex flex-col items-center justify-between space-y-4">
          {/* Mode Switcher */}
          <div className="w-full flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#2563EB] flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Live Card Preview</span>
            </span>

            {/* <div className="flex items-center space-x-1 bg-[#EEF2F7] border border-[#DCE3EC] p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setPreviewMode('TABLET')}
                className={`p-1.5 text-xs transition-colors rounded-xl border cursor-pointer ${previewMode === 'TABLET' ? 'clay-btn-primary' : 'text-[#64748B] hover:text-[#1E293B]'}`}
                title="Desktop / Table Tent Preview"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('MOBILE')}
                className={`p-1.5 text-xs transition-colors rounded-xl border cursor-pointer ${previewMode === 'MOBILE' ? 'clay-btn-primary' : 'text-[#64748B] hover:text-[#1E293B]'}`}
                title="Mobile Screen Preview"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('PRINT')}
                className={`p-1.5 text-xs transition-colors rounded-xl border cursor-pointer ${previewMode === 'PRINT' ? 'clay-btn-primary' : 'text-[#64748B] hover:text-[#1E293B]'}`}
                title="Print Fold Guidelines"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
            </div> */}
          </div>

          {/* Interactive Card Container */}
          <div className="w-full flex justify-center py-2">
            {previewMode === 'MOBILE' ? (
              <div className="w-[260px] h-[450px] bg-white rounded-[40px] border-[8px] border-slate-900 shadow-2xl relative overflow-hidden flex flex-col font-sans">
                {/* Speaker/Camera notch */}
                <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-16 h-3 bg-slate-900 rounded-full z-20" />
                
                {/* Mobile Screen Content (Mini CustomerPortal) */}
                <div className="flex-1 overflow-y-auto bg-[#F5F7FB] p-3 pt-6 flex flex-col items-center text-center space-y-3">
                  {/* Logo */}
                  <div className="w-9 h-9 bg-white rounded-xl shadow-sm border border-[#DCE3EC] overflow-hidden flex items-center justify-center p-1">
                    {includeLogo && currentLogo ? (
                      <img src={currentLogo} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-[#2563EB]" />
                    )}
                  </div>
                  
                  <div>
                    <span className="text-[9px] font-extrabold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      {businessName}
                    </span>
                    <h4 className="text-[10px] font-bold mt-1 text-slate-800">{branch.name}</h4>
                  </div>
                  
                  <div className="bg-white p-3 rounded-xl border border-[#DCE3EC] shadow-sm w-full space-y-2">
                    <p className="text-[9px] font-bold text-slate-700">Spill the tea! How was your visit? ☕️</p>
                    <div className="flex justify-center space-x-0.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} className="w-4 h-4 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-[8px] font-extrabold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-full inline-block">
                      😍 Absolutely Slaps! 10/10 ✨
                    </span>
                  </div>
                  
                  <div className="bg-white p-2.5 rounded-xl border border-[#DCE3EC] shadow-sm w-full text-[8px] text-slate-500 text-left space-y-1">
                    <p className="font-bold text-slate-700">ReviewScore AI Assistant:</p>
                    <p className="italic bg-slate-50 p-1.5 rounded-lg border border-slate-100 leading-snug">
                      "Had a fantastic experience at {businessName}! The service was top-tier and the staff was super friendly. Highly recommend!"
                    </p>
                  </div>
                </div>
              </div>
            ) : previewMode === 'PRINT' ? (
              <div className="w-full max-w-[280px] bg-white border-2 border-dashed border-[#CBD5E1] p-3 rounded-2xl text-center space-y-2">
                <span className="text-[8px] font-bold text-[#64748B] uppercase tracking-wider block">A4 Folding Paper Template</span>
                
                {/* Top rotated card */}
                {config.frameStyle === 'table-tent' && (
                  <div className="scale-[0.6] opacity-50 origin-top rotate-180 border border-[#DCE3EC] rounded-xl p-2 bg-[#EEF2F7] flex flex-col items-center">
                    <span className="text-[7px] font-bold">{businessName}</span>
                    <h4 className="text-[8px] font-bold">{config.frameTitle}</h4>
                    <div className="w-12 h-12 bg-white border rounded my-1 flex items-center justify-center"><QrCode className="w-5 h-5 text-slate-400" /></div>
                  </div>
                )}
                
                {/* Fold line */}
                <div className="border-t-2 border-dashed border-red-400 my-1 relative">
                  <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-white px-2 text-[7px] font-bold text-red-500 uppercase tracking-widest">✂️ Fold Line ✂️</span>
                </div>
                
                {/* Bottom upright card */}
                <div className="scale-[0.6] opacity-70 origin-bottom border border-[#DCE3EC] rounded-xl p-2 bg-[#EEF2F7] flex flex-col items-center">
                  <span className="text-[7px] font-bold">{businessName}</span>
                  <h4 className="text-[8px] font-bold">{config.frameTitle}</h4>
                  <div className="w-12 h-12 bg-white border rounded my-1 flex items-center justify-center"><QrCode className="w-5 h-5 text-slate-400" /></div>
                </div>
              </div>
            ) : (
              <div 
                className="w-full max-w-[280px] rounded-3xl p-6 flex flex-col items-center text-center shadow-[inset_1px_1px_3px_rgba(255,255,255,0.9),4px_4px_12px_rgba(100,116,139,0.08)] bg-white"
                style={{ 
                  border: `3px solid ${config.primaryColor || '#2563EB'}`,
                }}
              >
                {/* Header Badge */}
                <div 
                  className="inline-flex items-center space-x-1.5 px-3 py-1 text-white font-extrabold text-[10px] uppercase tracking-wider mb-2 rounded-full shadow-[1px_1px_4px_rgba(37,99,235,0.3)]"
                  style={{ backgroundColor: config.primaryColor || '#2563EB' }}
                >
                  <Sparkles className="w-3 h-3 text-white" />
                  <span>{businessName}</span>
                </div>

                <h3 
                  className="text-base font-extrabold tracking-tight leading-snug"
                  style={{ color: config.primaryColor || '#1E293B' }}
                >
                  {config.frameTitle}
                </h3>

                <p 
                  className="text-[10px] mt-0.5 font-bold"
                  style={{ color: config.accentColor || '#64748B' }}
                >
                  {config.frameSubtitle}
                </p>

                {/* QR Image with centered logo canvas output */}
                <div 
                  className="mt-3 p-2.5 rounded-2xl border border-[#DCE3EC] shadow-[2px_2px_6px_rgba(100,116,139,0.06)] overflow-hidden"
                  style={{ backgroundColor: config.bgColor || '#FFFFFF' }}
                >
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="QR Scanner" className="w-44 h-44 object-contain rounded-xl overflow-hidden block" />
                  ) : (
                    <div className="w-44 h-44 bg-[#EEF2F7] rounded-xl flex items-center justify-center text-[#1E293B]">
                      <QrCode className="w-8 h-8 animate-pulse text-[#2563EB]" />
                    </div>
                  )}
                </div>

                {/* Google Rating Badge */}
                {config.showGoogleBadge && (
                  <div 
                    className="mt-3 px-3 py-1 rounded-full border flex items-center space-x-1.5 text-[10px] font-extrabold shadow-[2px_2px_6px_rgba(100,116,139,0.06)]"
                    style={{
                      backgroundColor: `${config.accentColor || '#38BDF8'}15`,
                      borderColor: `${config.accentColor || '#38BDF8'}30`,
                      color: config.primaryColor || '#1E293B'
                    }}
                  >
                    <span>Google ★ {config.badgeRating}</span>
                    <span style={{ color: `${config.primaryColor || '#1E293B'}bb` }}>({config.badgeReviewCount} reviews)</span>
                  </div>
                )}

                <div 
                  className="mt-3 text-[9px] font-mono font-bold"
                  style={{ color: config.accentColor || '#64748B' }}
                >
                  Powered by ReviewScore AI
                </div>
              </div>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="w-full grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handlePrint}
              disabled={isPrinting || isDownloadingCardPNG || isDownloadingSVG}
              className="h-10 px-2.5 clay-btn-primary text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 whitespace-nowrap shadow-xs transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              {isPrinting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white shrink-0" />
                  <span>Printing...</span>
                </>
              ) : (
                <>
                  <Printer className="w-3.5 h-3.5 shrink-0" />
                  <span>Print PDF</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleDownloadCardPNG}
              disabled={isPrinting || isDownloadingCardPNG || isDownloadingSVG}
              className="h-10 px-2.5 clay-btn-secondary text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 whitespace-nowrap shadow-xs transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              {isDownloadingCardPNG ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1E293B] shrink-0" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                  <span>Download Standee</span>
                </>
              )}
            </button>
          </div>

          {/* Card Info footer */}
          <div className="w-full flex items-center justify-between text-[11px] text-[#64748B] pt-2 border-t border-[#E8EDF5]">
            <span>Branch: <strong className="text-[#1E293B]">{branch.name}</strong></span>
            <span className="text-[#2563EB] font-extrabold">{config.frameStyle.toUpperCase()}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};
