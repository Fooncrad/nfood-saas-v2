import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

export function prepareDevTemplate(template: string, analyticsEndpoint = process.env.VITE_ANALYTICS_ENDPOINT?.trim(), analyticsId = process.env.VITE_ANALYTICS_WEBSITE_ID?.trim()) {
  const withEntryVersion = template.replace(`src="/src/main.tsx"`, `src="/src/main.tsx?v=${nanoid()}"`);
  return analyticsEndpoint && analyticsId
    ? withEntryVersion.replaceAll("%VITE_ANALYTICS_ENDPOINT%", analyticsEndpoint).replaceAll("%VITE_ANALYTICS_WEBSITE_ID%", analyticsId)
    : withEntryVersion.replace(/\s*<script defer src="%VITE_ANALYTICS_ENDPOINT%\/umami" data-website-id="%VITE_ANALYTICS_WEBSITE_ID%"><\/script>/, "");
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    // The managed preview proxy does not expose Vite's standalone HMR port.
    // Disable Vite HMR here; the server watcher still restarts on source changes,
    // while the app's own display WebSocket remains enabled separately.
    hmr: false,
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      // The managed preview proxy does not expose Vite's HMR websocket endpoint.
      // Serving the template directly prevents transformIndexHtml from injecting
      // /@vite/client, while Vite middleware still transforms /src/main.tsx.
      template = prepareDevTemplate(template);
      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public")
      : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
