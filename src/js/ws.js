import { getBaseUrl } from "./api.js";

export function makeWsUrl() {
    const base = getBaseUrl();
    const u = new URL(base);
    u.protocol = u.protocol === "https:" ? "wss:" : "ws:";
    u.pathname = "/";
    return u.toString();
}

export class ChatSocket {
    constructor({ onUsers, onMessage, onOpen, onClose, onError }) {
        this.onUsers = onUsers;
        this.onMessage = onMessage;
        this.onOpen = onOpen;
        this.onClose = onClose;
        this.onError = onError;
        this.ws = null;
    }

    connect() {
        this.ws = new WebSocket(makeWsUrl());

        this.ws.addEventListener("open", () => this.onOpen?.());
        this.ws.addEventListener("close", () => this.onClose?.());
        this.ws.addEventListener("error", (e) => this.onError?.(e));
        this.ws.addEventListener("message", (e) => this.#handleIncoming(e.data));
    }

    #handleIncoming(raw) {
        let data;
        try {
            data = JSON.parse(raw);
        } catch {
            return;
        }

        if (Array.isArray(data)) {
            this.onUsers?.(data);
            return;
        }

        if (data?.type === "send") {
            this.onMessage?.(data);
        }
    }

    send(payload) {
        this.ws?.send(JSON.stringify(payload));
    }

    close() {
        this.ws?.close();
    }
}