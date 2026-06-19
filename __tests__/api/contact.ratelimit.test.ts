/** @jest-environment node */
import { NextRequest } from "next/server";

// Mocks (the `mock` prefix lets jest's hoisted factories reference them).
const mockSend = jest.fn();
jest.mock("resend", () => ({
  Resend: jest.fn().mockImplementation(() => ({ emails: { send: mockSend } })),
}));

// Stub the Upstash limiter so the route's rate-limit branch is exercised without a network
// call. `slidingWindow` is a static used at module load; the constructor yields `{ limit }`.
const mockLimit = jest.fn();
jest.mock("@upstash/ratelimit", () => ({
  Ratelimit: Object.assign(
    jest.fn().mockImplementation(() => ({ limit: mockLimit })),
    { slidingWindow: jest.fn(() => "sliding-window") }
  ),
}));
jest.mock("@upstash/redis", () => ({
  Redis: { fromEnv: jest.fn(() => ({})) },
}));

let POST: typeof import("@/app/api/contact/route").POST;

beforeAll(async () => {
  process.env.RESEND_API_KEY = "test-key";
  process.env.CONTACT_EMAIL = "owner@example.com";
  // Present → the route constructs the (mocked) limiter at import time.
  process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
  process.env.UPSTASH_REDIS_REST_TOKEN = "token";
  ({ POST } = await import("@/app/api/contact/route"));
});

afterAll(() => {
  // Don't leak the Upstash env into other suites sharing this worker — the non-rate-limit
  // contact suite relies on the limiter being absent.
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
});

const valid = {
  name: "Jane Doe",
  email: "jane@example.com",
  message: "A sufficiently long message that passes validation.",
};

function makeRequest(payload: unknown): NextRequest {
  return new NextRequest("http://localhost/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.7" },
    body: JSON.stringify(payload),
  });
}

describe("POST /api/contact — rate limiting", () => {
  beforeEach(() => {
    mockSend.mockReset();
    mockSend.mockResolvedValue({ data: { id: "msg_1" }, error: null });
    mockLimit.mockReset();
  });

  test("returns 429 and never sends when the limiter rejects the request", async () => {
    mockLimit.mockResolvedValue({ success: false });
    const res = await POST(makeRequest(valid));
    expect(res.status).toBe(429);
    expect((await res.json()).error).toMatch(/too many requests/i);
    expect(mockSend).not.toHaveBeenCalled();
  });

  test("proceeds to send when the limiter allows the request", async () => {
    mockLimit.mockResolvedValue({ success: true });
    const res = await POST(makeRequest(valid));
    expect(res.status).toBe(200);
    expect(mockLimit).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenCalledTimes(1);
  });
});
