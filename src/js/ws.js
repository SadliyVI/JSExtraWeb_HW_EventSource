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
        try {
            if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
                this.ws.close();
            }
        } catch {
        }

        this.ws = new WebSocket(makeWsUrl());

        this.ws.addEventListener("open", (e) => this.onOpen?.(e));
        this.ws.addEventListener("close", (e) => this.onClose?.(e));
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

    // Безопасная отправка: не падает если ws ещё не OPEN
    send(payload) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return false;
        this.ws.send(JSON.stringify(payload));
        return true;
    }

    close() {
        try {
            this.ws?.close();
        } catch {
        }
    }
}