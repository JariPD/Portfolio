import "@testing-library/jest-dom";

// `unstable_cache` requires the Next.js request context (incrementalCache via
// async-local storage), which doesn't exist outside a real request. In tests we
// make it a pass-through and turn the revalidate helpers into no-ops.
jest.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
  revalidateTag: jest.fn(),
  revalidatePath: jest.fn(),
}));
