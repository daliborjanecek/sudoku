import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'SudokuGame',
      fileName: 'sudoku',
      formats: ['es', 'iife'],
    },
    rollupOptions: {
      // No external dependencies — everything is bundled into a single file.
      external: [],
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
