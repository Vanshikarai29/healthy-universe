/* ============================================
   HEALTHY UNIVERSE - APP LOGIC
   js/app.js
   ============================================ */

function formatNum(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(".0", "") + "M";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(".0", "") + "K";
  return n.toLocaleString();
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

function navigate(pageId, clickedBtn) {
  document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
  const target = document.getElementById("page-" + pageId);
  if (target) target.classList.add("active");
  document.querySelectorAll(".nav-link").forEach((n) => n.classList.remove("active"));
  if (clickedBtn) clickedBtn.classList.add("active");
  if (pageId === "explore") renderCreators();
  if (pageId === "consultations") renderDoctors();
  if (pageId === "jobs") renderJobs();
}

// function renderFeed(posts) {
//   const container = document.getElementById("feed-container");
//   if (!container) return;
//   const data = posts || POSTS;
//   container.innerHTML = data.map((post) => `
//     <article class="post-card" id="post-${post.id}">
//       <div class="post-top">
//         <img src="${post.avatar}" alt="${post.name}" loading="lazy"/>
//         <div class="post-meta">
//           <div class="post-name">${post.name}<span class="verified-dot"></span></div>
//           <div class="post-role">${post.role} · ${post.time}</div>
//         </div>
//         <button class="post-more">···</button>
//       </div>
//       <div class="post-body">
//         <div class="post-title">${post.title}</div>
//         <div class="post-text">${post.text}</div>
//       </div>
//       <div class="post-image-wrap">
//         <img src="${post.image}" alt="${post.title}" class="post-image" loading="lazy"/>
//         ${post.trusted ? `<div class="trusted-badge"><svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>Trusted Content</div>` : ""}
//       </div>
//       <div style="padding:10px 16px 0;display:flex;align-items:center;">
//         <button class="revenue-badge" id="rev-${post.id}" onclick="claimRevenue(${post.id}, this)">
//           💰 $${post.earnings ? post.earnings.toFixed(2) : "0.00"} earned today — Claim
//         </button>
//       </div>
//       <div class="post-actions">
//         <button class="action-btn ${post.liked ? "liked" : ""}" onclick="toggleLike(${post.id}, this)">
//           <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>
//           <span class="like-count">${formatNum(post.likes)}</span>
//         </button>
//         <button class="action-btn" onclick="this.style.color='#2563eb'">
//           <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
//           ${post.comments}
//         </button>
//         <button class="action-btn" onclick="this.style.color='#7c3aed'">
//           <svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
//           ${post.shares}
//         </button>
//         <div class="action-spacer"></div>
//         <button class="action-btn ${post.saved ? "saved" : ""}" onclick="toggleSave(${post.id}, this)">
//           <svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
//         </button>
//       </div>
//       <div class="post-footer">
//         <div class="post-tags">${post.tags.map((t) => `<span class="post-tag">${t}</span>`).join("")}</div>
//         <span class="view-count">${post.views} views</span>
//       </div>
//     </article>
//   `).join("");
// }
function renderFeed(posts) {
  const container = document.getElementById("feed-container");
  if (!container) return;

  const data = posts || POSTS;

  container.innerHTML = data
    .map(
      (post) => `

    <article class="post-card" id="post-${post.id}">

      <!-- TOP -->
      <div class="post-top">
        <img src="${post.avatar}" alt="${post.name}" loading="lazy"/>
        <div class="post-meta">
          <div class="post-name">
            ${post.name}<span class="verified-dot"></span>
          </div>
          <div class="post-role">${post.role} · ${post.time}</div>
        </div>
        <button class="post-more">···</button>
      </div>

      <!-- TEXT -->
      <div class="post-body">
        <div class="post-title">${post.title}</div>
        <div class="post-text">${post.text}</div>
      </div>

      <!-- MEDIA SECTION -->
      <div class="post-image-wrap">

        ${
          // 🔥 NEW POSTS (video)
          post.type === "video" && post.media
            ? `
              <video class="post-image" controls>
                <source src="${post.media}" type="video/mp4">
              </video>
            `
            : // 🔥 NEW POSTS (image uploaded)
              post.media
              ? `<img src="${post.media}" class="post-image" loading="lazy"/>`
              : // ✅ OLD POSTS (existing image — DO NOT REMOVE)
                post.image
                ? `<img src="${post.image}" class="post-image" loading="lazy"/>`
                : // nothing
                  ""
        }

        ${
          post.trusted
            ? `<div class="trusted-badge">
                <svg viewBox="0 0 24 24">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Trusted Content
              </div>`
            : ""
        }

      </div>

      <!-- REVENUE -->
      <div style="padding:10px 16px 0;display:flex;align-items:center;">
        <button class="revenue-badge" id="rev-${post.id}" onclick="claimRevenue(${post.id}, this)">
          💰 $${post.earnings ? post.earnings.toFixed(2) : "0.00"} earned today — Claim
        </button>
      </div>

      <!-- ACTIONS -->
      <div class="post-actions">

        <button class="action-btn ${post.liked ? "liked" : ""}" onclick="toggleLike(${post.id}, this)">
          ❤️ <span class="like-count">${formatNum(post.likes)}</span>
        </button>

        <button class="action-btn">${post.comments}</button>

        <button class="action-btn">${post.shares}</button>

        <div class="action-spacer"></div>

        <button class="action-btn ${post.saved ? "saved" : ""}" onclick="toggleSave(${post.id}, this)">
          🔖
        </button>

      </div>

      <!-- FOOTER -->
      <div class="post-footer">
        <div class="post-tags">
          ${(post.tags || []).map((t) => `<span class="post-tag">${t}</span>`).join("")}
        </div>
        <span class="view-count">${post.views || 0} views</span>
      </div>

    </article>

  `,
    )
    .join("");
}

function toggleLike(postId, btn) {
  const post = POSTS.find((p) => p.id === postId);
  if (!post) return;
  post.liked = !post.liked;
  post.likes += post.liked ? 1 : -1;
  btn.classList.toggle("liked", post.liked);
  btn.querySelector(".like-count").textContent = formatNum(post.likes);
}

function toggleSave(postId, btn) {
  const post = POSTS.find((p) => p.id === postId);
  if (!post) return;
  post.saved = !post.saved;
  btn.classList.toggle("saved", post.saved);
  showToast(post.saved ? "✓ Post saved!" : "Post removed from saved");
}

const ICONS = {
  heart:   `<svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  comment: `<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  follow:  `<svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  share:   `<svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`,
};

function renderNotifications() {
  const list = document.getElementById("notif-list");
  if (!list) return;
  list.innerHTML = NOTIFICATIONS.map((n) => `
    <div class="notif-row ${n.unread ? "unread" : ""}" id="notif-${n.id}" onclick="readNotif(${n.id})">
      <img src="${n.avatar}" alt="${n.name}" loading="lazy"/>
      <div class="notif-body">
        <p><strong>${n.name}</strong> ${n.action}</p>
        ${n.quote ? `<div class="notif-quote">${n.quote}</div>` : ""}
        <span class="notif-time">${n.time}</span>
      </div>
      <div class="notif-icon ni-${n.iconType === "heart" ? "heart" : n.iconType === "comment" ? "comment" : n.iconType === "share" ? "share" : "follow"}">
        ${ICONS[n.iconType]}
      </div>
    </div>
  `).join("");
}

function readNotif(id) {
  const notif = NOTIFICATIONS.find((n) => n.id === id);
  if (notif) notif.unread = false;
  const el = document.getElementById("notif-" + id);
  if (el) el.classList.remove("unread");
}

function markAllRead() {
  NOTIFICATIONS.forEach((n) => (n.unread = false));
  document.querySelectorAll(".notif-row.unread").forEach((el) => el.classList.remove("unread"));
  showToast("✓ All notifications marked as read");
}

function setFilter(btn) {
  document.querySelectorAll(".filter-tab").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
}

function selectTopic(card) {
  document.querySelectorAll(".topic-card").forEach((c) => c.classList.remove("active"));
  card.classList.add("active");
}

function toggleFollow(btn) {
  const isFollowing = btn.classList.contains("following");
  if (isFollowing) { btn.classList.remove("following"); btn.textContent = "Follow"; }
  else { btn.classList.add("following"); btn.textContent = "✓ Following"; showToast("✓ Now following!"); }
}

function setProfileTab(btn) {
  document.querySelectorAll(".profile-tab").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
}

function setViewToggle(btn) {
  document.querySelectorAll(".view-toggle").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
}

function openModal() {
  document.getElementById("modal-overlay").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  document.getElementById("modal-overlay").classList.remove("open");
  document.body.style.overflow = "";
}

function selectChip(btn) {
  document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
  btn.classList.add("active");
}

// function publishPost() {
//   const content = document.getElementById("post-content");
//   if (!content.value.trim()) {
//     content.style.borderColor = "#e11d48";
//     content.focus();
//     setTimeout(() => (content.style.borderColor = ""), 2000);
//     return;
//   }
//   closeModal();
//   content.value = "";
//   document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
//   const toggle = document.getElementById("med-edu-toggle");
//   if (toggle) toggle.classList.remove("on");
//   showToast("🎉 Post published successfully!");
// }
let selectedFile = null;

function previewMedia(event) {
  const file = event.target.files[0];
  if (!file) return;

  selectedFile = file;

  const preview = document.getElementById("preview-container");
  preview.innerHTML = "";

  const url = URL.createObjectURL(file);

  if (file.type.startsWith("video")) {
    preview.innerHTML = `<video src="${url}" controls width="100%"></video>`;
  } else {
    preview.innerHTML = `<img src="${url}" width="100%">`;
  }
}
// function publishPost() {
//   const content = document.getElementById("post-content");

//   if (!content.value.trim()) return;

//   const newPost = {
//     id: Date.now(),
//     name: "Dr. Michael Chen",
//     avatar:
//       "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=80&h=80&fit=crop&crop=face",
//     role: "Healthcare Professional",
//     time: "Just now",
//     title: "User Post",
//     text: content.value,
//     image: uploadedMediaType === "image" ? uploadedMediaURL : "",
//     video: uploadedMediaType === "video" ? uploadedMediaURL : "",
//     likes: 0,
//     comments: 0,
//     shares: 0,
//     views: 0,
//     liked: false,
//     saved: false,
//     earnings: 0,
//     tags: ["User Post"],
//     trusted: false,
//   };

//   POSTS.unshift(newPost);
//   renderFeed();

//   // reset
//   uploadedMediaURL = "";
//   uploadedMediaType = "";
//   document.getElementById("media-preview").innerHTML = "";

//   closeModal();
//   content.value = "";

//   showToast("🎉 Post published!");
// }
// let uploadedFile = null;
// let uploadedType = null; // "image" or "video"
// function handleFileUpload(event) {
//   const file = event.target.files[0];
//   if (!file) return;

//   uploadedFile = URL.createObjectURL(file);
//   uploadedType = file.type.startsWith("video") ? "video" : "image";

//   const preview = document.getElementById("preview-container");

//   if (uploadedType === "image") {
//     preview.innerHTML = `<img src="${uploadedFile}" style="width:100%;border-radius:10px;">`;
//   } else {
//     preview.innerHTML = `
//       <video controls style="width:100%;border-radius:10px;">
//         <source src="${uploadedFile}" type="${file.type}">
//       </video>
//     `;
//   }
// }

let uploadedMedia = "";
let mediaType = "image";

// HANDLE FILE SELECTION
document.getElementById("media-input").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (event) {
    uploadedMedia = event.target.result;

    if (file.type.startsWith("video")) {
      mediaType = "video";
    } else {
      mediaType = "image";
    }
  };

  reader.readAsDataURL(file);
});

