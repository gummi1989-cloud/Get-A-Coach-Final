import { INITIAL_SPORTS } from '../data/mockData';

/**
 * Flexible sport matcher that checks if a coach's list of sports matches a selected sport or sport category filter.
 * Handles cases where selectedSport is a main category like "Racketsport (Tennis, Padel, Squash)"
 * and coach.sports contains sub-sports like ["Padel Tennis", "Tennis"] or vice-versa.
 */
export function coachMatchesSportFilter(coachSports: string[] | undefined, selectedSport: string): boolean {
  if (!selectedSport || selectedSport === 'ALL') return true;
  if (!Array.isArray(coachSports) || coachSports.length === 0) return false;

  const selLower = selectedSport.toLowerCase().trim();

  // 1. Direct exact or substring match
  for (const cs of coachSports) {
    if (!cs) continue;
    const csLower = cs.toLowerCase().trim();

    if (csLower === selLower) return true;
    if (csLower.includes(selLower) || selLower.includes(csLower)) return true;
  }

  // 2. Category matching via INITIAL_SPORTS definition
  const matchedCategory = INITIAL_SPORTS.find(
    s => s.name.toLowerCase() === selLower || s.id.toLowerCase() === selLower
  );

  if (matchedCategory) {
    const textToMatch = `${matchedCategory.name} ${matchedCategory.description}`.toLowerCase();
    
    for (const cs of coachSports) {
      if (!cs) continue;
      const csLower = cs.toLowerCase().trim();
      
      // Extract words from csLower (length >= 3)
      const words = csLower.split(/[\s,()&\-\/]+/).filter(w => w.length >= 3);
      if (words.some(w => textToMatch.includes(w))) {
        return true;
      }
    }
  }

  // 3. Reverse category check: If coach has a full category name e.g. "Racketsport (Tennis, Padel, Squash)" and selectedSport is "Tennis"
  for (const cs of coachSports) {
    if (!cs) continue;
    const csLower = cs.toLowerCase().trim();
    const coachCategory = INITIAL_SPORTS.find(
      s => s.name.toLowerCase() === csLower || s.id.toLowerCase() === csLower
    );
    if (coachCategory) {
      const coachText = `${coachCategory.name} ${coachCategory.description}`.toLowerCase();
      if (coachText.includes(selLower)) return true;
      const selWords = selLower.split(/[\s,()&\-\/]+/).filter(w => w.length >= 3);
      if (selWords.some(w => coachText.includes(w))) return true;
    }
  }

  // 4. Word token overlap between selectedSport and coachSports
  const selTokens = selLower.split(/[\s,()&\-\/]+/).filter(w => w.length >= 3);
  for (const cs of coachSports) {
    if (!cs) continue;
    const csLower = cs.toLowerCase().trim();
    if (selTokens.some(token => csLower.includes(token))) {
      return true;
    }
  }

  return false;
}
