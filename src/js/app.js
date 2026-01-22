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
    }
});

app.appendChild(auth.el);
auth.focus();

function mountChat() {
    const { root, usersEl, listEl, form, input } = renderChatLayout();
    app.appendChild(root);

    socket = new ChatSocket({
        onUsers: (users) => renderUsers(usersEl, users, me),
        onMessage: (msg) => appendMessage(listEl, msg, me)
    });

    socket.connect();

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;

        socket.send({
            type: "send",
            message: text,
            user: me
        });

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