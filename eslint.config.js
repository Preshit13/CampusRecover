import js from "@eslint/js";
import globals from "globals";

export default [
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        // Window functions used in frontend
        closeEditModal: "readonly",
        closeMatchesModal: "readonly",
        editItem: "readonly",
        deleteItem: "readonly",
        markAsRecovered: "readonly",
        markAsClaimed: "readonly",
        viewMatches: "readonly",
      },
    },
    rules: {
      ...js.configs.recommended.rules,
    },
  },
];
