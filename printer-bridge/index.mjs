import http from "node:http";
import net from "node:net";

const port = Number(process.env.PRINTER_BRIDGE_PORT || 8765);
const token = process.env.PRINTER_BRIDGE_TOKEN || "change-me";

function authorized(req) { return req.headers.authorization === `Bearer ${token}`; }
function readBody(req) { return new Promise((resolve, reject) => { let body = ""; req.on("data", chunk => body += chunk); req.on("end", () => { try { resolve(body ? JSON.parse(body) : {}); } catch (error) { reject(error); } }); req.on("error", reject); }); }
function probeTcp(host, targetPort, timeout = 1800) { return new Promise(resolve => { const started = Date.now(); const socket = net.createConnection({ host, port: targetPort }); const finish = (ok, message) => { const latencyMs = Date.now() - started; socket.destroy(); resolve({ ok, message, latencyMs }); }; socket.setTimeout(timeout); socket.once("connect", () => finish(true, "TCP port is reachable")); socket.once("timeout", () => finish(false, "Connection timed out")); socket.once("error", error => finish(false, error.message)); }); }
async function adapterRequest(url, body) { const started = Date.now(); const response = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }); const payload = await response.json(); const elapsedMs = Date.now() - started; return { ...payload, latencyMs: payload.latencyMs ?? elapsedMs, printDurationMs: body.action === "discover" || body.action === "probe" ? payload.printDurationMs : (payload.printDurationMs ?? elapsedMs) }; }
function sendTcp(host, targetPort, payload, timeout = 3000) { return new Promise(resolve => { const started = Date.now(); const socket = net.createConnection({ host, port: targetPort }); const finish = (ok, message) => { const printDurationMs = Date.now() - started; socket.destroy(); resolve({ ok, message, printDurationMs, latencyMs: printDurationMs }); }; socket.setTimeout(timeout); socket.once("connect", () => socket.end(Buffer.from(payload, "utf8"), () => finish(true, "Payload sent"))); socket.once("timeout", () => finish(false, "Connection timed out")); socket.once("error", error => finish(false, error.message)); }); }

const server = http.createServer(async (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (!authorized(req)) { res.writeHead(401); return res.end(JSON.stringify({ ok: false, error: "unauthorized" })); }
  try {
    if (req.method === "GET" && req.url === "/health") return res.end(JSON.stringify({ ok: true, service: "nfood-printer-bridge" }));
    if (req.method === "POST" && req.url === "/discover") { const body = await readBody(req); const adapterUrl = body.transport === "usb" ? process.env.PRINTER_USB_ADAPTER_URL : body.transport === "bluetooth" ? process.env.PRINTER_BLUETOOTH_ADAPTER_URL : null; if (!adapterUrl) return res.end(JSON.stringify({ ok: false, devices: [], message: "لم يتم إعداد محول اكتشاف USB/Bluetooth على هذا الجهاز" })); return res.end(JSON.stringify(await adapterRequest(adapterUrl, { action: "discover", transport: body.transport }))); }
    if (req.method === "POST" && req.url === "/probe") { const body = await readBody(req); const adapterUrl = body.transport === "usb" ? process.env.PRINTER_USB_ADAPTER_URL : body.transport === "bluetooth" ? process.env.PRINTER_BLUETOOTH_ADAPTER_URL : null; const result = adapterUrl ? await adapterRequest(adapterUrl, body) : await probeTcp(body.host, Number(body.port || 9100)); return res.end(JSON.stringify(result)); }
    if (req.method === "POST" && req.url === "/print") { const body = await readBody(req); const adapterUrl = body.transport === "usb" ? process.env.PRINTER_USB_ADAPTER_URL : body.transport === "bluetooth" ? process.env.PRINTER_BLUETOOTH_ADAPTER_URL : null; const result = adapterUrl ? await adapterRequest(adapterUrl, body) : await sendTcp(body.host, Number(body.port || 9100), String(body.payload || "")); return res.end(JSON.stringify(result)); }
    res.writeHead(404); return res.end(JSON.stringify({ ok: false, error: "not_found" }));
  } catch (error) { res.writeHead(500); return res.end(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) })); }
});
server.listen(port, "127.0.0.1", () => console.log(`NFOOD printer bridge listening on 127.0.0.1:${port}`));
