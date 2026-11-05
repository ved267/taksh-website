import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["components/taksh/**/*.{ts,tsx}"],
    rules: {
      // Taksh serves build-generated responsive images through its own loader.
      "@next/next/no-img-element": "off",
    },
  },
  {
    files: ["components/taksh/owner-dashboard.tsx"],
    rules: {"react-hooks/purity": "off"}, // Preserve the approved v60 clock display during hosting-only migration.
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".local/**",
    ".superpowers/**",
    ".netlify/**",
    ".deployment/**",
    ".wrangler/**",
    "dist/**",
    "out/**",
    "build/**",
    "docs/legacy-sites/**",
    "next-env.d.ts",
  ]),
  {
    files: ["components/ui/**/*.{ts,tsx}", "hooks/use-mobile.ts"],
    rules: {
      // These files are vendored verbatim from shadcn@4.17.0. Keep the
      // registry source intact while applying the stricter rules to Site code.
      "@typescript-eslint/no-unused-vars": "off",
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
