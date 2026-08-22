import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { registerMarketingHeartbeat } from "../marketing";
import { getPublicRestaurantPage } from "../db";
import { serveStatic, setupVite } from "./vite";
import { attachDisplayRealtime } from "../displayRealtime";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

type MenuLanguage = "ar" | "en" | "fr" | "ur";
function normalizeMenuLanguage(value: unknown): MenuLanguage { const code = typeof value === "string" ? value.toLowerCase().split("-")[0] : "ar"; return code === "en" || code === "fr" || code === "ur" ? code : "ar"; }
function localizeMenuEntity<T extends { name: string; description?: string | null; translationsJson?: string | null }>(entity: T, language: MenuLanguage): T { try { const parsed = entity.translationsJson ? JSON.parse(entity.translationsJson) : []; const entries = Array.isArray(parsed) ? parsed as Array<{ language?: string; name?: string; description?: string; status?: string }> : []; const approved = (entry: { status?: string }) => !entry.status || entry.status === "approved"; const match = entries.find((entry) => entry.language === language && approved(entry)) ?? entries.find((entry) => entry.language === "ar" && approved(entry)); return match?.name ? { ...entity, name: match.name, description: match.description ?? entity.description } : entity; } catch { return entity; } }

async function startServer() {
  const app = express();
  const server = createServer(app);
  attachDisplayRealtime(server);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  registerMarketingHeartbeat(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  app.get("/api/menu", async (req, res) => { const slug = typeof req.query.slug === "string" ? req.query.slug.trim().toLowerCase() : ""; if (!/^[a-z0-9-]{2,160}$/.test(slug)) return res.status(400).json({ error: "slug is required" }); const language = normalizeMenuLanguage(req.query.lang); const page = await getPublicRestaurantPage(slug); if (!page) return res.status(404).json({ error: "restaurant_not_found" }); return res.json({ ...page, language, direction: language === "en" || language === "fr" ? "ltr" : "rtl", categories: page.categories.map((entity) => localizeMenuEntity(entity, language)), items: page.items.map((entity) => localizeMenuEntity(entity, language)) }); });
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