// PUBLISH POST
function publishPost() {
  const text = document.getElementById("post-content").value;

  if (!text && !uploadedMedia) {
    alert("Add content or media!");
    return;
  }

  const newPost = {
    id: Date.now(),
    name: "Dr. Michael Chen",
    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=80",
    role: "Healthcare Professional",
    time: "Just now",
    title: "New Medical Post",
    text: text,
    media: uploadedMedia,
    type: mediaType,
    trusted: false,
    likes: 0,
    comments: 0,
    shares: 0,
    views: 0,
    tags: ["New"],
    liked: false,
    saved: false,
  };

  // IMPORTANT: add to top
  POSTS.unshift(newPost);

  // RE-RENDER
  renderFeed();

  // RESET
  document.getElementById("post-content").value = "";
  uploadedMedia = "";

  closeModal();
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") { closeModal(); closeBookingModal(); closeApplyModal(); }
});

document.addEventListener("DOMContentLoaded", () => {
  applyStoredTheme();
  renderFeed();
  renderNotifications();
  renderProfileGrid();
  renderSuggestedUsers();
});

/* Feed Tabs */
function switchFeedTab(tab, btn) {
  document.querySelectorAll(".feed-tab").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  if (tab === "trending") renderFeed([...POSTS].sort((a, b) => b.likes - a.likes));
  else if (tab === "following") { renderFeed([POSTS[0], POSTS[3]]); showToast("Showing posts from people you follow"); }
  else renderFeed();
}

