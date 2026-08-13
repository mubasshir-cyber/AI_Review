import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

export const BUSINESS_CATEGORIES: string[] = [
  // Food & Beverage
  'Restaurant', 'Indian restaurant', 'Italian restaurant', 'Chinese restaurant',
  'Fast food restaurant', 'Pizza restaurant', 'Cafe', 'Coffee shop', 'Bakery', 'Bar',
  // Retail
  'Clothing store', 'Shoe store', 'Jewelry store', 'Furniture store', 'Electronics store',
  'Grocery store', 'Supermarket', 'Gift shop', 'Convenience store', 'Department store',
  'Mobile phone shop', 'Hardware store', 'Auto parts store', 'Furniture manufacturer',
  // Healthcare
  'Pharmacy', 'Medical clinic', 'Hospital', 'Dentist', 'Dental clinic', 'Doctor',
  'Dermatologist', 'Physiotherapist', 'Chiropractor', 'Optometrist', 'Veterinary care',
  // Beauty & Wellness
  'Beauty salon', 'Hair salon', 'Barber shop', 'Nail salon', 'Spa', 'Massage therapist',
  // Fitness
  'Fitness center', 'Gym', 'Yoga studio', 'Personal trainer',
  // Real Estate & Construction
  'Real estate developer', 'Construction company', 'Architecture firm', 'Interior designer',
  'Real estate agency', 'Real estate agent', 'Property management company',
  // Staffing & Employment
  'Employment agency',
  // Finance & Insurance
  'Insurance agency', 'Accountant', 'Accounting firm', 'Financial consultant',
  'Tax consultant', 'Bank', 'ATM',
  // Legal
  'Lawyer', 'Law firm', 'Consultant',
  // Travel & Hospitality
  'Travel agency', 'Hotel', 'Resort hotel', 'Bed & breakfast', 'Guest house',
  // Events
  'Event venue', 'Wedding venue', 'Wedding planner', 'Photographer',
  // Marketing & Digital
  'Marketing agency', 'Advertising agency', 'Digital marketing agency',
  'Software company', 'Web designer', 'Website designer', 'Computer consultant',
  'IT support and services', 'Computer repair service',
  // Automotive
  'Car dealer', 'Used car dealer', 'Auto repair shop', 'Car wash', 'Tire shop',
  'Motorcycle dealer',
  // Home Services
  'Plumber', 'Electrician', 'General contractor', 'Roofing contractor',
  'Painting contractor', 'Cleaning service', 'Pest control service',
  'Landscaping service', 'Moving company', 'Storage facility', 'Locksmith',
  'Laundry service', 'Printing service',
].sort();

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
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filtered = searchQuery.trim()
    ? BUSINESS_CATEGORIES.filter(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
    : BUSINESS_CATEGORIES;

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
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-[#94A3B8]">
                No categories found for "<span className="font-bold">{searchQuery}</span>"
              </div>
            ) : (
              filtered.map(category => (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleSelect(category)}
                  className={`w-full text-left px-3.5 py-2 text-xs transition-colors hover:bg-[#EEF2FF] hover:text-[#2563EB] ${
                    value === category
                      ? 'bg-[#EEF2FF] text-[#2563EB] font-bold'
                      : 'text-[#1E293B]'
                  }`}
                >
                  {category}
                </button>
              ))
            )}
          </div>

          {/* Footer count */}
          <div className="px-3 py-1.5 border-t border-[#F1F5F9] text-[10px] text-[#94A3B8] text-right">
            {filtered.length} of {BUSINESS_CATEGORIES.length} categories
          </div>
        </div>
      )}
    </div>
  );
};
