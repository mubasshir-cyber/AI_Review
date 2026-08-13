import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Business, Branch, Review, Feedback, Plan, Advertisement, ApiKeyConfig, SystemSettings } from '../../types';
import { StatCard } from '../components/StatCard';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import { AdvancedQRStudio } from '../components/AdvancedQRStudio';
import { DemoManagementTab } from '../components/DemoManagementTab';
import {
  ShieldCheck, Building2, CreditCard, Sparkles, Megaphone, Key, Sliders,
  Plus, Edit, Trash2, Search, CheckCircle2, DollarSign, Activity, Settings, RefreshCw,
  ArrowLeft, MapPin, Phone, ExternalLink, QrCode, Star, MessageSquare, Tag, Users, ChevronRight, Play, Loader2
} from 'lucide-react';
import { CategorySearchDropdown } from '../components/CategorySearchDropdown';

export const AgencyPortal: React.FC = () => {
  const { fetchWithAuth } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'BUSINESSES' | 'PLANS' | 'ADS' | 'AI_ENGINE' | 'SETTINGS' | 'AGENCY_PROFILE' | 'DEMO'>('DASHBOARD');

  // Data
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [apiKeyConfig, setApiKeyConfig] = useState<ApiKeyConfig>({
    geminiApiKey: '',
    primaryModel: 'gemini-1.5-flash',
    promptTemplate: '',
    temperature: 0.7,
    isCustomKeyActive: true,
    updatedAt: '',
  });
  const [settings, setSettings] = useState<SystemSettings>({
    agencyName: 'Tap Review AI Agency Studio',
    supportEmail: 'support@tapreview.ai',
    googleRedirectDelayMs: 1500,
    minStarForGoogle: 4,
    defaultPrompt: '',
  });

  // Selected Business for Detailed Hierarchy View
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [businessBranches, setBusinessBranches] = useState<Branch[]>([]);
  const [businessReviews, setBusinessReviews] = useState<Review[]>([]);
  const [businessFeedback, setBusinessFeedback] = useState<Feedback[]>([]);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);

  // Reviews Pagination & Sorting
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewSortOrder, setReviewSortOrder] = useState<'desc' | 'asc'>('desc');
  const [feedbackPage, setFeedbackPage] = useState(1);
  const [feedbackSortOrder, setFeedbackSortOrder] = useState<'desc' | 'asc'>('desc');
  const itemsPerPage = 5;

  // Agency Profile state
  const [agencyNameInput, setAgencyNameInput] = useState('Tap Review AI Agency');
  const [agencyCategory, setAgencyCategory] = useState('SaaS & Digital Marketing Agency');
  const [agencyPhone, setAgencyPhone] = useState('+91 99000 88776');
  const [agencyAddress, setAgencyAddress] = useState('500 Tech Park, Suite 100');
  const [agencyCity, setAgencyCity] = useState('Mumbai');
  const [agencyState, setAgencyState] = useState('Maharashtra');
  const [agencyReviewUrl, setAgencyReviewUrl] = useState('https://search.google.com/local/writereview?placeid=ChIJAgencyReviewPlaceId');
  const [agencyLogoUrl, setAgencyLogoUrl] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200');
  const [agencyTagsInput, setAgencyTagsInput] = useState('AI Software Setup, Fast Customer Support, High Marketing ROI, Smooth Onboarding, 5-Star Service');
  const [isSavingAgencyProfile, setIsSavingAgencyProfile] = useState(false);
  const [agencyBranchObj, setAgencyBranchObj] = useState<Branch | null>(null);

  // QR Modal
  const [selectedQrBranch, setSelectedQrBranch] = useState<Branch | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Business Onboard/Edit Modal
  const [isBizModalOpen, setIsBizModalOpen] = useState(false);
  const [editingBiz, setEditingBiz] = useState<Business | null>(null);
  const [bizName, setBizName] = useState('');
  const [bizCategory, setBizCategory] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [planId, setPlanId] = useState('plan-pro');
  const [branchLimit, setBranchLimit] = useState(5);
  const [monthlyTokens, setMonthlyTokens] = useState(50000);
  const [bizModalError, setBizModalError] = useState('');

  // Add Branch Modal
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [branchName, setBranchName] = useState('');
  const [branchCity, setBranchCity] = useState('');
  const [branchState, setBranchState] = useState('');
  const [branchAddress, setBranchAddress] = useState('');
  const [branchPhone, setBranchPhone] = useState('');
  const [googlePlaceId, setGooglePlaceId] = useState('');
  const [googleReviewUrl, setGoogleReviewUrl] = useState('');
  const [branchServiceTags, setBranchServiceTags] = useState('');

  // Ad Banner Modal
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [adTitle, setAdTitle] = useState('');
  const [adDesc, setAdDesc] = useState('');
  const [adCtaText, setAdCtaText] = useState('');
  const [adCtaLink, setAdCtaLink] = useState('');
  const [adBgColor, setAdBgColor] = useState('bg-black');

  const loadAgencyData = async () => {
    try {
      const [bizRes, plansRes, adsRes, statsRes, aiRes, sysRes] = await Promise.all([
        fetchWithAuth('/api/businesses').then(r => r.json()),
        fetchWithAuth('/api/plans').then(r => r.json()),
        fetchWithAuth('/api/ads').then(r => r.json()),
        fetchWithAuth('/api/analytics/agency').then(r => r.json()),
        fetchWithAuth('/api/settings/config').then(r => r.json()),
        fetchWithAuth('/api/settings/system').then(r => r.json()),
      ]);

      if (bizRes.success) setBusinesses(bizRes.data || []);
      if (plansRes.success) setPlans(plansRes.data || []);
      if (adsRes.success) setAds(adsRes.data || []);
      if (statsRes.success) setStats(statsRes.data || null);
      if (aiRes.success && aiRes.data) setApiKeyConfig(aiRes.data);
      if (sysRes.success && sysRes.data) setSettings(sysRes.data);
    } catch (e) {
      console.error('Error loading agency portal data:', e);
    }
  };

  useEffect(() => {
    loadAgencyData();
  }, []);

  const loadAgencyProfileData = async () => {
    try {
      const [bizRes, brRes] = await Promise.all([
        fetch('/api/businesses/biz-agency').then(r => r.json()),
        fetch('/api/branches?businessId=biz-agency').then(r => r.json()),
      ]);

      if (bizRes.success && bizRes.data) {
        setAgencyNameInput(bizRes.data.name || agencyNameInput);
        setAgencyCategory(bizRes.data.category || agencyCategory);
        if (bizRes.data.logoUrl) setAgencyLogoUrl(bizRes.data.logoUrl);
      }

      if (brRes.success && brRes.data && brRes.data.length > 0) {
        const branch = brRes.data[0];
        setAgencyBranchObj(branch);
        setAgencyAddress(branch.address || agencyAddress);
        setAgencyCity(branch.city || agencyCity);
        setAgencyState(branch.state || agencyState);
        setAgencyPhone(branch.phone || agencyPhone);
        setAgencyReviewUrl(branch.googleReviewUrl || agencyReviewUrl);
        if (branch.serviceTags) setAgencyTagsInput(branch.serviceTags.join(', '));
      } else {
        setAgencyBranchObj({
          id: 'branch-agency-main',
          businessId: 'biz-agency',
          name: 'Agency Headquarters',
          address: agencyAddress,
          city: agencyCity,
          state: agencyState,
          zipCode: '400051',
          phone: agencyPhone,
          googleReviewUrl: agencyReviewUrl,
          serviceTags: agencyTagsInput.split(',').map(t => t.trim()),
          totalReviews: 96,
          avgRating: 4.98,
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.error('Error loading agency profile details:', e);
    }
  };

  useEffect(() => {
    if (activeTab === 'AGENCY_PROFILE') {
      loadAgencyProfileData();
    }
  }, [activeTab]);

  const loadBusinessDetails = async (biz: Business) => {
    setSelectedBusiness(biz);
    setIsLoadingDetail(true);
    try {
      const [brRes, revRes, fbRes] = await Promise.all([
        fetchWithAuth(`/api/branches?businessId=${biz.id}`).then(r => r.json()),
        fetchWithAuth(`/api/reviews?businessId=${biz.id}`).then(r => r.json()),
        fetchWithAuth(`/api/feedback?businessId=${biz.id}`).then(r => r.json()),
      ]);

      if (brRes.success) setBusinessBranches(brRes.data || []);
      if (revRes.success) setBusinessReviews(revRes.data || []);
      if (fbRes.success) setBusinessFeedback(fbRes.data || []);
    } catch (e) {
      console.error('Error fetching business detail hierarchy:', e);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleSaveAgencyProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAgencyProfile(true);

    const tags = agencyTagsInput.split(',').map(t => t.trim()).filter(Boolean);

    try {
      await fetch('/api/businesses/biz-agency', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'biz-agency',
          name: agencyNameInput,
          ownerId: 'user-admin-1',
          ownerName: 'Agency Super Admin',
          ownerEmail: 'admin@agency.com',
          logoUrl: agencyLogoUrl,
          category: agencyCategory,
          planId: 'plan-enterprise',
          planName: 'Enterprise Agency Plan',
          branchLimit: 50,
          monthlyTokenLimit: 500000,
          status: 'ACTIVE',
        }),
      });

      const branchPayload = {
        id: 'branch-agency-main',
        businessId: 'biz-agency',
        name: 'Agency Headquarters',
        address: agencyAddress,
        city: agencyCity,
        state: agencyState,
        zipCode: '400051',
        phone: agencyPhone,
        googleReviewUrl: agencyReviewUrl,
        serviceTags: tags,
        status: 'ACTIVE' as const,
      };

      await fetch('/api/branches/branch-agency-main', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(branchPayload),
      });

      showToast('Agency Business Profile updated successfully!');
      loadAgencyProfileData();
    } catch (e) {
      console.error('Error saving agency profile:', e);
      showToast('Failed to save profile.', 'error');
    } finally {
      setIsSavingAgencyProfile(false);
    }
  };

  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setBizModalError('');

    if (!bizName.trim()) { setBizModalError('Business Name is required.'); return; }
    if (!ownerName.trim()) { setBizModalError('Owner Name is required.'); return; }
    if (!ownerEmail.trim()) { setBizModalError('Owner Email is required.'); return; }

    if (!editingBiz) {
      if (!ownerPassword.trim()) { setBizModalError('Password is required.'); return; }
      if (ownerPassword.length < 6) { setBizModalError('Password must be 6+ chars.'); return; }
      if (ownerPassword !== confirmPassword) { setBizModalError('Passwords do not match.'); return; }
    }

    const payload = {
      name: bizName.trim(),
      category: bizCategory.trim(),
      ownerName: ownerName.trim(),
      ownerEmail: ownerEmail.trim(),
      password: ownerPassword.trim(),
      planId,
      branchLimit,
      monthlyTokenLimit: monthlyTokens,
    };

    try {
      const res = editingBiz
        ? await fetchWithAuth(`/api/businesses/${editingBiz.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        : await fetchWithAuth('/api/businesses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setBizModalError(json.message || json.error || 'Failed to save business.');
        return;
      }

      setIsBizModalOpen(false);
      loadAgencyData();
      showToast(editingBiz ? 'Business updated!' : 'New business onboarded successfully!');
    } catch (err) {
      setBizModalError('Network or server error while saving business account.');
    }
  };

  const handleDeleteBusiness = async (bizId: string) => {
    if (!confirm('Delete business and all branches/reviews?')) return;
    try {
      const res = await fetchWithAuth(`/api/businesses/${bizId}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok && json.success) {
        setSelectedBusiness(null);
        loadAgencyData();
        showToast('Business deleted');
      } else {
        alert(json.message || 'Failed to delete business');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBusiness) return;

    try {
      const res = await fetchWithAuth('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: selectedBusiness.id,
          name: branchName,
          city: branchCity,
          state: branchState,
          address: branchAddress,
          phone: branchPhone,
          googlePlaceId: googlePlaceId || 'ChIJN1t_tDeuEmsRUsoyG83frY4',
          googleReviewUrl: googleReviewUrl || 'https://maps.google.com',
          serviceTags: branchServiceTags ? branchServiceTags.split(',').map(s => s.trim()) : ['Friendly Staff', 'Gentle Care', 'Clean Environment', 'Quick Service'],
        }),
      });

      if (res.ok) {
        setIsBranchModalOpen(false);
        setBranchName('');
        setBranchCity('');
        setBranchState('');
        setBranchAddress('');
        setBranchPhone('');
        setGooglePlaceId('');
        setGoogleReviewUrl('');
        setBranchServiceTags('');
        loadBusinessDetails(selectedBusiness);
        loadAgencyData();
        showToast('Branch added!');
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to add branch');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteBranch = async (branchId: string) => {
    if (!confirm('Are you sure you want to delete this branch?')) return;
    try {
      await fetchWithAuth(`/api/branches/${branchId}`, { method: 'DELETE' });
      if (selectedBusiness) loadBusinessDetails(selectedBusiness);
      loadAgencyData();
      showToast('Branch deleted');
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveAd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchWithAuth('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: adTitle,
          description: adDesc,
          ctaText: adCtaText,
          ctaLink: adCtaLink,
          bannerBgColor: 'bg-black',
          status: 'ACTIVE',
        }),
      });
      setIsAdModalOpen(false);
      loadAgencyData();
      showToast('Ad banner published!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAd = async (adId: string) => {
    if (!confirm('Delete advertisement?')) return;
    try {
      await fetchWithAuth(`/api/ads/${adId}`, { method: 'DELETE' });
      loadAgencyData();
      showToast('Ad deleted');
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveAiConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchWithAuth('/api/settings/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiKeyConfig),
      });
      showToast('AI Engine settings saved!');
      loadAgencyData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchWithAuth('/api/settings/system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      showToast('System Settings saved!');
      loadAgencyData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-57px)] bg-[#F5F7FB] font-sans">
      {/* Left Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-[#DCE3EC] shrink-0 flex flex-col justify-between">
        <div className="p-4 space-y-5">
          {/* Agency Admin Profile Badge */}
          <div className="p-3.5 bg-[#EEF2F7] text-[#1E293B] rounded-2xl border border-[#DCE3EC] space-y-1.5 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9)]">
            <div className="flex items-center space-x-1.5 text-[#2563EB] font-extrabold text-[10px] uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Agency Super Admin</span>
            </div>
            <h2 className="font-extrabold text-sm truncate text-[#1E293B]">{settings?.agencyName || 'Tap Review AI Agency'}</h2>
            <div className="flex items-center space-x-1.5 pt-0.5">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
              <span className="text-[10px] text-[#64748B] font-bold">Live Database Sync</span>
            </div>
          </div>

          {/* Sidebar Menu Items */}
          <nav className="space-y-1">
            {[
              { id: 'DASHBOARD', label: 'Platform Overview', icon: Activity },
              { id: 'BUSINESSES', label: 'Businesses & Hierarchy', icon: Building2 },
              { id: 'AGENCY_PROFILE', label: 'Agency Profile & Scanner', icon: QrCode },
              { id: 'DEMO', label: 'Demo Management', icon: Play },
              { id: 'PLANS', label: 'SaaS Plans', icon: CreditCard },
              { id: 'ADS', label: 'Ad Banners', icon: Megaphone },
              { id: 'AI_ENGINE', label: 'AI Engine & Prompt', icon: Sparkles },
              { id: 'SETTINGS', label: 'Agency Settings', icon: Settings },
            ].map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id && !selectedBusiness;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setSelectedBusiness(null);
                    setActiveTab(tab.id as any);
                  }}
                  className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    active
                      ? 'clay-btn-primary'
                      : 'text-[#64748B] hover:text-[#1E293B] hover:bg-[#EEF2F7]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-[#64748B]'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Action */}
        <div className="p-4 border-t border-[#DCE3EC] bg-[#F5F7FB]">
          <button
            onClick={() => {
              setEditingBiz(null);
              setBizName('');
              setBizCategory('');
              setOwnerName('');
              setOwnerEmail('');
              setOwnerPassword('');
              setPlanId('plan-pro');
              setBranchLimit(5);
              setMonthlyTokens(50000);
              setIsBizModalOpen(true);
            }}
            className="w-full py-2.5 clay-btn-primary text-xs flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Onboard Business</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 space-y-6">

      {/* DETAILED BUSINESS HIERARCHY VIEW */}
      {selectedBusiness ? (
        <div className="space-y-6">
          {/* Breadcrumb Header */}
          <div className="clay-card bg-white p-6 border border-[#DCE3EC] space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E8EDF5]">
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setSelectedBusiness(null)}
                  className="inline-flex items-center space-x-1.5 text-xs font-extrabold text-[#2563EB] hover:underline transition-colors mb-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Master Business List</span>
                </button>
                <div className="flex items-center space-x-3">
                  <h2 className="text-2xl font-extrabold text-[#1E293B] tracking-tight">{selectedBusiness.name}</h2>
                  <span className="px-2.5 py-1 bg-[#EEF2F7] text-[#2563EB] font-extrabold text-xs rounded-full border border-[#DCE3EC]">
                    {selectedBusiness.planName || 'Pro Plan'}
                  </span>
                  <span className="px-2.5 py-1 bg-[#22C55E]/10 text-[#22C55E] font-bold text-xs rounded-full border border-[#22C55E]/20">
                    {selectedBusiness.status}
                  </span>
                </div>
                <p className="text-xs text-[#64748B]">
                  Business Owner: <strong className="text-[#1E293B]">{selectedBusiness.ownerName}</strong> ({selectedBusiness.ownerEmail}) • Category: {selectedBusiness.category}
                </p>
              </div>

              <div className="flex items-center gap-3 flex-nowrap">
                <button
                  type="button"
                  onClick={() => {
                    setBranchName('');
                    setBranchCity('');
                    setBranchState('');
                    setBranchAddress('');
                    setBranchPhone('');
                    setGooglePlaceId('');
                    setGoogleReviewUrl('');
                    setBranchServiceTags('');
                    setIsBranchModalOpen(true);
                  }}
                  className="px-4 py-2 bg-[#2563EB] text-white rounded-xl shadow-sm hover:bg-[#1f4fc4] flex items-center space-x-2 text-sm font-semibold"
                >
                  <Plus className="w-4 h-4 text-white" />
                  <span>Add Branch Location</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingBiz(selectedBusiness);
                    setBizName(selectedBusiness.name);
                    setBizCategory(selectedBusiness.category || '');
                    setOwnerName(selectedBusiness.ownerName);
                    setOwnerEmail(selectedBusiness.ownerEmail);
                    setOwnerPassword('');
                    setConfirmPassword('');
                    setPlanId(selectedBusiness.planId);
                    setBranchLimit(selectedBusiness.branchLimit);
                    setMonthlyTokens(selectedBusiness.monthlyTokenLimit);
                    setIsBizModalOpen(true);
                  }}
                  className="px-4 py-2 bg-white border border-[#DCE3EC] rounded-xl text-[#1E293B] hover:bg-[#F7F9FC] flex items-center space-x-2 text-sm font-semibold"
                >
                  <Edit className="w-3.5 h-3.5 text-[#1E293B]" />
                  <span>Edit Business</span>
                </button>
                <button
                  onClick={() => handleDeleteBusiness(selectedBusiness.id)}
                  className="px-4 py-2 bg-white border border-[#FEE2E2] text-[#EF4444] hover:bg-[#EF4444] hover:text-white rounded-xl flex items-center space-x-2 text-sm font-semibold shadow-sm transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Business</span>
                </button>
              </div>
            </div>

            {/* Business Stat Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-[#EEF2F7] rounded-2xl border border-[#DCE3EC] shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9)]">
                <p className="text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider">Branch Quota</p>
                <p className="text-2xl font-extrabold text-[#1E293B] mt-1">
                  {businessBranches.length} <span className="text-xs text-[#64748B] font-normal">/ {selectedBusiness.branchLimit} max</span>
                </p>
                <p className="text-[10px] text-[#64748B] mt-1">Active registered locations</p>
              </div>

              <div className="p-4 bg-[#EEF2F7] rounded-2xl border border-[#DCE3EC] shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9)]">
                <p className="text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider">AI Token Limit</p>
                <p className="text-2xl font-extrabold text-[#2563EB] mt-1 font-mono">
                  {selectedBusiness.tokensUsedThisMonth.toLocaleString()}
                </p>
                <div className="w-full bg-[#DCE3EC] h-2 mt-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#2563EB] h-full rounded-full"
                    style={{
                      width: `${Math.min(100, (selectedBusiness.tokensUsedThisMonth / selectedBusiness.monthlyTokenLimit) * 100)}%`,
                    }}
                  />
                </div>
                <p className="text-[10px] text-[#64748B] mt-1">
                  Limit: {selectedBusiness.monthlyTokenLimit.toLocaleString()} tokens/mo
                </p>
              </div>

              <div className="p-4 bg-[#EEF2F7] rounded-2xl border border-[#DCE3EC] shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9)]">
                <p className="text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider">Public Google Reviews</p>
                <p className="text-2xl font-extrabold text-[#1E293B] mt-1">
                  {businessReviews.length}
                </p>
                <p className="text-[10px] text-[#64748B] mt-1">5-star AI generated redirects</p>
              </div>

              <div className="p-4 bg-[#EEF2F7] rounded-2xl border border-[#DCE3EC] shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9)]">
                <p className="text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider">Internal Private Feedback</p>
                <p className="text-2xl font-extrabold text-[#1E293B] mt-1">
                  {businessFeedback.length}
                </p>
                <p className="text-[10px] text-[#64748B] mt-1">Intercepted & protected ratings</p>
              </div>
            </div>
          </div>

          {/* LISTED BRANCHES HIERARCHY */}
          <div className="clay-card bg-white p-6 border border-[#DCE3EC] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-[#1E293B] flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-[#2563EB]" />
                  <span>Listed Branches under {selectedBusiness.name} ({businessBranches.length})</span>
                </h3>
                <p className="text-xs text-[#64748B]">
                  Each branch has its own Google Place ID, QR code generator, and review suggestion highlights.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setBranchName('');
                  setBranchCity('');
                  setBranchAddress('');
                  setBranchPhone('');
                  setGooglePlaceId('ChIJN1t_tDeuEmsRUsoyG83frY4');
                  setGoogleReviewUrl('https://maps.google.com');
                  setIsBranchModalOpen(true);
                }}
                className="px-3.5 py-1.5 clay-btn-primary text-xs flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-white" />
                <span>Add Branch</span>
              </button>
            </div>

            {isLoadingDetail ? (
              <div className="p-8 text-center text-xs text-[#64748B] font-bold">Loading branch hierarchy...</div>
            ) : businessBranches.length === 0 ? (
              <div className="p-8 bg-[#EEF2F7] rounded-2xl border border-[#DCE3EC] text-center space-y-3">
                <Building2 className="w-10 h-10 text-[#2563EB] mx-auto" />
                <p className="text-xs font-extrabold text-[#1E293B]">No Branches Configured for this Business</p>
                <p className="text-[11px] text-[#64748B] max-w-sm mx-auto">
                  Click the "Add Branch Location" button above to add a new physical store, clinic, or location.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {businessBranches.map(branch => (
                  <div
                    key={branch.id}
                    className="bg-[#EEF2F7] p-5 rounded-2xl border border-[#DCE3EC] space-y-4 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9)]"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-extrabold text-[#1E293B] text-base flex items-center space-x-2">
                          <span>{branch.name}</span>
                          <span className="text-[10px] bg-white text-[#1E293B] font-bold px-2 py-0.5 rounded-md border border-[#DCE3EC]">
                            {branch.city}
                          </span>
                        </h4>
                        <p className="text-xs text-[#64748B] flex items-center space-x-1 mt-0.5 font-medium">
                          <MapPin className="w-3 h-3 text-[#2563EB] shrink-0" />
                          <span>{branch.address}</span>
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedQrBranch(branch);
                          setIsQrModalOpen(true);
                        }}
                        className="px-3 py-1.5 clay-btn-primary text-xs flex items-center space-x-1.5 cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5 text-white" />
                        <span>QR Code</span>
                      </button>
                    </div>

                    {/* Branch Metadata */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-xl border border-[#DCE3EC]">
                      <div>
                        <span className="text-[10px] font-bold text-[#64748B] uppercase block">Phone</span>
                        <span className="font-bold text-[#1E293B]">{branch.phone || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-[#64748B] uppercase block">Rating</span>
                        <span className="font-bold text-[#F59E0B] flex items-center space-x-1">
                          <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B] inline" />
                          <span>{branch.avgRating || 5.0} ({branch.totalReviews || 0} reviews)</span>
                        </span>
                      </div>
                    </div>

                    {/* Highlights / Suggestions Configured for Customer Portal */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-extrabold text-[#1E293B] uppercase tracking-wider flex items-center space-x-1">
                        <Tag className="w-3 h-3 text-[#2563EB]" />
                        <span>Customer Review Highlights ({branch.serviceTags?.length || 0})</span>
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {(branch.serviceTags || ['Friendly Staff', 'Gentle Care', 'Clean Environment']).map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="bg-white text-[#1E293B] font-bold text-[10px] px-2 py-0.5 border border-[#DCE3EC] rounded-md"
                          >
                            + {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Links & Delete */}
                    <div className="pt-2 border-t border-[#DCE3EC] flex items-center justify-between text-xs">
                      <a
                        href={branch.googleReviewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#2563EB] hover:underline flex items-center space-x-1 text-[11px] font-bold"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Google Review Link</span>
                      </a>

                      <button
                        onClick={() => handleDeleteBranch(branch.id)}
                        className="text-[#EF4444] hover:underline text-xs font-bold flex items-center space-x-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Branch</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* REVIEWS & FEEDBACK HISTORY FOR THIS BUSINESS */}
          {(() => {
            // Computed state for reviews
            const sortedReviews = [...businessReviews].sort((a, b) => {
              const dateA = new Date(a.createdAt).getTime();
              const dateB = new Date(b.createdAt).getTime();
              return reviewSortOrder === 'desc' ? dateB - dateA : dateA - dateB;
            });
            const totalReviewPages = Math.ceil(sortedReviews.length / itemsPerPage);
            const paginatedReviews = sortedReviews.slice((reviewPage - 1) * itemsPerPage, reviewPage * itemsPerPage);

            // Computed state for feedback
            const sortedFeedback = [...businessFeedback].sort((a, b) => {
              const dateA = new Date(a.createdAt).getTime();
              const dateB = new Date(b.createdAt).getTime();
              return feedbackSortOrder === 'desc' ? dateB - dateA : dateA - dateB;
            });
            const totalFeedbackPages = Math.ceil(sortedFeedback.length / itemsPerPage);
            const paginatedFeedback = sortedFeedback.slice((feedbackPage - 1) * itemsPerPage, feedbackPage * itemsPerPage);

            return (
              <div className="clay-card bg-white p-6 border border-[#DCE3EC] space-y-4">
                <h3 className="text-base font-extrabold text-[#1E293B]">Customer Review Submissions & Intercepted Feedback</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Google 5-Star Reviews */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#E8EDF5]">
                      <span className="text-xs font-extrabold text-[#1E293B] uppercase tracking-wider flex items-center space-x-1.5">
                        <Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
                        <span>Public Google Reviews ({businessReviews.length})</span>
                      </span>
                      <select
                        value={reviewSortOrder}
                        onChange={(e) => {
                          setReviewSortOrder(e.target.value as 'desc' | 'asc');
                          setReviewPage(1); // Reset page on sort change
                        }}
                        className="px-2 py-1 text-xs border border-[#DCE3EC] rounded-lg bg-[#EEF2F7] text-[#1E293B] font-bold focus:outline-none"
                      >
                        <option value="desc">Newest First</option>
                        <option value="asc">Oldest First</option>
                      </select>
                    </div>

                    <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                      {businessReviews.length === 0 ? (
                        <p className="text-xs text-[#64748B] italic p-3 bg-[#EEF2F7] rounded-xl border border-[#DCE3EC]">No public Google reviews logged yet.</p>
                      ) : (
                        paginatedReviews.map(r => (
                          <div key={r.id} className="p-3 bg-[#EEF2F7] rounded-xl border border-[#DCE3EC] space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-xs text-[#1E293B]">{r.customerName}</span>
                              <span className="text-[#F59E0B] font-bold text-xs">★ {r.rating}</span>
                            </div>
                            <p className="text-xs text-[#1E293B] italic">"{r.reviewText}"</p>
                            <span className="text-[9px] text-[#64748B] block">{new Date(r.createdAt).toLocaleDateString()}</span>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Pagination Controls for Reviews */}
                    {totalReviewPages > 1 && (
                      <div className="flex items-center justify-between pt-2">
                        <button
                          disabled={reviewPage === 1}
                          onClick={() => setReviewPage(prev => Math.max(1, prev - 1))}
                          className="px-3 py-1.5 text-xs font-bold text-[#1E293B] bg-[#EEF2F7] rounded-lg disabled:opacity-50"
                        >
                          Previous
                        </button>
                        <span className="text-xs font-bold text-[#64748B]">Page {reviewPage} of {totalReviewPages}</span>
                        <button
                          disabled={reviewPage === totalReviewPages}
                          onClick={() => setReviewPage(prev => Math.min(totalReviewPages, prev + 1))}
                          className="px-3 py-1.5 text-xs font-bold text-[#1E293B] bg-[#EEF2F7] rounded-lg disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Private Internal Feedback */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#E8EDF5]">
                      <span className="text-xs font-extrabold text-[#1E293B] uppercase tracking-wider flex items-center space-x-1.5">
                        <MessageSquare className="w-4 h-4 text-[#EF4444]" />
                        <span>Intercepted Feedback ({businessFeedback.length})</span>
                      </span>
                      <select
                        value={feedbackSortOrder}
                        onChange={(e) => {
                          setFeedbackSortOrder(e.target.value as 'desc' | 'asc');
                          setFeedbackPage(1); // Reset page on sort change
                        }}
                        className="px-2 py-1 text-xs border border-[#DCE3EC] rounded-lg bg-[#EEF2F7] text-[#1E293B] font-bold focus:outline-none"
                      >
                        <option value="desc">Newest First</option>
                        <option value="asc">Oldest First</option>
                      </select>
                    </div>

                    <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                      {businessFeedback.length === 0 ? (
                        <p className="text-xs text-[#64748B] italic p-3 bg-[#EEF2F7] rounded-xl border border-[#DCE3EC]">No low-rating feedback intercepted yet.</p>
                      ) : (
                        paginatedFeedback.map(f => (
                          <div key={f.id} className="p-3 bg-[#EEF2F7] rounded-xl border border-[#DCE3EC] space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-xs text-[#1E293B]">{f.customerName} ({f.customerPhone || f.customerEmail})</span>
                              <span className="text-white font-bold text-[10px] bg-[#EF4444] px-1.5 py-0.5 rounded-full">★ {f.rating}</span>
                            </div>
                            <p className="text-xs text-[#1E293B]">"{f.comments}"</p>
                            <span className="text-[9px] text-[#64748B] block">{new Date(f.createdAt).toLocaleDateString()}</span>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Pagination Controls for Feedback */}
                    {totalFeedbackPages > 1 && (
                      <div className="flex items-center justify-between pt-2">
                        <button
                          disabled={feedbackPage === 1}
                          onClick={() => setFeedbackPage(prev => Math.max(1, prev - 1))}
                          className="px-3 py-1.5 text-xs font-bold text-[#1E293B] bg-[#EEF2F7] rounded-lg disabled:opacity-50"
                        >
                          Previous
                        </button>
                        <span className="text-xs font-bold text-[#64748B]">Page {feedbackPage} of {totalFeedbackPages}</span>
                        <button
                          disabled={feedbackPage === totalFeedbackPages}
                          onClick={() => setFeedbackPage(prev => Math.min(totalFeedbackPages, prev + 1))}
                          className="px-3 py-1.5 text-xs font-bold text-[#1E293B] bg-[#EEF2F7] rounded-lg disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      ) : (
        <>
          {/* TAB 1: PLATFORM STATS */}
          {activeTab === 'DASHBOARD' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Total Client Businesses"
                  value={stats?.totalBusinesses || 0}
                  subtitle="Active SaaS Subscriptions"
                  icon={Building2}
                  iconBgColor="bg-[#EEF2F7]"
                  iconColor="text-[#2563EB]"
                  badgeText="100% Active"
                />
                <StatCard
                  title="Total Branch Locations"
                  value={stats?.totalBranches || 0}
                  subtitle="Equipped with QR Codes"
                  icon={Building2}
                  iconBgColor="bg-[#EEF2F7]"
                  iconColor="text-[#2563EB]"
                />
                <StatCard
                  title="Total Reviews Generated"
                  value={stats?.totalReviews || 0}
                  subtitle="AI 5-Star Google Reviews"
                  icon={Sparkles}
                  iconBgColor="bg-[#EEF2F7]"
                  iconColor="text-[#2563EB]"
                />
                <StatCard
                  title="Monthly SaaS Revenue"
                  value={`$${stats?.monthlyRevenue || 297}`}
                  subtitle="Recurring Billing"
                  icon={DollarSign}
                  iconBgColor="bg-[#EEF2F7]"
                  iconColor="text-[#22C55E]"
                  badgeText="MRR Growth +18%"
                />
              </div>

              {/* Master Business List with Hierarchy Click */}
              <div className="clay-card bg-white p-6 border border-[#DCE3EC] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-[#1E293B]">Onboarded SaaS Businesses</h3>
                    <p className="text-xs text-[#64748B]">Click any business row to inspect its branches, QR codes, and review activity.</p>
                  </div>
                  <span className="text-xs font-extrabold text-[#2563EB] bg-[#EEF2F7] px-3 py-1 rounded-full border border-[#DCE3EC]">
                    {businesses.length} Businesses Registered
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="clay-table text-left text-xs w-full">
                    <thead>
                      <tr>
                        <th>Business Name</th>
                        <th>Owner Contact</th>
                        <th>SaaS Plan</th>
                        <th>Branch Quota</th>
                        <th>Monthly Tokens Used</th>
                        <th>Status</th>
                        <th className="text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {businesses.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-4">
                            <EmptyState title="No Data" description="No business records found in database" />
                          </td>
                        </tr>
                      ) : (
                        businesses.map(b => (
                          <tr
                            key={b.id}
                            onClick={() => loadBusinessDetails(b)}
                            className="cursor-pointer group"
                          >
                            <td className="font-extrabold text-[#1E293B] group-hover:text-[#2563EB] flex items-center space-x-2">
                              <span>{b.name}</span>
                              <ChevronRight className="w-3.5 h-3.5 text-[#64748B] group-hover:text-[#2563EB]" />
                            </td>
                            <td className="text-[#64748B]">{b.ownerName} ({b.ownerEmail})</td>
                            <td>
                              <span className="inline-block max-w-[10rem] px-2 py-0.5 bg-[#EEF2F7] text-[#1E293B] font-bold text-[10px] rounded-md border border-[#DCE3EC] truncate">{b.planName}</span>
                            </td>
                            <td className="font-bold text-[#1E293B]">{b.branchLimit} Locations</td>
                            <td className="font-mono text-[#2563EB] font-bold">{b.tokensUsedThisMonth.toLocaleString()} / {b.monthlyTokenLimit.toLocaleString()}</td>
                            <td><span className="px-2 py-0.5 bg-[#22C55E]/10 text-[#22C55E] rounded-full text-[10px] font-bold">{b.status}</span></td>
                            <td className="text-right">
                              <button
                                onClick={(e) => { e.stopPropagation(); loadBusinessDetails(b); }}
                                className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg bg-white border border-transparent hover:border-[#E6EEF7] text-[#2563EB] font-semibold text-xs shadow-[0_6px_18px_rgba(37,99,235,0.06)] transition-colors"
                                aria-label={`Inspect hierarchy for ${b.name}`}
                              >
                                <span>Inspect Hierarchy</span>
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BUSINESSES MASTER & TOKEN ALLOCATION */}
          {activeTab === 'BUSINESSES' && (
            <div className="space-y-6">
              {/* Quick Token Allocation Card */}
              <div className="clay-card bg-white p-6 border border-[#DCE3EC] space-y-4">
                <div className="flex items-center space-x-2 text-[#1E293B] font-extrabold text-sm">
                  <Sparkles className="w-5 h-5 text-[#2563EB]" />
                  <h4>AI Token Allocation (Set Monthly Gemini AI Token Limits)</h4>
                </div>
                <p className="text-xs text-[#64748B]">Allocate monthly AI token limits to each business account.</p>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const target = businesses.find(b => b.id === planId) || businesses[0];
                    if (!target) return;
                    try {
                      await fetch(`/api/businesses/${target.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ monthlyTokenLimit: monthlyTokens }),
                      });
                      showToast(`Successfully allocated ${monthlyTokens.toLocaleString()} tokens to ${target.name}!`);
                      loadAgencyData();
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-[#EEF2F7] p-4 rounded-2xl border border-[#DCE3EC]"
                >
                  <div>
                    <label className="block text-xs font-bold text-[#1E293B] mb-1">Select Business</label>
                    <select
                      value={planId}
                      onChange={(e) => {
                        setPlanId(e.target.value);
                        const sel = businesses.find(b => b.id === e.target.value);
                        if (sel) setMonthlyTokens(sel.monthlyTokenLimit);
                      }}
                      className="w-full px-3.5 py-2.5 text-xs clay-input"
                    >
                      {businesses.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1E293B] mb-1">Monthly Token Limit</label>
                    <input
                      type="number"
                      step="1000"
                      value={monthlyTokens}
                      onChange={e => setMonthlyTokens(parseInt(e.target.value) || 0)}
                      placeholder="100,000"
                      className="w-full px-3.5 py-2.5 text-xs clay-input font-mono"
                    />
                  </div>

                  <div>
                    <button
                      type="submit"
                      className="w-full py-2.5 clay-btn-primary text-xs cursor-pointer"
                    >
                      Save Token Allocation
                    </button>
                  </div>
                </form>
              </div>

              {/* Master Businesses Cards Grid */}
              <div className="clay-card bg-white p-6 border border-[#DCE3EC] space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-extrabold text-[#1E293B]">Client Businesses Hierarchy List</h3>
                    <p className="text-xs text-[#64748B]">Click any business card below to open its branches, review history, and QR details.</p>
                  </div>
                  <span className="text-xs text-[#2563EB] font-extrabold bg-[#EEF2F7] px-3 py-1 rounded-full border border-[#DCE3EC]">{businesses.length} Businesses Active</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {businesses.map(b => (
                    <div
                      key={b.id}
                      onClick={() => loadBusinessDetails(b)}
                      className="bg-[#EEF2F7] p-5 rounded-2xl border border-[#DCE3EC] space-y-4 cursor-pointer transition-transform transform hover:-translate-y-1 hover:shadow-lg group"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-extrabold text-[#1E293B] text-base group-hover:text-[#2563EB] flex items-center space-x-1">
                            <span>{b.name}</span>
                            <ChevronRight className="w-4 h-4 text-[#64748B] group-hover:text-[#2563EB]" />
                          </h4>
                          <p className="text-xs text-[#64748B]">{b.category}</p>
                        </div>
                        <span className="px-2 py-0.5 bg-[#22C55E]/10 text-[#22C55E] rounded-full text-[10px] font-bold">
                          {b.status}
                        </span>
                      </div>

                      <div className="text-xs space-y-1 text-[#64748B] bg-white p-3 rounded-xl border border-[#DCE3EC]">
                        <p><strong className="text-[#1E293B]">Owner:</strong> {b.ownerName} ({b.ownerEmail})</p>
                        <p><strong className="text-[#1E293B]">Branch Quota:</strong> {b.branchLimit} Locations</p>
                        <p><strong className="text-[#1E293B]">Token Quota:</strong> {b.monthlyTokenLimit.toLocaleString()} / mo</p>
                      </div>

                      <div className="pt-2 border-t border-[#DCE3EC]">
                        <div>
                          <button
                            onClick={(e) => { e.stopPropagation(); loadBusinessDetails(b); }}
                            className="inline-flex items-center flex-nowrap whitespace-nowrap space-x-3 px-4 py-2 bg-white border border-[#DCE3EC] rounded-lg text-[#2563EB] font-semibold text-sm shadow-sm hover:bg-[#F7FBFF]"
                            aria-label={`View branches for ${b.name}`}
                          >
                            <Building2 className="w-5 h-5 text-[#2563EB]" />
                            <span>View Branches</span>
                            <ChevronRight className="w-4 h-4 text-[#64748B]" />
                          </button>

                          <div className="mt-3 w-full max-w-xs">
                            <div className="flex flex-col gap-2">
                              <button
                                type="button"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  const newStatus = b.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
                                  try {
                                    const res = await fetchWithAuth(`/api/businesses/${b.id}`, {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ status: newStatus }),
                                    });
                                    if (res.ok) {
                                      showToast(`Business ${newStatus === 'SUSPENDED' ? 'suspended' : 'activated'} successfully!`);
                                      loadAgencyData();
                                    }
                                  } catch (err) {
                                    showToast('Error updating status', 'error');
                                  }
                                }}
                                className={`w-full h-9 px-3 flex items-center justify-center text-sm font-semibold rounded-md cursor-pointer transition-colors ${
                                  b.status === 'SUSPENDED'
                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                    : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                                }`}
                              >
                                {b.status === 'SUSPENDED' ? 'Activate' : 'Suspend'}
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingBiz(b);
                                  setBizName(b.name);
                                  setBizCategory(b.category || '');
                                  setOwnerName(b.ownerName);
                                  setOwnerEmail(b.ownerEmail);
                                  setOwnerPassword('');
                                  setConfirmPassword('');
                                  setPlanId(b.planId);
                                  setBranchLimit(b.branchLimit);
                                  setMonthlyTokens(b.monthlyTokenLimit);
                                  setIsBizModalOpen(true);
                                }}
                                className="w-full h-9 px-3 flex items-center justify-center bg-white border border-[#DCE3EC] rounded-md text-[#1E293B] hover:bg-[#F7F9FC] text-sm cursor-pointer space-x-2"
                              >
                                <Edit className="w-4 h-4 text-[#1E293B]" />
                                <span>Edit</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SAAS PLANS */}
          {activeTab === 'PLANS' && (
            <div className="clay-card bg-white p-6 border border-[#DCE3EC] space-y-6">
              <div>
                <h3 className="text-lg font-extrabold text-[#1E293B]">SaaS Subscription Packages</h3>
                <p className="text-xs text-[#64748B]">Configure pricing, branch quotas, and token allowances for client businesses</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map(p => (
                  <div key={p.id} className="bg-[#EEF2F7] p-5 rounded-2xl border border-[#DCE3EC] space-y-4 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9)]">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-[#1E293B] text-lg">{p.name}</h4>
                        <p className="text-xs text-[#64748B]">{p.description}</p>
                      </div>
                      <span className="text-lg font-extrabold text-[#2563EB]">${p.priceMonthly}<span className="text-xs text-[#64748B] font-normal">/mo</span></span>
                    </div>

                    <div className="text-xs space-y-2 pt-2 border-t border-[#DCE3EC] text-[#1E293B] font-semibold">
                      <p className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                        <span>Max {p.maxBranches} Branch Locations</span>
                      </p>
                      <p className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                        <span>{p.monthlyTokens.toLocaleString()} Monthly AI Tokens</span>
                      </p>
                      <p className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                        <span>White-label Customer Review Portal</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PROMOTIONAL AD BANNERS */}
          {activeTab === 'ADS' && (
            <div className="clay-card bg-white p-6 border border-[#DCE3EC] space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-extrabold text-[#1E293B]">Promotional Dashboard Banners</h3>
                  <p className="text-xs text-[#64748B]">Broadcast upsells and announcements to business owners</p>
                </div>
                <button
                  onClick={() => setIsAdModalOpen(true)}
                  className="px-3.5 py-2 clay-btn-primary text-xs cursor-pointer flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4 text-white" />
                  <span>Create Banner Ad</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ads.map(ad => (
                  <div key={ad.id} className="p-5 bg-[#EEF2F7] rounded-2xl border border-[#DCE3EC] relative space-y-2 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9)]">
                    <button
                      onClick={() => handleDeleteAd(ad.id)}
                      className="absolute top-3 right-3 p-1.5 text-[#64748B] hover:text-[#EF4444] transition-colors cursor-pointer"
                      title="Delete Ad"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <h4 className="font-extrabold text-base text-[#1E293B]">{ad.title}</h4>
                    <p className="text-xs text-[#64748B]">{ad.description}</p>
                    <div className="pt-2">
                      <span className="inline-block px-3 py-1 bg-[#2563EB] text-white font-bold rounded-lg text-xs">
                        {ad.ctaText}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: AI ENGINE CONFIG */}
          {activeTab === 'AI_ENGINE' && (
            <form onSubmit={handleSaveAiConfig} className="clay-card bg-white p-6 border border-[#DCE3EC] space-y-6">
              <div>
                <h3 className="text-lg font-extrabold text-[#1E293B]">Google Gemini AI Engine Setup</h3>
                <p className="text-xs text-[#64748B]">Global AI keys and default prompt instructions for all client review generators</p>
              </div>

              <div className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">Primary Gemini AI Model</label>
                  <select
                    value={apiKeyConfig.primaryModel}
                    onChange={e => setApiKeyConfig({ ...apiKeyConfig, primaryModel: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs clay-input"
                  >
                    <option value="gemini-1.5-flash">gemini-1.5-flash (Recommended - Fast & High Quality)</option>
                    <option value="gemini-1.5-pro">gemini-1.5-pro (Advanced - Best Quality, Slower)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">AI Review Prompt Template</label>
                  <textarea
                    rows={4}
                    value={apiKeyConfig.promptTemplate || ''}
                    onChange={e => setApiKeyConfig({ ...apiKeyConfig, promptTemplate: e.target.value })}
                    placeholder="Draft a friendly, authentic 5-star Google review praising the business..."
                    className="w-full p-3.5 text-xs clay-input"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 clay-btn-primary text-xs cursor-pointer"
                >
                  Save AI Engine Settings
                </button>
              </div>
            </form>
          )}

          {/* TAB: AGENCY BUSINESS PROFILE & CENTERED LOGO SCANNER */}
          {activeTab === 'AGENCY_PROFILE' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Column (2/3 width) */}
              <div className="lg:col-span-2 clay-card bg-white p-6 border border-[#DCE3EC] space-y-6">
                <div>
                  <h3 className="text-lg font-extrabold text-[#1E293B] flex items-center space-x-2">
                    <QrCode className="w-5 h-5 text-[#2563EB]" />
                    <span>Agency Business Profile & Review Scanner Studio</span>
                  </h3>
                  <p className="text-xs text-[#64748B]">Configure your agency's own business details, logo, review URL, and generate your custom QR scanner card.</p>
                </div>

                <form onSubmit={handleSaveAgencyProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#1E293B] mb-1">Agency Business Name</label>
                      <input
                        type="text"
                        required
                        value={agencyNameInput}
                        onChange={e => setAgencyNameInput(e.target.value)}
                        placeholder="e.g. Tap Review AI Agency"
                        className="w-full px-3.5 py-2.5 text-xs clay-input"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1E293B] mb-1">Business Category</label>
                      <CategorySearchDropdown
                        value={agencyCategory}
                        onChange={setAgencyCategory}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#1E293B] mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={agencyPhone}
                        onChange={e => setAgencyPhone(e.target.value)}
                        placeholder="+91 99000 88776"
                        className="w-full px-3.5 py-2.5 text-xs clay-input"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1E293B] mb-1">City</label>
                      <input
                        type="text"
                        value={agencyCity}
                        onChange={e => setAgencyCity(e.target.value)}
                        placeholder="Mumbai"
                        className="w-full px-3.5 py-2.5 text-xs clay-input"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1E293B] mb-1">State</label>
                      <input
                        type="text"
                        value={agencyState}
                        onChange={e => setAgencyState(e.target.value)}
                        placeholder="Maharashtra"
                        className="w-full px-3.5 py-2.5 text-xs clay-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1E293B] mb-1">Street Address</label>
                    <input
                      type="text"
                      value={agencyAddress}
                      onChange={e => setAgencyAddress(e.target.value)}
                      placeholder="500 Tech Park, Suite 100"
                      className="w-full px-3.5 py-2.5 text-xs clay-input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1E293B] mb-1">Google Review URL for Agency</label>
                    <input
                      type="url"
                      required
                      value={agencyReviewUrl}
                      onChange={e => setAgencyReviewUrl(e.target.value)}
                      placeholder="https://search.google.com/local/writereview?placeid=..."
                      className="w-full px-3.5 py-2.5 text-xs clay-input font-mono text-[#2563EB] font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1E293B] mb-1">Agency Company Logo URL</label>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 border border-[#DCE3EC] bg-[#EEF2F7] rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                        {agencyLogoUrl ? (
                          <img src={agencyLogoUrl} alt="Agency Logo" className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="w-6 h-6 text-[#2563EB]" />
                        )}
                      </div>
                      <input
                        type="text"
                        value={agencyLogoUrl}
                        onChange={e => setAgencyLogoUrl(e.target.value)}
                        placeholder="Paste Logo Image URL..."
                        className="flex-1 px-3.5 py-2.5 text-xs clay-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1E293B] mb-1">Agency Service Highlights (Comma Separated)</label>
                    <input
                      type="text"
                      value={agencyTagsInput}
                      onChange={e => setAgencyTagsInput(e.target.value)}
                      placeholder="AI Software Setup, Fast Support, High Marketing ROI"
                      className="w-full px-3.5 py-2.5 text-xs clay-input"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSavingAgencyProfile}
                      className="px-6 py-2.5 clay-btn-primary text-xs cursor-pointer flex items-center space-x-2"
                    >
                      <Sparkles className="w-4 h-4 text-white" />
                      <span>{isSavingAgencyProfile ? 'Saving to Database...' : 'Save Agency Profile'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Scanner Card Studio Preview (1/3 width) */}
              <div className="clay-card bg-white p-6 border border-[#DCE3EC] flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center space-x-2 text-[#2563EB] font-extrabold text-xs uppercase tracking-wider mb-2">
                    <Sparkles className="w-4 h-4 text-[#2563EB]" />
                    <span>Agency Scanner Card</span>
                  </div>
                  <h4 className="text-xl font-extrabold text-[#1E293B]">{agencyNameInput}</h4>
                  <p className="text-xs text-[#64748B] mt-1">Generate your own agency tabletop QR stand with your centered logo.</p>
                </div>

                <div className="bg-[#EEF2F7] p-5 rounded-2xl border border-[#DCE3EC] flex flex-col items-center text-center space-y-3 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9)]">
                  <div className="w-12 h-12 bg-white p-1 rounded-xl border border-[#DCE3EC] overflow-hidden">
                    <img src={agencyLogoUrl} alt="Logo" className="w-full h-full object-cover" />
                  </div>

                  <h5 className="text-sm font-extrabold text-[#1E293B]">★ Leave a 5-Star Agency Review ★</h5>

                  <button
                    onClick={() => {
                      setSelectedQrBranch(agencyBranchObj || {
                        id: 'branch-agency-main',
                        businessId: 'biz-agency',
                        name: 'Agency Headquarters',
                        address: agencyAddress,
                        city: agencyCity,
                        state: agencyState,
                        zipCode: '400051',
                        phone: agencyPhone,
                        googleReviewUrl: agencyReviewUrl,
                        serviceTags: agencyTagsInput.split(',').map(t => t.trim()),
                        totalReviews: 96,
                        avgRating: 4.98,
                        status: 'ACTIVE',
                        createdAt: new Date().toISOString(),
                      });
                      setIsQrModalOpen(true);
                    }}
                    className="w-full py-2.5 px-4 clay-btn-primary text-xs flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <QrCode className="w-4 h-4 text-white" />
                    <span>Generate Agency Scanner</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] text-[#2563EB] uppercase font-extrabold tracking-wider">Customer Demo Link</span>
                  <a
                    href="/?portal=customer&branchId=branch-agency-main"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-3.5 clay-btn-secondary text-xs flex items-center justify-between cursor-pointer"
                  >
                    <span>View Customer Rating Card</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#1E293B]" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: AGENCY SYSTEM SETTINGS */}
          {activeTab === 'SETTINGS' && (
            <form onSubmit={handleSaveSettings} className="clay-card bg-white p-6 border border-[#DCE3EC] space-y-6">
              <div>
                <h3 className="text-lg font-extrabold text-[#1E293B]">Agency White-Label & Platform Settings</h3>
                <p className="text-xs text-[#64748B]">Configure agency branding, support details, and default review gatekeeping rules</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">Agency Name</label>
                  <input
                    type="text"
                    required
                    value={settings?.agencyName || ''}
                    onChange={e => setSettings({ ...settings, agencyName: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs clay-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">Support Email</label>
                  <input
                    type="email"
                    required
                    value={settings?.supportEmail || ''}
                    onChange={e => setSettings({ ...settings, supportEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs clay-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">Google Redirect Delay (ms)</label>
                  <input
                    type="number"
                    step="100"
                    value={settings?.googleRedirectDelayMs || 1500}
                    onChange={e => setSettings({ ...settings, googleRedirectDelayMs: parseInt(e.target.value) })}
                    className="w-full px-3.5 py-2.5 text-xs clay-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">Minimum Rating for Public Google Redirect (1 to 5 Stars)</label>
                  <select
                    value={settings?.minStarForGoogle || 4}
                    onChange={e => setSettings({ ...settings, minStarForGoogle: parseInt(e.target.value) })}
                    className="w-full px-3.5 py-2.5 text-xs clay-input"
                  >
                    <option value={5}>5 Stars Only (Strict Gatekeeping)</option>
                    <option value={4}>4 Stars and Above (Recommended)</option>
                    <option value={3}>3 Stars and Above</option>
                    <option value={1}>Direct All Ratings to Google (No Gatekeeping)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 clay-btn-primary text-xs cursor-pointer"
              >
                Save Agency Settings
              </button>
            </form>
          )}

          {/* TAB 7: DEMO MANAGEMENT MODULE */}
          {activeTab === 'DEMO' && <DemoManagementTab />}
        </>
      )}
      </main>

      {/* ONBOARD / EDIT BUSINESS MODAL */}
      <Modal
        isOpen={isBizModalOpen}
        onClose={() => setIsBizModalOpen(false)}
        title={editingBiz ? 'Edit Client Business Settings' : 'Onboard New SaaS Business'}
        subtitle="Set up business owner account and branch quotas"
      >
        <form onSubmit={handleSaveBusiness} className="space-y-4">
          {bizModalError && (
            <div className="p-3 bg-[#EF4444]/10 text-[#EF4444] font-bold text-xs rounded-xl border border-[#EF4444]/20">
              <span>{bizModalError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#1E293B] mb-1">Business Name</label>
            <input
              type="text"
              required
              value={bizName}
              onChange={e => setBizName(e.target.value)}
              placeholder="e.g. Smile Dental Clinic"
              className="w-full px-3.5 py-2.5 text-xs clay-input"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E293B] mb-1">Business Category / Industry</label>
            <CategorySearchDropdown
              value={bizCategory}
              onChange={setBizCategory}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1E293B] mb-1">Owner Name</label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={e => setOwnerName(e.target.value)}
                placeholder="Dr. Michael Carter"
                className="w-full px-3.5 py-2.5 text-xs clay-input"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#1E293B] mb-1">Owner Email</label>
              <input
                type="email"
                required
                value={ownerEmail}
                onChange={e => setOwnerEmail(e.target.value)}
                placeholder="owner@business.com"
                className="w-full px-3.5 py-2.5 text-xs clay-input"
              />
            </div>
          </div>

          <div className="p-4 bg-[#EEF2F7] rounded-2xl border border-[#DCE3EC] space-y-2 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9)]">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-extrabold text-[#1E293B]">
                {editingBiz ? 'Reset Owner Password (Optional)' : 'Account Password'}
              </label>
              {editingBiz && (
                <span className="text-[10px] text-[#64748B] italic">Leave blank to keep current password</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#1E293B] mb-1">
                  {editingBiz ? 'New Password' : 'Set Password'}
                </label>
                <input
                  type="password"
                  required={!editingBiz}
                  value={ownerPassword}
                  onChange={e => setOwnerPassword(e.target.value)}
                  placeholder={editingBiz ? 'Enter new password...' : 'Min 6 characters'}
                  className="w-full px-3.5 py-2.5 text-xs clay-input"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#1E293B] mb-1">Confirm Password</label>
                <input
                  type="password"
                  required={!editingBiz}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-3.5 py-2.5 text-xs clay-input"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1E293B] mb-1">Branch Limit</label>
              <input
                type="number"
                required
                value={branchLimit}
                onChange={e => setBranchLimit(parseInt(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs clay-input"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#1E293B] mb-1">Monthly AI Tokens</label>
              <input
                type="number"
                required
                value={monthlyTokens}
                onChange={e => setMonthlyTokens(parseInt(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs clay-input font-mono"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsBizModalOpen(false)}
              className="px-4 py-2.5 clay-btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 clay-btn-primary text-xs cursor-pointer"
            >
              Save Business
            </button>
          </div>
        </form>
      </Modal>

      {/* ADD BRANCH MODAL FOR SELECTED BUSINESS */}
      <Modal
        isOpen={isBranchModalOpen}
        onClose={() => setIsBranchModalOpen(false)}
        title={`Add Branch to ${selectedBusiness?.name || 'Business'}`}
        subtitle="Register new physical location, address, and Google Review URL"
      >
        <form onSubmit={handleCreateBranch} className="space-y-4">
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
              value={branchAddress}
              onChange={e => setBranchAddress(e.target.value)}
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
                value={branchCity}
                onChange={e => setBranchCity(e.target.value)}
                list="branch-city-list"
                className="w-full px-3.5 py-2.5 text-xs clay-input"
              />
              <datalist id="branch-city-list">
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
                value={branchState}
                onChange={e => setBranchState(e.target.value)}
                list="branch-state-list"
                className="w-full px-3.5 py-2.5 text-xs clay-input"
              />
              <datalist id="branch-state-list">
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
                type="text"
                required
                value={branchPhone}
                onChange={e => setBranchPhone(e.target.value)}
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
              value={branchServiceTags}
              onChange={e => setBranchServiceTags(e.target.value)}
              placeholder="Friendly Staff, Gentle Care, Clean Environment, Fast Service"
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
              className="px-4 py-2.5 clay-btn-primary text-xs cursor-pointer"
            >
              Create Branch
            </button>
          </div>
        </form>
      </Modal>

      {/* CREATE AD BANNER MODAL */}
      <Modal
        isOpen={isAdModalOpen}
        onClose={() => setIsAdModalOpen(false)}
        title="Create Promotional Banner Ad"
        subtitle="Displays on Business Owners' dashboards"
      >
        <form onSubmit={handleSaveAd} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#1E293B] mb-1">Banner Headline</label>
            <input
              type="text"
              required
              value={adTitle}
              onChange={e => setAdTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs clay-input"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E293B] mb-1">Banner Description</label>
            <textarea
              rows={3}
              required
              value={adDesc}
              onChange={e => setAdDesc(e.target.value)}
              className="w-full p-3.5 text-xs clay-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1E293B] mb-1">CTA Button Text</label>
              <input
                type="text"
                required
                value={adCtaText}
                onChange={e => setAdCtaText(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs clay-input"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#1E293B] mb-1">CTA Target Link</label>
              <input
                type="text"
                required
                value={adCtaLink}
                onChange={e => setAdCtaLink(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs clay-input"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsAdModalOpen(false)}
              className="px-4 py-2.5 clay-btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 clay-btn-primary text-xs cursor-pointer"
            >
              Publish Banner Ad
            </button>
          </div>
        </form>
      </Modal>

      {/* ADVANCED QR STUDIO FOR BRANCHES */}
      <AdvancedQRStudio
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        branch={selectedQrBranch}
        businessName={selectedBusiness?.name || agencyNameInput}
        logoUrl={selectedBusiness?.logoUrl || agencyLogoUrl}
      />
    </div>
  );
};
