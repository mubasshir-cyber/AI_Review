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
    <div className="clay-card bg-white border border-[#DCE3EC] p-6 space-y-6 text-xs text-[#1E293B]">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#E8EDF5]">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-[#EEF2F7] rounded-xl border border-[#DCE3EC] shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9)]">
              <Sparkles className="w-5 h-5 text-[#2563EB]" />
            </div>
            <h2 className="text-lg font-extrabold text-[#1E293B]">Review Suggestions & Highlights Studio</h2>
          </div>
          <p className="text-xs text-[#64748B] mt-1 max-w-xl leading-relaxed">
            Configure custom highlight tags for your business. Customers see these interactive suggestions on the review generator screen to draft authentic 5-star Google reviews.
          </p>
        </div>

        {/* Branch Selector Dropdown */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full shrink-0">
          <label className="text-xs font-bold text-[#1E293B] w-full sm:w-auto">Location:</label>
          <select
            value={selectedBranchId}
            onChange={e => setSelectedBranchId(e.target.value)}
            className="w-full flex-1 px-3.5 py-2 text-xs font-bold clay-input cursor-pointer min-h-[44px]"
          >
            {branches.map(b => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.city})
              </option>
            ))}
          </select>
        </div>
      </div>

      {showSuccessMessage && (
        <div className="p-4 clay-card bg-white border border-[#DCE3EC] text-xs flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-[#22C55E] shrink-0" />
            <span className="font-extrabold text-[#1E293B]">
              Highlights successfully saved to database! Live QR customer review portal updated.
            </span>
          </div>
          <span className="text-[10px] bg-[#EEF2F7] text-[#2563EB] px-2.5 py-1 rounded-full border border-[#DCE3EC] font-bold uppercase">Live</span>
        </div>
      )}

      {/* Active Highlights Container */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Tag className="w-3.5 h-3.5 text-[#2563EB]" />
          <span className="text-xs font-extrabold text-[#1E293B] uppercase tracking-wider">Active Highlights</span>
          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[11px] font-bold">{tags.length}</span>
        </div>

        <div className="p-4 bg-[#EEF2F7] rounded-2xl border border-[#DCE3EC] min-h-[90px] flex flex-wrap gap-2 items-center shadow-[inset_1px_1px_3px_rgba(255,255,255,0.9)]">
          {tags.length === 0 ? (
            <p className="text-xs text-[#64748B] italic">No highlights configured yet. Add custom tags below.</p>
          ) : (
            tags.map((tag, idx) => (
              <div
                key={idx}
                className="bg-white text-[#1E293B] font-bold text-xs px-3 py-1.5 rounded-2xl border border-[#DCE3EC] flex items-center space-x-2 shadow-[2px_2px_6px_rgba(100,116,139,0.06)]"
              >
                <span>✓ {tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(idx)}
                  className="text-[#64748B] hover:text-[#EF4444] p-0.5 transition-colors cursor-pointer"
                  title="Remove Tag"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add New Tag Input Bar */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-[#1E293B]">Add Custom Highlight Point</label>
        <form
          onSubmit={e => {
            e.preventDefault();
            handleAddTag(newTagInput);
          }}
          className="flex flex-col sm:flex-row gap-2"
        >
          <input
            type="text"
            value={newTagInput}
            onChange={e => setNewTagInput(e.target.value)}
            placeholder="e.g., Painless Treatment, Gentle Care, Clean Facilities"
            className="w-full px-3.5 py-2.5 text-xs clay-input min-h-[44px]"
          />
          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2.5 clay-btn-primary text-xs flex items-center justify-center space-x-1.5 cursor-pointer min-h-[44px] shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Suggestion</span>
          </button>
        </form>
      </div>

      {/* Popular Presets Palette */}
      <div className="space-y-2 pt-2 border-t border-[#E8EDF5]">
        <span className="text-[11px] font-extrabold text-[#1E293B] uppercase tracking-wider">
          Quick Preset Suggestions (Click to Add):
        </span>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_SUGGESTIONS.map(preset => {
            const alreadyAdded = tags.some(t => t.toLowerCase() === preset.toLowerCase());
            return (
              <button
                key={preset}
                type="button"
                disabled={alreadyAdded}
                onClick={() => handleAddTag(preset)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all min-h-[36px] ${
                  alreadyAdded
                    ? 'bg-green-50 text-green-700 border-green-200 cursor-not-allowed select-none'
                    : 'bg-white text-[#1E293B] border-[#DCE3EC] hover:bg-[#2563EB] hover:text-white hover:border-[#1D4ED8] cursor-pointer shadow-2xs'
                }`}
              >
                {alreadyAdded ? `✓ Added · ${preset}` : `+ ${preset}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Save Action Bar */}
      <div className="pt-4 border-t border-[#E8EDF5] space-y-3">
        <div className="text-[11px] text-[#64748B] font-bold">
          Branch ID: <span className="font-mono text-[#1E293B]">{selectedBranch?.id}</span>
        </div>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            disabled={isResetting || isSaving}
            className="w-full sm:w-auto px-4 py-2.5 bg-[#EEF2F7] text-[#1E293B] border border-[#DCE3EC] hover:bg-[#E2E8F0] text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 disabled:opacity-50 cursor-pointer min-h-[44px] transition-colors"
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
            className="w-full sm:w-auto px-5 py-2.5 clay-btn-primary text-xs flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer min-h-[44px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Saving to Database...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Highlights & Update Customer Portal</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
