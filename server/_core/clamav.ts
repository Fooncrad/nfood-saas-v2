import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { spawn } from "node:child_process";

const execFileAsync = promisify(execFile);

export type ClamAvResult =
  | { status: "clean"; engine: "clamscan"; version: string | null }
  | { status: "infected"; engine: "clamscan"; version: string | null; threat: string | null }
  | { status: "unavailable"; engine: "clamscan"; version: string | null; reason: string };

let cachedVersion: string | null | undefined;

async function getVersion() {
  if (cachedVersion !== undefined) return cachedVersion;
  try {
    const result = await execFileAsync("clamscan", ["--version"], { timeout: 8_000, maxBuffer: 16_000 });
    cachedVersion = result.stdout.trim().slice(0, 160) || null;
  } catch {
    cachedVersion = null;
  }
  return cachedVersion;
}

/** يمرر البايتات عبر stdin حتى لا يُنشئ الملف المرفوع مسارًا تنفيذيًا مؤقتًا. */
export async function scanBufferWithClamAV(buffer: Buffer): Promise<ClamAvResult> {
  const version = await getVersion();
  return new Promise((resolve) => {
    const child = spawn("clamscan", ["--no-summary", "--stdout", "-"], { stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    let settled = false;
    const finish = (result: ClamAvResult) => { if (!settled) { settled = true; resolve(result); } };
    const timer = setTimeout(() => { child.kill("SIGKILL"); finish({ status: "unavailable", engine: "clamscan", version, reason: "انتهت مهلة فحص ClamAV" }); }, 45_000);
    child.stdout.on("data", (chunk: Buffer) => { stdout += chunk.toString("utf8").slice(0, 64_000); });
    child.stderr.on("data", (chunk: Buffer) => { stderr += chunk.toString("utf8").slice(0, 64_000); });
    child.on("error", (error) => { clearTimeout(timer); finish({ status: "unavailable", engine: "clamscan", version, reason: error.message.slice(0, 240) }); });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) return finish({ status: "clean", engine: "clamscan", version });
      if (code === 1) { const output = `${stdout}\n${stderr}`.trim(); const threat = output.match(/: ([^\n]+) FOUND/i)?.[1]?.trim() ?? null; return finish({ status: "infected", engine: "clamscan", version, threat }); }
      finish({ status: "unavailable", engine: "clamscan", version, reason: `ClamAV exited with code ${String(code)}` });
    });
    child.stdin.on("error", () => undefined);
    child.stdin.end(buffer);
  });
}