/* Revenue Badge */
function claimRevenue(postId, btn) {
  if (btn.classList.contains("claimed")) return;
  const post = POSTS.find((p) => p.id === postId);
  if (!post) return;
  btn.classList.add("claimed");
  btn.textContent = "✓ Claimed!";
  const bal = parseFloat(document.getElementById("user-balance").textContent) + (post.earnings || 0);
  document.getElementById("user-balance").textContent = bal.toFixed(2);
  const mob = document.getElementById("mobile-user-balance");
  if (mob) mob.textContent = bal.toFixed(2);
  showToast(`💰 $${post.earnings.toFixed(2)} added to your Health Balance!`);
}

/* Creators Grid */
function renderCreators() {
  const grid = document.getElementById("creators-grid");
  if (!grid || typeof CREATORS === "undefined") return;
  grid.innerHTML = CREATORS.map((c) => `
    <div class="creator-card">
      <img src="${c.avatar}" alt="${c.name}" loading="lazy"/>
      <h3>${c.name}${c.verified ? '<span class="verified-dot"></span>' : ""}</h3>
      <div class="creator-role">${c.role}</div>
      <div class="creator-followers">${c.followers}</div>
      <button class="follow-btn" onclick="toggleFollow(this)">Follow</button>
    </div>
  `).join("");
}

/* Profile Grid */
function renderProfileGrid() {
  const grid = document.getElementById("posts-grid");
  if (!grid) return;
  grid.innerHTML = POSTS.map((p) => `
    <div class="grid-post">
      <img src="${p.image}" alt="${p.title}" loading="lazy" onclick="showToast('📄 Opening post...')"/>
    </div>
  `).join("");
}

/* Right Panel — Suggested Users */
function renderSuggestedUsers() {
  const list = document.getElementById("rp-suggested-list");
  if (!list || typeof SUGGESTED_USERS === "undefined") return;
  list.innerHTML = SUGGESTED_USERS.map((u) => `
    <div class="rp-suggested-row">
      <img src="${u.avatar}" alt="${u.name}" loading="lazy"/>
      <div>
        <div class="rp-sug-name">${u.name}${u.verified ? '<span class="verified-dot"></span>' : ""}</div>
        <div class="rp-sug-role">${u.role}</div>
      </div>
      <button class="rp-follow-btn" onclick="rpToggleFollow(this)">Follow</button>
    </div>
  `).join("");
}

function rpToggleFollow(btn) {
  const isFollowing = btn.classList.contains("following");
  if (isFollowing) { btn.classList.remove("following"); btn.textContent = "Follow"; }
  else { btn.classList.add("following"); btn.textContent = "✓"; showToast("✓ Now following!"); }
}

/* ============================================
   CONSULTATION LOGIC
   ============================================ */
const BookingState = { doctor:null, type:'video', date:null, dateLabel:null, time:null, payment:'coins' };

