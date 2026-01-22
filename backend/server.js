import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { WebSocketServer } from "ws";
import http from "http";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const port = process.env.PORT || 3000;

// ваши данные
const users = [];

// ваш роут
app.post("/new-user", (req, res) => {
    const { name } = req.body;

    if (!name) return res.status(400).json({ status: "error", message: "name required" });
    if (users.find((u) => u.name === name)) return res.status(409).json({ status: "error" });

    const user = { id: crypto.randomUUID?.() ?? String(Date.now()), name };
    users.push(user);

    res.json({ status: "ok", user });
});

// создаём общий HTTP сервер
const server = http.createServer(app);

// WebSocket на том же сервере/порту
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
    // например: отправить список пользователей
    ws.send(JSON.stringify(users));

    ws.on("message", (message) => {
        // ваша логика сообщений
    });
});

server.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});