import React, { useState, useEffect } from 'react';
import { Business, Branch } from '../../types';
import {
  Sparkles, RefreshCw, CheckCircle2, Power, Database, Star, ShieldCheck
} from 'lucide-react';

export const DemoManagementTab: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBizId, setSelectedBizId] = useState<string>('biz-agency');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('branch-agency-main');
  const [isDemoEnabled, setIsDemoEnabled] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<string>('');
  const [demoReviews, setDemoReviews] = useState<Array<any>>([]);
  const [privateFeedbacks, setPrivateFeedbacks] = useState<Array<any>>([]);

  useEffect(() => {
    fetch('/api/businesses')
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setBusinesses(data.data);
        }
      })
      .catch(() => {});

    fetch('/api/branches')
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setBranches(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleResetDemoData = async () => {
    if (!confirm('Are you sure you want to reset all demo reviews and feedback back to initial state?')) return;
    setLoading(true);
    setActionMessage('');
    try {
      const res = await fetch('/api/settings/demo/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: selectedBizId })
      });
      const data = await res.json();
      setActionMessage(data.message || 'Demo data reset successfully!');
      // Clear client-side previews
      setDemoReviews([]);
      setPrivateFeedbacks([]);
    } catch (err: any) {
      setActionMessage('Failed to reset demo data.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReviews = async (count: number) => {
    setLoading(true);
    setActionMessage('');
    try {
      const res = await fetch('/api/settings/demo/generate-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count, businessId: selectedBizId, branchId: selectedBranchId })
      });
      const data = await res.json();
      setActionMessage(data.message || `Generated ${count} synthetic demo reviews.`);
      // Append a single 5-star preview per click (do not replace existing previews)
      const sample = {
        id: `demo-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        rating: 5,
        text: 'Exceptional service and measurable results — highly recommended.',
        author: sampleAuthor(demoReviews.length),
        date: new Date().toLocaleDateString(),
      };
      setDemoReviews(prev => [...prev, sample]);
    } catch (err: any) {
      setActionMessage('Failed to generate demo reviews.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFeedback = async (count: number) => {
    setLoading(true);
    setActionMessage('');
    try {
      const res = await fetch('/api/settings/demo/generate-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count, businessId: selectedBizId, branchId: selectedBranchId })
      });
      const data = await res.json();
      setActionMessage(data.message || `Generated ${count} synthetic demo feedback items.`);
      // On first private feedback generation, clear any existing 5★ demo reviews
      if (demoReviews.length > 0 && privateFeedbacks.length === 0) {
        setDemoReviews([]);
      }
      // Append a single 3-star private feedback preview per click
      const sample = {
        id: `pf-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        rating: 3,
        text: generateHumanReview(3),
        author: sampleAuthor(privateFeedbacks.length + 5),
        date: new Date().toLocaleDateString(),
        userNote: ''
      };
      setPrivateFeedbacks(prev => [...prev, sample]);
    } catch (err: any) {
      setActionMessage('Failed to generate demo feedback.');
    } finally {
      setLoading(false);
    }
  };

  const generateHumanReview = (rating: number) => {
    const templates5 = [
      'Fantastic experience — will definitely return!',
      'Professional team and great results. Highly recommend.',
      'Quick, friendly service and outstanding outcome.'
    ];
    const templates3 = [
      'Decent service but room for improvement.',
      'Average experience — some hiccups, but okay overall.',
      'Satisfactory visit; expected a bit more.'
    ];
    if (rating >= 5) return templates5[Math.floor(Math.random() * templates5.length)];
    return templates3[Math.floor(Math.random() * templates3.length)];
  };

  const sampleAuthor = (i: number) => {
    const names = ['A. Patel','M. Johnson','S. Lee','R. Kumar','T. Nguyen','L. Garcia','J. Smith'];
    return names[i % names.length];
  };

  const handlePrivateNoteChange = (id: string, value: string) => {
    setPrivateFeedbacks(prev => prev.map(p => p.id === id ? { ...p, userNote: value } : p));
  };

  const handleSavePrivateNote = (id: string) => {
    const item = privateFeedbacks.find(p => p.id === id);
    if (!item) return;
    setActionMessage('Private feedback saved locally');
  };

  return (
    <div className="space-y-6 text-xs text-[#1E293B]">
      {/* Top Banner */}
      <div className="p-6 clay-card bg-white border border-[#DCE3EC] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1.5">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-[#EEF2F7] text-[#2563EB] font-bold text-[10px] uppercase rounded-full border border-[#DCE3EC]">
            <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Platform Demo Management Module</span>
          </span>
          <h3 className="text-xl font-extrabold text-[#1E293B]">Public Customer Demo Isolation & Control</h3>
          <p className="text-[#64748B] text-xs max-w-xl">
            Control the public demo instance accessible from the landing page. Ensure potential clients always experience the clean, official Agency Demo Flow.
          </p>
        </div>

        <div className="bg-[#EEF2F7] p-4 rounded-2xl border border-[#DCE3EC] flex items-center space-x-3 shrink-0">
          <div>
            <span className="text-[10px] text-[#64748B] block font-bold">Demo Engine Status</span>
            <span className={`font-extrabold text-xs ${isDemoEnabled ? 'text-[#2563EB]' : 'text-[#64748B]'}`}>
              {isDemoEnabled ? 'PUBLIC DEMO ACTIVE' : 'DEMO DISABLED'}
            </span>
          </div>
          <button
            onClick={() => setIsDemoEnabled(!isDemoEnabled)}
            className={`p-2.5 rounded-xl transition-all border cursor-pointer ${
              isDemoEnabled ? 'clay-btn-primary' : 'clay-btn-secondary'
            }`}
          >
            <Power className="w-5 h-5 font-extrabold" />
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 clay-card bg-white border border-[#DCE3EC] font-bold text-[#1E293B] flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Main Settings & Synthetic Generator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Box 1: Demo Target Business & Branch Selection */}
        <div className="clay-card bg-white p-6 border border-[#DCE3EC] space-y-4">
          <h4 className="font-extrabold text-[#1E293B] text-sm flex items-center space-x-2">
            <Database className="w-4 h-4 text-[#2563EB]" />
            <span>Demo Business & Branch Isolation</span>
          </h4>
          <p className="text-[#64748B] text-xs leading-relaxed">
            Specify which business profile and branch location represent the platform demo. The landing page "Try Customer QR Demo" button will always route here.
          </p>

          <div className="space-y-3.5 pt-2">
            <div>
              <label className="block font-bold text-[#1E293B] mb-1">Target Demo Business</label>
              <select
                value={selectedBizId}
                onChange={e => setSelectedBizId(e.target.value)}
                className="w-full px-3.5 py-2.5 clay-input text-xs font-bold cursor-pointer"
              >
                {businesses.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.category}) - ID: {b.id}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#1E293B] mb-1">Target Demo Branch Location</label>
              <select
                value={selectedBranchId}
                onChange={e => setSelectedBranchId(e.target.value)}
                className="w-full px-3.5 py-2.5 clay-input text-xs font-bold cursor-pointer"
              >
                {branches
                  .filter(br => br.businessId === selectedBizId)
                  .map(br => (
                    <option key={br.id} value={br.id}>
                      {br.name} ({br.city}) - ID: {br.id}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {/* Box 2: Synthetic Data & Reset Generator Actions */}
        <div className="clay-card bg-white p-6 border border-[#DCE3EC] space-y-4">
          <h4 className="font-extrabold text-[#1E293B] text-sm flex items-center space-x-2">
            <RefreshCw className="w-4 h-4 text-[#2563EB]" />
            <span>Demo Data Reset & Synthetic Generator</span>
          </h4>
          <p className="text-[#64748B] text-xs leading-relaxed">
            Reset reviews back to pristine status or generate realistic synthetic 5-star reviews and private feedback records for sales presentations.
          </p>

          <div className="space-y-3.5 pt-2">
            <button
              onClick={handleResetDemoData}
              disabled={loading}
              className="w-full py-3 px-4 clay-btn-secondary text-xs cursor-pointer flex items-center justify-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 text-[#2563EB] ${loading ? 'animate-spin' : ''}`} />
              <span>Reset All Demo Data to Clean State</span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleGenerateReviews(5)}
                disabled={loading}
                className="py-2.5 px-3 clay-btn-primary text-xs flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Star className="w-3.5 h-3.5 fill-white text-white" />
                <span>+5 Demo Reviews</span>
              </button>

              <button
                onClick={() => handleGenerateFeedback(3)}
                disabled={loading}
                className="py-2.5 px-3 clay-btn-secondary text-xs flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>+3 Private Feedback</span>
              </button>
            </div>

            {/* Generated Demo Previews */}
            {demoReviews.length > 0 && (
              <div className="mt-4 space-y-3">
                <h5 className="text-sm font-bold">Demo Reviews Preview</h5>
                {demoReviews.map(r => (
                  <div key={r.id} className="p-3 clay-card bg-white border border-[#E8EDF5] rounded-2xl">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star key={idx} className={`w-4 h-4 ${idx < r.rating ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-[#CBD5E1]'}`} />
                          ))}
                        </div>
                        <div className="text-xs text-[#64748B] font-medium">{r.author} • <span className="font-normal">{r.date}</span></div>
                      </div>
                    </div>
                    <p className="text-sm text-[#1E293B] mt-2">{r.text}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Generated Private Feedback Previews */}
            {privateFeedbacks.length > 0 && (
              <div className="mt-4 space-y-3">
                <h5 className="text-sm font-bold">Private Feedback Preview</h5>
                {privateFeedbacks.map(p => (
                  <div key={p.id} className="p-3 clay-card bg-white border border-[#E8EDF5] rounded-2xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex mr-3">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star key={idx} className={`w-4 h-4 ${idx < p.rating ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-[#CBD5E1]'}`} />
                          ))}
                        </div>
                        <div className="text-xs text-[#64748B]">{p.author} • {p.date}</div>
                      </div>
                    </div>
                    <p className="text-sm text-[#1E293B] mt-2">{p.text}</p>

                    <div className="mt-3">
                      <textarea
                        value={p.userNote}
                        onChange={e => handlePrivateNoteChange(p.id, e.target.value)}
                        placeholder="Write private feedback..."
                        className="w-full p-2 text-xs border border-[#E8EDF5] rounded-md focus:outline-none"
                        rows={3}
                      />
                      <div className="mt-2 flex justify-end">
                        <button onClick={() => handleSavePrivateNote(p.id)} className="px-3 py-1.5 clay-btn-primary text-xs">Save</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