function renderDoctors(list) {
  const grid = document.getElementById('doctors-grid');
  if (!grid) return;
  const data = list || DOCTORS;
  if (!data || data.length === 0) { grid.innerHTML = '<div class="no-doctors-msg"><h3>No doctors found</h3><p>Try adjusting your search or specialty filter</p></div>'; return; }
  grid.innerHTML = data.map((doc, idx) => `
    <div class="doctor-card" style="animation-delay:${idx*0.05}s">
      <div class="doc-card-top">
        <div class="doc-avatar-wrap">
          <img src="${doc.avatar}" alt="${doc.name}" class="doc-avatar" loading="lazy"/>
          <span class="doc-online-dot ${doc.status}"></span>
          ${doc.experience >= 10 ? `<span class="doc-exp-badge">${doc.experience}yr</span>` : ''}
        </div>
        <div class="doc-card-info">
          <div class="doc-name">${doc.name}${doc.verified ? '<span class="verified-dot"></span>' : ''}</div>
          <div class="doc-specialty">${doc.specialty}</div>
          <div class="doc-hospital">🏥 ${doc.hospital}</div>
          <div class="doc-rating"><span class="stars">★★★★${doc.rating>=4.8?'★':'☆'}</span>${doc.rating}<small>(${doc.reviews})</small></div>
        </div>
      </div>
      <div class="doc-tags">${doc.tags.map(t=>`<span class="doc-tag">${t}</span>`).join('')}</div>
      <div class="doc-meta-row">
        <div class="doc-meta-item">🩺 <strong>${formatNum(doc.consultations)}</strong> consults</div>
        <div class="doc-meta-item">⏱ <strong>${doc.experience} yrs</strong> exp</div>
        <span class="doc-status-badge ${doc.status}">${doc.status==='online'?'● Online':doc.status==='busy'?'● In Session':'○ Offline'}</span>
      </div>
      <div class="doc-price-row">
        <div><span class="doc-price-amount">₹${doc.price}</span><span class="doc-price-coins">or ${doc.coins} HU Coins</span></div>
        <button class="doc-book-btn" onclick="openBookingModal('${doc.id}')" ${doc.status==='offline'?'disabled':''}>${doc.status==='offline'?'Unavailable':'Book Now'}</button>
      </div>
      <div class="doc-next-slot">🕐 Next: ${doc.nextSlot}</div>
    </div>
  `).join('');
  const c = document.getElementById('doc-count');
  if (c) c.textContent = data.length;
}

function filterDoctors(q) {
  const query = q.toLowerCase();
  renderDoctors(DOCTORS.filter(d => !query || d.name.toLowerCase().includes(query) || d.specialty.toLowerCase().includes(query) || d.tags.some(t=>t.toLowerCase().includes(query))));
}

function filterBySpecialty(spec, btn) {
  document.querySelectorAll('.specialty-pill').forEach(p=>p.classList.remove('active'));
  btn.classList.add('active');
  renderDoctors(spec==='All' ? DOCTORS : DOCTORS.filter(d=>d.specialty.includes(spec)));
}

function sortDoctors(by) {
  renderDoctors([...DOCTORS].sort((a,b)=>by==='rating'?b.rating-a.rating:by==='price_low'?a.price-b.price:by==='price_high'?b.price-a.price:b.experience-a.experience));
}

function openBookingModal(docId) {
  const doc = DOCTORS.find(d=>d.id===docId);
  if (!doc) return;
  BookingState.doctor=doc; BookingState.type='video'; BookingState.date=null; BookingState.dateLabel=null; BookingState.time=null; BookingState.payment='coins';
  document.getElementById('booking-step-1').style.display='block';
  document.getElementById('booking-step-2').style.display='none';
  document.getElementById('booking-doc-info').innerHTML=`
    <img src="${doc.avatar}" alt="${doc.name}"/>
    <div><strong>${doc.name}</strong><span>${doc.specialty} · ${doc.hospital}</span></div>
    <div class="booking-doc-price"><strong>₹${doc.price}</strong><span>★ ${doc.rating}</span></div>
  `;
  document.querySelectorAll('.consult-type-card').forEach((c,i)=>c.classList.toggle('active',i===0));
  renderDateScroll(); renderTimeSlots();
  document.getElementById('booking-modal').classList.add('open');
  document.body.style.overflow='hidden';
}

function closeBookingModal() { document.getElementById('booking-modal').classList.remove('open'); document.body.style.overflow=''; }

function renderDateScroll() {
  const container = document.getElementById('date-scroll');
  if (!container) return;
  const days=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const today=new Date();
  container.innerHTML = Array.from({length:10},(_,i)=>{
    const d=new Date(today); d.setDate(today.getDate()+i);
    const ds=d.toISOString().split('T')[0];
    return `<div class="date-chip ${i===0?'today active':''}" onclick="selectDate(this,'${ds}','${d.toLocaleDateString('en-IN',{day:'numeric',month:'short'})}')">
      <span class="date-day">${i===0?'Today':days[d.getDay()]}</span>
      <span class="date-num">${d.getDate()}</span>
      <span class="date-avail">${Math.floor(Math.random()*5)+3} slots</span>
    </div>`;
  }).join('');
  BookingState.date=today.toISOString().split('T')[0];
  BookingState.dateLabel=today.toLocaleDateString('en-IN',{day:'numeric',month:'short'});
}

function selectDate(el,ds,label) {
  document.querySelectorAll('.date-chip').forEach(c=>c.classList.remove('active'));
  el.classList.add('active'); BookingState.date=ds; BookingState.dateLabel=label; renderTimeSlots();
}

function renderTimeSlots() {
  const grid=document.getElementById('time-slots-grid');
  if (!grid) return;
  const slots=['9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','2:00 PM','2:30 PM','3:00 PM','3:30 PM','4:00 PM','4:30 PM','5:00 PM','5:30 PM','6:00 PM','6:30 PM'];
  const booked=[1,4,7,10];
  grid.innerHTML=slots.map((s,i)=>`<div class="time-slot ${booked.includes(i)?'booked':''}" onclick="${booked.includes(i)?'':`selectTimeSlot(this,'${s}')`}">${s}</div>`).join('');
  BookingState.time=null;
}

function selectTimeSlot(el,time) { document.querySelectorAll('.time-slot:not(.booked)').forEach(s=>s.classList.remove('active')); el.classList.add('active'); BookingState.time=time; }
function selectConsultType(el,type) { document.querySelectorAll('.consult-type-card').forEach(c=>c.classList.remove('active')); el.classList.add('active'); BookingState.type=type; }

