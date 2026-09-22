import "dotenv/config";
import cors from "cors";
import express from "express";
import { analyzeRouter } from "./routes/analyze";

const app = express();
const port = Number(process.env.PORT || 3001);

app.use(cors());
app.use(express.json({ limit: "12mb" }));
app.get("/api/health", (_request, response) => response.json({ ok: true, service: "edith-api" }));
app.use("/api", analyzeRouter);

app.listen(port, () => {
  console.log(`EDITH API listening on http://localhost:${port}`);
});
