const express = require("express");
const { spawn } = require("child_process");

const { retrieveRelevantChunks, buildPrompt } = require("../utils/rag");
const { findApplyLink } = require("../utils/applyLinks");

const router = express.Router();

function runOllama(prompt, model = "llama2") {
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

		const timeoutMs = 120000;
		const timeout = setTimeout(() => {
			process.kill("SIGTERM");
			reject(new Error("Ollama response timed out after 120 seconds."));
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

router.post("/", async (req, res) => {
	try {
		const query = String(req.body?.query || req.body?.question || "").trim();

		if (!query) {
			return res.status(400).json({ error: "Query is required." });
		}

		// RAG workflow:
		// 1) Retrieve most relevant metadata chunks using keyword scoring.
		// 2) Build a grounded prompt from those chunks.
		// 3) Ask the local Ollama model to answer using the prompt context.
		const chunks = retrieveRelevantChunks(query, 4);
		const prompt = buildPrompt(query, chunks);
		const llmAnswer = await runOllama(prompt, "llama2");

		const services = chunks.map((chunk) => chunk.service);
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
