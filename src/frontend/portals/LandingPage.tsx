import React, { useState, useEffect } from 'react';
import { Plan } from '../../types';
import {
  Sparkles, Star, ShieldCheck, QrCode, TrendingUp, MessageSquare, Building2,
  Check, ArrowRight, PhoneCall, Zap, Lock, ExternalLink, HelpCircle, CheckCircle2, MessageCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [whatsappPhone, setWhatsappPhone] = useState('15550192834');
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);

  // Interactive Hero Preview state
  const [demoSelectedTags, setDemoSelectedTags] = useState<string[]>(['Friendly Staff', 'Gentle Care']);
  const [demoRating, setDemoRating] = useState<number>(5);
  const [demoReviewText, setDemoReviewText] = useState<string>(
    'An outstanding experience! The staff was incredibly friendly and gentle throughout the visit. Highly recommended!'
  );
  const [isGeneratingDemo, setIsGeneratingDemo] = useState(false);

  useEffect(() => {
    fetch('/api/plans')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setPlans(data.data);
        }
      })
      .catch(err => console.error('Error fetching plans for landing page:', err))
      .finally(() => setIsLoadingPlans(false));

    fetch('/api/settings/system')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data && data.data.supportPhone) {
          setWhatsappPhone(data.data.supportPhone.replace(/[^0-9]/g, ''));
        }
      })
      .catch(() => {});
  }, []);

  const getWhatsappUrl = (plan: Plan) => {
    const text = `Hello! I am interested in purchasing the *${plan.name}* plan ($${plan.priceMonthly}/mo) for ReviewScore AI. Features: Up to ${plan.maxBranches} branches & ${plan.monthlyTokens.toLocaleString()} AI tokens. Please share onboarding details!`;
    const cleanNumber = whatsappPhone || '15550192834';
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
  };

  const toggleDemoTag = (tag: string) => {
    const updated = demoSelectedTags.includes(tag)
      ? demoSelectedTags.filter(t => t !== tag)
      : [...demoSelectedTags, tag];
    setDemoSelectedTags(updated);

    // Simulate instant AI review synthesis update
    if (demoRating >= 4) {
      if (updated.length === 0) {
        setDemoReviewText('Great service and welcoming environment! Had a fantastic visit.');
      } else {
        setDemoReviewText(
          `Wonderful experience! Highlights included ${updated.join(' and lowercase ')}. The team exceeded all my expectations!`
        );
      }
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* HERO SECTION */}
      <section className="relative pt-8 pb-12 lg:pt-12 lg:pb-16 overflow-hidden">
        {/* Subtle Ambient Light Glow Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-500/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center space-x-2 bg-blue-50/80 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-blue-200/80 text-xs font-semibold text-blue-700 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
              <span>✨ Real Human Vibe Engine • No Cap Review Growth 🧢</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              Multiply 5-Star Google Reviews with AI Assistance
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
              Convert happy customers into detailed 5-star Google reviews in seconds.
              Intercept low ratings privately before they ever hit your public listing.
            </p>

            {/* Hero Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => navigate('/review')}
                className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-xs shadow-blue-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <QrCode className="w-4 h-4" />
                <span>Try Live Review Card Demo</span>
              </button>

              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200/90 font-semibold text-sm rounded-xl shadow-2xs flex items-center justify-center space-x-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Owner Dashboard Login</span>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {/* Micro proof line */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Powered by Gemini AI</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Direct Google Place ID Integration</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Smart Negative Rating Shield</span>
              </span>
            </div>
          </div>

          {/* INTERACTIVE LIVE PREVIEW TEASER (YC Style) */}
          <div className="mt-12 max-w-4xl mx-auto bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Live Customer Experience Sandbox</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Interactive Demo</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Left Column: Customer Selections */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-2">1. Customer Rating</label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => {
                          setDemoRating(star);
                          if (star < 4) {
                            setDemoReviewText('The wait time was a bit longer than expected. I would like to speak to a manager regarding my visit.');
                          } else {
                            setDemoReviewText('An outstanding experience! The staff was incredibly friendly and gentle throughout the visit.');
                          }
                        }}
                        className={`p-2 rounded-xl border transition-all cursor-pointer ${
                          star <= demoRating
                            ? 'bg-amber-50 border-amber-300 text-amber-500'
                            : 'bg-slate-50 border-slate-200 text-slate-300'
                        }`}
                      >
                        <Star className={`w-5 h-5 ${star <= demoRating ? 'fill-amber-400 text-amber-400' : ''}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-2">2. Quick Experience Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {['⚡️ Fast & Friendly', '🔥 Top Tier Vibe', '✨ Aesthetics on Point', '💯 10/10 Care'].map((tag) => {
                      const isSel = demoSelectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          onClick={() => toggleDemoTag(tag)}
                          className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-all cursor-pointer ${
                            isSel
                              ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {isSel ? '✓ ' : '+ '}
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: AI Output Simulation */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Gemini AI Generated Review</span>
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    demoRating >= 4 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {demoRating >= 4 ? 'Redirects to Google Maps' : 'Private Inbox Gatekeeper'}
                  </span>
                </div>

                <div className="bg-white p-3.5 rounded-lg border border-slate-200/80 text-xs text-slate-800 leading-relaxed font-normal shadow-2xs">
                  "{demoReviewText}"
                </div>

                <div className="pt-2">
                  {demoRating >= 4 ? (
                    <div className="w-full py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg text-center shadow-2xs flex items-center justify-center space-x-1.5">
                      <span>Copy & Open Google Review Link</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="w-full py-2 bg-rose-600 text-white text-xs font-semibold rounded-lg text-center shadow-2xs flex items-center justify-center space-x-1.5">
                      <span>Submit Private Manager Feedback</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS (AS YC BENTO GRID) */}
      <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/80">
            Automated Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Designed for Zero Customer Friction
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Eliminate review blocks while automatically routing bad ratings away from public search results.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-7 border border-slate-200/80 rounded-2xl space-y-4 shadow-2xs hover:shadow-sm transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-100">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">1. Instant QR Counter Tap</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Place custom branded QR stands at checkout counters, tables, or receipts. Customers scan with any smartphone camera.
            </p>
            <div className="pt-3 border-t border-slate-100 text-xs text-slate-700 space-y-2">
              <div className="flex items-center space-x-2 font-medium">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>No mobile app download needed</span>
              </div>
              <div className="flex items-center space-x-2 font-medium">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Multi-branch store configuration</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-7 border border-slate-200/80 rounded-2xl space-y-4 shadow-2xs hover:shadow-sm transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-100">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">2. Gemini AI Assistant</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Customers tap simple experience highlights. Gemini 3.6 Flash synthesizes structured, high-quality reviews instantly.
            </p>
            <div className="pt-3 border-t border-slate-100 text-xs text-slate-700 space-y-2">
              <div className="flex items-center space-x-2 font-medium">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Overcomes customer writer's block</span>
              </div>
              <div className="flex items-center space-x-2 font-medium">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>One-tap copy to clipboard</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-7 border border-slate-200/80 rounded-2xl space-y-4 shadow-2xs hover:shadow-sm transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">3. Private Gatekeeper</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              If a customer selects 1 to 3 stars, the platform routes feedback directly to the business owner privately instead of Google.
            </p>
            <div className="pt-3 border-t border-slate-100 text-xs text-slate-700 space-y-2">
              <div className="flex items-center space-x-2 font-medium">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Protects public Google Maps rating</span>
              </div>
              <div className="flex items-center space-x-2 font-medium">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Instant customer recovery logs</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING PLANS SECTION */}
      <section id="pricing" className="py-16 sm:py-24 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Subscription Plans
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Simple, Transparent SaaS Pricing
            </h2>
            <p className="text-sm text-slate-600">
              Pick the right branch quota for your locations. Instant account activation on WhatsApp.
            </p>
          </div>

          {isLoadingPlans ? (
            <div className="text-center py-12 text-slate-500 text-xs font-medium">Loading packages...</div>
          ) : plans.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs font-medium">No plans configured.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              {plans.map(plan => (
                <div
                  key={plan.id}
                  className={`bg-white border rounded-2xl p-7 flex flex-col justify-between transition-all relative ${
                    plan.isPopular
                      ? 'border-blue-600 shadow-md ring-1 ring-blue-600/30'
                      : 'border-slate-200/80 shadow-2xs'
                  }`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-0.5 rounded-full shadow-2xs">
                      Most Popular
                    </div>
                  )}

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                      <p className="text-xs text-slate-500 mt-1">{plan.description}</p>
                    </div>

                    <div className="flex items-baseline space-x-1">
                      <span className="text-4xl font-extrabold text-slate-900">${plan.priceMonthly}</span>
                      <span className="text-xs text-slate-500 font-medium">/ month</span>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-slate-100 text-xs text-slate-600 font-normal">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>Up to <strong className="text-slate-900 font-semibold">{plan.maxBranches} Branch Locations</strong></span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                        <span><strong className="text-slate-900 font-semibold">{plan.monthlyTokens.toLocaleString()}</strong> AI Tokens / mo</span>
                      </div>
                      {(plan.features || [
                        'Google Review Auto-Redirect',
                        'Private Gatekeeper Intercept',
                        'QR Code Studio',
                        'Custom Service Highlights',
                      ]).map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100">
                    <a
                      href={getWhatsappUrl(plan)}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-2xs"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Inquire on WhatsApp</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-16 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-500">Everything you need to know about setting up ReviewScore AI.</p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'How does the WhatsApp plan inquiry work?',
              a: 'Clicking "Inquire on WhatsApp" opens a direct chat with our support team prefilled with your chosen plan specifications for instant onboarding.'
            },
            {
              q: 'Does ReviewScore AI require customers to download an app?',
              a: 'No! Customers simply scan the QR code using their phone camera. The review assistant opens instantly in their browser.'
            },
            {
              q: 'How does the private feedback gatekeeper work?',
              a: 'Customers rating 4 or 5 stars receive a generated draft and a 1-tap redirect to Google Maps. Ratings from 1 to 3 stars route to a private manager feedback form.'
            },
            {
              q: 'Can I manage multiple branch locations?',
              a: 'Yes! You can configure multiple branches with individual Google Place IDs and dedicated printable QR codes.'
            },
          ].map((faq, idx) => (
            <div key={idx} className="bg-white p-5 border border-slate-200/80 rounded-xl space-y-1 shadow-2xs">
              <h3 className="font-semibold text-slate-900 text-xs sm:text-sm flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed pl-6">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA BANNER */}
      <section className="bg-slate-900 text-white py-16 px-4 sm:px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Skyrocket Your Google Local Rankings Today</h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Start collecting genuine 5-star Google reviews with AI review formulation in under 5 minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/review')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <span>Test Live Customer Demo</span>
            </button>
            <a
              href={`https://wa.me/${whatsappPhone || '15550192834'}?text=${encodeURIComponent('Hi! I want to enquire about setting up ReviewScore AI for my business.')}`}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl border border-slate-700 transition-all cursor-pointer flex items-center space-x-2"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Contact Team on WhatsApp</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