function goToBookingStep2() {
  if (!BookingState.time) { showToast('⚠️ Please select a time slot'); return; }
  const doc=BookingState.doctor;
  const typeLabel={video:'Video Call 📹',audio:'Audio Call 📞',chat:'Chat 💬'}[BookingState.type];
  document.getElementById('booking-summary').innerHTML=`
    <div class="booking-summary-row"><span>Doctor</span><strong>${doc.name}</strong></div>
    <div class="booking-summary-row"><span>Specialty</span><strong>${doc.specialty}</strong></div>
    <div class="booking-summary-row"><span>Type</span><strong>${typeLabel}</strong></div>
    <div class="booking-summary-row"><span>Date & Time</span><strong>${BookingState.dateLabel} at ${BookingState.time}</strong></div>
    <div class="booking-summary-row"><span>Duration</span><strong>30 minutes</strong></div>
  `;
  updatePaymentDisplay();
  document.getElementById('booking-step-1').style.display='none';
  document.getElementById('booking-step-2').style.display='block';
}

function goToBookingStep1() { document.getElementById('booking-step-1').style.display='block'; document.getElementById('booking-step-2').style.display='none'; }

function updatePaymentDisplay() {
  const doc=BookingState.doctor; if (!doc) return;
  const method=(document.querySelector('input[name="payment"]:checked')||{value:'coins'}).value;
  BookingState.payment=method;
  const base=doc.price;
  let html='';
  if (method==='coins') { const disc=Math.round(base*0.1); html=`<div class="price-row"><span>Consultation Fee</span><strong>₹${base}</strong></div><div class="price-row discount"><span>HU Coins Discount (10%)</span><strong>-₹${disc}</strong></div><div class="price-row total"><span>You Pay</span><strong>${doc.coins} HU Coins</strong></div>`; }
  else if (method==='wallet') { html=`<div class="price-row"><span>Consultation Fee</span><strong>₹${base}</strong></div><div class="price-row"><span>Platform Fee</span><strong>₹0</strong></div><div class="price-row total"><span>Total from Wallet</span><strong>₹${base}</strong></div>`; }
  else { const gst=Math.round(base*0.18); html=`<div class="price-row"><span>Consultation Fee</span><strong>₹${base}</strong></div><div class="price-row"><span>GST (18%)</span><strong>₹${gst}</strong></div><div class="price-row total"><span>Total</span><strong>₹${base+gst}</strong></div>`; }
  document.getElementById('price-breakdown').innerHTML=html;
  document.querySelectorAll('.payment-option').forEach(opt=>{ const checked=opt.querySelector('input').checked; opt.style.borderColor=checked?'var(--green)':''; opt.style.background=checked?'var(--green-bg)':''; });
}

function confirmBooking() {
  const doc=BookingState.doctor;
  const typeLabel={video:'Video Call 📹',audio:'Audio Call 📞',chat:'Chat 💬'}[BookingState.type];
  closeBookingModal();
  document.getElementById('success-details').innerHTML=`Your <strong>${typeLabel}</strong> with <strong>${doc.name}</strong> is confirmed for <strong>${BookingState.dateLabel} at ${BookingState.time}</strong>. You'll get a reminder 15 minutes before.`;
  document.getElementById('booking-success-modal').classList.add('open');
  if (BookingState.payment==='wallet') {
    const bal=parseFloat(document.getElementById('user-balance').textContent)-(doc.price/80);
    document.getElementById('user-balance').textContent=Math.max(0,bal).toFixed(2);
  }
}

function closeSuccessModal() { document.getElementById('booking-success-modal').classList.remove('open'); document.body.style.overflow=''; }

/* ============================================
   ✨ JOBS MARKETPLACE LOGIC
   ============================================ */
const ApplyState = { job: null, cvUploaded: false };

function renderJobs(list) {
  const container = document.getElementById('jobs-list');
  if (!container) return;
  const data = list || JOBS;
  if (!data || data.length === 0) { container.innerHTML = '<div class="no-jobs-msg"><h3>No jobs found</h3><p>Try adjusting your search or filters</p></div>'; return; }
  container.innerHTML = data.map((job, idx) => `
    <div class="job-card ${job.featured ? 'featured' : ''}" id="job-${job.id}" style="animation-delay:${idx*0.05}s">
      ${job.featured ? '<div class="job-featured-badge">⭐ FEATURED</div>' : ''}
      <div class="job-card-top">
        <img src="${job.companyLogo}" alt="${job.company}" class="job-company-logo" loading="lazy"/>
        <div class="job-card-info">
          <div class="job-title" onclick="openApplyModal('${job.id}')">${job.title}</div>
          <div class="job-company"><strong>${job.company}</strong> · 📍 ${job.location}</div>
          <div class="job-meta-pills">
            <span class="job-meta-pill ${getTypePillClass(job.type)}">${job.type}</span>
            <span class="job-meta-pill">🩺 ${job.specialty}</span>
            <span class="job-meta-pill">⏱ ${job.experience}</span>
          </div>
        </div>
      </div>
      <div class="job-description">${job.description}</div>
      <div class="job-tags">${job.tags.map(t=>`<span class="job-tag">${t}</span>`).join('')}</div>
      <div class="job-card-footer">
        <div class="job-footer-left">
          <div class="job-salary">${job.salary}</div>
          <div class="job-footer-meta">
            <span>Posted ${job.posted}</span>
            <strong>Deadline: ${job.deadline}</strong>
          </div>
        </div>
        <div class="job-footer-right">
          <span class="job-applicants">👥 ${job.applicants} applied</span>
          <button class="job-save-btn ${job.saved ? 'saved' : ''}" onclick="toggleJobSave('${job.id}', this)" title="${job.saved ? 'Unsave' : 'Save job'}">🔖</button>
          <button class="job-apply-btn ${job.applied ? 'applied' : ''}" onclick="${job.applied ? '' : `openApplyModal('${job.id}')`}">
            ${job.applied ? '✓ Applied' : 'Apply Now'}
          </button>
        </div>
      </div>
    </div>
  `).join('');
  const countEl = document.getElementById('jobs-count');
  if (countEl) countEl.textContent = data.length;
}

