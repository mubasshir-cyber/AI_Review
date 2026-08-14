import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

export const BUSINESS_CATEGORIES: string[] = [
  // Food & Beverage
  'Restaurant', 'Indian restaurant', 'Italian restaurant', 'Chinese restaurant',
  'Fast food restaurant', 'Pizza restaurant', 'Cafe', 'Coffee shop',
  'Bakery', 'Bar',
  // Retail
  'Clothing store', 'Shoe store', 'Jewelry store', 'Furniture store',
  'Electronics store', 'Grocery store', 'Supermarket', 'Gift shop',
  'Convenience store', 'Department store', 'Mobile phone shop', 'Hardware store',
  'Auto parts store', 'Furniture manufacturer',
  // Healthcare
  'Pharmacy', 'Medical clinic', 'Hospital', 'Dentist',
  'Dental clinic', 'Doctor', 'Dermatologist', 'Physiotherapist',
  'Chiropractor', 'Optometrist', 'Veterinary care', 'Beauty salon',
  'Hair salon',
  // Beauty & Wellness
  'Barber shop', 'Nail salon', 'Spa', 'Massage therapist',
  'Fitness center', 'Gym',
  // Fitness
  'Yoga studio', 'Personal trainer', 'Real estate developer', 'Construction company',
  // Real Estate & Construction
  'Architecture firm', 'Interior designer', 'Real estate agency', 'Real estate agent',
  'Property management company', 'Employment agency', 'Insurance agency',
  // Staffing & Employment
  'Accountant',
  // Finance & Insurance
  'Accounting firm', 'Financial consultant', 'Tax consultant', 'Bank',
  'ATM', 'Lawyer', 'Law firm',
  // Legal
  'Consultant', 'Travel agency', 'Hotel',
  // Travel & Hospitality
  'Resort hotel', 'Bed & breakfast', 'Guest house', 'Event venue',
  'Wedding venue',
  // Events
  'Wedding planner', 'Photographer', 'Marketing agency', 'Advertising agency',
  // Marketing & Digital
  'Digital marketing agency', 'Software company', 'Web designer', 'Website designer',
  'Computer consultant', 'IT support and services', 'Computer repair service', 'Car dealer',
  'Used car dealer',
  // Automotive
  'Auto repair shop', 'Car wash', 'Tire shop', 'Motorcycle dealer',
  'Plumber', 'Electrician',
  // Home Services
  'General contractor', 'Roofing contractor', 'Painting contractor', 'Cleaning service',
  'Pest control service', 'Landscaping service', 'Moving company', 'Storage facility',
  'Locksmith', 'Laundry service', 'Printing service',
  // 1,000 additional categories
  'Breakfast restaurant', 'Brunch restaurant', 'Family restaurant', 'Fine dining restaurant',
  'Buffet restaurant', 'Steakhouse', 'Seafood restaurant', 'Sushi restaurant',
  'Ramen restaurant', 'Noodle restaurant', 'Thai restaurant', 'Vietnamese restaurant',
  'Korean restaurant', 'Mediterranean restaurant', 'Greek restaurant', 'French restaurant',
  'Spanish restaurant', 'Turkish restaurant', 'Lebanese restaurant', 'Middle Eastern restaurant',
  'Persian restaurant', 'Afghan restaurant', 'Pakistani restaurant', 'Bangladeshi restaurant',
  'Nepalese restaurant', 'Mexican restaurant', 'Brazilian restaurant', 'Caribbean restaurant',
  'African restaurant', 'Ethiopian restaurant', 'Moroccan restaurant', 'American restaurant',
  'Southern restaurant', 'Cajun restaurant', 'Barbecue restaurant', 'Dim sum restaurant',
  'Hot pot restaurant', 'Cuban restaurant', 'German restaurant', 'Portuguese restaurant',
  'Peruvian restaurant', 'Argentinian restaurant', 'Gluten-free restaurant', 'Vegan restaurant',
  'Vegetarian restaurant', 'Organic restaurant', 'Raw food restaurant', 'Farm-to-table restaurant',
  'Food court', 'Food hall', 'Food truck', 'Food stall',
  'Catering company', 'Corporate catering service', 'Event catering service', 'Bakery cafe',
  'Artisan bakery', 'Pastry shop', 'Cupcake shop', 'Donut shop',
  'Bagel shop', 'Bread shop', 'Cake shop', 'Cookie shop',
  'Chocolate shop', 'Confectionery', 'Candy store', 'Ice cream parlor',
  'Gelato shop', 'Frozen yogurt shop', 'Dessert cafe', 'Crepe restaurant',
  'Waffle restaurant', 'Pancake house', 'Tea house', 'Bubble tea shop',
  'Juice bar', 'Smoothie shop', 'Health food restaurant', 'Salad bar',
  'Sandwich shop', 'Deli', 'Delicatessen', 'Burger restaurant',
  'Chicken restaurant', 'Fried chicken restaurant', 'Hot dog restaurant', 'Taco restaurant',
  'Burrito restaurant', 'Pizzeria', 'Wine bar', 'Cocktail bar',
  'Sports bar', 'Pub', 'Brewpub', 'Brewery',
  'Distillery', 'Winery', 'Coffee roastery', 'Coffee wholesaler',
  'Tea wholesaler', 'Restaurant supply store', 'Commercial kitchen supplier', 'Vending machine operator',
  'Meal delivery service', 'Meal prep service', 'Gourmet grocery store', 'Specialty food store',
  'Discount store', 'Outlet store', 'Shopping center', 'Shopping mall',
  'Boutique', 'General store', 'Organic grocery store', 'Specialty grocery store',
  'Wholesale grocery store', 'Butcher shop', 'Fish market', 'Meat wholesaler',
  'Produce market', 'Farmers market', 'Liquor store', 'Wine store',
  'Beer store', 'Tobacco shop', 'Confectionery store', 'Souvenir shop',
  'Party supply store', 'Greeting card shop', 'Stationery store', 'Bookstore',
  'Comic book store', 'Music store', 'Record store', 'Toy store',
  'Game store', 'Hobby store', 'Craft store', 'Art supply store',
  'Fabric store', 'Yarn store', 'Sewing supply store', 'Antique store',
  'Collectibles store', 'Thrift store', 'Consignment shop', 'Secondhand store',
  'Pawn shop', 'Clothing boutique', 'Mens clothing store', 'Womens clothing store',
  'Childrens clothing store', 'Baby clothing store', 'Sportswear store', 'Formalwear store',
  'Bridal shop', 'Lingerie store', 'Swimwear store', 'Shoe boutique',
  'Athletic shoe store', 'Handbag store', 'Leather goods store', 'Jewelry boutique',
  'Fine jewelry store', 'Watch store', 'Eyewear store', 'Optical store',
  'Cosmetics store', 'Beauty supply store', 'Perfume store', 'Skincare store',
  'Haircare store', 'Mattress store', 'Home decor store', 'Lighting store',
  'Kitchenware store', 'Cookware store', 'Appliance store', 'Computer store',
  'Mobile phone store', 'Camera store', 'Audio equipment store', 'Musical instrument store',
  'Home theater store', 'Smart home store', 'Paint store', 'Flooring store',
  'Tile store', 'Plumbing supply store', 'Electrical supply store', 'Building materials store',
  'Garden center', 'Plant nursery', 'Flower shop', 'Pet supply store',
  'Aquarium store', 'Farm supply store', 'Primary care clinic', 'Family medicine clinic',
  'Internal medicine clinic', 'Pediatric clinic', 'Geriatric clinic', 'Walk-in clinic',
  'Urgent care clinic', 'Specialty medical clinic', 'Community health center', 'Medical laboratory',
  'Diagnostic imaging center', 'Radiology clinic', 'Pathology laboratory', 'Blood testing laboratory',
  'Health screening center', 'Occupational health clinic', 'Travel medicine clinic', 'Sports medicine clinic',
  'Pain management clinic', 'Sleep clinic', 'Allergy clinic', 'Asthma clinic',
  'Cardiology clinic', 'Endocrinology clinic', 'Gastroenterology clinic', 'Hematology clinic',
  'Infectious disease clinic', 'Nephrology clinic', 'Neurology clinic', 'Oncology clinic',
  'Pulmonology clinic', 'Rheumatology clinic', 'Urology clinic', 'Gynecology clinic',
  'Obstetrics clinic', 'Fertility clinic', 'Reproductive health clinic', 'Mens health clinic',
  'Womens health clinic', 'Child development clinic', 'Adolescent medicine clinic', 'Palliative care provider',
  'Hospice provider', 'Home healthcare provider', 'Home nursing service', 'Medical home care agency',
  'Respite care service', 'Senior care provider', 'Assisted living facility', 'Memory care facility',
  'Skilled nursing facility', 'Rehabilitation hospital', 'Physical rehabilitation center', 'Occupational therapy clinic',
  'Speech therapy clinic', 'Respiratory therapy clinic', 'Prosthetics clinic', 'Orthotics clinic',
  'Hearing clinic', 'Audiology clinic', 'Speech pathologist', 'Occupational therapist',
  'Physical therapist', 'Respiratory therapist', 'Dietitian', 'Nutritionist',
  'Medical social worker', 'Nurse practitioner', 'Midwife', 'Home health nurse',
  'Medical equipment supplier', 'Mobility equipment supplier', 'Wheelchair supplier', 'Medical uniform store',
  'Medical supply store', 'Durable medical equipment provider', 'Home oxygen supplier', 'Hearing aid store',
  'Prosthetics supplier', 'Orthotics supplier', 'Blood bank', 'Organ donation center',
  'Dialysis center', 'Chemotherapy center', 'Infusion center', 'Radiation therapy center',
  'Surgical center', 'Outpatient surgery center', 'Ambulatory care center', 'General dentistry clinic',
  'Family dentistry clinic', 'Pediatric dentistry clinic', 'Cosmetic dentistry clinic', 'Restorative dentistry clinic',
  'Prosthodontics clinic', 'Endodontics clinic', 'Periodontics clinic', 'Orthodontics clinic',
  'Oral surgery clinic', 'Dental implant clinic', 'Emergency dental clinic', 'Dental hygiene clinic',
  'Dental radiology center', 'Dental laboratory', 'Dental prosthetics laboratory', 'Denture clinic',
  'Clear aligner provider', 'Teeth whitening clinic', 'Oral health clinic', 'Gum disease clinic',
  'Root canal clinic', 'Wisdom tooth clinic', 'Sleep dentistry clinic', 'Sedation dentistry clinic',
  'Laser dentistry clinic', 'Holistic dentistry clinic', 'Special needs dentistry clinic', 'Senior dental clinic',
  'Dental implant specialist', 'Orthodontist', 'Endodontist', 'Periodontist',
  'Prosthodontist', 'Oral surgeon', 'Pediatric dentist', 'Cosmetic dentist',
  'Dental hygienist', 'Dental technician', 'Dental equipment supplier', 'Dental supply store',
  'Dental software provider', 'Dental billing service', 'Dental staffing agency', 'Dental consulting firm',
  'Dental marketing agency', 'Dental laboratory equipment supplier', 'Dental imaging supplier', 'Dental chair supplier',
  'Beauty spa', 'Day spa', 'Medical spa', 'Destination spa',
  'Wellness center', 'Holistic wellness center', 'Massage spa', 'Ayurvedic spa',
  'Thai massage center', 'Sports massage center', 'Deep tissue massage center', 'Reflexology center',
  'Aromatherapy center', 'Skin care clinic', 'Facial spa', 'Acne treatment clinic',
  'Anti-aging clinic', 'Laser hair removal clinic', 'Laser skin clinic', 'Body contouring clinic',
  'Waxing salon', 'Threading salon', 'Brow studio', 'Lash studio',
  'Eyelash extension salon', 'Permanent makeup studio', 'Tattoo studio', 'Piercing studio',
  'Makeup artist', 'Bridal makeup artist', 'Hair colorist', 'Hair extension salon',
  'Hair treatment salon', 'Natural hair salon', 'Curly hair salon', 'Mens grooming salon',
  'Barber academy', 'Beauty academy', 'Cosmetology school', 'Nail spa',
  'Manicure salon', 'Pedicure salon', 'Nail art studio', 'Mobile beauty service',
  'Mobile hair stylist', 'Mobile makeup service', 'Personal styling service', 'Image consultant',
  'Fashion stylist', 'Wardrobe consultant', 'Wellness coach', 'Life coach',
  'Meditation center', 'Mindfulness center', 'Breathwork studio', 'Sound healing center',
  'Reiki practitioner', 'Holistic therapist', 'Aromatherapy shop', 'Natural skincare store',
  'Organic beauty store', 'Beauty product wholesaler', 'Salon equipment supplier', 'Fitness club',
  'Health club', 'CrossFit gym', 'Strength training gym', 'Powerlifting gym',
  'Weightlifting gym', 'Boxing gym', 'Kickboxing gym', 'Martial arts school',
  'Karate school', 'Taekwondo school', 'Judo school', 'Jiu-jitsu academy',
  'MMA gym', 'Wrestling club', 'Fencing club', 'Archery club',
  'Shooting sports club', 'Climbing gym', 'Bouldering gym', 'Gymnastics center',
  'Dance fitness studio', 'Pilates studio', 'Barre studio', 'Spin studio',
  'Cycling studio', 'Indoor cycling center', 'Running club', 'Athletics club',
  'Track club', 'Swimming school', 'Swim club', 'Diving school',
  'Water sports center', 'Surf school', 'Sailing school', 'Rowing club',
  'Canoe club', 'Kayak rental service', 'Stand-up paddleboard school', 'Tennis club',
  'Badminton club', 'Squash club', 'Racquet club', 'Table tennis club',
  'Golf club', 'Golf academy', 'Golf driving range', 'Golf equipment store',
  'Soccer academy', 'Football club', 'Basketball academy', 'Volleyball club',
  'Baseball club', 'Cricket club', 'Hockey club', 'Rugby club',
  'Sports academy', 'Youth sports club', 'Sports training center', 'Athletic performance center',
  'Sports physiotherapy clinic', 'Sports nutrition service', 'Personal training studio', 'Online fitness coach',
  'Yoga retreat center', 'Yoga therapy center', 'Prenatal yoga studio', 'Kids yoga studio',
  'Meditation yoga studio', 'Outdoor adventure club', 'Camping club', 'Hiking club',
  'Cycling tour company', 'Fitness equipment store', 'Sports equipment store', 'Residential real estate agency',
  'Commercial real estate agency', 'Industrial real estate agency', 'Luxury real estate agency', 'Vacation property agency',
  'Property brokerage', 'Real estate brokerage', 'Real estate investment firm', 'Real estate investment trust',
  'Property development company', 'Commercial property developer', 'Residential property developer', 'Industrial property developer',
  'Mixed-use property developer', 'Land developer', 'Subdivision developer', 'Property management firm',
  'Apartment management company', 'Condominium management company', 'Homeowners association management', 'Commercial property management',
  'Industrial property management', 'Retail property management', 'Vacation rental management', 'Short-term rental management',
  'Property leasing company', 'Apartment leasing agency', 'Office leasing agency', 'Retail leasing agency',
  'Industrial leasing agency', 'Real estate appraisal firm', 'Property valuation service', 'Real estate surveyor',
  'Land surveyor', 'Building surveyor', 'Quantity surveyor', 'Real estate attorney',
  'Real estate notary', 'Mortgage brokerage', 'Mortgage lender', 'Home loan consultant',
  'Property tax consultant', 'Real estate investment advisor', 'Real estate crowdfunding platform', 'Real estate auction company',
  'Foreclosure service', 'Property inspection company', 'Home inspection service', 'Commercial building inspection service',
  'Environmental property assessment', 'Real estate photography service', 'Real estate videography service', 'Real estate staging company',
  'Home staging service', 'Virtual staging service', 'Property marketing agency', 'Real estate digital marketing agency',
  'Real estate lead generation service', 'Real estate CRM provider', 'Property management software provider', 'Real estate data provider',
  'Co-working property operator', 'Student housing operator', 'Senior housing operator', 'Affordable housing developer',
  'General building contractor', 'Residential contractor', 'Commercial contractor', 'Industrial contractor',
  'Building renovation contractor', 'Home remodeling contractor', 'Kitchen remodeling contractor', 'Bathroom remodeling contractor',
  'Basement remodeling contractor', 'Office renovation contractor', 'Retail fit-out contractor', 'Restaurant fit-out contractor',
  'Hotel renovation contractor', 'Concrete contractor', 'Masonry contractor', 'Bricklaying contractor',
  'Stone masonry contractor', 'Carpentry contractor', 'Finish carpentry contractor', 'Cabinet maker',
  'Custom cabinetry contractor', 'Framing contractor', 'Drywall contractor', 'Plastering contractor',
  'Ceiling contractor', 'Insulation contractor', 'Waterproofing contractor', 'Foundation contractor',
  'Excavation contractor', 'Demolition contractor', 'Site preparation contractor', 'Earthmoving contractor',
  'Paving contractor', 'Asphalt contractor', 'Road construction contractor', 'Bridge construction contractor',
  'Civil engineering contractor', 'Structural engineering firm', 'Geotechnical engineering firm', 'Mechanical engineering firm',
  'Electrical engineering firm', 'Environmental engineering firm', 'Architecture studio', 'Landscape architecture firm',
  'Interior architecture firm', 'Urban planning firm', 'Building design firm', 'Architectural visualization studio',
  '3D architectural rendering studio', 'Building information modeling service', 'Construction management company', 'Construction consulting firm',
  'Construction estimating service', 'Construction scheduling service', 'Construction safety consultant', 'Building materials supplier',
  'Cement supplier', 'Concrete supplier', 'Steel supplier', 'Lumber supplier',
  'Glass supplier', 'Roofing supplier', 'Scaffolding supplier', 'Construction equipment rental',
  'Heavy equipment rental', 'Crane rental service', 'Excavator rental service', 'Portable toilet rental service',
  'Temporary fencing rental', 'Modular building supplier', 'Prefabricated building company', 'Air conditioning contractor',
  'Heating contractor', 'HVAC contractor', 'HVAC maintenance service', 'Boiler repair service',
  'Furnace repair service', 'Air duct cleaning service', 'Ventilation contractor', 'Water heater installer',
  'Water heater repair service', 'Solar water heater installer', 'Gas appliance service', 'Gas line contractor',
  'Drain cleaning service', 'Sewer service', 'Septic service', 'Septic tank installer',
  'Well drilling contractor', 'Water filtration service', 'Water softener supplier', 'Water treatment service',
  'Irrigation contractor', 'Sprinkler system installer', 'Lawn care service', 'Tree service',
  'Arborist', 'Tree removal service', 'Stump grinding service', 'Garden maintenance service',
  'Landscape designer', 'Landscape contractor', 'Hardscape contractor', 'Outdoor lighting contractor',
  'Pool contractor', 'Pool maintenance service', 'Pool cleaning service', 'Pool equipment supplier',
  'Fence contractor', 'Gate contractor', 'Deck builder', 'Patio contractor',
  'Pergola builder', 'Outdoor kitchen contractor', 'Window installation service', 'Door installation service',
  'Garage door service', 'Glass repair service', 'Mirror installation service', 'Blinds installer',
  'Curtain installation service', 'Upholstery service', 'Furniture repair service', 'Furniture restoration service',
  'Carpet cleaning service', 'Rug cleaning service', 'Upholstery cleaning service', 'House cleaning service',
  'Deep cleaning service', 'Move-out cleaning service', 'Commercial cleaning company', 'Janitorial service',
  'Window cleaning service', 'Pressure washing service', 'Chimney cleaning service', 'Fireplace service',
  'Pest exterminator', 'Termite control service', 'Rodent control service', 'Mosquito control service',
  'Wildlife removal service', 'Mold remediation service', 'Asbestos remediation service', 'Water damage restoration service',
  'Fire damage restoration service', 'Disaster restoration company', 'Home security installer', 'Smart home installer',
  'Home automation company', 'Business consulting firm', 'Management consulting firm', 'Strategy consulting firm',
  'Operations consulting firm', 'Human resources consulting firm', 'Organizational development consultant', 'Process improvement consultant',
  'Quality management consultant', 'Supply chain consultant', 'Procurement consultant', 'Project management consultant',
  'Change management consultant', 'Risk management consultant', 'Compliance consultant', 'Regulatory consultant',
  'Sustainability consultant', 'Environmental consultant', 'Energy consultant', 'Engineering consultant',
  'Technical consultant', 'IT consultant', 'Business process consultant', 'Franchise consultant',
  'Small business consultant', 'Startup consultant', 'Entrepreneurship consultant', 'Career consultant',
  'Executive coach', 'Leadership coach', 'Recruitment consultant', 'Talent acquisition consultant',
  'Outsourcing consultant', 'International business consultant', 'Export consultant', 'Import consultant',
  'Trade consultant', 'Business valuation service', 'Due diligence service', 'Market research firm',
  'Survey research company', 'Data analytics consultancy', 'Business intelligence consultancy', 'Economic consulting firm',
  'Public relations firm', 'Corporate communications agency', 'Crisis communications agency', 'Copywriting agency',
  'Content writing agency', 'Translation agency', 'Interpretation service', 'Localization agency',
  'Proofreading service', 'Editing service', 'Technical writing service', 'Grant writing service',
  'Proposal writing service', 'Virtual assistant service', 'Administrative support service', 'Call center service',
  'Customer support outsourcing', 'Back office outsourcing service', 'Document management service', 'Records management service',
  'Business process outsourcing company', 'Office support service', 'Secretarial service', 'Executive assistant service',
  'Notary service', 'Document authentication service', 'Courier service', 'Business registration service',
  'Licensing consultant', 'Permit expediting service', 'Corporate secretary service', 'Registered agent service',
  'Office rental service', 'Bookkeeping service', 'Payroll service', 'Payroll processing company',
  'Tax preparation service', 'Tax filing service', 'Corporate tax consultant', 'Personal tax consultant',
  'International tax consultant', 'Sales tax consultant', 'GST consultant', 'VAT consultant',
  'Audit firm', 'Internal audit consultant', 'External audit firm', 'Forensic accounting firm',
  'Management accounting service', 'Cost accounting service', 'Financial planning firm', 'Financial advisor',
  'Wealth management firm', 'Investment advisor', 'Portfolio management firm', 'Asset management company',
  'Private wealth advisor', 'Retirement planning advisor', 'Estate planning advisor', 'Pension consultant',
  'Mortgage broker', 'Home loan agency', 'Commercial lending company', 'Business loan provider',
  'Microfinance institution', 'Credit union', 'Savings bank', 'Commercial bank',
  'Investment bank', 'Private bank', 'Digital bank', 'Online bank',
  'Payment processing company', 'Payment gateway provider', 'Merchant services provider', 'Credit card processing service',
  'Point of sale financing provider', 'Factoring company', 'Invoice financing company', 'Equipment financing company',
  'Leasing company', 'Auto finance company', 'Consumer finance company', 'Credit counseling service',
  'Debt counseling service', 'Debt management company', 'Debt collection agency', 'Credit reporting agency',
  'Credit repair service', 'Foreign exchange service', 'Currency exchange office', 'Remittance service',
  'Money transfer service', 'Investment research firm', 'Securities brokerage', 'Stock brokerage',
  'Commodity brokerage', 'Futures brokerage', 'Insurance brokerage', 'Financial technology company',
  'Accounting software company', 'Payroll software company', 'Expense management software company', 'Invoicing software company',
  'Bookkeeping software provider', 'Tax software provider', 'Financial data provider', 'Credit risk service',
  'Fraud detection service', 'Treasury management service', 'Corporate finance advisory', 'Mergers and acquisitions advisor',
  'Venture capital firm', 'Private equity firm', 'Angel investment network', 'Family office',
  'Crowdfunding platform', 'Life insurance agency', 'Health insurance agency', 'Auto insurance agency',
  'Home insurance agency', 'Property insurance agency', 'Commercial insurance agency', 'Business insurance agency',
  'Travel insurance agency', 'Pet insurance agency', 'Marine insurance agency', 'Aviation insurance agency',
  'Crop insurance agency', 'Farm insurance agency', 'Workers compensation agency', 'Professional liability insurance agency',
  'General liability insurance agency', 'Cyber insurance agency', 'Directors and officers insurance agency', 'Errors and omissions insurance agency',
  'Surety bond agency', 'Insurance broker', 'Insurance claims service', 'Insurance claims adjuster',
  'Insurance appraisal service', 'Insurance underwriting service', 'Insurance consulting firm', 'Insurance technology company',
  'Insurance comparison service', 'Insurance actuarial firm', 'Actuarial consultant', 'Risk insurance consultant',
  'Reinsurance broker', 'Reinsurance company', 'Insurance premium financing service', 'Insurance restoration contractor',
  'Insurance documentation service', 'Insurance fraud investigation service', 'Benefits consultant', 'Employee benefits broker',
  'Group health insurance broker', 'Medicare insurance agency', 'Medicaid consulting service', 'Long-term care insurance agency',
  'Disability insurance agency', 'Annuity advisor', 'Retirement insurance advisor', 'Key person insurance agency',
  'Business interruption insurance agency', 'Event insurance agency', 'Wedding insurance agency', 'Rental property insurance agency',
  'Flood insurance agency', 'Earthquake insurance agency', 'Fire insurance agency', 'Cyber risk consultant',
  'Corporate law firm', 'Business law firm', 'Commercial law firm', 'Contract law firm',
  'Employment law firm', 'Labor law firm', 'Real estate law firm', 'Property law firm',
  'Construction law firm', 'Tax law firm', 'Banking law firm', 'Finance law firm',
  'Securities law firm', 'Insurance law firm', 'Intellectual property law firm', 'Patent law firm',
  'Trademark law firm', 'Copyright law firm', 'Technology law firm', 'Privacy law firm',
  'Cybersecurity law firm', 'Data protection law firm', 'Immigration law firm', 'Family law firm',
  'Divorce law firm', 'Child custody law firm', 'Adoption law firm', 'Estate planning law firm',
  'Probate law firm', 'Trust law firm', 'Personal injury law firm', 'Medical malpractice law firm',
  'Product liability law firm', 'Workers compensation law firm', 'Criminal defense law firm', 'DUI defense law firm',
  'Civil litigation law firm', 'Appellate law firm', 'Arbitration firm', 'Mediation service',
  'Alternative dispute resolution service', 'Bankruptcy law firm', 'Insolvency law firm', 'Environmental law firm',
  'Energy law firm', 'Healthcare law firm', 'Education law firm', 'Entertainment law firm',
  'Sports law firm', 'Media law firm', 'Maritime law firm', 'Aviation law firm',
  'International law firm', 'Immigration consultant', 'Legal document preparation service', 'Legal research service',
  'Legal translation service', 'Legal process service', 'Court reporting service', 'Court transcription service',
  'Notary public', 'Legal technology company', 'Legal billing service', 'Legal staffing agency',
  'Legal recruiter', 'Compliance law consultant', 'Regulatory law consultant', 'Franchise law firm',
  'Antitrust law firm', 'Consumer protection law firm', 'Human rights law firm', 'Nonprofit law firm',
  'Municipal law firm', 'Preschool', 'Daycare center', 'Montessori school',
  'Primary school', 'Elementary school', 'Middle school', 'High school',
  'Private school', 'Public school', 'International school', 'Boarding school',
  'Special education school', 'Vocational school', 'Technical school', 'Trade school',
  'Community college', 'Children\'s dental clinic', 'Cosmetic surgery clinic', 'Urgent care center',
  'Commercial photography agency', 'Mobile app design agency', 'Warehouse logistics company', 'Pet boarding and grooming center',
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
    const [isCustomCategory, setIsCustomCategory] = useState(false);
    const [customCategory, setCustomCategory] = useState('');

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
            {filtered.length} of {BUSINESS_CATEGORIES.length} categories
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
