const DEFAULT_API_BASE = "http://localhost:3001";

export async function askQuestion({
	question,
	history = [],
	stream = false,
	onToken,
	signal,
	baseUrl,
}) {
	const apiBase =
		baseUrl || import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE;

	const response = await fetch(`${apiBase}/ask`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ question, history, stream }),
		signal,
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(errorText || `Request failed (${response.status})`);
	}

	if (stream && response.body) {
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

	const contentType = response.headers.get("content-type") || "";
	if (contentType.includes("application/json")) {
		const data = await response.json();
		return data.answer ?? data.message ?? "";
	}

	return response.text();
}
