import React, { useState, useEffect } from 'react';
import { Branch } from '../../types';
import { Sparkles, Plus, Trash2, CheckCircle2, RefreshCw, Building2, Save, Tag, Loader2, ThumbsUp, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface HighlightsStudioProps {
  branches: Branch[];
  onBranchUpdated: () => void;
}

const PRESET_SUGGESTIONS = [
  'Friendly Staff',
  'Gentle Care',
  'Clean Environment',
  'Painless Treatment',
  'Quick Service',
  'Great Value',
  'Expert Doctors',
  'Punctual Appointments',
  'State-of-the-Art Equipment',
  'Hygienic & Safe',
  'Warm & Welcoming',
  'Highly Recommended'
];

const PRESET_NEGATIVE_SUGGESTIONS = [
  'Long Wait Time',
  'Rude Staff',
  'Unclean Environment',
  'Expensive',
  'Hard to Find',
  'Rushed Service',
  'Unprofessional',
  'Hidden Fees',
  'Poor Communication'
];

export const HighlightsStudio: React.FC<HighlightsStudioProps> = ({ branches, onBranchUpdated }) => {
  const { fetchWithAuth } = useAuth();
  const { showToast } = useToast();
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    branches.length > 0 ? branches[0].id : ''
  );
  
  // State for Positive Tags
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState<string>('');
  
  // State for Negative Tags
  const [negativeTags, setNegativeTags] = useState<string[]>([]);
  const [newNegativeTagInput, setNewNegativeTagInput] = useState<string>('');
  
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);

  const selectedBranch = branches.find(b => b.id === selectedBranchId) || branches[0];

  useEffect(() => {
    if (branches.length > 0 && !selectedBranchId) {
      setSelectedBranchId(branches[0].id);
    }
  }, [branches]);

  useEffect(() => {
    if (selectedBranch) {
      setTags(selectedBranch.serviceTags || []);
      setNegativeTags(selectedBranch.negativeTags || []);
      setShowSuccessMessage(false);
    }
  }, [selectedBranchId, branches]);

  // Positive Tags Handlers
  const handleAddTag = (tagToAdd: string) => {
    const trimmed = tagToAdd.trim();
    if (!trimmed) return;
    if (tags.some(t => t.toLowerCase() === trimmed.toLowerCase())) return;
    setTags([...tags, trimmed]);
    setNewTagInput('');
    setShowSuccessMessage(false);
  };

  const handleRemoveTag = (indexToRemove: number) => {
    setTags(tags.filter((_, idx) => idx !== indexToRemove));
    setShowSuccessMessage(false);
  };

  // Negative Tags Handlers
  const handleAddNegativeTag = (tagToAdd: string) => {
    const trimmed = tagToAdd.trim();
    if (!trimmed) return;
    if (negativeTags.some(t => t.toLowerCase() === trimmed.toLowerCase())) return;
    setNegativeTags([...negativeTags, trimmed]);
    setNewNegativeTagInput('');
    setShowSuccessMessage(false);
  };

  const handleRemoveNegativeTag = (indexToRemove: number) => {
    setNegativeTags(negativeTags.filter((_, idx) => idx !== indexToRemove));
    setShowSuccessMessage(false);
  };

  const handleResetDefaults = async () => {
    if (!selectedBranchId) return;
    const defaultTags = ['Friendly Staff', 'Gentle Care', 'Clean Environment', 'Painless Treatment', 'Quick Service'];
    const defaultNegativeTags = ['Long Wait Time', 'Unclean Environment', 'Expensive'];
    setIsResetting(true);
    setShowSuccessMessage(false);
    try {
      const res = await fetchWithAuth(`/api/branches/${selectedBranchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          highlightTags: defaultTags,
          negativeTags: defaultNegativeTags
        }),
      });
      const json = await res.json();
      if (res.ok || json.success) {
        setTags(defaultTags);
        setNegativeTags(defaultNegativeTags);
        onBranchUpdated();
        showToast('Highlight tags reset to defaults!', 'success');
      } else {
        showToast(json.message || 'Failed to reset tags. Please try again.', 'error');
      }
    } catch (err) {
      console.error('Error resetting tags:', err);
      showToast('Failed to reset tags. Please try again.', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  const handleSaveHighlights = async () => {
    if (!selectedBranch) return;
    setIsSaving(true);
    setShowSuccessMessage(false);

    try {
      const res = await fetchWithAuth(`/api/branches/${selectedBranch.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceTags: tags,
          negativeTags: negativeTags
        }),
      });

      const json = await res.json();
      setIsSaving(false);

      if (res.ok || json.success) {
        setShowSuccessMessage(true);
        onBranchUpdated();
        setTimeout(() => setShowSuccessMessage(false), 5000);
      } else {
        alert(json.message || 'Failed to save highlights');
      }
    } catch (err) {
      setIsSaving(false);
      console.error('Error saving highlights:', err);
      alert('Error updating highlights in database');
    }
  };

  if (branches.length === 0) {
    return (
      <div className="clay-card bg-white p-8 border border-[#DCE3EC] text-center space-y-3">
        <Building2 className="w-12 h-12 text-[#2563EB] mx-auto" />
        <h3 className="text-base font-extrabold text-[#1E293B]">No Branch Locations Found</h3>
        <p className="text-xs text-[#64748B] max-w-sm mx-auto leading-relaxed">
          Please add at least one branch location before configuring customer review highlights and suggestions.
        </p>
      </div>
    );
  }

  return (
    <div className="clay-card bg-white border border-[#DCE3EC] p-5 sm:p-8 space-y-8 text-xs text-[#1E293B]">
      {/* Studio Header */}
      <div className="space-y-5 pb-6 border-b border-[#E8EDF5]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start space-x-3.5 min-w-0">
            <div className="p-2.5 bg-gradient-to-br from-[#EEF2F7] to-[#DCE3EC] rounded-2xl border border-[#DCE3EC] shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9),0_2px_8px_rgba(37,99,235,0.06)] shrink-0">
              <Sparkles className="w-5 h-5 text-[#2563EB]" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-extrabold text-[#1E293B] tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
                Review Suggestions &amp; Highlights Studio
              </h2>
              <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed max-w-2xl">
                Configure smart suggestion tags based on customer sentiment. Offer positive highlights for 4 & 5-star experiences, and gather specific constructive feedback when ratings are 3 stars or below.
              </p>
            </div>
          </div>
        </div>

        {/* Branch Selector Dropdown */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label className="text-xs font-bold text-[#64748B] sm:w-24 shrink-0 flex sm:justify-end sm:pr-1">
            Location
          </label>
          <div className="relative flex-1">
            <select
              value={selectedBranchId}
              onChange={e => setSelectedBranchId(e.target.value)}
              className="w-full px-4 py-2.5 text-xs font-bold clay-input cursor-pointer min-h-[44px] appearance-none pr-10 bg-[#F8FAFC]"
            >
              {branches.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.city})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-[#64748B]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {showSuccessMessage && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#F0FDF4] to-white border border-[#86EFAC] text-xs flex items-center justify-between animate-in fade-in duration-200 shadow-[0_2px_12px_rgba(34,197,94,0.08)]">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#22C55E]/10 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-[#22C55E] shrink-0" />
            </div>
            <span className="font-bold text-[#1E293B]">
              Highlights saved successfully — customer review portal is live with your new tags.
            </span>
          </div>
          <span className="hidden sm:inline-flex text-[10px] bg-white text-[#22C55E] px-2.5 py-1 rounded-full border border-[#86EFAC] font-extrabold uppercase tracking-wider shadow-xs shrink-0 ml-3">
            Synced
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ======================================================== */}
        {/* COLUMN 1: POSITIVE HIGHLIGHTS (4-5 STARS)                */}
        {/* ======================================================== */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col space-y-6">
          <div className="flex items-center space-x-4 pb-5 border-b border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0">
              <ThumbsUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 tracking-tight">5-Star Highlights</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">Displayed to happy customers when they rate 4 or 5 stars.</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Active Positive Tags</span>
              <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm border border-blue-100/50">{tags.length}</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-200/60 min-h-[140px] flex flex-wrap gap-2.5 items-start content-start shadow-[inset_0_1px_4px_rgba(0,0,0,0.01)]">
              {tags.length === 0 ? (
                <div className="flex flex-col items-center justify-center space-y-2 text-slate-400 w-full h-full min-h-[100px]">
                  <Tag className="w-5 h-5 opacity-50" />
                  <span className="text-xs font-medium">No positive tags configured yet.</span>
                </div>
              ) : (
                tags.map((tag, idx) => (
                  <div key={idx} className="group bg-white text-slate-700 font-semibold text-xs px-3.5 py-2 rounded-lg border border-slate-200 flex items-center space-x-2 shadow-sm hover:border-blue-300 hover:shadow transition-all">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{tag}</span>
                    <button type="button" onClick={() => handleRemoveTag(idx)} className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1 rounded-md transition-colors ml-1" title="Remove Tag">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={e => { e.preventDefault(); handleAddTag(newTagInput); }} className="relative flex items-center">
              <input
                type="text"
                value={newTagInput}
                onChange={e => setNewTagInput(e.target.value)}
                placeholder="e.g., Painless Treatment"
                className="w-full pl-4 pr-24 py-3 text-sm font-medium bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
              />
              <button type="submit" className="absolute right-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center hover:shadow active:scale-95">
                <Plus className="w-4 h-4 mr-1.5" /> Add
              </button>
            </form>

            <div className="pt-5 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Quick Presets</span>
              <div className="flex flex-wrap gap-2">
                {PRESET_SUGGESTIONS.map(preset => {
                  const alreadyAdded = tags.some(t => t.toLowerCase() === preset.toLowerCase());
                  return (
                    <button
                      key={preset}
                      type="button"
                      disabled={alreadyAdded}
                      onClick={() => handleAddTag(preset)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                        alreadyAdded
                          ? 'bg-emerald-50/50 text-emerald-600 border-emerald-100 opacity-60 cursor-not-allowed'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800 cursor-pointer shadow-sm hover:shadow'
                      }`}
                    >
                      {preset}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* COLUMN 2: CONSTRUCTIVE FEEDBACK (1-3 STARS)              */}
        {/* ======================================================== */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col space-y-6">
          <div className="flex items-center space-x-4 pb-5 border-b border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center border border-orange-100 shrink-0">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 tracking-tight">Constructive Feedback</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">Gathered privately when users rate 3 stars or lower.</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Active Feedback Tags</span>
              <span className="bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm border border-orange-100/50">{negativeTags.length}</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-200/60 min-h-[140px] flex flex-wrap gap-2.5 items-start content-start shadow-[inset_0_1px_4px_rgba(0,0,0,0.01)]">
              {negativeTags.length === 0 ? (
                <div className="flex flex-col items-center justify-center space-y-2 text-slate-400 w-full h-full min-h-[100px]">
                  <Tag className="w-5 h-5 opacity-50" />
                  <span className="text-xs font-medium">No constructive tags configured yet.</span>
                </div>
              ) : (
                negativeTags.map((tag, idx) => (
                  <div key={idx} className="group bg-white text-slate-700 font-semibold text-xs px-3.5 py-2 rounded-lg border border-slate-200 flex items-center space-x-2 shadow-sm hover:border-orange-300 hover:shadow transition-all">
                    <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
                    <span>{tag}</span>
                    <button type="button" onClick={() => handleRemoveNegativeTag(idx)} className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1 rounded-md transition-colors ml-1" title="Remove Tag">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={e => { e.preventDefault(); handleAddNegativeTag(newNegativeTagInput); }} className="relative flex items-center">
              <input
                type="text"
                value={newNegativeTagInput}
                onChange={e => setNewNegativeTagInput(e.target.value)}
                placeholder="e.g., Long Wait Time"
                className="w-full pl-4 pr-24 py-3 text-sm font-medium bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all shadow-sm"
              />
              <button type="submit" className="absolute right-2 px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center hover:shadow active:scale-95">
                <Plus className="w-4 h-4 mr-1.5" /> Add
              </button>
            </form>

            <div className="pt-5 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Quick Presets</span>
              <div className="flex flex-wrap gap-2">
                {PRESET_NEGATIVE_SUGGESTIONS.map(preset => {
                  const alreadyAdded = negativeTags.some(t => t.toLowerCase() === preset.toLowerCase());
                  return (
                    <button
                      key={preset}
                      type="button"
                      disabled={alreadyAdded}
                      onClick={() => handleAddNegativeTag(preset)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                        alreadyAdded
                          ? 'bg-red-50/50 text-red-600 border-red-100 opacity-60 cursor-not-allowed'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800 cursor-pointer shadow-sm hover:shadow'
                      }`}
                    >
                      {preset}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Save Action Bar */}
      <div className="pt-6 mt-4 border-t border-[#E8EDF5] space-y-4">
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
          <button
            type="button"
            onClick={handleResetDefaults}
            disabled={isResetting || isSaving}
            className="w-full sm:w-auto px-5 py-2.5 bg-white text-[#475569] border border-[#DCE3EC] hover:bg-[#F8FAFC] hover:border-[#94A3B8] text-xs font-bold rounded-xl flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer min-h-[44px] transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
          >
            {isResetting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Resetting...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Reset to Defaults</span>
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={handleSaveHighlights}
            disabled={isSaving || isResetting}
            className="w-full sm:w-auto px-8 py-2.5 clay-btn-primary text-xs flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer min-h-[44px] font-bold shadow-[0_4px_14px_rgba(37,99,235,0.18)] hover:shadow-[0_6px_18px_rgba(37,99,235,0.25)] active:scale-[0.99] transition-all"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Saving Configurations...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save &amp; Publish to Customers</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
