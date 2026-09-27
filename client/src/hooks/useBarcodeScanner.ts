import { useEffect, useRef } from "react";

type BarcodeScannerOptions = {
  enabled?: boolean;
  minLength?: number;
  maxGapMs?: number;
  onScan: (code: string) => void;
};

function isEditableTarget(target: EventTarget | null) {
  const element = target as HTMLElement | null;
  if (!element) return false;
  return element.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(element.tagName);
}

export function useBarcodeScanner({
  enabled = true,
  minLength = 3,
  maxGapMs = 80,
  onScan,
}: BarcodeScannerOptions) {
  const buffer = useRef("");
  const lastKeyAt = useRef(0);
  const handler = useRef(onScan);
  handler.current = onScan;

  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || isEditableTarget(event.target)) return;
      const now = performance.now();
      if (now - lastKeyAt.current > maxGapMs) buffer.current = "";
      lastKeyAt.current = now;

      if (event.key === "Enter") {
        const code = buffer.current.trim();
        buffer.current = "";
        if (code.length >= minLength) {
          event.preventDefault();
          handler.current(code);
        }
        return;
      }

      if (event.key.length === 1 && /[0-9A-Za-z._-]/.test(event.key)) {
        buffer.current += event.key;
      }
    };
    window.addEventListener("keydown", onKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", onKeyDown, { capture: true });
  }, [enabled, maxGapMs, minLength]);
}
