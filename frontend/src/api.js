const DEFAULT_API_BASE = "http://localhost:5000";

function getApiBase(baseUrl) {
	return baseUrl || import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE;
}

async function readError(response) {
	try {
		const data = await response.json();
		return data.error || data.details || response.statusText;
	} catch {
		const text = await response.text();
		return text || response.statusText;
	}
}

export function saveAuthSession(payload) {
	if (!payload?.token || !payload?.user) {
		return;
	}

	localStorage.setItem("civicsserve_token", payload.token);
	localStorage.setItem("civicsserve_user", JSON.stringify(payload.user));
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

	const data = await response.json();
	saveAuthSession(data);
	return data;
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

	return response.text();
}
