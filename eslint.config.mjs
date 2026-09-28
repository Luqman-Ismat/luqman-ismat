import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
export default defineConfig([
  ...nextVitals,
  globalIgnores(["examples/**", ".test-engivault/**", ".test-demos/**", "tests/demos/**", "tests/engivault/**", ".next/**", ".next-dev/**", "out/**", "next-env.d.ts", "public/**"]),
]);
