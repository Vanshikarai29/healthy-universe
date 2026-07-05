// ============================================
// HEALTHY UNIVERSE - MESSAGING ENGINE (chat.js)
// ============================================

let hcSocket = null;
let hcCurrentConversationId = null;
let hcCurrentOtherUser = null;
let hcAllConversations = [];
let hcTypingTimeout = null;

// ── Connect Socket.IO ──────────────────────────────────────────────────────
function hcConnectSocket() {
  const token = huGetToken();
  if (!token) return;

  hcSocket = io(HU_API, {
    query: { token: token },
    transports: ["websocket", "polling"],
  });

  hcSocket.on("connect", function () {
    console.log("✅ Chat socket connected");
  });

  hcSocket.on("new_message", function (msg) {
    if (msg.conversation_id === hcCurrentConversationId) {
      hcAppendMessage(msg);
      hcMarkCurrentConversationRead();
    }
    renderConversationsList();
  });

  hcSocket.on("conversation_update", function () {
    renderConversationsList();
  });

  hcSocket.on("presence", function (data) {
    if (hcCurrentOtherUser && data.user_id === hcCurrentOtherUser.id) {
      const statusEl = document.getElementById("chat-header-status");
      if (statusEl) statusEl.textContent = data.online ? "Online" : "Offline";
    }
    renderConversationsList();
  });

  hcSocket.on("typing", function (data) {
    if (data.conversation_id === hcCurrentConversationId) {
      const indicator = document.getElementById("chat-typing-indicator");
      if (indicator) {
        indicator.style.display = "block";
        clearTimeout(window.hcTypingHideTimeout);
        window.hcTypingHideTimeout = setTimeout(function () {
          indicator.style.display = "none";
        }, 2000);
      }
    }
  });

  hcSocket.on("messages_read", function (data) {
    if (data.conversation_id === hcCurrentConversationId) {
      document
        .querySelectorAll(".chat-msg.mine .chat-msg-status")
        .forEach(function (el) {
          el.textContent = "Read";
        });
    }
  });
}

// ── Load & render conversations list ──────────────────────────────────────
async function renderConversationsList() {
  const list = document.getElementById("conversations-list");
  if (!list) return;

  const res = await huFetch("/api/messages/conversations");
  if (!res || !res.ok) {
    list.innerHTML =
      '<p style="padding:16px;color:var(--muted);font-size:13px;">Could not load conversations</p>';
    return;
  }
  hcAllConversations = await res.json();

  updateUnreadDot();

  if (hcAllConversations.length === 0) {
    list.innerHTML =
      '<div class="no-conv-msg"><p>No conversations yet</p><span>Start a new chat with "+ New"</span></div>';
    return;
  }

  list.innerHTML = hcAllConversations
    .map(function (c) {
      const u = c.other_user;
      const avatar = getLetterAvatar(u.name, 80);
      const timeStr = c.last_time ? hcFormatTime(c.last_time) : "";
      const activeClass = c.id === hcCurrentConversationId ? "active" : "";
      return `
      <div class="conv-row ${activeClass}" onclick="openConversation('${c.id}')">
        <div class="conv-avatar-wrap">
          <img src="${avatar}" alt="${u.name}"/>
          <span class="conv-online-dot ${u.online ? "online" : ""}"></span>
        </div>
        <div class="conv-info">
          <div class="conv-name-row">
            <span class="conv-name">${u.name}</span>
            <span class="conv-time">${timeStr}</span>
          </div>
          <div class="conv-preview-row">
            <span class="conv-preview">${c.last_message || "Start the conversation"}</span>
            ${c.unread_count > 0 ? `<span class="conv-unread-badge">${c.unread_count}</span>` : ""}
          </div>
        </div>
      </div>
    `;
    })
    .join("");
}

function updateUnreadDot() {
  const total = hcAllConversations.reduce(
    (s, c) => s + (c.unread_count || 0),
    0,
  );
  const dot = document.getElementById("msg-notif-dot");
  if (dot) dot.style.display = total > 0 ? "block" : "none";
}

function filterConversations(query) {
  const q = query.toLowerCase();
  document.querySelectorAll(".conv-row").forEach(function (row) {
    const name = row.querySelector(".conv-name").textContent.toLowerCase();
    row.style.display = name.includes(q) ? "" : "none";
  });
}

