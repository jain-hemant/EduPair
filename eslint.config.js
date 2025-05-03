// JavaScript ESLint rules
import js from '@eslint/js';
// ESLint plugin for managing module imports and preventing issues
import eslintPluginImport from 'eslint-plugin-import';
// ESLint plugin for Node.js specific rules
import nPlugin from 'eslint-plugin-n';
// Prettier ESLint plugin for formatting code
import prettier from 'eslint-plugin-prettier';
// ESLint plugin for React-specific linting rules
import react from 'eslint-plugin-react';
// ESLint plugin for React Hooks best practices
import reactHooks from 'eslint-plugin-react-hooks';
// ESLint plugin for React Refresh (useful for fast refresh in development)
import reactRefresh from 'eslint-plugin-react-refresh';
// ESLint plugin that enforces various best practices and modern JavaScript patterns
import unicornPlugin from 'eslint-plugin-unicorn';
// Set of predefined global variables for different environments (e.g., browser, Node.js)
import globals from 'globals';

export default [
  /*
   * Global ignores: Specifies files or directories that ESLint should ignore.
   */
  { ignores: ['frontend/{build, public}/**'] },
  {
    /*
      Defining custom ESLint plugins to extend linting capabilities.
      - `n`: Provides linting rules for Node.js.
      - `unicorn`: Offers various modern JavaScript best practices.
      - `import`: Helps in organizing and validating import statements.
    */
    plugins: {
      n: nPlugin,
      unicorn: unicornPlugin,
      import: eslintPluginImport,
      prettier,
    },
  },
  {
    /*
      Applying ESLint rules to JavaScript and JSX files only.
      This ensures that ESLint does not apply these rules to non-JS files like CSS, HTML, etc.
    */
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      /*
        Setting ECMAScript version to 2020 to support modern JavaScript syntax.
        - `ecmaVersion: 'latest'` ensures that the latest available syntax is supported.
      */
      ecmaVersion: 2020,
      /*
        Defining global variables available in the environment.
        - Includes browser globals (like `window`, `document`).
        - Includes `process` as a read-only variable (useful for Node.js).
      */
      globals: { ...globals.browser, ...{ process: 'readonly' } },
      parserOptions: {
        /*
          Specifies that the latest ECMAScript features should be used.
          Enables JSX support for React.
        */
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        // Treats files as ES modules.
        sourceType: 'module',
      },
    },
    settings: { react: { version: '19.0' } },
    /*
      Defining additional ESLint plugins:
      - `react`: Adds React-specific linting rules.
      - `react-hooks`: Enforces best practices for React hooks.
      - `react-refresh`: Helps with Fast Refresh in React development.
      - `import`: Ensures proper handling of ES module imports.
    */
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      import: eslintPluginImport,
      prettier,
    },
    /*
      Defining ESLint rules for code quality and style.
      - Extends recommended rules from ESLint, React, and React Hooks.
    */
    rules: {
      // Uses recommended ESLint rules
      ...js.configs.recommended.rules,
      // Uses recommended React rules
      ...react.configs.recommended.rules,
      // Uses JSX-specific rules
      ...react.configs['jsx-runtime'].rules,
      // Uses recommended rules for hooks
      ...reactHooks.configs.recommended.rules,
      /*
        Disables the rule that prevents using `target="_blank"` without `rel="noopener noreferrer"`.
        - This is useful if we don't want ESLint to force security best practices for opening new tabs.
      */
      'react/jsx-no-target-blank': 'off',
      /*
        Warns if a React component exports non-component functions.
        - `allowConstantExport: true` allows exporting constants.
      */
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'no-console': 'error',
      'no-await-in-loop': 'error',
      quotes: ['error', 'single'],
      /*
        Enforces a consistent order of import statements:
        - Built-in modules first (`fs`, `path`).
        - External dependencies next (`react`, `axios`).
        - Internal project imports (`@/components`).
        - Parent directories (`../utils`).
        - Sibling files (`./styles`).
        - Enforces new lines between groups and sorts them alphabetically.
      */
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      /*
        Ensures that named imports are always sorted alphabetically.
      */
      'sort-imports': [
        'error',
        {
          ignoreCase: true,
          ignoreDeclarationSort: true,
          ignoreMemberSort: false,
        },
      ],
      /*
        Enforces the use of PropTypes in React components to ensure type safety.
        - Useful for React projects that don’t use TypeScript.
      */
      'react/prop-types': 'error',
      /*
       * Adds Prettier rules as ESLint errors to ensure code consistency.
       */
      'prettier/prettier': 'error',
    },
  },
];
