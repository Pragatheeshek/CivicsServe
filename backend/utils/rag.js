const fs = require("fs");
const path = require("path");

const metadataPath = path.join(__dirname, "..", "data", "metadata.json");
let cachedMetadata = null;

function trimForPrompt(text, maxLength = 420) {
	const value = String(text || "").trim();
	if (value.length <= maxLength) {
		return value;
	}

	return `${value.slice(0, maxLength)}...`;
}

function loadMetadata() {
	if (cachedMetadata) {
		return cachedMetadata;
	}

	try {
		const raw = fs.readFileSync(metadataPath, "utf-8").trim();
		if (!raw) {
			cachedMetadata = [];
			return [];
		}

		const parsed = JSON.parse(raw);
		cachedMetadata = Array.isArray(parsed) ? parsed : [];
		return cachedMetadata;
	} catch (error) {
		// Empty or invalid metadata should not crash the API; retrieval will return no context.
		cachedMetadata = [];
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

function getChunkText(chunk) {
	return String(chunk?.text || chunk?.content || "");
}

function calculateScore(query, chunk) {
	const normalizedQuery = String(query || "").toLowerCase();
	const serviceText = String(chunk.service || "").toLowerCase();
	const queryTokens = new Set(tokenize(normalizedQuery));
	const serviceTokens = tokenize(serviceText);
	const bodyTokens = tokenize(`${chunk.service || ""} ${getChunkText(chunk)}`);

	let bodyOverlap = 0;
	for (const token of bodyTokens) {
		if (queryTokens.has(token)) {
			bodyOverlap += 1;
		}
	}

	let serviceTokenMatches = 0;
	for (const token of serviceTokens) {
		if (queryTokens.has(token)) {
			serviceTokenMatches += 1;
		}
	}

	// Strong intent boost when the service phrase appears in the query (or vice versa).
	const phraseBoost = normalizedQuery.includes(serviceText) || serviceText.includes(normalizedQuery) ? 10 : 0;

	return phraseBoost + serviceTokenMatches * 5 + bodyOverlap;
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

function getServiceCatalog() {
	const chunks = loadMetadata();
	const catalog = {};

	for (const chunk of chunks) {
		const category = String(chunk.category || "uncategorized").toLowerCase();
		const service = String(chunk.service || "").trim();
		if (!service) {
			continue;
		}

		if (!catalog[category]) {
			catalog[category] = new Set();
		}

		catalog[category].add(service);
	}

	const normalizedCatalog = {};
	for (const [category, services] of Object.entries(catalog)) {
		normalizedCatalog[category] = Array.from(services).sort((a, b) => a.localeCompare(b));
	}

	return normalizedCatalog;
}

function getChunksByCategory(categoryName) {
	const chunks = loadMetadata();
	const normalizedCategory = String(categoryName || "").toLowerCase();
	return chunks.filter((chunk) => String(chunk.category || "").toLowerCase() === normalizedCategory);
}

function buildPrompt(query, chunks) {
	const context = chunks
		.map((chunk, index) => {
			return [
				`Chunk ${index + 1}:`,
				`Service: ${chunk.service || "Unknown"}`,
				`Source: ${chunk.source || "Unknown"}`,
				`Text: ${trimForPrompt(getChunkText(chunk))}`
			].join("\n");
		})
		.join("\n\n");

	return [
		"Answer the user query using only the information provided below.",
		"If the context is not enough, clearly say what is missing and suggest the official portal.",
		"If the question is outside certificate services, say that only certificate data is currently loaded and ask the user to ask a certificate-related query.",
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
	buildPrompt,
	getServiceCatalog,
	getChunksByCategory
};