function getTypePillClass(type) {
  if (type === 'Full-Time')  return 'type-full';
  if (type === 'Part-Time')  return 'type-part';
  if (type === 'Internship') return 'type-intern';
  if (type === 'Residency')  return 'type-residency';
  return '';
}

function searchJobs(q) {
  const query = q.toLowerCase();
  renderJobs(JOBS.filter(j => !query || j.title.toLowerCase().includes(query) || j.company.toLowerCase().includes(query) || j.specialty.toLowerCase().includes(query) || j.location.toLowerCase().includes(query) || j.tags.some(t=>t.toLowerCase().includes(query))));
}

function filterJobsByType(type, btn) {
  document.querySelectorAll('.job-type-pill').forEach(p=>p.classList.remove('active'));
  btn.classList.add('active');
  renderJobs(type==='All' ? JOBS : JOBS.filter(j=>j.type===type));
}

function filterJobsBySpecialty(val) {
  renderJobs(val==='All' ? JOBS : JOBS.filter(j=>j.specialty===val));
}

function filterJobsByLocation(val) {
  renderJobs(val==='All' ? JOBS : JOBS.filter(j=>j.location.includes(val)));
}

function toggleJobSave(jobId, btn) {
  const job = JOBS.find(j=>j.id===jobId);
  if (!job) return;
  job.saved = !job.saved;
  btn.classList.toggle('saved', job.saved);
  showToast(job.saved ? '🔖 Job saved!' : 'Job removed from saved');
}

function switchJobsTab(tab, btn) {
  document.querySelectorAll('.jobs-tab').forEach(b=>b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const jobsList = document.getElementById('jobs-list');
  const appsList = document.getElementById('applications-list');
  if (tab === 'browse') {
    if (jobsList) jobsList.style.display='';
    if (appsList) appsList.style.display='none';
    renderJobs();
  } else if (tab === 'saved') {
    if (jobsList) jobsList.style.display='';
    if (appsList) appsList.style.display='none';
    renderJobs(JOBS.filter(j=>j.saved));
  } else if (tab === 'applications') {
    if (jobsList) jobsList.style.display='none';
    if (appsList) appsList.style.display='';
    renderMyApplications();
  }
}

function renderMyApplications() {
  const container = document.getElementById('applications-list');
  if (!container) return;
  if (!MY_APPLICATIONS || MY_APPLICATIONS.length === 0) {
    container.innerHTML = `<div class="no-jobs-msg"><h3>No applications yet</h3><p>Start applying to jobs and track your progress here</p></div>`;
    return;
  }
  container.innerHTML = MY_APPLICATIONS.map(app => `
    <div class="application-card">
      <img src="${app.logo}" alt="${app.company}"/>
      <div class="application-info">
        <div class="application-title">${app.title}</div>
        <div class="application-company">${app.company} · Applied ${app.appliedDate}</div>
      </div>
      <span class="application-status ${app.statusClass}">${app.status}</span>
    </div>
  `).join('');
}

function openApplyModal(jobId) {
  const job = JOBS.find(j=>j.id===jobId);
  if (!job) return;
  ApplyState.job = job;
  ApplyState.cvUploaded = false;
  document.getElementById('apply-job-title').textContent = job.title;
  document.getElementById('apply-job-company').textContent = job.company + ' · ' + job.location;
  document.getElementById('apply-job-logo').src = job.companyLogo;
  const nameInput = document.getElementById('apply-name');
  const emailInput = document.getElementById('apply-email');
  const coverInput = document.getElementById('apply-cover');
  if (nameInput) nameInput.value = 'Dr. Michael Chen';
  if (emailInput) emailInput.value = 'michael.chen@email.com';
  if (coverInput) coverInput.value = '';
  renderCvZone(false);
  document.getElementById('apply-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeApplyModal() {
  document.getElementById('apply-modal').classList.remove('open');
  document.body.style.overflow = '';
}

function renderCvZone(uploaded) {
  const zone = document.getElementById('cv-upload-zone');
  if (!zone) return;
  if (uploaded) {
    zone.innerHTML = `<div class="cv-uploaded"><span>📄 Resume_MichaelChen.pdf</span><button class="cv-remove-btn" onclick="renderCvZone(false); ApplyState.cvUploaded=false;">✕</button></div>`;
  } else {
    zone.innerHTML = `<div class="cv-upload-zone" onclick="simulateCvUpload()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:28px;height:28px;stroke:var(--muted-2);margin:0 auto 8px;display:block;">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
        <line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
      </svg>
      <p><strong>Click to upload</strong> your CV / Resume</p><small>PDF, DOC up to 5MB</small>
    </div>`;
  }
}

function simulateCvUpload() {
  ApplyState.cvUploaded = true;
  renderCvZone(true);
  showToast('📄 CV uploaded successfully!');
}

function submitApplication() {
  const job = ApplyState.job;
  if (!job) return;
  if (!ApplyState.cvUploaded) { showToast('⚠️ Please upload your CV first'); return; }
  job.applied = true;
  job.applicants += 1;
  MY_APPLICATIONS.unshift({ id:job.id, title:job.title, company:job.company, logo:job.companyLogo, appliedDate:'Just now', status:'Under Review', statusClass:'under-review' });
  closeApplyModal();
  document.getElementById('apply-success-job').textContent = job.title + ' at ' + job.company;
  document.getElementById('apply-success-modal').classList.add('open');
  renderJobs();
}

function closeApplySuccess() {
  document.getElementById('apply-success-modal').classList.remove('open');
  document.body.style.overflow = '';
}

/* ============================================================
   ✨ SETTINGS PAGE LOGIC
   ============================================================ */

/* Switch settings tab */
function switchSettingsTab(tab, btn) {
  document.querySelectorAll('.settings-nav-item').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
  const target = document.getElementById('stab-' + tab);
  if (target) target.classList.add('active');
}

/* Toggle a settings switch */
function toggleSettingSwitch(id, labelId, onMsg, offMsg) {
  const btn = document.getElementById(id);
  if (!btn) return;
  const isOn = btn.classList.toggle('on');
  if (labelId) {
    const label = document.getElementById(labelId);
    if (label) label.textContent = isOn ? 'On' : 'Off';
  }
  showToast(isOn ? (onMsg || '✓ Saved!') : (offMsg || '✓ Saved!'));
}

/* Save settings section */
function saveSettings(section) {
  // Update sidebar name if profile saved
  if (section === 'Profile') {
    const nameVal = document.getElementById('sf-name');
    if (nameVal && nameVal.value) {
      const sidebarName = document.querySelector('.sidebar-user-name');
      if (sidebarName) sidebarName.textContent = nameVal.value.length > 14 ? nameVal.value.slice(0,13)+'...' : nameVal.value;
    }
    const specialtyVal = document.getElementById('sf-specialty');
    if (specialtyVal) {
      const sidebarRole = document.querySelector('.sidebar-user-role');
      if (sidebarRole) sidebarRole.textContent = specialtyVal.value;
    }
  }
  showToast('✓ ' + section + ' settings saved!');
}

/* Select theme — REAL implementation */
function selectTheme(theme, el) {
  document.querySelectorAll('.settings-theme-card').forEach(c => c.classList.remove('active'));
  el.classList.add('active');

  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
    localStorage.setItem('hu-theme', 'dark');
    showToast('🌙 Dark mode enabled!');
  } else if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.body.classList.toggle('dark-mode', prefersDark);
    localStorage.setItem('hu-theme', 'system');
    showToast('💻 System theme applied!');
  } else {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('hu-theme', 'light');
    showToast('☀️ Light mode enabled!');
  }
}

