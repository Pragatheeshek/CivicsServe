const DEFAULT_API_BASE = "http://localhost:5000";

function getApiBase(baseUrl) {
	return baseUrl || import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE;
}

async function readError(response) {
	try {
		const text = await response.text();
		if (!text) {
			return response.statusText;
		}
		try {
			const data = JSON.parse(text);
			return data.error || data.details || text;
		} catch {
			return text;
		}
	} catch {
		return response.statusText;
	}
}

export function saveAuthSession(payload) {
	if (!payload?.token || !payload?.user) {
		return;
	}

	localStorage.setItem("civicsserve_token", payload.token);
	localStorage.setItem("civicsserve_user", JSON.stringify(payload.user));
}

export function clearAuthSession() {
	localStorage.removeItem("civicsserve_token");
	localStorage.removeItem("civicsserve_user");
}

export function getCurrentUser() {
	try {
		const raw = localStorage.getItem("civicsserve_user");
		if (!raw) {
			return null;
		}
		return JSON.parse(raw);
	} catch {
		return null;
	}
}

export async function signup({ name, email, password, baseUrl }) {
	const apiBase = getApiBase(baseUrl);
	const response = await fetch(`${apiBase}/auth/signup`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ name, email, password }),
	});

	if (!response.ok) {
		throw new Error(await readError(response));
	}

	return response.json();
}

export async function login({ email, password, baseUrl }) {
	const apiBase = getApiBase(baseUrl);
	const response = await fetch(`${apiBase}/auth/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email, password }),
	});

	if (!response.ok) {
		throw new Error(await readError(response));
	}

	const data = await response.json();
	saveAuthSession(data);
	return data;
}

export async function getUserChatHistory({ userId, baseUrl }) {
	const apiBase = getApiBase(baseUrl);
	const response = await fetch(`${apiBase}/chat/${userId}`);

	if (!response.ok) {
		throw new Error(await readError(response));
	}

	return response.json();
}

export async function saveUserChatHistory({ userId, messages, baseUrl }) {
	const apiBase = getApiBase(baseUrl);
	const response = await fetch(`${apiBase}/chat/save`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ userId, messages }),
	});

	if (!response.ok) {
		throw new Error(await readError(response));
	}

	return response.json();
}

export async function askQuestion({
	question,
	history = [],
	stream = false,
	onToken,
	signal,
	baseUrl,
}) {
	const apiBase = getApiBase(baseUrl);

	const response = await fetch(`${apiBase}/ask`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ query: question, history, stream }),
		signal,
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(errorText || `Request failed (${response.status})`);
	}

	const contentType = response.headers.get("content-type") || "";

	if (stream && response.body && !contentType.includes("application/json")) {
		const reader = response.body.getReader();
		const decoder = new TextDecoder();
		let fullText = "";
		let done = false;

		while (!done) {
			const { value, done: readerDone } = await reader.read();
			done = readerDone;
			const chunk = decoder.decode(value || new Uint8Array(), {
				stream: !done,
			});

			if (chunk) {
				fullText += chunk;
				if (onToken) {
					onToken(chunk, fullText);
				}
			}
		}

		return fullText.trim();
	}

	if (contentType.includes("application/json")) {
		const data = await response.json();
		return data.answer ?? data.message ?? "";
	}

	// For non-JSON responses, read body only once
	const text = await response.text();
	return text;
}