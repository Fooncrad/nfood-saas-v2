import http from "node:http";
import net from "node:net";
import fs from "node:fs";
import path from "node:path";

const port = Number(process.env.PRINTER_BRIDGE_PORT || 8765);
const token = process.env.PRINTER_BRIDGE_TOKEN || "change-me";
const queueFile = process.env.PRINTER_BRIDGE_QUEUE_FILE || path.resolve(process.cwd(), "printer-bridge-queue.json");
function readQueue() { try { const value = JSON.parse(fs.readFileSync(queueFile, "utf8")); return Array.isArray(value) ? value : []; } catch { return []; } }
function writeQueue(queue) { const temp = queueFile + ".tmp"; fs.writeFileSync(temp, JSON.stringify(queue, null, 2)); fs.renameSync(temp, queueFile); }
function enqueuePrint(job, reason) { const queue = readQueue(); const id = job.id || `print-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`; if (!queue.some(item => item.id === id)) queue.push({ ...job, id, attempts: 0, queuedAt: new Date().toISOString(), lastError: reason || null }); writeQueue(queue.slice(-1000)); return { id, queuedCount: queue.length }; }
async function executePrint(body) { const adapterUrl = body.transport === "usb" ? process.env.PRINTER_USB_ADAPTER_URL : body.transport === "bluetooth" ? process.env.PRINTER_BLUETOOTH_ADAPTER_URL : null; if (adapterUrl) return adapterRequest(adapterUrl, body); if (!body.host) return { ok: false, message: "Printer host is required for network printing" }; return sendTcp(body.host, Number(body.port || 9100), String(body.payload || "")); }
async function retryQueue() { const queue = readQueue(); const remaining = []; let printed = 0; for (const job of queue) { const result = await executePrint(job); if (result.ok) printed += 1; else remaining.push({ ...job, attempts: Number(job.attempts || 0) + 1, lastAttemptAt: new Date().toISOString(), lastError: result.message || "print_failed" }); } writeQueue(remaining); return { ok: remaining.length === 0, printed, remaining: remaining.length }; }

function authorized(req) { return req.headers.authorization === `Bearer ${token}`; }
function readBody(req) { return new Promise((resolve, reject) => { let body = ""; req.on("data", chunk => body += chunk); req.on("end", () => { try { resolve(body ? JSON.parse(body) : {}); } catch (error) { reject(error); } }); req.on("error", reject); }); }
function probeTcp(host, targetPort, timeout = 1800) { return new Promise(resolve => { const started = Date.now(); const socket = net.createConnection({ host, port: targetPort }); const finish = (ok, message) => { const latencyMs = Date.now() - started; socket.destroy(); resolve({ ok, message, latencyMs }); }; socket.setTimeout(timeout); socket.once("connect", () => finish(true, "TCP port is reachable")); socket.once("timeout", () => finish(false, "Connection timed out")); socket.once("error", error => finish(false, error.message)); }); }
async function adapterRequest(url, body) { const started = Date.now(); const response = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }); const payload = await response.json(); const elapsedMs = Date.now() - started; return { ...payload, latencyMs: payload.latencyMs ?? elapsedMs, printDurationMs: body.action === "discover" || body.action === "probe" ? payload.printDurationMs : (payload.printDurationMs ?? elapsedMs) }; }
function sendTcp(host, targetPort, payload, timeout = 3000) { return new Promise(resolve => { const started = Date.now(); const socket = net.createConnection({ host, port: targetPort }); const finish = (ok, message) => { const printDurationMs = Date.now() - started; socket.destroy(); resolve({ ok, message, printDurationMs, latencyMs: printDurationMs }); }; socket.setTimeout(timeout); socket.once("connect", () => socket.end(Buffer.from(payload, "utf8"), () => finish(true, "Payload sent"))); socket.once("timeout", () => finish(false, "Connection timed out")); socket.once("error", error => finish(false, error.message)); }); }

const server = http.createServer(async (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (!authorized(req)) { res.writeHead(401); return res.end(JSON.stringify({ ok: false, error: "unauthorized" })); }
  try {
    if (req.method === "GET" && req.url === "/health") return res.end(JSON.stringify({ ok: true, service: "nfood-printer-bridge", queued: readQueue().length }));
    if (req.method === "GET" && req.url === "/queue") return res.end(JSON.stringify({ ok: true, jobs: readQueue() }));
    if (req.method === "POST" && req.url === "/queue/retry") return res.end(JSON.stringify(await retryQueue()));
    if (req.method === "POST" && req.url === "/discover") { const body = await readBody(req); const adapterUrl = body.transport === "usb" ? process.env.PRINTER_USB_ADAPTER_URL : body.transport === "bluetooth" ? process.env.PRINTER_BLUETOOTH_ADAPTER_URL : null; if (!adapterUrl) return res.end(JSON.stringify({ ok: false, devices: [], message: "لم يتم إعداد محول اكتشاف USB/Bluetooth على هذا الجهاز" })); return res.end(JSON.stringify(await adapterRequest(adapterUrl, { action: "discover", transport: body.transport }))); }
    if (req.method === "POST" && req.url === "/probe") { const body = await readBody(req); const adapterUrl = body.transport === "usb" ? process.env.PRINTER_USB_ADAPTER_URL : body.transport === "bluetooth" ? process.env.PRINTER_BLUETOOTH_ADAPTER_URL : null; const result = adapterUrl ? await adapterRequest(adapterUrl, body) : await probeTcp(body.host, Number(body.port || 9100)); return res.end(JSON.stringify(result)); }
    if (req.method === "POST" && req.url === "/print") { const body = await readBody(req); const result = await executePrint(body); if (!result.ok && body.queueOnFailure !== false) { const queued = enqueuePrint(body, result.message); return res.end(JSON.stringify({ ...result, queued: true, ...queued })); } return res.end(JSON.stringify(result)); }
    if (req.method === "POST" && req.url === "/print/batch") { const body = await readBody(req); const jobs = Array.isArray(body.jobs) ? body.jobs : []; const results = []; for (const job of jobs) { let result = await executePrint(job); let usedFallback = false; if (!result.ok && job.fallback) { result = await executePrint({ ...job, ...job.fallback }); usedFallback = result.ok; } if (!result.ok && job.queueOnFailure !== false) { const queued = enqueuePrint(job, result.message); results.push({ ...result, queued: true, usedFallback, ...queued }); } else results.push({ ...result, usedFallback }); } return res.end(JSON.stringify({ ok: results.every(item => item.ok || item.queued), results })); }
    res.writeHead(404); return res.end(JSON.stringify({ ok: false, error: "not_found" }));
  } catch (error) { res.writeHead(500); return res.end(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) })); }
});
server.listen(port, "127.0.0.1", () => console.log(`NFOOD printer bridge listening on 127.0.0.1:${port}`));
