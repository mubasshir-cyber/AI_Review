import React, { useState, useEffect } from 'react';
import { Branch } from '../../types';
import { Sparkles, Plus, Trash2, CheckCircle2, RefreshCw, Building2, Save, Tag, Loader2 } from 'lucide-react';
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

export const HighlightsStudio: React.FC<HighlightsStudioProps> = ({ branches, onBranchUpdated }) => {
  const { fetchWithAuth } = useAuth();
  const { showToast } = useToast();
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    branches.length > 0 ? branches[0].id : ''
  );
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState<string>('');
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
      setShowSuccessMessage(false);
    }
  }, [selectedBranchId, branches]);

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

  const handleResetDefaults = async () => {
    if (!selectedBranchId) return;
    const defaultTags = ['Friendly Staff', 'Gentle Care', 'Clean Environment', 'Painless Treatment', 'Quick Service'];
    setIsResetting(true);
    setShowSuccessMessage(false);
    try {
      const res = await fetchWithAuth(`/api/branches/${selectedBranchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          highlightTags: defaultTags,
        }),
      });
      const json = await res.json();
      if (res.ok || json.success) {
        setTags(defaultTags);
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
      const res = await fetch(`/api/branches/${selectedBranch.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceTags: tags,
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
    <div className="clay-card bg-white border border-[#DCE3EC] p-5 sm:p-8 space-y-6 text-xs text-[#1E293B]">
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
                Configure custom highlight tags for your business. Customers see these interactive suggestions on the review generator screen to draft authentic 5-star Google reviews.
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

      {/* Active Highlights Container */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-[#EEF2F7] flex items-center justify-center border border-[#DCE3EC]">
              <Tag className="w-3.5 h-3.5 text-[#2563EB]" />
            </div>
            <span className="text-[11px] font-extrabold text-[#1E293B] uppercase tracking-wider">Active Highlights</span>
            <span className="bg-[#DBEAFE] text-[#1D4ED8] px-2 py-0.5 rounded-full text-[10px] font-extrabold">{tags.length}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#F8FAFC] via-[#EEF2F7] to-[#F5F7FB] border border-[#DCE3EC] min-h-[110px] flex flex-wrap gap-2.5 items-start content-start shadow-[inset_0_1px_3px_rgba(255,255,255,0.9),inset_0_-1px_2px_rgba(100,116,139,0.04)]">
          {tags.length === 0 ? (
            <div className="flex items-center space-x-2.5 text-[#64748B] w-full p-2">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-dashed border-[#DCE3EC]">
                <Tag className="w-4 h-4 text-[#94A3B8]" />
              </div>
              <div>
                <p className="font-bold text-[#475569]">No highlights configured yet</p>
                <p className="text-[11px] leading-relaxed">Add custom tags below or click a quick preset to get started.</p>
              </div>
            </div>
          ) : (
            tags.map((tag, idx) => (
              <div
                key={idx}
                className="group bg-white text-[#1E293B] font-bold text-xs px-3.5 py-2 rounded-xl border border-[#DCE3EC] flex items-center space-x-2 shadow-[0_1px_3px_rgba(100,116,139,0.05),inset_0_1px_0_rgba(255,255,255,0.9)] hover:border-[#2563EB]/40 hover:shadow-[0_2px_8px_rgba(37,99,235,0.1)] transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(idx)}
                  className="text-[#94A3B8] hover:text-[#EF4444] p-0.5 rounded-md hover:bg-[#FEE2E2]/40 transition-colors cursor-pointer -mr-1"
                  title="Remove Tag"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add New Tag Input Bar */}
      <div className="space-y-2.5">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-[#EEF2F7] flex items-center justify-center border border-[#DCE3EC]">
            <Plus className="w-3.5 h-3.5 text-[#2563EB]" />
          </div>
          <label className="text-[11px] font-extrabold text-[#1E293B] uppercase tracking-wider">Add Custom Highlight Point</label>
        </div>
        <form
          onSubmit={e => {
            e.preventDefault();
            handleAddTag(newTagInput);
          }}
          className="flex flex-col sm:flex-row gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={newTagInput}
              onChange={e => setNewTagInput(e.target.value)}
              placeholder="e.g., Painless Treatment, Gentle Care, Clean Facilities"
              className="w-full pl-4 pr-4 py-2.5 text-xs clay-input min-h-[44px] bg-[#F8FAFC]"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 clay-btn-primary text-xs flex items-center justify-center space-x-1.5 cursor-pointer min-h-[44px] shrink-0 font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>Add Suggestion</span>
          </button>
        </form>
      </div>

      {/* Popular Presets Palette */}
      <div className="space-y-3 pt-5 border-t border-[#E8EDF5]">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-[#FEF3C7]/50 flex items-center justify-center border border-[#FCD34D]/40">
            <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
          </div>
          <span className="text-[11px] font-extrabold text-[#1E293B] uppercase tracking-wider">
            Quick Preset Suggestions
          </span>
          <span className="text-[10px] font-bold text-[#64748B] ml-1">· Click to add</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESET_SUGGESTIONS.map(preset => {
            const alreadyAdded = tags.some(t => t.toLowerCase() === preset.toLowerCase());
            return (
              <button
                key={preset}
                type="button"
                disabled={alreadyAdded}
                onClick={() => handleAddTag(preset)}
                className={`group px-3.5 py-2 text-xs font-bold rounded-xl border transition-all min-h-[40px] inline-flex items-center space-x-1 ${
                  alreadyAdded
                    ? 'bg-[#F0FDF4] text-[#166534] border-[#86EFAC] cursor-not-allowed select-none shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]'
                    : 'bg-white text-[#1E293B] border-[#DCE3EC] hover:bg-gradient-to-br hover:from-[#2563EB] hover:to-[#1D4ED8] hover:text-white hover:border-[#1D4ED8] cursor-pointer shadow-[0_1px_2px_rgba(100,116,139,0.05),inset_0_1px_0_rgba(255,255,255,0.9)] hover:shadow-[0_4px_12px_rgba(37,99,235,0.18)] active:scale-[0.98]'
                }`}
              >
                {alreadyAdded ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
                    <span>{preset}</span>
                  </>
                ) : (
                  <>
                    <span className="text-[#2563EB] group-hover:text-white/90 font-bold">+</span>
                    <span>{preset}</span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Save Action Bar */}
      <div className="pt-5 mt-2 border-t border-[#E8EDF5] space-y-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-[#64748B] font-bold">
          <div className="flex items-center space-x-1.5">
            <Building2 className="w-3.5 h-3.5" />
            <span>Targeting:</span>
            <span className="font-bold text-[#1E293B] bg-[#EEF2F7] px-2 py-0.5 rounded-lg border border-[#DCE3EC]">
              {selectedBranch?.name || 'Unknown Branch'}
            </span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Tag className="w-3.5 h-3.5" />
            <span>Branch ID:</span>
            <span className="font-mono text-[#1E293B] bg-white px-2 py-0.5 rounded-lg border border-[#DCE3EC]">{selectedBranch?.id}</span>
          </div>
        </div>
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2 pt-1">
          <button
            type="button"
            onClick={handleResetDefaults}
            disabled={isResetting || isSaving}
            className="w-full sm:w-auto px-4 py-2.5 bg-white text-[#475569] border border-[#DCE3EC] hover:bg-[#F8FAFC] hover:border-[#94A3B8] text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 disabled:opacity-50 cursor-pointer min-h-[44px] transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
          >
            {isResetting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Resetting...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Reset Defaults</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleSaveHighlights}
            disabled={isSaving || isResetting}
            className="w-full sm:w-auto px-6 py-2.5 clay-btn-primary text-xs flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer min-h-[44px] font-bold shadow-[0_4px_14px_rgba(37,99,235,0.18)] hover:shadow-[0_6px_18px_rgba(37,99,235,0.25)] active:scale-[0.99] transition-all"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Saving Changes...</span>
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
