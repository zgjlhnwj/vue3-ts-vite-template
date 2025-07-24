/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier'
  ],
  rules: {
    'vue/multi-word-component-names': 'off',
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto'
      }
    ]
  },
  parserOptions: {
    ecmaVersion: 'latest'
  },
  overrides: [
    {
      files: ['*.scss'],
      extends: [
        'plugin:stylelint/recommended'
      ],
      rules: {
        // SCSS 特定规则
      }
    }
  ]
}  