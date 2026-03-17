const fs = require("fs");
const path = require("path");

const metadataPath = path.join(__dirname, "..", "data", "metadata.json");

function loadMetadata() {
	try {
		const raw = fs.readFileSync(metadataPath, "utf-8").trim();
		if (!raw) {
			return [];
		}

		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch (error) {
		// Empty or invalid metadata should not crash the API; retrieval will return no context.
		return [];
	}
}

function tokenize(text) {
	return String(text || "")
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, " ")
		.split(/\s+/)
		.filter(Boolean);
}

function calculateScore(query, chunk) {
	const queryTokens = new Set(tokenize(query));
	const bodyTokens = tokenize(`${chunk.service || ""} ${chunk.text || ""}`);

	let overlap = 0;
	for (const token of bodyTokens) {
		if (queryTokens.has(token)) {
			overlap += 1;
		}
	}

	// Service-title matches are weighted more heavily than body token overlap.
	const serviceBoost = String(chunk.service || "").toLowerCase().includes(String(query || "").toLowerCase())
		? 3
		: 0;

	return overlap + serviceBoost;
}

function retrieveRelevantChunks(query, topK = 3) {
	const chunks = loadMetadata();

	const scored = chunks
		.map((chunk) => ({
			...chunk,
			score: calculateScore(query, chunk)
		}))
		.filter((chunk) => chunk.score > 0)
		.sort((a, b) => b.score - a.score)
		.slice(0, topK);

	return scored;
}

function buildPrompt(query, chunks) {
	const context = chunks
		.map((chunk, index) => {
			return [
				`Chunk ${index + 1}:`,
				`Service: ${chunk.service || "Unknown"}`,
				`Source: ${chunk.source || "Unknown"}`,
				`Text: ${chunk.text || ""}`
			].join("\n");
		})
		.join("\n\n");

	return [
		"Answer the user query using only the information provided below.",
		"If the context is not enough, clearly say what is missing and suggest the official portal.",
		"",
		"Context:",
		context || "No relevant context found.",
		"",
		"User Question:",
		query
	].join("\n");
}

module.exports = {
	retrieveRelevantChunks,
	buildPrompt
};
