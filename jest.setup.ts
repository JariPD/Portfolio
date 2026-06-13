import "@testing-library/jest-dom";

// `unstable_cache` vereist de Next.js request-context (incrementalCache via
// async-local storage), die buiten een echte request niet bestaat. In tests
// maken we het een pass-through en zijn revalidate-helpers no-ops.
jest.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
  revalidateTag: jest.fn(),
  revalidatePath: jest.fn(),
}));
