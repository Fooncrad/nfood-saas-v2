import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

export function prepareDevTemplate(template: string, analyticsEndpoint = process.env.VITE_ANALYTICS_ENDPOINT?.trim(), analyticsId = process.env.VITE_ANALYTICS_WEBSITE_ID?.trim()) {
  const withoutViteClient = template.replace(
    /\s*<script\b[^>]*src=["']\/?@vite\/client[^"'][^>]*><\/script>/gi,
    "",
  );
  const withEntryVersion = withoutViteClient.replace(
    `src="/src/main.tsx"`,
    `src="/src/main.tsx?v=${nanoid()}"`,
  );
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

  // Serve the entry document before Vite's middleware. In middleware mode Vite
  // can otherwise transform the HTML and inject /@vite/client, whose HMR
  // socket is unavailable behind the managed preview proxy.
  app.use("*", async (req, res, next) => {
    if (req.method !== "GET" || !req.headers.accept?.includes("text/html")) {
      return next();
    }

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

  // Keep Vite's asset transforms available without enabling its HMR client.
  // Some preview layers can retain an older HTML response that still points at
  // /@vite/client. Return a harmless module for that URL so the stale client
  // cannot open a WebSocket that the managed preview proxy does not expose.
  app.get("/@vite/client", (_req, res) => {
    res.status(200).type("application/javascript").send("export {};\n");
  });
  app.get("/@vite/env", (_req, res) => {
    res.status(200).type("application/javascript").send("export {};\n");
  });
  app.use(vite.middlewares);
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
