import { trpc } from "@/lib/trpc";
import { COOKIE_NAME, UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { startLogin } from "./const";
import { queryClientDefaults } from "./lib/queryClientDefaults";
import "./index.css";

const queryClient = new QueryClient({ defaultOptions: queryClientDefaults });

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  // The root route is the unified sign-in screen. Protected queries may briefly
  // return 401 before the user chooses a role or while the session is restored;
  // never replace that screen with an OAuth redirect automatically.
  if (window.location.pathname === "/") return;

  startLogin();
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    if (error instanceof TRPCClientError && error.data?.code === "FORBIDDEN" && typeof window !== "undefined") window.dispatchEvent(new CustomEvent("nfood:forbidden", { detail: { action: error.data?.path ?? "protected.action" } }));
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    if (error instanceof TRPCClientError && error.data?.code === "FORBIDDEN" && typeof window !== "undefined") window.dispatchEvent(new CustomEvent("nfood:forbidden", { detail: { action: error.data?.path ?? "protected.action" } }));
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      headers() {
        // Preview auto-login fallback: when the browser blocks iframe cookies
        // (Safari ITP / private browsing / WebView), the runtime mirrors the
        // session into sessionStorage so we can forward it as a Bearer token.
        // The regular OAuth cookie flow keeps working and takes priority server-side.
        try {
          const raw = sessionStorage.getItem("manus-cookie");
          if (raw) {
            const prefix = `${COOKIE_NAME}=`;
            const pair = raw.split(";").find(s => s.trim().startsWith(prefix));
            const token = pair?.trim().slice(prefix.length);
            if (token) {
              return { Authorization: `Bearer ${token}` };
            }
          }
        } catch {
          // sessionStorage unavailable
        }
        return {};
      },
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

let isReloadingForServiceWorker = false;

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => { navigator.serviceWorker.register("/sw.js").then((registration) => { if (registration.waiting) registration.waiting.postMessage({ type: "SKIP_WAITING" }); registration.addEventListener("updatefound", () => { const worker = registration.installing; worker?.addEventListener("statechange", () => { if (worker.state === "installed" && navigator.serviceWorker.controller) worker.postMessage({ type: "SKIP_WAITING" }); }); }); }).catch((error) => console.warn("[PWA] Service Worker registration failed", error)); });
  navigator.serviceWorker.addEventListener("message", (event) => { if (event.data?.type === "NFOOD_SYNC_REQUEST") window.dispatchEvent(new CustomEvent("nfood:sync-request")); });
  navigator.serviceWorker.addEventListener("controllerchange", () => { if (isReloadingForServiceWorker) return; isReloadingForServiceWorker = true; window.location.reload(); });
}

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
