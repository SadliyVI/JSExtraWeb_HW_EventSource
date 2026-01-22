const baseUrl = (process.env.WS_BASE_URL || "").replace(/\/$/, "");

export async function createUser(name) {
    const res = await fetch(`${baseUrl}/new-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
    });

    if (res.ok) return res.json();

    const data = await safeJson(res);
    const msg = data?.message || `HTTP error: ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
}

async function safeJson(res) {
    try {
        return await res.json();
    } catch {
        return null;
    }
}

export function getBaseUrl() {
    return baseUrl;
}