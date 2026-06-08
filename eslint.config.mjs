import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import prettier from "eslint-config-prettier";
import globals from "globals";

export default tseslint.config(
  {
    ignores: ["dist/", "lib/", "docs/", "typings/", "node_modules/"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  react.configs.flat.recommended,
  jsxA11y.flatConfigs.strict,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        sourceType: "module",
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      // Enable the two classic react-hooks rules explicitly rather than
      // spreading `reactHooks.configs.recommended.rules`. eslint-plugin-react-hooks
      // v7's recommended preset also turns on newer React Compiler rules
      // (set-state-in-effect, refs, etc.).
      // TODO: Adopt these new rules.
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react/jsx-filename-extension": [
        1,
        { extensions: [".js", ".jsx", ".ts", ".tsx"] },
      ],
      "react/jsx-props-no-spreading": 0,
      "@typescript-eslint/no-explicit-any": 0,
      "no-useless-escape": 0,
      "@typescript-eslint/explicit-function-return-type": 0,
      "react/prop-types": 0,
      "react/no-string-refs": 0,
      "jsx-a11y/label-has-associated-control": 0,
      "react/no-find-dom-node": 0,
      "react/no-unescaped-entities": 0,
      "@typescript-eslint/no-inferrable-types": 0,
      // The following three rules are newly enabled by typescript-eslint v8's
      // `recommended` preset but were not active under the previous v5 config.
      // They conflict with idioms throughout this codebase, so we
      // keep them off to preserve prior linting behavior:
      //   - short-circuit side effects, e.g. `cond && doThing()`, and chai
      //     assertions like `expect(x).to.be.true` (no-unused-expressions)
      //   - empty props/state types, e.g. `React.Component<{}, {}>`
      //     (no-empty-object-type)
      //   - `import x = require("x")` and CommonJS webpack configs
      //     (no-require-imports)
      // TODO: Evaluate these rules to see if we want to apply them.
      "@typescript-eslint/no-unused-expressions": 0,
      "@typescript-eslint/no-empty-object-type": 0,
      "@typescript-eslint/no-require-imports": 0,
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  // Disable ESLint formatting rules that conflict with Prettier.
  // This should be nearly the last option so it overrides previous rules.
  prettier,
  {
    // ESLint merges `linterOptions` with last-writer-wins
    // semantics, so placing it after every preset spread keeps a future plugin
    // config from silently re-enabling it. Flat config reports unused
    // eslint-disable directives by default; the previous .eslintrc setup did
    // not. Keep it off to preserve prior behavior and avoid the pre-commit hook
    // auto-stripping existing directives. Cleaning up stale directives can be
    // done as a separate, focused change.
    linterOptions: {
      reportUnusedDisableDirectives: "off",
    },
  }
);
