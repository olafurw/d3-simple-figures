module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/strict-type-checked',
        'plugin:@typescript-eslint/stylistic-type-checked',
        'prettier'
    ],
    plugins: ['@typescript-eslint'],
    ignorePatterns: ['*.d.ts', '*.cjs', '/dist/'],
    parserOptions: {
        sourceType: 'module',
        ecmaVersion: 2020,
        parser: '@typescript-eslint/parser',
        project: ['./tsconfig.json']
    },
    env: {
        browser: true
    },
    rules: {
        // oli, temp
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-explicit-any': 'off'
    }
};
