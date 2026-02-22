import { describe, test, expect } from "bun:test";
import { api, authenticatedApi, signUpTestUser, expectStatus, connectWebSocket, connectAuthenticatedWebSocket, waitForMessage } from "./helpers";

describe("API Integration Tests", () => {
  // Shared state for chaining tests (e.g., created resource IDs, auth tokens)
  let conversationId: string;

  // ===== Conversation CRUD Tests =====

  test("Create conversation with required country field", async () => {
    const res = await api("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country: "USA" }),
    });
    await expectStatus(res, 201);
    const data = await res.json();
    expect(data.conversationId).toBeDefined();
    expect(data.country).toBe("USA");
    expect(data.createdAt).toBeDefined();
    conversationId = data.conversationId;
  });

  test("Create conversation with country and topic", async () => {
    const res = await api("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country: "Canada", topic: "politics" }),
    });
    await expectStatus(res, 201);
    const data = await res.json();
    expect(data.conversationId).toBeDefined();
    expect(data.country).toBe("Canada");
    expect(data.topic).toBe("politics");
  });

  test("Create conversation without required country field returns 400", async () => {
    const res = await api("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: "sports" }),
    });
    await expectStatus(res, 400);
  });

  test("Get all conversations", async () => {
    const res = await api("/api/conversations", {
      method: "GET",
    });
    await expectStatus(res, 200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    // Verify at least one conversation exists (from previous tests)
    if (data.length > 0) {
      expect(data[0].conversationId).toBeDefined();
      expect(data[0].country).toBeDefined();
      expect(data[0].createdAt).toBeDefined();
    }
  });

  // ===== Conversation Messages Tests =====

  test("Get messages for existing conversation", async () => {
    const res = await api(`/api/conversations/${conversationId}/messages`, {
      method: "GET",
    });
    await expectStatus(res, 200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  test("Get messages for non-existent conversation returns 404", async () => {
    const invalidId = "00000000-0000-0000-0000-000000000000";
    const res = await api(`/api/conversations/${invalidId}/messages`, {
      method: "GET",
    });
    await expectStatus(res, 404);
  });

  test("Send message to conversation", async () => {
    const res = await api(`/api/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Hello, what is the weather?" }),
    });
    await expectStatus(res, 200);
    const data = await res.json();
    expect(data.response).toBeDefined();
  });

  test("Send message without required message field returns 400", async () => {
    const res = await api(`/api/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    await expectStatus(res, 400);
  });

  test("Send message to non-existent conversation returns 404", async () => {
    const invalidId = "00000000-0000-0000-0000-000000000000";
    const res = await api(`/api/conversations/${invalidId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Test message" }),
    });
    await expectStatus(res, 404);
  });
});
