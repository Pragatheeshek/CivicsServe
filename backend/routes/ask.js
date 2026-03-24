const express = require("express");
const { spawn } = require("child_process");

const { retrieveRelevantChunks, buildPrompt, getServiceCatalog, getChunksByCategory } = require("../utils/rag");
const { findApplyLink } = require("../utils/applyLinks");

const router = express.Router();

const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "gemma3:1b";
const OLLAMA_FALLBACK_MODEL = process.env.OLLAMA_FALLBACK_MODEL || "llama2";
const OLLAMA_TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS || 300000);
const ANSWER_CACHE_TTL_MS = Number(process.env.ANSWER_CACHE_TTL_MS || 600000);

const answerCache = new Map();

function getCachedAnswer(key) {
	const cached = answerCache.get(key);
	if (!cached) {
		return null;
	}

	if (Date.now() > cached.expiresAt) {
		answerCache.delete(key);
		return null;
	}

	return cached.answer;
}

function setCachedAnswer(key, answer) {
	answerCache.set(key, {
		answer,
		expiresAt: Date.now() + ANSWER_CACHE_TTL_MS
	});
}

function getChunkText(chunk) {
	return String(chunk?.text || chunk?.content || "");
}

function extractDocumentsFromText(text) {
	const lines = String(text || "")
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter(Boolean);

	const documents = lines
		.map((line) => line.replace(/^\d+[.)]\s*/, "").replace(/^[-*]\s*/, "").trim())
		.filter(Boolean);

	return documents;
}

function buildCertificateAnswer(service, source, documents) {
	const portal = source || "https://www.tnesevai.tn.gov.in/";
	const safeService = service || "Certificate Service";

	const procedure = [
		"1. Visit the official portal and open certificate services.",
		`2. Select \"${safeService}\" from the service list.`,
		"3. Enter applicant details and verify address/identity fields.",
		"4. Upload the required documents listed below.",
		"5. Submit the application and save the acknowledgement number.",
		"6. Track status on the same portal using your application reference."
	];

	const documentLines = documents.length > 0
		? documents.map((doc, index) => `${index + 1}. ${doc}`)
		: ["1. Required documents are not available in the loaded dataset for this service."];

	return [
		`Service: ${safeService}`,
		"",
		"Procedure:",
		...procedure,
		"",
		"Documents Required:",
		...documentLines,
		"",
		`Official Portal: ${portal}`,
		`Apply Here: ${portal}`
	].join("\n");
}

function splitEvidenceLines(text) {
	return String(text || "")
		.replace(/\s+/g, " ")
		.split(/(?:\u2022||\*\s+|\s(?=\d+\.\s)|(?<=[.?!])\s+(?=[A-Z0-9]))/)
		.map((line) => line.trim())
		.filter((line) => line.length >= 12);
}

function cleanEvidenceLine(line) {
	return String(line || "")
		.replace(/^Page\s*\d+\s*:\s*/i, "")
		.replace(/^\d+\s+/, "")
		.replace(/\s+/g, " ")
		.trim();
}

function isNoisyEvidenceLine(line) {
	const value = String(line || "").trim();
	if (!value) {
		return true;
	}

	if (/^sl\.?\s*no|subject page no|index/i.test(value)) {
		return true;
	}

	if (/^no\s+subject\s+page\s+no/i.test(value)) {
		return true;
	}

	if (/issuance of community certificate/i.test(value)) {
		return true;
	}

	if (/district official state level|first 2000|second 1500|third 1000/i.test(value)) {
		return true;
	}

	if (/hajj committee|backward classes commission|welfare board/i.test(value)) {
		return true;
	}

	const digitCount = (value.match(/\d/g) || []).length;
	if (digitCount >= Math.max(10, Math.floor(value.length * 0.45))) {
		return true;
	}

	return false;
}

function uniqueLines(lines) {
	const seen = new Set();
	const result = [];
	for (const line of lines) {
		const key = line.toLowerCase();
		if (seen.has(key)) {
			continue;
		}
		seen.add(key);
		result.push(line);
	}
	return result;
}

