import { afterEach, describe, expect, it } from "vitest";
import { createServer, type Server } from "http";
import { WebSocket } from "ws";
import { attachDisplayRealtime, closeDisplayRealtime, isDisplayConnected, notifyDisplayChanged } from "./displayRealtime";

let server: Server | undefined;

afterEach(async () => {
  closeDisplayRealtime();
  await new Promise<void>((resolve) => server?.close(() => resolve()) ?? resolve());
  server = undefined;
});

describe("display realtime channel", () => {
  it("broadcasts updates only through a valid display token channel", async () => {
    server = createServer();
    attachDisplayRealtime(server);
    await new Promise<void>((resolve) => server!.listen(0, resolve));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("server did not bind");
    const token = "display-60001-realtime-token-123456";
    const socket = new WebSocket(`ws://127.0.0.1:${address.port}/api/display-ws?token=${token}`);
    const messages: string[] = [];
    await new Promise<void>((resolve, reject) => {
      socket.on("message", (data) => { messages.push(data.toString()); if (messages.length === 1) { notifyDisplayChanged(token); } if (messages.length === 2) resolve(); });
      socket.on("error", reject);
    });
    expect(JSON.parse(messages[0]).type).toBe("display.connected");
    expect(JSON.parse(messages[1]).type).toBe("display.updated");
    expect(isDisplayConnected(token)).toBe(true);
    await new Promise<void>((resolve) => { socket.once("close", () => resolve()); socket.close(); });
    expect(isDisplayConnected(token)).toBe(false);
  });

  it("rejects a malformed token", async () => {
    server = createServer();
    attachDisplayRealtime(server);
    await new Promise<void>((resolve) => server!.listen(0, resolve));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("server did not bind");
    const socket = new WebSocket(`ws://127.0.0.1:${address.port}/api/display-ws?token=bad`);
    await new Promise<void>((resolve) => socket.on("close", () => resolve()));
    expect(socket.readyState).toBe(WebSocket.CLOSED);
  });
});
