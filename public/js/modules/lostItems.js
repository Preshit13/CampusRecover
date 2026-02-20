// Lost Items Module

const API_URL = "/api/lost-items";
let currentPage = 1;
let currentCategory = "";
let currentLocation = "";

// Helper function to get current local datetime in required format
function getCurrentLocalDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Fetch all lost items (with optional filters and pagination)
async function fetchLostItems(category = "", location = "", page = 1) {
  try {
    let url = API_URL;
    const params = new URLSearchParams();

    if (category) params.append("category", category);
    if (location) params.append("location", location);
    params.append("page", page);
    params.append("limit", "18");

    url += `?${params.toString()}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch items");

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching items:", error);
    return { items: [], pagination: null };
  }
}

// Render lost items to the page
function renderLostItems(items) {
  const container = document.getElementById("lostItemsList");

  if (items.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>No lost items found</p>
        <small>Try adjusting your search filters or be the first to report an item!</small>
      </div>
    `;
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
          
          <div class="item-details">
            <strong>📍 Location:</strong> ${item.location}
          </div>
          <div class="item-details">
            <strong>📅 Last Seen:</strong> ${new Date(item.dateTime).toLocaleString()}
          </div>
          <div class="item-details">
            <strong>✉️ Contact:</strong> ${item.contactInfo}
          </div>
          
          <span class="item-status status-${item.status}">${item.status.toUpperCase()}</span>
          
          <div class="item-actions">
            <button class="btn-edit" onclick="editItem('${item._id}')">Edit</button>
            ${
              item.status === "active"
                ? `<button class="btn-recover" onclick="markAsRecovered('${item._id}')">Mark Recovered</button>`
                : ""
            }
            <button class="btn-delete" onclick="deleteItem('${item._id}')">Delete</button>
          </div>
        </div>
      `
    )
    .join("");
}

// Render pagination controls
function renderPagination(pagination) {
  const container = document.getElementById("paginationControls");

  if (!pagination || pagination.totalPages <= 1) {
    container.innerHTML = "";
    return;
  }

  const { currentPage, totalPages, hasPrevPage, hasNextPage, totalItems } = pagination;

  container.innerHTML = `
    <div class="pagination">
      <div class="pagination-info">
        Showing page ${currentPage} of ${totalPages} (${totalItems} total items)
      </div>
      <div class="pagination-buttons">
        <button 
          class="pagination-btn" 
          onclick="goToPage(1)" 
          ${currentPage === 1 ? "disabled" : ""}
        >
          « First
        </button>
        <button 
          class="pagination-btn" 
          onclick="goToPage(${currentPage - 1})" 
          ${!hasPrevPage ? "disabled" : ""}
        >
          ‹ Prev
        </button>
        <span class="page-number">Page ${currentPage}</span>
        <button 
          class="pagination-btn" 
          onclick="goToPage(${currentPage + 1})" 
          ${!hasNextPage ? "disabled" : ""}
        >
          Next ›
        </button>
        <button 
          class="pagination-btn" 
          onclick="goToPage(${totalPages})" 
          ${currentPage === totalPages ? "disabled" : ""}
        >
          Last »
        </button>
      </div>
    </div>
  `;
}

// Go to specific page
window.goToPage = function (page) {
  currentPage = page;
  loadItems(currentCategory, currentLocation, currentPage);

  // Scroll to items section, not top of page
  const itemsSection = document.querySelector(".items-section");
  if (itemsSection) {
    itemsSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

// Submit new lost item
async function submitLostItem(event) {
  event.preventDefault();

  const selectedDateTime = document.getElementById("dateTime").value;
  const selectedDate = new Date(selectedDateTime);
  const now = new Date();

  selectedDate.setSeconds(0, 0);
  now.setSeconds(0, 0);

  if (selectedDate > now) {
    alert("❌ Cannot report items lost in the future! Please select a past or current date.");
    return;
  }

  const formData = {
    itemName: document.getElementById("itemName").value,
    category: document.getElementById("category").value,
    description: document.getElementById("description").value,
    location: document.getElementById("location").value,
    dateTime: document.getElementById("dateTime").value,
    contactInfo: document.getElementById("contactInfo").value,
    status: "active",
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) throw new Error("Failed to submit item");

    alert("✅ Lost item reported successfully!");
    document.getElementById("lostItemForm").reset();

    const nowReset = getCurrentLocalDateTime();
    document.getElementById("dateTime").setAttribute("max", nowReset);
    document.getElementById("dateTime").value = nowReset;

    currentPage = 1;
    loadItems();
  } catch (error) {
    console.error("Error submitting item:", error);
    alert("❌ Failed to submit item. Please try again.");
  }
}

// Edit item - open modal with item data
window.editItem = async function (itemId) {
  try {
    const response = await fetch(`${API_URL}/${itemId}`);
    if (!response.ok) throw new Error("Failed to fetch item");

    const item = await response.json();

    document.getElementById("editItemId").value = item._id;
    document.getElementById("editItemName").value = item.itemName;
    document.getElementById("editCategory").value = item.category;
    document.getElementById("editDescription").value = item.description;
    document.getElementById("editLocation").value = item.location;

    const itemDate = new Date(item.dateTime);
    const localDateTime =
      itemDate.getFullYear() +
      "-" +
      String(itemDate.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(itemDate.getDate()).padStart(2, "0") +
      "T" +
      String(itemDate.getHours()).padStart(2, "0") +
      ":" +
      String(itemDate.getMinutes()).padStart(2, "0");
    document.getElementById("editDateTime").value = localDateTime;

    document.getElementById("editContactInfo").value = item.contactInfo;
    document.getElementById("editStatus").value = item.status;

    const now = getCurrentLocalDateTime();
    const editDateTimeInput = document.getElementById("editDateTime");
    editDateTimeInput.setAttribute("max", now);

    editDateTimeInput.addEventListener("invalid", (e) => {
      e.target.setCustomValidity("Date and time cannot be in the future");
    });

    editDateTimeInput.addEventListener("input", (e) => {
      e.target.setCustomValidity("");
    });

    document.getElementById("editModal").style.display = "flex";
  } catch (error) {
    console.error("Error loading item for edit:", error);
    alert("❌ Failed to load item details");
  }
};

// Save edited item
async function saveEdit(event) {
  event.preventDefault();

  const selectedDateTime = document.getElementById("editDateTime").value;
  const selectedDate = new Date(selectedDateTime);
  const now = new Date();

  selectedDate.setSeconds(0, 0);
  now.setSeconds(0, 0);

  if (selectedDate > now) {
    alert("❌ Cannot set lost date to the future! Please select a past or current date.");
    return;
  }

  const itemId = document.getElementById("editItemId").value;
  const formData = {
    itemName: document.getElementById("editItemName").value,
    category: document.getElementById("editCategory").value,
    description: document.getElementById("editDescription").value,
    location: document.getElementById("editLocation").value,
    dateTime: document.getElementById("editDateTime").value,
    contactInfo: document.getElementById("editContactInfo").value,
    status: document.getElementById("editStatus").value,
  };

  try {
    const response = await fetch(`${API_URL}/${itemId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) throw new Error("Failed to update item");

    alert("✅ Item updated successfully!");
    closeEditModal();
    loadItems(currentCategory, currentLocation, currentPage);
  } catch (error) {
    console.error("Error updating item:", error);
    alert("❌ Failed to update item");
  }
}