/* Apply saved theme on load */
function applyStoredTheme() {
  const saved = localStorage.getItem('hu-theme') || 'light';
  if (saved === 'dark') {
    document.body.classList.add('dark-mode');
    const card = document.getElementById('theme-dark');
    if (card) { document.querySelectorAll('.settings-theme-card').forEach(c=>c.classList.remove('active')); card.classList.add('active'); }
  } else if (saved === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.body.classList.toggle('dark-mode', prefersDark);
    const card = document.getElementById('theme-system');
    if (card) { document.querySelectorAll('.settings-theme-card').forEach(c=>c.classList.remove('active')); card.classList.add('active'); }
  }
}

/* Confirm logout */
function confirmLogout() {
  document.getElementById('logout-modal').classList.add('open');
}

/* ============================================================
   ✨ SETTINGS PAGE LOGIC
   ============================================================ */
 
/* Switch settings tab */
function switchSettingsTab(tab, btn) {
  document.querySelectorAll('.settings-nav-item').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
  const target = document.getElementById('stab-' + tab);
  if (target) target.classList.add('active');
}
 
/* Toggle a settings switch */
function toggleSettingSwitch(id, labelId, onMsg, offMsg) {
  const btn = document.getElementById(id);
  if (!btn) return;
  const isOn = btn.classList.toggle('on');
  if (labelId) {
    const label = document.getElementById(labelId);
    if (label) label.textContent = isOn ? 'On' : 'Off';
  }
  showToast(isOn ? (onMsg || '✓ Saved!') : (offMsg || '✓ Saved!'));
}
 
/* Save settings section */
function saveSettings(section) {
  // Update sidebar name if profile saved
  if (section === 'Profile') {
    const nameVal = document.getElementById('sf-name');
    if (nameVal && nameVal.value) {
      const sidebarName = document.querySelector('.sidebar-user-name');
      if (sidebarName) sidebarName.textContent = nameVal.value.length > 14 ? nameVal.value.slice(0,13)+'...' : nameVal.value;
    }
    const specialtyVal = document.getElementById('sf-specialty');
    if (specialtyVal) {
      const sidebarRole = document.querySelector('.sidebar-user-role');
      if (sidebarRole) sidebarRole.textContent = specialtyVal.value;
    }
  }
  showToast('✓ ' + section + ' settings saved!');
}
 
/* Select theme — REAL implementation */
function selectTheme(theme, el) {
  document.querySelectorAll('.settings-theme-card').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
 
  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
    localStorage.setItem('hu-theme', 'dark');
    showToast('🌙 Dark mode enabled!');
  } else if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.body.classList.toggle('dark-mode', prefersDark);
    localStorage.setItem('hu-theme', 'system');
    showToast('💻 System theme applied!');
  } else {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('hu-theme', 'light');
    showToast('☀️ Light mode enabled!');
  }
}
 
