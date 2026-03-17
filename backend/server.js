const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const askRoute = require("./routes/ask");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
	res.json({ message: "CivicsServe AI Assistant backend is running." });
});

app.use("/ask", askRoute);

app.listen(PORT, () => {
	console.log(`CivicsServe backend running on http://localhost:${PORT}`);
});