// Close edit modal
window.closeEditModal = function () {
  document.getElementById("editModal").style.display = "none";
};

// Mark item as recovered
window.markAsRecovered = async function (itemId) {
  if (!confirm("Mark this item as recovered?")) return;

  try {
    const response = await fetch(`${API_URL}/${itemId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "recovered" }),
    });

    if (!response.ok) throw new Error("Failed to update status");

    alert("✅ Item marked as recovered!");
    loadItems(currentCategory, currentLocation, currentPage);
  } catch (error) {
    console.error("Error updating status:", error);
    alert("❌ Failed to update status");
  }
};

// Delete item
window.deleteItem = async function (itemId) {
  if (!confirm("Are you sure you want to delete this item?")) return;

  try {
    const response = await fetch(`${API_URL}/${itemId}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Failed to delete item");

    alert("✅ Item deleted successfully!");
    loadItems(currentCategory, currentLocation, currentPage);
  } catch (error) {
    console.error("Error deleting item:", error);
    alert("❌ Failed to delete item");
  }
};

// Search/filter functionality
function searchItems() {
  currentCategory = document.getElementById("filterCategory").value;
  currentLocation = document.getElementById("filterLocation").value;
  currentPage = 1;
  loadItems(currentCategory, currentLocation, currentPage);
}

function clearFilters() {
  document.getElementById("filterCategory").value = "";
  document.getElementById("filterLocation").value = "";
  currentCategory = "";
  currentLocation = "";
  currentPage = 1;
  loadItems();
}

// Load items (called on page load and after changes)
async function loadItems(category = "", location = "", page = 1) {
  const data = await fetchLostItems(category, location, page);
  renderLostItems(data.items);
  renderPagination(data.pagination);
}

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  const now = getCurrentLocalDateTime();
  const dateTimeInput = document.getElementById("dateTime");
  dateTimeInput.setAttribute("max", now);
  dateTimeInput.value = now;

  dateTimeInput.addEventListener("invalid", (e) => {
    e.target.setCustomValidity("Date and time cannot be in the future");
  });

  dateTimeInput.addEventListener("input", (e) => {
    e.target.setCustomValidity("");
  });

  loadItems();

  document.getElementById("lostItemForm").addEventListener("submit", submitLostItem);
  document.getElementById("editForm").addEventListener("submit", saveEdit);
  document.getElementById("searchBtn").addEventListener("click", searchItems);
  document.getElementById("clearBtn").addEventListener("click", clearFilters);

  document.querySelector(".close").addEventListener("click", closeEditModal);
  window.addEventListener("click", (e) => {
    if (e.target === document.getElementById("editModal")) {
      closeEditModal();
    }
  });
});
