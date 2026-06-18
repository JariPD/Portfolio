import { mediaThumb, type MediaItem } from "@/lib/projects";

describe("mediaThumb", () => {
  test("returns the src for an image item", () => {
    const item: MediaItem = { type: "image", src: "/shot.png" };
    expect(mediaThumb(item)).toBe("/shot.png");
  });

  test("returns the poster for a video item", () => {
    const item: MediaItem = { type: "video", src: "/clip.mp4", poster: "/poster.jpg" };
    expect(mediaThumb(item)).toBe("/poster.jpg");
  });

  test("derives the YouTube thumbnail from the video id when no poster is set", () => {
    const item: MediaItem = { type: "embed", provider: "youtube", id: "abc123" };
    expect(mediaThumb(item)).toBe("https://img.youtube.com/vi/abc123/hqdefault.jpg");
  });

  test("prefers an explicit poster over the derived YouTube thumbnail", () => {
    const item: MediaItem = { type: "embed", provider: "youtube", id: "abc123", poster: "/custom.jpg" };
    expect(mediaThumb(item)).toBe("/custom.jpg");
  });

  test("returns an empty string for a Vimeo embed without a poster", () => {
    const item: MediaItem = { type: "embed", provider: "vimeo", id: "999" };
    expect(mediaThumb(item)).toBe("");
  });
});