function extractSchemeDetails(chunks) {
	const applyPatterns = [
		/how to apply/i,
		/mode of application/i,
		/procedure for application/i,
		/apply (only )?through online/i,
		/downloaded from/i,
		/submit/i,
		/website/i,
		/momascholarship\.gov\.in/i,
		/tn\.gov\.in/i
	];

	const documentPatterns = [
		/documents? to be produced/i,
		/mark sheets?/i,
		/community .* certificate/i,
		/income .* certificate/i,
		/self declaration/i,
		/affidavit/i,
		/address proof/i,
		/fee receipts?/i,
		/enclosures?/i,
		/application forms?/i
	];

	const applyDetails = [];
	const documentDetails = [];

	for (const chunk of chunks) {
		const lines = splitEvidenceLines(getChunkText(chunk));
		for (const line of lines) {
			const cleanedLine = cleanEvidenceLine(line);
			if (isNoisyEvidenceLine(cleanedLine)) {
				continue;
			}

			if (applyPatterns.some((pattern) => pattern.test(cleanedLine))) {
				applyDetails.push(cleanedLine);
			}
			if (documentPatterns.some((pattern) => pattern.test(cleanedLine))) {
				documentDetails.push(cleanedLine);
			}
		}
	}

	return {
		applyDetails: uniqueLines(applyDetails).slice(0, 8),
		documentDetails: uniqueLines(documentDetails).slice(0, 10)
	};
}

function buildSchemeAnswer(service, chunks, details) {
	const sources = uniqueLines(chunks.map((chunk) => String(chunk.source || "").trim()).filter(Boolean));
	const sourceLines = sources.length > 0 ? sources.slice(0, 3).map((source, index) => `${index + 1}. ${source}`) : ["1. Source not available."];

	const applyLines = details.applyDetails.length > 0
		? details.applyDetails.map((line, index) => `${index + 1}. ${line}`)
		: ["1. Exact application steps are not explicitly listed in the loaded pages."];

	const documentLines = details.documentDetails.length > 0
		? details.documentDetails.map((line, index) => `${index + 1}. ${line}`)
		: ["1. Exact required documents are not explicitly listed in the loaded pages."];

	return [
		`Scheme: ${service || "Tamil Nadu Scholarship Schemes"}`,
		"",
		"How to Apply (from loaded data):",
		...applyLines,
		"",
		"Documents Required (from loaded data):",
		...documentLines,
		"",
		"Source:",
		...sourceLines
	].join("\n");
}

function buildCatalogAnswer(title, services, emptyMessage) {
	if (!services || services.length === 0) {
		return emptyMessage;
	}

	const lines = services.map((service, index) => `${index + 1}. ${service}`);
	return [`${title}:`, ...lines].join("\n");
}

function isCertificateListQuery(normalizedQuery) {
	return (
		/(what|which|list|show).*(certificate|certificates)/.test(normalizedQuery) ||
		/(certificate|certificates).*(available|services|list)/.test(normalizedQuery)
	);
}

function isSchemeListQuery(normalizedQuery) {
	return /(what|which|list|show).*(scheme|schemes)|(?:scheme|schemes).*(available|list)/.test(normalizedQuery);
}

function isGeneralCatalogQuery(normalizedQuery) {
	return /(what|which|list|show).*(services|service)|(?:services|service).*(available|list)/.test(normalizedQuery);
}

function runOllama(prompt, model) {
	return new Promise((resolve, reject) => {
		// Ollama integration: run in non-interactive mode by passing the prompt as an argument.
		const process = spawn("ollama", ["run", model, prompt], {
			stdio: ["ignore", "pipe", "pipe"]
		});

		let stdout = "";
		let stderr = "";

		process.stdout.on("data", (data) => {
			stdout += data.toString();
		});

		process.stderr.on("data", (data) => {
			stderr += data.toString();
		});

		process.on("error", (error) => {
			reject(new Error(`Failed to start Ollama process: ${error.message}`));
		});

		const timeoutMs = OLLAMA_TIMEOUT_MS;
		const timeout = setTimeout(() => {
			process.kill("SIGTERM");
			reject(new Error(`Ollama response timed out after ${timeoutMs} ms using model \"${model}\".`));
		}, timeoutMs);

		process.on("close", (code) => {
			clearTimeout(timeout);

			if (code !== 0) {
				reject(new Error(`Ollama exited with code ${code}: ${stderr || "Unknown error"}`));
				return;
			}

			resolve(stdout.trim());
		});
	});
}

async function generateWithFallback(prompt) {
	try {
		return await runOllama(prompt, OLLAMA_MODEL);
	} catch (primaryError) {
		if (!OLLAMA_FALLBACK_MODEL || OLLAMA_FALLBACK_MODEL === OLLAMA_MODEL) {
			throw primaryError;
		}

		try {
			return await runOllama(prompt, OLLAMA_FALLBACK_MODEL);
		} catch (fallbackError) {
			throw new Error(
				`Primary model failed (${OLLAMA_MODEL}): ${primaryError.message} | Fallback model failed (${OLLAMA_FALLBACK_MODEL}): ${fallbackError.message}`
			);
		}
	}
}

