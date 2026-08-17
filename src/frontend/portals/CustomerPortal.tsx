import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Business, Branch } from '../../types';
import { Star, Sparkles, Check, Copy, ExternalLink, ThumbsUp, MessageSquare, Send, HeartHandshake, ShieldCheck, Building2, ChevronDown, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';

export const CustomerPortal: React.FC = () => {
  const { currentBranch: authBranch, currentBusiness: authBusiness } = useAuth();

  const [allBusinesses, setAllBusinesses] = useState<Business[]>([]);
  const [allBranches, setAllBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  
  const [activeBranch, setActiveBranch] = useState<Branch | null>(authBranch);
  const [activeBusiness, setActiveBusiness] = useState<Business | null>(authBusiness);

  const [step, setStep] = useState<'RATING' | 'TAGS' | 'GENERATING' | 'REVIEW_EDITOR' | 'FEEDBACK' | 'THANK_YOU' | 'BLOCKED'>('RATING');
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customNote, setCustomNote] = useState<string>('');
  const [generatedReview, setGeneratedReview] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDirectLink, setIsDirectLink] = useState<boolean>(false);

  // Low rating feedback form
  const [feedbackName, setFeedbackName] = useState<string>('');
  const [feedbackEmail, setFeedbackEmail] = useState<string>('');
  const [feedbackPhone, setFeedbackPhone] = useState<string>('');
  const [feedbackCategory, setFeedbackCategory] = useState<string>('');
  const [feedbackComments, setFeedbackComments] = useState<string>('');

  // Fetch all businesses and branches for the demo switcher
  useEffect(() => {
    const fetchDemoData = async () => {
      try {
        const [bizRes, brRes] = await Promise.all([
          fetch('/api/businesses/public').then(r => r.json()),
          fetch('/api/branches/public').then(r => r.json()),
        ]);

        if (bizRes.success && bizRes.data) setAllBusinesses(bizRes.data);
        if (brRes.success && brRes.data) setAllBranches(brRes.data);

        // Check URL branchId query param or /review/ path
        const urlParams = new URLSearchParams(window.location.search);
        let queryBranchId = urlParams.get('branchId');

        if (window.location.pathname.startsWith('/review/')) {
          queryBranchId = window.location.pathname.split('/review/')[1];
        }

        if (queryBranchId && brRes.data) {
          setIsDirectLink(true);
          const match = brRes.data.find((b: Branch) => b.id === queryBranchId);
          if (match) {
            setActiveBranch(match);
            setSelectedBranchId(match.id);
            if (bizRes.data) {
              const matchedBiz = bizRes.data.find((bz: Business) => bz.id === match.businessId);
              if (matchedBiz) {
                setActiveBusiness(matchedBiz);
                if (matchedBiz.status === 'SUSPENDED') {
                  setBlockedMessage('This account is suspended!');
                  setStep('BLOCKED');
                }
              }
            }

            // Track QR Scan event
            fetch('/api/settings/qr/track', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                branchId: match.id,
                businessId: match.businessId,
                deviceType: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
                browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Safari',
                city: 'Mumbai',
                country: 'India',
                referrer: 'QR Scanner Standee'
              })
            }).catch(() => {});
          }
        }
      } catch (err) {
        console.error('Error fetching demo businesses:', err);
      }
    };

    fetchDemoData();
  }, []);

  // Update active branch when dropdown selection changes
  const handleBranchSelect = (branchId: string) => {
    setSelectedBranchId(branchId);
    const targetBranch = allBranches.find(b => b.id === branchId);
    if (targetBranch) {
      setActiveBranch(targetBranch);
      const targetBiz = allBusinesses.find(b => b.id === targetBranch.businessId);
      if (targetBiz) {
        setActiveBusiness(targetBiz);
      }
      // Reset state for new rating
      setStep('RATING');
      setRating(5);
      setSelectedTags([]);
      setCustomNote('');
      setGeneratedReview('');
    }
  };

  const branchName = activeBranch?.name || authBranch?.name || 'Main Branch';
  const businessName = activeBusiness?.name || authBusiness?.name || 'Smile Dental Clinic';
  const logoUrl = activeBusiness?.logoUrl || authBusiness?.logoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200';
  const availableTags = activeBranch?.serviceTags || authBranch?.serviceTags || [
    '⚡️ Fast & Friendly',
    '🔥 Top Tier Service',
    '✨ Aesthetics on Point',
    '💖 Friendly Staff',
    '🙌 Gentle Care',
    '💯 10/10 Experience',
    '🎯 Smooth Visit',
    '☕️ Great Vibes',
  ];

  const handleRatingSelect = (selectedStar: number) => {
    setRating(selectedStar);
    // Direct low ratings to the feedback form immediately; higher ratings proceed to tag selection
    if (selectedStar < 4) {
      setStep('FEEDBACK');
    } else {
      setStep('TAGS');
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleGenerateAIReview = async () => {
    if (activeBusiness?.status === 'SUSPENDED' || activeBusiness?.status === 'INACTIVE') {
      setBlockedMessage('This business is currently unavailable.');
      setStep('BLOCKED');
      return;
    }

    setIsSubmitting(true);
    setStep('GENERATING');

    try {
      const res = await fetch('/api/reviews/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branchId: activeBranch?.id || 'branch-smile-main',
          rating,
          serviceTags: selectedTags,
          customNote,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        const msg = json.message || 'This business has reached its monthly AI usage limit. Please try again after the monthly reset.';
        setBlockedMessage(msg);
        setStep('BLOCKED');
        return;
      }

      if (json.data?.reviewText) {
        setGeneratedReview(json.data.reviewText);
        if (rating >= 4) {
          setStep('REVIEW_EDITOR');
        } else {
          setStep('FEEDBACK');
        }
      }
    } catch (e: any) {
      console.error(e);
      setBlockedMessage('This business has reached its monthly AI usage limit or is currently unavailable. Please try again later.');
      setStep('BLOCKED');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboardFallback = (text: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).catch(err => console.error('Clipboard error:', err));
    } else {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch (e) {
        console.error('Fallback copy failed', e);
      }
    }
  };

  const handleCopyReview = () => {
    copyToClipboardFallback(generatedReview);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePostToGoogle = async () => {
    // Copy review text first
    copyToClipboardFallback(generatedReview);

    // Save to database
    try {
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branchId: activeBranch?.id || 'branch-smile-main',
          branchName,
          businessId: activeBusiness?.id || 'biz-smile-dental',
          rating,
          serviceTags: selectedTags,
          reviewText: generatedReview,
          aiGenerated: true,
          postedToGoogle: true,
          copiedToClipboard: true,
          tokensUsed: 280,
        }),
      });
    } catch (e) {
      console.error(e);
    }

    // Trigger confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {}

    // Open Google Review Link in new tab
    const googleUrl = activeBranch?.googleReviewUrl || 'https://search.google.com/local/writereview';
    
    // Alert the user that they must paste manually
    alert("Copied successfully! \n\nBecause of browser security, we cannot paste it for you. Please Paste (Ctrl+V) your review into the Google text box.");
    
    window.open(googleUrl, '_blank');

    setStep('THANK_YOU');
  };

  const handleSubmitInternalFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const actualCategory = feedbackCategory || (activeBranch?.negativeTags && activeBranch.negativeTags.length > 0 ? activeBranch.negativeTags[0] : 'Service Quality');

    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branchId: activeBranch?.id || 'branch-smile-main',
          branchName,
          businessId: activeBusiness?.id || 'biz-smile-dental',
          rating,
          category: actualCategory,
          customerName: feedbackName || 'Anonymous Customer',
          customerEmail: feedbackEmail,
          customerPhone: feedbackPhone,
          comments: feedbackComments || 'Feedback regarding lower star rating experience.',
        }),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
      setStep('THANK_YOU');
    }
  };

  return (
    <div className="bg-[#F5F7FB] flex flex-col items-center p-4 sm:p-6 font-sans">
      
      {/* Customer Demo Switcher Banner */}
      {!isDirectLink && (
        <div className="w-full max-w-lg mb-4 clay-card bg-white p-3 border border-[#DCE3EC] flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-[#1E293B] font-extrabold shrink-0">
            <Building2 className="w-4 h-4 text-[#2563EB]" />
            <span>Select Branch:</span>
          </div>

          <div className="relative flex-1">
            <select
              value={activeBranch?.id || ''}
              onChange={(e) => handleBranchSelect(e.target.value)}
              className="w-full appearance-none bg-[#EEF2F7] text-[#1E293B] font-bold px-3 py-1.5 pr-8 rounded-xl border border-[#DCE3EC] cursor-pointer text-xs focus:outline-none"
            >
              <option value="" disabled>Select a Business Branch to Demo</option>
              <option value="branch-agency-main">🏢 ReviewScore AI Agency (Demo)</option>
              {allBranches.filter(b => b.id !== 'branch-agency-main').map(b => {
                const biz = allBusinesses.find(bz => bz.id === b.businessId);
                return (
                  <option key={b.id} value={b.id}>
                    {biz ? `${biz.name} - ${b.name}` : b.name}
                  </option>
                );
              })}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#64748B] absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>
      )}

      <div className="w-full max-w-lg clay-card bg-white overflow-hidden border border-[#DCE3EC]">
        {/* Header Branding with Centered Logo */}
        <div className="bg-[#EEF2F7] p-6 text-center text-[#1E293B] relative flex flex-col items-center border-b border-[#DCE3EC] shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9)]">
          {logoUrl && (
            <div className="w-14 h-14 bg-white p-1 rounded-2xl shadow-[2px_2px_6px_rgba(100,116,139,0.1)] mb-3 border border-[#DCE3EC] overflow-hidden flex items-center justify-center shrink-0">
              <img src={logoUrl} alt={businessName} className="w-full h-full object-contain rounded-xl" />
            </div>
          )}

          <div className="inline-flex items-center space-x-1.5 bg-blue-50 px-3.5 py-1 rounded-full text-xs font-semibold text-blue-700 mb-1.5 border border-blue-200/80">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>{businessName}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">{branchName}</h2>
          <p className="text-xs text-slate-500 mt-1 font-normal">Hey bestie! 👋 How was your vibe & service today?</p>
        </div>

        {/* Dynamic Step Content */}
        <div className="p-6 sm:p-8">
          {/* STEP 1: RATING SELECTION */}
          {step === 'RATING' && (
            <div className="text-center space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Spill the tea! How was your visit? ☕️</h3>
                <p className="text-xs text-slate-500 mt-1">Tap a star for an instant vibe check ✨</p>
              </div>

              <div className="flex justify-center items-center gap-1 sm:gap-2 py-4 flex-wrap">
                {[1, 2, 3, 4, 5].map(star => {
                  const active = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingSelect(star)}
                      onTouchStart={(e) => { e.preventDefault(); setHoverRating(star); handleRatingSelect(star); }}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="shrink-0 min-w-[44px] min-h-[44px] sm:min-w-[48px] sm:min-h-[48px] p-1.5 sm:p-2 flex items-center justify-center focus:outline-none transform hover:scale-110 active:scale-95 transition-transform cursor-pointer select-none"
                      aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                    >
                      <Star
                        className={`w-8 h-8 sm:w-9 sm:h-9 sm:w-11 sm:h-11 transition-colors ${
                          active ? 'text-amber-400 fill-amber-400 drop-shadow-xs' : 'text-slate-200'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <div className="min-h-[28px] flex items-center justify-center">
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200/80 shadow-2xs inline-block">
                  {hoverRating === 5 || (!hoverRating && rating === 5)
                    ? '😍 Absolutely Slaps! 10/10 ✨'
                    : hoverRating === 4 || (!hoverRating && rating === 4)
                    ? '🤩 Super Solid Vibe! 🔥'
                    : hoverRating === 3 || (!hoverRating && rating === 3)
                    ? '🙂 Pretty Decent / Okay'
                    : hoverRating === 2 || (!hoverRating && rating === 2)
                    ? '🙁 Could Be Better'
                    : '👎 Unsatisfactory / Needs Work'}
                </span>
              </div>
            </div>
          )}

          {/* STEP 2: SERVICE TAG SELECTION */}
          {step === 'TAGS' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-[#F59E0B] mb-1">
                  {[...Array(rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#F59E0B] text-[#F59E0B]" />
                  ))}
                </div>
                <h3 className="text-lg font-extrabold text-[#1E293B]">What did you like most?</h3>
                <p className="text-xs text-[#64748B] mt-1">Select one or more highlights to generate your review</p>
              </div>

              <div className="flex flex-wrap gap-2 justify-center py-2">
                {availableTags.map(tag => {
                  const selected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3.5 py-2 text-xs font-extrabold transition-all rounded-xl border cursor-pointer ${
                        selected
                          ? 'clay-btn-primary'
                          : 'bg-white text-[#1E293B] border-[#DCE3EC] hover:bg-[#EEF2F7]'
                      }`}
                    >
                      {selected ? '✓ ' : '+ '}
                      {tag}
                    </button>
                  );
                })}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">
                  Additional Note or Doctor/Staff Name (Optional)
                </label>
                <input
                  type="text"
                  value={customNote}
                  onChange={e => setCustomNote(e.target.value)}
                  placeholder="e.g., Dr. Carter was very patient and friendly!"
                  className="w-full px-3.5 py-2.5 text-xs clay-input"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setStep('RATING')}
                  className="w-1/3 py-2.5 px-3 clay-btn-secondary text-xs cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={handleGenerateAIReview}
                  className="w-2/3 py-2.5 px-4 clay-btn-primary flex items-center justify-center space-x-2 text-xs cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>{rating >= 4 ? 'Generate AI Review' : 'Continue Feedback'}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: GENERATING LOADING STATE */}
          {step === 'GENERATING' && (
            <div className="py-12 text-center space-y-4">
              <div className="w-12 h-12 bg-[#EEF2F7] text-[#2563EB] rounded-2xl border border-[#DCE3EC] mx-auto flex items-center justify-center shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9)]">
                <Loader2 className="w-6 h-6 animate-spin text-[#2563EB]" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#1E293B]">Formulating review with Gemini AI...</h3>
                <p className="text-xs text-[#64748B] mt-1">Drafting an authentic, detailed response</p>
              </div>
            </div>
          )}

          {/* STEP BLOCKED (Quota Exceeded / Business Suspended / Expired) */}
          {step === 'BLOCKED' && (
            <div className="py-8 text-center space-y-4">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl border border-amber-200 mx-auto flex items-center justify-center shadow-xs">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
              <div className="space-y-2 max-w-sm mx-auto">
                <h3 className="text-base font-extrabold text-[#1E293B]">Notice</h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  {blockedMessage || 'This business has reached its monthly AI usage limit. Please try again after the monthly reset.'}
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => {
                    setStep('RATING');
                    setBlockedMessage(null);
                  }}
                  className="px-4 py-2 clay-btn-secondary text-xs cursor-pointer"
                >
                  Start Over
                </button>
              </div>
            </div>
          )}

          {/* STEP 4A: REVIEW EDITOR & GOOGLE POST (Rating >= 4) */}
          {step === 'REVIEW_EDITOR' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#1E293B] uppercase tracking-wider flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Your Generated Review</span>
                </span>
                <span className="text-[11px] font-extrabold text-[#2563EB] bg-[#EEF2F7] px-2.5 py-0.5 rounded-full border border-[#DCE3EC]">
                  Ready for Google
                </span>
              </div>

              <div className="relative">
                <textarea
                  value={generatedReview}
                  onChange={e => setGeneratedReview(e.target.value)}
                  rows={4}
                  className="w-full p-3.5 text-xs font-medium text-[#1E293B] bg-[#EEF2F7] rounded-2xl border border-[#DCE3EC] leading-relaxed shadow-[inset_1px_1px_3px_rgba(255,255,255,0.9)] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
                <button
                  onClick={handleCopyReview}
                  className="absolute bottom-3 right-3 px-2.5 py-1 clay-btn-secondary text-[11px] font-bold flex items-center space-x-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-[#22C55E]" /> : <Copy className="w-3 h-3 text-[#1E293B]" />}
                  <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                </button>
              </div>

              <div className="bg-[#EEF2F7] text-[#1E293B] p-3.5 rounded-2xl border border-[#DCE3EC] text-xs flex items-start space-x-2.5 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9)]">
                <ShieldCheck className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                <p className="text-[11px] leading-snug">
                  <strong>Important:</strong> Browsers do not allow automatic pasting into Google. Clicking <strong>"Post to Google Reviews"</strong> will copy your text. You must <strong>Paste (Ctrl+V)</strong> it into the Google box yourself!
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={handlePostToGoogle}
                  className="w-full py-3.5 px-4 clay-btn-primary flex items-center justify-center space-x-2 text-xs cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Post on Google Reviews</span>
                </button>

                <button
                  onClick={handleCopyReview}
                  className="w-full py-2.5 px-4 clay-btn-secondary text-xs flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy Text Only'}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4B: INTERNAL FEEDBACK FORM (Rating < 4 Gatekeeper) */}
          {step === 'FEEDBACK' && (
            <form onSubmit={handleSubmitInternalFeedback} className="space-y-4">
              <div className="bg-[#EEF2F7] text-[#1E293B] p-4 rounded-2xl border border-[#DCE3EC] text-xs space-y-1 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9)]">
                <div className="flex items-center space-x-1.5 font-extrabold text-[#2563EB]">
                  <HeartHandshake className="w-4 h-4 text-[#2563EB]" />
                  <span>Direct Management Resolution</span>
                </div>
                <p className="text-[11px] text-[#64748B] leading-relaxed">
                  We sincerely apologize if your visit didn't meet 5-star expectations. Please send direct feedback below so our manager can resolve this immediately.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">Your Name (Optional)</label>
                <input
                  type="text"
                  value={feedbackName}
                  onChange={e => setFeedbackName(e.target.value)}
                  placeholder="e.g., Jane Smith"
                  className="w-full px-3.5 py-2.5 text-xs clay-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    value={feedbackEmail}
                    onChange={e => setFeedbackEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className="w-full px-3.5 py-2.5 text-xs clay-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">Phone (Optional)</label>
                  <input
                    type="tel"
                    value={feedbackPhone}
                    onChange={e => setFeedbackPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 text-xs clay-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">Constructive Feedback</label>
                <select
                  value={feedbackCategory}
                  onChange={e => setFeedbackCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs clay-input"
                >
                  <option value="" disabled>Select a suggestion keyword...</option>
                  {(activeBranch?.negativeTags && activeBranch.negativeTags.length > 0 
                    ? [...activeBranch.negativeTags, 'Other'] 
                    : ['Wait Time / Delay', 'Service Quality', 'Staff Behavior', 'Billing or Pricing Query', 'Hygiene or Cleanliness', 'Other']
                  ).map((opt, idx) => (
                    <option key={idx} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">Private Comments for Management (Required)</label>
                <textarea
                  rows={3}
                  value={feedbackComments}
                  onChange={e => setFeedbackComments(e.target.value)}
                  placeholder="Please describe what happened so we can address it..."
                  className="w-full p-3.5 text-xs clay-input"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 clay-btn-primary text-xs flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>Submitting Feedback...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Private Feedback</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep('RATING')}
                className="w-full mt-3 py-3 px-4 border border-[#E6EEF7] rounded-xl text-[#2563EB] font-extrabold text-xs flex items-center justify-center shadow-[0_6px_20px_rgba(37,99,235,0.06)] hover:bg-[#F7FBFF] transition-colors cursor-pointer"
              >
                <span className="mr-2">←</span>
                <span>Back</span>
              </button>
            </form>
          )}

          {/* STEP 5: THANK YOU SCREEN */}
          {step === 'THANK_YOU' && (
            <div className="py-8 text-center space-y-5">
              <div className="w-14 h-14 bg-[#2563EB] text-white rounded-2xl mx-auto flex items-center justify-center font-bold shadow-[1px_1px_6px_rgba(37,99,235,0.4)]">
                <Check className="w-7 h-7 stroke-[3]" />
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-[#1E293B]">Thank You So Much!</h3>
                <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
                  Your feedback helps us continuously improve our service at {businessName}.
                </p>
              </div>

              <div className="p-3.5 bg-[#EEF2F7] text-[#1E293B] rounded-2xl border border-[#DCE3EC] text-xs font-extrabold shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9)]">
                ★ Present this confirmation screen at the front counter on your next visit for 10% off your next service!
              </div>

              <button
                onClick={() => {
                  setStep('RATING');
                  setRating(5);
                  setSelectedTags([]);
                  setCustomNote('');
                  setGeneratedReview('');
                }}
                className="px-6 py-2.5 clay-btn-secondary text-xs cursor-pointer"
              >
                Submit Another Review
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
