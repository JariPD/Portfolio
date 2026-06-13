import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  // __tests__/seed/ bevat handmatige tets om een project aan te maken voor mij
  // (geen mocks). Die horen niet in de unit-testrun.
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/__tests__/seed/"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};

export default createJestConfig(config);
