// ─── api.js ─ Healthy Universe API Client ────────────────────────────────────
//  Drop this in js/api.js and include BEFORE app.js in index.html

const HU_API = "http://localhost:8000"; // ← change for production

/* ── Token helpers ─────────────────────────────────────────────────────────── */
function huGetToken() {
  return localStorage.getItem("hu_token");
}
function huGetUser() {
  try {
    return JSON.parse(localStorage.getItem("hu_user") || "null");
  } catch {
    return null;
  }
}
function huLogout() {
  localStorage.removeItem("hu_token");
  localStorage.removeItem("hu_user");
  window.location.href = "auth.html";
}

/* Redirect to auth if not logged in */
(function huAuthGuard() {
  if (!huGetToken()) {
    window.location.href = "auth.html";
  }
})();

/* ── Generic fetch wrapper ─────────────────────────────────────────────────── */
async function huFetch(path, options = {}) {
  const token = huGetToken();
  const headers = { ...(options.headers || {}) };

  if (token && !(options.body instanceof FormData)) {
    headers["Authorization"] = `Bearer ${token}`;
    if (!headers["Content-Type"]) headers["Content-Type"] = "application/json";
  } else if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    // Let browser set multipart boundary automatically for FormData
  }

  const res = await fetch(`${HU_API}${path}`, { ...options, headers });

  if (res.status === 401) {
    huLogout();
    return null;
  }
  return res;
}

/* ── Post Creation ─────────────────────────────────────────────────────────── */
async function huCreatePost({ content, category, mediaFile }) {
  const fd = new FormData();
  fd.append("content", content);
  fd.append("category", category || "General Wellness");
  if (mediaFile) fd.append("media", mediaFile);

  const res = await huFetch("/api/posts/create", { method: "POST", body: fd });
  if (!res) return null;

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to create post");
  return data;
}

/* ── Fetch Feed ────────────────────────────────────────────────────────────── */
async function huGetFeed(limit = 20, offset = 0) {
  try {
    const res = await huFetch(`/api/posts?limit=${limit}&offset=${offset}`);
    if (!res || !res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

/* ── Like Post ─────────────────────────────────────────────────────────────── */
async function huLikePost(postId) {
  const res = await huFetch(`/api/posts/${postId}/like`, { method: "POST" });
  if (!res || !res.ok) return null;
  return await res.json();
}

/* ── Populate user info in the UI ──────────────────────────────────────────── */
function huPopulateUserUI() {
  const user = huGetUser();
  if (!user) return;

  // Sidebar name + role
  const nameEl = document.querySelector(".sidebar-user-name");
  const roleEl = document.querySelector(".sidebar-user-role");
  if (nameEl)
    nameEl.textContent =
      user.name?.length > 14 ? user.name.slice(0, 14) + "…" : user.name;
  if (roleEl) roleEl.textContent = user.specialty || "Member";

  // Balances
  const bal = parseFloat(user.balance || 0).toFixed(2);
  ["user-balance", "mobile-user-balance", "wallet-balance"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = bal;
  });

  // HU Coins
  const coins = user.hu_coins || 0;

  // Avatar
  if (user.avatar_url) {
    document
      .querySelectorAll(
        ".sidebar-avatar, .modal-user img, .profile-avatar, .settings-avatar",
      )
      .forEach((img) => {
        img.src = user.avatar_url;
      });
  }
}

/* ── Patch logout button ───────────────────────────────────────────────────── */
function huPatchLogout() {
  // Settings logout already shows a confirm modal in index.html
  // This overrides confirmLogout() to use real logout
  window.confirmLogout = function () {
    document.getElementById("logout-modal")?.classList.add("open");
  };

  // Patch the actual logout action inside the modal
  const logoutYesBtn = document.querySelector(
    "#logout-modal .settings-danger-btn",
  );
  if (logoutYesBtn) {
    logoutYesBtn.onclick = function () {
      huLogout();
    };
  }
}

/* ── Patch publishPost() ───────────────────────────────────────────────────── */
window.publishPost = async function () {
  const content = document.getElementById("post-content")?.value?.trim();
  const mediaInput = document.getElementById("media-input");
  const mediaFile = mediaInput?.files?.[0] || null;

  if (!content && !mediaFile) {
    showToast("✍️ Please write something or attach media before posting!");
    return;
  }

  const publishBtn = document.querySelector(".publish-btn");
  if (publishBtn) {
    publishBtn.disabled = true;
    publishBtn.textContent = "Posting…";
  }

  try {
    const post = await huCreatePost({ content, mediaFile });

    if (!post) throw new Error("No response");

    showToast("✅ Post published successfully!");
    closeModal();

    // Prepend new post to feed UI
    const container = document.getElementById("feed-container");
    if (container) {
      const card = buildBackendPostCard(post);
      container.insertAdjacentHTML("afterbegin", card);
    }

    // Reset form
    if (document.getElementById("post-content"))
      document.getElementById("post-content").value = "";
    if (mediaInput) mediaInput.value = "";
    const preview = document.getElementById("preview-container");
    if (preview) preview.innerHTML = "";
  } catch (err) {
    showToast("❌ Failed to publish post: " + (err.message || "Unknown error"));
  } finally {
    if (publishBtn) {
      publishBtn.disabled = false;
      publishBtn.textContent = "Post";
    }
  }
};

/* ── Build post card from backend data ─────────────────────────────────────── */
function buildBackendPostCard(post) {
  const author = post.author || {};
  const avatarSrc =
    author.avatar ||
    "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=80&h=80&fit=crop&crop=face";
  const timeAgo = "Just now";
  const verified = author.verified ? '<span class="verified-dot"></span>' : "";

  let mediaHtml = "";
  if (post.media_url) {
    const fullUrl = HU_API + post.media_url;
    mediaHtml =
      post.media_type === "video"
        ? `<video class="post-media" src="${fullUrl}" controls></video>`
        : `<img class="post-media" src="${fullUrl}" alt="Post media" style="width:100%;border-radius:12px;margin-top:10px;"/>`;
  }

  return `
  <div class="post-card" data-post-id="${post.id}">
    <div class="post-header">
      <img src="${avatarSrc}" alt="${author.name}" class="post-avatar"/>
      <div class="post-meta">
        <div class="post-author">${author.name || "You"} ${verified}</div>
        <div class="post-role">${author.specialty || "Healthcare Professional"} · ${timeAgo}</div>
      </div>
      <div class="post-revenue">$0.00 earned</div>
    </div>
    <div class="post-body"><p>${post.content || ""}</p>${mediaHtml}</div>
    <div class="post-actions">
      <button class="action-btn" onclick="huLikePost('${post.id}').then(r=>r&&(this.querySelector('.action-count').textContent=r.likes))">
        <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        <span class="action-count">0</span>
      </button>
      <button class="action-btn">
        <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <span class="action-count">0</span>
      </button>
      <button class="action-btn">
        <svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
        Share
      </button>
    </div>
  </div>`;
}

/* ── Init on DOM ready ─────────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  huPopulateUserUI();
  huPatchLogout();
});
