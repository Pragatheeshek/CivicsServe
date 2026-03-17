const DEFAULT_API_BASE = "http://localhost:5000";

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
