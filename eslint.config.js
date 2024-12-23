import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const jsFiles = ['**/*.js'];
const ignorePatterns = ['node_modules', 'eslint.config.js'];
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
});

export default [
    {
        ignores: ignorePatterns,
    },
    {
        files: jsFiles,
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
        },
        rules: {
            quotes: ['error', 'single'],
            semi: ['error', 'always'],
            indent: ['error', 4],
            'max-len': ['warn', { code: 80, ignoreComments: true }],
            'no-console': 'off',
            'object-curly-spacing': ['error', 'always'],
            // Turn off this rule as it conflicts with Prettier
            'space-before-function-paren': 'off',
            'no-multiple-empty-lines': ['error', { max: 1 }],
        },
    },
    ...compat.env({ node: true }),
    // Using FlatCompat to translate old config to new flat config
    ...compat.extends('eslint:recommended'),
    ...compat.extends('prettier'),
    // This spread is redundant since we already extend recommended
    // ...compat.extends('eslint:recommended'),
    {
        files: jsFiles,
        plugins: {
            prettier: await import('eslint-plugin-prettier').then(
                (mod) => mod.default,
            ),
        },
        rules: {
            ...(await import('eslint-config-prettier').then(
                (mod) => mod.rules,
            )),
            'prettier/prettier': [
                'error',
                {},
                {
                    usePrettierrc: true,
                },
            ],
        },
    },
];
