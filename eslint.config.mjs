import eslint from '@eslint/js';
import angular from 'angular-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-config-prettier/flat';
import importPlugin from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';

export default defineConfig(
  globalIgnores(['.angular/**', '.agents/**', 'coverage/**', 'dist/**', 'out-tsc/**']),
  {
    files: ['**/*.{ts,mjs}'],
    extends: [eslint.configs.recommended],
    plugins: { import: importPlugin },
    settings: {
      'import/resolver': {
        typescript: { project: './tsconfig.json' },
      },
    },
    rules: {
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling', 'index'],
            'object',
            'unknown',
          ],
          pathGroups: [
            {
              pattern: '**/*.{css,scss,sass,less,svg,png,jpg,jpeg,gif,webp,avif,ico,woff,woff2}',
              group: 'unknown',
              position: 'after',
            },
            { pattern: '@angular/**', group: 'external', position: 'before' },
            { pattern: '{rxjs,rxjs/**}', group: 'external', position: 'before' },
            { pattern: '@features/**', group: 'internal', position: 'before' },
            { pattern: '@layout/**', group: 'internal', position: 'before' },
            { pattern: '@components/**', group: 'internal', position: 'before' },
            { pattern: '@services/**', group: 'internal', position: 'before' },
            { pattern: '@icons/**', group: 'internal', position: 'before' },
            { pattern: '@translations/**', group: 'internal', position: 'before' },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          distinctGroup: true,
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
          named: {
            enabled: true,
            import: true,
            export: false,
            require: false,
            cjsExports: false,
            types: 'mixed',
          },
          // Preserve the execution order of polyfills, registrations, and global styles.
          warnOnUnassignedImports: false,
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '^(?:\\.\\./){2,}',
              message:
                'Для перехода на два уровня вверх и более используй предметный алиас из tsconfig.json, например @components или @services.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.ts'],
    extends: [tseslint.configs.recommended, angular.configs.tsRecommended],
    processor: angular.processInlineTemplates,
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'enum', format: ['PascalCase'] },
        { selector: 'enumMember', format: ['PascalCase'] },
        {
          selector: 'property',
          modifiers: ['private'],
          format: ['camelCase'],
          leadingUnderscore: 'require',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'app', style: 'kebab-case' },
      ],
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {
      '@angular-eslint/template/prefer-self-closing-tags': 'error',
    },
  },
  prettier,
);
