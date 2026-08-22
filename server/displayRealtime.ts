import type { Server as HttpServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

const clientsByToken = new Map<string, Set<WebSocket>>();
const aliveBySocket = new WeakMap<WebSocket, boolean>();
let socketServer: WebSocketServer | null = null;
let heartbeatTimer: NodeJS.Timeout | null = null;

export function attachDisplayRealtime(server: HttpServer) {
  socketServer = new WebSocketServer({ server, path: "/api/display-ws" });
  socketServer.on("connection", (socket, request) => {
    const token = new URL(request.url ?? "/", "http://localhost").searchParams.get("token")?.trim();
    if (!token || token.length < 20 || token.length > 120) {
      socket.close(1008, "invalid display token");
      return;
    }
    const clients = clientsByToken.get(token) ?? new Set<WebSocket>();
    clients.add(socket);
    clientsByToken.set(token, clients);
    aliveBySocket.set(socket, true);
    socket.send(JSON.stringify({ type: "display.connected", at: Date.now() }));
    const cleanup = () => {
      clients.delete(socket);
      if (!clients.size) clientsByToken.delete(token);
    };
    socket.on("pong", () => aliveBySocket.set(socket, true));
    socket.on("message", (raw) => {
      if (raw.toString() === "ping") socket.send(JSON.stringify({ type: "display.pong", at: Date.now() }));
    });
    socket.on("close", cleanup);
    socket.on("error", cleanup);
  });
  heartbeatTimer = setInterval(() => {
    clientsByToken.forEach((clients, token) => {
      clients.forEach((socket) => {
        if (aliveBySocket.get(socket) === false) {
          socket.terminate();
          clients.delete(socket);
          return;
        }
        aliveBySocket.set(socket, false);
        if (socket.readyState === WebSocket.OPEN) socket.ping();
      });
      if (!clients.size) clientsByToken.delete(token);
    });
  }, 20_000);
  heartbeatTimer.unref?.();
  return socketServer;
}

export function isDisplayConnected(token: string) {
  const clients = clientsByToken.get(token);
  return Boolean(clients?.size && Array.from(clients).some((socket) => socket.readyState === WebSocket.OPEN));
}

export function notifyDisplayChanged(token: string) {
  if (!socketServer || !token) return;
  const clients = clientsByToken.get(token);
  if (!clients) return;
  const message = JSON.stringify({ type: "display.updated", at: Date.now() });
  clients.forEach((socket) => {
    if (socket.readyState === WebSocket.OPEN) socket.send(message);
  });
}

export function closeDisplayRealtime() {
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  heartbeatTimer = null;
  socketServer?.close();
  socketServer = null;
  clientsByToken.clear();
}
