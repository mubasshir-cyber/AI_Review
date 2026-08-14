const fs = require('fs');

const content = fs.readFileSync('src/frontend/components/CategorySearchDropdown.tsx', 'utf-8');
const match = content.match(/export const BUSINESS_CATEGORIES: string\[\] = \[([\s\S]*?)\]\.sort\(\);/);

// Remove comments and split by comma
const rawItems = match[1]
  .split('\n')
  .filter(line => !line.trim().startsWith('//'))
  .join('\n')
  .split(',');

let items = rawItems
  .map(s => s.trim().replace(/^'|'$/g, ''))
  .filter(s => s.length > 0);

const groups = {
  'Food & Beverage': [],
  'Retail & Shopping': [],
  'Health & Medical': [],
  'Beauty & Wellness': [],
  'Fitness & Sports': [],
  'Real Estate & Construction': [],
  'Home Services & Repair': [],
  'Professional Services': [],
  'Finance & Insurance': [],
  'Legal Services': [],
  'Travel & Hospitality': [],
  'Education & Childcare': [],
  'Automotive': [],
  'Events & Entertainment': [],
  'Technology & Marketing': [],
  'Other Categories': []
};

const keywords = {
  'Food & Beverage': ['restaurant', 'cafe', 'coffee', 'bakery', 'bar', 'food', 'catering', 'deli', 'pizza', 'sushi', 'pub', 'brewery', 'ice cream', 'dessert', 'grocery', 'supermarket', 'market', 'butcher', 'liquor', 'tea', 'juice', 'smoothie', 'diner'],
  'Retail & Shopping': ['store', 'shop', 'boutique', 'retail', 'clothing', 'shoe', 'jewelry', 'hardware', 'apparel', 'mall', 'outlet', 'confectionery', 'supply', 'dealer'],
  'Health & Medical': ['medical', 'clinic', 'hospital', 'dentist', 'dental', 'doctor', 'pharmacy', 'therapy', 'rehab', 'surgeon', 'healthcare', 'care', 'orthodontist', 'periodontist', 'pediatric', 'diagnostic', 'laboratory', 'midwife', 'nurse', 'blood', 'optometrist', 'veterinary'],
  'Beauty & Wellness': ['salon', 'spa', 'massage', 'beauty', 'hair', 'nail', 'makeup', 'skincare', 'cosmetic', 'barber', 'waxing', 'lash', 'brow'],
  'Fitness & Sports': ['fitness', 'gym', 'sports', 'yoga', 'club', 'martial arts', 'training', 'studio', 'golf', 'swimming', 'tennis', 'dance', 'pilates'],
  'Real Estate & Construction': ['real estate', 'property', 'contractor', 'construction', 'builder', 'architecture', 'developer', 'plumber', 'electrician', 'surveyor', 'renovation', 'roofing'],
  'Home Services & Repair': ['cleaning', 'pest', 'landscaping', 'hvac', 'repair', 'maintenance', 'moving', 'locksmith', 'laundry', 'tree', 'garden', 'pool', 'restoration'],
  'Professional Services': ['consultant', 'consulting', 'agency', 'service', 'firm', 'management', 'notary', 'assistant'],
  'Finance & Insurance': ['finance', 'financial', 'insurance', 'bank', 'accounting', 'tax', 'mortgage', 'investment', 'loan', 'credit', 'brokerage', 'actuarial', 'payroll', 'audit', 'wealth'],
  'Legal Services': ['law', 'lawyer', 'legal', 'attorney', 'court', 'dispute', 'arbitration', 'mediation'],
  'Travel & Hospitality': ['hotel', 'travel', 'resort', 'motel', 'guest house', 'bed & breakfast', 'tour'],
  'Education & Childcare': ['school', 'academy', 'education', 'tutoring', 'daycare', 'preschool', 'college', 'coach'],
  'Automotive': ['auto', 'car', 'tire', 'motorcycle', 'mechanic', 'vehicle', 'wash'],
  'Events & Entertainment': ['event', 'wedding', 'party', 'photography', 'entertainment', 'venue', 'photographer'],
  'Technology & Marketing': ['software', 'it ', 'computer', 'digital', 'marketing', 'design', 'web', 'cyber', 'data', 'app', 'seo']
};

for (const item of items) {
  let placed = false;
  const lowerItem = item.toLowerCase();
  
  // Assign to group
  for (const [group, words] of Object.entries(keywords)) {
    if (words.some(w => lowerItem.includes(w))) {
      groups[group].push(item);
      placed = true;
      break;
    }
  }
  
  if (!placed) {
    groups['Other Categories'].push(item);
  }
}

let result = 'export const GROUPED_CATEGORIES: { group: string; items: string[] }[] = [\n';
for (const [group, groupItems] of Object.entries(groups)) {
  if (groupItems.length > 0) {
    // Sort and remove duplicates
    const uniqueItems = [...new Set(groupItems)].sort();
    result += `  { group: '${group}', items: [\n    ` + uniqueItems.map(i => `'${i.replace(/'/g, "\\'")}'`).join(',\n    ') + '\n  ]},\n';
  }
}
result += '];\n\n// Flattened version for backward compatibility if needed\nexport const BUSINESS_CATEGORIES: string[] = GROUPED_CATEGORIES.flatMap(g => g.items);\n';

fs.writeFileSync('scripts/grouped.tsx', result);
console.log('Done generating grouped categories.');
