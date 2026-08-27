import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Branch, Review, Feedback, Advertisement, Business } from '../../types';
import { encodePasswordPayload } from '../utils/security';
import { StatCard } from '../components/StatCard';
import { BannerAd } from '../components/BannerAd';
import { AdvancedQRStudio } from '../components/AdvancedQRStudio';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import { HighlightsStudio } from '../components/HighlightsStudio';
import { BusinessLogoOrIcon } from '../components/BusinessLogoOrIcon';
import { CardSkeleton, TableSkeleton, ReviewsListSkeleton } from '../components/Skeleton';
import {
  Building2, QrCode, Star, MessageSquare, TrendingUp, CreditCard,
  Plus, Edit, Trash2, Search, ShieldAlert, Sparkles, CheckCircle2, Clock, Phone, Mail,
  ExternalLink, Settings, Tag, LayoutDashboard, Store, BarChart3, Lock, Globe, FileText,
  User, Menu, X, Loader2, ArrowRight, Share2, Sparkle, AlertCircle,
  ChevronRight,
  ChevronLeft,
  EyeOff,
  Eye
} from 'lucide-react';
import { CategorySearchDropdown } from '../components/CategorySearchDropdown';
import { useLenisSmoothScroll } from '../hooks/useLenisSmoothScroll';

