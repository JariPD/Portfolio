/** @jest-environment node */
import { NextRequest } from "next/server";

jest.mock("@/lib/users", () => ({
  getUserByEmail: jest.fn(),
  createUser: jest.fn(),
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn(() => Promise.resolve("hashed-password")),
}));

import { getUserByEmail, createUser } from "@/lib/users";
import { POST } from "@/app/api/auth/register/route";

function makeRequest(body: Record<string, string>) {
  return new NextRequest("http://localhost/api/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("app/api/auth/register — validatie", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getUserByEmail as jest.Mock).mockResolvedValue(undefined);
    (createUser as jest.Mock).mockResolvedValue({
      id: "uuid-1",
      email: "test@test.com",
      name: "Test",
      role: "user",
      password: "hashed-password",
    });
  });

  test("Foutmelding bij ontbrekend e-mailadres", async () => {
    const res = await POST(
      makeRequest({ name: "Test", email: "", password: "secret123" })
    );
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("All fields are required.");
  });

  test("Foutmelding bij ontbrekend wachtwoord", async () => {
    const res = await POST(
      makeRequest({ name: "Test", email: "test@test.com", password: "" })
    );
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("All fields are required.");
  });

  test("Foutmelding als wachtwoord korter is dan 8 karakters", async () => {
    const res = await POST(
      makeRequest({ name: "Test", email: "test@test.com", password: "abc12" })
    );
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Password must be at least 8 characters.");
  });

  test("Foutmelding als wachtwoord geen cijfer bevat", async () => {
    const res = await POST(
      makeRequest({ name: "Test", email: "test@test.com", password: "abcdefgh" })
    );
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe(
      "Password must contain at least one letter and one number."
    );
  });

  test("Foutmelding als wachtwoord geen letter bevat", async () => {
    const res = await POST(
      makeRequest({ name: "Test", email: "test@test.com", password: "12345678" })
    );
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe(
      "Password must contain at least one letter and one number."
    );
  });

  test("Wachtwoord met letters en cijfers van minstens 8 karakters is geldig", async () => {
    const res = await POST(
      makeRequest({ name: "Test", email: "test@test.com", password: "secret123" })
    );

    expect(res.status).toBe(201);
  });
});
