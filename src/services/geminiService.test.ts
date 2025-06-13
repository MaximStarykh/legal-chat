import { describe, expect, it } from "vitest";
import { sendMessage } from "./geminiService";

// Mock fetch
global.fetch = async () => {
  return {
    ok: true,
    text: async () => JSON.stringify({ text: "ok", sources: [] }),
  } as any;
};

describe("sendMessage", () => {
  it("throws when message is empty", async () => {
    await expect(sendMessage([], "")).rejects.toThrow(
      "Message cannot be empty",
    );
  });
});
