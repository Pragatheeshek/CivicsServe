const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const askRoute = require("./routes/ask");
const authRoute = require("./routes/auth");

const app = express();
const PORT = 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/civicsserve";

mongoose
	.connect(MONGO_URI)
	.then(() => {
		console.log(`MongoDB connected: ${MONGO_URI}`);
	})
	.catch((error) => {
		console.error(`MongoDB connection failed: ${error.message}`);
	});

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
	res.json({ message: "CivicsServe AI Assistant backend is running." });
});

app.use("/auth", authRoute);
app.use("/ask", askRoute);

app.listen(PORT, () => {
	console.log(`CivicsServe backend running on http://localhost:${PORT}`);
});
