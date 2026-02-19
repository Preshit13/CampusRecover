// Matching Module
// Handles fetching and displaying match suggestions for found items

const API_URL = "http://localhost:3000/api/found-items";

// Fetch matches for a found item from the backend
export async function fetchMatches(foundItemId) {
  try {
    const res = await fetch(`${API_URL}/${foundItemId}/matches`);
    if (!res.ok) throw new Error("Failed to fetch matches");
    return await res.json();
  } catch (err) {
    console.error("Error fetching matches:", err);
    return [];
  }
}

// Determine score label class based on score value
export function getScoreClass(score) {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

// Render match cards into a given container element
export function renderMatches(matches, container) {
  if (!container) return;

  if (matches.length === 0) {
    container.innerHTML = `
      <div class="no-matches">
        <p>😔 No potential matches found</p>
        <small>No active lost item reports match this found item yet.</small>
      </div>`;
    return;
  }

  container.innerHTML = matches
    .map((m) => {
      const scoreClass = getScoreClass(m.matchScore);
      const reasons =
        m.matchReasons && m.matchReasons.length > 0
          ? `<div class="match-reasons">
          <p>Why this might match:</p>
          <ul>${m.matchReasons.map((r) => `<li>${r}</li>`).join("")}</ul>
        </div>`
          : "";

      return `
      <div class="match-card">
        <div class="match-header">
          <span class="match-title">${m.itemName}</span>
          <span class="match-score ${scoreClass}">${m.matchScore}% match</span>
        </div>
        <div class="match-details"><strong>📂 Category:</strong> ${m.category}</div>
        <div class="match-details"><strong>📍 Last Seen:</strong> ${m.location}</div>
        <div class="match-details"><strong>📅 Lost On:</strong> ${new Date(m.dateTime).toLocaleString()}</div>
        <div class="match-details"><strong>📝 Description:</strong> ${m.description}</div>
        ${reasons}
        <div class="match-contact"><strong>✉️ Owner Contact:</strong> ${m.contactInfo}</div>
      </div>`;
    })
    .join("");
}
