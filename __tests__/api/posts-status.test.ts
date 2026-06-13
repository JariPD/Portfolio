/** @jest-environment node */
import { NextRequest } from "next/server";

jest.mock("@/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/blog", () => ({
  updatePostStatus: jest.fn(),
}));

import { PATCH } from "@/app/api/blog/posts/[id]/status/route";
import { auth } from "@/auth";
import { updatePostStatus } from "@/lib/blog";

function makeRequest(body: Record<string, string>) {
  return new NextRequest("http://localhost/api/blog/posts/1/status", {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("app/api/blog/posts/[id]/status — PATCH", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (auth as jest.Mock).mockResolvedValue({ user: { role: "admin" } });
    (updatePostStatus as jest.Mock).mockResolvedValue(true);
  });

  test("Status wordt correct bijgewerkt naar 'published'", async () => {
    const res = await PATCH(makeRequest({ status: "published" }), {
      params: Promise.resolve({ id: "1" }),
    });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(updatePostStatus).toHaveBeenCalledWith("1", "published");
  });

  test("Status wordt correct bijgewerkt naar 'rejected'", async () => {
    const res = await PATCH(makeRequest({ status: "rejected" }), {
      params: Promise.resolve({ id: "2" }),
    });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(updatePostStatus).toHaveBeenCalledWith("2", "rejected");
  });

  test("Geeft 403 terug als gebruiker geen admin is", async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { role: "user" } });

    const res = await PATCH(makeRequest({ status: "published" }), {
      params: Promise.resolve({ id: "1" }),
    });

    expect(res.status).toBe(403);
  });

  test("Geeft 400 terug bij ongeldige status", async () => {
    const res = await PATCH(makeRequest({ status: "archived" }), {
      params: Promise.resolve({ id: "1" }),
    });

    expect(res.status).toBe(400);
  });

  test("Geeft 404 terug als post niet bestaat", async () => {
    (updatePostStatus as jest.Mock).mockResolvedValue(false);

    const res = await PATCH(makeRequest({ status: "published" }), {
      params: Promise.resolve({ id: "999" }),
    });

    expect(res.status).toBe(404);
  });

  test("Status wordt correct bijgewerkt naar 'pending'", async () => {
    const res = await PATCH(makeRequest({ status: "pending" }), {
      params: Promise.resolve({ id: "1" }),
    });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(updatePostStatus).toHaveBeenCalledWith("1", "pending");
  });

  test("Geeft 403 terug als er geen sessie is", async () => {
    (auth as jest.Mock).mockResolvedValue(null);

    const res = await PATCH(makeRequest({ status: "published" }), {
      params: Promise.resolve({ id: "1" }),
    });

    expect(res.status).toBe(403);
    expect(updatePostStatus).not.toHaveBeenCalled();
  });

  test("Roept updatePostStatus niet aan bij 403", async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { role: "user" } });

    await PATCH(makeRequest({ status: "published" }), {
      params: Promise.resolve({ id: "1" }),
    });

    expect(updatePostStatus).not.toHaveBeenCalled();
  });

  test("Roept updatePostStatus niet aan bij 400", async () => {
    await PATCH(makeRequest({ status: "archived" }), {
      params: Promise.resolve({ id: "1" }),
    });

    expect(updatePostStatus).not.toHaveBeenCalled();
  });
});
