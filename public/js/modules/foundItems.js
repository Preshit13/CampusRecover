// Found Items Module

const API_URL = "http://localhost:3000/api/found-items";

// Helper: get current local datetime string for datetime-local input
function getCurrentLocalDateTime() {
  const now = new Date();
  const y = now.getFullYear();
  const mo = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const h = String(now.getHours()).padStart(2, "0");
  const mi = String(now.getMinutes()).padStart(2, "0");
  return `${y}-${mo}-${d}T${h}:${mi}`;
}

// Fetch all found items with optional filters
async function fetchFoundItems(category = "", location = "") {
  try {
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (location) params.append("location", location);

    const url = params.toString() ? `${API_URL}?${params}` : API_URL;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch items");
    return await res.json();
  } catch (err) {
    console.error("Error fetching found items:", err);
    return [];
  }
}

// Render found items to the page
function renderFoundItems(items) {
  const container = document.getElementById("foundItemsList");

  if (items.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>No found items reported yet</p>
        <small>Be the first to report a found item!</small>
      </div>`;
    return;
  }

  container.innerHTML = items
    .map(
      (item) => `
    <div class="item-card" data-id="${item._id}">
      <div class="item-header">
        <h3 class="item-title">${item.itemName}</h3>
        <span class="item-category">${item.category}</span>
      </div>

      <p class="item-description">${item.description}</p>

      <div class="item-details"><strong>📍 Found At:</strong> ${item.locationFound}</div>
      <div class="item-details"><strong>📦 Currently At:</strong> ${item.currentLocation}</div>
      <div class="item-details"><strong>📅 Date Found:</strong> ${new Date(item.dateTime).toLocaleString()}</div>
      <div class="item-details"><strong>✉️ Contact:</strong> ${item.contactInfo}</div>

      <span class="item-status status-${item.status}">${item.status.toUpperCase()}</span>

      <div class="item-actions">
        <button class="btn-edit" onclick="editItem('${item._id}')">Edit</button>
        <button class="btn-matches" onclick="viewMatches('${item._id}')">🎯 Matches</button>
        ${
          item.status === "unclaimed"
            ? `<button class="btn-claim" onclick="markAsClaimed('${item._id}')">Mark Claimed</button>`
            : ""
        }
        <button class="btn-delete" onclick="deleteItem('${item._id}')">Delete</button>
      </div>
    </div>
  `
    )
    .join("");
}

// Submit new found item
async function submitFoundItem(e) {
  e.preventDefault();

  // Validate not future date
  const selectedDate = new Date(document.getElementById("dateTime").value);
  const now = new Date();
  selectedDate.setSeconds(0, 0);
  now.setSeconds(0, 0);
  if (selectedDate > now) {
    alert("❌ Cannot report items found in the future! Please select a past or current date.");
    return;
  }

  const formData = {
    itemName: document.getElementById("itemName").value,
    category: document.getElementById("category").value,
    description: document.getElementById("description").value,
    locationFound: document.getElementById("locationFound").value,
    currentLocation: document.getElementById("currentLocation").value,
    dateTime: document.getElementById("dateTime").value,
    contactInfo: document.getElementById("contactInfo").value,
    status: "unclaimed",
  };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (!res.ok) throw new Error("Failed to submit");

    alert("✅ Found item reported successfully!");
    document.getElementById("foundItemForm").reset();

    const nowStr = getCurrentLocalDateTime();
    document.getElementById("dateTime").setAttribute("max", nowStr);
    document.getElementById("dateTime").value = nowStr;

    loadItems();
  } catch (err) {
    console.error("Error submitting found item:", err);
    alert("❌ Failed to submit item. Please try again.");
  }
}

// Open edit modal with item data
window.editItem = async function (itemId) {
  try {
    const res = await fetch(`${API_URL}/${itemId}`);
    if (!res.ok) throw new Error("Failed to fetch item");
    const item = await res.json();

    document.getElementById("editItemId").value = item._id;
    document.getElementById("editItemName").value = item.itemName;
    document.getElementById("editCategory").value = item.category;
    document.getElementById("editDescription").value = item.description;
    document.getElementById("editLocationFound").value = item.locationFound;
    document.getElementById("editCurrentLocation").value = item.currentLocation;
    document.getElementById("editContactInfo").value = item.contactInfo;
    document.getElementById("editStatus").value = item.status;

    // Format date for datetime-local input
    const d = new Date(item.dateTime);
    document.getElementById("editDateTime").value =
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

    document.getElementById("editDateTime").setAttribute("max", getCurrentLocalDateTime());
    document.getElementById("editModal").style.display = "flex";
  } catch (err) {
    console.error("Error loading item for edit:", err);
    alert("❌ Failed to load item details");
  }
};

// Save edited item
async function saveEdit(e) {
  e.preventDefault();

  const selectedDate = new Date(document.getElementById("editDateTime").value);
  const now = new Date();
  selectedDate.setSeconds(0, 0);
  now.setSeconds(0, 0);
  if (selectedDate > now) {
    alert("❌ Cannot set found date to the future!");
    return;
  }

  const itemId = document.getElementById("editItemId").value;
  const formData = {
    itemName: document.getElementById("editItemName").value,
    category: document.getElementById("editCategory").value,
    description: document.getElementById("editDescription").value,
    locationFound: document.getElementById("editLocationFound").value,
    currentLocation: document.getElementById("editCurrentLocation").value,
    dateTime: document.getElementById("editDateTime").value,
    contactInfo: document.getElementById("editContactInfo").value,
    status: document.getElementById("editStatus").value,
  };

  try {
    const res = await fetch(`${API_URL}/${itemId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (!res.ok) throw new Error("Failed to update");

    alert("✅ Item updated successfully!");
    closeEditModal();
    loadItems();
  } catch (err) {
    console.error("Error updating item:", err);
    alert("❌ Failed to update item");
  }
}

// Close edit modal
window.closeEditModal = function () {
  document.getElementById("editModal").style.display = "none";
};

// Mark item as claimed
window.markAsClaimed = async function (itemId) {
  if (!confirm("Mark this item as claimed?")) return;
  try {
    const res = await fetch(`${API_URL}/${itemId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "claimed" }),
    });
    if (!res.ok) throw new Error("Failed to update status");

    alert("✅ Item marked as claimed!");
    loadItems();
  } catch (err) {
    console.error("Error updating status:", err);
    alert("❌ Failed to update status");
  }
};

// Delete item
window.deleteItem = async function (itemId) {
  if (!confirm("Are you sure you want to delete this item?")) return;
  try {
    const res = await fetch(`${API_URL}/${itemId}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete");

    alert("✅ Item deleted successfully!");
    loadItems();
  } catch (err) {
    console.error("Error deleting item:", err);
    alert("❌ Failed to delete item");
  }
};

// View matches for a found item
window.viewMatches = async function (itemId) {
  document.getElementById("matchesList").innerHTML = '<p class="loading">Finding matches...</p>';
  document.getElementById("matchesModal").style.display = "flex";

  try {
    const res = await fetch(`${API_URL}/${itemId}/matches`);
    if (!res.ok) throw new Error("Failed to fetch matches");
    const matches = await res.json();
    renderMatches(matches);
  } catch (err) {
    console.error("Error fetching matches:", err);
    document.getElementById("matchesList").innerHTML =
      '<p class="no-matches">❌ Failed to load matches</p>';
  }
};

// Render match suggestions
function renderMatches(matches) {
  const container = document.getElementById("matchesList");

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
      const scoreClass = m.matchScore >= 70 ? "high" : m.matchScore >= 40 ? "medium" : "low";
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

// Close matches modal
window.closeMatchesModal = function () {
  document.getElementById("matchesModal").style.display = "none";
};

// Search/filter
function searchItems() {
  const category = document.getElementById("filterCategory").value;
  const location = document.getElementById("filterLocation").value;
  loadItems(category, location);
}

function clearFilters() {
  document.getElementById("filterCategory").value = "";
  document.getElementById("filterLocation").value = "";
  loadItems();
}

// Load items
async function loadItems(category = "", location = "") {
  const items = await fetchFoundItems(category, location);
  renderFoundItems(items);
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  const nowStr = getCurrentLocalDateTime();
  const dtInput = document.getElementById("dateTime");
  dtInput.setAttribute("max", nowStr);
  dtInput.value = nowStr;

  loadItems();

  document.getElementById("foundItemForm").addEventListener("submit", submitFoundItem);
  document.getElementById("editForm").addEventListener("submit", saveEdit);
  document.getElementById("searchBtn").addEventListener("click", searchItems);
  document.getElementById("clearBtn").addEventListener("click", clearFilters);

  // Close modals
  document.querySelector(".close").addEventListener("click", closeEditModal);
  document.querySelector(".close-matches").addEventListener("click", closeMatchesModal);

  window.addEventListener("click", (e) => {
    if (e.target === document.getElementById("editModal")) closeEditModal();
    if (e.target === document.getElementById("matchesModal")) closeMatchesModal();
  });
});
