import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'

export default defineConfig(({ mode }) => ({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
    env: loadEnv('test', process.cwd(), ''),
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['src/test/**', 'src/types/**', 'src/server.ts', 'prisma/**'],
      thresholds: { lines: 80, functions: 80, branches: 70, statements: 80 },
    },
    pool: 'forks',
    poolOptions: { forks: { singleFork: true } },
  },
}))
