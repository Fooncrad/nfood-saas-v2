// Storage helpers: use local Hostinger disk when UPLOAD_STORAGE_PATH is configured,
// otherwise keep Forge storage compatibility for existing environments.
import { ENV } from "./_core/env";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

function useLocalStorage() { return Boolean(ENV.uploadStoragePath.trim()); }
function localRoot() { return path.resolve(ENV.uploadStoragePath.trim()); }
function publicBase() { return (ENV.uploadPublicUrl || "/uploads").replace(/\/+$/, ""); }

function getForgeConfig() {
  const forgeUrl = ENV.forgeApiUrl;
  const forgeKey = ENV.forgeApiKey;
  if (!forgeUrl || !forgeKey) throw new Error("Storage config missing: set UPLOAD_STORAGE_PATH for Hostinger local storage or configure Forge storage");
  return { forgeUrl: forgeUrl.replace(/\/+$/, ""), forgeKey };
}
function normalizeKey(relKey: string): string {
  const normalized = relKey.replace(/\\/g, "/").replace(/^\/+/, "").split("/").filter((part) => part && part !== "." && part !== "..").join("/");
  if (!normalized) throw new Error("Invalid storage key");
  return normalized;
}
function appendHashSuffix(relKey: string): string {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}
function localFilePath(key: string) {
  const root = localRoot();
  const file = path.resolve(root, normalizeKey(key));
  if (file !== root && !file.startsWith(root + path.sep)) throw new Error("Invalid storage path");
  return file;
}

export async function storagePut(relKey: string, data: Buffer | Uint8Array | string, contentType = "application/octet-stream"): Promise<{ key: string; url: string }> {
  const key = appendHashSuffix(normalizeKey(relKey));
  if (useLocalStorage()) {
    const filePath = localFilePath(key);
    await mkdir(path.dirname(filePath), { recursive: true });
    const body = typeof data === "string" ? Buffer.from(data) : Buffer.from(data);
    await writeFile(filePath, body);
    return { key, url: `${publicBase()}/${key}` };
  }
  const { forgeUrl, forgeKey } = getForgeConfig();
  const presignUrl = new URL("v1/storage/presign/put", forgeUrl + "/");
  presignUrl.searchParams.set("path", key);
  const presignResp = await fetch(presignUrl, { headers: { Authorization: `Bearer ${forgeKey}` } });
  if (!presignResp.ok) { const msg = await presignResp.text().catch(() => presignResp.statusText); throw new Error(`Storage presign failed (${presignResp.status}): ${msg}`); }
  const { url: s3Url } = (await presignResp.json()) as { url: string };
  if (!s3Url) throw new Error("Forge returned empty presign URL");
  const blob = typeof data === "string" ? new Blob([data], { type: contentType }) : new Blob([data as any], { type: contentType });
  const uploadResp = await fetch(s3Url, { method: "PUT", headers: { "Content-Type": contentType }, body: blob });
  if (!uploadResp.ok) throw new Error(`Storage upload to S3 failed (${uploadResp.status})`);
  return { key, url: `/manus-storage/${key}` };
}
export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  return { key, url: useLocalStorage() ? `${publicBase()}/${key}` : `/manus-storage/${key}` };
}
export async function storageGetSignedUrl(relKey: string): Promise<string> {
  const key = normalizeKey(relKey);
  if (useLocalStorage()) return `${publicBase()}/${key}`;
  const { forgeUrl, forgeKey } = getForgeConfig();
  const getUrl = new URL("v1/storage/presign/get", forgeUrl + "/");
  getUrl.searchParams.set("path", key);
  const resp = await fetch(getUrl, { headers: { Authorization: `Bearer ${forgeKey}` } });
  if (!resp.ok) { const msg = await resp.text().catch(() => resp.statusText); throw new Error(`Storage signed URL failed (${resp.status}): ${msg}`); }
  const { url } = (await resp.json()) as { url: string };
  return url;
}
export async function storageReadLocal(relKey: string): Promise<Buffer> {
  if (!useLocalStorage()) throw new Error("Local storage is not enabled");
  return readFile(localFilePath(normalizeKey(relKey)));
}
