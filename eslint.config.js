// Flat config format (ESLint 9). Written as an ES module because package.json
// declares "type": "module".
//
// NOTE: `typescript-eslint` (the TS-aware parser/plugin) currently requires
// typescript >=4.8.4 <6.1.0 as a peer dependency, but this project intentionally
// tracks the latest typescript (7.x). Until typescript-eslint publishes support
// for TypeScript 7, this config only lints plain JavaScript files with default
// rules — it does not attempt to parse src/**/*.ts (doing so fails with parser
// errors). Type-checking of .ts files is handled by `npm run build` (tsc)
// instead.
export default [
  {
    ignores: ["dist/**", "node_modules/**"],
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      // This is a browser-only static app (no Node runtime globals).
      globals: {
        window: "readonly",
        document: "readonly",
        localStorage: "readonly",
        console: "readonly",
      },
    },
    rules: {
      // Add project-specific rules here.
    },
  },
];