// ── Open a conversation ─────────────────────────────────────────────────────
async function openConversation(convId) {
  hcCurrentConversationId = convId;

  const conv = hcAllConversations.find(function (c) {
    return c.id === convId;
  });
  hcCurrentOtherUser = conv ? conv.other_user : null;

  document.getElementById("chat-empty-state").style.display = "none";
  document.getElementById("chat-active").style.display = "flex";

  if (hcCurrentOtherUser) {
    document.getElementById("chat-header-avatar").src = getLetterAvatar(
      hcCurrentOtherUser.name,
      80,
    );
    document.getElementById("chat-header-name").textContent =
      hcCurrentOtherUser.name;
    document.getElementById("chat-header-status").textContent =
      hcCurrentOtherUser.online ? "Online" : "Offline";
  }

  if (hcSocket) hcSocket.emit("join_conversation", { conversation_id: convId });

  const res = await huFetch(
    "/api/messages/conversations/" + convId + "/messages",
  );
  const messagesContainer = document.getElementById("chat-messages");
  messagesContainer.innerHTML = "";

  if (res && res.ok) {
    const messages = await res.json();
    messages.forEach(hcAppendMessage);
  }

  hcMarkCurrentConversationRead();
  renderConversationsList();
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function hcMarkCurrentConversationRead() {
  if (hcSocket && hcCurrentConversationId) {
    hcSocket.emit("mark_read", { conversation_id: hcCurrentConversationId });
  }
}

// ── Append a message bubble ─────────────────────────────────────────────────
function hcAppendMessage(msg) {
  const container = document.getElementById("chat-messages");
  if (!container) return;

  const currentUser = huGetUser();
  const isMine =
    currentUser && String(msg.sender_id) === String(currentUser.id);
  const time = hcFormatTime(msg.created_at);

  const html = `
    <div class="chat-msg ${isMine ? "mine" : "theirs"}">
      <div class="chat-msg-bubble">${hcEscapeHtml(msg.content)}</div>
      <div class="chat-msg-meta">
        <span class="chat-msg-time">${time}</span>
        ${isMine ? `<span class="chat-msg-status">${msg.read_at ? "Read" : "Sent"}</span>` : ""}
      </div>
    </div>
  `;
  container.insertAdjacentHTML("beforeend", html);
  container.scrollTop = container.scrollHeight;
}

function hcEscapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function hcFormatTime(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ── Send a message ──────────────────────────────────────────────────────────
function sendChatMessage() {
  const input = document.getElementById("chat-input");
  const content = input.value.trim();
  if (!content || !hcCurrentConversationId || !hcSocket) return;

  hcSocket.emit("send_message", {
    conversation_id: hcCurrentConversationId,
    content: content,
  });

  input.value = "";
}

document.addEventListener("keydown", function (e) {
  if (
    e.key === "Enter" &&
    document.activeElement &&
    document.activeElement.id === "chat-input"
  ) {
    sendChatMessage();
  }
});

document.addEventListener("input", function (e) {
  if (
    e.target &&
    e.target.id === "chat-input" &&
    hcSocket &&
    hcCurrentConversationId
  ) {
    clearTimeout(hcTypingTimeout);
    hcTypingTimeout = setTimeout(function () {
      hcSocket.emit("typing", { conversation_id: hcCurrentConversationId });
    }, 200);
  }
});

// ── New Message Modal ────────────────────────────────────────────────────────
function openNewMessageModal() {
  document.getElementById("new-msg-user-search").value = "";
  document.getElementById("new-msg-users-list").innerHTML = "";
  document.getElementById("new-message-modal").classList.add("open");
  document.body.style.overflow = "hidden";
  searchUsersForChat("");
}

function closeNewMessageModal() {
  document.getElementById("new-message-modal").classList.remove("open");
  document.body.style.overflow = "";
}

async function searchUsersForChat(query) {
  const res = await huFetch("/api/users?q=" + encodeURIComponent(query));
  const list = document.getElementById("new-msg-users-list");
  if (!res || !res.ok) {
    list.innerHTML =
      '<p style="padding:16px;color:var(--muted);font-size:13px;">Could not load users</p>';
    return;
  }
  const users = await res.json();
  if (users.length === 0) {
    list.innerHTML =
      '<p style="padding:16px;color:var(--muted);font-size:13px;">No users found</p>';
    return;
  }
  list.innerHTML = users
    .map(function (u) {
      const avatar = getLetterAvatar(u.name, 80);
      return `
      <div class="new-msg-user-row" onclick="startNewConversation('${u.id}')">
        <img src="${avatar}" alt="${u.name}"/>
        <div>
          <strong>${u.name}</strong>
          <span>${u.specialty || "Member"}</span>
        </div>
      </div>
    `;
    })
    .join("");
}

async function startNewConversation(otherUserId) {
  const res = await huFetch("/api/messages/conversations/start", {
    method: "POST",
    body: JSON.stringify({ other_user_id: otherUserId }),
  });
  if (!res || !res.ok) {
    showToast("❌ Could not start conversation");
    return;
  }
  const data = await res.json();
  closeNewMessageModal();
  await renderConversationsList();
  openConversation(data.conversation_id);
}

// ── Init on page load ────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", function () {
  hcConnectSocket();
  renderConversationsList();
});

