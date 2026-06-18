/** @jest-environment node */
import { NextRequest } from "next/server";

// Stable mock for resend's send(). The `mock` prefix lets the jest.mock factory
// reference it (jest hoists the mock above imports).
const mockSend = jest.fn();
jest.mock("resend", () => ({
  Resend: jest.fn().mockImplementation(() => ({ emails: { send: mockSend } })),
}));

let POST: typeof import("@/app/api/contact/route").POST;

beforeAll(async () => {
  // Import lazily so the resend mock above is registered before the route loads it.
  ({ POST } = await import("@/app/api/contact/route"));
});

// Unique IP per request so a per-IP rate limiter (if present) never trips across tests.
function makeRequest(payload: unknown, ip: string): NextRequest {
  return new NextRequest("http://localhost/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(payload),
  });
}

const valid = {
  name: "Jane Doe",
  email: "jane@example.com",
  message: "A sufficiently long message that passes validation.",
};

describe("POST /api/contact", () => {
  beforeEach(() => {
    process.env.RESEND_API_KEY = "test-key";
    process.env.CONTACT_EMAIL = "owner@example.com";
    mockSend.mockReset();
    mockSend.mockResolvedValue({ data: { id: "msg_1" }, error: null });
  });

  test("rejects missing fields with a 400 and never sends", async () => {
    const res = await POST(makeRequest({}, "10.0.0.1"));
    expect(res.status).toBe(400);
    expect(mockSend).not.toHaveBeenCalled();
  });

  test("rejects an invalid email with a 400 and never sends", async () => {
    const res = await POST(makeRequest({ ...valid, email: "not-an-email" }, "10.0.0.2"));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/invalid email/i);
    expect(mockSend).not.toHaveBeenCalled();
  });

  test("silently drops honeypot submissions with a fake success", async () => {
    const res = await POST(makeRequest({ ...valid, website: "i-am-a-bot" }, "10.0.0.3"));
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
    expect(mockSend).not.toHaveBeenCalled();
  });

  test("sends the email on valid input and returns success", async () => {
    const res = await POST(makeRequest(valid, "10.0.0.4"));
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
    expect(mockSend).toHaveBeenCalledTimes(1);
    const arg = mockSend.mock.calls[0][0];
    expect(arg.replyTo).toBe("jane@example.com");
    expect(arg.to).toContain("owner@example.com");
  });

  test("HTML-escapes user input in the email body", async () => {
    const res = await POST(
      makeRequest({ ...valid, name: "Eve<script>", message: "Hello <b>there</b> friend!" }, "10.0.0.5")
    );
    expect(res.status).toBe(200);
    const arg = mockSend.mock.calls[0][0];
    expect(arg.subject).toContain("Eve&lt;script&gt;");
    expect(arg.html).toContain("&lt;b&gt;");
    expect(arg.html).not.toContain("<script>");
  });

  test("returns a 500 when the email provider errors", async () => {
    mockSend.mockResolvedValue({ data: null, error: { message: "provider down" } });
    const res = await POST(makeRequest(valid, "10.0.0.6"));
    expect(res.status).toBe(500);
  });
});
