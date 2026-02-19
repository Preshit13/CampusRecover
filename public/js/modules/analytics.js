// Analytics Module

const API_BASE = "http://localhost:3000/api/analytics";

// Fetch recovery statistics
async function fetchRecoveryStats() {
  try {
    const response = await fetch(`${API_BASE}/recovery-stats`);
    if (!response.ok) throw new Error("Failed to fetch recovery stats");
    return await response.json();
  } catch (error) {
    console.error("Error fetching recovery stats:", error);
    return null;
  }
}

// Fetch common locations
async function fetchCommonLocations() {
  try {
    const response = await fetch(`${API_BASE}/common-locations`);
    if (!response.ok) throw new Error("Failed to fetch locations");
    return await response.json();
  } catch (error) {
    console.error("Error fetching locations:", error);
    return [];
  }
}

// Fetch item types
async function fetchItemTypes() {
  try {
    const response = await fetch(`${API_BASE}/item-types`);
    if (!response.ok) throw new Error("Failed to fetch item types");
    return await response.json();
  } catch (error) {
    console.error("Error fetching item types:", error);
    return [];
  }
}

// Fetch recovery by category
async function fetchRecoveryByCategory() {
  try {
    const response = await fetch(`${API_BASE}/recovery-by-category`);
    if (!response.ok) throw new Error("Failed to fetch recovery by category");
    return await response.json();
  } catch (error) {
    console.error("Error fetching recovery by category:", error);
    return [];
  }
}

// Render overall statistics cards
function renderRecoveryStats(stats) {
  if (!stats) {
    document.getElementById("totalLost").textContent = "--";
    document.getElementById("totalRecovered").textContent = "--";
    document.getElementById("totalActive").textContent = "--";
    document.getElementById("recoveryRate").textContent = "--%";
    return;
  }

  document.getElementById("totalLost").textContent = stats.totalLost;
  document.getElementById("totalRecovered").textContent = stats.totalRecovered;
  document.getElementById("totalActive").textContent = stats.totalActive;
  document.getElementById("recoveryRate").textContent = `${stats.recoveryRate}%`;
}

// Render common locations
function renderCommonLocations(locations) {
  const container = document.getElementById("locationsList");

  if (locations.length === 0) {
    container.innerHTML = `
      <div class="empty-analytics">
        <p>No location data available</p>
      </div>
    `;
    return;
  }

  // Find max count for bar width calculation
  const maxCount = Math.max(...locations.map((l) => l.count));

  container.innerHTML = locations
    .map((loc, index) => {
      const barWidth = (loc.count / maxCount) * 100;
      return `
      <div class="location-item">
        <div>
          <div class="location-name">
            <span>${index + 1}.</span>
            <span>📍 ${loc.location}</span>
          </div>
          <div class="location-bar" style="width: ${barWidth}%"></div>
        </div>
        <span class="location-count">${loc.count}</span>
      </div>
    `;
    })
    .join("");
}

// Render item types
function renderItemTypes(itemTypes) {
  const container = document.getElementById("itemTypesList");

  if (itemTypes.length === 0) {
    container.innerHTML = `
      <div class="empty-analytics">
        <p>No item type data available</p>
      </div>
    `;
    return;
  }

  const icons = {
    Electronics: "📱",
    Accessories: "👜",
    Clothing: "👕",
    Books: "📚",
    IDs: "🪪",
    Keys: "🔑",
    Other: "📦",
  };

  container.innerHTML = itemTypes
    .map(
      (type, index) => `
    <div class="item-type">
      <div class="category-name">
        <span>${index + 1}.</span>
        <span>${icons[type.category] || "📦"} ${type.category}</span>
      </div>
      <span class="category-count">${type.count}</span>
    </div>
  `
    )
    .join("");
}

// Render recovery by category table
function renderRecoveryByCategory(data) {
  const container = document.getElementById("recoveryByCategoryTable");

  if (data.length === 0) {
    container.innerHTML = `
      <div class="empty-analytics">
        <p>No recovery data available</p>
      </div>
    `;
    return;
  }

  const icons = {
    Electronics: "📱",
    Accessories: "👜",
    Clothing: "👕",
    Books: "📚",
    IDs: "🪪",
    Keys: "🔑",
    Other: "📦",
  };

  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Category</th>
          <th>Total Lost</th>
          <th>Recovered</th>
          <th>Recovery Rate</th>
        </tr>
      </thead>
      <tbody>
        ${data
          .map(
            (item) => `
          <tr>
            <td>${icons[item.category] || "📦"} ${item.category}</td>
            <td>${item.total}</td>
            <td>${item.recovered}</td>
            <td>
              <div class="recovery-rate-bar">
                <div class="recovery-rate-fill" style="width: ${item.recoveryRate}%">
                  ${item.recoveryRate.toFixed(1)}%
                </div>
              </div>
            </td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  `;
}

// Load all analytics data
async function loadAnalytics() {
  // Show loading state
  console.log("Loading analytics...");

  // Fetch all data in parallel
  const [stats, locations, itemTypes, recoveryByCategory] = await Promise.all([
    fetchRecoveryStats(),
    fetchCommonLocations(),
    fetchItemTypes(),
    fetchRecoveryByCategory(),
  ]);

  // Render all sections
  renderRecoveryStats(stats);
  renderCommonLocations(locations);
  renderItemTypes(itemTypes);
  renderRecoveryByCategory(recoveryByCategory);

  console.log("Analytics loaded successfully!");
}

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  loadAnalytics();
});
