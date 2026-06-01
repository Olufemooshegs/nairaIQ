module.exports = {
  extends: ['stylelint-config-standard'],
  ignoreFiles: ['**/node_modules/**'],
  rules: {},
  // Allow Tailwind directives
  defaultSeverity: 'warning',
  // List of at-rules Tailwind uses
  plugins: [],
  "ignoreAtRules": ["tailwind", "apply", "variants", "responsive", "screen"]
};
