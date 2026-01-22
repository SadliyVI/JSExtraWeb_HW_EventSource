export function renderAuthModal({ onSubmit }) {
    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";

    const modal = document.createElement("div");
    modal.className = "modal";
    modal.innerHTML = `
    <h2>Выберите псевдоним</h2>
    <input type="text" autocomplete="off" />
    <div class="error" aria-live="polite"></div>
    <button type="button">Продолжить</button>
  `;

    const input = modal.querySelector("input");
    const error = modal.querySelector(".error");
    const btn = modal.querySelector("button");

    function setError(text) {
        error.textContent = text || "";
    }

    async function submit() {
        const name = input.value.trim();
        if (!name) {
            setError("Введите никнейм");
            return;
        }

        setError("");
        btn.disabled = true;
        input.disabled = true;

        try {
            await onSubmit(name);
        } catch (e) {
            setError(e?.message || "Ошибка");
            btn.disabled = false;
            input.disabled = false;
            input.focus();
            input.select();
        }
    }

    btn.addEventListener("click", submit);
    input.addEventListener("keydown", (e) => e.key === "Enter" && submit());

    backdrop.appendChild(modal);

    return {
        el: backdrop,
        focus() { input.focus(); },
        destroy() { backdrop.remove(); }
    };
}

export function renderChatLayout() {
    const root = document.createElement("div");
    root.className = "chat";
    root.innerHTML = `
    <aside class="users"></aside>
    <section class="messages">
      <div class="list"></div>
      <div class="composer">
        <form>
          <input type="text" placeholder="Type your message here" autocomplete="off" />
          <button type="submit">Send</button>
        </form>
      </div>
    </section>
  `;

    return {
        root,
        usersEl: root.querySelector(".users"),
        listEl: root.querySelector(".list"),
        form: root.querySelector("form"),
        input: root.querySelector("input")
    };
}

export function renderUsers(usersEl, users, me) {
    usersEl.innerHTML = "";
    users.forEach((u) => {
        const isMe = me && u.id === me.id;

        const item = document.createElement("div");
        item.className = `user ${isMe ? "you" : ""}`;
        item.innerHTML = `
      <div class="avatar"></div>
      <div class="name">${escapeHtml(isMe ? "You" : u.name)}</div>
    `;
        usersEl.appendChild(item);
    });
}

export function appendMessage(listEl, msg, me) {
    const isMe = me && msg?.user?.id === me.id;
    const who = isMe ? "You" : (msg?.user?.name ?? "Unknown");

    const wrap = document.createElement("div");
    wrap.className = `msg ${isMe ? "right" : "left"}`;

    wrap.innerHTML = `
    <div class="meta"><span class="who">${escapeHtml(who)}</span>, ${escapeHtml(formatDateTime(new Date()))}</div>
    <div class="text">${escapeHtml(msg?.message ?? "")}</div>
  `;

    listEl.appendChild(wrap);
    listEl.scrollTop = listEl.scrollHeight;
}

function formatDateTime(d) {
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
}

function escapeHtml(s) {
    return String(s)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}