router.post("/", async (req, res) => {
	try {
		const query = String(req.body?.query || req.body?.question || "").trim();
		const normalizedQuery = query.toLowerCase();

		if (!query) {
			return res.status(400).json({ error: "Query is required." });
		}

		const catalog = getServiceCatalog();
		const certificateServices = catalog.certificates || [];
		const schemeServices = catalog.schemes || [];

		if (isCertificateListQuery(normalizedQuery)) {
			return res.json({
				answer: buildCatalogAnswer(
					"Available Certificate Services",
					certificateServices,
					"No certificate services are loaded yet."
				)
			});
		}

		if (isSchemeListQuery(normalizedQuery)) {
			return res.json({
				answer: buildCatalogAnswer(
					"Available Schemes",
					schemeServices,
					"No scheme data is loaded yet. Please add scheme records to the dataset."
				)
			});
		}

		if (isGeneralCatalogQuery(normalizedQuery)) {
			const responseParts = [];
			responseParts.push(
				buildCatalogAnswer(
					"Available Certificate Services",
					certificateServices,
					"No certificate services are loaded yet."
				)
			);
			responseParts.push("");
			responseParts.push(
				buildCatalogAnswer(
					"Available Schemes",
					schemeServices,
					"No scheme data is loaded yet."
				)
			);

			return res.json({ answer: responseParts.join("\n") });
		}

		// RAG workflow:
		// 1) Retrieve most relevant metadata chunks using keyword scoring.
		// 2) Build a grounded prompt from those chunks.
		// 3) Ask the local Ollama model to answer using the prompt context.
		const isSchemeIntent = /\bscholarship\b|\bscheme\b|\bschemes\b/.test(normalizedQuery);
		const cacheKey = `${isSchemeIntent ? "scheme-v2" : "general-v1"}:${normalizedQuery}`;
		if (!isSchemeIntent) {
			const cachedAnswer = getCachedAnswer(cacheKey);
			if (cachedAnswer) {
				return res.json({ answer: cachedAnswer });
			}
		}

		let chunks = retrieveRelevantChunks(query, 2);
		const schemeChunks = chunks.filter((chunk) => String(chunk.category || "").toLowerCase() === "schemes");
		const topChunk = chunks.length > 0 ? chunks[0] : null;

		if (isSchemeIntent) {
			const allSchemeChunks = getChunksByCategory("schemes");
			const richSchemeChunks = allSchemeChunks.filter((chunk) => {
				const text = getChunkText(chunk).toLowerCase();
				return /scholarship|postmatric|pre-?matric|momascholarship|how to apply|application form|documents to be produced|mark sheet|income certificate|community certificate/.test(text);
			});

			if (richSchemeChunks.length > 0) {
				const details = extractSchemeDetails(richSchemeChunks);
				const schemeAnswer = buildSchemeAnswer(richSchemeChunks[0].service, richSchemeChunks, details);
				return res.json({ answer: schemeAnswer });
			}
		}

		if (topChunk && String(topChunk.category || "").toLowerCase() === "certificates") {
			const services = [topChunk.service];
			const link = findApplyLink(query, services);
			const source = (link && link.url) || topChunk.source;
			const documents = extractDocumentsFromText(getChunkText(topChunk));
			const answer = buildCertificateAnswer(topChunk.service, source, documents);
			setCachedAnswer(cacheKey, answer);
			return res.json({ answer });
		}

		const prompt = buildPrompt(query, chunks);
		const speedPrompt = [
			"Give a concise answer in 5-7 lines.",
			"Avoid long explanations and bullet overload.",
			"",
			prompt
		].join("\n");
		const llmAnswer = await generateWithFallback(speedPrompt);
		setCachedAnswer(cacheKey, llmAnswer);

		const services = chunks.length > 0 ? [chunks[0].service] : [];
		const link = findApplyLink(query, services);

		let answer = llmAnswer || "I could not generate an answer right now.";
		if (link) {
			answer += `\n\nApply Here (${link.serviceName}): ${link.url}`;
		}

		return res.json({ answer });
	} catch (error) {
		return res.status(500).json({
			error: "Failed to generate response.",
			details: error.message
		});
	}
});

module.exports = router;
