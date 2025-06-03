import js from "@eslint/js";
import prettierPlugin from "eslint-plugin-prettier";

export default [
  {
    ignores: ["dist"],
  },

  js.configs.recommended,

  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      "prettier/prettier": "error",
    },
  },

  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        window: true,
        document: true,
        Audio: true,
        setTimeout: true,
      },
    },
  },
];
