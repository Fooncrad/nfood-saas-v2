import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const SHA_PATTERN = /^[a-f0-9]{7,40}$/i;

function normalizeSha(value) {
  const candidate = value?.trim();
  return candidate && SHA_PATTERN.test(candidate) ? candidate.toLowerCase() : null;
}

function resolveCommitSha() {
  for (const value of [
    process.env.GITHUB_SHA,
    process.env.COMMIT_SHA,
    process.env.SOURCE_COMMIT,
    process.env.VERCEL_GIT_COMMIT_SHA,
  ]) {
    const sha = normalizeSha(value);
    if (sha) return sha;
  }

  try {
    return normalizeSha(execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }));
  } catch {
    return null;
  }
}

const commitSha = resolveCommitSha();
const outputDir = path.resolve("client/public/__manus__");
const payload = {
  version: commitSha?.slice(0, 8) ?? "unknown",
  commitSha,
  builtAt: new Date().toISOString(),
};

await mkdir(outputDir, { recursive: true });
await writeFile(path.join(outputDir, "version.json"), `${JSON.stringify(payload, null, 2)}\n`, "utf8");
console.info(`[Build] Version manifest: ${payload.version}`);
