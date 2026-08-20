import { describe, expect, it } from "vitest";
import { remoteTasks, remoteWorkers, taskMessages } from "../drizzle/schema";

describe("remote work schema", () => {
  it("exposes workers, paid tasks, and task messages", () => {
    expect(remoteWorkers).toBeDefined();
    expect(remoteTasks).toBeDefined();
    expect(taskMessages).toBeDefined();
  });

  it("stores task value, payment, status, and communication fields", () => {
    expect(remoteTasks.amount).toBeDefined();
    expect(remoteTasks.paymentMethod).toBeDefined();
    expect(remoteTasks.paymentStatus).toBeDefined();
    expect(remoteTasks.status).toBeDefined();
    expect(taskMessages.body).toBeDefined();
  });
});