// ── Hook into navigate() so list refreshes when visiting Messages tab ───────
const hcOriginalNavigate = navigate;
navigate = function (pageId, clickedBtn) {
  hcOriginalNavigate(pageId, clickedBtn);
  if (pageId === "messages") renderConversationsList();
};

// ============================================
// MEDIA MESSAGES + EMOJI (append to chat.js)
// ============================================

let hcPendingMediaFile = null;

// ── Emoji quick insert ───────────────────────────────────────────────────────
function insertEmoji(emoji) {
  const input = document.getElementById("chat-input");
  input.value += emoji;
  input.focus();
}

// ── Media selection & preview ────────────────────────────────────────────────
function handleChatMediaSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  hcPendingMediaFile = file;
  const url = URL.createObjectURL(file);
  const preview = document.getElementById("chat-media-preview");
  const isVideo = file.type.startsWith("video");

  preview.style.display = "flex";
  preview.innerHTML = `
    <div class="chat-media-preview-item">
      ${isVideo
        ? `<video src="${url}" muted></video>`
        : `<img src="${url}"/>`}
      <button class="chat-media-remove-btn" onclick="clearChatMediaPreview()">✕</button>
    </div>
  `;
}

function clearChatMediaPreview() {
  hcPendingMediaFile = null;
  document.getElementById("chat-media-input").value = "";
  const preview = document.getElementById("chat-media-preview");
  preview.style.display = "none";
  preview.innerHTML = "";
}

// ── Upload media to backend, then send via socket ────────────────────────────
async function uploadAndSendMediaMessage() {
  if (!hcPendingMediaFile || !hcCurrentConversationId) return;

  const fd = new FormData();
  fd.append("media", hcPendingMediaFile);

  const btn = document.querySelector(".chat-send-btn");
  if (btn) btn.disabled = true;

  try {
    const res = await huFetch("/api/messages/upload-media", { method: "POST", body: fd });
    if (!res || !res.ok) {
      showToast("❌ Could not upload media");
      return;
    }
    const data = await res.json();
    const input = document.getElementById("chat-input");
    const caption = input.value.trim();

    hcSocket.emit("send_message", {
      conversation_id: hcCurrentConversationId,
      content: caption,
      media_url: data.media_url,
      media_type: data.media_type,
    });

    input.value = "";
    clearChatMediaPreview();
  } catch (e) {
    showToast("❌ Error uploading media");
  } finally {
    if (btn) btn.disabled = false;
  }
}

// ── Override sendChatMessage to handle media ─────────────────────────────────
const hcOriginalSendChatMessage = sendChatMessage;
sendChatMessage = function () {
  if (hcPendingMediaFile) {
    uploadAndSendMediaMessage();
    return;
  }
  hcOriginalSendChatMessage();
};

// ── Override hcAppendMessage to render media bubbles ─────────────────────────
const hcOriginalAppendMessage = hcAppendMessage;
hcAppendMessage = function (msg) {
  const container = document.getElementById("chat-messages");
  if (!container) return;

  if (!msg.media_url) {
    hcOriginalAppendMessage(msg);
    return;
  }

  const currentUser = huGetUser();
  const isMine = currentUser && String(msg.sender_id) === String(currentUser.id);
  const time = hcFormatTime(msg.created_at);
  const fullUrl = HU_API + msg.media_url;
  const mediaHtml = msg.media_type === "video"
    ? `<video src="${fullUrl}" controls class="chat-msg-media"></video>`
    : `<img src="${fullUrl}" class="chat-msg-media"/>`;

  const html = `
    <div class="chat-msg ${isMine ? "mine" : "theirs"}">
      <div class="chat-msg-bubble chat-msg-bubble-media">
        ${mediaHtml}
        ${msg.content ? `<div class="chat-msg-caption">${hcEscapeHtml(msg.content)}</div>` : ""}
      </div>
      <div class="chat-msg-meta">
        <span class="chat-msg-time">${time}</span>
        ${isMine ? `<span class="chat-msg-status">${msg.read_at ? "Read" : "Sent"}</span>` : ""}
      </div>
    </div>
  `;
  container.insertAdjacentHTML("beforeend", html);
  container.scrollTop = container.scrollHeight;
};
