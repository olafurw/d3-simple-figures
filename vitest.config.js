import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, 'out/**/*', 'dist/**/*'],
    include: [...configDefaults.include, 'src/**/*.test.ts'],
  },
})
