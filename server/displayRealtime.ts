import type { Server as HttpServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

const clientsByToken = new Map<string, Set<WebSocket>>();
let socketServer: WebSocketServer | null = null;

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
    socket.send(JSON.stringify({ type: "display.connected" }));
    const cleanup = () => {
      clients.delete(socket);
      if (!clients.size) clientsByToken.delete(token);
    };
    socket.on("close", cleanup);
    socket.on("error", cleanup);
  });
  return socketServer;
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
  socketServer?.close();
  socketServer = null;
  clientsByToken.clear();
}
