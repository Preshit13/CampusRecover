// Check if two locations are similar (case-insensitive partial match)
export function isSimilarLocation(loc1, loc2) {
  if (!loc1 || !loc2) return false;
  const a = loc1.toLowerCase();
  const b = loc2.toLowerCase();
  return a.includes(b) || b.includes(a);
}

// Check if two dates are within a given number of days of each other
export function isRecentDate(date1, date2, daysThreshold = 7) {
  if (!date1 || !date2) return false;
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffMs = Math.abs(d1 - d2);
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays <= daysThreshold;
}

// Calculate keyword overlap between two description strings (0 to 1)
export function calculateKeywordSimilarity(desc1, desc2) {
  if (!desc1 || !desc2) return 0;

  // Stopwords to ignore
  const stopwords = new Set([
    'a','an','the','and','or','but','in','on','at','to','for',
    'of','with','it','is','was','i','my','this','that','have',
    'had','has','be','been','its','from','by','as','are',
  ]);

  const tokenize = (str) =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopwords.has(w));

  const words1 = new Set(tokenize(desc1));
  const words2 = new Set(tokenize(desc2));

  if (words1.size === 0 || words2.size === 0) return 0;

  let matches = 0;
  for (const w of words1) {
    if (words2.has(w)) matches++;
  }

  // Jaccard similarity
  const union = new Set([...words1, ...words2]).size;
  return matches / union;
}

// Score a found item against a lost item (0 to 100)
export function calculateMatchScore(foundItem, lostItem) {
  let score = 0;

  // Category match — worth 40 points
  if (
    foundItem.category &&
    lostItem.category &&
    foundItem.category === lostItem.category
  ) {
    score += 40;
  }

  // Location similarity — worth 30 points
  const locationMatch = isSimilarLocation(
    foundItem.locationFound,
    lostItem.location
  );
  if (locationMatch) score += 30;

  // Date proximity — worth 20 points
  const dateMatch = isRecentDate(foundItem.dateTime, lostItem.dateTime, 7);
  if (dateMatch) score += 20;

  // Keyword similarity in description — worth 10 points
  const keywordScore = calculateKeywordSimilarity(
    foundItem.description,
    lostItem.description
  );
  score += Math.round(keywordScore * 10);

  return Math.min(score, 100);
}

// Find top matches for a found item from the lost items list
export function findMatches(foundItem, lostItems) {
  const scored = lostItems
    .filter((lost) => lost.status === 'active') // only match active lost items
    .map((lost) => ({
      ...lost,
      matchScore: calculateMatchScore(foundItem, lost),
      matchReasons: getMatchReasons(foundItem, lost),
    }))
    .filter((lost) => lost.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5); // top 5 matches

  return scored;
}

// Generate human-readable reasons for a match
export function getMatchReasons(foundItem, lostItem) {
  const reasons = [];

  if (foundItem.category === lostItem.category) {
    reasons.push(`Same category: ${foundItem.category}`);
  }

  if (isSimilarLocation(foundItem.locationFound, lostItem.location)) {
    reasons.push(`Similar location: found at "${foundItem.locationFound}", lost near "${lostItem.location}"`);
  }

  if (isRecentDate(foundItem.dateTime, lostItem.dateTime, 7)) {
    reasons.push('Found within 7 days of when item was lost');
  }

  const kwScore = calculateKeywordSimilarity(
    foundItem.description,
    lostItem.description
  );
  if (kwScore > 0.1) {
    reasons.push('Similar description keywords');
  }

  return reasons;
}