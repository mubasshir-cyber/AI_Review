import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

import { GROUPED_CATEGORIES, BUSINESS_CATEGORIES } from '../constants/categories';

interface CategorySearchDropdownProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export const CategorySearchDropdown: React.FC<CategorySearchDropdownProps> = ({
  value,
  onChange,
  placeholder = 'Search or select a category...',
  required = false,
  className = '',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCustomCategory, setIsCustomCategory] = useState(false);
    const [customCategory, setCustomCategory] = useState('');

    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredGroups = searchQuery.trim()
    ? GROUPED_CATEGORIES.map(g => ({
        ...g,
        items: g.items.filter(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
      })).filter(g => g.items.length > 0)
    : GROUPED_CATEGORIES;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (category: string) => {
  if (category === 'Other') {
    setIsCustomCategory(true);
    setCustomCategory('');
    setIsOpen(false);
    setSearchQuery('');
    return;
  }

  setIsCustomCategory(false);
  setCustomCategory('');
  onChange(category);
  setIsOpen(false);
  setSearchQuery('');
};

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchQuery('');
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs clay-input text-left transition-all ${
          isOpen ? 'ring-2 ring-[#2563EB] border-[#2563EB]' : ''
        }`}
      >
        <span className={value ? 'text-[#1E293B] font-medium' : 'text-[#94A3B8]'}>
          {value || placeholder}
        </span>
        <div className="flex items-center space-x-1 shrink-0 ml-2">
          {value && (
            <span
              onClick={handleClear}
              className="p-0.5 rounded hover:bg-[#F1F5F9] text-[#94A3B8] hover:text-[#EF4444] cursor-pointer transition-colors"
            >
              <X className="w-3 h-3" />
            </span>
          )}
          <ChevronDown className={`w-3.5 h-3.5 text-[#64748B] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Hidden required input for form validation */}
      {required && (
        <input
          type="text"
          required
          value={value}
          onChange={() => {}}
          className="absolute inset-0 opacity-0 pointer-events-none w-full"
          tabIndex={-1}
        />
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 bg-white border border-[#E8EDF5] rounded-2xl shadow-xl shadow-slate-900/10 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-[#F1F5F9]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-2.5 top-2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search categories..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#E8EDF5] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB]"
              />
            </div>
          </div>

          {/* List */}
          <div className="max-h-52 overflow-y-auto">
            {filteredGroups.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-[#94A3B8]">
                No categories found for "<span className="font-bold">{searchQuery}</span>"
              </div>
            ) : (
              filteredGroups.map(group => (
                <div key={group.group}>
                  <div className="px-3 py-1.5 bg-[#F8FAFC] text-[10px] font-bold text-[#64748B] uppercase tracking-wider sticky top-0 z-10 border-y border-[#E8EDF5]">
                    {group.group}
                  </div>
                  {group.items.map(category => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => handleSelect(category)}
                      className={`w-full text-left px-4 py-2 text-xs transition-colors hover:bg-[#EEF2FF] hover:text-[#2563EB] ${
                        value === category
                          ? 'bg-[#EEF2FF] text-[#2563EB] font-bold'
                          : 'text-[#1E293B]'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              ))
            )}
            {/* Other category option */}
            <div className="border-t border-[#E8EDF5]">
              <button
                type="button"
                onClick={() => handleSelect('Other')}
                className="w-full text-left px-3.5 py-2.5 text-xs font-semibold text-[#2563EB] hover:bg-[#EEF2FF] transition-colors"
              >
                Other
              </button>
            </div>
          </div>

          {/* Footer count */}
          <div className="px-3 py-1.5 border-t border-[#F1F5F9] text-[10px] text-[#94A3B8] text-right">
            {filteredGroups.reduce((acc, g) => acc + g.items.length, 0)} of {BUSINESS_CATEGORIES.length} categories
          </div>
        </div>
      )}
   
      {/* Custom Business Category */}
      {isCustomCategory && (
        <div className="mt-2">
          <label className="block mb-1.5 text-xs font-medium text-[#475569]">
            Custom Business Category
          </label>

          <input
            type="text"
            value={customCategory}
            onChange={(e) => {
              const newValue = e.target.value;
              setCustomCategory(newValue);
              onChange(newValue.trim());
            }}
            placeholder="Enter your business category..."
            className="w-full px-3.5 py-2.5 text-xs clay-input focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          />

          {!customCategory.trim() && (
            <p className="mt-1 text-[10px] text-[#EF4444]">
              Please enter a business category.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