/* Apply saved theme on load */
function applyStoredTheme() {
  const saved = localStorage.getItem('hu-theme') || 'light';
  if (saved === 'dark') {
    document.body.classList.add('dark-mode');
    const card = document.getElementById('theme-dark');
    if (card) { document.querySelectorAll('.settings-theme-card').forEach(c=>c.classList.remove('active')); card.classList.add('active'); }
  } else if (saved === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.body.classList.toggle('dark-mode', prefersDark);
    const card = document.getElementById('theme-system');
    if (card) { document.querySelectorAll('.settings-theme-card').forEach(c=>c.classList.remove('active')); card.classList.add('active'); }
  }
}
 
/* Confirm logout */
function confirmLogout() {
  document.getElementById('logout-modal').classList.add('open');
}

/* ============================================
   WALLET & TRANSACTIONS LOGIC
   ============================================ */

function renderWallet() {
  renderTransactions();
  renderEarningsLegend();
}

function renderTransactions(filter = 'all') {
  const container = document.getElementById('transactions-list');
  if (!container || typeof TRANSACTIONS === 'undefined') return;
  
  const filtered = filter === 'all' 
    ? TRANSACTIONS 
    : TRANSACTIONS.filter(t => t.type === filter);
  
  if (filtered.length === 0) {
    container.innerHTML = '<div class="no-jobs-msg"><h3>No transactions found</h3><p>Try a different filter</p></div>';
    return;
  }
  
  container.innerHTML = filtered.map(t => {
    const amountClass = t.amount >= 0 
      ? (t.currency === 'coins' ? 'coins' : 'positive') 
      : 'negative';
    const amountPrefix = t.amount >= 0 ? '+' : '';
    const amountSuffix = t.currency === 'coins' ? ' coins' : '';
    const amountDisplay = t.currency === 'coins' 
      ? `${amountPrefix}${t.amount.toLocaleString()}${amountSuffix}`
      : `${amountPrefix}$${Math.abs(t.amount).toFixed(2)}`;
    
    return `
      <div class="transaction-row" onclick="showToast('📄 Transaction details coming soon!')">
        <div class="txn-icon ${t.type}">${t.icon}</div>
        <div class="txn-info">
          <div class="txn-title">${t.title}</div>
          <div class="txn-desc">${t.description}</div>
        </div>
        <div class="txn-meta">
          <span class="txn-amount ${amountClass}">${amountDisplay}</span>
          <span class="txn-date">${t.date} · ${t.time}</span>
          ${t.status === 'pending' ? '<span class="txn-status pending">⏳ Pending</span>' : ''}
        </div>
      </div>
    `;
  }).join('');
}

function renderEarningsLegend() {
  const container = document.getElementById('earnings-legend');
  if (!container || typeof EARNING_SOURCES === 'undefined') return;
  
  container.innerHTML = EARNING_SOURCES.map(s => `
    <div class="earnings-legend-item">
      <div class="legend-color" style="background:${s.color}"></div>
      <div class="legend-info">
        <strong>${s.label}</strong>
        <span>${s.percent}% of earnings</span>
      </div>
      <span class="legend-amount">$${s.amount.toFixed(2)}</span>
    </div>
  `).join('');
}

function filterTransactions(filter, btn) {
  document.querySelectorAll('.txn-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderTransactions(filter);
}

function openWithdrawModal() {
  document.getElementById('withdraw-amount').value = '';
  updateWithdrawDisplay(0);
  document.getElementById('withdraw-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeWithdrawModal() {
  document.getElementById('withdraw-modal').classList.remove('open');
  document.body.style.overflow = '';
}

function setWithdrawAmount(amount) {
  document.getElementById('withdraw-amount').value = amount;
  validateWithdrawAmount();
}

function validateWithdrawAmount() {
  const input = document.getElementById('withdraw-amount');
  const btn = document.getElementById('withdraw-confirm-btn');
  const amount = parseFloat(input.value) || 0;
  const maxBalance = 124.50;
  
  if (amount >= 10 && amount <= maxBalance) {
    btn.disabled = false;
    updateWithdrawDisplay(amount);
  } else {
    btn.disabled = true;
    updateWithdrawDisplay(0);
  }
}

function updateWithdrawDisplay(amount) {
  document.getElementById('withdraw-display-amount').textContent = `$${amount.toFixed(2)}`;
  document.getElementById('withdraw-receive-amount').textContent = `$${amount.toFixed(2)}`;
}

function confirmWithdrawal() {
  const amount = parseFloat(document.getElementById('withdraw-amount').value) || 0;
  const method = document.querySelector('input[name="withdraw-method"]:checked').value;
  const methodLabels = { bank: '2-3 business days', upi: 'within minutes', paypal: '1-2 business days' };
  
  closeWithdrawModal();
  
  // Update balance
  const currentBal = parseFloat(document.getElementById('wallet-balance').textContent);
  const newBal = Math.max(0, currentBal - amount);
  document.getElementById('wallet-balance').textContent = newBal.toFixed(2);
  document.getElementById('user-balance').textContent = newBal.toFixed(2);
  const mobBal = document.getElementById('mobile-user-balance');
  if (mobBal) mobBal.textContent = newBal.toFixed(2);
  
  // Show success
  document.getElementById('withdraw-success-details').innerHTML = 
    `Your withdrawal of <strong>$${amount.toFixed(2)}</strong> has been initiated. You'll receive it ${methodLabels[method]}.`;
  document.getElementById('withdraw-success-modal').classList.add('open');
}

function closeWithdrawSuccess() {
  document.getElementById('withdraw-success-modal').classList.remove('open');
  document.body.style.overflow = '';
}

// Update navigate function to include wallet
const originalNavigate = navigate;
navigate = function(pageId, clickedBtn) {
  originalNavigate(pageId, clickedBtn);
  if (pageId === 'wallet') renderWallet();
};
