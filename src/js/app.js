import "../css/style.css";
import { createUser } from "./api.js";
import { ChatSocket } from "./ws.js";
import { renderAuthModal, renderChatLayout, renderUsers, appendMessage } from "./ui.js";

const app = document.querySelector("#app");
app.className = "app";

let me = null;
let socket = null;

const auth = renderAuthModal({
    onSubmit: async (name) => {
        const data = await createUser(name);
        me = data.user;

        auth.destroy();
        mountChat();
    },
});

app.appendChild(auth.el);
auth.focus();

function mountChat() {
    const { root, usersEl, listEl, form, input, button, statusEl, reconnectBtn } =
        renderChatLayout();
    app.appendChild(root);

    function setConnectedUI() {
        statusEl.textContent = "Соединение установлено";
        input.disabled = false;
        button.disabled = false;
        reconnectBtn.hidden = true;
    }

    function setDisconnectedUI(text = "Соединение потеряно") {
        statusEl.textContent = text;
        input.disabled = true;
        button.disabled = true;
        reconnectBtn.hidden = false;
    }

    setDisconnectedUI("Подключение…");

    socket = new ChatSocket({
        onUsers: (users) => renderUsers(usersEl, users, me),
        onMessage: (msg) => appendMessage(listEl, msg, me),

        onOpen: () => {
            setConnectedUI();
            input.focus();
        },

        onClose: () => {
            setDisconnectedUI("Соединение потеряно");
        },

        onError: () => {
            // onError может прийти и до close
            statusEl.textContent = "Ошибка соединения…";
        },
    });

    socket.connect();

    reconnectBtn.addEventListener("click", () => {
        setDisconnectedUI("Переподключение…");
        socket.connect();
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;

        const ok = socket.send({
            type: "send",
            message: text,
            user: me,
        });

        if (!ok) {
            setDisconnectedUI("Нет соединения. Нажмите «Переподключиться».");
            return;
        }

        input.value = "";
        input.focus();
    });

    window.addEventListener("beforeunload", () => {
        try {
            socket?.send({ type: "exit", user: me });
            socket?.close();
        } catch { }
    });
}