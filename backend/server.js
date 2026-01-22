import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { WebSocketServer } from "ws";
import http from "http";
import crypto from "crypto";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const port = process.env.PORT || 3000;
const users = [];

// Health-check (удобно для проверки, что сервис жив)
app.get("/", (req, res) => {
    res.json({ status: "ok" });
});

app.post("/new-user", (req, res) => {
    const { name } = req.body ?? {};

    if (!name) return res.status(400).json({ status: "error", message: "name required" });
    if (users.find((u) => u.name === name)) return res.status(409).json({ status: "error" });

    const user = { id: crypto.randomUUID(), name };
    users.push(user);

    res.json({ status: "ok", user });
});

// общий HTTP сервер для Express + WS (важно для Render)
const server = http.createServer(app);

// WebSocket на том же сервере/порту
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
    ws.send(JSON.stringify(users));

    ws.on("message", (message) => {
        // сюда вставите вашу логику чата
        // console.log("WS message:", message.toString());
    });

    ws.on("error", (err) => {
        console.error("WS error:", err);
    });
});

server.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});

server.on("upgrade", (req, socket) => {
    console.log("HTTP upgrade request:", req.url, req.headers["sec-websocket-key"] ? "ws" : "not-ws");
});

wss.on("connection", (ws, req) => {
    console.log("WS connected from:", req.headers["x-forwarded-for"] || req.socket.remoteAddress);
    ws.send(JSON.stringify(users));
});
