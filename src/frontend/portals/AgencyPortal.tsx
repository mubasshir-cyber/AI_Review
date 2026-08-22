import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  ArrowLeft, MapPin, Phone, ExternalLink, QrCode, Star, MessageSquare, Tag, Users, ChevronRight, Play, Loader2, Menu, X,
  ChevronLeft, Eye, EyeOff
} from 'lucide-react';
import { CategorySearchDropdown } from '../components/CategorySearchDropdown';
import { useLenisSmoothScroll } from '../hooks/useLenisSmoothScroll';

export const AgencyPortal: React.FC = () => {
  const { fetchWithAuth } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'BUSINESSES' | 'PLANS' | 'ADS' | 'AI_ENGINE' | 'SETTINGS' | 'AGENCY_PROFILE' | 'DEMO'>('DASHBOARD');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const tabToPath: Record<string, string> = {
    DASHBOARD: 'dashboard',
    BUSINESSES: 'businesses',
    PLANS: 'plans',
    ADS: 'ads',
    AI_ENGINE: 'ai-engine',
    SETTINGS: 'settings',
    AGENCY_PROFILE: 'profile',
    DEMO: 'demo',
  };

  useEffect(() => {
    const parts = location.pathname.split('/').filter(Boolean);
    const sub = parts[1] || 'dashboard';
    const mapping: Record<string, string> = {
      dashboard: 'DASHBOARD',
      businesses: 'BUSINESSES',
      plans: 'PLANS',
      ads: 'ADS',
      'ai-engine': 'AI_ENGINE',
      settings: 'SETTINGS',
      profile: 'AGENCY_PROFILE',
      demo: 'DEMO',
    };
    if (mapping[sub]) setActiveTab(mapping[sub] as any);
  }, [location.pathname]);

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
    agencyName: 'ReviewScore AI Agency Studio',
    supportEmail: 'support@reviewscore.ai',
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
  const [agencyNameInput, setAgencyNameInput] = useState('ReviewScore AI Agency');
  const [agencyCategory, setAgencyCategory] = useState('Digital Marketing Agency');
  const [agencyPhone, setAgencyPhone] = useState('+91 99309 52947');
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

  // Business Onboard/Edit Modal & 3-Step Wizard State
  const [isBizModalOpen, setIsBizModalOpen] = useState(false);
  const [editingBiz, setEditingBiz] = useState<Business | null>(null);
  const [onboardingStep, setOnboardingStep] = useState<1 | 2 | 3>(1);

  // Step 1: Account & Business Profile
  const [bizName, setBizName] = useState('');
  const [bizCategory, setBizCategory] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [bizGoogleReviewUrl, setBizGoogleReviewUrl] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 2: AI Review Grounding (Anti-Hyperbole Engine)
  const [teamSize, setTeamSize] = useState('Solo / Freelancer (1)');
  const [locationSetup, setLocationSetup] = useState('Physical Store / Office (In-person)');
  const [keyHighlightsInput, setKeyHighlightsInput] = useState('Digital Marketing, SEO, Fast Support');
  const [supportedLangs, setSupportedLangs] = useState<string[]>(['English', 'Hinglish']);
  const [toneEnthusiasm, setToneEnthusiasm] = useState('Subtle & Professional (B2B/Medical)');
  const [businessAge, setBusinessAge] = useState('1 - 3 Years');
  const [targetAudience, setTargetAudience] = useState<string[]>(['B2B']);
  const [showPassword, setShowPassword] = useState(false);

  // Step 3: SaaS Subscription Plan & Quotas
  const [planId, setPlanId] = useState('plan-pro');
  const [branchLimit, setBranchLimit] = useState(5);
  const [monthlyTokens, setMonthlyTokens] = useState(50000);
  const [tokenBizId, setTokenBizId] = useState('');
  const [bizModalError, setBizModalError] = useState('');
  
  // Client Subscription Management State
  const [subManageBizId, setSubManageBizId] = useState('');
  const [subManagePlanId, setSubManagePlanId] = useState('');

  // Edit Plan State
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [editPlanName, setEditPlanName] = useState('');
  const [editPlanPrice, setEditPlanPrice] = useState<number | string>(0);
  const [editPlanBranches, setEditPlanBranches] = useState<number | string>(1);
  const [editPlanTokens, setEditPlanTokens] = useState<number | string>(10000);

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
  const [showWhatsApp, setShowWhatsApp] = useState(true); // New state

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
    if (!bizCategory.trim()) { setBizModalError('Category is required.'); return; }
    if (!ownerName.trim()) { setBizModalError('Owner Name is required.'); return; }
    if (!ownerEmail.trim()) { setBizModalError('Owner Email is required.'); return; }

    const cleanPhone = ownerPhone.trim().replace(/[\s\-]/g, '');
    if (!cleanPhone) {
      setBizModalError('Owner Phone Number is required.');
      return;
    }
    if (!/^(?:\+91|0)?[6-9]\d{9}$/.test(cleanPhone)) {
      setBizModalError('Please enter a valid 10-digit Indian phone number (e.g. 9876543210).');
      return;
    }

    if (!bizGoogleReviewUrl.trim()) {
      setBizModalError('Google Business Review Link is required.');
      return;
    }

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
      phone: ownerPhone.trim(),
      googleReviewUrl: bizGoogleReviewUrl.trim(),
      planId,
      branchLimit,
      monthlyTokenLimit: monthlyTokens,
      aiGrounding: {
        teamSize,
        locationSetup,
        businessAge,
        targetAudience,
        supportedLanguages: supportedLangs,
        toneEnthusiasm,
      }
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

  const handleDeletePlan = async (planId: string, planName: string) => {
    if (!confirm(`Are you sure you want to delete the plan "${planName}"?`)) return;
    try {
      const res = await fetchWithAuth(`/api/plans/${planId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(`Plan ${planName} deleted!`);
        loadAgencyData();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to delete plan');
      }
    } catch (e) {
      console.error(e);
      showToast('Error deleting plan', 'error');
    }
  };

  // Add state for showWhatsApp in your component if you haven't already:

  const handleSaveAd = async (e: React.FormEvent) => {
    e.preventDefault();
    // Store the state directly inside ctaLink using our markers
  const ctaLinkMarker = showWhatsApp ? 'internal://whatsapp-enabled' : 'internal://whatsapp-disabled';
    try {
      await fetchWithAuth('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: adTitle,
          description: adDesc,
          ctaText: adCtaText,
          ctaLink: ctaLinkMarker, // <--- Storing true/false state here          showWhatsApp: showWhatsApp, // <--- Included in payload
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

  // Shared sidebar menu items definition
  const sidebarMenuItems = [
    { id: 'DASHBOARD', label: 'Platform Overview', icon: Activity },
    { id: 'BUSINESSES', label: 'Businesses & Hierarchy', icon: Building2 },
    { id: 'AGENCY_PROFILE', label: 'Agency Profile & Scanner', icon: QrCode },
    { id: 'DEMO', label: 'Demo Management', icon: Play },
    { id: 'PLANS', label: 'Plans', icon: CreditCard },
    { id: 'ADS', label: 'Ad Banners', icon: Megaphone },
    { id: 'AI_ENGINE', label: 'AI Engine & Prompt', icon: Sparkles },
    { id: 'SETTINGS', label: 'Agency Settings', icon: Settings },
  ];

  const handleSidebarTabClick = (tabId: string) => {
    setSelectedBusiness(null);
    setActiveTab(tabId as any);
    const path = tabToPath[tabId] || 'dashboard';
    navigate(`/agency/${path}`, { replace: true });
    setMobileMenuOpen(false);
  };

  const handleOnboardClick = () => {
    setEditingBiz(null);
    setOnboardingStep(1);
    setBizModalError('');
    setBizName('');
    setBizCategory('');
    setOwnerName('');
    setOwnerEmail('');
    setOwnerPhone('');
    setBizGoogleReviewUrl('');
    setOwnerPassword('');
    setConfirmPassword('');
    setTeamSize('Solo / Freelancer (1)');
    setLocationSetup('Physical Store / Office (In-person)');
    setSupportedLangs(['English', 'Hinglish']);
    setToneEnthusiasm('Subtle & Professional (B2B/Medical)');
    setBusinessAge('1 - 3 Years');
    setTargetAudience(['B2B']);
    setShowPassword(false);
    setPlanId(plans[0]?.id || 'plan-pro');
    setBranchLimit(plans[0]?.maxBranches || 5);
    setMonthlyTokens(plans[0]?.monthlyTokens || 50000);
    setIsBizModalOpen(true);
    setMobileMenuOpen(false);
  };

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

  const mobileDrawerNavScrollRef = useLenisSmoothScroll<HTMLElement>(true, {
    duration: 1.05,
    smoothTouch: true,
    touchMultiplier: 1.3,
  });

  const mainScrollRef = useLenisSmoothScroll<HTMLElement>(true, {
    duration: 1.15,
    wheelMultiplier: 1,
    smoothTouch: true,
    touchMultiplier: 1.5,
  });

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full min-h-0 overflow-hidden overflow-x-hidden bg-[#F5F7FB] font-sans">

      {/* ===== MOBILE HEADER BAR (md:hidden) ===== */}
      <div className="md:hidden relative flex items-center justify-between px-4 py-3 bg-white border-b border-[#DCE3EC] z-40 shrink-0">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold text-[#2563EB] uppercase tracking-wider">Admin</p>
            <p className="text-xs font-extrabold text-[#1E293B] truncate">{settings?.agencyName || 'ReviewScore AI Agency'}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="w-10 h-10 flex items-center justify-center rounded-xl border border-[#DCE3EC] bg-[#EEF2F7] text-[#1E293B] cursor-pointer shrink-0"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* ===== MOBILE DRAWER OVERLAY (md:hidden) ===== */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/40 animate-in fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Drawer panel - slide from left */}
          <div className="absolute left-0 inset-y-0 w-72 max-w-[85vw] bg-white flex flex-col shadow-xl animate-in slide-in-from-left duration-300">
            {/* Drawer Header */}
            <div className="flex items-center justify-between md:p-4 p-4 md:pt-4 pt-[calc(env(safe-area-inset-top)+1rem)] border-b border-[#DCE3EC]">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#2563EB] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-extrabold text-[#2563EB] uppercase tracking-wider">Agency Super Admin</p>
                  <p className="text-sm font-extrabold text-[#1E293B] truncate">{settings?.agencyName || 'ReviewScore AI Agency'}</p>
                  <div className="flex items-center space-x-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                    <span className="text-[10px] text-[#64748B] font-medium">Live Database Sync</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="w-9 h-9 rounded-full bg-[#EEF2F7] text-[#64748B] hover:text-[#1E293B] flex items-center justify-center cursor-pointer border border-[#DCE3EC] shrink-0"
                aria-label="Close navigation menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Nav */}
            <nav ref={mobileDrawerNavScrollRef} className="flex-1 overflow-y-auto overscroll-contain min-h-0">
              <div className="p-3 space-y-1">
              {sidebarMenuItems.map(tab => {
                const Icon = tab.icon;
                const active = activeTab === tab.id && !selectedBusiness;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleSidebarTabClick(tab.id)}
                    className={`w-full flex items-center space-x-2.5 px-3.5 py-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
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
              </div>
            </nav>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-[#DCE3EC] bg-[#F5F7FB]">
              <button
                onClick={handleOnboardClick}
                className="w-full py-2.5 clay-btn-primary text-xs flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>Onboard Business</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== DESKTOP SIDEBAR (hidden on mobile) ===== */}
      <aside className="hidden md:flex w-64 bg-white border-r border-[#DCE3EC] shrink-0 flex-col justify-between h-full overflow-hidden">
        <div ref={sidebarScrollRef} className="overflow-y-auto overscroll-contain flex-1 min-h-0">
          <div className="p-4 space-y-5">
          {/* Agency Admin Profile Badge */}
          <div className="p-2.5 bg-[#EEF2F7] rounded-xl border border-[#DCE3EC] flex items-center space-x-2.5 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9)]">
            <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-3 h-3 text-[#2563EB]" />
                <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-wider">Agency Super Admin</span>
              </div>
              <h2 className="font-bold text-sm truncate text-[#1E293B] mt-0.5">{settings?.agencyName || 'ReviewScore AI Agency'}</h2>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                <span className="text-[10px] text-[#64748B] font-medium">Live Database Sync</span>
              </div>
            </div>
          </div>

          {/* Sidebar Menu Items */}
          <nav className="space-y-1">
            {sidebarMenuItems.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id && !selectedBusiness;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleSidebarTabClick(tab.id)}
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
        </div>

        {/* Sidebar Footer Action */}
        <div className="p-4 border-t border-[#DCE3EC] bg-[#F5F7FB]">
          <button
            onClick={handleOnboardClick}
            className="w-full py-2.5 clay-btn-primary text-xs flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Onboard Business</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main ref={mainScrollRef} className="flex-1 min-w-0 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain">
        <div className="p-4 sm:p-6 md:p-8 space-y-6">

      {/* DETAILED BUSINESS HIERARCHY VIEW */}
      {selectedBusiness ? (
        <div className="space-y-6">
          {/* Breadcrumb Header */}
          <div className="clay-card bg-white p-4 sm:p-6 border border-[#DCE3EC] space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E8EDF5]">
              <div className="space-y-1 min-w-0">
                <button
                  type="button"
                  onClick={() => setSelectedBusiness(null)}
                  className="inline-flex items-center space-x-1.5 text-xs font-extrabold text-[#2563EB] hover:underline transition-colors mb-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Master Business List</span>
                </button>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#1E293B] tracking-tight">{selectedBusiness.name}</h2>
                  <span className="px-2.5 py-1 bg-[#EEF2F7] text-[#2563EB] font-extrabold text-xs rounded-full border border-[#DCE3EC] whitespace-nowrap">
                    {selectedBusiness.planName || 'Pro Plan'}
                  </span>
                  <span className="px-2.5 py-1 bg-[#22C55E]/10 text-[#22C55E] font-bold text-xs rounded-full border border-[#22C55E]/20 whitespace-nowrap">
                    {selectedBusiness.status}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-[#64748B]">
                  Owner: <strong className="text-[#1E293B]">{selectedBusiness.ownerName}</strong> ({selectedBusiness.ownerEmail}) • {selectedBusiness.category}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 shrink-0">
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
                  className="px-4 py-2 bg-[#2563EB] text-white rounded-xl shadow-sm hover:bg-[#1f4fc4] flex items-center justify-center space-x-2 text-xs sm:text-sm font-semibold"
                >
                  <Plus className="w-4 h-4 text-white" />
                  <span>Add Branch</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingBiz(selectedBusiness);
                    setBizName(selectedBusiness.name);
                    setBizCategory(selectedBusiness.category || '');
                    setOwnerName(selectedBusiness.ownerName);
                    setOwnerEmail(selectedBusiness.ownerEmail);
                    setOwnerPhone(selectedBusiness.phone || '');
                    setBizGoogleReviewUrl(selectedBusiness.googleReviewUrl || '');
                    setOwnerPassword('');
                    setConfirmPassword('');
                    setPlanId(selectedBusiness.planId);
                    setBranchLimit(selectedBusiness.branchLimit);
                    setMonthlyTokens(selectedBusiness.monthlyTokenLimit);
                    if (selectedBusiness.aiGrounding) {
                      setTeamSize(selectedBusiness.aiGrounding.teamSize || 'Solo / Freelancer (1)');
                      setLocationSetup(selectedBusiness.aiGrounding.locationSetup || 'Physical Store / Office (In-person)');
                      const loadedLangs = (selectedBusiness.aiGrounding.supportedLanguages || ['English', 'Hinglish']).map(l => l === 'Roman Hindi' ? 'Hinglish' : l);
                      setSupportedLangs(loadedLangs);
                      setToneEnthusiasm(selectedBusiness.aiGrounding.toneEnthusiasm || 'Subtle & Professional (B2B/Medical)');
                      setBusinessAge(selectedBusiness.aiGrounding.businessAge || '1 - 3 Years');
                      const audVal = selectedBusiness.aiGrounding.targetAudience;
                      if (Array.isArray(audVal)) {
                        setTargetAudience(audVal);
                      } else if (typeof audVal === 'string' && audVal.trim()) {
                        setTargetAudience(audVal.split(',').map(s => s.trim()).filter(Boolean));
                      } else {
                        setTargetAudience(['B2B']);
                      }
                    }
                    setOnboardingStep(1);
                    setIsBizModalOpen(true);
                  }}
                  className="px-4 py-2 bg-white border border-[#DCE3EC] rounded-xl text-[#1E293B] hover:bg-[#F7F9FC] flex items-center justify-center space-x-2 text-xs sm:text-sm font-semibold"
                >
                  <Edit className="w-3.5 h-3.5 text-[#1E293B]" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteBusiness(selectedBusiness.id)}
                  className="px-4 py-2 bg-white border border-[#FEE2E2] text-[#EF4444] hover:bg-[#EF4444] hover:text-white rounded-xl flex items-center justify-center space-x-2 text-xs sm:text-sm font-semibold shadow-sm transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
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
          <div className="clay-card bg-white p-4 sm:p-6 border border-[#DCE3EC] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-sm sm:text-lg font-extrabold text-[#1E293B] flex items-center space-x-2">
                  <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#2563EB] shrink-0" />
                  <span className="truncate">Branches under {selectedBusiness.name} ({businessBranches.length})</span>
                </h3>
                <p className="text-[11px] sm:text-xs text-[#64748B] mt-0.5">
                  Each branch has its own Google Place ID, QR code, and review highlights.
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
                className="px-3.5 py-2 sm:py-1.5 clay-btn-primary text-xs flex items-center justify-center space-x-1.5 cursor-pointer shrink-0"
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
                    className="bg-[#EEF2F7] p-4 sm:p-5 rounded-2xl border border-[#DCE3EC] space-y-3 sm:space-y-4 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9)]"
                  >
                    {/* Branch Name + Rating */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-extrabold text-[#1E293B] text-sm sm:text-base flex items-center flex-wrap gap-1.5">
                          <span className="truncate">{branch.name}</span>
                          {branch.city && (
                            <span className="text-[10px] bg-white text-[#1E293B] font-bold px-2 py-0.5 rounded-md border border-[#DCE3EC] whitespace-nowrap shrink-0">
                              {branch.city}
                            </span>
                          )}
                        </h4>
                        {branch.address && (
                          <p className="text-[11px] sm:text-xs text-[#64748B] flex items-center space-x-1 mt-1 font-medium">
                            <MapPin className="w-3 h-3 text-[#2563EB] shrink-0" />
                            <span className="truncate">{branch.address}</span>
                          </p>
                        )}
                      </div>
                      {/* Rating badge */}
                      <span className="shrink-0 text-xs font-extrabold text-[#F59E0B] bg-white px-2.5 py-1 rounded-full border border-[#DCE3EC] flex items-center space-x-1 whitespace-nowrap">
                        <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />
                        <span>{branch.avgRating || 5.0}</span>
                      </span>
                    </div>

                    {/* Branch Metadata */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-white p-2.5 sm:p-3 rounded-xl border border-[#DCE3EC]">
                      <div>
                        <span className="text-[10px] font-bold text-[#64748B] uppercase block">Phone</span>
                        <span className="font-bold text-[#1E293B] text-[11px] sm:text-xs">{branch.phone || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-[#64748B] uppercase block">Reviews</span>
                        <span className="font-bold text-[#1E293B] text-[11px] sm:text-xs">{branch.totalReviews || 0} collected</span>
                      </div>
                    </div>

                    {/* Highlights / Suggestions */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-extrabold text-[#1E293B] uppercase tracking-wider flex items-center space-x-1">
                        <Tag className="w-3 h-3 text-[#2563EB]" />
                        <span>Highlights ({branch.serviceTags?.length || 0})</span>
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

                    {/* Actions Row */}
                    <div className="pt-2 border-t border-[#DCE3EC] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
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
                        {branch.googleReviewUrl && branch.googleReviewUrl !== 'https://maps.google.com' ? (
                          <a
                            href={branch.googleReviewUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#2563EB] hover:underline flex items-center space-x-1 text-[11px] font-bold px-2 py-1.5"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Google Page</span>
                          </a>
                        ) : (
                          <span className="text-[11px] text-[#94A3B8] font-bold px-2 py-1.5 flex items-center space-x-1 cursor-not-allowed" title="Google Review URL not configured">
                            <ExternalLink className="w-3 h-3" />
                            <span>No Google URL</span>
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleDeleteBranch(branch.id)}
                        className="text-[#EF4444] hover:underline text-xs font-bold flex items-center space-x-1 cursor-pointer px-2 py-1.5 self-end sm:self-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
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
                            <span className="text-[9px] text-[#64748B] block">{new Date(r.createdAt).toLocaleDateString()} {new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
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
                            <span className="text-[9px] text-[#64748B] block">{new Date(f.createdAt).toLocaleDateString()} {new Date(f.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
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
                  subtitle="Active Subscriptions"
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
                  title="Monthly Revenue"
                  value={`$${stats?.monthlyRevenue || 297}`}
                  subtitle="Recurring Billing"
                  icon={DollarSign}
                  iconBgColor="bg-[#EEF2F7]"
                  iconColor="text-[#22C55E]"
                  badgeText="MRR Growth +18%"
                />
              </div>

              {/* Master Business List with Hierarchy Click */}
              <div className="clay-card bg-white p-4 sm:p-6 border border-[#DCE3EC] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-[#1E293B]">Onboarded Businesses</h3>
                    <p className="text-[11px] sm:text-xs text-[#64748B]">Click any business to inspect its branches, QR codes, and review activity.</p>
                  </div>
                  <span className="text-xs font-extrabold text-[#2563EB] bg-[#EEF2F7] px-3 py-1 rounded-full border border-[#DCE3EC] shrink-0 self-start sm:self-auto whitespace-nowrap">
                    {businesses.length} Businesses
                  </span>
                </div>

                {/* MOBILE CARDS (md:hidden) */}
                <div className="md:hidden space-y-3">
                  {businesses.length === 0 ? (
                    <EmptyState title="No Data" description="No business records found in database" />
                  ) : (
                    businesses.map(b => (
                      <div
                        key={b.id}
                        onClick={() => loadBusinessDetails(b)}
                        className="bg-[#EEF2F7] p-4 rounded-xl border border-[#DCE3EC] space-y-3 cursor-pointer active:scale-[0.98] transition-transform"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="font-extrabold text-sm text-[#1E293B] truncate">{b.name}</h4>
                            <p className="text-[11px] text-[#64748B] truncate mt-0.5">{b.ownerName} • {b.ownerEmail}</p>
                          </div>
                          <span className="px-2 py-0.5 bg-[#22C55E]/10 text-[#22C55E] rounded-full text-[10px] font-bold shrink-0">{b.status}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-white p-2.5 rounded-lg border border-[#DCE3EC]">
                            <span className="text-[10px] font-bold text-[#64748B] uppercase block">Plan</span>
                            <span className="font-bold text-[#1E293B] truncate block">{b.planName}</span>
                          </div>
                          <div className="bg-white p-2.5 rounded-lg border border-[#DCE3EC]">
                            <span className="text-[10px] font-bold text-[#64748B] uppercase block">Branches</span>
                            <span className="font-bold text-[#1E293B]">{b.branchLimit} Locations</span>
                          </div>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-[#DCE3EC]">
                          <span className="text-[10px] font-bold text-[#64748B] uppercase block">Monthly Tokens</span>
                          <span className="font-mono font-bold text-[#2563EB] text-xs">{b.tokensUsedThisMonth.toLocaleString()} / {b.monthlyTokenLimit.toLocaleString()}</span>
                          <div className="w-full bg-[#DCE3EC] h-1.5 mt-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#2563EB] h-full rounded-full" style={{ width: `${Math.min(100, (b.tokensUsedThisMonth / b.monthlyTokenLimit) * 100)}%` }} />
                          </div>
                        </div>
                        <div className="flex items-center justify-end">
                          <span className="text-xs font-bold text-[#2563EB] flex items-center space-x-1">
                            <span>Inspect</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* DESKTOP TABLE (hidden on mobile) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="clay-table text-left text-xs w-full">
                    <thead>
                      <tr>
                        <th>Business Name</th>
                        <th>Owner Contact</th>
                        <th>Plan</th>
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
                            <td className="font-extrabold text-[#1E293B] group-hover:text-[#2563EB]">
                              <div className="flex items-center justify-between space-x-2 w-full py-1">
                                <span>{b.name}</span>
                                <ChevronRight className="w-3.5 h-3.5 text-[#64748B] group-hover:text-[#2563EB] shrink-0" />
                              </div>
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
            <div className="space-y-8 animate-in fade-in duration-500">
              {/* Quick Token Allocation Card */}
              <div className="relative bg-white p-6 sm:p-8 rounded-3xl border border-[#E2E8F0] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10 flex flex-col space-y-6">
                  <div>
                    <div className="flex items-center space-x-3 text-[#0F172A] font-black text-lg sm:text-xl tracking-tight">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <h4>AI Token Allocation Setup</h4>
                    </div>
                    <p className="text-sm text-[#64748B] mt-2 font-medium">Allocate monthly Gemini AI token limits seamlessly to your client accounts.</p>
                  </div>

                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const targetId = tokenBizId || (businesses.length > 0 ? businesses[0].id : '');
                        const target = businesses.find(b => b.id === targetId);
                        if (!target) return;
                        try {
                          await fetchWithAuth(`/api/businesses/${target.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ monthlyTokenLimit: monthlyTokens }),
                          });
                          showToast(`Successfully allocated ${monthlyTokens.toLocaleString()} tokens to ${target.name}!`);
                          loadAgencyData();
                        } catch (err) {
                          console.error(err);
                          showToast('Error saving token allocation', 'error');
                        }
                      }}
                      className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end bg-[#F8FAFC] p-5 rounded-2xl border border-[#E2E8F0]/80 shadow-inner"
                    >
                      <div className="space-y-2">
                        <label className="block text-[13px] font-bold text-[#334155] uppercase tracking-wide">Select Business</label>
                        <div className="relative">
                          <select
                            value={tokenBizId || (businesses.length > 0 ? businesses[0].id : '')}
                            onChange={(e) => {
                              setTokenBizId(e.target.value);
                              const sel = businesses.find(b => b.id === e.target.value);
                              if (sel) setMonthlyTokens(sel.monthlyTokenLimit);
                            }}
                            className="w-full pl-4 pr-10 py-3 text-sm font-semibold text-[#0F172A] bg-white border border-[#CBD5E1] rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none outline-none shadow-sm"
                          >
                            {businesses.map(b => (
                              <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                          </select>
                        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none rotate-90" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[13px] font-bold text-[#334155] uppercase tracking-wide">Monthly Token Limit</label>
                      <input
                        type="number"
                        step="1000"
                        value={monthlyTokens}
                        onChange={e => setMonthlyTokens(parseInt(e.target.value) || 0)}
                        placeholder="100,000"
                        className="w-full px-4 py-3 text-sm font-bold font-mono text-[#0F172A] bg-white border border-[#CBD5E1] rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none shadow-sm"
                      />
                    </div>

                    <div>
                      <button
                        type="submit"
                        className="w-full py-3 px-4 bg-[#0F172A] hover:bg-[#1E293B] text-white text-sm font-bold rounded-xl shadow-lg shadow-slate-900/20 transition-all transform hover:-translate-y-0.5 focus:ring-4 focus:ring-slate-500/30 flex items-center justify-center space-x-2"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Save Allocation</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Master Businesses Cards Grid */}
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-1">
                  <div>
                    <h3 className="text-xl font-black text-[#0F172A] tracking-tight">Client Businesses Hierarchy</h3>
                    <p className="text-sm text-[#64748B] font-medium mt-1">Manage branches, monitor review flows, and control access.</p>
                  </div>
                  <span className="inline-flex items-center justify-center px-4 py-1.5 text-xs font-black text-blue-700 bg-blue-50 border border-blue-200 rounded-full shadow-sm ring-1 ring-blue-500/10">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse" />
                    {businesses.length} Active Businesses
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {businesses.map(b => (
                    <div
                      key={b.id}
                      onClick={() => loadBusinessDetails(b)}
                      className="group relative bg-white rounded-3xl border border-[#E2E8F0] overflow-hidden hover:border-blue-300 transition-all duration-300 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(59,130,246,0.12)] cursor-pointer flex flex-col"
                    >
                      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
                      
                      <div className="p-6 flex-1 flex flex-col space-y-5">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 pr-2">
                            <h4 className="font-black text-[#0F172A] text-lg truncate group-hover:text-blue-600 transition-colors">
                              {b.name}
                            </h4>
                            <p className="text-[13px] font-semibold text-[#64748B] mt-0.5 tracking-wide">{b.category}</p>
                          </div>
                          <span className={`shrink-0 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${
                            b.status === 'SUSPENDED' 
                              ? 'bg-rose-50 text-rose-600 border-rose-200'
                              : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          }`}>
                            {b.status}
                          </span>
                        </div>

                        {/* Details Card */}
                        <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-[#E2E8F0]/80 space-y-3 shadow-inner">
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                              <Users className="w-4 h-4 text-slate-500" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Owner Profile</p>
                              <p className="text-[13px] font-bold text-slate-700 truncate">{b.ownerName}</p>
                              <p className="text-[11px] font-semibold text-slate-500 truncate">{b.ownerEmail}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200/60">
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Locations</p>
                              <p className="text-[13px] font-bold text-slate-700">{b.branchLimit} Quota</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">AI Tokens/mo</p>
                              <p className="text-[13px] font-bold text-slate-700 font-mono">{b.monthlyTokenLimit.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-2 flex items-center justify-between gap-3 mt-auto">
                          <button
                            onClick={(e) => { e.stopPropagation(); loadBusinessDetails(b); }}
                            className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white rounded-xl font-bold text-[13px] transition-colors"
                            aria-label={`View branches for ${b.name}`}
                          >
                            <Building2 className="w-4 h-4" />
                            <span>View Branches</span>
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingBiz(b);
                                setOnboardingStep(1);
                                setBizModalError('');
                                setBizName(b.name);
                                setBizCategory(b.category || '');
                                setOwnerName(b.ownerName);
                                setOwnerEmail(b.ownerEmail);
                                setOwnerPhone(b.phone || '');
                                setBizGoogleReviewUrl(b.googleReviewUrl || '');
                                setOwnerPassword('');
                                setConfirmPassword('');
                                setPlanId(b.planId);
                                setBranchLimit(b.branchLimit);
                                setMonthlyTokens(b.monthlyTokenLimit);
                                if (b.aiGrounding) {
                                  setTeamSize(b.aiGrounding.teamSize || 'Solo / Freelancer (1)');
                                  setLocationSetup(b.aiGrounding.locationSetup || 'Physical Store / Office (In-person)');
                                  const loadedLangs = (b.aiGrounding.supportedLanguages || ['English', 'Hinglish']).map(l => l === 'Roman Hindi' ? 'Hinglish' : l);
                                  setSupportedLangs(loadedLangs);
                                  setToneEnthusiasm(b.aiGrounding.toneEnthusiasm || 'Subtle & Professional (B2B/Medical)');
                                  setBusinessAge(b.aiGrounding.businessAge || '1 - 3 Years');
                                  const audVal = b.aiGrounding.targetAudience;
                                  if (Array.isArray(audVal)) {
                                    setTargetAudience(audVal);
                                  } else if (typeof audVal === 'string' && audVal.trim()) {
                                    setTargetAudience(audVal.split(',').map(s => s.trim()).filter(Boolean));
                                  } else {
                                    setTargetAudience(['B2B']);
                                  }
                                }
                                setIsBizModalOpen(true);
                              }}
                              className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition-colors"
                              title="Edit Business"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
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
                              className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-colors ${
                                b.status === 'SUSPENDED'
                                  ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-600'
                                  : 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-600'
                              }`}
                              title={b.status === 'SUSPENDED' ? 'Activate' : 'Suspend'}
                            >
                              <ShieldCheck className="w-4 h-4" />
                            </button>
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-extrabold text-[#1E293B]">Subscription Packages</h3>
                  <p className="text-xs text-[#64748B]">Configure pricing, branch quotas, and token allowances for client businesses</p>
                </div>
                <button
                  onClick={() => {
                    setEditingPlan(null);
                    setEditPlanName('');
                    setEditPlanPrice(499);
                    setEditPlanBranches(3);
                    setEditPlanTokens(30000);
                    setIsPlanModalOpen(true);
                  }}
                  className="px-4 py-2.5 clay-btn-primary text-xs font-bold flex items-center justify-center space-x-2 shrink-0 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Plan</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map(p => (
                  <div key={p.id} className="bg-[#EEF2F7] p-5 rounded-2xl border border-[#DCE3EC] space-y-4 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9)]">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-[#1E293B] text-lg">{p.name}</h4>
                        <p className="text-xs text-[#64748B]">{p.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-lg font-extrabold text-[#2563EB]">₹{p.priceMonthly}<span className="text-xs text-[#64748B] font-normal">/mo</span></span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingPlan(p);
                              setEditPlanName(p.name);
                              setEditPlanPrice(p.priceMonthly);
                              setEditPlanBranches(p.maxBranches);
                              setEditPlanTokens(p.monthlyTokens);
                              setIsPlanModalOpen(true);
                            }}
                            className="px-2.5 py-1 text-[10px] font-bold clay-btn-secondary flex items-center gap-1 cursor-pointer"
                            title="Edit Plan"
                          >
                            <Settings className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeletePlan(p.id, p.name)}
                            className="p-1 text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors cursor-pointer"
                            title="Delete Plan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
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

              {/* CLIENT SUBSCRIPTION MANAGEMENT SECTION */}
              <div className="mt-8 pt-8 border-t border-[#DCE3EC]">
                <div className="mb-6">
                  <h3 className="text-lg font-extrabold text-[#1E293B]">Client Subscription Management</h3>
                  <p className="text-xs text-[#64748B]">Upgrade or downgrade a specific client's active plan</p>
                </div>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const targetBizId = subManageBizId || (businesses.length > 0 ? businesses[0].id : '');
                    const targetPlanId = subManagePlanId || (plans.length > 0 ? plans[0].id : '');
                    
                    const biz = businesses.find(b => b.id === targetBizId);
                    const plan = plans.find(p => p.id === targetPlanId);
                    
                    if (!biz || !plan) return;

                    try {
                      await fetchWithAuth(`/api/businesses/${biz.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          planId: plan.id,
                          planName: plan.name,
                          branchLimit: plan.maxBranches,
                          monthlyTokenLimit: plan.monthlyTokens
                        }),
                      });
                      showToast(`Successfully updated ${biz.name} to ${plan.name}!`);
                      loadAgencyData();
                    } catch (err) {
                      console.error(err);
                      showToast('Error updating client subscription', 'error');
                    }
                  }}
                  className="bg-[#F8FAFC] p-6 rounded-2xl border border-[#E2E8F0]/80 shadow-inner grid grid-cols-1 md:grid-cols-3 gap-6 items-end"
                >
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-[#1E293B] mb-1">Select Client Business</label>
                    <div className="relative">
                      <select
                        value={subManageBizId || (businesses.length > 0 ? businesses[0].id : '')}
                        onChange={(e) => setSubManageBizId(e.target.value)}
                        className="w-full pl-4 pr-10 py-3 text-sm font-semibold text-[#0F172A] bg-white border border-[#CBD5E1] rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none outline-none shadow-sm"
                      >
                        {businesses.map(b => (
                          <option key={b.id} value={b.id}>{b.name} (Current: {b.planName})</option>
                        ))}
                      </select>
                      <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none rotate-90" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-[#1E293B] mb-1">Select New Plan</label>
                    <div className="relative">
                      <select
                        value={subManagePlanId || (plans.length > 0 ? plans[0].id : '')}
                        onChange={(e) => setSubManagePlanId(e.target.value)}
                        className="w-full pl-4 pr-10 py-3 text-sm font-semibold text-[#0F172A] bg-white border border-[#CBD5E1] rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none outline-none shadow-sm"
                      >
                        {plans.map(p => (
                          <option key={p.id} value={p.id}>{p.name} (₹{p.priceMonthly}/mo)</option>
                        ))}
                      </select>
                      <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none rotate-90" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 clay-btn-primary text-sm font-bold flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Update Subscription</span>
                  </button>
                </form>
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
      {ads.map(ad => {
        // Determine type based on our stored marker in cta_link
        const isPromotional = ad.ctaLink !== 'internal://whatsapp-disabled';

        return (
          <div key={ad.id} className="p-5 bg-[#EEF2F7] rounded-2xl border border-[#DCE3EC] relative space-y-3 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9)]">
            <button
              onClick={() => handleDeleteAd(ad.id)}
              className="absolute top-3 right-3 p-1.5 text-[#64748B] hover:text-[#EF4444] transition-colors cursor-pointer"
              title="Delete Ad"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            <div className="space-y-1">
              {/* Professional Type Badge */}
              <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                isPromotional 
                  ? 'bg-[#2563EB]/10 text-[#2563EB]' 
                  : 'bg-[#D97706]/10 text-[#D97706]'
              }`}>
                {isPromotional ? 'Promotional Announcement' : 'System Notice'}
              </span>

              <h4 className="font-extrabold text-base text-[#1E293B] pt-1">{ad.title}</h4>
              <p className="text-xs text-[#64748B] leading-relaxed">{ad.description}</p>
            </div>

            <div className="pt-1 flex items-center justify-between text-[11px] text-[#64748B] font-medium border-t border-[#DCE3EC]/60">
              <span>WhatsApp Enquiry: <strong className={isPromotional ? 'text-[#10B981]' : 'text-[#EF4444]'}>{isPromotional ? 'Enabled' : 'Disabled'}</strong></span>
            </div>
          </div>
        );
      })}
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
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#1E293B] mb-1">Agency Business Name</label>
                      <input
                        type="text"
                        required
                        value={agencyNameInput}
                        onChange={e => setAgencyNameInput(e.target.value)}
                        placeholder="e.g. ReviewScore AI Agency"
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
                        type="tel"
                        pattern="^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$"
                        title="Please enter a valid phone number (e.g., +91 98765 43210)"
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

                  <div className="pt-2 flex justify-center">
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
        </div>
      </main>

      {/* ONBOARD / EDIT BUSINESS MODAL */}
      <Modal
        isOpen={isBizModalOpen}
        onClose={() => setIsBizModalOpen(false)}
        title={editingBiz ? 'Edit Client Business Settings' : 'Onboard New Business'}
        subtitle="3-Step Onboarding & Anti-Hyperbole AI Grounding"
      >
        {/* Step Indicator Visualizer */}
        <div className="mb-6">
          <div className="flex items-center justify-between relative mb-2">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 w-full z-0 rounded-full" />
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 z-0 transition-all duration-300 rounded-full"
              style={{
                width: onboardingStep === 1 ? '0%' : onboardingStep === 2 ? '50%' : '100%'
              }}
            />

            {/* Step 1 Circle */}
            <div
              onClick={() => setOnboardingStep(1)}
              className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full text-xs font-black transition-all cursor-pointer ${
                onboardingStep >= 1
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                  : 'bg-slate-100 text-slate-400 border border-slate-300'
              }`}
            >
              1
            </div>

            {/* Step 2 Circle */}
            <div
              onClick={() => {
                if (bizName && ownerName && ownerEmail) setOnboardingStep(2);
              }}
              className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full text-xs font-black transition-all cursor-pointer ${
                onboardingStep >= 2
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                  : 'bg-slate-100 text-slate-400 border border-slate-300'
              }`}
            >
              2
            </div>

            {/* Step 3 Circle */}
            <div
              onClick={() => {
                if (bizName && ownerName && ownerEmail) setOnboardingStep(3);
              }}
              className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full text-xs font-black transition-all cursor-pointer ${
                onboardingStep === 3
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                  : 'bg-slate-100 text-slate-400 border border-slate-300'
              }`}
            >
              3
            </div>
          </div>

          <div className="flex justify-between text-[11px] font-bold text-slate-600">
            <span className={onboardingStep === 1 ? 'text-blue-600 font-extrabold' : ''}>Step 1: Profile</span>
            <span className={onboardingStep === 2 ? 'text-blue-600 font-extrabold' : ''}>Step 2: AI Grounding</span>
            <span className={onboardingStep === 3 ? 'text-blue-600 font-extrabold' : ''}>Step 3: Plan & Quotas</span>
          </div>
        </div>

        <form onSubmit={handleSaveBusiness} className="space-y-4">
          {bizModalError && (
            <div className="p-3 bg-[#EF4444]/10 text-[#EF4444] font-bold text-xs rounded-xl border border-[#EF4444]/20">
              <span>{bizModalError}</span>
            </div>
          )}

          {/* STEP 1: Account & Business Profile */}
          {onboardingStep === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">Business Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={bizName}
                  onChange={e => setBizName(e.target.value)}
                  placeholder="e.g. Smile Dental Clinic, RC Media"
                  className="w-full px-3.5 py-2.5 text-xs clay-input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">Industry / Category <span className="text-red-500">*</span></label>
                <CategorySearchDropdown
                  value={bizCategory}
                  onChange={setBizCategory}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">Owner Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={e => setOwnerName(e.target.value)}
                    placeholder="Account holder full name"
                    className="w-full px-3.5 py-2.5 text-xs clay-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">Owner Email <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    required
                    value={ownerEmail}
                    onChange={e => setOwnerEmail(e.target.value)}
                    placeholder="Primary credentials identifier"
                    className="w-full px-3.5 py-2.5 text-xs clay-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">Owner Phone Number <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    required
                    value={ownerPhone}
                    onChange={e => setOwnerPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3.5 py-2.5 text-xs clay-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">Google Business Review Link <span className="text-red-500">*</span></label>
                  <input
                    type="url"
                    required
                    value={bizGoogleReviewUrl}
                    onChange={e => setBizGoogleReviewUrl(e.target.value)}
                    placeholder="https://search.google.com/local/writereview?placeid=..."
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
                    <span className="text-[10px] text-[#64748B] italic">Leave blank to keep current</span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#1E293B] mb-1">
                      {editingBiz ? 'New Password' : 'Set Password'}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required={!editingBiz}
                        value={ownerPassword}
                        onChange={e => setOwnerPassword(e.target.value)}
                        placeholder={editingBiz ? 'Enter new password...' : 'Min 6 characters'}
                        className="w-full px-3.5 py-2.5 pr-10 text-xs clay-input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#1E293B] mb-1">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required={!editingBiz}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full px-3.5 py-2.5 pr-10 text-xs clay-input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: AI Review Grounding (Anti-Hyperbole Engine) */}
          {onboardingStep === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-800 leading-relaxed">
                ✨ <strong>Anti-Hyperbole Grounding Engine:</strong> These parameters ground Gemini 2.5 Flash Lite to produce realistic, non-exaggerated reviews for this business.
              </div>

              {/* Team Size Single Select Cards */}
              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1.5">Team Size</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Solo / Freelancer (1)',
                    'Small Team (2–10)',
                    'Medium Team (11–50)',
                    'Large Enterprise (50+)'
                  ].map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setTeamSize(option)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                        teamSize === option
                          ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location Setup */}
              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1.5">Location Setup</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    'Physical Store / Office (In-person)',
                    'Online / Remote Service (B2B)'
                  ].map(loc => (
                    <label key={loc} className={`flex items-center space-x-2.5 p-2.5 rounded-xl border cursor-pointer text-xs font-medium ${
                      locationSetup === loc ? 'border-blue-600 bg-blue-50/60 text-blue-900 font-bold' : 'border-slate-200 text-slate-600'
                    }`}>
                      <input
                        type="radio"
                        name="locationSetup"
                        checked={locationSetup === loc}
                        onChange={() => setLocationSetup(loc)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>{loc}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Business Age Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">How Long Ago Business Started</label>
                  <select
                    value={businessAge}
                    onChange={e => setBusinessAge(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs clay-input"
                  >
                    <option value="Just Launched (< 1 Year)">Just Launched (&lt; 1 Year)</option>
                    <option value="1 - 3 Years">1 - 3 Years</option>
                    <option value="3 - 5 Years">3 - 5 Years</option>
                    <option value="5 - 10+ Years">5 - 10+ Years Established</option>
                  </select>
                </div>

                {/* Target Audience */}
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">Target Audience (Multi-Select)</label>
                  <div className="flex gap-2">
                    {['B2B', 'B2C', 'D2C', 'All'].map(aud => {
                      const isSelected = aud === 'All'
                        ? ['B2B', 'B2C', 'D2C'].every(a => targetAudience.includes(a))
                        : targetAudience.includes(aud);

                      return (
                        <button
                          key={aud}
                          type="button"
                          onClick={() => {
                            if (aud === 'All') {
                              if (isSelected) {
                                setTargetAudience(['B2B']);
                              } else {
                                setTargetAudience(['B2B', 'B2C', 'D2C', 'All']);
                              }
                            } else {
                              if (targetAudience.includes(aud)) {
                                const updated = targetAudience.filter(a => a !== aud && a !== 'All');
                                setTargetAudience(updated.length > 0 ? updated : ['B2B']);
                              } else {
                                const next = [...targetAudience.filter(a => a !== 'All'), aud];
                                if (['B2B', 'B2C', 'D2C'].every(a => next.includes(a))) {
                                  next.push('All');
                                }
                                setTargetAudience(next);
                              }
                            }
                          }}
                          className={`flex-1 py-2.5 text-xs font-bold rounded-xl border transition-all ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {aud}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Supported Languages */}
              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1.5">Supported Languages</label>
                <div className="flex items-center gap-4">
                  {['English', 'Hinglish'].map(lang => (
                    <label key={lang} className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={supportedLangs.includes(lang)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSupportedLangs([...supportedLangs, lang]);
                          } else {
                            if (supportedLangs.length > 1) {
                              setSupportedLangs(supportedLangs.filter(l => l !== lang));
                            }
                          }
                        }}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span>{lang === 'Hinglish' ? 'Hinglish' : 'English'}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tone & Enthusiasm */}
              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">Tone & Enthusiasm</label>
                <select
                  value={toneEnthusiasm}
                  onChange={e => setToneEnthusiasm(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs clay-input"
                >
                  <option value="Subtle & Professional (B2B/Medical)">Subtle & Professional (B2B/Medical)</option>
                  <option value="Casual & Friendly">Casual & Friendly</option>
                  <option value="Expressive">Expressive</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 3: SaaS Subscription Plan & Quotas */}
          {onboardingStep === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#1E293B] mb-1">Assigned Plan (Auto-Fetched)</label>
                <select
                  value={planId}
                  onChange={(e) => {
                    const selectedPlanId = e.target.value;
                    setPlanId(selectedPlanId);
                    const selectedPlan = plans.find(p => p.id === selectedPlanId);
                    if (selectedPlan) {
                      setBranchLimit(selectedPlan.maxBranches);
                      setMonthlyTokens(selectedPlan.monthlyTokens);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 text-xs clay-input font-medium"
                  required
                >
                  <option value="" disabled>Select a plan...</option>
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (₹{p.priceMonthly}/mo - {p.maxBranches} Branch(es), {p.monthlyTokens.toLocaleString()} tokens)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">Branch Limit</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={branchLimit}
                    onChange={e => setBranchLimit(parseInt(e.target.value) || 1)}
                    className="w-full px-3.5 py-2.5 text-xs clay-input font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">Monthly AI Quota (Tokens)</label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={monthlyTokens}
                    onChange={e => setMonthlyTokens(parseInt(e.target.value) || 10000)}
                    className="w-full px-3.5 py-2.5 text-xs clay-input font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <p className="text-[11px] font-bold text-slate-700">Account Provision Summary:</p>
                <p className="text-[10px] text-slate-500">Business: <strong>{bizName || 'N/A'}</strong> ({bizCategory || 'General'})</p>
                <p className="text-[10px] text-slate-500">Owner: <strong>{ownerName || 'N/A'}</strong> ({ownerEmail || 'N/A'})</p>
                <p className="text-[10px] text-slate-500">Scale Grounding: {teamSize} | {targetAudience} | {locationSetup}</p>
              </div>
            </div>
          )}

          {/* Dynamic Action Buttons */}
          <div className="pt-4 border-t border-[#E8EDF5] flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-2">
            <div>
              {onboardingStep === 1 ? (
                <button
                  type="button"
                  onClick={() => setIsBizModalOpen(false)}
                  className="w-full sm:w-auto px-5 py-2.5 clay-btn-secondary text-xs font-bold flex items-center justify-center cursor-pointer"
                >
                  Cancel
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setOnboardingStep((onboardingStep - 1) as 1 | 2)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center cursor-pointer transition-colors"
                >
                  <ChevronLeft/> Back
                </button>
              )}
            </div>

            <div className="w-full sm:w-auto flex justify-end">
              {onboardingStep === 1 && (
                <button
                  type="button"
                  onClick={() => {
                    setBizModalError('');
                    if (!bizName.trim()) { setBizModalError('Business Name is required.'); return; }
                    if (!bizCategory.trim()) { setBizModalError('Category is required.'); return; }
                    if (!ownerName.trim()) { setBizModalError('Owner Name is required.'); return; }
                    if (!ownerEmail.trim()) { setBizModalError('Owner Email is required.'); return; }

                    const cleanPhone = ownerPhone.trim().replace(/[\s\-]/g, '');
                    if (!cleanPhone) {
                      setBizModalError('Owner Phone Number is required.');
                      return;
                    }
                    if (!/^(?:\+91|0)?[6-9]\d{9}$/.test(cleanPhone)) {
                      setBizModalError('Please enter a valid 10-digit Indian phone number (e.g. 9876543210 or +91 9876543210).');
                      return;
                    }

                    if (!bizGoogleReviewUrl.trim()) {
                      setBizModalError('Google Business Review Link is required.');
                      return;
                    }

                    if (!editingBiz) {
                      if (!ownerPassword.trim()) { setBizModalError('Password is required.'); return; }
                      if (ownerPassword.length < 6) { setBizModalError('Password must be 6+ chars.'); return; }
                      if (ownerPassword !== confirmPassword) { setBizModalError('Passwords do not match.'); return; }
                    }
                    setOnboardingStep(2);
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 clay-btn-primary text-xs font-bold flex items-center justify-center cursor-pointer shadow-xs"
                >
                  Next: AI Grounding <ChevronRight/>
                </button>
              )}

              {onboardingStep === 2 && (
                <button
                  type="button"
                  onClick={() => setOnboardingStep(3)}
                  className="w-full sm:w-auto px-5 py-2.5 clay-btn-primary text-xs font-bold flex items-center justify-center cursor-pointer shadow-xs"
                >
                  Next: Plan &amp; Quotas <ChevronRight />
                </button>
              )}

              {onboardingStep === 3 && (
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 clay-btn-primary text-xs font-bold flex items-center justify-center cursor-pointer shadow-xs"
                >
                  Save Business &amp; Provision Account
                </button>
              )}
            </div>
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
                type="tel"
                pattern="^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$"
                title="Please enter a valid phone number (e.g., +91 98765 43210)"
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
      <label className="block text-xs font-bold text-[#1E293B] mb-1">Banner Title</label>
      <input
        type="text"
        required
        value={adTitle}
        onChange={e => setAdTitle(e.target.value)}
        placeholder="e.g. System Maintenance Notice / Upgrade Offer"
        className="w-full px-3.5 py-2.5 text-xs clay-input"
      />
    </div>
    
    <div>
      <label className="block text-xs font-bold text-[#1E293B] mb-1">Message / Description</label>
      <textarea
        required
        value={adDesc}
        onChange={e => setAdDesc(e.target.value)}
        placeholder="Brief description of the announcement or offer..."
        rows={3}
        className="w-full p-3.5 text-xs clay-input"
      />
    </div>

    {/* NEW: Enable/Disable WhatsApp Button Toggle */}
    <div className="flex items-center justify-between p-3.5 bg-[#F8FAFC] border border-[#DCE3EC] rounded-xl">
      <div className="space-y-0.5">
        <label className="text-xs font-bold text-[#1E293B] cursor-pointer" htmlFor="whatsapp-toggle">
          Enable WhatsApp Enquiry Button
        </label>
        <p className="text-[11px] text-[#64748B]">
          Turn off for informational notices (e.g. server maintenance updates).
        </p>
      </div>
      <input
        id="whatsapp-toggle"
        type="checkbox"
        checked={showWhatsApp}
        onChange={e => setShowWhatsApp(e.target.checked)}
        className="w-4 h-4 text-[#2563EB] rounded border-[#DCE3EC] focus:ring-[#2563EB] cursor-pointer"
      />
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

      {/* EDIT / CREATE PLAN MODAL */}
      <Modal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        title={editingPlan ? 'Edit Plan' : 'Create New Plan'}
        subtitle={editingPlan ? 'Modify plan limits, pricing, and features. Changes will automatically cascade to all businesses on this plan.' : 'Define new tier pricing, branch limits, and monthly AI token quota.'}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const numericPrice = Number(editPlanPrice) || 0;
            const numericBranches = Number(editPlanBranches) || 1;
            const numericTokens = Number(editPlanTokens) || 10000;
            try {
              if (editingPlan) {
                await fetchWithAuth(`/api/plans/${editingPlan.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    name: editPlanName,
                    priceMonthly: numericPrice,
                    maxBranches: numericBranches,
                    monthlyTokens: numericTokens,
                  }),
                });
                showToast(`Successfully updated ${editPlanName} plan!`);
              } else {
                await fetchWithAuth('/api/plans', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    name: editPlanName,
                    priceMonthly: numericPrice,
                    priceYearly: numericPrice * 10,
                    maxBranches: numericBranches,
                    monthlyTokens: numericTokens,
                    features: [
                      `Max ${numericBranches} Branch Location(s)`,
                      `${numericTokens.toLocaleString()} Monthly AI Tokens`,
                      'White-label Customer Review Portal'
                    ],
                    status: 'ACTIVE'
                  }),
                });
                showToast(`Successfully created ${editPlanName} plan!`);
              }
              setIsPlanModalOpen(false);
              loadAgencyData();
            } catch (err) {
              console.error(err);
              showToast('Failed to save plan.', 'error');
            }
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-bold text-[#1E293B] mb-1">Plan Name</label>
            <input
              type="text"
              required
              value={editPlanName}
              onChange={(e) => setEditPlanName(e.target.value)}
              placeholder="e.g. Enterprise Unlimited, Starter Lite"
              className="w-full px-3.5 py-2.5 text-xs clay-input"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#1E293B] mb-1">Monthly Price (₹)</label>
            <input
              type="number"
              required
              min={0}
              value={editPlanPrice}
              onChange={(e) => setEditPlanPrice(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3.5 py-2.5 text-xs clay-input"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1E293B] mb-1">Max Branches</label>
              <input
                type="number"
                required
                min={1}
                value={editPlanBranches}
                onChange={(e) => setEditPlanBranches(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs clay-input"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#1E293B] mb-1">Monthly Tokens</label>
              <input
                type="number"
                required
                min={1000}
                value={editPlanTokens}
                onChange={(e) => setEditPlanTokens(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs clay-input font-mono"
              />
            </div>
          </div>
          <div className="pt-3 border-t border-[#E8EDF5] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsPlanModalOpen(false)}
              className="px-5 py-2.5 clay-btn-secondary text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 clay-btn-primary text-xs font-bold cursor-pointer shadow-xs"
            >
              {editingPlan ? 'Save Changes' : 'Create Plan'}
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
        onSaveSuccess={async () => {
          if (selectedBusiness) {
            try {
              const brRes = await fetchWithAuth(`/api/branches?businessId=${selectedBusiness.id}`).then(r => r.json());
              if (brRes.success) {
                setBusinessBranches(brRes.data || []);
                if (selectedQrBranch) {
                  const updated = brRes.data.find((b: Branch) => b.id === selectedQrBranch.id);
                  if (updated) setSelectedQrBranch(updated);
                }
              }
              // Also reload reviews/feedback
              const [revRes, fbRes] = await Promise.all([
                fetchWithAuth(`/api/reviews?businessId=${selectedBusiness.id}`).then(r => r.json()),
                fetchWithAuth(`/api/feedback?businessId=${selectedBusiness.id}`).then(r => r.json()),
              ]);
              if (revRes.success) setBusinessReviews(revRes.data || []);
              if (fbRes.success) setBusinessFeedback(fbRes.data || []);
            } catch (err) {
              console.error('Error reloading business details after QR save:', err);
            }
          } else {
            await loadAgencyProfileData();
          }
        }}
      />
    </div>
  );
};