export const BusinessPortal: React.FC = () => {
  const { currentBusiness, refetchBusinessData, fetchWithAuth } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'PROFILE' | 'BRANCHES' | 'HIGHLIGHTS' | 'REVIEWS' | 'FEEDBACK' | 'ANALYTICS' | 'SUBSCRIPTION' | 'SETTINGS'>('DASHBOARD');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Global Loading State
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Data states
  const [branches, setBranches] = useState<Branch[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [qrAnalytics, setQrAnalytics] = useState<any>(null);

  // Modals & Forms
  const [selectedBranchForQR, setSelectedBranchForQR] = useState<Branch | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [isSubmittingBranch, setIsSubmittingBranch] = useState(false);

  // Branch form
  const [branchName, setBranchName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [phone, setPhone] = useState('');
  const [googleReviewUrl, setGoogleReviewUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  // Business Profile Form State
  const [profileName, setProfileName] = useState('');
  const [profileOwnerName, setProfileOwnerName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileAddress, setProfileAddress] = useState('');
  const [profileWebsite, setProfileWebsite] = useState('');
  const [profileCategory, setProfileCategory] = useState('');
  const [profileDescription, setProfileDescription] = useState('');
  const [profileWorkingHours, setProfileWorkingHours] = useState('');
  const [profileLogoUrl, setProfileLogoUrl] = useState('');
  const [profileGoogleReviewUrl, setProfileGoogleReviewUrl] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Filters
  const [searchReview, setSearchReview] = useState('');
  const [branchFilter, setBranchFilter] = useState<string>('ALL');
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState<string>('ALL');

  // Password Reset state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isVerifyPasswordModalOpen, setIsVerifyPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const bizId = currentBusiness?.id;

  // Initialize Business Profile fields when currentBusiness updates
  useEffect(() => {
    if (currentBusiness) {
      setProfileName(currentBusiness.name || '');
      setProfileOwnerName(currentBusiness.ownerName || '');
      setProfileEmail(currentBusiness.ownerEmail || '');
      setProfilePhone((currentBusiness as any).phone || '');
      setProfileAddress((currentBusiness as any).address || '');
      setProfileWebsite((currentBusiness as any).website || '');
      setProfileCategory(currentBusiness.category || 'General Business');
      setProfileDescription((currentBusiness as any).description || '');
      setProfileWorkingHours((currentBusiness as any).workingHours || 'Mon - Sat: 9:00 AM - 8:00 PM');
      setProfileLogoUrl(currentBusiness.logoUrl || '');
      setProfileGoogleReviewUrl((currentBusiness as any).googleReviewUrl || '');
    }
  }, [currentBusiness]);

  const loadData = async () => {
    if (!bizId) return;
    setIsLoadingData(true);
    try {
      const [bRes, rRes, fRes, aRes, sRes, qrRes] = await Promise.all([
        fetchWithAuth(`/api/branches?businessId=${bizId}`).then(r => r.json()).catch(() => ({ success: false, data: [] })),
        fetchWithAuth(`/api/reviews?businessId=${bizId}`).then(r => r.json()).catch(() => ({ success: false, data: [] })),
        fetchWithAuth(`/api/feedback?businessId=${bizId}`).then(r => r.json()).catch(() => ({ success: false, data: [] })),
        fetchWithAuth('/api/ads').then(r => r.json()).catch(() => ({ success: false, data: [] })),
        fetchWithAuth(`/api/analytics/business/${bizId}`).then(r => r.json()).catch(() => ({ success: false, data: null })),
        fetchWithAuth(`/api/analytics/qr-scans?businessId=${bizId}`).then(r => r.json()).catch(() => ({ success: false, data: null })),
      ]);

      if (bRes.success) setBranches(bRes.data);
      if (rRes.success) setReviews(rRes.data);
      if (fRes.success) setFeedbackList(fRes.data);
      if (aRes.success) setAds(aRes.data);
      if (sRes.success) setStats(sRes.data);
      if (qrRes.success) setQrAnalytics(qrRes.data);
    } catch (e) {
      console.error('Error loading business portal data:', e);
      showToast('Failed to sync business data with server', 'error');
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [bizId, activeTab]);

  useEffect(() => {
    if (ads.length <= 1 || activeTab !== 'DASHBOARD') return;
    const interval = setInterval(() => {
      setCurrentAdIndex(prev => (prev + 1) % ads.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [ads.length, activeTab]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bizId) return;

    setIsSavingProfile(true);
    try {
      const payload = {
        name: profileName,
        ownerName: profileOwnerName,
        ownerEmail: profileEmail,
        phone: profilePhone,
        address: profileAddress,
        website: profileWebsite,
        category: profileCategory,
        description: profileDescription,
        workingHours: profileWorkingHours,
        logoUrl: profileLogoUrl,
        googleReviewUrl: profileGoogleReviewUrl,
      };

      const res = await fetchWithAuth(`/api/businesses/${bizId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        showToast('Business Profile saved successfully!', 'success');
        refetchBusinessData();
      } else {
        showToast(json.message || 'Failed to update business profile', 'error');
      }
    } catch (err) {
      showToast('Network error while saving profile', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword.trim()) {
      showToast('New password is required.', 'error');
      return;
    }
    if (newPassword.trim().length < 6) {
      showToast('Password must be at least 6 characters long.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    setCurrentPassword('');
    setIsVerifyPasswordModalOpen(true);
  };

  const handleConfirmResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword.trim()) {
      showToast('Current password is required.', 'error');
      return;
    }

    setIsSubmittingPassword(true);
    try {
      const res = await fetchWithAuth('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          newPassword: encodePasswordPayload(newPassword),
          currentPassword: encodePasswordPayload(currentPassword)
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast('Password updated successfully!', 'success');
        setNewPassword('');
        setConfirmPassword('');
        setCurrentPassword('');
        setIsVerifyPasswordModalOpen(false);
      } else {
        showToast(json.message || json.error || 'Failed to update password.', 'error');
      }
    } catch (err: any) {
      showToast('Network error while resetting password.', 'error');
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const handleOpenBranchModal = (branch?: Branch) => {
    if (branch) {
      setEditingBranch(branch);
      setBranchName(branch.name);
      setAddress(branch.address);
      setCity(branch.city);
      setState(branch.state);
      setPhone(branch.phone);
      setGoogleReviewUrl(branch.googleReviewUrl);
      setTagsInput(branch.serviceTags.join(', '));
    } else {
      setEditingBranch(null);
      setBranchName('');
      setAddress('');
      setCity('');
      setState('');
      setPhone('');
      setGoogleReviewUrl('');
      setTagsInput('Friendly Staff, Gentle Care, Clean Environment, Fast Service');
      
    }
    setIsBranchModalOpen(true);
  };

  const handleSaveBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingBranch(true);
    const serviceTags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

    const payload = {
      businessId: bizId,
      name: branchName,
      address,
      city,
      state,
      zipCode: '94103',
      phone,
      googleReviewUrl,
      serviceTags,
      status: 'ACTIVE' as const,
    };

    try {
      if (editingBranch) {
        const res = await fetchWithAuth(`/api/branches/${editingBranch.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (json.success) {
          showToast('Branch location updated successfully!', 'success');
        } else {
          showToast(json.message || 'Failed to update branch', 'error');
        }
      } else {
        const res = await fetchWithAuth('/api/branches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (json.success) {
          showToast('New branch location added!', 'success');
        } else {
          showToast(json.message || 'Failed to add branch', 'error');
          setIsSubmittingBranch(false);
          return;
        }
      }
      setIsBranchModalOpen(false);
      loadData();
      refetchBusinessData();
    } catch (err) {
      showToast('Error saving branch', 'error');
    } finally {
      setIsSubmittingBranch(false);
    }
  };

  const handleDeleteBranch = async (branchId: string) => {
    if (!confirm('Are you sure you want to delete this branch?')) return;
    try {
      const res = await fetchWithAuth(`/api/branches/${branchId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showToast('Branch deleted successfully', 'info');
        loadData();
        refetchBusinessData();
      } else {
        showToast(json.message || 'Failed to delete branch', 'error');
      }
    } catch (e) {
      showToast('Error deleting branch', 'error');
    }
  };

  const handleUpdateFeedbackStatus = async (feedbackId: string, status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED', ownerNotes?: string) => {
    try {
      const res = await fetchWithAuth(`/api/feedback/${feedbackId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ownerNotes }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`Feedback status changed to ${status}`, 'success');
        loadData();
      }
    } catch (e) {
      showToast('Failed to update feedback status', 'error');
    }
  };

  // Filtered lists
  const filteredReviews = reviews.filter(r => {
    const matchBranch = branchFilter === 'ALL' || r.branchId === branchFilter;
    const matchSearch = r.reviewText.toLowerCase().includes(searchReview.toLowerCase()) ||
                        (r.customerName && r.customerName.toLowerCase().includes(searchReview.toLowerCase()));
    return matchBranch && matchSearch;
  });

  const filteredFeedback = feedbackList.filter(f => {
    const matchBranch = branchFilter === 'ALL' || f.branchId === branchFilter;
    const matchStatus = feedbackStatusFilter === 'ALL' || f.status === feedbackStatusFilter;
    return matchBranch && matchStatus;
  });

  const navItems = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'PROFILE', label: 'Business Profile', icon: Building2 },
    { id: 'BRANCHES', label: 'Branches & QR', icon: Store, badge: branches.length },
    { id: 'HIGHLIGHTS', label: 'Highlights Studio', icon: Sparkles },
    { id: 'REVIEWS', label: 'Reviews History', icon: Star, badge: reviews.length },
    { id: 'FEEDBACK', label: 'Gated Feedback', icon: MessageSquare, badge: feedbackList.filter(f => f.status === 'NEW').length, badgeColor: 'bg-[#EF4444] text-white' },
    { id: 'ANALYTICS', label: 'Scan Analytics', icon: BarChart3 },
    { id: 'SUBSCRIPTION', label: 'Subscription', icon: CreditCard },
    { id: 'SETTINGS', label: 'Security & Settings', icon: Lock },
  ];

  const tabToPath: Record<string, string> = {
    DASHBOARD: 'dashboard',
    PROFILE: 'profile',
    BRANCHES: 'branches',
    HIGHLIGHTS: 'highlights',
    REVIEWS: 'reviews',
    FEEDBACK: 'feedback',
    ANALYTICS: 'analytics',
    SUBSCRIPTION: 'subscription',
    SETTINGS: 'settings',
  };

  useEffect(() => {
    const parts = location.pathname.split('/').filter(Boolean);
    const sub = parts[1] || 'dashboard';
    const mapping: Record<string, any> = {
      dashboard: 'DASHBOARD',
      profile: 'PROFILE',
      branches: 'BRANCHES',
      highlights: 'HIGHLIGHTS',
      reviews: 'REVIEWS',
      feedback: 'FEEDBACK',
      analytics: 'ANALYTICS',
      subscription: 'SUBSCRIPTION',
      settings: 'SETTINGS',
    };
    if (mapping[sub]) setActiveTab(mapping[sub]);
  }, [location.pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const sidebarScrollRef = useLenisSmoothScroll<HTMLDivElement>(true, {
    duration: 1.05,
    wheelMultiplier: 0.9,
    smoothTouch: true,
    touchMultiplier: 1.2,
  });

  const mainScrollRef = useLenisSmoothScroll<HTMLElement>(true, {
    duration: 1.15,
    wheelMultiplier: 1,
    smoothTouch: true,
    touchMultiplier: 1.5,
  });

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full min-h-0 overflow-hidden overflow-x-hidden bg-[#F5F7FB] font-sans">
      {/* Mobile Top Navigation Bar */}
      <div className="md:hidden relative bg-white border-b border-[#DCE3EC] px-4 py-3 flex items-center justify-between z-30 shadow-xs shrink-0">
        <div className="flex items-center space-x-2.5 min-w-0">
          <BusinessLogoOrIcon logoUrl={currentBusiness?.logoUrl} name={currentBusiness?.name} className="w-8 h-8 rounded-xl bg-[#EEF2F7] flex items-center justify-center text-[#2563EB] font-bold border border-[#DCE3EC] shrink-0" iconClassName="w-4 h-4" />
          <span className="font-extrabold text-[#1E293B] text-sm truncate">{currentBusiness?.name || 'Business Portal'}</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-[#EEF2F7] hover:bg-[#DCE3EC]/50 text-[#1E293B] transition-colors border border-[#DCE3EC] shrink-0 min-w-[40px] min-h-[40px] flex items-center justify-center cursor-pointer"
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Overlay Backdrop (md:hidden) */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-slate-900/40"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Left Sidebar Navigation (Desktop & Mobile Drawer) */}
      <aside className={`md:static md:h-full md:translate-x-0 fixed inset-y-0 left-0 z-40 w-64 max-w-[85vw] bg-white border-r border-[#DCE3EC] flex flex-col justify-between transition-transform duration-300 transform shrink-0 overflow-hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div ref={sidebarScrollRef} className="md:p-0 p-0 md:pt-0 pt-0 overflow-y-auto overscroll-contain flex-1 min-h-0">
          <div className="p-4 md:pt-4 pt-[calc(env(safe-area-inset-top)+3.5rem)] space-y-5">
          {/* Business Profile Header Badge */}
          <div className="p-2.5 bg-[#EEF2F7] text-[#1E293B] rounded-xl border border-[#DCE3EC] flex items-center space-x-2.5 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9)]">
            <BusinessLogoOrIcon logoUrl={currentBusiness?.logoUrl} name={currentBusiness?.name} className="w-8 h-8 rounded-lg bg-white text-[#2563EB] flex items-center justify-center font-bold shrink-0 border border-[#DCE3EC] shadow-[1px_1px_3px_rgba(100,116,139,0.06)]" iconClassName="w-4 h-4 text-[#2563EB]" />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-wider block truncate leading-none">
                {currentBusiness?.planName || 'Professional Plan'}
              </span>
              <h2 className="font-bold text-[#1E293B] text-sm truncate mt-1">
                {currentBusiness?.name || 'My Business'}
              </h2>
              <div className="flex items-center space-x-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] shrink-0" />
                <span className="text-[11px] text-[#64748B] font-medium truncate">
                  {branches.length} {branches.length === 1 ? 'Location' : 'Locations'}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                      key={item.id}
                      onClick={() => {
                        const path = tabToPath[item.id as string] || 'dashboard';
                        navigate(`/business/${path}`);
                        setActiveTab(item.id as any);
                        setMobileMenuOpen(false);
                      }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    active
                      ? 'clay-btn-primary'
                      : 'text-[#64748B] hover:text-[#1E293B] hover:bg-[#EEF2F7]'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-[#64748B]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      active ? 'bg-white text-[#2563EB]' : (item.badgeColor || 'bg-[#DCE3EC] text-[#1E293B]')
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
          </div>
        </div>

        {/* Sidebar Footer Quick Action */}
        {branches.length < (stats?.branchLimit || 5) && (
          <div className="p-4 border-t border-[#DCE3EC] bg-[#F5F7FB]">
            <button
              onClick={() => {
                handleOpenBranchModal();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 clay-btn-primary text-xs flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Add Branch Location</span>
            </button>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main ref={mainScrollRef} className="flex-1 min-w-0 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain">
        <div className="p-4 sm:p-6 md:p-8 space-y-6">
        {/* Banner Announcement */}
        {ads.length > 0 && activeTab === 'DASHBOARD' && (
          <div className="space-y-2">
            <div key={currentAdIndex} className="transition-all duration-500 ease-in-out animate-in fade-in-50 zoom-in-98 duration-300">
              <BannerAd ad={ads[currentAdIndex]} />
            </div>
            {ads.length > 1 && (
              <div className="flex items-center justify-end space-x-2 text-xs font-bold text-[#64748B] px-1">
                <span>Announcement {currentAdIndex + 1} of {ads.length}</span>
                <ChevronLeft
                  type="button"
                  onClick={() => setCurrentAdIndex(prev => (prev - 1 + ads.length) % ads.length)}
                  className="w-7 h-7 flex items-center justify-center bg-white border border-[#DCE3EC] rounded-xl hover:bg-[#EEF2F7] cursor-pointer shadow-2xs font-black text-sm"
                  aria-label="Previous announcement"
                >
                  &lt;
                </ChevronLeft>
                <ChevronRight
                  type="button"
                  onClick={() => setCurrentAdIndex(prev => (prev + 1) % ads.length)}
                  className="w-7 h-7 flex items-center justify-center bg-white border border-[#DCE3EC] rounded-xl hover:bg-[#EEF2F7] cursor-pointer shadow-2xs font-black text-sm"
                  aria-label="Next announcement"
                >
                  &gt;
                </ChevronRight>
              </div>
            )}
          </div>
        )}

        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'DASHBOARD' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-extrabold text-[#1E293B] tracking-tight">Business Overview</h1>
                <p className="text-xs text-[#64748B]">Live AI Google review metrics and gatekeeper status</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveTab('PROFILE')}
                  className="px-3.5 py-2 clay-btn-secondary text-xs flex items-center space-x-1.5 cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Edit Profile</span>
                </button>
                {branches.length < (stats?.branchLimit || 5) && (
                  <button
                    onClick={() => handleOpenBranchModal()}
                    className="px-3.5 py-2 clay-btn-primary text-xs flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-white" />
                    <span>Add Branch</span>
                  </button>
                )}
              </div>
            </div>

            {/* Stat Cards Row */}
            {isLoadingData ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Avg Google Rating"
                  value={`★ ${stats?.avgRating || '4.9'}`}
                  subtitle={`${stats?.totalReviews || 0} AI Generated Reviews`}
                  icon={Star}
                  iconBgColor="bg-[#EEF2F7]"
                  iconColor="text-[#2563EB]"
                  badgeText="Top 5% Local Rank"
                />
                <StatCard
                  title="Gated Internal Feedback"
                  value={stats?.totalFeedback || 0}
                  subtitle="Negative reviews caught internally"
                  icon={ShieldAlert}
                  iconBgColor="bg-[#EEF2F7]"
                  iconColor="text-[#EF4444]"
                  badgeText={`${stats?.positivePercentage || 100}% Gatekeeper Score`}
                />
                <StatCard
                  title="Active Branches"
                  value={`${stats?.totalBranches || branches.length} / ${stats?.branchLimit || 5}`}
                  subtitle="Locations equipped with QR"
                  icon={Store}
                  iconBgColor="bg-[#EEF2F7]"
                  iconColor="text-[#2563EB]"
                  badgeText="Plan Quota OK"
                />
                <StatCard
                  title="AI Token Meter"
                  value={`${(stats?.tokensUsed || currentBusiness?.tokensUsedThisMonth || 0).toLocaleString()} Tokens`}
                  subtitle="Monthly Allocation"
                  icon={Sparkles}
                  iconBgColor="bg-[#EEF2F7]"
                  iconColor="text-[#2563EB]"
                  progressValue={stats?.tokensUsed || currentBusiness?.tokensUsedThisMonth || 0}
                  progressMax={stats?.monthlyTokenLimit || currentBusiness?.monthlyTokenLimit || 50000}
                />
              </div>
            )}

            {/* Quick Branches Overview */}
            <div className="clay-card bg-white p-6 border border-[#DCE3EC] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-[#1E293B]">Branch Locations & Tabletop QR Standees</h3>
                  <p className="text-xs text-[#64748B]">Instant AI Google review collection points</p>
                </div>
                <button
                  onClick={() => setActiveTab('BRANCHES')}
                  className="text-xs font-extrabold text-[#2563EB] hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <span>Manage Locations</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {isLoadingData ? (
                <TableSkeleton rows={2} />
              ) : branches.length === 0 ? (
                <EmptyState
                  icon={Store}
                  title="No Branch Locations Yet"
                  description="Add your first branch location to generate customized QR code tabletop standees and start capturing 5-star Google reviews."
                  actionLabel="Add First Branch"
                  onAction={() => handleOpenBranchModal()}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {branches.map(b => (
                    <div key={b.id} className="bg-[#EEF2F7] p-4 rounded-2xl border border-[#DCE3EC] flex flex-col justify-between space-y-3 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9)]">
                      <div>
                        <div className="flex items-start justify-between">
                          <h4 className="font-extrabold text-[#1E293B] text-sm truncate">{b.name}</h4>
                          <span className="inline-flex items-center whitespace-nowrap text-[10px] font-bold text-[#2563EB] bg-white px-2 py-0.5 rounded-full border border-[#DCE3EC] shrink-0">
                            ★ {b.avgRating} ({b.totalReviews})
                          </span>
                        </div>
                        {([b.address, b.city].filter(Boolean).length > 0) && (
                          <p className="text-xs text-[#64748B] mt-1 truncate">
                            {[b.address, b.city].filter(Boolean).join(', ')}
                          </p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-[#DCE3EC] flex items-center justify-between">
                        <button
                          onClick={() => {
                            setSelectedBranchForQR(b);
                            setIsQRModalOpen(true);
                          }}
                          className="px-3 py-1.5 clay-btn-primary text-xs flex items-center space-x-1.5 cursor-pointer"
                        >
                          <QrCode className="w-3.5 h-3.5 text-white" />
                          <span>QR Studio</span>
                        </button>
                        <a
                          href={b.googleReviewUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-[#2563EB] hover:underline flex items-center space-x-1"
                        >
                          <span>Google Page</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Reviews & Gated Feedback Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Positive Reviews */}
              <div className="clay-card bg-white p-6 border border-[#DCE3EC] space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-extrabold text-[#1E293B] flex items-center space-x-2">
                      <Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
                      <span>Recent 5-Star Reviews</span>
                    </h3>
                    <button onClick={() => setActiveTab('REVIEWS')} className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer">
                      View All ({reviews.length}) →
                    </button>
                  </div>

                  {isLoadingData ? (
                    <ReviewsListSkeleton />
                  ) : reviews.length === 0 ? (
                    <EmptyState
                      icon={Star}
                      title="No Google Reviews Yet"
                      description="Once customers scan your branch QR code and approve an AI generated review, it will be posted directly to Google."
                    />
                  ) : (
                    <div className="space-y-3">
                      {reviews.slice(0, 3).map(r => (
                        <div key={r.id} className="p-3.5 bg-[#EEF2F7] rounded-2xl border border-[#DCE3EC] text-xs space-y-2 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9)]">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-[#1E293B]">{r.customerName || 'Happy Customer'}</span>
                            <span className="text-[#F59E0B] font-bold">{'★'.repeat(r.rating)}</span>
                          </div>
                          <p className="text-[#64748B] italic">"{r.reviewText}"</p>
                          <div className="flex items-center justify-between text-[10px] text-[#64748B]">
                            <span>{r.branchName}</span>
                            <span className="text-[#22C55E] font-extrabold">Posted to Google ✓</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Gated Feedback Alerts */}
              <div className="clay-card bg-white p-6 border border-[#DCE3EC] space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-extrabold text-[#1E293B] flex items-center space-x-2">
                      <ShieldAlert className="w-4 h-4 text-[#EF4444]" />
                      <span>Gated Internal Feedbacks (&lt; 4 Stars)</span>
                    </h3>
                    <button onClick={() => setActiveTab('FEEDBACK')} className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer">
                      View Inbox ({feedbackList.length}) →
                    </button>
                  </div>

                  {isLoadingData ? (
                    <ReviewsListSkeleton />
                  ) : feedbackList.length === 0 ? (
                    <EmptyState
                      icon={ShieldAlert}
                      title="No Negative Feedbacks Caught"
                      description="Your Gatekeeper AI protection is active! Any customer rating below 4 stars is automatically redirected here for private resolution."
                    />
                  ) : (
                    <div className="space-y-3">
                      {feedbackList.slice(0, 3).map(f => (
                        <div key={f.id} className="p-3.5 bg-[#EEF2F7] rounded-2xl border border-[#DCE3EC] text-xs space-y-2 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9)]">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-[#1E293B]">{f.customerName} ({f.category})</span>
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border border-[#DCE3EC] ${
                              f.status === 'NEW' ? 'bg-[#EF4444] text-white' : 'bg-white text-[#1E293B]'
                            }`}>
                              {f.status}
                            </span>
                          </div>
                          <p className="text-[#64748B]">"{f.comments}"</p>
                          <div className="flex items-center justify-between text-[10px] text-[#64748B]">
                            <span>{f.customerEmail} | {f.customerPhone || 'No Phone'}</span>
                            <span>{new Date(f.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BUSINESS PROFILE MANAGEMENT */}
        {activeTab === 'PROFILE' && (
          <div className="space-y-6 max-w-5xl mx-auto pb-12">
            {/* Header Section */}
            <div className="clay-card bg-white p-6 md:p-8 border border-[#DCE3EC] flex flex-col md:flex-row items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-extrabold text-[#1E293B] flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EEF2F7] flex items-center justify-center border border-[#DCE3EC]">
                    <Building2 className="w-5 h-5 text-[#2563EB]" />
                  </div>
                  <span>Business Profile</span>
                </h2>
                <p className="text-sm text-[#64748B] mt-2 max-w-2xl leading-relaxed">
                  Update your official business details, working hours, logo, and contact info displayed across customer review pages and tabletop QR stands.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6 relative">
              
              {/* Logo / Media Section */}
              <div className="clay-card bg-white p-6 md:p-8 border border-[#DCE3EC]">
                <h3 className="text-base font-extrabold text-[#1E293B] mb-5 flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-md bg-[#EEF2F7] flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
                  </span>
                  <span>Brand Logo & Media</span>
                </h3>
                <div className="p-6 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                  <BusinessLogoOrIcon logoUrl={profileLogoUrl} name={profileName} className="w-20 h-20 bg-white text-[#2563EB] border border-[#DCE3EC] rounded-2xl flex items-center justify-center font-extrabold text-2xl shrink-0 shadow-sm" iconClassName="w-10 h-10 text-[#2563EB]" />
                  <div className="flex-1 w-full space-y-2.5">
                    <label className="block text-sm font-bold text-[#1E293B]">Business Logo Image URL</label>
                    <input
                      type="url"
                      value={profileLogoUrl}
                      onChange={e => setProfileLogoUrl(e.target.value)}
                      placeholder="https://example.com/logo.png"
                      className="w-full px-4 py-3 text-sm clay-input bg-white"
                    />
                    <p className="text-xs text-[#64748B]">Provide a direct image URL for your business logo. If left blank, a professional business icon is automatically displayed.</p>
                  </div>
                </div>
              </div>

              {/* Grid of details: Basic Info and Contact */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="clay-card bg-white p-6 md:p-8 border border-[#DCE3EC] space-y-5">
                  <h3 className="text-base font-extrabold text-[#1E293B] mb-2 border-b border-[#F1F5F9] pb-4 flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-md bg-[#EEF2F7] flex items-center justify-center">
                      <FileText className="w-3.5 h-3.5 text-[#2563EB]" />
                    </span>
                    <span>Basic Information</span>
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-bold text-[#1E293B] mb-1.5">Business Name <span className="text-[#EF4444]">*</span></label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={e => setProfileName(e.target.value)}
                      className="w-full px-4 py-3 text-sm clay-input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#1E293B] mb-1.5">Business Category / Industry <span className="text-[#EF4444]">*</span></label>
                    <div className="relative">
                      <CategorySearchDropdown
                        value={profileCategory}
                        onChange={setProfileCategory}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-[#1E293B] mb-1.5">Owner Name <span className="text-[#EF4444]">*</span></label>
                    <input
                      type="text"
                      required
                      value={profileOwnerName}
                      onChange={e => setProfileOwnerName(e.target.value)}
                      className="w-full px-4 py-3 text-sm clay-input"
                    />
                  </div>
                </div>

                {/* Contact & Location */}
                <div className="clay-card bg-white p-6 md:p-8 border border-[#DCE3EC] space-y-5">
                  <h3 className="text-base font-extrabold text-[#1E293B] mb-2 border-b border-[#F1F5F9] pb-4 flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-md bg-[#EEF2F7] flex items-center justify-center">
                      <Globe className="w-3.5 h-3.5 text-[#2563EB]" />
                    </span>
                    <span>Contact & Location</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-[#1E293B] mb-1.5">Owner Email <span className="text-[#EF4444]">*</span></label>
                      <input
                        type="email"
                        required
                        value={profileEmail}
                        onChange={e => setProfileEmail(e.target.value)}
                        className="w-full px-4 py-3 text-sm clay-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#1E293B] mb-1.5">Phone Number</label>
                      <input
                        type="tel"
                        pattern="^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$"
                        title="Please enter a valid phone number (e.g., +91 98765 43210)"
                        value={profilePhone}
                        onChange={e => setProfilePhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-3 text-sm clay-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#1E293B] mb-1.5">Google Business Review Link</label>
                    <input
                      type="url"
                      value={profileGoogleReviewUrl}
                      onChange={e => setProfileGoogleReviewUrl(e.target.value)}
                      placeholder="https://search.google.com/local/writereview?placeid=..."
                      className="w-full px-4 py-3 text-sm clay-input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#1E293B] mb-1.5">Website URL</label>
                    <input
                      type="text"
                      value={profileWebsite}
                      onChange={e => setProfileWebsite(e.target.value)}
                      placeholder="www.mybusiness.com"
                      className="w-full px-4 py-3 text-sm clay-input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#1E293B] mb-1.5">Headquarters / Main Address</label>
                    <input
                      type="text"
                      value={profileAddress}
                      onChange={e => setProfileAddress(e.target.value)}
                      placeholder="100 Main Street, Suite 200, San Francisco, CA"
                      className="w-full px-4 py-3 text-sm clay-input"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="clay-card bg-white p-6 md:p-8 border border-[#DCE3EC] space-y-6">
                <div className="border-b border-[#F1F5F9] pb-4">
                  <h3 className="text-base font-extrabold text-[#1E293B] flex items-center space-x-2">
                     <span className="w-6 h-6 rounded-md bg-[#EEF2F7] flex items-center justify-center">
                      <Tag className="w-3.5 h-3.5 text-[#2563EB]" />
                    </span>
                    <span>Additional Details</span>
                  </h3>
                  <p className="text-sm text-[#64748B] mt-2">Extra information that helps configure your AI review assistant and public profile.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 lg:col-span-1">
                    <label className="flex items-center text-sm font-bold text-[#1E293B] mb-2 space-x-2">
                      <Clock className="w-4 h-4 text-[#64748B]" />
                      <span>Working Hours</span>
                    </label>
                    <input
                      type="text"
                      value={profileWorkingHours}
                      onChange={e => setProfileWorkingHours(e.target.value)}
                      placeholder="Mon - Sat: 9:00 AM - 8:00 PM (Sun: Closed)"
                      className="w-full px-4 py-3 text-sm clay-input"
                    />
                    <p className="text-xs text-[#64748B] mt-2">Display your standard operating hours for customers.</p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center text-sm font-bold text-[#1E293B] mb-2 space-x-2">
                      <Sparkle className="w-4 h-4 text-[#64748B]" />
                      <span>Business Description & AI Context</span>
                    </label>
                    <textarea
                      rows={4}
                      value={profileDescription}
                      onChange={e => setProfileDescription(e.target.value)}
                      placeholder="Tell AI about your business background, special services, and core customer promises..."
                      className="w-full px-4 py-3 text-sm clay-input resize-y"
                    />
                    <div className="mt-3 p-3.5 bg-[#EFF6FF] rounded-xl border border-[#BFDBFE] flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm border border-[#DBEAFE]">
                        <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
                      </div>
                      <p className="text-xs text-[#1E3A8A] leading-relaxed">
                        <strong className="text-[#1D4ED8]">AI Context Engine:</strong> This description is strictly used by our AI to generate highly personalized, accurate, and convincing review suggestions for your customers when they scan your QR code. The more detail, the better the AI output!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Footer - Non Sticky */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold rounded-xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:hover:translate-y-0 cursor-pointer"
                >
                  {isSavingProfile && <Loader2 className="w-4 h-4 animate-spin text-white" />}
                  <span>{isSavingProfile ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: HIGHLIGHTS & REVIEW SUGGESTIONS STUDIO */}
        {activeTab === 'HIGHLIGHTS' && (
          <HighlightsStudio branches={branches} onBranchUpdated={loadData} />
        )}

        {/* TAB 4: BRANCH MANAGEMENT & QR STUDIO */}
        {activeTab === 'BRANCHES' && (
          <div className="clay-card bg-white p-6 border border-[#DCE3EC] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold text-[#1E293B]">Branch Locations ({branches.length} / {stats?.branchLimit || 5})</h3>
                <p className="text-xs text-[#64748B]">Manage Google Review links and generate custom QR code tabletop standees</p>
              </div>
              {branches.length < (stats?.branchLimit || 5) && (
                <button
                  onClick={() => handleOpenBranchModal()}
                  className="px-4 py-2.5 clay-btn-primary text-xs flex items-center space-x-1.5 shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-white" />
                  <span>Add New Location</span>
                </button>
              )}
            </div>

            {isLoadingData ? (
              <TableSkeleton rows={3} />
            ) : branches.length === 0 ? (
              <EmptyState
                icon={Store}
                title="No Branch Locations Found"
                description="Add your first branch location to start generating tabletop QR codes and collecting AI Google reviews."
                actionLabel="Create Branch Location"
                onAction={() => handleOpenBranchModal()}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {branches.map(b => (
                  <div key={b.id} className="bg-[#EEF2F7] p-5 rounded-2xl border border-[#DCE3EC] flex flex-col justify-between space-y-4 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9)]">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-extrabold text-[#1E293B] text-base">{b.name}</h4>
                          {([b.address, b.city, b.state].filter(Boolean).length > 0) && (
                            <p className="text-xs text-[#64748B] mt-0.5">
                              {[b.address, b.city, b.state].filter(Boolean).join(', ')}
                            </p>
                          )}
                        </div>
                        <span className="inline-flex items-center whitespace-nowrap text-xs font-extrabold text-[#2563EB] bg-white px-2.5 py-1 rounded-full border border-[#DCE3EC] shrink-0">
                          ★ {b.avgRating}
                        </span>
                      </div>

                      <div className="text-xs text-[#64748B] space-y-1">
                        <p><strong className="text-[#1E293B]">Phone:</strong> {b.phone || 'Not configured'}</p>
                        <p><strong className="text-[#1E293B]">Reviews Collected:</strong> {b.totalReviews}</p>
                      </div>

                      <div>
                        <span className="text-[11px] font-bold text-[#1E293B] block mb-1">Service Tags:</span>
                        <div className="flex flex-wrap gap-1">
                          {b.serviceTags.map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-white text-[#1E293B] border border-[#DCE3EC] rounded-lg text-[10px] font-bold">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#DCE3EC] flex items-center justify-between">
                      <button
                        onClick={() => {
                          setSelectedBranchForQR(b);
                          setIsQRModalOpen(true);
                        }}
                        className="px-3 py-1.5 clay-btn-primary text-xs flex items-center space-x-1 cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5 text-white" />
                        <span>QR Studio</span>
                      </button>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleOpenBranchModal(b)}
                          className="p-1.5 text-[#64748B] hover:text-[#2563EB] transition-colors"
                          title="Edit Location"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBranch(b.id)}
                          className="p-1.5 text-[#64748B] hover:text-[#EF4444] transition-colors"
                          title="Delete Location"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: REVIEWS HISTORY */}
        {activeTab === 'REVIEWS' && (
          <div className="clay-card bg-white p-6 border border-[#DCE3EC] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold text-[#1E293B]">Google Reviews Log</h3>
                <p className="text-xs text-[#64748B]">Log of all AI generated 5-star reviews submitted by customers</p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchReview}
                    onChange={e => setSearchReview(e.target.value)}
                    placeholder="Search reviews..."
                    className="w-full sm:w-auto pl-8 pr-3.5 py-1.5 text-xs clay-input"
                  />
                </div>

                <select
                  value={branchFilter}
                  onChange={e => setBranchFilter(e.target.value)}
                  className="w-full sm:w-auto px-3 py-1.5 text-xs clay-input"
                >
                  <option value="ALL">All Branches</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {isLoadingData ? (
              <ReviewsListSkeleton />
            ) : filteredReviews.length === 0 ? (
              <EmptyState
                icon={Star}
                title="No Reviews Found"
                description={searchReview ? "No reviews match your search filter." : "Once customers scan your tabletop QR code and submit Google reviews, they will appear here."}
              />
            ) : (
              <div className="divide-y divide-[#E8EDF5]">
                {filteredReviews.map(r => (
                  <div key={r.id} className="py-4 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-[#1E293B] text-sm">{r.customerName || 'Anonymous Customer'}</span>
                        <span className="text-[#F59E0B] font-bold text-xs">{'★'.repeat(r.rating)}</span>
                      </div>
                      <span className="text-[11px] text-[#64748B]">{new Date(r.createdAt).toLocaleDateString()}&nbsp; {new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                    </div>

                    <p className="text-xs text-[#1E293B] leading-relaxed font-medium">"{r.reviewText}"</p>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-[#64748B] pt-1 gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="bg-[#EEF2F7] text-[#1E293B] px-2 py-0.5 border border-[#DCE3EC] rounded-md font-bold text-[10px]">{r.branchName}</span>
                        {r.serviceTags.map(t => (
                          <span key={t} className="text-[#2563EB] bg-white px-1.5 py-0.5 border border-[#DCE3EC] rounded-md text-[10px] font-bold">{t}</span>
                        ))}
                      </div>

                      <span className="text-[#22C55E] font-extrabold flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
                        <span>Posted to Google</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: INTERNAL FEEDBACK INBOX */}
        {activeTab === 'FEEDBACK' && (
          <div className="clay-card bg-white p-6 border border-[#DCE3EC] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold text-[#1E293B]">Private Feedback Inbox ({feedbackList.length})</h3>
                <p className="text-xs text-[#64748B]">Customer feedback below 4 stars intercepted and sent privately to management</p>
              </div>

              <div className="w-full sm:w-auto">
                <select
                  value={feedbackStatusFilter}
                  onChange={e => setFeedbackStatusFilter(e.target.value)}
                  className="w-full sm:w-auto px-3 py-1.5 text-xs clay-input"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="NEW">New Alerts</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
              </div>
            </div>

            {isLoadingData ? (
              <ReviewsListSkeleton />
            ) : filteredFeedback.length === 0 ? (
              <EmptyState
                icon={ShieldAlert}
                title="No Private Feedbacks"
                description="Gatekeeper protection is active! Any customer rating under 4 stars will be intercepted here."
              />
            ) : (
              <div className="space-y-4">
                {filteredFeedback.map(f => (
                  <div key={f.id} className="p-4 bg-[#EEF2F7] rounded-2xl border border-[#DCE3EC] text-xs space-y-3 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9)]">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-extrabold text-[#1E293B] text-sm">{f.customerName}</span>
                          <span className="text-white font-bold bg-[#EF4444] px-2 py-0.5 rounded-full text-[10px]">
                            ★ {f.rating} Stars ({f.category})
                          </span>
                        </div>
                        <p className="text-[#64748B] text-[11px] mt-0.5">{f.branchName} • {new Date(f.createdAt).toLocaleDateString()}&nbsp; {new Date(f.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {['NEW', 'IN_PROGRESS', 'RESOLVED'].map(st => (
                          <button
                            key={st}
                            onClick={() => handleUpdateFeedbackStatus(f.id, st as any)}
                            className={`px-2.5 py-1 text-[10px] font-bold rounded-xl transition-all cursor-pointer ${
                              f.status === st
                                ? 'clay-btn-primary'
                                : 'clay-btn-secondary'
                            }`}
                          >
                            {st === 'IN_PROGRESS' ? 'IN PROGRESS' : st}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-[#DCE3EC] font-medium text-[#1E293B]">
                      "{f.comments}"
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-[#64748B] pt-1 text-[11px] gap-2">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center space-x-1"><Mail className="w-3.5 h-3.5 text-[#2563EB]" /><span>{f.customerEmail}</span></span>
                        {f.customerPhone && <span className="flex items-center space-x-1"><Phone className="w-3.5 h-3.5 text-[#2563EB]" /><span>{f.customerPhone}</span></span>}
                      </div>

                      {f.ownerNotes && (
                        <span className="text-[#2563EB] font-bold italic">Owner note: {f.ownerNotes}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 7: SCAN ANALYTICS */}
        {activeTab === 'ANALYTICS' && (
          <div className="clay-card bg-white p-6 border border-[#DCE3EC] space-y-6">
            <div>
              <h3 className="text-lg font-extrabold text-[#1E293B] flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-[#2563EB]" />
                <span>QR Code Scan & Device Analytics</span>
              </h3>
              <p className="text-xs text-[#64748B]">Real-time scan tracking and visitor device statistics across tabletop standees</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 bg-[#EEF2F7] rounded-2xl border border-[#DCE3EC] space-y-1 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9)]">
                <span className="text-xs font-semibold text-[#64748B]">Total QR Scans</span>
                <p className="text-2xl font-extrabold text-[#1E293B]">{qrAnalytics?.totalScans || 0}</p>
                <p className="text-[11px] text-[#2563EB] font-bold">Live Tabletop Engagement</p>
              </div>

              <div className="p-5 bg-[#EEF2F7] rounded-2xl border border-[#DCE3EC] space-y-1 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9)]">
                <span className="text-xs font-semibold text-[#64748B]">Mobile Scans</span>
                <p className="text-2xl font-extrabold text-[#2563EB]">{qrAnalytics?.deviceBreakdown?.Mobile || 0}</p>
                <p className="text-[11px] text-[#64748B] font-medium">iOS & Android Smart Scans</p>
              </div>

              <div className="p-5 bg-[#EEF2F7] rounded-2xl border border-[#DCE3EC] space-y-1 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9)]">
                <span className="text-xs font-semibold text-[#64748B]">Desktop / Web</span>
                <p className="text-2xl font-extrabold text-[#1E293B]">{qrAnalytics?.deviceBreakdown?.Desktop || 0}</p>
                <p className="text-[11px] text-[#64748B] font-medium">Direct Link Visitors</p>
              </div>
            </div>

            <div className="border-t border-[#E8EDF5] pt-4">
              <h4 className="text-sm font-extrabold text-[#1E293B] mb-3">Recent QR Scan Activity</h4>
              {qrAnalytics?.recentScans && qrAnalytics.recentScans.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="clay-table text-left text-xs w-full">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Device</th>
                        <th>Browser</th>
                        <th>Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {qrAnalytics.recentScans.map((s: any) => (
                        <tr key={s.id}>
                          <td className="font-bold text-[#1E293B]">{new Date(s.createdAt).toLocaleString()}</td>
                          <td className="text-[#64748B]">{s.deviceType}</td>
                          <td className="text-[#64748B]">{s.browser}</td>
                          <td className="text-[#64748B]">{s.city}, {s.country}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState
                  icon={BarChart3}
                  title="No Scans Logged Yet"
                  description="When customers scan your tabletop QR standees, device and timestamp tracking logs will display here."
                />
              )}
            </div>
          </div>
        )}

        {/* TAB 8: SUBSCRIPTION & TOKENS */}
        {activeTab === 'SUBSCRIPTION' && (
          <div className="clay-card bg-white p-6 border border-[#DCE3EC] space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-[#1E293B]">Your Subscription & AI Tokens</h3>
                <p className="text-xs text-[#64748B]">Managed by Agency Super Admin</p>
              </div>
              <span className="px-3 py-1 bg-[#EEF2F7] text-[#2563EB] rounded-full border border-[#DCE3EC] text-xs font-extrabold">
                Active Subscription
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 bg-[#EEF2F7] rounded-2xl border border-[#DCE3EC] space-y-2 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9)]">
                <span className="text-xs font-extrabold text-[#2563EB] uppercase tracking-wider">Current Plan</span>
                <h4 className="text-xl font-extrabold text-[#1E293B]">{currentBusiness?.planName || 'Professional Plan'}</h4>
                <p className="text-2xl font-bold text-[#1E293B]">$69 <span className="text-xs font-normal text-[#64748B]">/ month</span></p>
              </div>

              <div className="p-5 bg-[#EEF2F7] rounded-2xl border border-[#DCE3EC] space-y-2 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9)]">
                <span className="text-xs font-extrabold text-[#1E293B] uppercase tracking-wider">Branch Quota</span>
                <h4 className="text-xl font-extrabold text-[#1E293B]">{branches.length} / {currentBusiness?.branchLimit || 5} Locations</h4>
                <p className="text-xs text-[#64748B]">Need additional locations? Request plan upgrade.</p>
              </div>

              <div className="p-5 bg-[#EEF2F7] rounded-2xl border border-[#DCE3EC] space-y-2 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9)]">
                <span className="text-xs font-extrabold text-[#1E293B] uppercase tracking-wider">AI Review Tokens</span>
                <h4 className="text-xl font-extrabold text-[#2563EB]">
                  {(currentBusiness?.tokensUsedThisMonth || 0).toLocaleString()} / {(currentBusiness?.monthlyTokenLimit || 50000).toLocaleString()}
                </h4>
                <p className="text-xs text-[#64748B]">Resets on 1st of every month</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: SETTINGS & SECURITY */}
        {activeTab === 'SETTINGS' && (
          <div className="clay-card bg-white p-6 border border-[#DCE3EC] space-y-6">
            <div>
              <h3 className="text-lg font-extrabold text-[#1E293B] flex items-center space-x-2">
                <Lock className="w-5 h-5 text-[#2563EB]" />
                <span>Account Security & Password Reset</span>
              </h3>
              <p className="text-xs text-[#64748B]">Manage owner credentials and reset your security password</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Info Summary Card */}
              <div className="bg-[#EEF2F7] p-5 rounded-2xl border border-[#DCE3EC] space-y-4 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9)]">
                <h4 className="font-extrabold text-sm text-[#1E293B] border-b border-[#DCE3EC] pb-2">Business Account Information</h4>
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[#64748B] block">Business Name</span>
                    <span className="font-extrabold text-[#1E293B] text-sm">{currentBusiness?.name}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">Owner Name</span>
                    <span className="font-semibold text-[#1E293B]">{currentBusiness?.ownerName}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">Email Address</span>
                    <span className="font-semibold text-[#1E293B]">{currentBusiness?.ownerEmail}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">Category</span>
                    <span className="font-semibold text-[#1E293B]">{currentBusiness?.category || 'General Business'}</span>
                  </div>
                </div>
              </div>

              {/* Password Reset Form */}
              <form onSubmit={handleResetPassword} className="bg-[#EEF2F7] p-5 rounded-2xl border border-[#DCE3EC] space-y-4 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9)]">
                <h4 className="font-extrabold text-sm text-[#1E293B] border-b border-[#DCE3EC] pb-2">Reset Account Password</h4>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#1E293B] mb-1">New Password</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full px-3.5 py-2.5 text-xs clay-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#1E293B] mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full px-3.5 py-2.5 text-xs clay-input"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingPassword}
                  className="w-full py-3 clay-btn-primary text-xs flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingPassword && <Loader2 className="w-4 h-4 animate-spin text-white" />}
                  <span>{isSubmittingPassword ? 'Updating Password...' : 'Reset Password'}</span>
                </button>
              </form>
            </div>
          </div>
        )}
        </div>
      </main>

      {/* ADVANCED QR STUDIO MODAL */}
      <AdvancedQRStudio
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        branch={selectedBranchForQR}
        businessName={currentBusiness?.name}
        logoUrl={currentBusiness?.logoUrl}
        onSaveSuccess={async () => {
          if (bizId) {
            try {
              const res = await fetchWithAuth(`/api/branches?businessId=${bizId}`);
              const json = await res.json();
              if (res.ok && json.success) {
                setBranches(json.data);
                if (selectedBranchForQR) {
                  const updated = json.data.find((b: Branch) => b.id === selectedBranchForQR.id);
                  if (updated) setSelectedBranchForQR(updated);
                }
              }
            } catch (err) {
              console.error('Error reloading branches after QR save:', err);
            }
          }
        }}
      />

      {/* PASSWORD VERIFICATION MODAL */}
      <Modal
  isOpen={isVerifyPasswordModalOpen}
  onClose={() => setIsVerifyPasswordModalOpen(false)}
  title="Verify Current Password"
  subtitle="To update your password, please confirm your identity by entering your current password."
  maxWidth="max-w-md"
>
  <form onSubmit={handleConfirmResetPassword} className="space-y-4">
    <div>
      <label className="block text-xs font-bold text-[#1E293B] mb-1">
        Current Password
      </label>

      <div className="relative">
        <input
          type={showCurrentPassword ? "text" : "password"}
          required
          value={currentPassword}
          onChange={e => setCurrentPassword(e.target.value)}
          placeholder="Enter your current password"
          className="w-full px-3.5 py-2.5 pr-10 text-xs clay-input"
        />

        <button
          type="button"
          onClick={() => setShowCurrentPassword(prev => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#1E293B] cursor-pointer"
          aria-label={showCurrentPassword ? "Hide password" : "Show password"}
        >
          {showCurrentPassword ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>

    <div className="flex space-x-3 pt-2">
      <button
        type="button"
        onClick={() => setIsVerifyPasswordModalOpen(false)}
        className="w-1/2 py-2.5 clay-btn-secondary text-xs cursor-pointer"
      >
        Cancel
      </button>

      <button
        type="submit"
        disabled={isSubmittingPassword}
        className="w-1/2 py-2.5 clay-btn-primary text-xs flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
      >
        {isSubmittingPassword && (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
        )}
        <span>Confirm Reset</span>
      </button>
    </div>
  </form>
</Modal>


      {/* EDIT/ADD BRANCH MODAL */}
      <Modal
        isOpen={isBranchModalOpen}
        onClose={() => setIsBranchModalOpen(false)}
        title={editingBranch ? 'Edit Location Branch' : 'Add New Branch Location'}
        subtitle="Configure location address and Google Review link"
      >
        <form onSubmit={handleSaveBranch} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#1E293B] mb-1">Branch Name <span className="text-[#EF4444]">*</span></label>
            <input
              type="text"
              required
              value={branchName}
              onChange={e => setBranchName(e.target.value)}
              placeholder="e.g., Downtown Dental Care Center"
              className="w-full px-3.5 py-2.5 text-xs clay-input"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E293B] mb-1">Street Address <span className="text-[#EF4444]">*</span></label>
            <input
              type="text"
              required
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="102 5th Avenue, Suite 400"
              className="w-full px-3.5 py-2.5 text-xs clay-input"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1E293B] mb-1">City <span className="text-[#EF4444]">*</span></label>
              <input
                type="text"
                required
                value={city}
                onChange={e => setCity(e.target.value)}
                list="city-list"
                className="w-full px-3.5 py-2.5 text-xs clay-input"
              />
              <datalist id="city-list">
                <option value="Mumbai" />
                <option value="Pune" />
                <option value="Nagpur" />
                <option value="Nashik" />
                <option value="Aurangabad" />
                <option value="Thane" />
                <option value="New Delhi" />
                <option value="Bengaluru" />
                <option value="Hyderabad" />
                <option value="Chennai" />
                <option value="Kolkata" />
                <option value="Ahmedabad" />
                <option value="Surat" />
                <option value="Jaipur" />
                <option value="Lucknow" />
              </datalist>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#1E293B] mb-1">State <span className="text-[#EF4444]">*</span></label>
              <input
                type="text"
                required
                value={state}
                onChange={e => setState(e.target.value)}
                list="state-list"
                className="w-full px-3.5 py-2.5 text-xs clay-input"
              />
              <datalist id="state-list">
                <option value="Maharashtra" />
                <option value="Gujarat" />
                <option value="Karnataka" />
                <option value="Tamil Nadu" />
                <option value="Delhi" />
                <option value="Telangana" />
                <option value="West Bengal" />
                <option value="Uttar Pradesh" />
                <option value="Rajasthan" />
                <option value="Andhra Pradesh" />
                <option value="Kerala" />
                <option value="Madhya Pradesh" />
                <option value="Punjab" />
                <option value="Haryana" />
              </datalist>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#1E293B] mb-1">Phone <span className="text-[#EF4444]">*</span></label>
              <input
                type="tel"
                pattern="^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$"
                title="Please enter a valid phone number (e.g., +91 98765 43210)"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs clay-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E293B] mb-1">Google Review URL <span className="text-[#EF4444]">*</span></label>
            <input
              type="url"
              required
              value={googleReviewUrl}
              onChange={e => setGoogleReviewUrl(e.target.value)}
              placeholder="https://search.google.com/local/writereview?placeid=..."
              className="w-full px-3.5 py-2.5 text-xs clay-input"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E293B] mb-1">Service Tags (Comma Separated)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              placeholder="Friendly Staff, Gentle Care, Clean Environment"
              className="w-full px-3.5 py-2.5 text-xs clay-input"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsBranchModalOpen(false)}
              className="px-4 py-2.5 clay-btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingBranch}
              className="px-4 py-2.5 clay-btn-primary text-xs flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              {isSubmittingBranch && <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />}
              <span>{isSubmittingBranch ? 'Saving Location...' : 'Save Branch'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
