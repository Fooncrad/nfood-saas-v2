import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = Number(process.env.PORT || process.env.APP_PORT || 3000);
const publicDir = path.join(__dirname, "public");

app.disable("x-powered-by");
app.use(express.json({ limit: "2mb" }));

app.get(["/health", "/api/health"], (_req, res) => {
  res.status(200).json({
    ok: true,
    service: "nfood-saas-v2",
    mode: "committed-dist",
    timestamp: new Date().toISOString(),
  });
});

app.use(express.static(publicDir, {
  index: false,
  maxAge: "1h",
  etag: true,
}));

app.get("*", (req, res) => {
  if (req.path.startsWith("/api/") || req.path.startsWith("/trpc/")) {
    res.status(503).json({
      ok: false,
      message: "Backend API bundle is not included in this committed dist server. Run pnpm build for the full API server.",
    });
    return;
  }

  res.sendFile(path.join(publicDir, "index.html"));
});

app.listen(port, "0.0.0.0", () => {
  console.log(`NFOOD committed dist server running on port ${port}`);
  console.log(`Serving static app from ${publicDir}`);
});
