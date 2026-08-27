import { useEffect, useState, type CSSProperties } from "react";

type LoaderStage = "letters" | "orbit" | "exiting";

type NfoodsLoadingScreenProps = {
  onComplete?: () => void;
};

const LETTERS = ["N", "F", "O", "O", "D", "S"];

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function NfoodsLoadingScreen({ onComplete }: NfoodsLoadingScreenProps) {
  const [stage, setStage] = useState<LoaderStage>("letters");

  useEffect(() => {
    const reduced = prefersReducedMotion();
    const lettersDuration = reduced ? 120 : 1050;
    const orbitDuration = reduced ? 120 : 900;
    const orbitTimer = window.setTimeout(() => setStage("orbit"), lettersDuration);
    const exitTimer = window.setTimeout(() => setStage("exiting"), lettersDuration + orbitDuration);
    return () => {
      window.clearTimeout(orbitTimer);
      window.clearTimeout(exitTimer);
    };
  }, []);

  useEffect(() => {
    if (stage !== "exiting") return;
    const timer = window.setTimeout(() => onComplete?.(), 240);
    return () => window.clearTimeout(timer);
  }, [onComplete, stage]);

  return (
    <div
      className={`nfood-global-loader nfood-global-loader--${stage}`}
      role="status"
      aria-live="polite"
      aria-label="جارٍ تحميل NFOODS"
    >
      <div className="nfood-loader-aura" aria-hidden="true" />
      <div className="nfood-loader-content">
        <div className="nfood-loader-word" aria-label="NFOODS">
          {LETTERS.map((letter, index) => (
            <span
              key={`${letter}-${index}`}
              className="nfood-loader-letter"
              style={{ "--nfood-letter-delay": `${index * 90}ms` } as CSSProperties}
              aria-hidden="true"
            >
              {letter}
            </span>
          ))}
        </div>
        <p className="nfood-loader-caption">تجربة الطعام تبدأ هنا</p>
      </div>
      <div className="nfood-loader-orbit" aria-hidden="true">
        <span className="nfood-loader-orbit-core" />
      </div>
    </div>
  );
}
