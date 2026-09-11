import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const app = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");
const loader = readFileSync(new URL("../components/NfoodsLoadingScreen.tsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../index.css", import.meta.url), "utf8");

describe("NFOODS global loading screen", () => {
  it("mounts once for a session without reopening on route changes", () => {
    expect(app).toContain('const NFOODS_LOADER_SESSION_KEY = "nfood-global-loader-seen";');
    expect(app).toContain("sessionStorage.getItem(NFOODS_LOADER_SESSION_KEY)");
    expect(app).toContain("previousLocation.current === location");
    expect(app).not.toContain("setShowGlobalLoader(true)");
    expect(app).toContain("<RouteLoading />");
    expect(app).toContain("<NfoodsLoadingScreen key={loaderKey} onComplete={completeGlobalLoader} />");
  });

  it("follows NFOODS letters then one orbit before completion", () => {
    expect(loader).toContain('const LETTERS = ["N", "F", "O", "O", "D", "S"];');
    expect(loader).toContain('useState<LoaderStage>("letters")');
    expect(loader).toContain('setStage("orbit")');
    expect(loader).toContain('setStage("exiting")');
    expect(loader).toContain("onComplete?.()");
    expect(styles).toContain("nfood-global-loader--orbit .nfood-loader-orbit");
    expect(styles).toContain("rotate(360deg)");
    expect(styles).toContain("translate(-50%, 42vh)");
  });

  it("supports accessible status and reduced motion", () => {
    expect(loader).toContain('role="status"');
    expect(loader).toContain('aria-live="polite"');
    expect(loader).toContain('label: "جارٍ تحميل NFOODS"');
    expect(loader).toContain('label: "Chargement de NFOODS"');
    expect(loader).toContain('label: "Loading NFOODS"');
    expect(loader).toContain('caption: "Your food experience starts here"');
    expect(styles).toContain("@media (prefers-reduced-motion: reduce)");
  });
});
